using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;

public static class AlumnoContactoEndpoints
{
    public static void MapAlumnoContactoEndpoints(this WebApplication app)
    {
        // Get all associations for a specific alumno
        app.MapGet("/alumnocontactos/alumno/{alumnoId}", async (int alumnoId, IContactoService contactoService) =>
        {
            var contactos = await contactoService.GetContactosByAlumnoIdAsync(alumnoId);
            return Results.Ok(contactos);
        });

        // Get association by direct route (alternative route)
        app.MapGet("/alumnocontactos/{alumnoId}", async (int alumnoId, IContactoService contactoService) =>
        {
            var contactos = await contactoService.GetContactosByAlumnoIdAsync(alumnoId);
            return Results.Ok(contactos);
        });

        // Create new association
        app.MapPost("/alumnocontactos", async (AlumnoContactoCreateDto request, IContactoService contactoService) =>
        {
            var result = await contactoService.AssociateContactoWithAlumnoAsync(
                request.AlumnoId, 
                request.ContactoId, 
                request.Parentesco
            );
            return Results.Created($"/alumnocontactos/{request.AlumnoId}/{request.ContactoId}", result);
        });

        // Update association
        app.MapPut("/alumnocontactos/{alumnoId}/{contactoId}", async (int alumnoId, int contactoId, 
            AlumnoContactoUpdateDto request, IContactoService contactoService) =>
        {
            await contactoService.UpdateAlumnoContactoAsync(alumnoId, contactoId, request.Parentesco);
            return Results.NoContent();
        });

        // Delete association
        app.MapDelete("/alumnocontactos/{alumnoId}/{contactoId}", async (int alumnoId, int contactoId, 
            IContactoService contactoService) =>
        {
            await contactoService.RemoveContactoFromAlumnoAsync(alumnoId, contactoId);
            return Results.NoContent();
        });
    }
}

// DTOs for request validation
public class AlumnoContactoCreateDto
{
    public int AlumnoId { get; set; }
    public int ContactoId { get; set; }
    public string Parentesco { get; set; } = string.Empty;
}

public class AlumnoContactoUpdateDto
{
    public string Parentesco { get; set; } = string.Empty;
}