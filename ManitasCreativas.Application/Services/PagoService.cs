using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;
using ManitasCreativas.Domain.Enums;

public class PagoService : IPagoService
{
    private readonly IPagoRepository _pagoRepository;
    private readonly S3Service _s3Service;
    private readonly IAlumnoRepository _alumnoRepository;
    private readonly IRubroRepository _rubroRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPagoImagenRepository _pagoImagenRepository;

    public PagoService(IPagoRepository pagoRepository, S3Service s3Service, IAlumnoRepository alumnoRepository, IRubroRepository rubroRepository, IUsuarioRepository usuarioRepository, IPagoImagenRepository pagoImagenRepository)
    {
        _pagoRepository = pagoRepository;
        _s3Service = s3Service;
        _alumnoRepository = alumnoRepository;
        _rubroRepository = rubroRepository;
        _usuarioRepository = usuarioRepository;
        _pagoImagenRepository = pagoImagenRepository;
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
                CicloEscolar = p.CicloEscolar,
                MedioPago = p.MedioPago, // Fix: MedioPago is already of type MedioPago
                RubroDescripcion = p.Rubro.Descripcion,
                ImagenesPago = p.ImagenesPago.Select(pi => new PagoImagenDto
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
            Fecha = pago.Fecha,
            CicloEscolar = pago.CicloEscolar,
            MedioPago = pago.MedioPago,
            RubroId = pago.RubroId,
            RubroDescripcion = rubro?.Descripcion,
            EsColegiatura = pago.EsColegiatura,
            MesColegiatura = pago.MesColegiatura,
            AnioColegiatura = pago.AnioColegiatura,
            DiaLimitePagoAmarillo = rubro?.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubro?.DiaLimitePagoRojo,
            MesLimitePago = rubro?.MesLimitePago,
            FechaLimitePagoAmarillo = rubro?.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = rubro?.FechaLimitePagoRojo,
            UsuarioCreacionId = pago.UsuarioCreacionId,
            UsuarioActualizacionId = pago.UsuarioActualizacionId,
            ImagenesPago = pago.ImagenesPago?.Select(pi => new PagoImagenDto
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
            UsuarioCreacion = usuario,

            // Audit fields
            FechaCreacion = DateTime.UtcNow,
            UsuarioCreacionId = pagoDto.UsuarioCreacionId
        };

        await _pagoRepository.AddAsync(pago);

        // Create image records if any
        if (pagoDto.ImageUrls != null && pagoDto.ImageUrls.Any())
        {
            var pagoImagenes = new List<PagoImagen>();
            foreach (var imageUrl in pagoDto.ImageUrls)
            {
                var pagoImagen = new PagoImagen
                {
                    PagoId = pago.Id,
                    ImagenUrl = new Uri(imageUrl),
                    FechaCreacion = DateTime.UtcNow,
                    UsuarioCreacionId = pagoDto.UsuarioCreacionId // Use same user ID for the images
                };
                pagoImagenes.Add(pagoImagen);
            }

            await _pagoImagenRepository.AddRangeAsync(pagoImagenes);
        }

        // Return the created pago as a DTO
        return await GetPagoByIdAsync(pago.Id);
    }

    public async Task<PagoReadDto> UpdatePagoAsync(PagoUploadDto pagoDto)
    {
        // Verify that UsuarioActualizacionId is provided
        if (pagoDto.UsuarioActualizacionId <= 0)
        {
            throw new Exception("UsuarioActualizacionId is required and must be a valid user ID.");
        }

        // Get the existing pago
        var existingPago = await _pagoRepository.GetByIdAsync(pagoDto.Id);
        if (existingPago == null)
        {
            throw new Exception($"Pago with ID {pagoDto.Id} not found.");
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
        existingPago.UsuarioActualizacion = usuario;
        // Update audit fields
        existingPago.FechaActualizacion = DateTime.UtcNow;
        existingPago.UsuarioActualizacionId = pagoDto.UsuarioActualizacionId;

        await _pagoRepository.UpdateAsync(existingPago);

        // Handle image updates if needed
        if (pagoDto.ImageUrls != null && pagoDto.ImageUrls.Any())
        {
            // Get existing images
            var existingImages = await _pagoImagenRepository.GetByPagoIdAsync(pagoDto.Id);
            
            // Remove existing images if they are different from the new ones
            if (existingImages.Any())
            {
                await _pagoImagenRepository.DeleteRangeAsync(existingImages);
            }

            // Add new images
            var pagoImagenes = new List<PagoImagen>();
            foreach (var imageUrl in pagoDto.ImageUrls)
            {
                var pagoImagen = new PagoImagen
                {
                    PagoId = existingPago.Id,
                    ImagenUrl = new Uri(imageUrl),
                    FechaCreacion = DateTime.UtcNow,
                    UsuarioCreacionId = pagoDto.UsuarioActualizacionId.Value // Use the updating user's ID
                };
                pagoImagenes.Add(pagoImagen);
            }

            await _pagoImagenRepository.AddRangeAsync(pagoImagenes);
        }

        // Return the updated pago as a DTO
        return await GetPagoByIdAsync(existingPago.Id);
    }

}
