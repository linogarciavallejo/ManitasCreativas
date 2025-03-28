namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class AlumnoContactoRepository
{
    private readonly AppDbContext _context;

    public AlumnoContactoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AlumnoContacto?> GetByIdAsync(int id)
    {
        return await _context.AlumnoContactos.FindAsync(id);
    }

    public async Task<IEnumerable<AlumnoContacto>> GetAllAsync()
    {
        return await _context.AlumnoContactos.ToListAsync();
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

    public async Task DeleteAsync(int id)
    {
        var alumnoContacto = await GetByIdAsync(id);
        if (alumnoContacto != null)
        {
            _context.AlumnoContactos.Remove(alumnoContacto);
            await _context.SaveChangesAsync();
        }
    }
}