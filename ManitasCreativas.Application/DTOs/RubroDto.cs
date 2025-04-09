namespace ManitasCreativas.Application.DTOs;

using ManitasCreativas.Domain.Enums;

public class RubroDto
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public TipoRubro Tipo { get; set; }
    public decimal? PenalizacionPorMora { get; set; }
    public DateTime? FechaLimitePago { get; set; }
    public int? MesColegiatura { get; set; }
    public int? DiaLimitePago { get; set; }
    public int? MesLimitePago { get; set; }
    public decimal? MontoPreestablecido { get; set; }
    public bool? Activo { get; set; } = true;
}
