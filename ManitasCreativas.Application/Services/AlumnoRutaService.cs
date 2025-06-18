using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ManitasCreativas.Application.Services;

public class AlumnoRutaService : IAlumnoRutaService
{
    private readonly IAlumnoRutaRepository _alumnoRutaRepository;
    private readonly IAlumnoRepository _alumnoRepository;
    private readonly IRubroRepository _rubroRepository;

    public AlumnoRutaService(
        IAlumnoRutaRepository alumnoRutaRepository, 
        IAlumnoRepository alumnoRepository, 
        IRubroRepository rubroRepository)
    {
        _alumnoRutaRepository = alumnoRutaRepository;
        _alumnoRepository = alumnoRepository;
        _rubroRepository = rubroRepository;
    }

    public async Task<IEnumerable<AlumnoRutaDto>> GetByAlumnoIdAsync(int alumnoId)
    {
        var alumnoRutas = await _alumnoRutaRepository.GetByAlumnoIdAsync(alumnoId);
        return alumnoRutas.Select(ar => new AlumnoRutaDto
        {
            AlumnoId = ar.AlumnoId,
            RubroTransporteId = ar.RubroTransporteId,
            FechaInicio = ar.FechaInicio,
            FechaFin = ar.FechaFin
        });
    }

    public async Task<AlumnoRutaDto?> GetByIdsAsync(int alumnoId, int rubroTransporteId)
    {
        var alumnoRuta = await _alumnoRutaRepository.GetByIdsAsync(alumnoId, rubroTransporteId);
        if (alumnoRuta == null)
        {
            return null;
        }

        return new AlumnoRutaDto
        {
            AlumnoId = alumnoRuta.AlumnoId,
            RubroTransporteId = alumnoRuta.RubroTransporteId,
            FechaInicio = alumnoRuta.FechaInicio,
            FechaFin = alumnoRuta.FechaFin
        };
    }

    public async Task AddAsync(AlumnoRutaDto alumnoRutaDto)
    {
        // Validate that the alumno exists
        var alumno = await _alumnoRepository.GetByIdAsync(alumnoRutaDto.AlumnoId);
        if (alumno == null)
        {
            throw new KeyNotFoundException($"Alumno with ID {alumnoRutaDto.AlumnoId} not found.");
        }

        // Validate that the rubro exists and is a transport rubro
        var rubro = await _rubroRepository.GetByIdAsync(alumnoRutaDto.RubroTransporteId);
        if (rubro == null)
        {
            throw new KeyNotFoundException($"Rubro with ID {alumnoRutaDto.RubroTransporteId} not found.");
        }
        
        // Check if a relation already exists
        var existingRelation = await _alumnoRutaRepository.GetByIdsAsync(
            alumnoRutaDto.AlumnoId, alumnoRutaDto.RubroTransporteId);
            
        if (existingRelation != null)
        {
            throw new InvalidOperationException("This student is already assigned to this transport route.");
        }

        // Validate that FechaInicio is provided
        if (alumnoRutaDto.FechaInicio == default)
        {
            throw new ArgumentException("FechaInicio is required.");
        }

        var alumnoRuta = new AlumnoRuta
        {
            AlumnoId = alumnoRutaDto.AlumnoId,
            RubroTransporteId = alumnoRutaDto.RubroTransporteId,
            FechaInicio = alumnoRutaDto.FechaInicio,
            FechaFin = alumnoRutaDto.FechaFin
        };

        await _alumnoRutaRepository.AddAsync(alumnoRuta);
    }

    public async Task UpdateAsync(AlumnoRutaDto alumnoRutaDto)
    {
        var existingAlumnoRuta = await _alumnoRutaRepository.GetByIdsAsync(
            alumnoRutaDto.AlumnoId, alumnoRutaDto.RubroTransporteId);
            
        if (existingAlumnoRuta == null)
        {
            throw new KeyNotFoundException($"AlumnoRuta with AlumnoId {alumnoRutaDto.AlumnoId} and RubroTransporteId {alumnoRutaDto.RubroTransporteId} not found.");
        }

        // Validate that FechaInicio is provided
        if (alumnoRutaDto.FechaInicio == default)
        {
            throw new ArgumentException("FechaInicio is required.");
        }

        // Update the fields
        existingAlumnoRuta.FechaInicio = alumnoRutaDto.FechaInicio;
        existingAlumnoRuta.FechaFin = alumnoRutaDto.FechaFin;

        await _alumnoRutaRepository.UpdateAsync(existingAlumnoRuta);
    }

    public async Task DeleteAsync(int alumnoId, int rubroTransporteId)
    {
        var alumnoRuta = await _alumnoRutaRepository.GetByIdsAsync(alumnoId, rubroTransporteId);
        if (alumnoRuta == null)
        {
            throw new KeyNotFoundException($"AlumnoRuta with AlumnoId {alumnoId} and RubroTransporteId {rubroTransporteId} not found.");
        }

        await _alumnoRutaRepository.DeleteAsync(alumnoRuta);
    }
}