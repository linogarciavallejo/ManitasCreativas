namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class AlumnoRepository : IAlumnoRepository
{
    private readonly AppDbContext _context;

    public AlumnoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Alumno?> GetByIdAsync(int id)
    {
        return await _context.Alumnos.FindAsync(id);
    }

    public async Task<IEnumerable<Alumno>> GetAllAsync()
    {
        return await _context.Alumnos.ToListAsync();
    }

    public async Task AddAsync(Alumno alumno)
    {
        await _context.Alumnos.AddAsync(alumno);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Alumno alumno)
    {
        _context.Alumnos.Update(alumno);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var alumno = await GetByIdAsync(id);
        if (alumno != null)
        {
            _context.Alumnos.Remove(alumno);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Alumno?> GetByCodigoAsync(string codigo)
    {
        return await _context.Alumnos.FirstOrDefaultAsync(a => a.Codigo == codigo);
    }
}