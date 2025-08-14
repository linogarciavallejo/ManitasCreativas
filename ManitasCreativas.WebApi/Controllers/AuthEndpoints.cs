using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using ManitasCreativas.WebApi.Services;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/login", async (UsuarioLoginDto loginDto, IUsuarioService usuarioService, IAppLogger appLogger) =>
        {
            try
            {
                appLogger.LogInformation("Login attempt for user: {CodigoUsuario}", loginDto.CodigoUsuario);
                
                var usuario = await usuarioService.GetUsuarioByCodigoUsuarioAsync(loginDto.CodigoUsuario, loginDto.Password);
                
                if (usuario == null)
                {
                    appLogger.LogWarning("Failed login attempt for user: {CodigoUsuario}", loginDto.CodigoUsuario);
                    return Results.Unauthorized();
                }

                appLogger.LogUserAction(usuario.Id.ToString(), "Login", $"User {loginDto.CodigoUsuario} logged in successfully");
                return Results.Ok(usuario);
            }
            catch (Exception ex)
            {
                appLogger.LogError(ex, "Error during login for user: {CodigoUsuario}", loginDto.CodigoUsuario);
                return Results.Problem("An error occurred during login");
            }
        });

        app.MapPost("/api/auth/forgot-password", async (ForgotPasswordDto forgotPasswordDto, IUsuarioService usuarioService, IAppLogger appLogger) =>
        {
            try
            {
                appLogger.LogInformation("Password reset requested for email: {Email}", forgotPasswordDto.Email);
                
                await usuarioService.InitiatePasswordResetAsync(forgotPasswordDto.Email);
                
                appLogger.LogInformation("Password reset email process completed for: {Email}", forgotPasswordDto.Email);
                
                // Always return success for security (don't reveal if email exists)
                return Results.Ok(new { message = "Si el email existe, recibirás un enlace de recuperación." });
            }
            catch (Exception ex)
            {
                appLogger.LogError(ex, "Error during password reset for email: {Email}", forgotPasswordDto.Email);
                return Results.Problem("An error occurred during password reset");
            }
        });

        app.MapPost("/api/auth/reset-password", async (ResetPasswordDto resetPasswordDto, IUsuarioService usuarioService, IAppLogger appLogger) =>
        {
            try
            {
                appLogger.LogInformation("Password reset attempt with token");
                
                var success = await usuarioService.ResetPasswordAsync(resetPasswordDto);
                
                if (!success)
                {
                    appLogger.LogWarning("Invalid or expired password reset token used");
                    return Results.BadRequest(new { message = "Token inválido o expirado." });
                }
                
                appLogger.LogInformation("Password reset completed successfully");
                return Results.Ok(new { message = "Contraseña restablecida exitosamente." });
            }
            catch (Exception ex)
            {
                appLogger.LogError(ex, "Error during password reset");
                return Results.Problem("An error occurred during password reset");
            }
        });

        app.MapPost("/api/auth/change-password", async (ChangePasswordDto changePasswordDto, IUsuarioService usuarioService, IAppLogger appLogger) =>
        {
            try
            {
                appLogger.LogInformation("Password change attempt for user ID: {UserId}", changePasswordDto.UserId);
                
                var success = await usuarioService.ChangePasswordAsync(changePasswordDto.UserId, changePasswordDto);
                
                if (!success)
                {
                    appLogger.LogWarning("Failed password change attempt for user ID: {UserId}", changePasswordDto.UserId);
                    return Results.BadRequest(new { message = "Contraseña actual incorrecta o las nuevas contraseñas no coinciden." });
                }
                
                appLogger.LogInformation("Password changed successfully for user ID: {UserId}", changePasswordDto.UserId);
                return Results.Ok(new { message = "Contraseña cambiada exitosamente." });
            }
            catch (Exception ex)
            {
                appLogger.LogError(ex, "Error during password change");
                return Results.Problem("An error occurred during password change");
            }
        });
    }
}
