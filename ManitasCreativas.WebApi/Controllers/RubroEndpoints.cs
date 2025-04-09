using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;

public static class RubroEndpoints
{
    public static void MapRubroEndpoints(this WebApplication app)
    {
        app.MapGet("/rubros", async (IRubroService rubroService) =>
        {
            return Results.Ok(await rubroService.GetAllRubrosAsync());
        });

        app.MapGet("/rubros/{id}", async (int id, IRubroService rubroService) =>
        {
            var rubro = await rubroService.GetRubroByIdAsync(id);
            return rubro is not null ? Results.Ok(rubro) : Results.NotFound();
        });

        app.MapPost("/rubros", async (RubroDto rubroDto, IRubroService rubroService) =>
        {
            await rubroService.AddRubroAsync(rubroDto);
            return Results.Created($"/rubros/{rubroDto.Id}", rubroDto);
        });

        app.MapPut("/rubros/{id}", async (int id, RubroDto rubroDto, IRubroService rubroService) =>
        {
            rubroDto.Id = id;
            await rubroService.UpdateRubroAsync(rubroDto);
            return Results.NoContent();
        });

        app.MapDelete("/rubros/{id}", async (int id, IRubroService rubroService) =>
        {
            await rubroService.DeleteRubroAsync(id);
            return Results.NoContent();
        });

        app.MapGet("/rubrosactivos", async (IRubroService rubroService) =>
        {
            return Results.Ok(await rubroService.GetAllRubrosAsync());
        });

    }
}
