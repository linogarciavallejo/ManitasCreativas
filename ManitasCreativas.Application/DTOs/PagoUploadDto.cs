using ManitasCreativas.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace ManitasCreativas.Application.DTOs;

public class PagoUploadDto
{
    public int Id { get; set; } = 0;
    public DateTime Fecha { get; set; }
    public int CicloEscolar { get; set; }
    public decimal Monto { get; set; }
    public MedioPago MedioPago { get; internal set; }
    public int RubroId { get; set; }
    public int AlumnoId { get; set; }
    public bool EsColegiatura { get; set; }
    public int MesColegiatura { get; set; }
    public int AnioColegiatura { get; set; }
    public string Notas { get; set; } = string.Empty;
    public int UsuarioId { get; set; } = 0;
    public List<IFormFile>? ImagenesPago { get; set; } = new();
    
    // Audit fields
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public string UsuarioCreacion { get; set; } = string.Empty;
    public string? UsuarioActualizacion { get; set; }
}
