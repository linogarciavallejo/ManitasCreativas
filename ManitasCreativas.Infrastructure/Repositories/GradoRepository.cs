namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class GradoRepository : IGradoRepository
{
    private readonly AppDbContext _context;

    public GradoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Grado>> GetAllAsync()
    {
        return await _context.Grados
            .Include(g => g.NivelEducativo)
            .ToListAsync();
    }

    public async Task<Grado?> GetByIdAsync(int id)
    {
        return await _context.Grados
            .Include(g => g.NivelEducativo)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<IEnumerable<Grado>> GetByNivelEducativoIdAsync(int nivelEducativoId)
    {
        return await _context.Grados
            .Include(g => g.NivelEducativo)
            .Where(g => g.NivelEducativoId == nivelEducativoId)
            .ToListAsync();
    }

    // Remove this method or replace with appropriate logic
    // since Activo property no longer exists
    public async Task<IEnumerable<Grado>> GetActiveAsync()
    {
        return await _context.Grados
            .Include(g => g.NivelEducativo)
            .ToListAsync(); // Return all grades since we don't have Activo flag anymore
    }

    public async Task<Grado> CreateAsync(Grado grado)
    {
        _context.Grados.Add(grado);
        await _context.SaveChangesAsync();
        return grado;
    }

    public async Task UpdateAsync(Grado grado)
    {
        _context.Grados.Update(grado);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var grado = await _context.Grados.FindAsync(id);
        if (grado != null)
        {
            // Instead of setting Activo=false, actually remove the entity
            _context.Grados.Remove(grado);
            await _context.SaveChangesAsync();
        }
    }
}
