using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using System.Security.Claims;

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

        app.MapPost("/rubros", async (RubroDto rubroDto, IRubroService rubroService, HttpContext httpContext) =>
        {
            // Set audit fields for creation with UTC dates
            rubroDto.FechaCreacion = DateTime.UtcNow;
            rubroDto.UsuarioCreacion = httpContext.User?.FindFirstValue(ClaimTypes.Name) ?? "system";
            
            await rubroService.AddRubroAsync(rubroDto);
            return Results.Created($"/rubros/{rubroDto.Id}", rubroDto);
        });

        app.MapPut("/rubros/{id}", async (int id, RubroDto rubroDto, IRubroService rubroService, HttpContext httpContext) =>
        {
            rubroDto.Id = id;
            
            // Set audit fields for update with UTC dates
            rubroDto.FechaActualizacion = DateTime.UtcNow;
            rubroDto.UsuarioActualizacion = httpContext.User?.FindFirstValue(ClaimTypes.Name) ?? "system";
            
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
            // Fixed to call GetAllActiveRubrosAsync instead of GetAllRubrosAsync
            return Results.Ok(await rubroService.GetAllActiveRubrosAsync());
        });
    }
}
