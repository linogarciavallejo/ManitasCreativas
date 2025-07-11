using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/login", async (UsuarioLoginDto loginDto, IUsuarioService usuarioService) =>
        {
            var usuario = await usuarioService.GetUsuarioByCodigoUsuarioAsync(loginDto.CodigoUsuario, loginDto.Password);
            
            if (usuario == null)
            {
                return Results.Unauthorized();
            }

            return Results.Ok(usuario);
        });

        app.MapPost("/api/auth/forgot-password", async (ForgotPasswordDto forgotPasswordDto, IUsuarioService usuarioService) =>
        {
            await usuarioService.InitiatePasswordResetAsync(forgotPasswordDto.Email);
            
            // Always return success for security (don't reveal if email exists)
            return Results.Ok(new { message = "Si el email existe, recibirás un enlace de recuperación." });
        });

        app.MapPost("/api/auth/reset-password", async (ResetPasswordDto resetPasswordDto, IUsuarioService usuarioService) =>
        {
            var success = await usuarioService.ResetPasswordAsync(resetPasswordDto);
            
            if (!success)
            {
                return Results.BadRequest(new { message = "Token inválido o expirado." });
            }
            
            return Results.Ok(new { message = "Contraseña restablecida exitosamente." });
        });
    }
}
