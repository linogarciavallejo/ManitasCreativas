using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ManitasCreativas.Infrastructure.Repositories
{
    public class NivelEducativoRepository : INivelEducativoRepository
    {
        private readonly AppDbContext _context;

        public NivelEducativoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NivelEducativo>> GetAllAsync()
        {
            return await _context.NivelesEducativos.ToListAsync();
        }

        public async Task<IEnumerable<NivelEducativo>> GetAllActiveAsync()
        {
            return await _context.NivelesEducativos
                .Where(n => (bool)n.Activo)
                .ToListAsync();
        }

        public async Task<NivelEducativo?> GetByIdAsync(int id)
        {
            return await _context.NivelesEducativos.FindAsync(id);
        }

        public async Task AddAsync(NivelEducativo nivelEducativo)
        {
            await _context.NivelesEducativos.AddAsync(nivelEducativo);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(NivelEducativo nivelEducativo)
        {
            _context.NivelesEducativos.Update(nivelEducativo);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var nivelEducativo = await _context.NivelesEducativos.FindAsync(id);
            if (nivelEducativo != null)
            {
                nivelEducativo.Activo = false;
                await _context.SaveChangesAsync();
            }
        }
    }
}