using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ManitasCreativas.WebApi.Controllers;

public static class RubroUniformeDetalleEndpoints
{
    public static void MapRubroUniformeDetalleEndpoints(this WebApplication app)
    {
        // GET /rubro-uniforme-detalles - Get all rubro uniforme detalles
        app.MapGet("/rubro-uniforme-detalles", async (IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            var detalles = await rubroUniformeDetalleService.GetAllAsync();
            return Results.Ok(detalles);
        })
        .WithName("GetAllRubroUniformeDetalles")
        .WithOpenApi();

        // GET /rubro-uniforme-detalles/active - Get active rubro uniforme detalles
        app.MapGet("/rubro-uniforme-detalles/active", async (IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            var detalles = await rubroUniformeDetalleService.GetActiveAsync();
            return Results.Ok(detalles);
        })
        .WithName("GetActiveRubroUniformeDetalles")
        .WithOpenApi();

        // GET /rubro-uniforme-detalles/{id} - Get rubro uniforme detalle by ID
        app.MapGet("/rubro-uniforme-detalles/{id:int}", async (int id, IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            var detalle = await rubroUniformeDetalleService.GetByIdAsync(id);
            return detalle != null ? Results.Ok(detalle) : Results.NotFound($"RubroUniformeDetalle with ID {id} not found");
        })
        .WithName("GetRubroUniformeDetalleById")
        .WithOpenApi();

        // GET /rubro-uniforme-detalles/by-rubro/{rubroId} - Get rubro uniforme detalles by rubro ID
        app.MapGet("/rubro-uniforme-detalles/by-rubro/{rubroId:int}", async (int rubroId, IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            var detalles = await rubroUniformeDetalleService.GetByRubroIdAsync(rubroId);
            return Results.Ok(detalles);
        })
        .WithName("GetRubroUniformeDetallesByRubro")
        .WithOpenApi();

        // GET /rubro-uniforme-detalles/by-prenda/{prendaUniformeId} - Get rubro uniforme detalles by prenda uniforme ID
        app.MapGet("/rubro-uniforme-detalles/by-prenda/{prendaUniformeId:int}", async (int prendaUniformeId, IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            var detalles = await rubroUniformeDetalleService.GetByPrendaUniformeIdAsync(prendaUniformeId);
            return Results.Ok(detalles);
        })
        .WithName("GetRubroUniformeDetallesByPrenda")
        .WithOpenApi();

        // GET /rubro-uniforme-detalles/by-rubro-prenda/{rubroId}/{prendaUniformeId} - Get specific rubro uniforme detalle
        app.MapGet("/rubro-uniforme-detalles/by-rubro-prenda/{rubroId:int}/{prendaUniformeId:int}", async (
            int rubroId, 
            int prendaUniformeId, 
            IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            var detalle = await rubroUniformeDetalleService.GetByRubroIdAndPrendaUniformeIdAsync(rubroId, prendaUniformeId);
            return detalle != null ? Results.Ok(detalle) : Results.NotFound($"RubroUniformeDetalle not found for RubroId {rubroId} and PrendaUniformeId {prendaUniformeId}");
        })
        .WithName("GetRubroUniformeDetalleByRubroAndPrenda")
        .WithOpenApi();

        // POST /rubro-uniforme-detalles - Create new rubro uniforme detalle
        app.MapPost("/rubro-uniforme-detalles", async (
            [FromBody] RubroUniformeDetalleCreateDto createDto,
            [FromQuery] int usuarioCreacionId,
            IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            try
            {
                var detalle = await rubroUniformeDetalleService.CreateAsync(createDto, usuarioCreacionId);
                return Results.Created($"/rubro-uniforme-detalles/{detalle.Id}", detalle);
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
                return Results.BadRequest($"Error creating RubroUniformeDetalle: {ex.Message}");
            }
        })
        .WithName("CreateRubroUniformeDetalle")
        .WithOpenApi();

        // PUT /rubro-uniforme-detalles/{id} - Update rubro uniforme detalle
        app.MapPut("/rubro-uniforme-detalles/{id:int}", async (
            int id,
            [FromBody] RubroUniformeDetalleCreateDto updateDto,
            [FromQuery] int usuarioActualizacionId,
            IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            try
            {
                var detalle = await rubroUniformeDetalleService.UpdateAsync(id, updateDto, usuarioActualizacionId);
                return Results.Ok(detalle);
            }
            catch (ArgumentException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Error updating RubroUniformeDetalle: {ex.Message}");
            }
        })
        .WithName("UpdateRubroUniformeDetalle")
        .WithOpenApi();

        // DELETE /rubro-uniforme-detalles/{id} - Delete rubro uniforme detalle (soft delete)
        app.MapDelete("/rubro-uniforme-detalles/{id:int}", async (
            int id,
            [FromQuery] string motivoEliminacion,
            [FromQuery] int usuarioEliminacionId,
            IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            var deleted = await rubroUniformeDetalleService.DeleteAsync(id, motivoEliminacion, usuarioEliminacionId);
            return deleted ? Results.NoContent() : Results.NotFound($"RubroUniformeDetalle with ID {id} not found");
        })
        .WithName("DeleteRubroUniformeDetalle")
        .WithOpenApi();

        // GET /rubro-uniforme-detalles/exists/{rubroId}/{prendaUniformeId} - Check if combination exists
        app.MapGet("/rubro-uniforme-detalles/exists/{rubroId:int}/{prendaUniformeId:int}", async (
            int rubroId, 
            int prendaUniformeId, 
            IRubroUniformeDetalleService rubroUniformeDetalleService) =>
        {
            var exists = await rubroUniformeDetalleService.ExistsAsync(rubroId, prendaUniformeId);
            return Results.Ok(new { exists });
        })
        .WithName("CheckRubroUniformeDetalleExists")
        .WithOpenApi();
    }
}
