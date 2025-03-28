namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IRolRepository
{
    Task<Rol?> GetByIdAsync(int id);
    Task<IEnumerable<Rol>> GetAllAsync();
    Task AddAsync(Rol rol);
    Task UpdateAsync(Rol rol);
    Task DeleteAsync(int id);
}