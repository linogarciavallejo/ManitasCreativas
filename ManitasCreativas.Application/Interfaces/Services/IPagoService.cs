namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;

public interface IPagoService
{
    Task<IEnumerable<PagoReadDto>> GetPagosByCriteriaAsync(int cicloEscolar, int rubroId, int gradoId, int month);

    Task<PagoReadDto> GetPagoByIdAsync(int id);

    Task<PagoReadDto> AddPagoAsync(PagoUploadDto pagoDto);
    
    Task<PagoReportResponseDto> GetPagoReportAsync(PagoReportFilterDto filter);
}