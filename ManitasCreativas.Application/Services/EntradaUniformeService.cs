using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Services;

public class EntradaUniformeService : IEntradaUniformeService
{
    private readonly IEntradaUniformeRepository _entradaUniformeRepository;
    private readonly IEntradaUniformeDetalleRepository _entradaUniformeDetalleRepository;
    private readonly IPrendaUniformeService _prendaUniformeService;
    private readonly IUsuarioRepository _usuarioRepository;

    public EntradaUniformeService(
        IEntradaUniformeRepository entradaUniformeRepository,
        IEntradaUniformeDetalleRepository entradaUniformeDetalleRepository,
        IPrendaUniformeService prendaUniformeService,
        IUsuarioRepository usuarioRepository)
    {
        _entradaUniformeRepository = entradaUniformeRepository;
        _entradaUniformeDetalleRepository = entradaUniformeDetalleRepository;
        _prendaUniformeService = prendaUniformeService;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<IEnumerable<EntradaUniformeDto>> GetAllAsync()
    {
        var entradas = await _entradaUniformeRepository.GetAllWithDetallesAsync();
        return entradas.Select(MapToDto);
    }

    public async Task<EntradaUniformeDto?> GetByIdAsync(int id)
    {
        var entrada = await _entradaUniformeRepository.GetByIdAsync(id);
        return entrada != null ? MapToDto(entrada) : null;
    }

    public async Task<EntradaUniformeDto?> GetByIdWithDetallesAsync(int id)
    {
        var entrada = await _entradaUniformeRepository.GetByIdWithDetallesAsync(id);
        return entrada != null ? MapToDto(entrada) : null;
    }

    public async Task<IEnumerable<EntradaUniformeDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var entradas = await _entradaUniformeRepository.GetByDateRangeAsync(startDate, endDate);
        return entradas.Select(MapToDto);
    }

    public async Task<IEnumerable<EntradaUniformeDto>> GetByUsuarioCreacionIdAsync(int usuarioId)
    {
        var entradas = await _entradaUniformeRepository.GetByUsuarioCreacionIdAsync(usuarioId);
        return entradas.Select(MapToDto);
    }

    public async Task<IEnumerable<EntradaUniformeDto>> GetActiveAsync()
    {
        var entradas = await _entradaUniformeRepository.GetActiveAsync();
        return entradas.Select(MapToDto);
    }

    public async Task<EntradaUniformeDto> CreateAsync(EntradaUniformeCreateDto createDto, int usuarioCreacionId)
    {
        var entrada = new EntradaUniforme
        {
            FechaEntrada = createDto.FechaEntrada.Kind == DateTimeKind.Utc 
                ? createDto.FechaEntrada 
                : createDto.FechaEntrada.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(createDto.FechaEntrada, DateTimeKind.Utc)
                    : createDto.FechaEntrada.ToUniversalTime(),
            Notas = createDto.Notas,
            Total = createDto.Detalles.Sum(d => d.Subtotal),
            UsuarioCreacionId = usuarioCreacionId,
            FechaCreacion = DateTime.UtcNow,
            EsEliminado = false
        };

        await _entradaUniformeRepository.AddAsync(entrada);

        // Add details
        foreach (var detalleDto in createDto.Detalles)
        {
            var detalle = new EntradaUniformeDetalle
            {
                EntradaUniformeId = entrada.Id,
                PrendaUniformeId = detalleDto.PrendaUniformeId,
                Cantidad = detalleDto.Cantidad,
                Subtotal = detalleDto.Subtotal
            };
            await _entradaUniformeDetalleRepository.AddAsync(detalle);

            // Update stock in PrendaUniforme
            await _prendaUniformeService.UpdateStockAsync(detalleDto.PrendaUniformeId, detalleDto.Cantidad, 0);
        }

        return await GetByIdWithDetallesAsync(entrada.Id) ?? throw new InvalidOperationException("Failed to retrieve created entrada");
    }

    public async Task<EntradaUniformeDto> UpdateAsync(int id, EntradaUniformeCreateDto updateDto, int usuarioActualizacionId)
    {
        var entrada = await _entradaUniformeRepository.GetByIdWithDetallesAsync(id);
        if (entrada == null)
            throw new ArgumentException($"EntradaUniforme with ID {id} not found");

        // Revert previous stock changes
        foreach (var oldDetalle in entrada.EntradaUniformeDetalles)
        {
            await _prendaUniformeService.UpdateStockAsync(oldDetalle.PrendaUniformeId, -oldDetalle.Cantidad, 0);
        }

        // Delete old details
        await _entradaUniformeDetalleRepository.DeleteByEntradaUniformeIdAsync(id);

        // Update main entity
        entrada.FechaEntrada = updateDto.FechaEntrada.Kind == DateTimeKind.Utc 
            ? updateDto.FechaEntrada 
            : updateDto.FechaEntrada.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(updateDto.FechaEntrada, DateTimeKind.Utc)
                : updateDto.FechaEntrada.ToUniversalTime();
        entrada.Notas = updateDto.Notas;
        entrada.Total = updateDto.Detalles.Sum(d => d.Subtotal);
        entrada.FechaActualizacion = DateTime.UtcNow;
        entrada.UsuarioActualizacionId = usuarioActualizacionId;

        await _entradaUniformeRepository.UpdateAsync(entrada);

        // Add new details
        foreach (var detalleDto in updateDto.Detalles)
        {
            var detalle = new EntradaUniformeDetalle
            {
                EntradaUniformeId = entrada.Id,
                PrendaUniformeId = detalleDto.PrendaUniformeId,
                Cantidad = detalleDto.Cantidad,
                Subtotal = detalleDto.Subtotal
            };
            await _entradaUniformeDetalleRepository.AddAsync(detalle);

            // Update stock in PrendaUniforme
            await _prendaUniformeService.UpdateStockAsync(detalleDto.PrendaUniformeId, detalleDto.Cantidad, 0);
        }

        return await GetByIdWithDetallesAsync(id) ?? throw new InvalidOperationException("Failed to retrieve updated entrada");
    }

    public async Task<bool> DeleteAsync(int id, string motivoEliminacion, int usuarioEliminacionId)
    {
        var entrada = await _entradaUniformeRepository.GetByIdWithDetallesAsync(id);
        if (entrada == null)
            return false;

        // Revert stock changes
        foreach (var detalle in entrada.EntradaUniformeDetalles)
        {
            await _prendaUniformeService.UpdateStockAsync(detalle.PrendaUniformeId, -detalle.Cantidad, 0);
        }

        entrada.EsEliminado = true;
        entrada.MotivoEliminacion = motivoEliminacion;
        entrada.FechaEliminacion = DateTime.UtcNow;
        entrada.UsuarioEliminacionId = usuarioEliminacionId;

        await _entradaUniformeRepository.UpdateAsync(entrada);
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _entradaUniformeRepository.ExistsAsync(id);
    }

    private static EntradaUniformeDto MapToDto(EntradaUniforme entrada)
    {
        return new EntradaUniformeDto
        {
            Id = entrada.Id,
            FechaEntrada = entrada.FechaEntrada,
            UsuarioCreacionId = entrada.UsuarioCreacionId,
            FechaCreacion = entrada.FechaCreacion,
            Notas = entrada.Notas,
            Total = entrada.Total,
            EntradaUniformeDetalles = entrada.EntradaUniformeDetalles?.Select(d => new EntradaUniformeDetalleDto
            {
                Id = d.Id,
                EntradaUniformeId = d.EntradaUniformeId,
                PrendaUniformeId = d.PrendaUniformeId,
                Cantidad = d.Cantidad,
                Subtotal = d.Subtotal,
                PrendaUniformeDescripcion = d.PrendaUniforme?.Descripcion ?? string.Empty,
                PrendaUniformeSexo = d.PrendaUniforme?.Sexo ?? string.Empty,
                PrendaUniformeTalla = d.PrendaUniforme?.Talla ?? string.Empty,
                PrendaUniformePrecio = d.PrendaUniforme?.Precio ?? 0
            }).ToList() ?? new List<EntradaUniformeDetalleDto>(),
            FechaActualizacion = entrada.FechaActualizacion,
            UsuarioActualizacionId = entrada.UsuarioActualizacionId,
            EsEliminado = entrada.EsEliminado,
            MotivoEliminacion = entrada.MotivoEliminacion,
            FechaEliminacion = entrada.FechaEliminacion,
            UsuarioEliminacionId = entrada.UsuarioEliminacionId
        };
    }
}
