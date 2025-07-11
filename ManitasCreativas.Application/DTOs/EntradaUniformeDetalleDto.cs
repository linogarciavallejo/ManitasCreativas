namespace ManitasCreativas.Application.DTOs;

public class EntradaUniformeDetalleDto
{
    public int Id { get; set; }
    public int EntradaUniformeId { get; set; }
    public int PrendaUniformeId { get; set; }
    public int Cantidad { get; set; }
    public decimal Subtotal { get; set; }

    // Navigation properties for display
    public string PrendaUniformeDescripcion { get; set; } = string.Empty;
    public string PrendaUniformeSexo { get; set; } = string.Empty;
    public string PrendaUniformeTalla { get; set; } = string.Empty;
    public decimal PrendaUniformePrecio { get; set; }
}
