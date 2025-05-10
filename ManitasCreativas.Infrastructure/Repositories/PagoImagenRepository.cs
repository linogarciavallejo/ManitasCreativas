using ManitasCreativas.Domain.Entities;
using ManitasCreativas.Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ManitasCreativas.Infrastructure.Repositories;

public class PagoImagenRepository: IPagoImagenRepository
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

    Task<IEnumerable<PagoImagen>> IPagoImagenRepository.GetByPagoIdAsync(int pagoId)
    {
        throw new NotImplementedException();
    }

    Task IPagoImagenRepository.AddRangeAsync(IEnumerable<PagoImagen> pagoImagenes)
    {
        throw new NotImplementedException();
    }

    Task IPagoImagenRepository.DeleteRangeAsync(IEnumerable<PagoImagen> pagoImagenes)
    {
        throw new NotImplementedException();
    }
}