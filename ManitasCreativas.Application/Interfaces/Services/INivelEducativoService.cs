namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface INivelEducativoService
{
    Task<IEnumerable<NivelEducativoDto>> GetAllNivelesEducativosAsync();
    Task<IEnumerable<NivelEducativoDto>> GetAllActiveNivelesEducativosAsync();
    Task<NivelEducativoDto?> GetNivelEducativoByIdAsync(int id);
    Task AddNivelEducativoAsync(NivelEducativoDto nivelEducativoDto);
    Task UpdateNivelEducativoAsync(NivelEducativoDto nivelEducativoDto);
    Task DeleteNivelEducativoAsync(int id);
}