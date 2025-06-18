using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Services;

public static class AlumnoRutaEndpoints
{
    public static void MapAlumnoRutaEndpoints(this WebApplication app)
    {
        // Get all routes for a specific student
        app.MapGet("/alumnos/{alumnoId}/rutas", async (int alumnoId, IAlumnoRutaService alumnoRutaService) =>
        {
            try
            {
                var rutas = await alumnoRutaService.GetByAlumnoIdAsync(alumnoId);
                return Results.Ok(rutas);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Get a specific route assignment for a student
        app.MapGet("/alumnos/{alumnoId}/rutas/{rubroTransporteId}", async (int alumnoId, int rubroTransporteId, IAlumnoRutaService alumnoRutaService) =>
        {
            try
            {
                var ruta = await alumnoRutaService.GetByIdsAsync(alumnoId, rubroTransporteId);
                return ruta != null ? Results.Ok(ruta) : Results.NotFound($"No route found for student {alumnoId} and route {rubroTransporteId}");
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Assign a student to a route
        app.MapPost("/alumnos/rutas", async (AlumnoRutaDto alumnoRutaDto, IAlumnoRutaService alumnoRutaService) =>
        {
            try
            {
                await alumnoRutaService.AddAsync(alumnoRutaDto);
                return Results.Created($"/alumnos/{alumnoRutaDto.AlumnoId}/rutas/{alumnoRutaDto.RubroTransporteId}", alumnoRutaDto);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Remove a student from a route
        app.MapDelete("/alumnos/{alumnoId}/rutas/{rubroTransporteId}", async (int alumnoId, int rubroTransporteId, IAlumnoRutaService alumnoRutaService) =>
        {
            try
            {
                await alumnoRutaService.DeleteAsync(alumnoId, rubroTransporteId);
                return Results.NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });
    }
}