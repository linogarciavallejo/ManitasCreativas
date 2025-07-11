namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IPrendaUniformeService
{
    Task<IEnumerable<PrendaUniformeDto>> GetAllAsync();
    Task<IEnumerable<PrendaUniformeSimpleDto>> GetAllSimpleAsync();  
    Task<PrendaUniformeDto?> GetByIdAsync(int id);
    Task<PrendaUniformeDto?> GetByIdWithImagesAsync(int id);
    Task<IEnumerable<PrendaUniformeDto>> GetBySexoAsync(string sexo);
    Task<IEnumerable<PrendaUniformeDto>> GetByTallaAsync(string talla);
    Task<IEnumerable<PrendaUniformeDto>> GetBySexoAndTallaAsync(string sexo, string talla);
    Task<IEnumerable<PrendaUniformeDto>> GetActiveAsync();
    Task<PrendaUniformeDto> CreateAsync(PrendaUniformeCreateDto createDto, int usuarioCreacionId);
    Task<PrendaUniformeDto> UpdateAsync(int id, PrendaUniformeCreateDto updateDto, int usuarioActualizacionId);
    Task<bool> DeleteAsync(int id, string motivoEliminacion, int usuarioEliminacionId);
    Task<bool> ExistsAsync(int id);
    Task UpdateStockAsync(int id, int entradas, int salidas);
}
