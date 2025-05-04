using ManitasCreativas.Application.DTOs;

namespace ManitasCreativas.Application.Interfaces.Services;

public interface IContactoService
{
    Task<IEnumerable<ContactoDto>> GetAllContactosAsync();
    Task<ContactoDto?> GetContactoByIdAsync(int id);
    Task<ContactoDto> AddContactoAsync(ContactoDto contactoDto);
    Task UpdateContactoAsync(ContactoDto contactoDto);
    Task DeleteContactoAsync(int id);
    Task<IEnumerable<AlumnoContactoDto>> GetContactosByAlumnoIdAsync(int alumnoId);
    Task<AlumnoContactoDto> AssociateContactoWithAlumnoAsync(int alumnoId, int contactoId, string parentesco);
    Task UpdateAlumnoContactoAsync(int alumnoId, int contactoId, string parentesco);
    Task RemoveContactoFromAlumnoAsync(int alumnoId, int contactoId);
}