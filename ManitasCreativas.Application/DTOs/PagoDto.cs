using ManitasCreativas.Domain.Enums;

namespace ManitasCreativas.Application.DTOs;

public class PagoDto
{
    public int Id { get; set; }
    public decimal Monto { get; set; }
    public DateTime Fecha { get; set; }
    public int CicloEscolar { get; set; }
    public MedioPago MedioPago { get; internal set; }
    public int RubroId { get; set; }
    public object RubroNombre { get; internal set; }
    public bool EsColegiatura { get; set; }
    public int MesColegiatura { get; set; }
    public int AnioColegiatura { get; set; }
    public int AlumnoId { get; set; }
    public string AlumnoNombre { get; set; }
    public string Notas { get; set; } = string.Empty;
    public List<PagoImagenDto> ImagenesPago { get; set; } // Add this property
}
