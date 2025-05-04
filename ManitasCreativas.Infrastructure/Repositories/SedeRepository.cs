namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class SedeRepository : ISedeRepository
{
    private readonly AppDbContext _context;

    public SedeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Sede?> GetByIdAsync(int id)
    {
        return await _context.Sedes.FindAsync(id);
    }

    public async Task<IEnumerable<Sede>> GetAllAsync()
    {
        return await _context.Sedes.ToListAsync();
    }

    public async Task AddAsync(Sede sede)
    {
        await _context.Sedes.AddAsync(sede);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Sede sede)
    {
        _context.Sedes.Update(sede);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var sede = await GetByIdAsync(id);
        if (sede != null)
        {
            _context.Sedes.Remove(sede);
            await _context.SaveChangesAsync();
        }
    }
}