namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IRubroRepository
{
    Task<Rubro?> GetByIdAsync(int id);
    Task<IEnumerable<Rubro>> GetAllAsync();
    Task AddAsync(Rubro rubro);
    Task UpdateAsync(Rubro rubro);
    Task DeleteAsync(int id);
    Task<IEnumerable<Rubro>> GetAllActiveAsync();

}