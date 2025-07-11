namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IPrendaUniformeRepository
{
    Task<PrendaUniforme?> GetByIdAsync(int id);
    Task<PrendaUniforme?> GetByIdWithImagesAsync(int id);
    Task<IEnumerable<PrendaUniforme>> GetAllAsync();
    Task<IEnumerable<PrendaUniforme>> GetAllWithImagesAsync();
    Task<IEnumerable<PrendaUniforme>> GetBySexoAsync(string sexo);
    Task<IEnumerable<PrendaUniforme>> GetByTallaAsync(string talla);
    Task<IEnumerable<PrendaUniforme>> GetBySexoAndTallaAsync(string sexo, string talla);
    Task<IEnumerable<PrendaUniforme>> GetActiveAsync();
    Task AddAsync(PrendaUniforme prendaUniforme);
    Task UpdateAsync(PrendaUniforme prendaUniforme);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
