using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;

public class PagoService : IPagoService
{
    private readonly IPagoRepository _pagoRepository;
    private readonly S3Service _s3Service;

    public PagoService(IPagoRepository pagoRepository, S3Service s3Service)
    {
        _pagoRepository = pagoRepository;
        _s3Service = s3Service;
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

    public async Task<PagoUploadDto> AddPagoAsync(PagoUploadDto pagoDto)
    {
        var pago = new Pago
        {
            Fecha = DateTime.SpecifyKind(pagoDto.Fecha, DateTimeKind.Utc),
            CicloEscolar = pagoDto.CicloEscolar,
            Monto = pagoDto.Monto,
            MedioPago = pagoDto.MedioPago,
            RubroId = pagoDto.RubroId,
            AlumnoId = pagoDto.AlumnoId,
            EsColegiatura = pagoDto.EsColegiatura,
            MesColegiatura = pagoDto.MesColegiatura,
            AnioColegiatura = pagoDto.AnioColegiatura,
            Notas = pagoDto.Notas,
            ImagenesPago = new List<PagoImagen>()
        };

        if (pagoDto.ImagenesPago is { Count: > 0 })
        {
            foreach (var formFile in pagoDto.ImagenesPago)
            {
                // Correct way to get the stream from IFormFile:
                await using var stream = formFile.OpenReadStream();
                var fileName = $"pago_{Guid.NewGuid()}{Path.GetExtension(formFile.FileName)}";
                var contentType = formFile.ContentType;

                var url = await _s3Service.UploadFileAsync(stream, fileName, contentType);
                pago.ImagenesPago.Add(new PagoImagen { ImagenUrl = new Uri(url) });
            }
        }

        await _pagoRepository.AddAsync(pago);

        return new PagoUploadDto
        {
            Id = pago.Id,
            CicloEscolar = pago.CicloEscolar,
            Fecha = pago.Fecha,
            Monto = pago.Monto,
            MedioPago = pago.MedioPago,
            Notas = pago.Notas,
            AlumnoId = pago.AlumnoId,
            RubroId = pago.RubroId
        };
    }
}
