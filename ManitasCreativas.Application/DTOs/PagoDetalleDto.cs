namespace ManitasCreativas.Application.DTOs;

public class PagoDetalleDto
{
    public int Id { get; set; }
    public int PagoId { get; set; }
    public int RubroUniformeDetalleId { get; set; }
    public decimal PrecioUnitario { get; set; }
    public int Cantidad { get; set; }
    public decimal Subtotal { get; set; }

    // Navigation properties for display
    public string RubroDescripcion { get; set; } = string.Empty;
    public string PrendaUniformeDescripcion { get; set; } = string.Empty;
    public string PrendaUniformeSexo { get; set; } = string.Empty;
    public string PrendaUniformeTalla { get; set; } = string.Empty;
}
