using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;
using ManitasCreativas.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

public class PagoService : IPagoService
{
    private readonly IPagoRepository _pagoRepository;
    private readonly S3Service _s3Service;
    private readonly IAlumnoRepository _alumnoRepository;
    private readonly IRubroRepository _rubroRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPagoImagenRepository _pagoImagenRepository;
    private readonly IAlumnoContactoRepository _alumnoContactoRepository;

    public PagoService(
        IPagoRepository pagoRepository, 
        S3Service s3Service, 
        IAlumnoRepository alumnoRepository, 
        IRubroRepository rubroRepository, 
        IUsuarioRepository usuarioRepository, 
        IPagoImagenRepository pagoImagenRepository,
        IAlumnoContactoRepository alumnoContactoRepository)
    {
        _pagoRepository = pagoRepository;
        _s3Service = s3Service;
        _alumnoRepository = alumnoRepository;
        _rubroRepository = rubroRepository;
        _usuarioRepository = usuarioRepository;
        _pagoImagenRepository = pagoImagenRepository;
        _alumnoContactoRepository = alumnoContactoRepository;
    }

    public async Task<IEnumerable<PagoReadDto>> GetPagosByCriteriaAsync(int cicloEscolar, int rubroId, int gradoId, int month)
    {
        var pagos = await _pagoRepository.GetAllAsync();

        return pagos
            .Where(p => p.CicloEscolar == cicloEscolar &&
                        p.RubroId == rubroId &&
                        p.Alumno.GradoId == gradoId &&
                        p.Fecha.Month == month)
            .Select(p => new PagoReadDto
            {
                Id = p.Id,
                Monto = p.Monto,
                Fecha = p.Fecha,
                CicloEscolar = p.CicloEscolar,                MedioPago = p.MedioPago, // Fix: MedioPago is already of type MedioPago
                RubroDescripcion = p.Rubro.Descripcion,
                ImagenesPago = p.ImagenesPago.Where(pi => pi.EsImagenEliminada != true).Select(pi => new PagoImagenDto
                {
                    Id = pi.Id,
                    PagoId = pi.PagoId,
                    Url = pi.ImagenUrl.ToString() // Fix: Convert Uri to string
                }).ToList()
            });
    }

    public async Task<PagoReadDto> GetPagoByIdAsync(int id)
    {
        var pago = await _pagoRepository.GetByIdAsync(id);

        if (pago == null)
        {
            throw new Exception($"Pago with ID {id} not found.");
        }

        var rubro = await _rubroRepository.GetByIdAsync(pago.RubroId);

        return new PagoReadDto
        {
            Id = pago.Id,
            Monto = pago.Monto,
            Fecha = pago.Fecha,            CicloEscolar = pago.CicloEscolar,
            MedioPago = pago.MedioPago,
            RubroId = pago.RubroId,
            RubroDescripcion = rubro?.Descripcion ?? string.Empty,
            EsColegiatura = pago.EsColegiatura,
            MesColegiatura = pago.MesColegiatura,
            AnioColegiatura = pago.AnioColegiatura,
            DiaLimitePagoAmarillo = rubro?.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubro?.DiaLimitePagoRojo,
            MesLimitePago = rubro?.MesLimitePago,
            FechaLimitePagoAmarillo = rubro?.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = rubro?.FechaLimitePagoRojo,
            EsPagoDeCarnet = pago.EsPagoDeCarnet,
            EstadoCarnet = pago.EstadoCarnet ?? string.Empty,
            EsPagoDeTransporte = pago.EsPagoDeTransporte,
            UsuarioCreacionId = pago.UsuarioCreacionId,
            UsuarioActualizacionId = pago.UsuarioActualizacionId,
            FechaCreacion = pago.FechaCreacion,
            FechaActualizacion = pago.FechaActualizacion,
            EsAnulado = pago.EsAnulado,
            MotivoAnulacion = pago.MotivoAnulacion,
            FechaAnulacion = pago.FechaAnulacion,
            UsuarioAnulacionId = pago.UsuarioAnulacionId,            ImagenesPago = pago.ImagenesPago?.Where(pi => pi.EsImagenEliminada != true).Select(pi => new PagoImagenDto
            {
                Id = pi.Id,
                PagoId = pi.PagoId,
                Url = pi.ImagenUrl.ToString(),
                UsuarioCreacionId = pi.UsuarioCreacionId,
                UsuarioActualizacionId = pi.UsuarioActualizacionId
            }).ToList() ?? new List<PagoImagenDto>()
        };
    }

    public async Task<PagoReadDto> AddPagoAsync(PagoUploadDto pagoDto)
    {
        // Verify that UsuarioCreacionId is provided
        if (pagoDto.UsuarioCreacionId <= 0)
        {
            throw new Exception("UsuarioCreacionId is required and must be a valid user ID.");
        }

        // Get alumno and rubro to ensure they exist
        var alumno = await _alumnoRepository.GetByIdAsync(pagoDto.AlumnoId);
        if (alumno == null)
        {
            throw new Exception($"Alumno with ID {pagoDto.AlumnoId} not found.");
        }

        var rubro = await _rubroRepository.GetByIdAsync(pagoDto.RubroId);
        if (rubro == null)
        {
            throw new Exception($"Rubro with ID {pagoDto.RubroId} not found.");
        }

        // Get the user who is creating the payment
        var usuario = await _usuarioRepository.GetByIdAsync(pagoDto.UsuarioCreacionId);
        if (usuario == null)
        {
            throw new Exception($"Usuario with ID {pagoDto.UsuarioCreacionId} not found.");
        }

        // Create new pago entity
        var pago = new Pago
        {
            AlumnoId = pagoDto.AlumnoId,
            RubroId = pagoDto.RubroId,
            CicloEscolar = pagoDto.CicloEscolar,
            Fecha = pagoDto.Fecha,
            Monto = pagoDto.Monto,
            MedioPago = (MedioPago)pagoDto.MedioPago,
            Notas = pagoDto.Notas,
            EsColegiatura = pagoDto.EsColegiatura,
            MesColegiatura = pagoDto.MesColegiatura,
            AnioColegiatura = pagoDto.AnioColegiatura,
            EsPagoDeCarnet = pagoDto.EsPagoDeCarnet,
            EstadoCarnet = pagoDto.EstadoCarnet,
            EsPagoDeTransporte = pagoDto.EsPagoDeTransporte,
            UsuarioCreacion = usuario,

            // Audit fields
            FechaCreacion = DateTime.UtcNow,
            UsuarioCreacionId = pagoDto.UsuarioCreacionId,

            EsAnulado = pagoDto.EsAnulado,
            MotivoAnulacion = pagoDto.MotivoAnulacion,
            FechaAnulacion = pagoDto.FechaAnulacion,
            UsuarioAnulacionId = pagoDto.UsuarioAnulacionId
        };        await _pagoRepository.AddAsync(pago);

        // Handle images - both uploaded files and existing URLs
        var pagoImagenes = new List<PagoImagen>();        // Handle uploaded files
        if (pagoDto.ImagenesPago != null && pagoDto.ImagenesPago.Any())
        {
            foreach (var file in pagoDto.ImagenesPago)
            {
                // Upload to S3 and get the URL
                var fileName = $"payment-{pago.Id}-{Guid.NewGuid()}-{file.FileName}";
                var imageUrl = await _s3Service.UploadFileAsync(file.OpenReadStream(), fileName, file.ContentType);
                
                var pagoImagen = new PagoImagen
                {
                    PagoId = pago.Id,
                    ImagenUrl = new Uri(imageUrl),
                    FechaCreacion = DateTime.UtcNow,
                    UsuarioCreacionId = pagoDto.UsuarioCreacionId
                };
                pagoImagenes.Add(pagoImagen);
            }
        }

        // Handle existing image URLs (for updates/edits)
        if (pagoDto.ImageUrls != null && pagoDto.ImageUrls.Any())
        {
            foreach (var imageUrl in pagoDto.ImageUrls)
            {
                var pagoImagen = new PagoImagen
                {
                    PagoId = pago.Id,
                    ImagenUrl = new Uri(imageUrl),
                    FechaCreacion = DateTime.UtcNow,
                    UsuarioCreacionId = pagoDto.UsuarioCreacionId
                };
                pagoImagenes.Add(pagoImagen);
            }
        }

        // Save all images if any
        if (pagoImagenes.Any())
        {
            await _pagoImagenRepository.AddRangeAsync(pagoImagenes);
        }

        // Return the created pago as a DTO
        return await GetPagoByIdAsync(pago.Id);
    }    
    
    public async Task<PagoReadDto> UpdatePagoAsync(int id, PagoUploadDto pagoDto)
    {
        // Verify that UsuarioActualizacionId is provided
        if (pagoDto.UsuarioActualizacionId == null || pagoDto.UsuarioActualizacionId <= 0)
        {
            throw new Exception("UsuarioActualizacionId is required and must be a valid user ID.");
        }

        // Get the existing pago
        var existingPago = await _pagoRepository.GetByIdAsync(id);
        if (existingPago == null)
        {
            throw new Exception($"Pago with ID {id} not found.");
        }

        // Get the user who is updating the payment
        var usuario = await _usuarioRepository.GetByIdAsync(pagoDto.UsuarioActualizacionId.Value);
        if (usuario == null)
        {
            throw new Exception($"Usuario with ID {pagoDto.UsuarioActualizacionId} not found.");
        }

        // Update properties
        existingPago.AlumnoId = pagoDto.AlumnoId;
        existingPago.RubroId = pagoDto.RubroId;
        existingPago.CicloEscolar = pagoDto.CicloEscolar;
        existingPago.Fecha = pagoDto.Fecha;
        existingPago.Monto = pagoDto.Monto;
        existingPago.MedioPago = (MedioPago)pagoDto.MedioPago;
        existingPago.Notas = pagoDto.Notas;
        existingPago.EsColegiatura = pagoDto.EsColegiatura;
        existingPago.MesColegiatura = pagoDto.MesColegiatura;
        existingPago.AnioColegiatura = pagoDto.AnioColegiatura;
        existingPago.EsPagoDeCarnet = pagoDto.EsPagoDeCarnet;
        existingPago.EstadoCarnet = pagoDto.EstadoCarnet;
        existingPago.EsPagoDeTransporte = pagoDto.EsPagoDeTransporte;
        // Update audit fields
        existingPago.FechaActualizacion = DateTime.UtcNow;
        existingPago.UsuarioActualizacionId = pagoDto.UsuarioActualizacionId;
        existingPago.EsAnulado = pagoDto.EsAnulado;
        existingPago.MotivoAnulacion = pagoDto.MotivoAnulacion;
        existingPago.FechaAnulacion = pagoDto.FechaAnulacion;
        existingPago.UsuarioAnulacionId = pagoDto.UsuarioAnulacionId;        await _pagoRepository.UpdateAsync(existingPago);

        // Handle image updates - both uploaded files and existing URLs
        var existingImages = await _pagoImagenRepository.GetByPagoIdAsync(id);
        var pagoImagenes = new List<PagoImagen>();

        // Handle uploaded files
        if (pagoDto.ImagenesPago != null && pagoDto.ImagenesPago.Any())
        {
            foreach (var file in pagoDto.ImagenesPago)
            {
                // Upload to S3 and get the URL
                var fileName = $"payment-{existingPago.Id}-{Guid.NewGuid()}-{file.FileName}";
                var imageUrl = await _s3Service.UploadFileAsync(file.OpenReadStream(), fileName, file.ContentType);
                
                var pagoImagen = new PagoImagen
                {
                    PagoId = existingPago.Id,
                    ImagenUrl = new Uri(imageUrl),
                    FechaCreacion = DateTime.UtcNow,
                    UsuarioCreacionId = pagoDto.UsuarioActualizacionId.Value
                };
                pagoImagenes.Add(pagoImagen);
            }
        }

        // NOTE: pagoDto.ImageUrls contains existing image URLs that should be preserved
        // We don't need to recreate database records for existing images - they already exist!
        // Only new uploaded files (pagoDto.ImagenesPago) should create new database records

        // FIXED: Don't delete existing images when updating - only add new uploads
        // The original code was deleting all existing images and recreating them with new IDs
        // Now we only add truly new uploaded files while preserving existing ones
        // if (pagoImagenes.Any() && existingImages.Any())
        // {
        //     await _pagoImagenRepository.DeleteRangeAsync(existingImages);
        // }

        // Add new images if any
        if (pagoImagenes.Any())
        {
            await _pagoImagenRepository.AddRangeAsync(pagoImagenes);
        }

        // Return the updated pago as a DTO
        return await GetPagoByIdAsync(existingPago.Id);
    }    
    
    public async Task<PagoReportResponseDto> GetPagoReportAsync(PagoReportFilterDto filter)
    {
        // Create response DTO
        var response = new PagoReportResponseDto();
        
        // Get the selected grade to determine the nivel educativo
        var selectedGrado = await _alumnoRepository.GetGradoByIdAsync(filter.GradoId);
        if (selectedGrado == null)
        {
            throw new ArgumentException($"Grade with ID {filter.GradoId} not found");
        }
          // 1. Get active rubros filtered by nivel educativo
        var allActiveRubros = (await _rubroRepository.GetAllActiveAsync())
            .Where(r => 
                // Include rubros that are specific to this grade
                r.GradoId == filter.GradoId ||
                // Include rubros that are specific to this nivel educativo
                r.NivelEducativoId == selectedGrado.NivelEducativoId ||
                // Include wildcard rubros (NivelEducativoId = 999 means applies to all NivelEducativo records)
                r.NivelEducativoId == 999 ||
                // Include rubros that are not specific to any grade or nivel
                (r.NivelEducativoId == null && r.GradoId == null)
            )
            .ToList();
        
        // Try to get rubros with OrdenVisualizacionGrid values
        var rubros = allActiveRubros
            .Where(r => r.OrdenVisualizacionGrid.HasValue)
            .OrderBy(r => r.OrdenVisualizacionGrid)
            .ToList();
            
        // If no rubros have OrdenVisualizacionGrid values, use all active rubros with a default order
        if (!rubros.Any())
        {
            rubros = allActiveRubros
                .OrderBy(r => r.EsColegiatura ? 0 : 1) // Prioritize colegiatura rubros
                .ThenBy(r => r.Descripcion) // Then order by name
                .ToList();
        }
        
        // 2. Map Rubros to RubroReportDto for response
        int rubroOrder = 1;
        response.Rubros = rubros.Select(r => new RubroReportDto
        {
            Id = r.Id,
            Descripcion = r.Descripcion,
            OrdenVisualizacionGrid = r.OrdenVisualizacionGrid ?? rubroOrder++, // Assign sequential order for those without a value
            EsColegiatura = r.EsColegiatura
        }).OrderBy(r => r.OrdenVisualizacionGrid).ToList(); // Make sure they are ordered by the grid order
        
        // 3. Get all Alumnos for the selected GradoId
        var alumnos = (await _alumnoRepository.GetAllAsync())
            .Where(a => a.GradoId == filter.GradoId && a.Estado == EstadoAlumno.Activo)
            .OrderBy(a => a.PrimerApellido)
            .ThenBy(a => a.SegundoApellido)
            .ThenBy(a => a.PrimerNombre)
            .ThenBy(a => a.SegundoNombre)
            .ToList();
        
        // 4. Get all Pagos for these students in the selected CicloEscolar for the filtered Rubros
        var rubroIds = rubros.Select(r => r.Id).ToList();
        var alumnoIds = alumnos.Select(a => a.Id).ToList();
        
        var pagos = (await _pagoRepository.GetAllAsync())
            .Where(p => p.CicloEscolar == filter.CicloEscolar && 
                   alumnoIds.Contains(p.AlumnoId) && 
                   rubroIds.Contains(p.RubroId))
            .ToList();
        
        // 5. Create PagoReportDto for each alumno with their ordered pagos
        int ordinal = 1;
        foreach (var alumno in alumnos)
        {
            // Format the full name as requested: "Primer Apellido Segundo Apellido, Primer Nombre Segundo Nombre"
            string nombreCompleto = string.Format("{0} {1}, {2} {3}",
                alumno.PrimerApellido,
                alumno.SegundoApellido ?? string.Empty,
                alumno.PrimerNombre,
                alumno.SegundoNombre ?? string.Empty).Trim();
            
            // Get all contactos for this alumno to extract NITs
            var contactos = await _alumnoContactoRepository.GetByAlumnoIdAsync(alumno.Id);
            string nit = string.Join(", ", contactos
                .Where(c => !string.IsNullOrEmpty(c.Contacto.Nit))
                .Select(c => c.Contacto.Nit));
            
            // Get all pagos for this alumno
            var alumnoPagos = pagos.Where(p => p.AlumnoId == alumno.Id).ToList();
            
            // Structure the pagos by rubro and month (for colegiatura)
            var pagosPorRubro = new Dictionary<int, Dictionary<int, PagoReportItemDto>>();
            
            foreach (var rubro in rubros)
            {
                var rubroPagos = alumnoPagos.Where(p => p.RubroId == rubro.Id).ToList();
                
                // For each rubro, create a dictionary for month-based payments (or just use 0 as key for non-colegiatura)
                var pagosPorMes = new Dictionary<int, PagoReportItemDto>();
                  if (rubro.EsColegiatura)
                {
                    // For colegiatura rubros, organize by month
                    foreach (var pago in rubroPagos)
                    {
                        if (!pagosPorMes.ContainsKey(pago.MesColegiatura))
                        {
                            pagosPorMes[pago.MesColegiatura] = new PagoReportItemDto
                            {
                                Id = pago.Id,
                                Monto = pago.Monto,
                                Estado = string.Empty,  // You can set this based on payment status if needed
                                MesColegiatura = pago.MesColegiatura,
                                Notas = pago.Notas ?? string.Empty,
                                EsPagoDeCarnet = pago.EsPagoDeCarnet,
                                EstadoCarnet = pago.EstadoCarnet ?? string.Empty
                            };
                        }
                    }                }
                else
                {
                    // For non-colegiatura rubros, just use the first/most recent payment
                    var pago = rubroPagos.OrderByDescending(p => p.Fecha).FirstOrDefault();
                    if (pago != null)
                    {
                        pagosPorMes[0] = new PagoReportItemDto
                        {
                            Id = pago.Id,
                            Monto = pago.Monto,
                            Estado = string.Empty,  // You can set this based on payment status if needed
                            MesColegiatura = null,
                            Notas = pago.Notas ?? string.Empty,
                            EsPagoDeCarnet = pago.EsPagoDeCarnet,
                            EstadoCarnet = pago.EstadoCarnet ?? string.Empty
                        };
                    }
                }
                
                // Add this rubro's payments to the dictionary
                if (pagosPorMes.Any())
                {
                    pagosPorRubro[rubro.Id] = pagosPorMes;
                }
            }
            
            // Create and add the student report object
            var alumnoReport = new PagoReportDto
            {                NumeroOrdinal = ordinal++,
                AlumnoId = alumno.Id,
                NombreCompleto = nombreCompleto,
                Notas = alumno.Observaciones ?? string.Empty,
                Nit = nit,
                PagosPorRubro = pagosPorRubro
            };
            
            response.Alumnos.Add(alumnoReport);
        }
        
        return response;
    }    
    
    public async Task<IEnumerable<PagoReadDto>> GetPagosForEditAsync(int cicloEscolar, int? gradoId = null, int? alumnoId = null)
    {
        try 
        {
            var pagos = await _pagoRepository.GetAllAsync();
            var usuarios = await _usuarioRepository.GetAllAsync();
            
            // Debug logging
            Console.WriteLine($"GetPagosForEditAsync - Initial pagos count: {pagos.Count()}");
            Console.WriteLine($"Filter params - cicloEscolar: {cicloEscolar}, gradoId: {gradoId}, alumnoId: {alumnoId}");
            
            // Start with filtering by cicloEscolar which is always required
            var filteredPagos = pagos.Where(p => p.CicloEscolar == cicloEscolar).ToList();
            Console.WriteLine($"After cicloEscolar filter - pagos count: {filteredPagos.Count()}");
            
            // Apply optional filters based on which one is provided
            if (gradoId.HasValue && gradoId.Value > 0)
            {
                // Check if Alumno is loaded properly for each payment
                foreach (var pago in filteredPagos)
                {
                    if (pago.Alumno == null)
                    {
                        Console.WriteLine($"Warning: Pago ID {pago.Id} has null Alumno reference");
                    }
                    else if (pago.Alumno.Grado == null)
                    {
                        Console.WriteLine($"Warning: Alumno ID {pago.AlumnoId} has null Grado reference");
                    }
                }
                
                filteredPagos = filteredPagos.Where(p => p.Alumno != null && p.Alumno.GradoId == gradoId.Value).ToList();
                Console.WriteLine($"After gradoId filter - pagos count: {filteredPagos.Count()}");
            }
            else if (alumnoId.HasValue && alumnoId.Value > 0)
            {
                filteredPagos = filteredPagos.Where(p => p.AlumnoId == alumnoId.Value).ToList();
                Console.WriteLine($"After alumnoId filter - pagos count: {filteredPagos.Count()}");
            }
            
            // Convert to DTOs
            var dtos = filteredPagos.Select(p => 
            {
                var usuario = usuarios.FirstOrDefault(u => u.Id == p.UsuarioCreacionId);
                  return new PagoReadDto
                {
                    Id = p.Id,
                    Monto = p.Monto,
                    Fecha = p.Fecha,
                    CicloEscolar = p.CicloEscolar,
                    MedioPago = p.MedioPago,
                    MedioPagoDescripcion = p.MedioPago.ToString(),
                    RubroId = p.RubroId,
                    RubroDescripcion = p.Rubro?.Descripcion ?? "Desconocido",
                    TipoRubroDescripcion = p.Rubro?.Tipo.ToString() ?? "Desconocido",
                    TipoRubro = p.Rubro?.Tipo ?? TipoRubro.Otros,
                    EsColegiatura = p.EsColegiatura,
                    MesColegiatura = p.MesColegiatura,
                    AnioColegiatura = p.AnioColegiatura,
                    Notas = p.Notas ?? string.Empty,
                    EsPagoDeCarnet = p.EsPagoDeCarnet,
                    EstadoCarnet = p.EstadoCarnet ?? string.Empty,
                    EsPagoDeTransporte = p.EsPagoDeTransporte,
                    EsAnulado = p.EsAnulado,
                    MotivoAnulacion = p.MotivoAnulacion,
                    FechaAnulacion = p.FechaAnulacion,
                    UsuarioAnulacionId = p.UsuarioAnulacionId,
                    UsuarioNombre = usuario != null ? $"{usuario.Nombres} {usuario.Apellidos}" : "Desconocido",                    // Add student information
                    AlumnoId = p.AlumnoId,
                    AlumnoNombre = p.Alumno != null ? 
                        $"{p.Alumno.PrimerNombre} {p.Alumno.SegundoNombre} {p.Alumno.PrimerApellido} {p.Alumno.SegundoApellido}".Trim() : 
                        "Desconocido",
                    GradoNombre = p.Alumno?.Grado?.Nombre ?? "Desconocido",
                    Seccion = p.Alumno?.Seccion ?? string.Empty,                    ImagenesPago = p.ImagenesPago?.Where(pi => pi.EsImagenEliminada != true).Select(pi => new PagoImagenDto
                    {
                        Id = pi.Id,
                        PagoId = pi.PagoId,
                        Url = pi.ImagenUrl.ToString()
                    }).ToList() ?? new List<PagoImagenDto>()
                };
            }).ToList();        Console.WriteLine($"Returning {dtos.Count} payment DTOs");
            return dtos;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in GetPagosForEditAsync: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            throw;
        }
    }

    public async Task<PagoReadDto> VoidPagoAsync(int id, string motivoAnulacion, int usuarioAnulacionId)
    {
        var pago = await _pagoRepository.GetByIdAsync(id);
        if (pago == null)
        {
            throw new ArgumentException($"Payment with ID {id} not found");
        }

        if (pago.EsAnulado)
        {
            throw new InvalidOperationException("Payment is already voided");
        }

        // Update the payment to mark it as voided
        pago.EsAnulado = true;
        pago.MotivoAnulacion = motivoAnulacion;
        pago.FechaAnulacion = DateTime.UtcNow;
        pago.UsuarioAnulacionId = usuarioAnulacionId;

        await _pagoRepository.UpdateAsync(pago);

        // Return the updated payment as DTO
        var alumno = await _alumnoRepository.GetByIdAsync(pago.AlumnoId);
        var rubro = await _rubroRepository.GetByIdAsync(pago.RubroId);
        var usuario = await _usuarioRepository.GetByIdAsync(pago.UsuarioCreacionId);
        var usuarioAnulacion = await _usuarioRepository.GetByIdAsync(usuarioAnulacionId);        return new PagoReadDto
        {
            Id = pago.Id,
            Monto = pago.Monto,
            Fecha = pago.Fecha,
            CicloEscolar = pago.CicloEscolar,
            MedioPagoDescripcion = pago.MedioPago.ToString(),
            RubroId = pago.RubroId,
            RubroDescripcion = rubro?.Descripcion ?? "Unknown",
            TipoRubroDescripcion = rubro?.Tipo.ToString() ?? "Unknown",
            EsColegiatura = rubro?.EsColegiatura ?? false,
            MesColegiatura = pago.MesColegiatura,
            AnioColegiatura = pago.AnioColegiatura,
            Notas = pago.Notas ?? string.Empty,
            EsAnulado = pago.EsAnulado,
            MotivoAnulacion = pago.MotivoAnulacion,
            FechaAnulacion = pago.FechaAnulacion,
            UsuarioAnulacionId = pago.UsuarioAnulacionId,
            UsuarioNombre = usuario != null ? $"{usuario.Nombres} {usuario.Apellidos}".Trim() : "Unknown",
            UsuarioCreacionId = pago.UsuarioCreacionId,
            UsuarioActualizacionId = pago.UsuarioActualizacionId,            AlumnoId = pago.AlumnoId,
            AlumnoNombre = alumno != null ? $"{alumno.PrimerNombre} {alumno.SegundoNombre} {alumno.PrimerApellido} {alumno.SegundoApellido}".Trim() : "Unknown",
            GradoNombre = alumno?.Grado?.Nombre ?? string.Empty,
            Seccion = alumno?.Seccion ?? string.Empty,
            EsPagoDeCarnet = rubro?.EsPagoDeCarnet ?? false,
            EstadoCarnet = pago.EstadoCarnet ?? string.Empty,
            EsPagoDeTransporte = rubro?.EsPagoDeTransporte ?? false,            ImagenesPago = pago.ImagenesPago?.Where(pi => pi.EsImagenEliminada != true).Select(pi => new PagoImagenDto
            {
                Id = pi.Id,
                PagoId = pi.PagoId,
                Url = pi.ImagenUrl.ToString()
            }).ToList() ?? new List<PagoImagenDto>()
        };
    }
    
    public async Task<PagoTransporteReportResponseDto> GetPagoTransporteReportAsync(PagoTransporteReportFilterDto filter)
    {
        // Get the transport rubro
        var rubro = await _rubroRepository.GetByIdAsync(filter.RubroId);
        if (rubro == null)
        {
            throw new ArgumentException($"Rubro with ID {filter.RubroId} not found");
        }        // Verify it's a transport rubro
        if (rubro.EsPagoDeTransporte != true)
        {
            throw new ArgumentException($"Rubro with ID {filter.RubroId} is not a transport payment rubro");
        }        // Get all students who have made transport payments for this rubro and cycle
        var pagos = (await _pagoRepository.GetAllAsync())
            .Where(p => p.CicloEscolar == filter.CicloEscolar && 
                       p.RubroId == filter.RubroId &&
                       p.EsPagoDeTransporte == true)
            .ToList();

        // Get unique student IDs from payments
        var alumnoIds = pagos.Select(p => p.AlumnoId).Distinct().ToList();
        
        // Get all students with their related data
        var alumnos = (await _alumnoRepository.GetAllAsync())
            .Where(a => alumnoIds.Contains(a.Id) && a.Estado == EstadoAlumno.Activo)
            .OrderBy(a => a.PrimerApellido)
            .ThenBy(a => a.SegundoApellido)
            .ThenBy(a => a.PrimerNombre)
            .ThenBy(a => a.SegundoNombre)
            .ToList();

        var response = new PagoTransporteReportResponseDto
        {
            RubroDescripcion = rubro.Descripcion,
            CicloEscolar = filter.CicloEscolar
        };

        int ordinal = 1;
        foreach (var alumno in alumnos)
        {
            // Format full name: "Last Names, First Names"
            string nombreCompleto = string.Format("{0} {1}, {2} {3}",
                alumno.PrimerApellido?.Trim() ?? string.Empty,
                alumno.SegundoApellido?.Trim() ?? string.Empty,
                alumno.PrimerNombre?.Trim() ?? string.Empty,
                alumno.SegundoNombre?.Trim() ?? string.Empty).Trim();

            // Get contactos for this student
            var contactos = await _alumnoContactoRepository.GetByAlumnoIdAsync(alumno.Id);
              // Concatenate cell phones
            string telefonos = string.Join(", ", contactos
                .Where(c => !string.IsNullOrEmpty(c.Contacto.Celular))
                .Select(c => c.Contacto.Celular.Trim()));

            // Concatenate contact names (encargados)
            string encargados = string.Join(", ", contactos
                .Where(c => !string.IsNullOrEmpty(c.Contacto.Nombre))
                .Select(c => c.Contacto.Nombre.Trim()));            // Format grade with level
            string grado = alumno.Grado != null 
                ? $"{alumno.Grado.Nombre} - {alumno.Grado.NivelEducativo?.Nombre ?? "N/A"}"
                : "N/A";

            // Get payments for this student and organize by month
            var alumnoPagos = pagos.Where(p => p.AlumnoId == alumno.Id).ToList();
            var pagosPorMes = new Dictionary<int, PagoReportItemDto>();            // Organize payments by MesColegiatura (which month the payment is for) instead of the actual payment date
            foreach (var pago in alumnoPagos)
            {
                // Use MesColegiatura instead of Fecha.Month to accurately represent which month the payment covers
                int mes = pago.MesColegiatura;
                if (!pagosPorMes.ContainsKey(mes))
                {
                    pagosPorMes[mes] = new PagoReportItemDto
                    {
                        Id = pago.Id,
                        Monto = pago.Monto,
                        Estado = string.Empty, // Can be set based on payment status if needed
                        MesColegiatura = mes,
                        Notas = pago.Notas ?? string.Empty,
                        EsPagoDeTransporte = true
                    };
                }
                else
                {
                    // If multiple payments in the same month, sum the amounts
                    pagosPorMes[mes].Monto += pago.Monto;
                    // Keep the latest payment's notes if any
                    if (!string.IsNullOrEmpty(pago.Notas))
                    {
                        pagosPorMes[mes].Notas = pago.Notas;
                    }
                }
            }

            var transporteReport = new PagoTransporteReportDto
            {
                NumeroOrdinal = ordinal++,
                AlumnoId = alumno.Id,
                Alumno = nombreCompleto,
                Direccion = alumno.Direccion ?? string.Empty,
                Telefono = telefonos,
                Encargado = encargados,
                Grado = grado,
                PagosPorMes = pagosPorMes
            };

            response.Alumnos.Add(transporteReport);
        }        return response;
    }

    public async Task<bool> RemovePagoImagenAsync(int imagenId)
    {
        // Get the image record from database
        var pagoImagen = await _pagoImagenRepository.GetByIdAsync(imagenId);
        
        if (pagoImagen == null)
        {
            throw new Exception($"PagoImagen with ID {imagenId} not found.");
        }        
        // Extract file name from S3 URL
        var fileName = _s3Service.ExtractFileNameFromUrl(pagoImagen.ImagenUrl.ToString());
        
        // Move to archive folder in S3 bucket (soft deletion)
        var archivedUrl = await _s3Service.MoveFileToArchiveAsync(fileName);
        
        // Update database record for soft deletion
        pagoImagen.EsImagenEliminada = true;
        if (!string.IsNullOrEmpty(archivedUrl))
        {
            pagoImagen.ImagenUrl = new Uri(archivedUrl); // Update URL to point to archived location
        }
        
        await _pagoImagenRepository.UpdateAsync(pagoImagen);
        
        // Return true if archiving succeeded (non-null URL returned)
        return !string.IsNullOrEmpty(archivedUrl);
    }

    public async Task<bool> RemoveMultiplePagoImagenesAsync(List<int> imagenesIds)
    {
        var allSuccessful = true;
        
        foreach (var imagenId in imagenesIds)
        {
            try
            {
                var result = await RemovePagoImagenAsync(imagenId);
                if (!result)
                {
                    allSuccessful = false;
                }
            }
            catch (Exception)
            {
                allSuccessful = false;
            }
        }
        
        return allSuccessful;
    }
}
