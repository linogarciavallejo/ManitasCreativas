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
        }        // Validate that FechaInicio is provided
        if (alumnoRutaDto.FechaInicio == default)
        {
            throw new ArgumentException("FechaInicio is required.");
        }

        var alumnoRuta = new AlumnoRuta
        {
            AlumnoId = alumnoRutaDto.AlumnoId,
            RubroTransporteId = alumnoRutaDto.RubroTransporteId,
            FechaInicio = DateTime.SpecifyKind(alumnoRutaDto.FechaInicio, DateTimeKind.Utc),
            FechaFin = alumnoRutaDto.FechaFin.HasValue ? DateTime.SpecifyKind(alumnoRutaDto.FechaFin.Value, DateTimeKind.Utc) : null
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
        }        // Update the fields
        existingAlumnoRuta.FechaInicio = DateTime.SpecifyKind(alumnoRutaDto.FechaInicio, DateTimeKind.Utc);
        existingAlumnoRuta.FechaFin = alumnoRutaDto.FechaFin.HasValue ? DateTime.SpecifyKind(alumnoRutaDto.FechaFin.Value, DateTimeKind.Utc) : null;        await _alumnoRutaRepository.UpdateAsync(existingAlumnoRuta);
    }

    public async Task DeleteAsync(int alumnoId, int rubroTransporteId)
    {
        Console.WriteLine(
            $"AlumnoRutaService.DeleteAsync called with alumnoId: {alumnoId}, rubroTransporteId: {rubroTransporteId}");
        
        var alumnoRuta = await _alumnoRutaRepository.GetByIdsAsync(alumnoId, rubroTransporteId);
        if (alumnoRuta == null)
        {
            Console.WriteLine(
                $"AlumnoRuta not found with AlumnoId {alumnoId} and RubroTransporteId {rubroTransporteId}");
            throw new KeyNotFoundException(
                $"AlumnoRuta with AlumnoId {alumnoId} and RubroTransporteId {rubroTransporteId} not found.");
        }

        Console.WriteLine(
            $"Found AlumnoRuta to delete: AlumnoId={alumnoRuta.AlumnoId}, RubroTransporteId={alumnoRuta.RubroTransporteId}");
        await _alumnoRutaRepository.DeleteAsync(alumnoRuta);
        Console.WriteLine("AlumnoRuta successfully deleted");
    }

    public async Task<IEnumerable<AlumnoRutaDetailedDto>> GetStudentsByRouteAsync(
        int rubroTransporteId)
    {
        var alumnoRutas = await _alumnoRutaRepository.GetByRubroTransporteIdAsync(
            rubroTransporteId);
        var result = new List<AlumnoRutaDetailedDto>();

        foreach (var alumnoRuta in alumnoRutas)
        {
            var alumno = await _alumnoRepository.GetByIdAsync(alumnoRuta.AlumnoId);
            if (alumno != null)
            {
                var primerApellido = alumno.PrimerApellido ?? "";
                var segundoApellido = alumno.SegundoApellido ?? "";
                var primerNombre = alumno.PrimerNombre ?? "";
                var segundoNombre = alumno.SegundoNombre ?? "";
                
                var apellidos = $"{primerApellido} {segundoApellido}".Trim();
                var nombres = $"{primerNombre} {segundoNombre}".Trim();
                var nombreCompleto = $"{apellidos}, {nombres}";

                var detailedDto = new AlumnoRutaDetailedDto
                {
                    AlumnoId = alumnoRuta.AlumnoId,
                    RubroTransporteId = alumnoRuta.RubroTransporteId,
                    FechaInicio = alumnoRuta.FechaInicio,
                    FechaFin = alumnoRuta.FechaFin,
                    AlumnoNombre = nombres,
                    AlumnoApellidos = apellidos,
                    AlumnoCompleto = nombreCompleto,
                    Grado = alumno.Grado?.Nombre ?? "",
                    Seccion = alumno.Seccion ?? "",
                    Sede = alumno.Sede?.Nombre ?? ""
                };

                result.Add(detailedDto);
            }
        }

        // Sort alphabetically by the concatenation as specified in requirements
        return result.OrderBy(x => x.AlumnoCompleto.ToLower()).ToList();
    }
}