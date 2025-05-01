namespace ManitasCreativas.Application.Services;

using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class NivelEducativoService : INivelEducativoService
{
    private readonly INivelEducativoRepository _nivelEducativoRepository;

    public NivelEducativoService(INivelEducativoRepository nivelEducativoRepository)
    {
        _nivelEducativoRepository = nivelEducativoRepository;
    }

    public async Task<IEnumerable<NivelEducativoDto>> GetAllNivelesEducativosAsync()
    {
        var nivelesEducativos = await _nivelEducativoRepository.GetAllAsync();
        return nivelesEducativos.Select(MapToDto);
    }

    public async Task<IEnumerable<NivelEducativoDto>> GetAllActiveNivelesEducativosAsync()
    {
        var nivelesEducativos = await _nivelEducativoRepository.GetAllActiveAsync();
        return nivelesEducativos.Select(MapToDto);
    }

    public async Task<NivelEducativoDto?> GetNivelEducativoByIdAsync(int id)
    {
        var nivelEducativo = await _nivelEducativoRepository.GetByIdAsync(id);
        return nivelEducativo != null ? MapToDto(nivelEducativo) : null;
    }

    public async Task AddNivelEducativoAsync(NivelEducativoDto nivelEducativoDto)
    {
        var nivelEducativo = new NivelEducativo
        {
            Nombre = nivelEducativoDto.Nombre,
            Activo = nivelEducativoDto.Activo,
        };

        await _nivelEducativoRepository.AddAsync(nivelEducativo);
    }

    public async Task UpdateNivelEducativoAsync(NivelEducativoDto nivelEducativoDto)
    {
        var existingNivelEducativo = await _nivelEducativoRepository.GetByIdAsync(nivelEducativoDto.Id);
        if (existingNivelEducativo == null)
        {
            throw new KeyNotFoundException($"NivelEducativo with ID {nivelEducativoDto.Id} not found.");
        }

        existingNivelEducativo.Nombre = nivelEducativoDto.Nombre;
        existingNivelEducativo.Activo = nivelEducativoDto.Activo;

        await _nivelEducativoRepository.UpdateAsync(existingNivelEducativo);
    }

    public async Task DeleteNivelEducativoAsync(int id)
    {
        await _nivelEducativoRepository.DeleteAsync(id);
    }

    private static NivelEducativoDto MapToDto(NivelEducativo nivelEducativo)
    {
        return new NivelEducativoDto
        {
            Id = nivelEducativo.Id,
            Nombre = nivelEducativo.Nombre,
            Activo = (bool)nivelEducativo.Activo,
        };
    }
}