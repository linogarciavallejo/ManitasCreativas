namespace ManitasCreativas.Application.DTOs;

public class PrendaUniformeDto
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string Sexo { get; set; } = string.Empty; // "M", "F", "Unisex"
    public string Talla { get; set; } = string.Empty; // (1, 2, 3, .... n) || (XXS, XS, ... XXXL)
    public decimal Precio { get; set; }
    public int ExistenciaInicial { get; set; }
    public int Entradas { get; set; }
    public int Salidas { get; set; }
    public string? Notas { get; set; }
    
    // Navigation properties
    public List<PrendaUniformeImagenDto> ImagenesPrenda { get; set; } = new List<PrendaUniformeImagenDto>();

    // Audit fields
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int UsuarioCreacionId { get; set; }
    public int? UsuarioActualizacionId { get; set; }
}
