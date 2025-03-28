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
    public bool? Becado { get; set; }
    public decimal? BecaParcialPorcentaje { get; set; }
    public List<PagoDto> Pagos { get; set; } = new();
}
