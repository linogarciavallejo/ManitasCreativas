namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class PrendaUniformeRepository : IPrendaUniformeRepository
{
    private readonly AppDbContext _context;

    public PrendaUniformeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PrendaUniforme?> GetByIdAsync(int id)
    {
        return await _context.PrendasUniforme.FindAsync(id);
    }

    public async Task<PrendaUniforme?> GetByIdWithImagesAsync(int id)
    {
        return await _context.PrendasUniforme
            .Include(pu => pu.ImagenesPrenda)
            .FirstOrDefaultAsync(pu => pu.Id == id);
    }

    public async Task<IEnumerable<PrendaUniforme>> GetAllAsync()
    {
        return await _context.PrendasUniforme
            .OrderBy(pu => pu.Descripcion)
            .ToListAsync();
    }

    public async Task<IEnumerable<PrendaUniforme>> GetAllWithImagesAsync()
    {
        return await _context.PrendasUniforme
            .Include(pu => pu.ImagenesPrenda)
            .OrderBy(pu => pu.Descripcion)
            .ToListAsync();
    }

    public async Task<IEnumerable<PrendaUniforme>> GetBySexoAsync(string sexo)
    {
        return await _context.PrendasUniforme
            .Where(pu => pu.Sexo == sexo)
            .OrderBy(pu => pu.Descripcion)
            .ToListAsync();
    }

    public async Task<IEnumerable<PrendaUniforme>> GetByTallaAsync(string talla)
    {
        return await _context.PrendasUniforme
            .Where(pu => pu.Talla == talla)
            .OrderBy(pu => pu.Descripcion)
            .ToListAsync();
    }

    public async Task<IEnumerable<PrendaUniforme>> GetBySexoAndTallaAsync(string sexo, string talla)
    {
        return await _context.PrendasUniforme
            .Where(pu => pu.Sexo == sexo && pu.Talla == talla)
            .OrderBy(pu => pu.Descripcion)
            .ToListAsync();
    }

    public async Task<IEnumerable<PrendaUniforme>> GetActiveAsync()
    {
        return await _context.PrendasUniforme
            .Where(pu => !pu.EsEliminado)
            .OrderBy(pu => pu.Descripcion)
            .ToListAsync();
    }

    public async Task AddAsync(PrendaUniforme prendaUniforme)
    {
        await _context.PrendasUniforme.AddAsync(prendaUniforme);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(PrendaUniforme prendaUniforme)
    {
        _context.PrendasUniforme.Update(prendaUniforme);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var prendaUniforme = await GetByIdAsync(id);
        if (prendaUniforme != null)
        {
            _context.PrendasUniforme.Remove(prendaUniforme);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.PrendasUniforme.AnyAsync(pu => pu.Id == id);
    }
}
