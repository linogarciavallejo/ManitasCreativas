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

    public async Task<Grado?> GetByIdAsync(int id)
    {
        return await _context.Grados.FindAsync(id);
    }

    public async Task<IEnumerable<Grado>> GetAllAsync()
    {
        return await _context.Grados.ToListAsync();
    }

    public async Task AddAsync(Grado grado)
    {
        await _context.Grados.AddAsync(grado);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Grado grado)
    {
        _context.Grados.Update(grado);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var grado = await GetByIdAsync(id);
        if (grado != null)
        {
            _context.Grados.Remove(grado);
            await _context.SaveChangesAsync();
        }
    }
}