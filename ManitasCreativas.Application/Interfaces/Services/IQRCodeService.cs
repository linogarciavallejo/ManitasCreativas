using ManitasCreativas.Application.DTOs;

namespace ManitasCreativas.Application.Interfaces.Services
{
    public interface IQRCodeService
    {
        /// <summary>
        /// Generates a QR code for a specific payment
        /// </summary>
        /// <param name="pagoId">The ID of the payment</param>
        /// <param name="expirationMinutes">QR code expiration time in minutes (default: 5)</param>
        /// <returns>QR code generation response with the base64 image</returns>
        Task<QRCodeGenerateResponseDto> GenerateQRCodeAsync(int pagoId, int expirationMinutes = 5);

        /// <summary>
        /// Validates a QR code token
        /// </summary>
        /// <param name="token">The token from the scanned QR code</param>
        /// <returns>Validation result with payment information if valid</returns>
        Task<QRCodeValidateResponseDto> ValidateQRCodeAsync(string token);

        /// <summary>
        /// Gets QR code information by token
        /// </summary>
        /// <param name="token">The unique token</param>
        /// <returns>QR code information</returns>
        Task<QRCodeInfoDto?> GetQRCodeInfoAsync(string token);

        /// <summary>
        /// Gets all QR codes for a specific payment
        /// </summary>
        /// <param name="pagoId">The payment ID</param>
        /// <returns>List of QR codes for the payment</returns>
        Task<IEnumerable<QRCodeInfoDto>> GetQRCodesByPagoIdAsync(int pagoId);

        /// <summary>
        /// Cleans up expired QR codes
        /// </summary>
        /// <returns>Number of expired QR codes removed</returns>
        Task<int> CleanupExpiredQRCodesAsync();
    }
}
