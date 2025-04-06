namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IPagoService
{
    Task<IEnumerable<PagoDto>> GetPagosByCriteriaAsync(int cicloEscolar, int rubroId, int gradoId, int month);

    //Task<PagoDto> GetPagoByIdAsync(int id);

    Task<PagoDto> AddPagoAsync(PagoDto pagoDto);
}