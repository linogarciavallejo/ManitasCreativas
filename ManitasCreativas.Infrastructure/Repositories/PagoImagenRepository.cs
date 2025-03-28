namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class PagoImagenRepository
{
    private readonly AppDbContext _context;

    public PagoImagenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagoImagen?> GetByIdAsync(int id)
    {
        return await _context.PagoImagenes.FindAsync(id);
    }

    public async Task<IEnumerable<PagoImagen>> GetAllAsync()
    {
        return await _context.PagoImagenes.ToListAsync();
    }

    public async Task AddAsync(PagoImagen pagoImagen)
    {
        await _context.PagoImagenes.AddAsync(pagoImagen);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(PagoImagen pagoImagen)
    {
        _context.PagoImagenes.Update(pagoImagen);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var pagoImagen = await GetByIdAsync(id);
        if (pagoImagen != null)
        {
            _context.PagoImagenes.Remove(pagoImagen);
            await _context.SaveChangesAsync();
        }
    }
}