namespace ManitasCreativas.Application.DTOs;

public class PagoDetalleCreateDto
{
    public int RubroUniformeDetalleId { get; set; }
    public decimal PrecioUnitario { get; set; }
    public int Cantidad { get; set; }
    public decimal Subtotal { get; set; }
}
