namespace ManitasCreativas.Application.DTOs;

public class PrendaUniformeImagenDto
{
    public int Id { get; set; }
    public int PrendaUniformeId { get; set; }
    public string Imagen { get; set; } = string.Empty; // URL of the image
    public string Base64Content { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}
