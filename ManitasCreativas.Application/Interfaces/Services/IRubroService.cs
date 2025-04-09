namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IRubroService
{
    Task<IEnumerable<RubroDto>> GetAllRubrosAsync();
    Task<RubroDto?> GetRubroByIdAsync(int id);
    Task AddRubroAsync(RubroDto rubroDto);
    Task UpdateRubroAsync(RubroDto rubroDto);
    Task DeleteRubroAsync(int id);
}
