namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class PagoRepository : IPagoRepository
{
    private readonly AppDbContext _context;

    public PagoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Pago?> GetByIdAsync(int id)
    {
        return await _context.Pagos.FindAsync(id);
    }    public async Task<IEnumerable<Pago>> GetAllAsync()
    {
        Console.WriteLine("PagoRepository.GetAllAsync: Loading payments with navigation properties");
        return await _context.Pagos
            .Include(p => p.Alumno)
                .ThenInclude(a => a.Grado)
                    .ThenInclude(g => g.NivelEducativo)
            .Include(p => p.Rubro)
            .Include(p => p.ImagenesPago)
            .ToListAsync();
    }

    public async Task AddAsync(Pago pago)
    {
        await _context.Pagos.AddAsync(pago);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Pago pago)
    {
        _context.Pagos.Update(pago);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var pago = await GetByIdAsync(id);
        if (pago != null)
        {
            _context.Pagos.Remove(pago);
            await _context.SaveChangesAsync();
        }
    }
}