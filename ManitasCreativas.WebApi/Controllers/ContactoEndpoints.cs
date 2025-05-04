using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Services;

public static class ContactoEndpoints
{
    public static void MapContactoEndpoints(this WebApplication app)
    {
        // Get all contacts
        app.MapGet("/contactos", async (IContactoService contactoService) =>
        {
            return Results.Ok(await contactoService.GetAllContactosAsync());
        });

        // Get contact by id
        app.MapGet("/contactos/{id}", async (int id, IContactoService contactoService) =>
        {
            var contacto = await contactoService.GetContactoByIdAsync(id);
            return contacto is not null ? Results.Ok(contacto) : Results.NotFound();
        });

        // Create new contact
        app.MapPost("/contactos", async (ContactoDto contactoDto, IContactoService contactoService) =>
        {
            var result = await contactoService.AddContactoAsync(contactoDto);
            return Results.Created($"/contactos/{result.Id}", result);
        });

        // Update existing contact
        app.MapPut("/contactos/{id}", async (int id, ContactoDto contactoDto, IContactoService contactoService) =>
        {
            contactoDto.Id = id;
            await contactoService.UpdateContactoAsync(contactoDto);
            return Results.NoContent();
        });

        // Delete contact
        app.MapDelete("/contactos/{id}", async (int id, IContactoService contactoService) =>
        {
            await contactoService.DeleteContactoAsync(id);
            return Results.NoContent();
        });

        // Get contacts for a specific student
        app.MapGet("/alumnos/{alumnoId}/contactos", async (int alumnoId, IContactoService contactoService) =>
        {
            return Results.Ok(await contactoService.GetContactosByAlumnoIdAsync(alumnoId));
        });

        // Associate a contact with a student
        app.MapPost("/alumnos/{alumnoId}/contactos/{contactoId}", async (int alumnoId, int contactoId, AssociateContactoRequestDto requestDto, IContactoService contactoService) =>
        {
            var result = await contactoService.AssociateContactoWithAlumnoAsync(alumnoId, contactoId, requestDto.Parentesco);
            return Results.Created($"/alumnos/{alumnoId}/contactos/{contactoId}", result);
        });

        // Update the relationship between a student and a contact
        app.MapPut("/alumnos/{alumnoId}/contactos/{contactoId}", async (int alumnoId, int contactoId, AssociateContactoRequestDto requestDto, IContactoService contactoService) =>
        {
            await contactoService.UpdateAlumnoContactoAsync(alumnoId, contactoId, requestDto.Parentesco);
            return Results.NoContent();
        });

        // Remove association between a student and a contact
        app.MapDelete("/alumnos/{alumnoId}/contactos/{contactoId}", async (int alumnoId, int contactoId, IContactoService contactoService) =>
        {
            await contactoService.RemoveContactoFromAlumnoAsync(alumnoId, contactoId);
            return Results.NoContent();
        });
    }
}

// Simple DTO for the association request
public class AssociateContactoRequestDto
{
    public string Parentesco { get; set; } = string.Empty;
}