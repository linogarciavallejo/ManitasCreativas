namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class PagoDetalleRepository : IPagoDetalleRepository
{
    private readonly AppDbContext _context;

    public PagoDetalleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagoDetalle?> GetByIdAsync(int id)
    {
        return await _context.PagoDetalles
            .Include(pd => pd.Pago)
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.Rubro)
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.PrendaUniforme)
            .FirstOrDefaultAsync(pd => pd.Id == id);
    }

    public async Task<IEnumerable<PagoDetalle>> GetByPagoIdAsync(int pagoId)
    {
        return await _context.PagoDetalles
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.Rubro)
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.PrendaUniforme)
            .Where(pd => pd.PagoId == pagoId)
            .ToListAsync();
    }

    public async Task<IEnumerable<PagoDetalle>> GetByRubroUniformeDetalleIdAsync(int rubroUniformeDetalleId)
    {
        return await _context.PagoDetalles
            .Include(pd => pd.Pago)
                .ThenInclude(p => p.Alumno)
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.Rubro)
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.PrendaUniforme)
            .Where(pd => pd.RubroUniformeDetalleId == rubroUniformeDetalleId)
            .OrderByDescending(pd => pd.Pago.Fecha)
            .ToListAsync();
    }

    public async Task<IEnumerable<PagoDetalle>> GetAllAsync()
    {
        return await _context.PagoDetalles
            .Include(pd => pd.Pago)
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.Rubro)
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.PrendaUniforme)
            .ToListAsync();
    }

    public async Task<IEnumerable<PagoDetalle>> GetAllWithRelatedDataAsync()
    {
        return await _context.PagoDetalles
            .Include(pd => pd.Pago)
                .ThenInclude(p => p.Alumno)
                    .ThenInclude(a => a.Grado)
                        .ThenInclude(g => g.NivelEducativo)
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.Rubro)
            .Include(pd => pd.RubroUniformeDetalle)
                .ThenInclude(rud => rud.PrendaUniforme)
                    .ThenInclude(pu => pu.ImagenesPrenda)
            .OrderByDescending(pd => pd.Pago.Fecha)
            .ToListAsync();
    }

    public async Task AddAsync(PagoDetalle pagoDetalle)
    {
        await _context.PagoDetalles.AddAsync(pagoDetalle);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<PagoDetalle> pagoDetalles)
    {
        await _context.PagoDetalles.AddRangeAsync(pagoDetalles);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(PagoDetalle pagoDetalle)
    {
        _context.PagoDetalles.Update(pagoDetalle);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var pagoDetalle = await _context.PagoDetalles.FindAsync(id);
        if (pagoDetalle != null)
        {
            _context.PagoDetalles.Remove(pagoDetalle);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteByPagoIdAsync(int pagoId)
    {
        var pagoDetalles = await _context.PagoDetalles
            .Where(pd => pd.PagoId == pagoId)
            .ToListAsync();
        
        if (pagoDetalles.Any())
        {
            _context.PagoDetalles.RemoveRange(pagoDetalles);
            await _context.SaveChangesAsync();
        }
    }
}
