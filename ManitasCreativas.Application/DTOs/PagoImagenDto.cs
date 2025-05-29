namespace ManitasCreativas.Application.DTOs;

public class PagoImagenDto
{
    public int Id { get; set; }
    public int PagoId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Base64Content { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    
    // Audit fields
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int UsuarioCreacionId { get; set; }
    public int? UsuarioActualizacionId { get; set; }

    public bool? EsImagenEliminada { get; set; } = false;

}