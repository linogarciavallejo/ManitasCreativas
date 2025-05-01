namespace ManitasCreativas.Application.DTOs;

public class ContactoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? TelefonoTrabajo { get; set; } = string.Empty;
    public string? Celular { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string? Direccion { get; set; } = string.Empty;
    public int AlumnoId { get; set; }
    public string? Nit { get; set; } = string.Empty;
}
