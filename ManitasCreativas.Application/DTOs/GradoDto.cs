namespace ManitasCreativas.Application.DTOs;

public class GradoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int NivelEducativoId { get; set; }
    public string NivelEducativoNombre { get; set; } = string.Empty;
}