using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;
using ManitasCreativas.Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace ManitasCreativas.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IRolRepository _rolRepository;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public UsuarioService(IUsuarioRepository usuarioRepository, IRolRepository rolRepository, IEmailService emailService, IConfiguration configuration)
    {
        _usuarioRepository = usuarioRepository;
        _rolRepository = rolRepository;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<IEnumerable<UsuarioDto>> GetAllUsuariosAsync()
    {
        var usuarios = await _usuarioRepository.GetAllAsync();
        return usuarios.Select(u => new UsuarioDto
        {
            Id = u.Id,
            Nombres = u.Nombres,
            Apellidos = u.Apellidos,
            CodigoUsuario = u.CodigoUsuario,
            Email = u.Email,
            Celular = u.Celular,
            Password = u.Password,
            EstadoUsuario = u.EstadoUsuario.ToString(),
            Rol = u.Rol?.Nombre,
            EsAdmin = u.Rol?.EsAdmin ?? false
        });
    }

    public async Task<UsuarioDto?> GetUsuarioByIdAsync(int id)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        return usuario == null ? null : new UsuarioDto
        {
            Id = usuario.Id,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            CodigoUsuario = usuario.CodigoUsuario,
            Email = usuario.Email,
            Celular = usuario.Celular,
            Password = usuario.Password,
            EstadoUsuario = usuario.EstadoUsuario.ToString(),
            Rol = usuario.Rol?.Nombre,
            EsAdmin = usuario.Rol?.EsAdmin ?? false
        };
    }    public async Task AddUsuarioAsync(UsuarioDto usuarioDto)
    {
        // Find existing Rol instead of creating a new one
        var roles = await _rolRepository.GetAllAsync();
        var rol = roles.FirstOrDefault(r => r.Nombre == usuarioDto.Rol);
        
        if (rol == null)
        {
            throw new ArgumentException($"Rol '{usuarioDto.Rol}' no encontrado");
        }

        var usuario = new Usuario
        {
            Nombres = usuarioDto.Nombres,
            Apellidos = usuarioDto.Apellidos,
            CodigoUsuario = usuarioDto.CodigoUsuario,
            Email = usuarioDto.Email,
            Celular = usuarioDto.Celular,
            Password = usuarioDto.Password,
            EstadoUsuario = Enum.Parse<EstadoUsuario>(usuarioDto.EstadoUsuario),
            Rol = rol
        };
        await _usuarioRepository.AddAsync(usuario);
    }    public async Task UpdateUsuarioAsync(UsuarioDto usuarioDto)
    {
        // Find existing Rol instead of creating a new one
        var roles = await _rolRepository.GetAllAsync();
        var rol = roles.FirstOrDefault(r => r.Nombre == usuarioDto.Rol);
        
        if (rol == null)
        {
            throw new ArgumentException($"Rol '{usuarioDto.Rol}' no encontrado");
        }

        var usuario = new Usuario
        {
            Id = usuarioDto.Id,
            Nombres = usuarioDto.Nombres,
            Apellidos = usuarioDto.Apellidos,
            CodigoUsuario = usuarioDto.CodigoUsuario,
            Email = usuarioDto.Email,
            Celular = usuarioDto.Celular,
            Password = usuarioDto.Password,
            EstadoUsuario = Enum.Parse<EstadoUsuario>(usuarioDto.EstadoUsuario),
            Rol = rol
        };
        await _usuarioRepository.UpdateAsync(usuario);
    }

    public async Task DeleteUsuarioAsync(int id)
    {
        await _usuarioRepository.DeleteAsync(id);
    }

    public async Task<UsuarioDto?> GetUsuarioByCodigoUsuarioAsync(string codigoUsuario, string password)
    {
        var usuario = await _usuarioRepository.GetByCodigoUsuarioAsync(codigoUsuario, password);
        
        // Check if user exists and is active
        if (usuario == null || usuario.EstadoUsuario != EstadoUsuario.Activo)
        {
            return null; // Return null for both non-existent and inactive users
        }
        
        return new UsuarioDto
        {
            Id = usuario.Id,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            CodigoUsuario = usuario.CodigoUsuario,
            Email = usuario.Email,
            Celular = usuario.Celular,
            Password = usuario.Password,
            EstadoUsuario = usuario.EstadoUsuario.ToString(),
            Rol = usuario.Rol?.Nombre,
            EsAdmin = usuario.Rol?.EsAdmin ?? false
        };
    }

    public async Task<bool> InitiatePasswordResetAsync(string email)
    {
        var usuario = await _usuarioRepository.GetByEmailAsync(email);
        if (usuario == null || usuario.EstadoUsuario != EstadoUsuario.Activo)
        {
            return false; // Don't reveal if email exists
        }
        
        // Generate reset token
        var token = Guid.NewGuid().ToString();
        usuario.PasswordResetToken = token;
        usuario.PasswordResetExpires = DateTime.UtcNow.AddHours(1); // 1 hour expiration
        
        await _usuarioRepository.UpdateAsync(usuario);
        
        // Send password reset email
        try
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var resetUrl = $"{frontendUrl}/reset-password?token={token}";
            var subject = "Recuperación de Contraseña - Manitas Creativas";
            var body = $@"Estimado/a {usuario.Nombres},

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Manitas Creativas.

Para restablecer tu contraseña, haz clic en el siguiente enlace:
{resetUrl}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este correo electrónico y tu contraseña permanecerá sin cambios.

Saludos cordiales,
Equipo de Manitas Creativas";

            await _emailService.SendEmailAsync(
                recipientName: $"{usuario.Nombres} {usuario.Apellidos}",
                recipientEmail: usuario.Email,
                teamName: "Manitas Creativas",
                subject: subject,
                body: body,
                ccName: null,
                ccEmail: null
            );
            
            Console.WriteLine($"Password reset email sent to {email}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending password reset email to {email}: {ex.Message}");
            // Even if email fails, we return true for security (don't reveal if email exists)
        }
        
        return true;
    }
    
    public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        if (resetPasswordDto.NewPassword != resetPasswordDto.ConfirmPassword)
        {
            return false;
        }
        
        var usuario = await _usuarioRepository.GetByPasswordResetTokenAsync(resetPasswordDto.Token);
        if (usuario == null)
        {
            return false;
        }
        
        // Update password and clear reset token
        usuario.Password = resetPasswordDto.NewPassword; // In production, hash this
        usuario.PasswordResetToken = null;
        usuario.PasswordResetExpires = null;
        
        await _usuarioRepository.UpdateAsync(usuario);
        return true;
    }

    public async Task<AuthenticationResultDto> AuthenticateUserAsync(string codigoUsuario, string password)
    {
        var usuario = await _usuarioRepository.GetByCodigoUsuarioAsync(codigoUsuario, password);
        
        if (usuario == null)
        {
            return new AuthenticationResultDto
            {
                IsSuccessful = false,
                ErrorType = AuthenticationErrorType.InvalidCredentials,
                ErrorMessage = "Credenciales inválidas. Verifique su código de usuario y contraseña."
            };
        }
        
        // Check user status
        switch (usuario.EstadoUsuario)
        {
            case EstadoUsuario.Inactivo:
                return new AuthenticationResultDto
                {
                    IsSuccessful = false,
                    ErrorType = AuthenticationErrorType.UserInactive,
                    ErrorMessage = "Su cuenta está inactiva. Contacte al administrador para activar su cuenta."
                };
                
            case EstadoUsuario.Bloqueado:
                return new AuthenticationResultDto
                {
                    IsSuccessful = false,
                    ErrorType = AuthenticationErrorType.UserBlocked,
                    ErrorMessage = "Su cuenta ha sido bloqueada. Contacte al administrador para más información."
                };
                
            case EstadoUsuario.Activo:
                // User is active, proceed with successful authentication
                var usuarioDto = new UsuarioDto
                {
                    Id = usuario.Id,
                    Nombres = usuario.Nombres,
                    Apellidos = usuario.Apellidos,
                    CodigoUsuario = usuario.CodigoUsuario,
                    Email = usuario.Email,
                    Celular = usuario.Celular,
                    Password = usuario.Password,
                    EstadoUsuario = usuario.EstadoUsuario.ToString(),
                    Rol = usuario.Rol?.Nombre,
                    EsAdmin = usuario.Rol?.EsAdmin ?? false
                };
                
                return new AuthenticationResultDto
                {
                    IsSuccessful = true,
                    Usuario = usuarioDto,
                    ErrorType = AuthenticationErrorType.None
                };
                
            default:
                return new AuthenticationResultDto
                {
                    IsSuccessful = false,
                    ErrorType = AuthenticationErrorType.InvalidCredentials,
                    ErrorMessage = "Estado de usuario no válido."
                };
        }
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
    {
        if (changePasswordDto.NewPassword != changePasswordDto.ConfirmPassword)
        {
            return false;
        }
        
        var usuario = await _usuarioRepository.GetByIdAsync(userId);
        if (usuario == null)
        {
            return false;
        }
        
        // Verify current password
        if (usuario.Password != changePasswordDto.CurrentPassword)
        {
            return false;
        }
        
        // Update password
        usuario.Password = changePasswordDto.NewPassword; // In production, hash this
        
        await _usuarioRepository.UpdateAsync(usuario);
        return true;
    }
}