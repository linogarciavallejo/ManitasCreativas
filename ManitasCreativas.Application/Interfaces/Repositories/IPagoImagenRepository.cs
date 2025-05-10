using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Interfaces.Repositories
{
    public interface IPagoImagenRepository
    {
        Task<PagoImagen?> GetByIdAsync(int id);
        Task<IEnumerable<PagoImagen>> GetAllAsync();
        Task AddAsync(PagoImagen pagoImagen);
        Task UpdateAsync(PagoImagen pagoImagen);
        Task DeleteAsync(int id);
        
        // Additional methods needed for PagoService
        Task<IEnumerable<PagoImagen>> GetByPagoIdAsync(int pagoId);
        Task AddRangeAsync(IEnumerable<PagoImagen> pagoImagenes);
        Task DeleteRangeAsync(IEnumerable<PagoImagen> pagoImagenes);
    }
}
