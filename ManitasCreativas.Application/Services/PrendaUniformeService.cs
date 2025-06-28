using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;

namespace ManitasCreativas.Application.Services;

public class PrendaUniformeService : IPrendaUniformeService
{
    private readonly IPrendaUniformeRepository _prendaUniformeRepository;
    private readonly IPrendaUniformeImagenRepository _prendaUniformeImagenRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public PrendaUniformeService(
        IPrendaUniformeRepository prendaUniformeRepository,
        IPrendaUniformeImagenRepository prendaUniformeImagenRepository,
        IUsuarioRepository usuarioRepository)
    {
        _prendaUniformeRepository = prendaUniformeRepository;
        _prendaUniformeImagenRepository = prendaUniformeImagenRepository;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<IEnumerable<PrendaUniformeDto>> GetAllAsync()
    {
        var prendas = await _prendaUniformeRepository.GetAllWithImagesAsync();
        return prendas.Select(MapToDto);
    }

    public async Task<IEnumerable<PrendaUniformeSimpleDto>> GetAllSimpleAsync()
    {
        var prendas = await _prendaUniformeRepository.GetAllAsync();
        return prendas.Select(MapToSimpleDto);
    }

    public async Task<PrendaUniformeDto?> GetByIdAsync(int id)
    {
        var prenda = await _prendaUniformeRepository.GetByIdAsync(id);
        return prenda != null ? MapToDto(prenda) : null;
    }

    public async Task<PrendaUniformeDto?> GetByIdWithImagesAsync(int id)
    {
        var prenda = await _prendaUniformeRepository.GetByIdWithImagesAsync(id);
        return prenda != null ? MapToDto(prenda) : null;
    }

    public async Task<IEnumerable<PrendaUniformeDto>> GetBySexoAsync(string sexo)
    {
        var prendas = await _prendaUniformeRepository.GetBySexoAsync(sexo);
        return prendas.Select(MapToDto);
    }

    public async Task<IEnumerable<PrendaUniformeDto>> GetByTallaAsync(string talla)
    {
        var prendas = await _prendaUniformeRepository.GetByTallaAsync(talla);
        return prendas.Select(MapToDto);
    }

    public async Task<IEnumerable<PrendaUniformeDto>> GetBySexoAndTallaAsync(string sexo, string talla)
    {
        var prendas = await _prendaUniformeRepository.GetBySexoAndTallaAsync(sexo, talla);
        return prendas.Select(MapToDto);
    }

    public async Task<IEnumerable<PrendaUniformeDto>> GetActiveAsync()
    {
        var prendas = await _prendaUniformeRepository.GetActiveAsync();
        return prendas.Select(MapToDto);
    }

    public async Task<PrendaUniformeDto> CreateAsync(PrendaUniformeCreateDto createDto, int usuarioCreacionId)
    {
        var prenda = new PrendaUniforme
        {
            Descripcion = createDto.Descripcion,
            Sexo = createDto.Sexo,
            Talla = createDto.Talla,
            Precio = createDto.Precio,
            ExistenciaInicial = createDto.ExistenciaInicial,
            Entradas = 0,
            Salidas = 0,
            Notas = createDto.Notas,
            FechaCreacion = DateTime.UtcNow,
            UsuarioCreacionId = usuarioCreacionId,
            EsEliminado = false
        };

        await _prendaUniformeRepository.AddAsync(prenda);

        // Add images if provided
        if (createDto.Imagenes.Any())
        {
            foreach (var imagenDto in createDto.Imagenes)
            {
                var imagen = new PrendaUniformeImagen
                {
                    PrendaUniformeId = prenda.Id,
                    Imagen = new Uri($"data:{imagenDto.ContentType};base64,{imagenDto.Base64Content}") // This will need proper file handling
                };
                await _prendaUniformeImagenRepository.AddAsync(imagen);
            }
        }

        return await GetByIdWithImagesAsync(prenda.Id) ?? throw new InvalidOperationException("Failed to retrieve created prenda");
    }

    public async Task<PrendaUniformeDto> UpdateAsync(int id, PrendaUniformeCreateDto updateDto, int usuarioActualizacionId)
    {
        var prenda = await _prendaUniformeRepository.GetByIdAsync(id);
        if (prenda == null)
            throw new ArgumentException($"PrendaUniforme with ID {id} not found");

        prenda.Descripcion = updateDto.Descripcion;
        prenda.Sexo = updateDto.Sexo;
        prenda.Talla = updateDto.Talla;
        prenda.Precio = updateDto.Precio;
        prenda.ExistenciaInicial = updateDto.ExistenciaInicial;
        prenda.Notas = updateDto.Notas;
        prenda.FechaActualizacion = DateTime.UtcNow;
        prenda.UsuarioActualizacionId = usuarioActualizacionId;

        await _prendaUniformeRepository.UpdateAsync(prenda);

        return await GetByIdWithImagesAsync(id) ?? throw new InvalidOperationException("Failed to retrieve updated prenda");
    }

    public async Task<bool> DeleteAsync(int id, string motivoEliminacion, int usuarioEliminacionId)
    {
        var prenda = await _prendaUniformeRepository.GetByIdAsync(id);
        if (prenda == null)
            return false;

        prenda.EsEliminado = true;
        prenda.MotivoEliminacion = motivoEliminacion;
        prenda.FechaEliminacion = DateTime.UtcNow;
        prenda.UsuarioEliminacionId = usuarioEliminacionId;

        await _prendaUniformeRepository.UpdateAsync(prenda);
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _prendaUniformeRepository.ExistsAsync(id);
    }

    public async Task UpdateStockAsync(int id, int entradas, int salidas)
    {
        var prenda = await _prendaUniformeRepository.GetByIdAsync(id);
        if (prenda == null)
            throw new ArgumentException($"PrendaUniforme with ID {id} not found");

        prenda.Entradas += entradas;
        prenda.Salidas += salidas;
        prenda.FechaActualizacion = DateTime.UtcNow;

        await _prendaUniformeRepository.UpdateAsync(prenda);
    }

    private static PrendaUniformeDto MapToDto(PrendaUniforme prenda)
    {
        return new PrendaUniformeDto
        {
            Id = prenda.Id,
            Descripcion = prenda.Descripcion,
            Sexo = prenda.Sexo,
            Talla = prenda.Talla,
            Precio = prenda.Precio,
            ExistenciaInicial = prenda.ExistenciaInicial,
            Entradas = prenda.Entradas,
            Salidas = prenda.Salidas,
            Notas = prenda.Notas,
            ImagenesPrenda = prenda.ImagenesPrenda?.Select(img => new PrendaUniformeImagenDto
            {
                Id = img.Id,
                PrendaUniformeId = img.PrendaUniformeId,
                Imagen = img.Imagen.ToString(),
                Base64Content = string.Empty, // Will be populated when needed
                FileName = string.Empty,
                ContentType = string.Empty
            }).ToList() ?? new List<PrendaUniformeImagenDto>(),
            FechaCreacion = prenda.FechaCreacion,
            FechaActualizacion = prenda.FechaActualizacion,
            UsuarioCreacionId = prenda.UsuarioCreacionId,
            UsuarioActualizacionId = prenda.UsuarioActualizacionId,
            EsEliminado = prenda.EsEliminado,
            MotivoEliminacion = prenda.MotivoEliminacion,
            FechaEliminacion = prenda.FechaEliminacion,
            UsuarioEliminacionId = prenda.UsuarioEliminacionId
        };
    }

    private static PrendaUniformeSimpleDto MapToSimpleDto(PrendaUniforme prenda)
    {
        return new PrendaUniformeSimpleDto
        {
            Id = prenda.Id,
            Descripcion = prenda.Descripcion,
            Sexo = prenda.Sexo,
            Talla = prenda.Talla,
            Precio = prenda.Precio,
            ExistenciaInicial = prenda.ExistenciaInicial,
            Entradas = prenda.Entradas,
            Salidas = prenda.Salidas,
            EsEliminado = prenda.EsEliminado
        };
    }
}
