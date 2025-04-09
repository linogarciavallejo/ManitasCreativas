namespace ManitasCreativas.Application.Interfaces.Repositories;

using ManitasCreativas.Domain.Entities;

public interface IAlumnoRepository
{
    Task<Alumno?> GetByIdAsync(int id);
    Task<IEnumerable<Alumno>> GetAllAsync();
    Task AddAsync(Alumno alumno);
    Task UpdateAsync(Alumno alumno);
    Task DeleteAsync(int id);
    Task<Alumno?> GetByCodigoAsync(string codigo);
    Task<Alumno?> GetAlumnoByCodigoAsync(string codigo);
    Task<IEnumerable<Alumno>> GetAlumnosByNamesAsync(string nombre, string apellido);
    Task<Alumno?> GetAlumnoWithFullPaymentDetailsAsync(int id);
}