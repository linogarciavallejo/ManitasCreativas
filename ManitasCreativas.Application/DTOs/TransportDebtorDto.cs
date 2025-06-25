using System.ComponentModel.DataAnnotations;

namespace ManitasCreativas.Application.DTOs
{
    public class TransportDebtorDto
    {
        public int AlumnoId { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string NivelEducativo { get; set; } = string.Empty;
        public string Grado { get; set; } = string.Empty;
        public string Seccion { get; set; } = string.Empty;
        public string Sede { get; set; } = string.Empty;
        public string RubroTransporte { get; set; } = string.Empty;
        public List<UnpaidTransportDto> UnpaidTransports { get; set; } = new();
        public decimal TotalDebt { get; set; }
        public int MonthsBehind { get; set; }
        public DateTime LastPaymentDate { get; set; }
        public bool IsCurrentMonthOverdue { get; set; }
    }

    public class UnpaidTransportDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public int DaysPastDue { get; set; }
        public string RubroNombre { get; set; } = string.Empty;
    }

    public class TransportDebtorsReportDto
    {
        public DateTime ReportDate { get; set; }
        public DateTime AsOfDate { get; set; }
        public int TotalStudents { get; set; }
        public int StudentsInDebt { get; set; }
        public decimal TotalDebtAmount { get; set; }
        public List<TransportDebtorDto> Debtors { get; set; } = new();
        public TransportDebtorsSummaryDto Summary { get; set; } = new();
    }

    public class TransportDebtorsSummaryDto
    {
        public int CurrentMonthDelinquent { get; set; }
        public int OneMonthBehind { get; set; }
        public int TwoMonthsBehind { get; set; }
        public int ThreeOrMoreMonthsBehind { get; set; }
        public decimal AverageDebtPerStudent { get; set; }
        public Dictionary<string, int> DebtorsByGrade { get; set; } = new();
        public Dictionary<string, int> DebtorsBySede { get; set; } = new();
        public Dictionary<string, int> DebtorsByRoute { get; set; } = new();
    }

    public class TransportDebtorsFilterDto
    {
        public int? Year { get; set; }
        public int? Month { get; set; }
        public int? SedeId { get; set; }
        public int? NivelEducativoId { get; set; }
        public int? GradoId { get; set; }
        public string? Seccion { get; set; }
        public int? RubroId { get; set; } // Transport route filter
        public bool IncludeCurrentMonth { get; set; } = true;
        public int? MinMonthsBehind { get; set; }
        public decimal? MinDebtAmount { get; set; }
    }
}
