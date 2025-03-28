namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IContactoRepository
{
    Task<Contacto?> GetByIdAsync(int id);
    Task<IEnumerable<Contacto>> GetAllAsync();
    Task AddAsync(Contacto contacto);
    Task UpdateAsync(Contacto contacto);
    Task DeleteAsync(int id);
}