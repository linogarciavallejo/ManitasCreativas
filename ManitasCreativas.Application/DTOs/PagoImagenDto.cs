namespace ManitasCreativas.Application.DTOs;

public class PagoImagenDto
{
    public int Id { get; set; }
    public int PagoId { get; set; }
    public string Url { get; set; } = string.Empty;
}