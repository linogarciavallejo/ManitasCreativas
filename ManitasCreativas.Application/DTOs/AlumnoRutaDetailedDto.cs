namespace ManitasCreativas.Application.DTOs;

public class AlumnoRutaDetailedDto
{
    public int Id { get; set; }
    public int AlumnoId { get; set; }
    public int RubroTransporteId { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string AlumnoNombre { get; set; } = string.Empty;
    public string AlumnoApellidos { get; set; } = string.Empty;
    public string AlumnoCompleto { get; set; } = string.Empty;
    public string Grado { get; set; } = string.Empty;
    public string Seccion { get; set; } = string.Empty;
    public string Sede { get; set; } = string.Empty;
}
