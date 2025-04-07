using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using Microsoft.AspNetCore.Antiforgery;

public static class PagoEndpoints
{
    public static void MapPagoEndpoints(this WebApplication app)
    {
        app.MapGet("/pagos", async (int cicloEscolar, int rubroId, int gradoId, int month, IPagoService pagoService) =>
        {
            var pagos = await pagoService.GetPagosByCriteriaAsync(cicloEscolar, rubroId, gradoId, month);
            return Results.Ok(pagos);
        });

        app.MapGet("/antiforgery-token", (IAntiforgery antiforgery, HttpContext context) =>
        {
            var tokens = antiforgery.GetAndStoreTokens(context);
            return Results.Ok(new { token = tokens.RequestToken });
        });

        app.MapPost("/pagos", async (HttpContext context, [Microsoft.AspNetCore.Mvc.FromForm] PagoDto pagoDto, IPagoService pagoService, IAntiforgery antiforgery) =>
        {
            var tokens = antiforgery.GetAndStoreTokens(context);
            if (!antiforgery.IsRequestValidAsync(context).Result)
            {
                return Results.BadRequest("Invalid anti-forgery token.");
            }

            var nuevoPago = await pagoService.AddPagoAsync(pagoDto);
            return Results.Created($"/pagos/{nuevoPago.Id}", nuevoPago);
        });
    }
}