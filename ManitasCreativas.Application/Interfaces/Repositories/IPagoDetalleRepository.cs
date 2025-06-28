namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IPagoDetalleRepository
{
    Task<PagoDetalle?> GetByIdAsync(int id);
    Task<IEnumerable<PagoDetalle>> GetByPagoIdAsync(int pagoId);
    Task<IEnumerable<PagoDetalle>> GetByRubroUniformeDetalleIdAsync(int rubroUniformeDetalleId);
    Task<IEnumerable<PagoDetalle>> GetAllAsync();
    Task<IEnumerable<PagoDetalle>> GetAllWithRelatedDataAsync();
    Task AddAsync(PagoDetalle pagoDetalle);
    Task AddRangeAsync(IEnumerable<PagoDetalle> pagoDetalles);
    Task UpdateAsync(PagoDetalle pagoDetalle);
    Task DeleteAsync(int id);
    Task DeleteByPagoIdAsync(int pagoId);
}
