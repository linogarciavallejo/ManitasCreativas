namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IRubroUniformeDetalleService
{
    Task<IEnumerable<RubroUniformeDetalleDto>> GetAllAsync();
    Task<RubroUniformeDetalleDto?> GetByIdAsync(int id);
    Task<IEnumerable<RubroUniformeDetalleDto>> GetByRubroIdAsync(int rubroId);
    Task<IEnumerable<RubroUniformeDetalleDto>> GetByPrendaUniformeIdAsync(int prendaUniformeId);
    Task<RubroUniformeDetalleDto?> GetByRubroIdAndPrendaUniformeIdAsync(int rubroId, int prendaUniformeId);
    Task<IEnumerable<RubroUniformeDetalleDto>> GetActiveAsync();
    Task<RubroUniformeDetalleDto> CreateAsync(RubroUniformeDetalleCreateDto createDto, int usuarioCreacionId);
    Task<RubroUniformeDetalleDto> UpdateAsync(int id, RubroUniformeDetalleCreateDto updateDto, int usuarioActualizacionId);
    Task<bool> DeleteAsync(int id, string motivoEliminacion, int usuarioEliminacionId);
    Task<bool> ExistsAsync(int rubroId, int prendaUniformeId);
}
