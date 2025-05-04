namespace ManitasCreativas.Application.DTOs;

public class AlumnoDto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string PrimerNombre { get; set; } = string.Empty;
    public string SegundoNombre { get; set; } = string.Empty;
    public string PrimerApellido { get; set; } = string.Empty;
    public string SegundoApellido { get; set; } = string.Empty;
    public int SedeId { get; set; }
    public string SedeNombre { get; set; } = string.Empty;
    public int GradoId { get; set; }
    public string GradoNombre { get; set; } = string.Empty;
    public string? Seccion { get; set; }
    public bool? Becado { get; set; }
    public decimal? BecaParcialPorcentaje { get; set; }
    public int Estado { get; set; } = 1; // Default to Activo (1)
    public List<PagoReadDto> Pagos { get; set; } = new();
    public List<AlumnoContactoDto> Contactos { get; set; } = new();
    
    // Audit fields
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public string UsuarioCreacion { get; set; } = string.Empty;
    public string? UsuarioActualizacion { get; set; }
}
