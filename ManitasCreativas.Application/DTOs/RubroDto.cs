namespace ManitasCreativas.Application.DTOs;

using ManitasCreativas.Domain.Enums;

public class RubroDto
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public int Tipo { get; set; }
    public string TipoDescripcion { get; set; } = string.Empty;
    public decimal? PenalizacionPorMoraMonto { get; set; }
    public decimal? PenalizacionPorMoraPorcentaje { get; set; }
    public DateTime? FechaLimitePagoAmarillo { get; set; }
    public DateTime? FechaLimitePagoRojo { get; set; }
    public bool EsColegiatura { get; set; }
    public int? DiaLimitePagoAmarillo { get; set; }
    public int? DiaLimitePagoRojo { get; set; }
    public int? MesLimitePago { get; set; }
    public int? NivelEducativoId { get; set; }
    public int? GradoId { get; set; }
    public decimal? MontoPreestablecido { get; set; }
    public DateTime? FechaInicioPromocion { get; set; }
    public DateTime? FechaFinPromocion { get; set; }
    public string? Notas { get; set; }
    public bool? Activo { get; set; } = true;
    public int? OrdenVisualizacionGrid { get; set; }
    public bool? EsPagoDeCarnet { get; set; }
    public string? EstadoCarnet { get; set; }
    
    // Audit fields
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int UsuarioCreacionId { get; set; }
    public int? UsuarioActualizacionId { get; set; }
}
