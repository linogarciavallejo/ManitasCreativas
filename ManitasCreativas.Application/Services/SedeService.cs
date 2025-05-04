using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Services;

public class SedeService : ISedeService
{
    private readonly ISedeRepository _sedeRepository;

    public SedeService(ISedeRepository sedeRepository)
    {
        _sedeRepository = sedeRepository;
    }

    public async Task<IEnumerable<SedeDto>> GetAllSedesAsync()
    {
        var sedes = await _sedeRepository.GetAllAsync();
        return sedes.Select(MapToDto);
    }

    public async Task<SedeDto?> GetSedeByIdAsync(int id)
    {
        var sede = await _sedeRepository.GetByIdAsync(id);
        return sede != null ? MapToDto(sede) : null;
    }

    public async Task AddSedeAsync(SedeDto sedeDto)
    {
        var sede = new Sede
        {
            Nombre = sedeDto.Nombre,
            Direccion = sedeDto.Direccion
        };
        
        await _sedeRepository.AddAsync(sede);
        sedeDto.Id = sede.Id; // Update the DTO with the new ID
    }

    public async Task UpdateSedeAsync(SedeDto sedeDto)
    {
        var sede = new Sede
        {
            Id = sedeDto.Id,
            Nombre = sedeDto.Nombre,
            Direccion = sedeDto.Direccion
        };
        
        await _sedeRepository.UpdateAsync(sede);
    }

    public async Task DeleteSedeAsync(int id)
    {
        await _sedeRepository.DeleteAsync(id);
    }

    private static SedeDto MapToDto(Sede sede)
    {
        return new SedeDto
        {
            Id = sede.Id,
            Nombre = sede.Nombre,
            Direccion = sede.Direccion
        };
    }
}