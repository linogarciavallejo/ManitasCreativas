using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Interfaces.Repositories
{
    public interface ICodigosQRPagosRepository
    {
        Task<CodigosQRPagos?> GetByIdAsync(int id);
        Task<CodigosQRPagos?> GetByTokenUnicoAsync(Guid tokenUnico);
        Task<IEnumerable<CodigosQRPagos>> GetByPagoIdAsync(int pagoId);
        Task<IEnumerable<CodigosQRPagos>> GetAllAsync();
        Task AddAsync(CodigosQRPagos codigoQR);
        Task UpdateAsync(CodigosQRPagos codigoQR);
        Task DeleteAsync(int id);
        Task<IEnumerable<CodigosQRPagos>> GetExpiredAsync();
        Task<IEnumerable<CodigosQRPagos>> GetUnusedAsync();
    }
}
