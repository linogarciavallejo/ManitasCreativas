namespace ManitasCreativas.Application.DTOs;

public class PrendaUniformeSimpleDto
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string Sexo { get; set; } = string.Empty;
    public string Talla { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int ExistenciaActual => ExistenciaInicial + Entradas - Salidas;
    public int ExistenciaInicial { get; set; }
    public int Entradas { get; set; }
    public int Salidas { get; set; }
    public bool EsEliminado { get; set; } = false;
}
