namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class EntradaUniformeRepository : IEntradaUniformeRepository
{
    private readonly AppDbContext _context;

    public EntradaUniformeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EntradaUniforme?> GetByIdAsync(int id)
    {
        return await _context.EntradaUniformes.FindAsync(id);
    }

    public async Task<EntradaUniforme?> GetByIdWithDetallesAsync(int id)
    {
        return await _context.EntradaUniformes
            .Include(eu => eu.EntradaUniformeDetalles)
                .ThenInclude(eud => eud.PrendaUniforme)
            .Include(eu => eu.UsuarioCreacion)
            .FirstOrDefaultAsync(eu => eu.Id == id);
    }

    public async Task<IEnumerable<EntradaUniforme>> GetAllAsync()
    {
        return await _context.EntradaUniformes
            .Include(eu => eu.UsuarioCreacion)
            .OrderByDescending(eu => eu.FechaEntrada)
            .ToListAsync();
    }

    public async Task<IEnumerable<EntradaUniforme>> GetAllWithDetallesAsync()
    {
        return await _context.EntradaUniformes
            .Include(eu => eu.EntradaUniformeDetalles)
                .ThenInclude(eud => eud.PrendaUniforme)
            .Include(eu => eu.UsuarioCreacion)
            .OrderByDescending(eu => eu.FechaEntrada)
            .ToListAsync();
    }

    public async Task<IEnumerable<EntradaUniforme>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.EntradaUniformes
            .Include(eu => eu.UsuarioCreacion)
            .Where(eu => eu.FechaEntrada >= startDate && eu.FechaEntrada <= endDate)
            .OrderByDescending(eu => eu.FechaEntrada)
            .ToListAsync();
    }

    public async Task<IEnumerable<EntradaUniforme>> GetByUsuarioCreacionIdAsync(int usuarioId)
    {
        return await _context.EntradaUniformes
            .Include(eu => eu.UsuarioCreacion)
            .Where(eu => eu.UsuarioCreacionId == usuarioId)
            .OrderByDescending(eu => eu.FechaEntrada)
            .ToListAsync();
    }

    public async Task<IEnumerable<EntradaUniforme>> GetActiveAsync()
    {
        return await _context.EntradaUniformes
            .Include(eu => eu.UsuarioCreacion)
            .Where(eu => !eu.EsEliminado)
            .OrderByDescending(eu => eu.FechaEntrada)
            .ToListAsync();
    }

    public async Task AddAsync(EntradaUniforme entradaUniforme)
    {
        await _context.EntradaUniformes.AddAsync(entradaUniforme);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(EntradaUniforme entradaUniforme)
    {
        _context.EntradaUniformes.Update(entradaUniforme);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entradaUniforme = await GetByIdAsync(id);
        if (entradaUniforme != null)
        {
            _context.EntradaUniformes.Remove(entradaUniforme);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.EntradaUniformes.AnyAsync(eu => eu.Id == id);
    }
}
