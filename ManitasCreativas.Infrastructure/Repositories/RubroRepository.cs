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
        return await _context.Rubros.FindAsync(id);
    }

    public async Task<IEnumerable<Rubro>> GetAllAsync()
    {
        return await _context.Rubros.OrderBy(r => r.Descripcion).ToListAsync();
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
        var rubro = await GetByIdAsync(id);
        if (rubro != null)
        {
            _context.Rubros.Remove(rubro);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Rubro>> GetAllActiveAsync()
    {
        return await _context.Rubros
            .Where(r => r.Activo == true)
            .OrderBy(r => r.Descripcion)
            .ToListAsync();
    }
}