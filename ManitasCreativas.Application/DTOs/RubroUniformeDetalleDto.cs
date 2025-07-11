namespace ManitasCreativas.Application.DTOs;

public class RubroUniformeDetalleDto
{
    public int Id { get; set; }
    public int RubroId { get; set; }
    public int PrendaUniformeId { get; set; }

    // Navigation properties for display
    public string RubroDescripcion { get; set; } = string.Empty;
    public string PrendaUniformeDescripcion { get; set; } = string.Empty;
    public string PrendaUniformeSexo { get; set; } = string.Empty;
    public string PrendaUniformeTalla { get; set; } = string.Empty;
    public decimal PrendaUniformePrecio { get; set; }
    public string? PrendaUniformeImagenUrl { get; set; } = string.Empty;

    // Audit fields
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int UsuarioCreacionId { get; set; }
    public int? UsuarioActualizacionId { get; set; }
    public bool EsEliminado { get; set; } = false;
    public string? MotivoEliminacion { get; set; }
    public DateTime? FechaEliminacion { get; set; }
    public int? UsuarioEliminacionId { get; set; }
}
