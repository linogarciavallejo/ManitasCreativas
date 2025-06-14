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
    public List<PagoReportSeccionDto> Secciones { get; set; } = new();
    public List<RubroReportDto> Rubros { get; set; } = new();
}

public class PagoReportSeccionDto
{
    public string Seccion { get; set; } = string.Empty;
    public List<PagoReportDto> Alumnos { get; set; } = new();
}

public class RubroReportDto
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public int OrdenVisualizacionGrid { get; set; }
    public bool EsColegiatura { get; set; }
}

public class PagoTransporteReportFilterDto
{
    public int CicloEscolar { get; set; }
    public int RubroId { get; set; }
}

public class PagoTransporteReportDto
{
    public int NumeroOrdinal { get; set; }
    public int AlumnoId { get; set; }
    public string Alumno { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty; // Empty placeholder as requested
    public string Telefono { get; set; } = string.Empty;
    public string Encargado { get; set; } = string.Empty;
    public string Grado { get; set; } = string.Empty;
    public Dictionary<int, PagoReportItemDto> PagosPorMes { get; set; } = new(); // Key: month (1-12), Value: payment info
}

public class PagoTransporteReportResponseDto
{
    public List<PagoTransporteReportDto> Alumnos { get; set; } = new();
    public string RubroDescripcion { get; set; } = string.Empty;
    public int CicloEscolar { get; set; }
}
