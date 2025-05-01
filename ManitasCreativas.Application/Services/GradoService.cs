using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Services;

public class GradoService : IGradoService
{
    private readonly IGradoRepository _gradoRepository;
    private readonly INivelEducativoRepository _nivelEducativoRepository;

    public GradoService(IGradoRepository gradoRepository, INivelEducativoRepository nivelEducativoRepository)
    {
        _gradoRepository = gradoRepository;
        _nivelEducativoRepository = nivelEducativoRepository;
    }

    public async Task<IEnumerable<GradoDto>> GetAllAsync()
    {
        var grados = await _gradoRepository.GetAllAsync();
        return grados.Select(MapToDto);
    }

    public async Task<GradoDto?> GetByIdAsync(int id)
    {
        var grado = await _gradoRepository.GetByIdAsync(id);
        return grado != null ? MapToDto(grado) : null;
    }

    public async Task<IEnumerable<GradoDto>> GetByNivelEducativoIdAsync(int nivelEducativoId)
    {
        var grados = await _gradoRepository.GetByNivelEducativoIdAsync(nivelEducativoId);
        return grados.Select(MapToDto);
    }

    public async Task<GradoDto> CreateAsync(GradoDto gradoDto, string usuarioCreacion)
    {
        // Validate that the NivelEducativo exists
        var nivelEducativo = await _nivelEducativoRepository.GetByIdAsync(gradoDto.NivelEducativoId);
        if (nivelEducativo == null)
        {
            throw new ArgumentException($"El nivel educativo con ID {gradoDto.NivelEducativoId} no existe");
        }

        var grado = new Grado
        {
            Nombre = gradoDto.Nombre,
            Descripcion = gradoDto.Descripcion,
            NivelEducativoId = gradoDto.NivelEducativoId,
        };

        var createdGrado = await _gradoRepository.CreateAsync(grado);
        return MapToDto(createdGrado);
    }

    public async Task UpdateAsync(GradoDto gradoDto, string usuarioActualizacion)
    {
        var existingGrado = await _gradoRepository.GetByIdAsync(gradoDto.Id);
        if (existingGrado == null)
        {
            throw new ArgumentException($"El grado con ID {gradoDto.Id} no existe");
        }

        // Validate that the NivelEducativo exists
        var nivelEducativo = await _nivelEducativoRepository.GetByIdAsync(gradoDto.NivelEducativoId);
        if (nivelEducativo == null)
        {
            throw new ArgumentException($"El nivel educativo con ID {gradoDto.NivelEducativoId} no existe");
        }

        existingGrado.Nombre = gradoDto.Nombre;
        existingGrado.Descripcion = gradoDto.Descripcion;
        existingGrado.NivelEducativoId = gradoDto.NivelEducativoId;

        await _gradoRepository.UpdateAsync(existingGrado);
    }

    public async Task DeleteAsync(int id)
    {
        var existingGrado = await _gradoRepository.GetByIdAsync(id);
        if (existingGrado == null)
        {
            throw new ArgumentException($"El grado con ID {id} no existe");
        }

        await _gradoRepository.DeleteAsync(id);
    }

    private static GradoDto MapToDto(Grado grado)
    {
        return new GradoDto
        {
            Id = grado.Id,
            Nombre = grado.Nombre,
            Descripcion = grado.Descripcion,
            NivelEducativoId = grado.NivelEducativoId,
            NivelEducativoNombre = grado.NivelEducativo?.Nombre ?? string.Empty,
        };
    }

    Task<GradoDto> IGradoService.CreateAsync(GradoDto gradoDto)
    {
        throw new NotImplementedException();
    }

    Task IGradoService.UpdateAsync(int id, GradoDto gradoDto)
    {
        throw new NotImplementedException();
    }
}