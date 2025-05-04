using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Services;

public class ContactoService : IContactoService
{
    private readonly IContactoRepository _contactoRepository;
    private readonly IAlumnoContactoRepository _alumnoContactoRepository;

    public ContactoService(IContactoRepository contactoRepository, IAlumnoContactoRepository alumnoContactoRepository)
    {
        _contactoRepository = contactoRepository;
        _alumnoContactoRepository = alumnoContactoRepository;
    }

    public async Task<IEnumerable<ContactoDto>> GetAllContactosAsync()
    {
        var contactos = await _contactoRepository.GetAllAsync();
        return contactos.Select(MapToDto);
    }

    public async Task<ContactoDto?> GetContactoByIdAsync(int id)
    {
        var contacto = await _contactoRepository.GetByIdAsync(id);
        return contacto != null ? MapToDto(contacto) : null;
    }

    public async Task<ContactoDto> AddContactoAsync(ContactoDto contactoDto)
    {
        var contacto = new Contacto
        {
            Nombre = contactoDto.Nombre,
            TelefonoTrabajo = contactoDto.TelefonoTrabajo,
            Celular = contactoDto.Celular ?? string.Empty, // Ensure Celular is not null
            Email = contactoDto.Email,
            Direccion = contactoDto.Direccion ?? string.Empty, // Ensure Direccion is not null
            Nit = contactoDto.Nit,
            AlumnosContacto = new List<AlumnoContacto>()
        };

        await _contactoRepository.AddAsync(contacto);
        
        // Update the DTO with the new ID
        contactoDto.Id = contacto.Id;
        
        return contactoDto;
    }

    public async Task UpdateContactoAsync(ContactoDto contactoDto)
    {
        var existingContacto = await _contactoRepository.GetByIdAsync(contactoDto.Id);
        
        if (existingContacto == null)
        {
            throw new KeyNotFoundException($"Contacto with ID {contactoDto.Id} not found");
        }

        // Update properties
        existingContacto.Nombre = contactoDto.Nombre;
        existingContacto.TelefonoTrabajo = contactoDto.TelefonoTrabajo;
        existingContacto.Celular = contactoDto.Celular ?? string.Empty;
        existingContacto.Email = contactoDto.Email;
        existingContacto.Direccion = contactoDto.Direccion ?? string.Empty;
        existingContacto.Nit = contactoDto.Nit;

        await _contactoRepository.UpdateAsync(existingContacto);
    }

    public async Task DeleteContactoAsync(int id)
    {
        await _contactoRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<AlumnoContactoDto>> GetContactosByAlumnoIdAsync(int alumnoId)
    {
        var alumnoContactos = await _alumnoContactoRepository.GetByAlumnoIdAsync(alumnoId);
        return alumnoContactos.Select(ac => new AlumnoContactoDto
        {
            AlumnoId = ac.AlumnoId,
            ContactoId = ac.ContactoId,
            Contacto = MapToDto(ac.Contacto),
            Parentesco = ac.Parentesco
        });
    }

    public async Task<AlumnoContactoDto> AssociateContactoWithAlumnoAsync(int alumnoId, int contactoId, string parentesco)
    {
        // Check if the association already exists
        var existingAssociation = await _alumnoContactoRepository.GetByIdsAsync(alumnoId, contactoId);
        
        if (existingAssociation != null)
        {
            throw new InvalidOperationException("This contact is already associated with this student");
        }

        // Get the contact to ensure it exists
        var contacto = await _contactoRepository.GetByIdAsync(contactoId);
        
        if (contacto == null)
        {
            throw new KeyNotFoundException($"Contacto with ID {contactoId} not found");
        }

        // Create new association
        var alumnoContacto = new AlumnoContacto
        {
            AlumnoId = alumnoId,
            ContactoId = contactoId,
            Parentesco = parentesco
        };

        await _alumnoContactoRepository.AddAsync(alumnoContacto);

        // Return DTO with contact information
        return new AlumnoContactoDto
        {
            AlumnoId = alumnoId,
            ContactoId = contactoId,
            Contacto = MapToDto(contacto),
            Parentesco = parentesco
        };
    }

    public async Task UpdateAlumnoContactoAsync(int alumnoId, int contactoId, string parentesco)
    {
        var existingAssociation = await _alumnoContactoRepository.GetByIdsAsync(alumnoId, contactoId);
        
        if (existingAssociation == null)
        {
            throw new KeyNotFoundException("Association between this student and contact not found");
        }

        existingAssociation.Parentesco = parentesco;
        await _alumnoContactoRepository.UpdateAsync(existingAssociation);
    }

    public async Task RemoveContactoFromAlumnoAsync(int alumnoId, int contactoId)
    {
        var existingAssociation = await _alumnoContactoRepository.GetByIdsAsync(alumnoId, contactoId);
        
        if (existingAssociation == null)
        {
            throw new KeyNotFoundException("Association between this student and contact not found");
        }

        await _alumnoContactoRepository.DeleteAsync(existingAssociation);
    }

    // Helper method to map Entity to DTO
    private static ContactoDto MapToDto(Contacto contacto)
    {
        return new ContactoDto
        {
            Id = contacto.Id,
            Nombre = contacto.Nombre,
            TelefonoTrabajo = contacto.TelefonoTrabajo,
            Celular = contacto.Celular,
            Email = contacto.Email,
            Direccion = contacto.Direccion,
            Nit = contacto.Nit
        };
    }
}