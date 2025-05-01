using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Interfaces.Repositories;

public interface IGradoRepository
{
    Task<IEnumerable<Grado>> GetAllAsync();
    Task<Grado?> GetByIdAsync(int id);
    Task<IEnumerable<Grado>> GetByNivelEducativoIdAsync(int nivelEducativoId);
    Task<IEnumerable<Grado>> GetActiveAsync();
    Task<Grado> CreateAsync(Grado grado);
    Task UpdateAsync(Grado grado);
    Task DeleteAsync(int id);
}