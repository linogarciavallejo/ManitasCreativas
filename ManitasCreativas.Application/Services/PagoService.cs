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

    public async Task<IEnumerable<PagoDto>> GetPagosByCriteriaAsync(int cicloEscolar, int rubroId, int gradoId, int month)
    {
        var pagos = await _pagoRepository.GetAllAsync();

        return pagos
            .Where(p => p.CicloEscolar == cicloEscolar &&
                        p.RubroId == rubroId &&
                        p.Alumno.GradoId == gradoId &&
                        p.Fecha.Month == month)
            .Select(p => new PagoDto
            {
                Id = p.Id,
                Monto = p.Monto,
                Fecha = p.Fecha,
                CicloEscolar = p.CicloEscolar,
                MedioPago = p.MedioPago, // Fix: MedioPago is already of type MedioPago
                RubroNombre = p.Rubro.Descripcion,
                ImagenesPago = p.ImagenesPago.Select(pi => new PagoImagenDto
                {
                    Id = pi.Id,
                    PagoId = pi.PagoId,
                    Url = pi.ImagenUrl.ToString() // Fix: Convert Uri to string
                }).ToList()
            });
    }

    public async Task<PagoDto> AddPagoAsync(PagoDto pagoDto)
    {
        var pago = new Pago
        {
            CicloEscolar = pagoDto.CicloEscolar,
            Fecha = pagoDto.Fecha,
            Monto = pagoDto.Monto,
            MedioPago = pagoDto.MedioPago,
            Notas = pagoDto.Notas,
            AlumnoId = pagoDto.AlumnoId,
            RubroId = pagoDto.RubroId,
            ImagenesPago = new List<PagoImagen>()
        };

        if (pagoDto.ImagenesPago != null)
        {
            foreach (var imagen in pagoDto.ImagenesPago)
            {
                using (var stream = new MemoryStream(Convert.FromBase64String(imagen.Base64Content)))
                {
                    var url = await _s3Service.UploadFileAsync(stream, imagen.FileName, imagen.ContentType);
                    pago.ImagenesPago.Add(new PagoImagen { ImagenUrl = new Uri(url) });
                }
            }
        }

        await _pagoRepository.AddAsync(pago);

        return new PagoDto
        {
            Id = pago.Id,
            CicloEscolar = pago.CicloEscolar,
            Fecha = pago.Fecha,
            Monto = pago.Monto,
            MedioPago = pago.MedioPago,
            Notas = pago.Notas,
            AlumnoId = pago.AlumnoId,
            RubroId = pago.RubroId,
            ImagenesPago = pago.ImagenesPago.Select(pi => new PagoImagenDto
            {
                Id = pi.Id,
                PagoId = pi.PagoId,
                Url = pi.ImagenUrl.ToString()
            }).ToList()
        };
    }
}
