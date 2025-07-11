namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByIdAsync(int id);
    Task<IEnumerable<Usuario>> GetAllAsync();
    Task AddAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
    Task DeleteAsync(int id);
    Task<Usuario?> GetByCodigoUsuarioAsync(string codigoUsuario, string password);
    Task<Usuario?> GetByEmailAsync(string email);
    Task<Usuario?> GetByPasswordResetTokenAsync(string token);
}