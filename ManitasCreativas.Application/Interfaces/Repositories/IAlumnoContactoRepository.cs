using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Interfaces.Repositories;

public interface IAlumnoContactoRepository
{
    Task<IEnumerable<AlumnoContacto>> GetByAlumnoIdAsync(int alumnoId);
    Task<AlumnoContacto?> GetByIdsAsync(int alumnoId, int contactoId);
    Task AddAsync(AlumnoContacto alumnoContacto);
    Task UpdateAsync(AlumnoContacto alumnoContacto);
    Task DeleteAsync(AlumnoContacto alumnoContacto);
}