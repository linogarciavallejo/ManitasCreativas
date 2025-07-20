using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;
using QRCoder;

namespace ManitasCreativas.Application.Services
{
    public class QRCodeService : IQRCodeService
    {
        private readonly ICodigosQRPagosRepository _qrCodeRepository;
        private readonly IPagoRepository _pagoRepository;

        public QRCodeService(
            ICodigosQRPagosRepository qrCodeRepository,
            IPagoRepository pagoRepository)
        {
            _qrCodeRepository = qrCodeRepository;
            _pagoRepository = pagoRepository;
        }

        public async Task<QRCodeGenerateResponseDto> GenerateQRCodeAsync(int pagoId, int expirationMinutes = 525600) // Default 1 year
        {
            Console.WriteLine($"[QRCodeService] GenerateQRCodeAsync called with pagoId: {pagoId}, expirationMinutes: {expirationMinutes}");
            
            // Verify that the payment exists
            var pago = await _pagoRepository.GetByIdAsync(pagoId);
            if (pago == null)
            {
                Console.WriteLine($"[QRCodeService] Payment with ID {pagoId} not found in database");
                throw new ArgumentException($"Payment with ID {pagoId} not found.");
            }

            Console.WriteLine($"[QRCodeService] Payment found: ID={pago.Id}, Amount={pago.Monto}, IsVoided={pago.EsAnulado}");

            // Check if payment is voided
            if (pago.EsAnulado)
            {
                Console.WriteLine($"[QRCodeService] Cannot generate QR code - payment {pagoId} is voided");
                throw new InvalidOperationException("Cannot generate QR code for a voided payment.");
            }

            // Check if QR code already exists for this payment
            var existingQR = await _qrCodeRepository.GetByPagoIdAsync(pagoId);
            Console.WriteLine($"[QRCodeService] Checking for existing QR codes for payment {pagoId}. Found: {existingQR.Count()}");
            
            if (existingQR.Any())
            {
                Console.WriteLine($"[QRCodeService] Returning existing QR code for payment {pagoId}");
                // Return existing QR code instead of creating a new one
                var existing = existingQR.First();
                var existingQrCodeImageBase64 = GenerateQRCodeImage(existing.TokenUnico.ToString());
                                // Generate existing payment info in Spanish
                var existingPagoInfo = $"ID de Pago: {pagoId} - Monto: Q{pago.Monto:N2}";

                return new QRCodeGenerateResponseDto
                {
                    TokenUnico = existing.TokenUnico,
                    QRCodeImageBase64 = existingQrCodeImageBase64,
                    FechaExpiracion = existing.FechaExpiracion,
                    PagoId = pagoId,
                    PagoInfo = existingPagoInfo
                };
            }

            Console.WriteLine($"[QRCodeService] Creating new QR code for payment {pagoId}");

            // Generate a unique token
            var tokenUnico = Guid.NewGuid();
            var fechaExpiracion = DateTime.UtcNow.AddMinutes(expirationMinutes); // 1 year by default

            Console.WriteLine($"[QRCodeService] Generated token: {tokenUnico}, Expiration: {fechaExpiracion}");

            // Create the QR code record
            var codigoQR = new CodigosQRPagos
            {
                TokenUnico = tokenUnico,
                FechaCreacion = DateTime.UtcNow,
                FechaExpiracion = fechaExpiracion,
                EstaUsado = false,
                PagoId = pagoId
            };

            // Save to database
            Console.WriteLine($"[QRCodeService] Saving QR code to database...");
            await _qrCodeRepository.AddAsync(codigoQR);
            Console.WriteLine($"[QRCodeService] QR code saved successfully");

            // Generate the QR code image
            var qrCodeImageBase64 = GenerateQRCodeImage(tokenUnico.ToString());
            Console.WriteLine($"[QRCodeService] QR code image generated, length: {qrCodeImageBase64.Length} characters");

            // Create payment info string in Spanish
            var pagoInfo = $"ID de Pago: {pagoId} - Monto: Q{pago.Monto:N2}";

            Console.WriteLine($"[QRCodeService] Returning QR code response for payment {pagoId}");
            return new QRCodeGenerateResponseDto
            {
                TokenUnico = tokenUnico,
                QRCodeImageBase64 = qrCodeImageBase64,
                FechaExpiracion = fechaExpiracion,
                PagoId = pagoId,
                PagoInfo = pagoInfo
            };
        }

        public async Task<QRCodeValidateResponseDto> ValidateQRCodeAsync(string token)
        {
            // Try to parse the token as a GUID
            if (!Guid.TryParse(token, out var tokenGuid))
            {
                return new QRCodeValidateResponseDto
                {
                    IsValid = false,
                    Message = "Invalid token format."
                };
            }

            // Find the QR code record
            var codigoQR = await _qrCodeRepository.GetByTokenUnicoAsync(tokenGuid);
            if (codigoQR == null)
            {
                return new QRCodeValidateResponseDto
                {
                    IsValid = false,
                    Message = "QR Code not found."
                };
            }

            // Check if already used
            if (codigoQR.EstaUsado)
            {
                return new QRCodeValidateResponseDto
                {
                    IsValid = false,
                    Message = "QR Code has already been used."
                };
            }

            // Check if expired
            if (codigoQR.FechaExpiracion < DateTime.UtcNow)
            {
                return new QRCodeValidateResponseDto
                {
                    IsValid = false,
                    Message = "QR Code has expired."
                };
            }

            // Check if the associated payment is voided
            if (codigoQR.Pago?.EsAnulado == true)
            {
                return new QRCodeValidateResponseDto
                {
                    IsValid = false,
                    Message = "⚠️ PAGO ANULADO - Este pago ha sido cancelado/anulado y ya no es válido.",
                    PagoId = codigoQR.PagoId,
                    AlumnoNombre = $"{codigoQR.Pago?.Alumno?.PrimerNombre} {codigoQR.Pago?.Alumno?.PrimerApellido}",
                    RubroDescripcion = codigoQR.Pago?.Rubro?.Descripcion,
                    MontosPago = codigoQR.Pago?.Monto,
                    FechaPago = codigoQR.Pago?.Fecha
                };
            }

            // Mark as used
            codigoQR.EstaUsado = true;
            await _qrCodeRepository.UpdateAsync(codigoQR);

            // Return successful validation with payment information
            return new QRCodeValidateResponseDto
            {
                IsValid = true,
                Message = "QR Code validation successful!",
                PagoId = codigoQR.PagoId,
                AlumnoNombre = $"{codigoQR.Pago?.Alumno?.PrimerNombre} {codigoQR.Pago?.Alumno?.PrimerApellido}",
                RubroDescripcion = codigoQR.Pago?.Rubro?.Descripcion,
                MontosPago = codigoQR.Pago?.Monto,
                FechaPago = codigoQR.Pago?.Fecha
            };
        }

        public async Task<QRCodeInfoDto?> GetQRCodeInfoAsync(string token)
        {
            if (!Guid.TryParse(token, out var tokenGuid))
            {
                return null;
            }

            var codigoQR = await _qrCodeRepository.GetByTokenUnicoAsync(tokenGuid);
            if (codigoQR == null)
            {
                return null;
            }

            return new QRCodeInfoDto
            {
                Id = codigoQR.Id,
                TokenUnico = codigoQR.TokenUnico,
                FechaCreacion = codigoQR.FechaCreacion,
                FechaExpiracion = codigoQR.FechaExpiracion,
                EstaUsado = codigoQR.EstaUsado,
                PagoId = codigoQR.PagoId,
                AlumnoNombre = $"{codigoQR.Pago?.Alumno?.PrimerNombre} {codigoQR.Pago?.Alumno?.PrimerApellido}",
                RubroDescripcion = codigoQR.Pago?.Rubro?.Descripcion ?? "N/A",
                MontoPago = codigoQR.Pago?.Monto ?? 0,
                FechaPago = codigoQR.Pago?.Fecha ?? DateTime.MinValue
            };
        }

        public async Task<IEnumerable<QRCodeInfoDto>> GetQRCodesByPagoIdAsync(int pagoId)
        {
            var codigosQR = await _qrCodeRepository.GetByPagoIdAsync(pagoId);

            return codigosQR.Select(qr => new QRCodeInfoDto
            {
                Id = qr.Id,
                TokenUnico = qr.TokenUnico,
                FechaCreacion = qr.FechaCreacion,
                FechaExpiracion = qr.FechaExpiracion,
                EstaUsado = qr.EstaUsado,
                PagoId = qr.PagoId,
                AlumnoNombre = $"{qr.Pago?.Alumno?.PrimerNombre} {qr.Pago?.Alumno?.PrimerApellido}",
                RubroDescripcion = qr.Pago?.Rubro?.Descripcion ?? "N/A",
                MontoPago = qr.Pago?.Monto ?? 0,
                FechaPago = qr.Pago?.Fecha ?? DateTime.MinValue
            });
        }

        public async Task<int> CleanupExpiredQRCodesAsync()
        {
            var expiredCodes = await _qrCodeRepository.GetExpiredAsync();
            var count = 0;

            foreach (var expiredCode in expiredCodes)
            {
                await _qrCodeRepository.DeleteAsync(expiredCode.Id);
                count++;
            }

            return count;
        }

        private string GenerateQRCodeImage(string data)
        {
            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            var qrCodeImageBytes = qrCode.GetGraphic(20);

            return $"data:image/png;base64,{Convert.ToBase64String(qrCodeImageBytes)}";
        }
    }
}
