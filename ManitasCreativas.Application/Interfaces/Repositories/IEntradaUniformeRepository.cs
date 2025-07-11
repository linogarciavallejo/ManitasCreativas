namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IEntradaUniformeRepository
{
    Task<EntradaUniforme?> GetByIdAsync(int id);
    Task<EntradaUniforme?> GetByIdWithDetallesAsync(int id);
    Task<IEnumerable<EntradaUniforme>> GetAllAsync();
    Task<IEnumerable<EntradaUniforme>> GetAllWithDetallesAsync();
    Task<IEnumerable<EntradaUniforme>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<EntradaUniforme>> GetByUsuarioCreacionIdAsync(int usuarioId);
    Task<IEnumerable<EntradaUniforme>> GetActiveAsync();
    Task AddAsync(EntradaUniforme entradaUniforme);
    Task UpdateAsync(EntradaUniforme entradaUniforme);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
