using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using Microsoft.AspNetCore.Http;
public static class PagoEndpoints
{
    public static void MapPagoEndpoints(this WebApplication app)
    {
        app.MapGet("/pagos", async (int cicloEscolar, int rubroId, int gradoId, int month, IPagoService pagoService) =>
        {
            var pagos = await pagoService.GetPagosByCriteriaAsync(cicloEscolar, rubroId, gradoId, month);
            return Results.Ok(pagos);
        });

        app.MapPost("/pagos", async ([Microsoft.AspNetCore.Mvc.FromForm] PagoUploadDto pagoDto, IPagoService pagoService) =>
        {
            var nuevoPago = await pagoService.AddPagoAsync(pagoDto);
            return Results.Created($"/pagos/{nuevoPago.Id}", nuevoPago);
        }).DisableAntiforgery();
        
        // New endpoint for payment report
        app.MapGet("/pagos/report", async (int cicloEscolar, int gradoId, IPagoService pagoService) =>
        {
            var filter = new PagoReportFilterDto 
            { 
                CicloEscolar = cicloEscolar, 
                GradoId = gradoId 
            };
            var report = await pagoService.GetPagoReportAsync(filter);
            return Results.Ok(report);
        });
        
        // New endpoint for retrieving payments for editing
        app.MapGet("/pagos/edit", async (int cicloEscolar, int? gradoId, int? alumnoId, IPagoService pagoService) =>
        {
            var pagos = await pagoService.GetPagosForEditAsync(cicloEscolar, gradoId, alumnoId);
            return Results.Ok(pagos);
        });
        
        // Endpoint for voiding a payment (to be implemented in future iterations)
        app.MapPost("/pagos/{id}/void", async (int id, VoidPagoDto voidDto, IPagoService pagoService) =>
        {
            // Placeholder for future implementation
            // var result = await pagoService.VoidPagoAsync(id, voidDto.MotivoAnulacion, voidDto.UsuarioAnulacionId);
            // return Results.Ok(result);
            
            // For now, return a not implemented response
            return Results.StatusCode(StatusCodes.Status501NotImplemented);
        });
    }
}

// DTO for void payment request (to be moved to a proper DTO file)
public class VoidPagoDto
{
    public string MotivoAnulacion { get; set; }
    public int UsuarioAnulacionId { get; set; }
}