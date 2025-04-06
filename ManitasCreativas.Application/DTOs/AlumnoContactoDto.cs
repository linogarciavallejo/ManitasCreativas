namespace ManitasCreativas.Application.DTOs;

public class AlumnoContactoDto
{
    public int AlumnoId { get; set; }
    public int ContactoId { get; set; }
    public ContactoDto Contacto { get; set; } = new();
    public string Parentesco { get; set; } = string.Empty;

}