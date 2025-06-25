namespace ManitasCreativas.Application.DTOs;

public class AlumnoRutaDto
{
    public int AlumnoId { get; set; }
    public int RubroTransporteId { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
}