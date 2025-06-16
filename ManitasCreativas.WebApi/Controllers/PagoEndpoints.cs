using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using Microsoft.AspNetCore.Http;

public static class PagoEndpoints
{
    public static void MapPagoEndpoints(this WebApplication app)
    {
        app.MapGet(
            "/pagos",
            async (
                int cicloEscolar,
                int rubroId,
                int gradoId,
                int month,
                IPagoService pagoService
            ) =>
            {
                var pagos = await pagoService.GetPagosByCriteriaAsync(
                    cicloEscolar,
                    rubroId,
                    gradoId,
                    month
                );
                return Results.Ok(pagos);
            }
        );

        app.MapPost(
            "/pagos",
            async (
                [Microsoft.AspNetCore.Mvc.FromForm] PagoUploadDto pagoDto,
                IPagoService pagoService
            ) =>
            {
                var nuevoPago = await pagoService.AddPagoAsync(pagoDto);
                return Results.Created($"/pagos/{nuevoPago.Id}", nuevoPago);
            }
        )
        .DisableAntiforgery();        // New endpoint for payment report
        app.MapGet(
            "/pagos/report",
            async (int cicloEscolar, int gradoId, IPagoService pagoService) =>
            {
                var filter = new PagoReportFilterDto
                {
                    CicloEscolar = cicloEscolar,
                    GradoId = gradoId
                };
                var report = await pagoService.GetPagoReportAsync(filter);
                return Results.Ok(report);
            }
        );

        // New endpoint for transport payment report
        app.MapGet(
            "/pagos/transport-report",
            async (int cicloEscolar, int rubroId, IPagoService pagoService) =>
            {
                var filter = new PagoTransporteReportFilterDto
                {
                    CicloEscolar = cicloEscolar,
                    RubroId = rubroId
                };
                var report = await pagoService.GetPagoTransporteReportAsync(filter);
                return Results.Ok(report);
            }
        );

        // New endpoint for retrieving payments for editing
        app.MapGet(
            "/pagos/edit",
            async (int cicloEscolar, int? gradoId, int? alumnoId, IPagoService pagoService) =>
            {
                var pagos = await pagoService.GetPagosForEditAsync(cicloEscolar, gradoId, alumnoId);
                return Results.Ok(pagos);
            }
        );

        // Endpoint for updating a payment
        app.MapPut(
            "/pagos/{id}",
            async (
                int id,
                [Microsoft.AspNetCore.Mvc.FromForm] PagoUploadDto pagoDto,
                IPagoService pagoService
            ) =>
            {
                try
                {
                    var updatedPago = await pagoService.UpdatePagoAsync(id, pagoDto);
                    return Results.Ok(updatedPago);
                }
                catch (ArgumentException ex)
                {
                    return Results.BadRequest(ex.Message);
                }
                catch (Exception)
                {
                    return Results.StatusCode(500);
                }
            }
        )
        .DisableAntiforgery();        // Endpoint for voiding a payment
        app.MapPost(
            "/pagos/{id}/void",
            async (int id, VoidPagoDto voidDto, IPagoService pagoService) =>
            {
                try
                {
                    var result = await pagoService.VoidPagoAsync(id, voidDto.MotivoAnulacion, voidDto.UsuarioAnulacionId);
                    return Results.Ok(result);
                }
                catch (ArgumentException ex)
                {
                    return Results.BadRequest(ex.Message);
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(ex.Message);
                }
                catch (Exception)
                {
                    return Results.StatusCode(500);
                }
            }
        );

        // Endpoint for removing a single payment image (soft deletion)
        app.MapDelete(
            "/pagos/images/{imagenId}",
            async (int imagenId, IPagoService pagoService) =>
            {
                try
                {
                    var result = await pagoService.RemovePagoImagenAsync(imagenId);
                    if (result)
                    {
                        return Results.Ok(new { message = "Image archived successfully", imagenId });
                    }
                    else
                    {
                        return Results.BadRequest("Failed to archive image");
                    }
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(ex.Message);
                }
            }
        );        
        
        // Endpoint for removing multiple payment images (soft deletion)
        app.MapDelete(
            "/pagos/images",
            async ([Microsoft.AspNetCore.Mvc.FromBody] List<int> imagenesIds, IPagoService pagoService) =>
            {
                try
                {
                    if (imagenesIds == null || !imagenesIds.Any())
                    {
                        return Results.BadRequest("No image IDs provided");
                    }

                    var result = await pagoService.RemoveMultiplePagoImagenesAsync(imagenesIds);
                    if (result)
                    {
                        return Results.Ok(new { message = "All images archived successfully", count = imagenesIds.Count });
                    }
                    else
                    {
                        return Results.BadRequest("Some images failed to archive");
                    }
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(ex.Message);
                }
            }
        );

        // Endpoint for monthly payment report
        app.MapGet(
            "/pagos/monthly-report",
            async (
                int cicloEscolar,
                int month,
                int year,
                int? gradoId,
                string? seccion,
                int? rubroId,
                IPagoService pagoService
            ) =>
            {
                try
                {
                    var filter = new MonthlyPaymentReportFilterDto
                    {
                        CicloEscolar = cicloEscolar,
                        Month = month,
                        Year = year,
                        GradoId = gradoId,
                        Seccion = seccion,
                        RubroId = rubroId
                    };
                    
                    var report = await pagoService.GetMonthlyPaymentReportAsync(filter);
                    return Results.Ok(report);
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(ex.Message);
                }
            }
        );
    }
}

// DTO for void payment request (to be moved to a proper DTO file)
public class VoidPagoDto
{
    public required string MotivoAnulacion { get; set; }
    public int UsuarioAnulacionId { get; set; }
}