using System.Collections.Generic;

namespace ManitasCreativas.Application.DTOs;

public class PagoReportDto
{
    public int NumeroOrdinal { get; set; }
    public int AlumnoId { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Notas { get; set; } = string.Empty;
    public string Nit { get; set; } = string.Empty;
    public Dictionary<int, Dictionary<int, PagoReportItemDto>> PagosPorRubro { get; set; } = new();
}

public class PagoReportItemDto
{
    public int Id { get; set; }
    public decimal Monto { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? MesColegiatura { get; set; }
    public string Notas { get; set; } = string.Empty;
    public bool? EsPagoDeCarnet { get; set; } = false;
    public string EstadoCarnet { get; set; } = string.Empty;
    public bool? EsPagoDeTransporte { get; set; } = false;
}

public class PagoReportFilterDto
{
    public int CicloEscolar { get; set; }
    public int GradoId { get; set; }
}

public class PagoReportResponseDto
{
    public List<PagoReportDto> Alumnos { get; set; } = new();
    public List<RubroReportDto> Rubros { get; set; } = new();
}

public class RubroReportDto
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public int OrdenVisualizacionGrid { get; set; }
    public bool EsColegiatura { get; set; }
}
