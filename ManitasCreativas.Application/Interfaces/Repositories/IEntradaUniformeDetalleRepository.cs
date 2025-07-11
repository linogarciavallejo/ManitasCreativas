namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IEntradaUniformeDetalleRepository
{
    Task<EntradaUniformeDetalle?> GetByIdAsync(int id);
    Task<IEnumerable<EntradaUniformeDetalle>> GetByEntradaUniformeIdAsync(int entradaUniformeId);
    Task<IEnumerable<EntradaUniformeDetalle>> GetByPrendaUniformeIdAsync(int prendaUniformeId);
    Task<IEnumerable<EntradaUniformeDetalle>> GetAllAsync();
    Task AddAsync(EntradaUniformeDetalle detalle);
    Task AddRangeAsync(IEnumerable<EntradaUniformeDetalle> detalles);
    Task UpdateAsync(EntradaUniformeDetalle detalle);
    Task DeleteAsync(int id);
    Task DeleteByEntradaUniformeIdAsync(int entradaUniformeId);
}
