using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Services;

namespace ManitasCreativas.WebApi.Controllers
{
    public static class QRCodeEndpoints
    {
        public static void MapQRCodeEndpoints(this WebApplication app)
        {
            var qrCodeGroup = app.MapGroup("/api/qrcode")
                .WithTags("QR Codes")
                .WithOpenApi();

            // Generate QR Code for a payment
            qrCodeGroup.MapPost("/generate", async (
                QRCodeGenerateRequestDto request,
                IQRCodeService qrCodeService) =>
            {
                Console.WriteLine($"[QRCodeEndpoints] POST /generate called with PagoId: {request.PagoId}, ExpirationMinutes: {request.ExpirationMinutes}");
                try
                {
                    var result = await qrCodeService.GenerateQRCodeAsync(request.PagoId, request.ExpirationMinutes);
                    Console.WriteLine($"[QRCodeEndpoints] QR code generated successfully for payment {request.PagoId}");
                    return Results.Ok(result);
                }
                catch (ArgumentException ex)
                {
                    Console.WriteLine($"[QRCodeEndpoints] ArgumentException: {ex.Message}");
                    return Results.NotFound(new { message = ex.Message });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[QRCodeEndpoints] Unexpected error: {ex.Message}");
                    Console.WriteLine($"[QRCodeEndpoints] Stack trace: {ex.StackTrace}");
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error generating QR code");
                }
            })
            .WithName("GenerateQRCode")
            .WithSummary("Generate QR Code for Payment")
            .WithDescription("Generates a QR code for a specific payment with configurable expiration time")
            .Produces<QRCodeGenerateResponseDto>()
            .ProducesValidationProblem()
            .Produces(404)
            .Produces(500);

            // Validate QR Code
            qrCodeGroup.MapPost("/validate", async (
                QRCodeValidateRequestDto request,
                IQRCodeService qrCodeService) =>
            {
                try
                {
                    var result = await qrCodeService.ValidateQRCodeAsync(request.Token);
                    
                    if (result.IsValid)
                    {
                        return Results.Ok(result);
                    }
                    else
                    {
                        return Results.BadRequest(result);
                    }
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error validating QR code");
                }
            })
            .WithName("ValidateQRCode")
            .WithSummary("Validate QR Code")
            .WithDescription("Validates a QR code token and marks it as used if valid")
            .Produces<QRCodeValidateResponseDto>()
            .Produces<QRCodeValidateResponseDto>(400)
            .Produces(500);

            // Get QR Code information
            qrCodeGroup.MapGet("/info/{token}", async (
                string token,
                IQRCodeService qrCodeService) =>
            {
                try
                {
                    var qrCodeInfo = await qrCodeService.GetQRCodeInfoAsync(token);
                    
                    if (qrCodeInfo == null)
                    {
                        return Results.NotFound(new { message = "QR Code not found" });
                    }

                    return Results.Ok(qrCodeInfo);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error retrieving QR code information");
                }
            })
            .WithName("GetQRCodeInfo")
            .WithSummary("Get QR Code Information")
            .WithDescription("Retrieves information about a QR code by its token")
            .Produces<QRCodeInfoDto>()
            .Produces(404)
            .Produces(500);

            // Get QR Codes by payment ID
            qrCodeGroup.MapGet("/payment/{pagoId:int}", async (
                int pagoId,
                IQRCodeService qrCodeService) =>
            {
                Console.WriteLine($"[QRCodeEndpoints] GET /payment/{pagoId} called");
                try
                {
                    var qrCodes = await qrCodeService.GetQRCodesByPagoIdAsync(pagoId);
                    Console.WriteLine($"[QRCodeEndpoints] Found {qrCodes.Count()} QR codes for payment {pagoId}");
                    return Results.Ok(qrCodes);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[QRCodeEndpoints] Error getting QR codes for payment {pagoId}: {ex.Message}");
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error retrieving QR codes for payment");
                }
            })
            .WithName("GetQRCodesByPayment")
            .WithSummary("Get QR Codes by Payment")
            .WithDescription("Retrieves all QR codes associated with a specific payment")
            .Produces<IEnumerable<QRCodeInfoDto>>()
            .Produces(500);

            // Cleanup expired QR codes
            qrCodeGroup.MapDelete("/cleanup", async (IQRCodeService qrCodeService) =>
            {
                try
                {
                    var removedCount = await qrCodeService.CleanupExpiredQRCodesAsync();
                    return Results.Ok(new { message = $"Removed {removedCount} expired QR codes" });
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error cleaning up expired QR codes");
                }
            })
            .WithName("CleanupExpiredQRCodes")
            .WithSummary("Cleanup Expired QR Codes")
            .WithDescription("Removes all expired QR codes from the database")
            .Produces<object>()
            .Produces(500);
        }
    }
}
