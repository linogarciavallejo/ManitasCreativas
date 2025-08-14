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
            Id = ar.Id,
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
            Id = alumnoRuta.Id,
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
        
        // Check for date-based overlapping assignments across all routes
        var allStudentAssignments = await _alumnoRutaRepository.GetByAlumnoIdAsync(alumnoRutaDto.AlumnoId);
        
        foreach (var existingAssignment in allStudentAssignments)
        {
            // Check if new assignment dates overlap with any existing assignment (any route)
            if (DateRangesOverlap(
                alumnoRutaDto.FechaInicio, 
                alumnoRutaDto.FechaFin,
                existingAssignment.FechaInicio, 
                existingAssignment.FechaFin))
            {
                var existingRubro = await _rubroRepository.GetByIdAsync(existingAssignment.RubroTransporteId);
                var existingRouteDescription = existingRubro?.Descripcion ?? "ruta desconocida";
                
                throw new InvalidOperationException($"Student assignment dates overlap with existing assignment to route '{existingRouteDescription}' from {existingAssignment.FechaInicio:yyyy-MM-dd} to {(existingAssignment.FechaFin?.ToString("yyyy-MM-dd") ?? "ongoing")}.");
            }
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

    // Helper method to check if two date ranges overlap
    private static bool DateRangesOverlap(DateTime start1, DateTime? end1, DateTime start2, DateTime? end2)
    {
        // Convert to UTC for consistent comparison
        var s1 = DateTime.SpecifyKind(start1, DateTimeKind.Utc);
        var e1 = end1.HasValue ? DateTime.SpecifyKind(end1.Value, DateTimeKind.Utc) : (DateTime?)null;
        var s2 = DateTime.SpecifyKind(start2, DateTimeKind.Utc);
        var e2 = end2.HasValue ? DateTime.SpecifyKind(end2.Value, DateTimeKind.Utc) : (DateTime?)null;

        // If either range is ongoing (no end date), check for overlap differently
        if (!e1.HasValue && !e2.HasValue)
        {
            // Both are ongoing, they always overlap
            return true;
        }
        
        if (!e1.HasValue)
        {
            // Range 1 is ongoing, overlap if start1 <= end2
            return e2.HasValue ? s1 <= e2.Value : true;
        }
        
        if (!e2.HasValue)
        {
            // Range 2 is ongoing, overlap if start2 <= end1
            return s2 <= e1.Value;
        }
        
        // Both ranges have end dates, standard overlap check
        return s1 <= e2.Value && s2 <= e1.Value;
    }

    public async Task UpdateAsync(AlumnoRutaDto alumnoRutaDto)
    {
        // Find the specific assignment record by ID (not by AlumnoId + RubroTransporteId)
        // We'll need to update the repository to support GetByIdAsync, but for now use a workaround
        var allStudentAssignments = await _alumnoRutaRepository.GetByAlumnoIdAsync(alumnoRutaDto.AlumnoId);
        var existingAlumnoRuta = allStudentAssignments.FirstOrDefault(ar => ar.Id == alumnoRutaDto.Id);
            
        if (existingAlumnoRuta == null)
        {
            throw new KeyNotFoundException($"AlumnoRuta with ID {alumnoRutaDto.Id} not found.");
        }

        // Validate that FechaInicio is provided
        if (alumnoRutaDto.FechaInicio == default)
        {
            throw new ArgumentException("FechaInicio is required.");
        }

        // Check for date-based overlapping assignments (excluding the current one being updated)
        foreach (var existingAssignment in allStudentAssignments)
        {
            // Skip the current assignment being updated (by ID, not by route)
            if (existingAssignment.Id == alumnoRutaDto.Id)
                continue;
                
            // Check if new date ranges overlap with other assignments
            if (DateRangesOverlap(
                alumnoRutaDto.FechaInicio, 
                alumnoRutaDto.FechaFin,
                existingAssignment.FechaInicio, 
                existingAssignment.FechaFin))
            {
                var existingRubro = await _rubroRepository.GetByIdAsync(existingAssignment.RubroTransporteId);
                var existingRouteDescription = existingRubro?.Descripcion ?? "ruta desconocida";
                
                throw new InvalidOperationException($"Updated assignment dates overlap with existing assignment to route '{existingRouteDescription}' from {existingAssignment.FechaInicio:yyyy-MM-dd} to {(existingAssignment.FechaFin?.ToString("yyyy-MM-dd") ?? "ongoing")}.");
            }
        }

        // Update the fields
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

    // New method to delete by specific assignment ID
    public async Task DeleteByIdAsync(int assignmentId)
    {
        Console.WriteLine($"AlumnoRutaService.DeleteByIdAsync called with assignmentId: {assignmentId}");
        
        try
        {
            // Verify the assignment exists before attempting to delete
            var existingAssignment = await _alumnoRutaRepository.GetByIdAsync(assignmentId);
            if (existingAssignment == null)
            {
                throw new InvalidOperationException($"Assignment with ID {assignmentId} not found.");
            }

            await _alumnoRutaRepository.DeleteByIdAsync(assignmentId);
            Console.WriteLine($"AlumnoRuta with ID {assignmentId} successfully deleted");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting assignment with ID {assignmentId}: {ex.Message}");
            throw;
        }
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
                var tercerNombre = alumno.TercerNombre ?? "";
                
                var apellidos = $"{primerApellido} {segundoApellido}".Trim();
                var nombres = $"{primerNombre} {segundoNombre} {tercerNombre}".Trim();
                var nombreCompleto = $"{apellidos}, {nombres}";

                var detailedDto = new AlumnoRutaDetailedDto
                {
                    Id = alumnoRuta.Id,
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