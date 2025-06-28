namespace ManitasCreativas.Application.DTOs;

public class EntradaUniformeCreateDto
{
    public DateTime FechaEntrada { get; set; }
    public string? Notas { get; set; }
    
    // Details for the entry
    public List<EntradaUniformeDetalleCreateDto> Detalles { get; set; } = new List<EntradaUniformeDetalleCreateDto>();
}
