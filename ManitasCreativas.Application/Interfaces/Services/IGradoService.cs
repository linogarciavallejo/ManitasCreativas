using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Interfaces.Services;

public interface IGradoService
{
    Task<IEnumerable<GradoDto>> GetAllAsync();
    Task<GradoDto?> GetByIdAsync(int id);
    Task<IEnumerable<GradoDto>> GetByNivelEducativoIdAsync(int nivelEducativoId);
    Task<GradoDto> CreateAsync(GradoDto gradoDto);
    Task UpdateAsync(int id, GradoDto gradoDto);
    Task DeleteAsync(int id);
}