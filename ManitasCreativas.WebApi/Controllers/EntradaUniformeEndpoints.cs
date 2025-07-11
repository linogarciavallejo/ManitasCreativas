using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ManitasCreativas.WebApi.Controllers;

public static class EntradaUniformeEndpoints
{
    public static void MapEntradaUniformeEndpoints(this WebApplication app)
    {
        // GET /entradas-uniforme - Get all entradas uniforme
        app.MapGet("/entradas-uniforme", async (IEntradaUniformeService entradaUniformeService) =>
        {
            var entradas = await entradaUniformeService.GetAllAsync();
            return Results.Ok(entradas);
        })
        .WithName("GetAllEntradasUniforme")
        .WithOpenApi();

        // GET /entradas-uniforme/active - Get active entradas uniforme
        app.MapGet("/entradas-uniforme/active", async (IEntradaUniformeService entradaUniformeService) =>
        {
            var entradas = await entradaUniformeService.GetActiveAsync();
            return Results.Ok(entradas);
        })
        .WithName("GetActiveEntradasUniforme")
        .WithOpenApi();

        // GET /entradas-uniforme/{id} - Get entrada uniforme by ID
        app.MapGet("/entradas-uniforme/{id:int}", async (int id, IEntradaUniformeService entradaUniformeService) =>
        {
            var entrada = await entradaUniformeService.GetByIdWithDetallesAsync(id);
            return entrada != null ? Results.Ok(entrada) : Results.NotFound($"EntradaUniforme with ID {id} not found");
        })
        .WithName("GetEntradaUniformeById")
        .WithOpenApi();

        // GET /entradas-uniforme/by-date-range - Get entradas uniforme by date range
        app.MapGet("/entradas-uniforme/by-date-range", async (
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            IEntradaUniformeService entradaUniformeService) =>
        {
            var entradas = await entradaUniformeService.GetByDateRangeAsync(startDate, endDate);
            return Results.Ok(entradas);
        })
        .WithName("GetEntradasUniformeByDateRange")
        .WithOpenApi();

        // GET /entradas-uniforme/by-usuario/{usuarioId} - Get entradas uniforme by usuario creation ID
        app.MapGet("/entradas-uniforme/by-usuario/{usuarioId:int}", async (int usuarioId, IEntradaUniformeService entradaUniformeService) =>
        {
            var entradas = await entradaUniformeService.GetByUsuarioCreacionIdAsync(usuarioId);
            return Results.Ok(entradas);
        })
        .WithName("GetEntradasUniformeByUsuario")
        .WithOpenApi();

        // POST /entradas-uniforme - Create new entrada uniforme
        app.MapPost("/entradas-uniforme", async (
            [FromBody] EntradaUniformeCreateDto createDto,
            [FromQuery] int usuarioCreacionId,
            IEntradaUniformeService entradaUniformeService) =>
        {
            try
            {
                var entrada = await entradaUniformeService.CreateAsync(createDto, usuarioCreacionId);
                return Results.Created($"/entradas-uniforme/{entrada.Id}", entrada);
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Error creating EntradaUniforme: {ex.Message}");
            }
        })
        .WithName("CreateEntradaUniforme")
        .WithOpenApi();

        // PUT /entradas-uniforme/{id} - Update entrada uniforme
        app.MapPut("/entradas-uniforme/{id:int}", async (
            int id,
            [FromBody] EntradaUniformeCreateDto updateDto,
            [FromQuery] int usuarioActualizacionId,
            IEntradaUniformeService entradaUniformeService) =>
        {
            try
            {
                var entrada = await entradaUniformeService.UpdateAsync(id, updateDto, usuarioActualizacionId);
                return Results.Ok(entrada);
            }
            catch (ArgumentException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Error updating EntradaUniforme: {ex.Message}");
            }
        })
        .WithName("UpdateEntradaUniforme")
        .WithOpenApi();

        // DELETE /entradas-uniforme/{id} - Delete entrada uniforme (soft delete)
        app.MapDelete("/entradas-uniforme/{id:int}", async (
            int id,
            [FromQuery] string motivoEliminacion,
            [FromQuery] int usuarioEliminacionId,
            IEntradaUniformeService entradaUniformeService) =>
        {
            var deleted = await entradaUniformeService.DeleteAsync(id, motivoEliminacion, usuarioEliminacionId);
            return deleted ? Results.NoContent() : Results.NotFound($"EntradaUniforme with ID {id} not found");
        })
        .WithName("DeleteEntradaUniforme")
        .WithOpenApi();

        // GET /entradas-uniforme/{id}/exists - Check if entrada uniforme exists
        app.MapGet("/entradas-uniforme/{id:int}/exists", async (int id, IEntradaUniformeService entradaUniformeService) =>
        {
            var exists = await entradaUniformeService.ExistsAsync(id);
            return Results.Ok(new { exists });
        })
        .WithName("CheckEntradaUniformeExists")
        .WithOpenApi();
    }
}
