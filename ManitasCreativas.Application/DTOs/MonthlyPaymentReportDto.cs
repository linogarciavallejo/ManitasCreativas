namespace ManitasCreativas.Application.DTOs;

/// <summary>
/// DTO for monthly payment report filters
/// </summary>
public class MonthlyPaymentReportFilterDto
{
    public int CicloEscolar { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public int? GradoId { get; set; } // Optional filter by grade
    public string? Seccion { get; set; } // Optional filter by section
    public int? RubroId { get; set; } // Optional filter by rubro
}

/// <summary>
/// DTO for individual payment data in the monthly report
/// </summary>
public class MonthlyPaymentItemDto
{
    public int Id { get; set; }
    public decimal Monto { get; set; }
    public DateTime Fecha { get; set; }
    public int CicloEscolar { get; set; }
    public string MedioPago { get; set; } = string.Empty;
    public string RubroDescripcion { get; set; } = string.Empty;
    public string TipoRubro { get; set; } = string.Empty;
    public bool EsColegiatura { get; set; }
    public int? MesColegiatura { get; set; }
    public int? AnioColegiatura { get; set; }
    public string Notas { get; set; } = string.Empty;
    
    // Student information
    public int AlumnoId { get; set; }
    public string AlumnoNombre { get; set; } = string.Empty;
    public string GradoNombre { get; set; } = string.Empty;
    public string Seccion { get; set; } = string.Empty;
    public string NivelEducativo { get; set; } = string.Empty;
    
    // Payment status
    public bool EsAnulado { get; set; }
    public string? MotivoAnulacion { get; set; }
    public DateTime? FechaAnulacion { get; set; }
    public string UsuarioAnulacionNombre { get; set; } = string.Empty;
    
    // Week information for grouping
    public int WeekOfMonth { get; set; }
    public string WeekRange { get; set; } = string.Empty; // e.g., "Dec 1-7, 2024"
    
    // Day information
    public string DayOfWeek { get; set; } = string.Empty;
    public int DayOfMonth { get; set; }
    
    // Payment type categorization
    public string PaymentCategory { get; set; } = string.Empty; // "Active" or "Voided"
}

/// <summary>
/// Summary statistics for the monthly report
/// </summary>
public class MonthlyPaymentSummaryDto
{
    public decimal TotalAmount { get; set; }
    public decimal ActivePaymentsAmount { get; set; }
    public decimal VoidedPaymentsAmount { get; set; }
    public int TotalPayments { get; set; }
    public int ActivePayments { get; set; }
    public int VoidedPayments { get; set; }
    public Dictionary<string, decimal> AmountByGrado { get; set; } = new();
    public Dictionary<string, decimal> AmountByRubro { get; set; } = new();
    public Dictionary<string, decimal> AmountByWeek { get; set; } = new();
    public Dictionary<string, int> PaymentCountByGrado { get; set; } = new();
    public Dictionary<string, int> PaymentCountByRubro { get; set; } = new();
    public Dictionary<string, int> PaymentCountByWeek { get; set; } = new();
}

/// <summary>
/// Complete response for monthly payment report
/// </summary>
public class MonthlyPaymentReportResponseDto
{
    public MonthlyPaymentReportFilterDto Filter { get; set; } = new();
    public MonthlyPaymentSummaryDto Summary { get; set; } = new();
    public List<MonthlyPaymentItemDto> Payments { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string ReportTitle { get; set; } = string.Empty;
    public string ReportPeriod { get; set; } = string.Empty;
}
