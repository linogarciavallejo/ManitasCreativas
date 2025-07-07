namespace ManitasCreativas.Application.DTOs;

public class UsuarioDto
{
    public int Id { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string CodigoUsuario { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Celular { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string EstadoUsuario { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public bool EsAdmin { get; set; }
}