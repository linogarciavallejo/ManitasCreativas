using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using System.Security.Claims;

public static class NivelEducativoEndpoints
{
    public static void MapNivelEducativoEndpoints(this WebApplication app)
    {
        app.MapGet("/niveleseducativos", async (INivelEducativoService nivelEducativoService) =>
        {
            return Results.Ok(await nivelEducativoService.GetAllNivelesEducativosAsync());
        });

        app.MapGet("/niveleseducativos/activos", async (INivelEducativoService nivelEducativoService) =>
        {
            return Results.Ok(await nivelEducativoService.GetAllActiveNivelesEducativosAsync());
        });

        app.MapGet("/niveleseducativos/{id}", async (int id, INivelEducativoService nivelEducativoService) =>
        {
            var nivelEducativo = await nivelEducativoService.GetNivelEducativoByIdAsync(id);
            return nivelEducativo is not null ? Results.Ok(nivelEducativo) : Results.NotFound();
        });

        app.MapPost("/niveleseducativos", async (NivelEducativoDto nivelEducativoDto, INivelEducativoService nivelEducativoService, HttpContext httpContext) =>
        {            
            await nivelEducativoService.AddNivelEducativoAsync(nivelEducativoDto);
            return Results.Created($"/niveleseducativos/{nivelEducativoDto.Id}", nivelEducativoDto);
        });

        app.MapPut("/niveleseducativos/{id}", async (int id, NivelEducativoDto nivelEducativoDto, INivelEducativoService nivelEducativoService, HttpContext httpContext) =>
        {
            nivelEducativoDto.Id = id;
                        
            await nivelEducativoService.UpdateNivelEducativoAsync(nivelEducativoDto);
            return Results.NoContent();
        });

        app.MapDelete("/niveleseducativos/{id}", async (int id, INivelEducativoService nivelEducativoService) =>
        {
            await nivelEducativoService.DeleteNivelEducativoAsync(id);
            return Results.NoContent();
        });
    }
}