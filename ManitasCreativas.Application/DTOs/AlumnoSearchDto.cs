namespace ManitasCreativas.Application.DTOs;

public class AlumnoSearchDto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string PrimerNombre { get; set; } = string.Empty;
    public string SegundoNombre { get; set; } = string.Empty;
    public string TercerNombre { get; set; } = string.Empty;
    public string PrimerApellido { get; set; } = string.Empty;
    public string SegundoApellido { get; set; } = string.Empty;
    public string Grado { get; set; } = string.Empty;
    public string Seccion { get; set; } = string.Empty;
    public string Sede { get; set; } = string.Empty;
    public string Value => Id.ToString();
    public string Label => $"{PrimerApellido} {SegundoApellido}, {PrimerNombre} {SegundoNombre} {TercerNombre}".Trim();
}
