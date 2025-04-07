namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IPagoService
{
    Task<IEnumerable<PagoReadDto>> GetPagosByCriteriaAsync(int cicloEscolar, int rubroId, int gradoId, int month);

    //Task<PagoDto> GetPagoByIdAsync(int id);

    Task<PagoUploadDto> AddPagoAsync(PagoUploadDto pagoDto);
}