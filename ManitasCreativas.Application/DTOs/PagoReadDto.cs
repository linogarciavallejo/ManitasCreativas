using ManitasCreativas.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace ManitasCreativas.Application.DTOs;

public class PagoReadDto
{
    public int Id { get; set; }
    public decimal Monto { get; set; }
    public DateTime Fecha { get; set; }
    public int CicloEscolar { get; set; }
    public string MedioPagoDescripcion { get; set; } = string.Empty;
    public MedioPago MedioPago { get; set; }
    public int RubroId { get; set; }
    public string RubroDescripcion { get; set; } = string.Empty;
    public string TipoRubroDescripcion { get; set; } = string.Empty;
    public TipoRubro TipoRubro { get; set; }
    public bool EsColegiatura { get; set; }
    public int? MesColegiatura { get; set; }
    public int? AnioColegiatura { get; set; }
    public string Notas { get; set; } = string.Empty;
    public List<PagoImagenDto> ImagenesPago { get; set; } = new List<PagoImagenDto>();
    public decimal? MontoPreestablecido { get; set; }
    public decimal? PenalizacionPorMora { get; set; }
    public int? UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
}
