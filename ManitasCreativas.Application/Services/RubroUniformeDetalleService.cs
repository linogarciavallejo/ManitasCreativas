using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Services;

public class RubroUniformeDetalleService : IRubroUniformeDetalleService
{
    private readonly IRubroUniformeDetalleRepository _rubroUniformeDetalleRepository;
    private readonly IRubroRepository _rubroRepository;
    private readonly IPrendaUniformeRepository _prendaUniformeRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public RubroUniformeDetalleService(
        IRubroUniformeDetalleRepository rubroUniformeDetalleRepository,
        IRubroRepository rubroRepository,
        IPrendaUniformeRepository prendaUniformeRepository,
        IUsuarioRepository usuarioRepository)
    {
        _rubroUniformeDetalleRepository = rubroUniformeDetalleRepository;
        _rubroRepository = rubroRepository;
        _prendaUniformeRepository = prendaUniformeRepository;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<IEnumerable<RubroUniformeDetalleDto>> GetAllAsync()
    {
        var detalles = await _rubroUniformeDetalleRepository.GetAllWithRelatedDataAsync();
        return detalles.Select(MapToDto);
    }

    public async Task<RubroUniformeDetalleDto?> GetByIdAsync(int id)
    {
        var detalle = await _rubroUniformeDetalleRepository.GetByIdAsync(id);
        return detalle != null ? MapToDto(detalle) : null;
    }

    public async Task<IEnumerable<RubroUniformeDetalleDto>> GetByRubroIdAsync(int rubroId)
    {
        var detalles = await _rubroUniformeDetalleRepository.GetByRubroIdAsync(rubroId);
        return detalles.Select(MapToDto);
    }

    public async Task<IEnumerable<RubroUniformeDetalleDto>> GetByPrendaUniformeIdAsync(int prendaUniformeId)
    {
        var detalles = await _rubroUniformeDetalleRepository.GetByPrendaUniformeIdAsync(prendaUniformeId);
        return detalles.Select(MapToDto);
    }

    public async Task<RubroUniformeDetalleDto?> GetByRubroIdAndPrendaUniformeIdAsync(int rubroId, int prendaUniformeId)
    {
        var detalle = await _rubroUniformeDetalleRepository.GetByRubroIdAndPrendaUniformeIdAsync(rubroId, prendaUniformeId);
        return detalle != null ? MapToDto(detalle) : null;
    }

    public async Task<IEnumerable<RubroUniformeDetalleDto>> GetActiveAsync()
    {
        var detalles = await _rubroUniformeDetalleRepository.GetActiveAsync();
        return detalles.Select(MapToDto);
    }

    public async Task<RubroUniformeDetalleDto> CreateAsync(RubroUniformeDetalleCreateDto createDto, int usuarioCreacionId)
    {
        // Validate that the combination doesn't already exist
        var exists = await _rubroUniformeDetalleRepository.ExistsAsync(createDto.RubroId, createDto.PrendaUniformeId);
        if (exists)
            throw new InvalidOperationException($"A RubroUniformeDetalle already exists for RubroId {createDto.RubroId} and PrendaUniformeId {createDto.PrendaUniformeId}");

        // Validate that Rubro and PrendaUniforme exist
        var rubro = await _rubroRepository.GetByIdAsync(createDto.RubroId);
        if (rubro == null)
            throw new ArgumentException($"Rubro with ID {createDto.RubroId} not found");

        var prendaUniforme = await _prendaUniformeRepository.GetByIdAsync(createDto.PrendaUniformeId);
        if (prendaUniforme == null)
            throw new ArgumentException($"PrendaUniforme with ID {createDto.PrendaUniformeId} not found");

        var detalle = new RubroUniformeDetalle
        {
            RubroId = createDto.RubroId,
            PrendaUniformeId = createDto.PrendaUniformeId,
            FechaCreacion = DateTime.UtcNow,
            UsuarioCreacionId = usuarioCreacionId,
            EsEliminado = false
        };

        await _rubroUniformeDetalleRepository.AddAsync(detalle);

        return await GetByIdAsync(detalle.Id) ?? throw new InvalidOperationException("Failed to retrieve created detalle");
    }

    public async Task<RubroUniformeDetalleDto> UpdateAsync(int id, RubroUniformeDetalleCreateDto updateDto, int usuarioActualizacionId)
    {
        var detalle = await _rubroUniformeDetalleRepository.GetByIdAsync(id);
        if (detalle == null)
            throw new ArgumentException($"RubroUniformeDetalle with ID {id} not found");

        // Check if the new combination already exists (excluding current record)
        var existingDetalle = await _rubroUniformeDetalleRepository.GetByRubroIdAndPrendaUniformeIdAsync(updateDto.RubroId, updateDto.PrendaUniformeId);
        if (existingDetalle != null && existingDetalle.Id != id)
            throw new InvalidOperationException($"A RubroUniformeDetalle already exists for RubroId {updateDto.RubroId} and PrendaUniformeId {updateDto.PrendaUniformeId}");

        // Validate that Rubro and PrendaUniforme exist
        var rubro = await _rubroRepository.GetByIdAsync(updateDto.RubroId);
        if (rubro == null)
            throw new ArgumentException($"Rubro with ID {updateDto.RubroId} not found");

        var prendaUniforme = await _prendaUniformeRepository.GetByIdAsync(updateDto.PrendaUniformeId);
        if (prendaUniforme == null)
            throw new ArgumentException($"PrendaUniforme with ID {updateDto.PrendaUniformeId} not found");

        detalle.RubroId = updateDto.RubroId;
        detalle.PrendaUniformeId = updateDto.PrendaUniformeId;
        detalle.FechaActualizacion = DateTime.UtcNow;
        detalle.UsuarioActualizacionId = usuarioActualizacionId;

        await _rubroUniformeDetalleRepository.UpdateAsync(detalle);

        return await GetByIdAsync(id) ?? throw new InvalidOperationException("Failed to retrieve updated detalle");
    }

    public async Task<bool> DeleteAsync(int id, string motivoEliminacion, int usuarioEliminacionId)
    {
        var detalle = await _rubroUniformeDetalleRepository.GetByIdAsync(id);
        if (detalle == null)
            return false;

        detalle.EsEliminado = true;
        detalle.MotivoEliminacion = motivoEliminacion;
        detalle.FechaEliminacion = DateTime.UtcNow;
        detalle.UsuarioEliminacionId = usuarioEliminacionId;

        await _rubroUniformeDetalleRepository.UpdateAsync(detalle);
        return true;
    }

    public async Task<bool> ExistsAsync(int rubroId, int prendaUniformeId)
    {
        return await _rubroUniformeDetalleRepository.ExistsAsync(rubroId, prendaUniformeId);
    }

    private static RubroUniformeDetalleDto MapToDto(RubroUniformeDetalle detalle)
    {
        return new RubroUniformeDetalleDto
        {
            Id = detalle.Id,
            RubroId = detalle.RubroId,
            PrendaUniformeId = detalle.PrendaUniformeId,
            RubroDescripcion = detalle.Rubro?.Descripcion ?? string.Empty,
            PrendaUniformeDescripcion = detalle.PrendaUniforme?.Descripcion ?? string.Empty,
            PrendaUniformeSexo = detalle.PrendaUniforme?.Sexo ?? string.Empty,
            PrendaUniformeTalla = detalle.PrendaUniforme?.Talla ?? string.Empty,
            PrendaUniformePrecio = detalle.PrendaUniforme?.Precio ?? 0,
            PrendaUniformeImagenUrl = detalle.PrendaUniforme?.ImagenesPrenda?.FirstOrDefault()?.Imagen?.ToString(),
            PrendaUniformeExistenciaInicial = detalle.PrendaUniforme?.ExistenciaInicial ?? 0,
            PrendaUniformeEntradas = detalle.PrendaUniforme?.Entradas ?? 0,
            PrendaUniformeSalidas = detalle.PrendaUniforme?.Salidas ?? 0,
            FechaCreacion = detalle.FechaCreacion,
            FechaActualizacion = detalle.FechaActualizacion,
            UsuarioCreacionId = detalle.UsuarioCreacionId,
            UsuarioActualizacionId = detalle.UsuarioActualizacionId,
            EsEliminado = detalle.EsEliminado,
            MotivoEliminacion = detalle.MotivoEliminacion,
            FechaEliminacion = detalle.FechaEliminacion,
            UsuarioEliminacionId = detalle.UsuarioEliminacionId
        };
    }
}
