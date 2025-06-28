namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IRubroUniformeDetalleRepository
{
    Task<RubroUniformeDetalle?> GetByIdAsync(int id);
    Task<IEnumerable<RubroUniformeDetalle>> GetByRubroIdAsync(int rubroId);
    Task<IEnumerable<RubroUniformeDetalle>> GetByPrendaUniformeIdAsync(int prendaUniformeId);
    Task<RubroUniformeDetalle?> GetByRubroIdAndPrendaUniformeIdAsync(int rubroId, int prendaUniformeId);
    Task<IEnumerable<RubroUniformeDetalle>> GetAllAsync();
    Task<IEnumerable<RubroUniformeDetalle>> GetAllWithRelatedDataAsync();
    Task<IEnumerable<RubroUniformeDetalle>> GetActiveAsync();
    Task AddAsync(RubroUniformeDetalle rubroUniformeDetalle);
    Task UpdateAsync(RubroUniformeDetalle rubroUniformeDetalle);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int rubroId, int prendaUniformeId);
}
