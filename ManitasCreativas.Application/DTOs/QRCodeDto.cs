namespace ManitasCreativas.Application.DTOs
{
    public class QRCodeGenerateRequestDto
    {
        public int PagoId { get; set; }
        public int ExpirationMinutes { get; set; } = 525600; // Default 1 year (365 * 24 * 60)
    }

    public class QRCodeGenerateResponseDto
    {
        public Guid TokenUnico { get; set; }
        public string QRCodeImageBase64 { get; set; } = string.Empty;
        public DateTime FechaExpiracion { get; set; }
        public int PagoId { get; set; }
        public string PagoInfo { get; set; } = string.Empty; // Brief payment description
    }

    public class QRCodeValidateRequestDto
    {
        public string Token { get; set; } = string.Empty;
    }

    public class QRCodeValidateResponseDto
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? PagoId { get; set; }
        public string? AlumnoNombre { get; set; }
        public string? RubroDescripcion { get; set; }
        public decimal? MontosPago { get; set; }
        public DateTime? FechaPago { get; set; }
    }

    public class QRCodeInfoDto
    {
        public int Id { get; set; }
        public Guid TokenUnico { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaExpiracion { get; set; }
        public bool EstaUsado { get; set; }
        public int PagoId { get; set; }
        public string AlumnoNombre { get; set; } = string.Empty;
        public string RubroDescripcion { get; set; } = string.Empty;
        public decimal MontoPago { get; set; }
        public DateTime FechaPago { get; set; }
    }
}
