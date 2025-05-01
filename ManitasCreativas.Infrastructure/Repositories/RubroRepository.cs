namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class RubroRepository : IRubroRepository
{
    private readonly AppDbContext _context;

    public RubroRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Rubro?> GetByIdAsync(int id)
    {
        // Use explicit loading to avoid including non-existent columns
        var rubro = await _context.Rubros
            .Include(r => r.NivelEducativo)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rubro?.GradoId != null)
        {
            // Explicitly load only the properties that exist in the database
            await _context.Entry(rubro)
                .Reference(r => r.Grado)
                .LoadAsync();
        }

        return rubro;
    }

    public async Task<IEnumerable<Rubro>> GetAllAsync()
    {
        // First get rubros with just NivelEducativo loaded
        var rubros = await _context.Rubros
            .Include(r => r.NivelEducativo)
            .OrderBy(r => r.Descripcion)
            .ToListAsync();

        // Then explicitly load Grado for each rubro that has a GradoId
        foreach (var rubro in rubros.Where(r => r.GradoId.HasValue))
        {
            await _context.Entry(rubro).Reference(r => r.Grado).LoadAsync();

            // If you need NivelEducativo inside Grado, load that explicitly too
            if (rubro.Grado != null)
            {
                await _context.Entry(rubro.Grado).Reference(g => g.NivelEducativo).LoadAsync();
            }
        }

        return rubros;
    }

    public async Task AddAsync(Rubro rubro)
    {
        await _context.Rubros.AddAsync(rubro);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Rubro rubro)
    {
        _context.Rubros.Update(rubro);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var rubro = await _context.Rubros.FindAsync(id);
        if (rubro != null)
        {
            _context.Rubros.Remove(rubro);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Rubro>> GetAllActiveAsync()
    {
        // First get rubros with just NivelEducativo loaded
        var rubros = await _context.Rubros
            .Include(r => r.NivelEducativo)
            .Where(r => r.Activo == true)
            .OrderBy(r => r.Descripcion)
            .ToListAsync();

        // Then explicitly load Grado for each rubro that has a GradoId
        foreach (var rubro in rubros.Where(r => r.GradoId.HasValue))
        {
            await _context.Entry(rubro).Reference(r => r.Grado).LoadAsync();

            // If you need NivelEducativo inside Grado, load that explicitly too
            if (rubro.Grado != null)
            {
                await _context.Entry(rubro.Grado).Reference(g => g.NivelEducativo).LoadAsync();
            }
        }

        return rubros;
    }
}
