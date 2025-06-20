using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;

public static class AlumnoEndpoints
{
    public static void MapAlumnoEndpoints(this WebApplication app)
    {
        app.MapGet("/alumnos", async (IAlumnoService alumnoService) =>
        {
            return Results.Ok(await alumnoService.GetAllAlumnosAsync());
        });

        app.MapGet("/alumnos/{id}", async (int id, IAlumnoService alumnoService) =>
        {
            var alumno = await alumnoService.GetAlumnoByIdAsync(id);
            return alumno is not null ? Results.Ok(alumno) : Results.NotFound();
        });

        app.MapGet("/alumnos/{id}/pagos", async (int id, IAlumnoService alumnoService) =>
        {
            var alumno = await alumnoService.GetAlumnoWithPagosAsync(id);
            return alumno is not null ? Results.Ok(alumno) : Results.NotFound();
        });

        app.MapPost("/alumnos", async (AlumnoDto alumnoDto, IAlumnoService alumnoService) =>
        {
            await alumnoService.AddAlumnoAsync(alumnoDto);
            return Results.Created($"/alumnos/{alumnoDto.Id}", alumnoDto);
        });

        app.MapPut("/alumnos/{id}", async (int id, AlumnoDto alumnoDto, IAlumnoService alumnoService) =>
        {
            alumnoDto.Id = id;
            await alumnoService.UpdateAlumnoAsync(alumnoDto);
            return Results.NoContent();
        });

        app.MapDelete("/alumnos/{id}", async (int id, IAlumnoService alumnoService) =>
        {
            await alumnoService.DeleteAlumnoAsync(id);
            return Results.NoContent();
        });

        app.MapGet("/alumnos/codigo/{codigo}", async (string codigo, IAlumnoService alumnoService) =>
        {
            var alumno = await alumnoService.GetAlumnoByCodigoAsync(codigo);
            return Results.Ok(alumno);
        });

        // Endpoint for validating if a codigo is unique
        app.MapGet("/alumnos/validate-codigo/{codigo}", async (string codigo, int? excludeAlumnoId, IAlumnoService alumnoService) =>
        {
            var isUnique = await alumnoService.IsCodigoUniqueAsync(codigo, excludeAlumnoId);
            return Results.Ok(new { isUnique });
        });        // Endpoint for querying alumnos by names
        app.MapGet("/alumnos/search-by-names", async (string nombre, string apellido, IAlumnoService alumnoService) =>
        {
            var alumnos = await alumnoService.GetAlumnosByNamesAsync(nombre, apellido);
            return Results.Ok(alumnos);
        });

        // Endpoint for flexible student search (for route assignment)
        app.MapGet("/alumnos/search", async (string? query, IAlumnoService alumnoService) =>
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Results.Ok(new List<object>());
            }
            
            var alumnos = await alumnoService.SearchAlumnosAsync(query);
            return Results.Ok(alumnos);
        });

        app.MapGet("/alumnos/full", async (IAlumnoService alumnoService) =>
        {
            var alumnos = await alumnoService.GetAlumnosWithFullNameAsync();
            return Results.Ok(alumnos);
        });

        app.MapGet("/alumnos/{id}/statement", async (int id, IAlumnoService alumnoService) =>
        {
            var statement = await alumnoService.GetAlumnoStatementAsync(id);
            return statement.Any() ? Results.Ok(statement) : Results.NotFound();
        });
    }
}