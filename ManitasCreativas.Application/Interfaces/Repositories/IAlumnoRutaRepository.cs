using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Interfaces.Repositories;

public interface IAlumnoRutaRepository
{
    Task<IEnumerable<AlumnoRuta>> GetByAlumnoIdAsync(int alumnoId);
    Task<AlumnoRuta?> GetByIdsAsync(int alumnoId, int rubroTransporteId);
    Task AddAsync(AlumnoRuta alumnoRuta);
    Task UpdateAsync(AlumnoRuta alumnoRuta);
    Task DeleteAsync(AlumnoRuta alumnoRuta);
}