namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IUsuarioService
{
    Task<IEnumerable<UsuarioDto>> GetAllUsuariosAsync();
    Task<UsuarioDto?> GetUsuarioByIdAsync(int id);
    Task AddUsuarioAsync(UsuarioDto usuarioDto);
    Task UpdateUsuarioAsync(UsuarioDto usuarioDto);
    Task DeleteUsuarioAsync(int id);
    Task<UsuarioDto?> GetUsuarioByCodigoUsuarioAsync(string codigoUsuario);
}