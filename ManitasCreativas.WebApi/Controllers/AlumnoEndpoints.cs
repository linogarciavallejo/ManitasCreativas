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
    }
}