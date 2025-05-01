using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;


public static class GradoEndpoints
{
    public static void MapGradoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/grados").WithTags("Grados");

        // GET: api/grados  
        group.MapGet("", async (IGradoService gradoService) =>
        {
            var grados = await gradoService.GetAllAsync(); // Fixed method name  
            return Results.Ok(grados);
        })
        .WithName("GetAllGrados")
        .WithDescription("Obtener todos los grados");

        // GET: api/grados/activos  
        group.MapGet("activos", async (IGradoService gradoService) =>
        {
            var grados = await gradoService.GetActiveAsync(); // Fixed method name  
            return Results.Ok(grados);
        })
        .WithName("GetActiveGrados")
        .WithDescription("Obtener grados activos");

        // GET: api/grados/{id}  
        group.MapGet("{id:int}", async (int id, IGradoService gradoService) =>
        {
            var grado = await gradoService.GetByIdAsync(id); // Fixed method name  
            if (grado == null)
                return Results.NotFound();

            return Results.Ok(grado);
        })
        .WithName("GetGradoById")
        .WithDescription("Obtener grado por ID");

        // GET: api/grados/nivel/{nivelEducativoId}  
        group.MapGet("nivel/{nivelEducativoId:int}", async (int nivelEducativoId, IGradoService gradoService) =>
        {
            var grados = await gradoService.GetByNivelEducativoIdAsync(nivelEducativoId); // Fixed method name  
            return Results.Ok(grados);
        })
        .WithName("GetGradosByNivelEducativoId")
        .WithDescription("Obtener grados por nivel educativo");

        // POST: api/grados  
        group.MapPost("", async (GradoDto gradoDto, IGradoService gradoService) =>
        {
            var createdGrado = await gradoService.CreateAsync(gradoDto); // Fixed method name  
            return Results.Created($"/api/grados/{createdGrado.Id}", createdGrado);
        })
        .WithName("CreateGrado")
        .WithDescription("Crear nuevo grado");

        // PUT: api/grados/{id}  
        group.MapPut("{id:int}", async (int id, GradoDto gradoDto, IGradoService gradoService) =>
        {
            if (id != gradoDto.Id)
                return Results.BadRequest("ID mismatch");

            try
            {
                await gradoService.UpdateAsync(id, gradoDto); // Fixed method name and added id parameter  
                return Results.NoContent();
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        })
        .WithName("UpdateGrado")
        .WithDescription("Actualizar grado");

        // DELETE: api/grados/{id}  
        group.MapDelete("{id:int}", async (int id, IGradoService gradoService) =>
        {
            try
            {
                await gradoService.DeleteAsync(id); // Fixed method name  
                return Results.NoContent();
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        })
        .WithName("DeleteGrado")
        .WithDescription("Eliminar grado");
    }
}
