namespace ManitasCreativas.Application.DTOs;

public class PrendaUniformeCreateDto
{
    public string Descripcion { get; set; } = string.Empty;
    public string Sexo { get; set; } = string.Empty; // "M", "F", "Unisex"
    public string Talla { get; set; } = string.Empty; // (1, 2, 3, .... n) || (XXS, XS, ... XXXL)
    public decimal Precio { get; set; }
    public int ExistenciaInicial { get; set; }
    public string? Notas { get; set; }
    
    // Images to upload
    public List<PrendaUniformeImagenCreateDto> Imagenes { get; set; } = new List<PrendaUniformeImagenCreateDto>();
}
