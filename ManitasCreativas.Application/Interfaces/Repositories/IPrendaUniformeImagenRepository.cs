namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IPrendaUniformeImagenRepository
{
    Task<PrendaUniformeImagen?> GetByIdAsync(int id);
    Task<IEnumerable<PrendaUniformeImagen>> GetByPrendaUniformeIdAsync(int prendaUniformeId);
    Task<IEnumerable<PrendaUniformeImagen>> GetAllAsync();
    Task AddAsync(PrendaUniformeImagen imagen);
    Task AddRangeAsync(IEnumerable<PrendaUniformeImagen> imagenes);
    Task UpdateAsync(PrendaUniformeImagen imagen);
    Task DeleteAsync(int id);
    Task DeleteByPrendaUniformeIdAsync(int prendaUniformeId);
}
