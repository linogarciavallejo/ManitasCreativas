namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface ISedeRepository
{
    Task<Sede?> GetByIdAsync(int id);
    Task<IEnumerable<Sede>> GetAllAsync();
    Task AddAsync(Sede sede);
    Task UpdateAsync(Sede sede);
    Task DeleteAsync(int id);
}