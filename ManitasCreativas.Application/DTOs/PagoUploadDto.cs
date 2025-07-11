using ManitasCreativas.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace ManitasCreativas.Application.DTOs;

public class PagoUploadDto
{
    public int Id { get; set; }
    public int AlumnoId { get; set; }
    public int RubroId { get; set; }
    public int CicloEscolar { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Monto { get; set; }
    public int MedioPago { get; set; } // Enum value
    public string? Notas { get; set; }
    public bool EsColegiatura { get; set; }
    public int MesColegiatura { get; set; }
    public int AnioColegiatura { get; set; }
    public List<string> ImageUrls { get; set; } = new List<string>();
    public IFormFileCollection? ImagenesPago { get; set; } // For file uploads from frontend
    public bool? EsPagoDeCarnet { get; set; } = false;
    public string EstadoCarnet { get; set; } = string.Empty;
    public bool? EsPagoDeTransporte { get; set; } = false;
    public bool? EsPagoDeUniforme { get; set; } = false;
    
    // Uniform payment details (only when EsPagoDeUniforme is true)
    public List<PagoDetalleCreateDto> PagoDetalles { get; set; } = new List<PagoDetalleCreateDto>();

    // Audit fields
    public int UsuarioCreacionId { get; set; }
    public int? UsuarioActualizacionId { get; set; }

    public bool EsAnulado { get; set; } = false;
    public string? MotivoAnulacion { get; set; } = string.Empty;
    public DateTime? FechaAnulacion { get; set; } = null;
    public int? UsuarioAnulacionId { get; set; } = null;
}
