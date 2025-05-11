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
    }
}