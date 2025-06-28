namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class EntradaUniformeDetalleRepository : IEntradaUniformeDetalleRepository
{
    private readonly AppDbContext _context;

    public EntradaUniformeDetalleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EntradaUniformeDetalle?> GetByIdAsync(int id)
    {
        return await _context.EntradaUniformeDetalles
            .Include(eud => eud.EntradaUniforme)
            .Include(eud => eud.PrendaUniforme)
            .FirstOrDefaultAsync(eud => eud.Id == id);
    }

    public async Task<IEnumerable<EntradaUniformeDetalle>> GetByEntradaUniformeIdAsync(int entradaUniformeId)
    {
        return await _context.EntradaUniformeDetalles
            .Include(eud => eud.PrendaUniforme)
            .Where(eud => eud.EntradaUniformeId == entradaUniformeId)
            .ToListAsync();
    }

    public async Task<IEnumerable<EntradaUniformeDetalle>> GetByPrendaUniformeIdAsync(int prendaUniformeId)
    {
        return await _context.EntradaUniformeDetalles
            .Include(eud => eud.EntradaUniforme)
            .Where(eud => eud.PrendaUniformeId == prendaUniformeId)
            .OrderByDescending(eud => eud.EntradaUniforme.FechaEntrada)
            .ToListAsync();
    }

    public async Task<IEnumerable<EntradaUniformeDetalle>> GetAllAsync()
    {
        return await _context.EntradaUniformeDetalles
            .Include(eud => eud.EntradaUniforme)
            .Include(eud => eud.PrendaUniforme)
            .ToListAsync();
    }

    public async Task AddAsync(EntradaUniformeDetalle detalle)
    {
        await _context.EntradaUniformeDetalles.AddAsync(detalle);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<EntradaUniformeDetalle> detalles)
    {
        await _context.EntradaUniformeDetalles.AddRangeAsync(detalles);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(EntradaUniformeDetalle detalle)
    {
        _context.EntradaUniformeDetalles.Update(detalle);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var detalle = await _context.EntradaUniformeDetalles.FindAsync(id);
        if (detalle != null)
        {
            _context.EntradaUniformeDetalles.Remove(detalle);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteByEntradaUniformeIdAsync(int entradaUniformeId)
    {
        var detalles = await _context.EntradaUniformeDetalles
            .Where(eud => eud.EntradaUniformeId == entradaUniformeId)
            .ToListAsync();
        
        if (detalles.Any())
        {
            _context.EntradaUniformeDetalles.RemoveRange(detalles);
            await _context.SaveChangesAsync();
        }
    }
}
