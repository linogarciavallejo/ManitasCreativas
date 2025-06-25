using ManitasCreativas.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManitasCreativas.Application.Interfaces.Services;

public interface IAlumnoRutaService
{
    Task<IEnumerable<AlumnoRutaDto>> GetByAlumnoIdAsync(int alumnoId);
    Task<AlumnoRutaDto?> GetByIdsAsync(int alumnoId, int rubroTransporteId);
    Task AddAsync(AlumnoRutaDto alumnoRutaDto);
    Task UpdateAsync(AlumnoRutaDto alumnoRutaDto);
    Task DeleteAsync(int alumnoId, int rubroTransporteId);
    Task<IEnumerable<AlumnoRutaDetailedDto>> GetStudentsByRouteAsync(int rubroTransporteId);
}