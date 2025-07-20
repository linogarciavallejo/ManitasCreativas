using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ManitasCreativas.Infrastructure.Repositories
{
    public class CodigosQRPagosRepository : ICodigosQRPagosRepository
    {
        private readonly AppDbContext _context;

        public CodigosQRPagosRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CodigosQRPagos?> GetByIdAsync(int id)
        {
            return await _context.CodigosQRPagos
                .Include(qr => qr.Pago)
                    .ThenInclude(p => p.Alumno)
                .Include(qr => qr.Pago)
                    .ThenInclude(p => p.Rubro)
                .FirstOrDefaultAsync(qr => qr.Id == id);
        }

        public async Task<CodigosQRPagos?> GetByTokenUnicoAsync(Guid tokenUnico)
        {
            return await _context.CodigosQRPagos
                .Include(qr => qr.Pago)
                    .ThenInclude(p => p.Alumno)
                .Include(qr => qr.Pago)
                    .ThenInclude(p => p.Rubro)
                .FirstOrDefaultAsync(qr => qr.TokenUnico == tokenUnico);
        }

        public async Task<IEnumerable<CodigosQRPagos>> GetByPagoIdAsync(int pagoId)
        {
            return await _context.CodigosQRPagos
                .Include(qr => qr.Pago)
                .Where(qr => qr.PagoId == pagoId)
                .ToListAsync();
        }

        public async Task<IEnumerable<CodigosQRPagos>> GetAllAsync()
        {
            return await _context.CodigosQRPagos
                .Include(qr => qr.Pago)
                    .ThenInclude(p => p.Alumno)
                .Include(qr => qr.Pago)
                    .ThenInclude(p => p.Rubro)
                .ToListAsync();
        }

        public async Task AddAsync(CodigosQRPagos codigoQR)
        {
            await _context.CodigosQRPagos.AddAsync(codigoQR);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CodigosQRPagos codigoQR)
        {
            _context.CodigosQRPagos.Update(codigoQR);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var codigoQR = await GetByIdAsync(id);
            if (codigoQR != null)
            {
                _context.CodigosQRPagos.Remove(codigoQR);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<CodigosQRPagos>> GetExpiredAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.CodigosQRPagos
                .Include(qr => qr.Pago)
                .Where(qr => qr.FechaExpiracion < now)
                .ToListAsync();
        }

        public async Task<IEnumerable<CodigosQRPagos>> GetUnusedAsync()
        {
            return await _context.CodigosQRPagos
                .Include(qr => qr.Pago)
                .Where(qr => !qr.EstaUsado)
                .ToListAsync();
        }
    }
}
