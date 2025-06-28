namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class PrendaUniformeImagenRepository : IPrendaUniformeImagenRepository
{
    private readonly AppDbContext _context;

    public PrendaUniformeImagenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PrendaUniformeImagen?> GetByIdAsync(int id)
    {
        return await _context.PrendaUniformeImagenes.FindAsync(id);
    }

    public async Task<IEnumerable<PrendaUniformeImagen>> GetByPrendaUniformeIdAsync(int prendaUniformeId)
    {
        return await _context.PrendaUniformeImagenes
            .Where(pui => pui.PrendaUniformeId == prendaUniformeId)
            .ToListAsync();
    }

    public async Task<IEnumerable<PrendaUniformeImagen>> GetAllAsync()
    {
        return await _context.PrendaUniformeImagenes
            .Include(pui => pui.PrendaUniforme)
            .ToListAsync();
    }

    public async Task AddAsync(PrendaUniformeImagen imagen)
    {
        await _context.PrendaUniformeImagenes.AddAsync(imagen);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<PrendaUniformeImagen> imagenes)
    {
        await _context.PrendaUniformeImagenes.AddRangeAsync(imagenes);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(PrendaUniformeImagen imagen)
    {
        _context.PrendaUniformeImagenes.Update(imagen);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var imagen = await GetByIdAsync(id);
        if (imagen != null)
        {
            _context.PrendaUniformeImagenes.Remove(imagen);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteByPrendaUniformeIdAsync(int prendaUniformeId)
    {
        var imagenes = await GetByPrendaUniformeIdAsync(prendaUniformeId);
        if (imagenes.Any())
        {
            _context.PrendaUniformeImagenes.RemoveRange(imagenes);
            await _context.SaveChangesAsync();
        }
    }
}
