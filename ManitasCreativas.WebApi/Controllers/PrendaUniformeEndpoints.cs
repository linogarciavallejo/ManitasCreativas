using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ManitasCreativas.WebApi.Controllers;

public static class PrendaUniformeEndpoints
{
    public static void MapPrendaUniformeEndpoints(this WebApplication app)
    {
        // GET /prendas-uniforme - Get all prendas uniforme
        app.MapGet("/prendas-uniforme", async (IPrendaUniformeService prendaUniformeService) =>
        {
            var prendas = await prendaUniformeService.GetAllAsync();
            return Results.Ok(prendas);
        })
        .WithName("GetAllPrendasUniforme")
        .WithOpenApi();

        // GET /prendas-uniforme/simple - Get all prendas uniforme (simple version)
        app.MapGet("/prendas-uniforme/simple", async (IPrendaUniformeService prendaUniformeService) =>
        {
            var prendas = await prendaUniformeService.GetAllSimpleAsync();
            return Results.Ok(prendas);
        })
        .WithName("GetAllPrendasUniformeSimple")
        .WithOpenApi();

        // GET /prendas-uniforme/active - Get active prendas uniforme
        app.MapGet("/prendas-uniforme/active", async (IPrendaUniformeService prendaUniformeService) =>
        {
            var prendas = await prendaUniformeService.GetActiveAsync();
            return Results.Ok(prendas);
        })
        .WithName("GetActivePrendasUniforme")
        .WithOpenApi();

        // GET /prendas-uniforme/{id} - Get prenda uniforme by ID
        app.MapGet("/prendas-uniforme/{id:int}", async (int id, IPrendaUniformeService prendaUniformeService) =>
        {
            var prenda = await prendaUniformeService.GetByIdWithImagesAsync(id);
            return prenda != null ? Results.Ok(prenda) : Results.NotFound($"PrendaUniforme with ID {id} not found");
        })
        .WithName("GetPrendaUniformeById")
        .WithOpenApi();

        // GET /prendas-uniforme/by-sexo/{sexo} - Get prendas uniforme by sexo
        app.MapGet("/prendas-uniforme/by-sexo/{sexo}", async (string sexo, IPrendaUniformeService prendaUniformeService) =>
        {
            var prendas = await prendaUniformeService.GetBySexoAsync(sexo);
            return Results.Ok(prendas);
        })
        .WithName("GetPrendasUniformeBySexo")
        .WithOpenApi();

        // GET /prendas-uniforme/by-talla/{talla} - Get prendas uniforme by talla
        app.MapGet("/prendas-uniforme/by-talla/{talla}", async (string talla, IPrendaUniformeService prendaUniformeService) =>
        {
            var prendas = await prendaUniformeService.GetByTallaAsync(talla);
            return Results.Ok(prendas);
        })
        .WithName("GetPrendasUniformeByTalla")
        .WithOpenApi();

        // GET /prendas-uniforme/by-sexo-talla/{sexo}/{talla} - Get prendas uniforme by sexo and talla
        app.MapGet("/prendas-uniforme/by-sexo-talla/{sexo}/{talla}", async (string sexo, string talla, IPrendaUniformeService prendaUniformeService) =>
        {
            var prendas = await prendaUniformeService.GetBySexoAndTallaAsync(sexo, talla);
            return Results.Ok(prendas);
        })
        .WithName("GetPrendasUniformeBySexoAndTalla")
        .WithOpenApi();

        // POST /prendas-uniforme - Create new prenda uniforme
        app.MapPost("/prendas-uniforme", async (
            [FromBody] PrendaUniformeCreateDto createDto,
            [FromQuery] int usuarioCreacionId,
            IPrendaUniformeService prendaUniformeService) =>
        {
            try
            {
                var prenda = await prendaUniformeService.CreateAsync(createDto, usuarioCreacionId);
                return Results.Created($"/prendas-uniforme/{prenda.Id}", prenda);
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Error creating PrendaUniforme: {ex.Message}");
            }
        })
        .WithName("CreatePrendaUniforme")
        .WithOpenApi();

        // PUT /prendas-uniforme/{id} - Update prenda uniforme
        app.MapPut("/prendas-uniforme/{id:int}", async (
            int id,
            [FromBody] PrendaUniformeCreateDto updateDto,
            [FromQuery] int usuarioActualizacionId,
            IPrendaUniformeService prendaUniformeService) =>
        {
            try
            {
                var prenda = await prendaUniformeService.UpdateAsync(id, updateDto, usuarioActualizacionId);
                return Results.Ok(prenda);
            }
            catch (ArgumentException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Error updating PrendaUniforme: {ex.Message}");
            }
        })
        .WithName("UpdatePrendaUniforme")
        .WithOpenApi();

        // DELETE /prendas-uniforme/{id} - Delete prenda uniforme (soft delete)
        app.MapDelete("/prendas-uniforme/{id:int}", async (
            int id,
            [FromQuery] string motivoEliminacion,
            [FromQuery] int usuarioEliminacionId,
            IPrendaUniformeService prendaUniformeService) =>
        {
            var deleted = await prendaUniformeService.DeleteAsync(id, motivoEliminacion, usuarioEliminacionId);
            return deleted ? Results.NoContent() : Results.NotFound($"PrendaUniforme with ID {id} not found");
        })
        .WithName("DeletePrendaUniforme")
        .WithOpenApi();

        // GET /prendas-uniforme/{id}/exists - Check if prenda uniforme exists
        app.MapGet("/prendas-uniforme/{id:int}/exists", async (int id, IPrendaUniformeService prendaUniformeService) =>
        {
            var exists = await prendaUniformeService.ExistsAsync(id);
            return Results.Ok(new { exists });
        })
        .WithName("CheckPrendaUniformeExists")
        .WithOpenApi();
    }
}
