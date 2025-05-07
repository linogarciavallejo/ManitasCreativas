namespace ManitasCreativas.Application.DTOs;

using ManitasCreativas.Domain.Enums;

public class RubroDto
{
    public int Id { get; set; }
    public required string Descripcion { get; set; }
    public TipoRubro Tipo { get; set; }
    public decimal? PenalizacionPorMoraMonto { get; set; }
    public decimal? PenalizacionPorMoraPorcentaje { get; set; }
    public DateTime? FechaLimitePagoAmarillo { get; set; }
    public DateTime? FechaLimitePagoRojo { get; set; }
    public bool EsColegiatura { get; set; } = false;
    public int? DiaLimitePagoAmarillo { get; set; }
    public int? DiaLimitePagoRojo { get; set; }
    public int? MesLimitePago { get; set; }
    public int? NivelEducativoId { get; set; }
    public string? NivelEducativoNombre { get; set; } // Optional: Include the name of the NivelEducativo
    public int? GradoId { get; set; }
    public string? GradoNombre { get; set; } // Optional: Include the name of the Grado
    public decimal? MontoPreestablecido { get; set; }
    public DateTime? FechaInicioPromocion { get; set; }
    public DateTime? FechaFinPromocion { get; set; }
    public string? Notas { get; set; } = string.Empty;
    public bool? Activo { get; set; } = true;
    public int? OrdenVisualizacionGrid { get; set; }

    // Audit fields
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public string UsuarioCreacion { get; set; } = string.Empty;
    public string? UsuarioActualizacion { get; set; }
}
