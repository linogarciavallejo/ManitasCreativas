using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ManitasCreativas.Infrastructure.Repositories;

public class AlumnoContactoRepository : IAlumnoContactoRepository
{
    private readonly AppDbContext _context;

    public AlumnoContactoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AlumnoContacto>> GetByAlumnoIdAsync(int alumnoId)
    {
        return await _context.AlumnoContactos
            .Include(ac => ac.Contacto)
            .Where(ac => ac.AlumnoId == alumnoId)
            .ToListAsync();
    }

    public async Task<AlumnoContacto?> GetByIdsAsync(int alumnoId, int contactoId)
    {
        return await _context.AlumnoContactos
            .FirstOrDefaultAsync(ac => ac.AlumnoId == alumnoId && ac.ContactoId == contactoId);
    }

    public async Task AddAsync(AlumnoContacto alumnoContacto)
    {
        await _context.AlumnoContactos.AddAsync(alumnoContacto);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(AlumnoContacto alumnoContacto)
    {
        _context.AlumnoContactos.Update(alumnoContacto);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(AlumnoContacto alumnoContacto)
    {
        _context.AlumnoContactos.Remove(alumnoContacto);
        await _context.SaveChangesAsync();
    }
}