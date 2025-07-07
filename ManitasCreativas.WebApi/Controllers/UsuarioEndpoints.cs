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

        app.MapGet("/usuarios/{id:int}", async (int id, IUsuarioService usuarioService) =>
        {
            var usuario = await usuarioService.GetUsuarioByIdAsync(id);
            return usuario is not null ? Results.Ok(usuario) : Results.NotFound();
        });

        app.MapPost("/usuarios", async (UsuarioDto usuarioDto, IUsuarioService usuarioService) =>
        {
            await usuarioService.AddUsuarioAsync(usuarioDto);
            return Results.Created($"/usuarios/{usuarioDto.Id}", usuarioDto);
        });

        app.MapPut("/usuarios/{id:int}", async (int id, UsuarioDto usuarioDto, IUsuarioService usuarioService) =>
        {
            usuarioDto.Id = id;
            await usuarioService.UpdateUsuarioAsync(usuarioDto);
            return Results.NoContent();
        });

        app.MapDelete("/usuarios/{id:int}", async (int id, IUsuarioService usuarioService) =>
        {
            await usuarioService.DeleteUsuarioAsync(id);
            return Results.NoContent();
        });

        app.MapPost("/usuarios/signin", async (UsuarioLoginDto loginDto, IUsuarioService usuarioService) =>
        {
            var authResult = await usuarioService.AuthenticateUserAsync(loginDto.CodigoUsuario, loginDto.Password);
            
            if (authResult.IsSuccessful)
            {
                return Results.Ok(authResult.Usuario);
            }
            
            // Return appropriate error response based on error type
            return authResult.ErrorType switch
            {
                AuthenticationErrorType.InvalidCredentials => 
                    Results.Json(new { message = authResult.ErrorMessage }, statusCode: 401),
                AuthenticationErrorType.UserInactive => 
                    Results.Json(new { message = authResult.ErrorMessage }, statusCode: 403),
                AuthenticationErrorType.UserBlocked => 
                    Results.Json(new { message = authResult.ErrorMessage }, statusCode: 403),
                _ => Results.BadRequest(new { message = authResult.ErrorMessage })
            };
        });


    }
}
