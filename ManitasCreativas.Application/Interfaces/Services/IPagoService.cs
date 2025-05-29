namespace ManitasCreativas.Application.Interfaces.Services;

using ManitasCreativas.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IPagoService
{
    Task<IEnumerable<PagoReadDto>> GetPagosByCriteriaAsync(int cicloEscolar, int rubroId, int gradoId, int month);

    Task<PagoReadDto> GetPagoByIdAsync(int id);    Task<PagoReadDto> AddPagoAsync(PagoUploadDto pagoDto);
    
    Task<PagoReadDto> UpdatePagoAsync(int id, PagoUploadDto pagoDto);
      Task<PagoReportResponseDto> GetPagoReportAsync(PagoReportFilterDto filter);
    
    Task<PagoTransporteReportResponseDto> GetPagoTransporteReportAsync(PagoTransporteReportFilterDto filter);
      Task<IEnumerable<PagoReadDto>> GetPagosForEditAsync(int cicloEscolar, int? gradoId = null, int? alumnoId = null);
    
    Task<PagoReadDto> VoidPagoAsync(int id, string motivoAnulacion, int usuarioAnulacionId);
    
    Task<bool> RemovePagoImagenAsync(int imagenId);
    
    Task<bool> RemoveMultiplePagoImagenesAsync(List<int> imagenesIds);
}