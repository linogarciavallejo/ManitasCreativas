using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;

public static class SedeEndpoints
{
    public static void MapSedeEndpoints(this WebApplication app)
    {
        app.MapGet("/sedes", async (ISedeService sedeService) =>
        {
            return Results.Ok(await sedeService.GetAllSedesAsync());
        });

        app.MapGet("/sedes/{id}", async (int id, ISedeService sedeService) =>
        {
            var sede = await sedeService.GetSedeByIdAsync(id);
            return sede is not null ? Results.Ok(sede) : Results.NotFound();
        });

        app.MapPost("/sedes", async (SedeDto sedeDto, ISedeService sedeService) =>
        {
            await sedeService.AddSedeAsync(sedeDto);
            return Results.Created($"/sedes/{sedeDto.Id}", sedeDto);
        });

        app.MapPut("/sedes/{id}", async (int id, SedeDto sedeDto, ISedeService sedeService) =>
        {
            sedeDto.Id = id;
            await sedeService.UpdateSedeAsync(sedeDto);
            return Results.NoContent();
        });

        app.MapDelete("/sedes/{id}", async (int id, ISedeService sedeService) =>
        {
            await sedeService.DeleteSedeAsync(id);
            return Results.NoContent();
        });
    }
}