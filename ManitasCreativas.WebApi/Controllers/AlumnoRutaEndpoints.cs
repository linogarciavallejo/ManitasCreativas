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
                // Validate date fields
                if (alumnoRutaDto.FechaInicio == default)
                {
                    return Results.BadRequest("FechaInicio is required.");
                }

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
            catch (ArgumentException ex)
            {
                return Results.BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Update a student route assignment
        app.MapPut("/alumnos/{alumnoId}/rutas/{rubroTransporteId}", async (int alumnoId, int rubroTransporteId, AlumnoRutaUpdateDto updateDto, IAlumnoRutaService alumnoRutaService) =>
        {
            try
            {
                // Validate date fields
                if (updateDto.FechaInicio == default)
                {
                    return Results.BadRequest("FechaInicio is required.");
                }
                
                var alumnoRutaDto = new AlumnoRutaDto
                {
                    AlumnoId = alumnoId,
                    RubroTransporteId = rubroTransporteId,
                    FechaInicio = updateDto.FechaInicio,
                    FechaFin = updateDto.FechaFin
                };
                
                await alumnoRutaService.UpdateAsync(alumnoRutaDto);
                return Results.NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(ex.Message);
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

// DTO for route updates
public class AlumnoRutaUpdateDto
{
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
}