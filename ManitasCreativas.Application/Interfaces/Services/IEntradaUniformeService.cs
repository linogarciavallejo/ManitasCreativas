namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IEntradaUniformeService
{
    Task<IEnumerable<EntradaUniformeDto>> GetAllAsync();
    Task<EntradaUniformeDto?> GetByIdAsync(int id);
    Task<EntradaUniformeDto?> GetByIdWithDetallesAsync(int id);
    Task<IEnumerable<EntradaUniformeDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<EntradaUniformeDto>> GetByUsuarioCreacionIdAsync(int usuarioId);
    Task<IEnumerable<EntradaUniformeDto>> GetActiveAsync();
    Task<EntradaUniformeDto> CreateAsync(EntradaUniformeCreateDto createDto, int usuarioCreacionId);
    Task<EntradaUniformeDto> UpdateAsync(int id, EntradaUniformeCreateDto updateDto, int usuarioActualizacionId);
    Task<bool> DeleteAsync(int id, string motivoEliminacion, int usuarioEliminacionId);
    Task<bool> ExistsAsync(int id);
}
