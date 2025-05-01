namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface INivelEducativoRepository
{
    Task<IEnumerable<NivelEducativo>> GetAllAsync();
    Task<IEnumerable<NivelEducativo>> GetAllActiveAsync();
    Task<NivelEducativo?> GetByIdAsync(int id);
    Task AddAsync(NivelEducativo nivelEducativo);
    Task UpdateAsync(NivelEducativo nivelEducativo);
    Task DeleteAsync(int id);
}