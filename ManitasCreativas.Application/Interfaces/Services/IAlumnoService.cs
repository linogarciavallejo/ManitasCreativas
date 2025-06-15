namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IAlumnoService
{
    Task<IEnumerable<AlumnoDto>> GetAllAlumnosAsync();
    Task<AlumnoDto?> GetAlumnoByIdAsync(int id);
    Task AddAlumnoAsync(AlumnoDto alumnoDto);
    Task UpdateAlumnoAsync(AlumnoDto alumnoDto);
    Task DeleteAlumnoAsync(int id);
    Task<AlumnoDto?> GetAlumnoByCodigoAsync(string codigo);
    Task<AlumnoDto?> GetAlumnoWithPagosAsync(int id);
    //Task<AlumnoDto?> GetAlumnoByCodigoAsync(string codigo);
    Task<IEnumerable<AlumnoDto>> GetAlumnosByNamesAsync(string nombre, string apellido);

    Task<IEnumerable<AlumnoSimpleDto>> GetAlumnosWithFullNameAsync();

    Task<IEnumerable<PagoReadDto>> GetAlumnoStatementAsync(int id);
    
    Task<bool> IsCodigoUniqueAsync(string codigo, int? excludeAlumnoId = null);
}