using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ManitasCreativas.Infrastructure.Repositories;

public class AlumnoRutaRepository : IAlumnoRutaRepository
{
    private readonly AppDbContext _context;

    public AlumnoRutaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AlumnoRuta>> GetByAlumnoIdAsync(int alumnoId)
    {
        return await _context.AlumnoRutas
            .Include(ar => ar.RubroTransporte)
            .Where(ar => ar.AlumnoId == alumnoId)
            .ToListAsync();
    }

    public async Task<AlumnoRuta?> GetByIdsAsync(int alumnoId, int rubroTransporteId)
    {
        return await _context.AlumnoRutas
            .FirstOrDefaultAsync(ar => ar.AlumnoId == alumnoId && ar.RubroTransporteId == rubroTransporteId);
    }

    public async Task AddAsync(AlumnoRuta alumnoRuta)
    {
        await _context.AlumnoRutas.AddAsync(alumnoRuta);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(AlumnoRuta alumnoRuta)
    {
        _context.AlumnoRutas.Update(alumnoRuta);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(AlumnoRuta alumnoRuta)
    {
        _context.AlumnoRutas.Remove(alumnoRuta);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<AlumnoRuta>> GetByRubroTransporteIdAsync(int rubroTransporteId)
    {
        return await _context.AlumnoRutas
            .Include(ar => ar.Alumno)
                .ThenInclude(a => a.Sede)
            .Include(ar => ar.Alumno)
                .ThenInclude(a => a.Grado)
            .Include(ar => ar.RubroTransporte)
            .Where(ar => ar.RubroTransporteId == rubroTransporteId)
            .ToListAsync();
    }
}