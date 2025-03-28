using ManitasCreativas.Domain.Enums;

namespace ManitasCreativas.Application.DTOs;

public class PagoDto
{
    public int Id { get; set; }
    public decimal Monto { get; set; }
    public DateTime Fecha { get; set; }
    public int CicloEscolar { get; set; } // Added property to fix CS0117
    public MedioPago MedioPago { get; internal set; }
    public object RubroNombre { get; internal set; }
    public List<PagoImagenDto> ImagenesPago { get; set; } // Add this property
}
