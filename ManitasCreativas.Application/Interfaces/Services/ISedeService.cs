namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface ISedeService
{
    Task<IEnumerable<SedeDto>> GetAllSedesAsync();
    Task<SedeDto?> GetSedeByIdAsync(int id);
    Task AddSedeAsync(SedeDto sedeDto);
    Task UpdateSedeAsync(SedeDto sedeDto);
    Task DeleteSedeAsync(int id);
}