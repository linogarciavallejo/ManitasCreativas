namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IGradoRepository
{
    Task<Grado?> GetByIdAsync(int id);
    Task<IEnumerable<Grado>> GetAllAsync();
    Task AddAsync(Grado grado);
    Task UpdateAsync(Grado grado);
    Task DeleteAsync(int id);
}