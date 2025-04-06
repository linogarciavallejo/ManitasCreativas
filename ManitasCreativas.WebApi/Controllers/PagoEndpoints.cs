using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;

public static class PagoEndpoints
{
    public static void MapPagoEndpoints(this WebApplication app)
    {
        app.MapGet("/pagos", async (int cicloEscolar, int rubroId, int gradoId, int month, IPagoService pagoService) =>
        {
            var pagos = await pagoService.GetPagosByCriteriaAsync(cicloEscolar, rubroId, gradoId, month);
            return Results.Ok(pagos);
        });

        app.MapPost("/pagos", async (PagoDto pagoDto, IPagoService pagoService) =>
        {
            var nuevoPago = await pagoService.AddPagoAsync(pagoDto);
            return Results.Created($"/pagos/{nuevoPago.Id}", nuevoPago);
        });
    }
}