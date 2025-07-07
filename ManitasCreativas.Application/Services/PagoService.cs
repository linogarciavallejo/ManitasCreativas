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
    private readonly IAlumnoRutaRepository _alumnoRutaRepository;

    public PagoService(
        IPagoRepository pagoRepository, 
        S3Service s3Service, 
        IAlumnoRepository alumnoRepository, 
        IRubroRepository rubroRepository, 
        IUsuarioRepository usuarioRepository, 
        IPagoImagenRepository pagoImagenRepository,
        IAlumnoContactoRepository alumnoContactoRepository,
        IAlumnoRutaRepository alumnoRutaRepository)
    {
        _pagoRepository = pagoRepository;
        _s3Service = s3Service;
        _alumnoRepository = alumnoRepository;
        _rubroRepository = rubroRepository;
        _usuarioRepository = usuarioRepository;
        _pagoImagenRepository = pagoImagenRepository;
        _alumnoContactoRepository = alumnoContactoRepository;
        _alumnoRutaRepository = alumnoRutaRepository;
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
            Fecha = pagoDto.Fecha.Kind == DateTimeKind.Utc 
                ? pagoDto.Fecha 
                : pagoDto.Fecha.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(pagoDto.Fecha, DateTimeKind.Utc)
                    : pagoDto.Fecha.ToUniversalTime(),
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
            FechaAnulacion = pagoDto.FechaAnulacion?.Kind == DateTimeKind.Utc 
                ? pagoDto.FechaAnulacion 
                : pagoDto.FechaAnulacion?.Kind == DateTimeKind.Unspecified 
                    ? (pagoDto.FechaAnulacion.HasValue ? DateTime.SpecifyKind(pagoDto.FechaAnulacion.Value, DateTimeKind.Utc) : null)
                    : pagoDto.FechaAnulacion?.ToUniversalTime(),
            UsuarioAnulacionId = pagoDto.UsuarioAnulacionId
        };await _pagoRepository.AddAsync(pago);

        // Handle images - both uploaded files and existing URLs
        var pagoImagenes = new List<PagoImagen>();        // Handle uploaded files
        if (pagoDto.ImagenesPago != null && pagoDto.ImagenesPago.Any())
        {
            foreach (var file in pagoDto.ImagenesPago)
            {
                // Upload to S3 and get the URL (with year/month folder structure based on payment date)
                var fileName = $"payment-{pago.Id}-{Guid.NewGuid()}-{file.FileName}";
                var imageUrl = await _s3Service.UploadFileAsync(file.OpenReadStream(), fileName, file.ContentType, pago.Fecha);
                
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
        existingPago.Fecha = pagoDto.Fecha.Kind == DateTimeKind.Utc 
            ? pagoDto.Fecha 
            : pagoDto.Fecha.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(pagoDto.Fecha, DateTimeKind.Utc)
                : pagoDto.Fecha.ToUniversalTime();
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
        existingPago.FechaAnulacion = pagoDto.FechaAnulacion?.Kind == DateTimeKind.Utc 
            ? pagoDto.FechaAnulacion 
            : pagoDto.FechaAnulacion?.Kind == DateTimeKind.Unspecified 
                ? (pagoDto.FechaAnulacion.HasValue ? DateTime.SpecifyKind(pagoDto.FechaAnulacion.Value, DateTimeKind.Utc) : null)
                : pagoDto.FechaAnulacion?.ToUniversalTime();
        existingPago.UsuarioAnulacionId = pagoDto.UsuarioAnulacionId;await _pagoRepository.UpdateAsync(existingPago);

        // Handle image updates - both uploaded files and existing URLs
        var existingImages = await _pagoImagenRepository.GetByPagoIdAsync(id);
        var pagoImagenes = new List<PagoImagen>();        // Handle uploaded files
        if (pagoDto.ImagenesPago != null && pagoDto.ImagenesPago.Any())
        {
            foreach (var file in pagoDto.ImagenesPago)
            {
                // Upload to S3 and get the URL (with year/month folder structure based on payment date)
                var fileName = $"payment-{existingPago.Id}-{Guid.NewGuid()}-{file.FileName}";
                var imageUrl = await _s3Service.UploadFileAsync(file.OpenReadStream(), fileName, file.ContentType, existingPago.Fecha);
                
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

        // 1. Get active rubros that have OrdenVisualizacionGrid set AND belong to the correct education level
        // Include rubros where:
        // - NivelEducativoId matches the student's education level OR
        // - NivelEducativoId = 999 (wildcard rubros) AND
        // - OrdenVisualizacionGrid is not null
        var rubros = (await _rubroRepository.GetAllActiveAsync())
            .Where(r => r.OrdenVisualizacionGrid.HasValue && 
                       (r.NivelEducativoId == selectedGrado.NivelEducativoId || r.NivelEducativoId == 999))
            .OrderBy(r => r.OrdenVisualizacionGrid.Value)
            .ToList();
        
        // 2. Map Rubros to RubroReportDto for response
        response.Rubros = rubros.Select(r => new RubroReportDto
        {
            Id = r.Id,
            Descripcion = r.Descripcion,
            OrdenVisualizacionGrid = r.OrdenVisualizacionGrid.Value, // We know it has a value
            EsColegiatura = r.EsColegiatura
        }).ToList();
          // 3. Get all Alumnos for the selected GradoId
        var alumnos = (await _alumnoRepository.GetAllAsync())
            .Where(a => a.GradoId == filter.GradoId && a.Estado == EstadoAlumno.Activo)
            .OrderBy(a => a.PrimerApellido)
            .ThenBy(a => a.SegundoApellido)
            .ThenBy(a => a.PrimerNombre)
            .ThenBy(a => a.SegundoNombre)
            .ToList();

        // Group students by section
        var estudiantesPorSeccion = alumnos
            .GroupBy(a => a.Seccion ?? "Sin Sección")
            .OrderBy(g => g.Key == "Sin Sección" ? "Z" : g.Key) // Put "Sin Sección" at the end
            .ToList();        // 4. Get all Pagos for these students in the selected CicloEscolar for the filtered Rubros
        var rubroIds = rubros.Select(r => r.Id).ToList();
        var alumnoIds = alumnos.Select(a => a.Id).ToList();        var pagos = (await _pagoRepository.GetAllAsync())
            .Where(p => p.CicloEscolar == filter.CicloEscolar && 
                   alumnoIds.Contains(p.AlumnoId) && 
                   rubroIds.Contains(p.RubroId))
            .ToList();
        
        // 5. Process each section
        foreach (var seccionGroup in estudiantesPorSeccion)
        {
            var seccionDto = new PagoReportSeccionDto
            {
                Seccion = seccionGroup.Key,
                Alumnos = new List<PagoReportDto>()
            };

            // Create PagoReportDto for each alumno in this section with their ordered pagos
            int ordinal = 1;
            foreach (var alumno in seccionGroup)
            {
                // Format the full name as requested: "Primer Apellido Segundo Apellido, Primer Nombre Segundo Nombre Tercer Nombre"
                var apellidos = $"{alumno.PrimerApellido} {alumno.SegundoApellido ?? ""}".Trim();
                var nombres = $"{alumno.PrimerNombre} {alumno.SegundoNombre ?? ""} {alumno.TercerNombre ?? ""}".Trim();
                string nombreCompleto = $"{apellidos}, {nombres}".Replace("  ", " ").Trim();
                
                // Get all contactos for this alumno to extract NITs
                var contactos = await _alumnoContactoRepository.GetByAlumnoIdAsync(alumno.Id);
                string nit = string.Join(", ", contactos
                    .Where(c => !string.IsNullOrEmpty(c.Contacto.Nit))
                    .Select(c => c.Contacto.Nit));
                
                // Get all pagos for this alumno
                var alumnoPagos = pagos.Where(p => p.AlumnoId == alumno.Id).ToList();                // Structure the pagos by rubro and month (for colegiatura)
                var pagosPorRubro = new Dictionary<int, Dictionary<int, PagoReportItemDto>>();
                
                foreach (var rubro in rubros)
                {
                    var rubroPagos = alumnoPagos.Where(p => p.RubroId == rubro.Id).ToList();
                    
                    // For each rubro, create a dictionary for month-based payments (or just use 0 as key for non-colegiatura)
                    var pagosPorMes = new Dictionary<int, PagoReportItemDto>();                      if (rubro.EsColegiatura)
                    {
                        // For colegiatura rubros, organize by month
                        foreach (var pago in rubroPagos)
                        {                            // Handle potential null/zero MesColegiatura by using 0 as default key for non-month payments
                            var mesKey = pago.MesColegiatura == 0 ? 0 : pago.MesColegiatura;
                            if (!pagosPorMes.ContainsKey(mesKey))
                            {
                                pagosPorMes[mesKey] = new PagoReportItemDto
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
                        }
                    }
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
                      // Always add this rubro to the dictionary, even if the student has no payments for it
                    // This ensures all rubros appear in the frontend, creating consistent columns
                    pagosPorRubro[rubro.Id] = pagosPorMes;
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
                
                seccionDto.Alumnos.Add(alumnoReport);
            }

            response.Secciones.Add(seccionDto);
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
                };            }).OrderBy(dto => dto.Fecha).ToList();        Console.WriteLine($"Returning {dtos.Count} payment DTOs");
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
            var apellidos = $"{alumno.PrimerApellido?.Trim() ?? ""} {alumno.SegundoApellido?.Trim() ?? ""}".Trim();
            var nombres = $"{alumno.PrimerNombre?.Trim() ?? ""} {alumno.SegundoNombre?.Trim() ?? ""} {alumno.TercerNombre?.Trim() ?? ""}".Trim();
            string nombreCompleto = $"{apellidos}, {nombres}".Replace("  ", " ").Trim();

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
    }    public async Task<bool> RemovePagoImagenAsync(int imagenId)
    {
        // Get the image record from database
        var pagoImagen = await _pagoImagenRepository.GetByIdAsync(imagenId);
        
        if (pagoImagen == null)
        {
            throw new Exception($"PagoImagen with ID {imagenId} not found.");
        }        
        // Extract file key (including year/month path) from S3 URL
        var fileKey = _s3Service.ExtractFileKeyFromUrl(pagoImagen.ImagenUrl.ToString());
        
        // Move to archive folder in S3 bucket (soft deletion)
        var archivedUrl = await _s3Service.MoveFileToArchiveAsync(fileKey);
        
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

    public async Task<MonthlyPaymentReportResponseDto> GetMonthlyPaymentReportAsync(MonthlyPaymentReportFilterDto filter)
    {
        var response = new MonthlyPaymentReportResponseDto
        {
            Filter = filter,
            ReportTitle = "Monthly Payments Report",
            ReportPeriod = $"{GetMonthName(filter.Month)} {filter.Year}"
        };

        // Get all payments for the specified month/year and school cycle
        var pagos = await _pagoRepository.GetAllAsync();
        
        var filteredPagos = pagos
            .Where(p => p.CicloEscolar == filter.CicloEscolar &&
                       p.Fecha.Month == filter.Month &&
                       p.Fecha.Year == filter.Year);

        // Apply optional filters
        if (filter.GradoId.HasValue)
        {
            filteredPagos = filteredPagos.Where(p => p.Alumno.GradoId == filter.GradoId.Value);
        }

        if (!string.IsNullOrEmpty(filter.Seccion))
        {
            filteredPagos = filteredPagos.Where(p => p.Alumno.Seccion == filter.Seccion);
        }

        if (filter.RubroId.HasValue)
        {
            filteredPagos = filteredPagos.Where(p => p.RubroId == filter.RubroId.Value);
        }

        var pagosList = filteredPagos.ToList();

        // Convert to MonthlyPaymentItemDto
        response.Payments = pagosList.Select(p => new MonthlyPaymentItemDto
        {
            Id = p.Id,
            Monto = p.Monto,
            Fecha = p.Fecha,
            CicloEscolar = p.CicloEscolar,
            MedioPago = p.MedioPago.ToString(),
            RubroDescripcion = p.Rubro?.Descripcion ?? "Unknown",
            TipoRubro = p.Rubro?.Tipo.ToString() ?? "Unknown",
            EsColegiatura = p.Rubro?.EsColegiatura ?? false,
            MesColegiatura = p.MesColegiatura,
            AnioColegiatura = p.AnioColegiatura,
            Notas = p.Notas ?? string.Empty,
            
            // Student information
            AlumnoId = p.AlumnoId,
            AlumnoNombre = $"{p.Alumno?.PrimerNombre} {p.Alumno?.SegundoNombre} {p.Alumno?.TercerNombre ?? ""} {p.Alumno?.PrimerApellido} {p.Alumno?.SegundoApellido}".Replace("  ", " ").Trim(),
            GradoNombre = p.Alumno?.Grado?.Nombre ?? "Unknown",
            Seccion = p.Alumno?.Seccion ?? "Sin Sección",
            NivelEducativo = p.Alumno?.Grado?.NivelEducativo?.Nombre ?? "Unknown",
            
            // Payment status
            EsAnulado = p.EsAnulado,
            MotivoAnulacion = p.MotivoAnulacion,
            FechaAnulacion = p.FechaAnulacion,
            UsuarioAnulacionNombre = p.UsuarioAnulacionId.HasValue ? 
                GetUsuarioNombre(p.UsuarioAnulacionId.Value).Result : string.Empty,
            
            // Week and day information
            WeekOfMonth = GetWeekOfMonth(p.Fecha),
            WeekRange = GetWeekRange(p.Fecha),
            DayOfWeek = p.Fecha.DayOfWeek.ToString(),
            DayOfMonth = p.Fecha.Day,
            
            // Payment category for drill-down
            PaymentCategory = p.EsAnulado ? "Voided" : "Active"
        }).ToList();

        // Calculate summary statistics
        response.Summary = CalculateMonthlyPaymentSummary(response.Payments);

        return response;
    }

    private async Task<string> GetUsuarioNombre(int usuarioId)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
        return usuario != null ? $"{usuario.Nombres} {usuario.Apellidos}".Trim() : "Unknown";
    }

    private MonthlyPaymentSummaryDto CalculateMonthlyPaymentSummary(List<MonthlyPaymentItemDto> payments)
    {
        var activePayments = payments.Where(p => !p.EsAnulado).ToList();
        var voidedPayments = payments.Where(p => p.EsAnulado).ToList();

        return new MonthlyPaymentSummaryDto
        {
            TotalAmount = payments.Sum(p => p.Monto),
            ActivePaymentsAmount = activePayments.Sum(p => p.Monto),
            VoidedPaymentsAmount = voidedPayments.Sum(p => p.Monto),
            TotalPayments = payments.Count,
            ActivePayments = activePayments.Count,
            VoidedPayments = voidedPayments.Count,
            
            AmountByGrado = payments.GroupBy(p => p.GradoNombre)
                .ToDictionary(g => g.Key, g => g.Sum(p => p.Monto)),
            
            AmountByRubro = payments.GroupBy(p => p.RubroDescripcion)
                .ToDictionary(g => g.Key, g => g.Sum(p => p.Monto)),
            
            AmountByWeek = payments.GroupBy(p => p.WeekRange)
                .ToDictionary(g => g.Key, g => g.Sum(p => p.Monto)),
            
            PaymentCountByGrado = payments.GroupBy(p => p.GradoNombre)
                .ToDictionary(g => g.Key, g => g.Count()),
            
            PaymentCountByRubro = payments.GroupBy(p => p.RubroDescripcion)
                .ToDictionary(g => g.Key, g => g.Count()),
            
            PaymentCountByWeek = payments.GroupBy(p => p.WeekRange)
                .ToDictionary(g => g.Key, g => g.Count())
        };
    }

    private int GetWeekOfMonth(DateTime date)
    {
        var firstDayOfMonth = new DateTime(date.Year, date.Month, 1);
        var firstWeek = firstDayOfMonth.DayOfWeek == DayOfWeek.Sunday ? 1 : 0;
        return (date.Day + (int)firstDayOfMonth.DayOfWeek - 1) / 7 + firstWeek + 1;
    }

    private string GetWeekRange(DateTime date)
    {
        var weekOfMonth = GetWeekOfMonth(date);
        var firstDayOfMonth = new DateTime(date.Year, date.Month, 1);
        var daysInMonth = DateTime.DaysInMonth(date.Year, date.Month);
        
        // Calculate the start and end of the week
        var startOfWeek = Math.Max(1, (weekOfMonth - 1) * 7 - (int)firstDayOfMonth.DayOfWeek + 1);
        var endOfWeek = Math.Min(daysInMonth, startOfWeek + 6);
        
        var monthName = GetMonthName(date.Month);
        return $"{monthName} {startOfWeek}-{endOfWeek}, {date.Year}";
    }

    private string GetMonthName(int month)
    {
        return month switch
        {
            1 => "January",
            2 => "February",
            3 => "March",
            4 => "April",
            5 => "May",
            6 => "June",
            7 => "July",
            8 => "August",
            9 => "September",
            10 => "October",
            11 => "November",
            12 => "December",
            _ => "Unknown"
        };
    }

    public async Task<TuitionDebtorsReportDto> GetTuitionDebtorsReportAsync(TuitionDebtorsFilterDto filter)
    {
        var reportDate = DateTime.Now;
        var asOfDate = filter.Year.HasValue && filter.Month.HasValue 
            ? new DateTime(filter.Year.Value, filter.Month.Value, DateTime.DaysInMonth(filter.Year.Value, filter.Month.Value))
            : reportDate;        // Get all active students
        var alumnos = await _alumnoRepository.GetAllAsync();
        var activeAlumnos = alumnos.Where(a => a.Estado == EstadoAlumno.Activo).ToList();

        // Apply filters to students
        if (filter.SedeId.HasValue)
            activeAlumnos = activeAlumnos.Where(a => a.SedeId == filter.SedeId.Value).ToList();
        if (filter.NivelEducativoId.HasValue)
            activeAlumnos = activeAlumnos.Where(a => a.Grado.NivelEducativoId == filter.NivelEducativoId.Value).ToList();
        if (filter.GradoId.HasValue)
            activeAlumnos = activeAlumnos.Where(a => a.GradoId == filter.GradoId.Value).ToList();
        if (!string.IsNullOrEmpty(filter.Seccion))
            activeAlumnos = activeAlumnos.Where(a => a.Seccion == filter.Seccion).ToList();

        // Get all tuition rubros (EsColegiatura = true)
        var rubros = await _rubroRepository.GetAllAsync();
        var tuitionRubros = rubros.Where(r => r.EsColegiatura && (r.Activo ?? false)).ToList();        // Get all payments for tuition rubros
        var pagos = await _pagoRepository.GetAllAsync();
        var tuitionPayments = pagos.Where(p => 
            tuitionRubros.Any(r => r.Id == p.RubroId) && 
            !p.EsAnulado &&
            p.CicloEscolar == (filter.Year ?? reportDate.Year)
        ).ToList();

        var debtors = new List<TuitionDebtorDto>();

        foreach (var alumno in activeAlumnos)
        {
            var unpaidTuitions = GetUnpaidTuitions(alumno, tuitionRubros, tuitionPayments, asOfDate, filter);
              if (unpaidTuitions.Any())
            {
                var totalDebt = unpaidTuitions.Sum(ut => ut.Amount);
                // Count unique months behind instead of total unpaid tuition records
                var monthsBehind = unpaidTuitions.Select(ut => new { ut.Year, ut.Month }).Distinct().Count();
                
                // Apply filters
                if (filter.MinMonthsBehind.HasValue && monthsBehind < filter.MinMonthsBehind.Value)
                    continue;
                if (filter.MinDebtAmount.HasValue && totalDebt < filter.MinDebtAmount.Value)
                    continue;

                var lastPaymentDate = tuitionPayments
                    .Where(p => p.AlumnoId == alumno.Id)
                    .OrderByDescending(p => p.Fecha)
                    .FirstOrDefault()?.Fecha ?? DateTime.MinValue;

                var isCurrentMonthOverdue = IsCurrentMonthTuitionOverdue(asOfDate, tuitionPayments, alumno.Id);                // Format the full name as requested: "Primer Apellido Segundo Apellido, Primer Nombre Segundo Nombre Tercer Nombre"
                var apellidos = $"{alumno.PrimerApellido} {alumno.SegundoApellido ?? ""}".Trim();
                var nombres = $"{alumno.PrimerNombre} {alumno.SegundoNombre ?? ""} {alumno.TercerNombre ?? ""}".Trim();
                string nombreCompleto = $"{apellidos}, {nombres}".Replace("  ", " ").Trim();
                
                debtors.Add(new TuitionDebtorDto
                {
                    AlumnoId = alumno.Id,
                    NombreCompleto = nombreCompleto,
                    NivelEducativo = alumno.Grado.NivelEducativo?.Nombre ?? "N/A",
                    Grado = alumno.Grado.Nombre,
                    Seccion = alumno.Seccion ?? "N/A",
                    Sede = alumno.Sede.Nombre,
                    UnpaidTuitions = unpaidTuitions,
                    TotalDebt = totalDebt,
                    MonthsBehind = monthsBehind,
                    LastPaymentDate = lastPaymentDate,
                    IsCurrentMonthOverdue = isCurrentMonthOverdue
                });
            }
        }

        // Calculate summary
        var summary = CalculateTuitionDebtorsSummary(debtors);        // Sort debtors based on filter criteria
        List<TuitionDebtorDto> sortedDebtors;
        if (filter.GradoId.HasValue)
        {
            // If specific grade is selected, sort by section then by name
            sortedDebtors = debtors
                .OrderBy(d => d.Seccion)
                .ThenBy(d => d.NombreCompleto)
                .ToList();
        }
        else
        {
            // If all grades (or no specific grade), sort by name
            sortedDebtors = debtors
                .OrderBy(d => d.NombreCompleto)
                .ToList();
        }

        return new TuitionDebtorsReportDto
        {
            ReportDate = reportDate,
            AsOfDate = asOfDate,
            TotalStudents = activeAlumnos.Count,
            StudentsInDebt = debtors.Count,
            TotalDebtAmount = debtors.Sum(d => d.TotalDebt),
            Debtors = sortedDebtors,
            Summary = summary
        };
    }

    private List<UnpaidTuitionDto> GetUnpaidTuitions(
        Alumno alumno, 
        List<Rubro> tuitionRubros, 
        List<Pago> tuitionPayments, 
        DateTime asOfDate,
        TuitionDebtorsFilterDto filter)
    {
        var unpaidTuitions = new List<UnpaidTuitionDto>();
        var currentYear = asOfDate.Year;
        var currentMonth = asOfDate.Month;        // Check each month from January to current month (or specified month)
        var endMonth = filter.Month ?? currentMonth;
        
        // Filter tuition rubros to only those applicable to this student's grade/level
        var applicableRubros = tuitionRubros.Where(r => 
            // If rubro has no specific grade (gradoId is null), check nivel educativo
            (r.GradoId == null && r.NivelEducativoId == alumno.Grado.NivelEducativoId) ||
            // If rubro has specific grade, check exact grade match
            (r.GradoId == alumno.GradoId)
        ).ToList();
        
        for (int month = 1; month <= endMonth; month++)
        {            foreach (var rubro in applicableRubros)
            {
                // Check if tuition for this month and rubro has been paid
                // Use MesColegiatura and AnioColegiatura to match the payment to the specific month it covers
                var hasPaid = tuitionPayments.Any(p => 
                    p.AlumnoId == alumno.Id &&
                    p.RubroId == rubro.Id &&
                    p.CicloEscolar == currentYear &&
                    p.MesColegiatura == month &&
                    p.AnioColegiatura == currentYear);

                if (!hasPaid)
                {
                    var dueDate = new DateTime(currentYear, month, 5); // Due by 5th of each month
                    var daysPastDue = (asOfDate - dueDate).Days;

                    // Only include if past due date and we're including current month or it's a past month
                    if (daysPastDue > 0 || (filter.IncludeCurrentMonth && month == currentMonth))
                    {                        unpaidTuitions.Add(new UnpaidTuitionDto
                        {
                            Year = currentYear,
                            Month = month,
                            MonthName = GetSpanishMonthName(month),
                            Amount = rubro.MontoPreestablecido ?? 0m,
                            DueDate = dueDate,
                            DaysPastDue = Math.Max(0, daysPastDue),
                            RubroNombre = rubro.Descripcion
                        });
                    }
                }
            }
        }

        return unpaidTuitions;
    }    private bool IsCurrentMonthTuitionOverdue(DateTime asOfDate, List<Pago> tuitionPayments, int alumnoId)
    {
        var currentMonth = asOfDate.Month;
        var currentYear = asOfDate.Year;
        var dueDate = new DateTime(currentYear, currentMonth, 5);

        // If we're past the due date for current month
        if (asOfDate > dueDate)
        {
            // Get the alumno to check their grade/level
            var alumno = _alumnoRepository.GetByIdAsync(alumnoId).Result;
            if (alumno != null)
            {
                // Get applicable tuition rubros for this student
                var rubros = _rubroRepository.GetAllAsync().Result;
                var tuitionRubros = rubros.Where(r => r.EsColegiatura && (r.Activo ?? false)).ToList();
                var applicableRubros = tuitionRubros.Where(r => 
                    (r.GradoId == null && r.NivelEducativoId == alumno.Grado.NivelEducativoId) ||
                    (r.GradoId == alumno.GradoId)
                ).ToList();

                // Check if current month tuition has been paid for any applicable rubro
                return !applicableRubros.Any(rubro => tuitionPayments.Any(p => 
                    p.AlumnoId == alumnoId &&
                    p.RubroId == rubro.Id &&
                    p.EsColegiatura &&
                    p.MesColegiatura == currentMonth &&
                    p.AnioColegiatura == currentYear));
            }
        }

        return false;
    }

    private TuitionDebtorsSummaryDto CalculateTuitionDebtorsSummary(List<TuitionDebtorDto> debtors)
    {
        var summary = new TuitionDebtorsSummaryDto
        {
            CurrentMonthDelinquent = debtors.Count(d => d.IsCurrentMonthOverdue),
            OneMonthBehind = debtors.Count(d => d.MonthsBehind == 1),
            TwoMonthsBehind = debtors.Count(d => d.MonthsBehind == 2),
            ThreeOrMoreMonthsBehind = debtors.Count(d => d.MonthsBehind >= 3),
            AverageDebtPerStudent = debtors.Any() ? debtors.Average(d => d.TotalDebt) : 0,
            DebtorsByGrade = debtors.GroupBy(d => d.Grado).ToDictionary(g => g.Key, g => g.Count()),
            DebtorsBySede = debtors.GroupBy(d => d.Sede).ToDictionary(g => g.Key, g => g.Count())
        };

        return summary;
    }    public async Task<TransportDebtorsReportDto> GetTransportDebtorsReportAsync(TransportDebtorsFilterDto filter)
    {
        Console.WriteLine("=== Starting Transport Debtors Report (Using AlumnoRuta) ===");
        Console.WriteLine($"Filter: Year={filter.Year}, Month={filter.Month}, SedeId={filter.SedeId}, RubroId={filter.RubroId}");
        
        var reportDate = DateTime.Now;
        var asOfDate = filter.Year.HasValue && filter.Month.HasValue 
            ? new DateTime(filter.Year.Value, filter.Month.Value, DateTime.DaysInMonth(filter.Year.Value, filter.Month.Value))
            : reportDate;

        Console.WriteLine($"AsOfDate: {asOfDate:yyyy-MM-dd}");

        // Get all active students
        var alumnos = await _alumnoRepository.GetAllAsync();
        var activeAlumnos = alumnos.Where(a => a.Estado == EstadoAlumno.Activo).ToList();
        Console.WriteLine($"Total active students: {activeAlumnos.Count}");

        // Apply filters to students
        if (filter.SedeId.HasValue)
        {
            activeAlumnos = activeAlumnos.Where(a => a.SedeId == filter.SedeId.Value).ToList();
            Console.WriteLine($"After sede filter: {activeAlumnos.Count} students");
        }
        if (filter.NivelEducativoId.HasValue)
        {
            activeAlumnos = activeAlumnos.Where(a => a.Grado?.NivelEducativoId == filter.NivelEducativoId.Value).ToList();
            Console.WriteLine($"After nivel educativo filter: {activeAlumnos.Count} students");
        }
        if (filter.GradoId.HasValue)
        {
            activeAlumnos = activeAlumnos.Where(a => a.GradoId == filter.GradoId.Value).ToList();
            Console.WriteLine($"After grado filter: {activeAlumnos.Count} students");
        }
        if (!string.IsNullOrEmpty(filter.Seccion))
        {
            activeAlumnos = activeAlumnos.Where(a => a.Seccion == filter.Seccion).ToList();
            Console.WriteLine($"After seccion filter: {activeAlumnos.Count} students");
        }

        // Get all transport rubros for reference
        var rubros = await _rubroRepository.GetAllAsync();
        var transportRubros = rubros.Where(r => r.EsPagoDeTransporte == true).ToList();
        Console.WriteLine($"Total transport rubros: {transportRubros.Count}");

        // Get all transport payments for the year
        var pagos = await _pagoRepository.GetAllAsync();
        var transportPayments = pagos.Where(p => 
            transportRubros.Any(r => r.Id == p.RubroId) && 
            !p.EsAnulado &&
            p.CicloEscolar == (filter.Year ?? reportDate.Year)
        ).ToList();
        Console.WriteLine($"Total transport payments for year {filter.Year ?? reportDate.Year}: {transportPayments.Count}");

        var debtors = new List<TransportDebtorDto>();
        Console.WriteLine($"Processing {activeAlumnos.Count} students...");

        foreach (var alumno in activeAlumnos)
        {
            Console.WriteLine($"Processing student: {alumno.PrimerNombre} {alumno.PrimerApellido} (ID: {alumno.Id})");
            
            // Get the student's assigned transport routes using AlumnoRuta
            var alumnoRutas = await _alumnoRutaRepository.GetByAlumnoIdAsync(alumno.Id);
            var activeRoutes = alumnoRutas.Where(ar => 
                ar.FechaInicio <= asOfDate && 
                (ar.FechaFin == null || ar.FechaFin >= asOfDate)
            ).ToList();

            Console.WriteLine($"  Student has {activeRoutes.Count} active transport route assignments");

            // Apply rubro filter if specified
            if (filter.RubroId.HasValue)
            {
                activeRoutes = activeRoutes.Where(ar => ar.RubroTransporteId == filter.RubroId.Value).ToList();
                Console.WriteLine($"  After rubro filter: {activeRoutes.Count} routes");
            }

            if (!activeRoutes.Any())
            {
                Console.WriteLine($"  Student {alumno.PrimerNombre} {alumno.PrimerApellido} has no active transport routes - skipping");
                continue;
            }

            var unpaidTransports = GetUnpaidTransportsUsingAlumnoRuta(alumno, activeRoutes, transportPayments, asOfDate, filter);
              
            if (unpaidTransports.Any())
            {
                Console.WriteLine($"Student {alumno.PrimerNombre} {alumno.PrimerApellido} has {unpaidTransports.Count} unpaid transports");
                var totalDebt = unpaidTransports.Sum(ut => ut.Amount);
                // Count unique months behind instead of total unpaid transport records
                var monthsBehind = unpaidTransports.Select(ut => new { ut.Year, ut.Month }).Distinct().Count();
                
                // Apply filters
                if (filter.MinMonthsBehind.HasValue && monthsBehind < filter.MinMonthsBehind.Value)
                    continue;
                if (filter.MinDebtAmount.HasValue && totalDebt < filter.MinDebtAmount.Value)
                    continue;

                var lastPaymentDate = transportPayments
                    .Where(p => p.AlumnoId == alumno.Id)
                    .OrderByDescending(p => p.Fecha)
                    .FirstOrDefault()?.Fecha ?? DateTime.MinValue;

                var isCurrentMonthOverdue = IsCurrentMonthTransportOverdueUsingAlumnoRuta(asOfDate, transportPayments, alumno.Id, activeRoutes);

                // Format the full name as requested: "Primer Apellido Segundo Apellido, Primer Nombre Segundo Nombre Tercer Nombre"
                var apellidos = $"{alumno.PrimerApellido} {alumno.SegundoApellido ?? ""}".Trim();
                var nombres = $"{alumno.PrimerNombre} {alumno.SegundoNombre ?? ""} {alumno.TercerNombre ?? ""}".Trim();
                string nombreCompleto = $"{apellidos}, {nombres}".Replace("  ", " ").Trim();

                // Get the transport route names - show multiple routes if applicable
                var routeNames = activeRoutes.Select(ar => ar.RubroTransporte?.Descripcion ?? "N/A").Distinct().ToList();
                var rubroTransporte = routeNames.Count == 1 
                    ? routeNames.First() 
                    : string.Join(", ", routeNames);

                debtors.Add(new TransportDebtorDto
                {
                    AlumnoId = alumno.Id,
                    NombreCompleto = nombreCompleto,
                    NivelEducativo = alumno.Grado?.NivelEducativo?.Nombre ?? "N/A",
                    Grado = alumno.Grado?.Nombre ?? "N/A",
                    Seccion = alumno.Seccion ?? "N/A",
                    Sede = alumno.Sede?.Nombre ?? "N/A",
                    RubroTransporte = rubroTransporte,
                    UnpaidTransports = unpaidTransports,
                    TotalDebt = totalDebt,
                    MonthsBehind = monthsBehind,
                    LastPaymentDate = lastPaymentDate,
                    IsCurrentMonthOverdue = isCurrentMonthOverdue
                });
            }
        }

        Console.WriteLine($"=== Transport Debtors Report Complete ===");
        Console.WriteLine($"Total debtors found: {debtors.Count}");
        
        // Calculate summary
        var summary = CalculateTransportDebtorsSummary(debtors);

        // Sort debtors based on filter criteria
        List<TransportDebtorDto> sortedDebtors;
        if (filter.GradoId.HasValue)
        {
            // If specific grade is selected, sort by section then by name
            sortedDebtors = debtors
                .OrderBy(d => d.Seccion)
                .ThenBy(d => d.NombreCompleto)
                .ToList();
        }
        else
        {
            // If all grades (or no specific grade), sort by name
            sortedDebtors = debtors
                .OrderBy(d => d.NombreCompleto)
                .ToList();
        }

        return new TransportDebtorsReportDto
        {
            ReportDate = reportDate,
            AsOfDate = asOfDate,
            TotalStudents = activeAlumnos.Count,
            StudentsInDebt = debtors.Count,
            TotalDebtAmount = debtors.Sum(d => d.TotalDebt),
            Debtors = sortedDebtors,
            Summary = summary
        };
    }    private List<UnpaidTransportDto> GetUnpaidTransportsUsingAlumnoRuta(
        Alumno alumno, 
        List<AlumnoRuta> activeRoutes, 
        List<Pago> transportPayments, 
        DateTime asOfDate,
        TransportDebtorsFilterDto filter)
    {
        var unpaidTransports = new List<UnpaidTransportDto>();
        var currentYear = asOfDate.Year;
        var currentMonth = asOfDate.Month;

        // Check each month from January to current month (or specified month)
        var endMonth = filter.Month ?? currentMonth;

        Console.WriteLine($"  Student {alumno.PrimerNombre} {alumno.PrimerApellido}: {activeRoutes.Count} active routes, checking months 1-{endMonth}");

        for (int month = 1; month <= endMonth; month++)
        {
            foreach (var alumnoRuta in activeRoutes)
            {
                // Only check months where the route assignment was active
                var monthStartDate = new DateTime(currentYear, month, 1);
                var monthEndDate = new DateTime(currentYear, month, DateTime.DaysInMonth(currentYear, month));
                
                // Check if route assignment overlaps with this month
                bool routeActiveThisMonth = alumnoRuta.FechaInicio <= monthEndDate && 
                                          (alumnoRuta.FechaFin == null || alumnoRuta.FechaFin >= monthStartDate);
                
                if (!routeActiveThisMonth)
                {
                    Console.WriteLine($"    Route {alumnoRuta.RubroTransporte?.Descripcion} not active for {GetSpanishMonthName(month)} {currentYear}");
                    continue;
                }

                // Check if payment exists for this month and rubro
                var paymentExists = transportPayments.Any(p => 
                    p.AlumnoId == alumno.Id &&
                    p.RubroId == alumnoRuta.RubroTransporteId &&
                    p.MesColegiatura == month &&
                    p.AnioColegiatura == currentYear &&
                    !p.EsAnulado
                );

                if (!paymentExists)
                {
                    // Calculate due date (assumed 5th of each month like tuition)
                    var dueDate = new DateTime(currentYear, month, 5);
                    var daysPastDue = (int)(asOfDate - dueDate).TotalDays;
                    daysPastDue = daysPastDue > 0 ? daysPastDue : 0;

                    unpaidTransports.Add(new UnpaidTransportDto
                    {
                        Year = currentYear,
                        Month = month,
                        MonthName = GetSpanishMonthName(month),
                        Amount = alumnoRuta.RubroTransporte?.MontoPreestablecido ?? 0,
                        DueDate = dueDate,
                        DaysPastDue = daysPastDue,
                        RubroNombre = alumnoRuta.RubroTransporte?.Descripcion ?? "N/A"
                    });
                    
                    Console.WriteLine($"    Missing payment: {GetSpanishMonthName(month)} {currentYear} - {alumnoRuta.RubroTransporte?.Descripcion} (Q{alumnoRuta.RubroTransporte?.MontoPreestablecido})");
                }
            }
        }

        return unpaidTransports;
    }

    private bool IsCurrentMonthTransportOverdueUsingAlumnoRuta(DateTime asOfDate, List<Pago> transportPayments, int alumnoId, List<AlumnoRuta> activeRoutes)
    {
        var currentMonth = asOfDate.Month;
        var currentYear = asOfDate.Year;
        var dueDate = new DateTime(currentYear, currentMonth, 5);

        if (asOfDate > dueDate)
        {
            foreach (var alumnoRuta in activeRoutes)
            {
                // Check if route is active for current month
                var monthStartDate = new DateTime(currentYear, currentMonth, 1);
                var monthEndDate = new DateTime(currentYear, currentMonth, DateTime.DaysInMonth(currentYear, currentMonth));
                
                bool routeActiveThisMonth = alumnoRuta.FechaInicio <= monthEndDate && 
                                          (alumnoRuta.FechaFin == null || alumnoRuta.FechaFin >= monthStartDate);
                
                if (!routeActiveThisMonth)
                    continue;

                var paymentExists = transportPayments.Any(p => 
                    p.AlumnoId == alumnoId &&
                    p.RubroId == alumnoRuta.RubroTransporteId &&
                    p.MesColegiatura == currentMonth &&
                    p.AnioColegiatura == currentYear &&
                    !p.EsAnulado
                );

                if (!paymentExists)
                {
                    return true; // At least one transport payment is overdue
                }
            }
        }

        return false;
    }

    private TransportDebtorsSummaryDto CalculateTransportDebtorsSummary(List<TransportDebtorDto> debtors)
    {
        var summary = new TransportDebtorsSummaryDto
        {
            CurrentMonthDelinquent = debtors.Count(d => d.IsCurrentMonthOverdue),
            OneMonthBehind = debtors.Count(d => d.MonthsBehind == 1),
            TwoMonthsBehind = debtors.Count(d => d.MonthsBehind == 2),
            ThreeOrMoreMonthsBehind = debtors.Count(d => d.MonthsBehind >= 3),
            AverageDebtPerStudent = debtors.Any() ? debtors.Average(d => d.TotalDebt) : 0,
            DebtorsByGrade = debtors.GroupBy(d => d.Grado).ToDictionary(g => g.Key, g => g.Count()),
            DebtorsBySede = debtors.GroupBy(d => d.Sede).ToDictionary(g => g.Key, g => g.Count()),
            DebtorsByRoute = debtors.GroupBy(d => d.RubroTransporte).ToDictionary(g => g.Key, g => g.Count())
        };

        return summary;
    }

    private string GetSpanishMonthName(int month)
    {
        return month switch
        {
            1 => "Enero",
            2 => "Febrero",
            3 => "Marzo",
            4 => "Abril",
            5 => "Mayo",
            6 => "Junio",
            7 => "Julio",
            8 => "Agosto",
            9 => "Septiembre",
            10 => "Octubre",
            11 => "Noviembre",
            12 => "Diciembre",
            _ => "Desconocido"
        };
    }
}
