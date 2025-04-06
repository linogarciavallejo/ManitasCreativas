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

        // Endpoint for querying alumnos by names
        app.MapGet("/alumnos/search", async (string nombre, string apellido, IAlumnoService alumnoService) =>
        {
            var alumnos = await alumnoService.GetAlumnosByNamesAsync(nombre, apellido);
            return Results.Ok(alumnos);
        });

        app.MapGet("/alumnos/full", async (IAlumnoService alumnoService) =>
        {
            var alumnos = await alumnoService.GetAlumnosWithFullNameAsync();
            return Results.Ok(alumnos);
        });
    }
}