using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using System.Security.Claims;

public static class RubroEndpoints
{
    public static void MapRubroEndpoints(this WebApplication app)
    {
        app.MapGet("/rubros", async (IRubroService rubroService) =>
        {
            return Results.Ok(await rubroService.GetAllRubrosAsync());
        });

        app.MapGet("/rubros/{id}", async (int id, IRubroService rubroService) =>
        {
            var rubro = await rubroService.GetRubroByIdAsync(id);
            return rubro is not null ? Results.Ok(rubro) : Results.NotFound();
        });

        app.MapPost("/rubros", async (RubroDto rubroDto, IRubroService rubroService, HttpContext httpContext) =>
        {
            // First try to get username from request header
            string username = httpContext.Request.Headers["X-Username"].FirstOrDefault() ?? "system";
            
            // If not found in header, check if it's already set in the DTO from request body
            //if (username == "system" && !string.IsNullOrEmpty(rubroDto.UsuarioCreacion) && rubroDto.UsuarioCreacion != "system")
            //{
            //    username = rubroDto.UsuarioCreacion;
            //}
            
            // Set creation data
            rubroDto.FechaCreacion = DateTime.UtcNow;
            //rubroDto.UsuarioCreacion = username;
            
            await rubroService.AddRubroAsync(rubroDto);
            return Results.Created($"/rubros/{rubroDto.Id}", rubroDto);
        });

        app.MapPut("/rubros/{id}", async (int id, RubroDto rubroDto, IRubroService rubroService, HttpContext httpContext) =>
        {
            rubroDto.Id = id;
            
            // First try to get username from request header
            string username = httpContext.Request.Headers["X-Username"].FirstOrDefault() ?? "system";
            
            // If not found in header, check if it's already set in the DTO from request body
            //if (username == "system" && !string.IsNullOrEmpty(rubroDto.UsuarioActualizacion) && rubroDto.UsuarioActualizacion != "system")
            //{
            //    username = rubroDto.UsuarioActualizacion;
            //}
            
            // Set update data
            rubroDto.FechaActualizacion = DateTime.UtcNow;
            //rubroDto.UsuarioActualizacion = username;
            
            await rubroService.UpdateRubroAsync(rubroDto);
            return Results.NoContent();
        });

        app.MapDelete("/rubros/{id}", async (int id, IRubroService rubroService) =>
        {
            try
            {
                // First check if the rubro can be deleted
                bool canDelete = await rubroService.CanDeleteRubroAsync(id);
                if (!canDelete)
                {
                    return Results.BadRequest(new { message = "No se puede eliminar el rubro porque tiene pagos asociados." });
                }
                
                await rubroService.DeleteRubroAsync(id);
                return Results.NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message, statusCode: 500);
            }
        });

        app.MapGet("/rubrosactivos", async (IRubroService rubroService) =>
        {
            // Fixed to call GetAllActiveRubrosAsync instead of GetAllRubrosAsync
            return Results.Ok(await rubroService.GetAllActiveRubrosAsync());
        });

        app.MapGet("/rubros/{id}/pagos", async (int id, IRubroService rubroService) =>
        {
            try
            {
                var pagos = await rubroService.GetPagosByRubroIdAsync(id);
                return Results.Ok(pagos);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message, statusCode: 500);
            }
        });

        app.MapGet("/rubros/{id}/pagoscount", async (int id, IRubroService rubroService) =>
        {
            try
            {
                var count = await rubroService.GetPagosCountByRubroIdAsync(id);
                return Results.Ok(count);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message, statusCode: 500);
            }
        });

        app.MapGet("/rubros/{id}/candelete", async (int id, IRubroService rubroService) =>
        {
            try
            {
                var canDelete = await rubroService.CanDeleteRubroAsync(id);
                return Results.Ok(canDelete);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message, statusCode: 500);
            }
        });
    }
}
