namespace ManitasCreativas.Application.DTOs;

public class EntradaUniformeDto
{
    public int Id { get; set; }
    public DateTime FechaEntrada { get; set; }
    public int UsuarioCreacionId { get; set; }
    public DateTime FechaCreacion { get; set; }
    public string? Notas { get; set; }
    public decimal Total { get; set; }

    // Navigation properties
    public List<EntradaUniformeDetalleDto> EntradaUniformeDetalles { get; set; } = new List<EntradaUniformeDetalleDto>();

    // Audit fields
    public DateTime? FechaActualizacion { get; set; }
    public int? UsuarioActualizacionId { get; set; }
    public bool EsEliminado { get; set; } = false;
    public string? MotivoEliminacion { get; set; }
    public DateTime? FechaEliminacion { get; set; }
    public int? UsuarioEliminacionId { get; set; }
}
