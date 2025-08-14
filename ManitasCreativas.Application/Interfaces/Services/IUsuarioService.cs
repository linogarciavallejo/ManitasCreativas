namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IUsuarioService
{
    Task<IEnumerable<UsuarioDto>> GetAllUsuariosAsync();
    Task<UsuarioDto?> GetUsuarioByIdAsync(int id);
    Task AddUsuarioAsync(UsuarioDto usuarioDto);
    Task UpdateUsuarioAsync(UsuarioDto usuarioDto);
    Task DeleteUsuarioAsync(int id);
    Task<UsuarioDto?> GetUsuarioByCodigoUsuarioAsync(string codigoUsuario, string password);
    Task<AuthenticationResultDto> AuthenticateUserAsync(string codigoUsuario, string password);
    Task<bool> InitiatePasswordResetAsync(string email);
    Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
}