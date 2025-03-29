using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
public static class UsuarioEndpoints
{
    public static void MapUsuarioEndpoints(this WebApplication app)
    {
        app.MapGet("/usuarios", async (IUsuarioService usuarioService) =>
        {
            return Results.Ok(await usuarioService.GetAllUsuariosAsync());
        });

        app.MapGet("/usuarios/{id}", async (int id, IUsuarioService usuarioService) =>
        {
            var usuario = await usuarioService.GetUsuarioByIdAsync(id);
            return usuario is not null ? Results.Ok(usuario) : Results.NotFound();
        });

        app.MapPost("/usuarios", async (UsuarioDto usuarioDto, IUsuarioService usuarioService) =>
        {
            await usuarioService.AddUsuarioAsync(usuarioDto);
            return Results.Created($"/usuarios/{usuarioDto.Id}", usuarioDto);
        });

        app.MapPut("/usuarios/{id}", async (int id, UsuarioDto usuarioDto, IUsuarioService usuarioService) =>
        {
            usuarioDto.Id = id;
            await usuarioService.UpdateUsuarioAsync(usuarioDto);
            return Results.NoContent();
        });

        app.MapDelete("/usuarios/{id}", async (int id, IUsuarioService usuarioService) =>
        {
            await usuarioService.DeleteUsuarioAsync(id);
            return Results.NoContent();
        });
    }
}