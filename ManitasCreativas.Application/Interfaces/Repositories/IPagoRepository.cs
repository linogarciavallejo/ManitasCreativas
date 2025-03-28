namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IPagoRepository
{
    Task<Pago?> GetByIdAsync(int id);
    Task<IEnumerable<Pago>> GetAllAsync();
    Task AddAsync(Pago pago);
    Task UpdateAsync(Pago pago);
    Task DeleteAsync(int id);
}