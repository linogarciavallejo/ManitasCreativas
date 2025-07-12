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

    // Inventory fields
    public int PrendaUniformeExistenciaInicial { get; set; }
    public int PrendaUniformeEntradas { get; set; }
    public int PrendaUniformeSalidas { get; set; }

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
