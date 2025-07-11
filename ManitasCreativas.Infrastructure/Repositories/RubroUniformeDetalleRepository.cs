namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class RubroUniformeDetalleRepository : IRubroUniformeDetalleRepository
{
    private readonly AppDbContext _context;

    public RubroUniformeDetalleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<RubroUniformeDetalle?> GetByIdAsync(int id)
    {
        return await _context.RubroUniformeDetalles
            .Include(rud => rud.Rubro)
            .Include(rud => rud.PrendaUniforme)
                .ThenInclude(pu => pu.ImagenesPrenda)
            .FirstOrDefaultAsync(rud => rud.Id == id);
    }

    public async Task<IEnumerable<RubroUniformeDetalle>> GetByRubroIdAsync(int rubroId)
    {
        return await _context.RubroUniformeDetalles
            .Include(rud => rud.PrendaUniforme)
                .ThenInclude(pu => pu.ImagenesPrenda)
            .Where(rud => rud.RubroId == rubroId && !rud.EsEliminado)
            .OrderBy(rud => rud.PrendaUniforme.Descripcion)
            .ToListAsync();
    }

    public async Task<IEnumerable<RubroUniformeDetalle>> GetByPrendaUniformeIdAsync(int prendaUniformeId)
    {
        return await _context.RubroUniformeDetalles
            .Include(rud => rud.Rubro)
            .Include(rud => rud.PrendaUniforme)
                .ThenInclude(pu => pu.ImagenesPrenda)
            .Where(rud => rud.PrendaUniformeId == prendaUniformeId && !rud.EsEliminado)
            .OrderBy(rud => rud.Rubro.Descripcion)
            .ToListAsync();
    }

    public async Task<RubroUniformeDetalle?> GetByRubroIdAndPrendaUniformeIdAsync(int rubroId, int prendaUniformeId)
    {
        return await _context.RubroUniformeDetalles
            .Include(rud => rud.Rubro)
            .Include(rud => rud.PrendaUniforme)
                .ThenInclude(pu => pu.ImagenesPrenda)
            .FirstOrDefaultAsync(rud => rud.RubroId == rubroId && 
                                      rud.PrendaUniformeId == prendaUniformeId && 
                                      !rud.EsEliminado);
    }

    public async Task<IEnumerable<RubroUniformeDetalle>> GetAllAsync()
    {
        return await _context.RubroUniformeDetalles
            .Include(rud => rud.Rubro)
            .Include(rud => rud.PrendaUniforme)
                .ThenInclude(pu => pu.ImagenesPrenda)
            .OrderBy(rud => rud.Rubro.Descripcion)
            .ThenBy(rud => rud.PrendaUniforme.Descripcion)
            .ToListAsync();
    }

    public async Task<IEnumerable<RubroUniformeDetalle>> GetAllWithRelatedDataAsync()
    {
        return await _context.RubroUniformeDetalles
            .Include(rud => rud.Rubro)
            .Include(rud => rud.PrendaUniforme)
                .ThenInclude(pu => pu.ImagenesPrenda)
            .Include(rud => rud.UsuarioCreacion)
            .OrderBy(rud => rud.Rubro.Descripcion)
            .ThenBy(rud => rud.PrendaUniforme.Descripcion)
            .ToListAsync();
    }

    public async Task<IEnumerable<RubroUniformeDetalle>> GetActiveAsync()
    {
        return await _context.RubroUniformeDetalles
            .Include(rud => rud.Rubro)
            .Include(rud => rud.PrendaUniforme)
            .Where(rud => !rud.EsEliminado)
            .OrderBy(rud => rud.Rubro.Descripcion)
            .ThenBy(rud => rud.PrendaUniforme.Descripcion)
            .ToListAsync();
    }

    public async Task AddAsync(RubroUniformeDetalle rubroUniformeDetalle)
    {
        await _context.RubroUniformeDetalles.AddAsync(rubroUniformeDetalle);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(RubroUniformeDetalle rubroUniformeDetalle)
    {
        _context.RubroUniformeDetalles.Update(rubroUniformeDetalle);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var rubroUniformeDetalle = await _context.RubroUniformeDetalles.FindAsync(id);
        if (rubroUniformeDetalle != null)
        {
            _context.RubroUniformeDetalles.Remove(rubroUniformeDetalle);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int rubroId, int prendaUniformeId)
    {
        return await _context.RubroUniformeDetalles
            .AnyAsync(rud => rud.RubroId == rubroId && 
                           rud.PrendaUniformeId == prendaUniformeId && 
                           !rud.EsEliminado);
    }
}
