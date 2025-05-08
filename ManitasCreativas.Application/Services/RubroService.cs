namespace ManitasCreativas.Application.Services;

using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;

public class RubroService : IRubroService
{
    private readonly IRubroRepository _rubroRepository;

    public RubroService(IRubroRepository rubroRepository)
    {
        _rubroRepository = rubroRepository;
    }

    public async Task<IEnumerable<RubroDto>> GetAllRubrosAsync()
    {
        var rubros = await _rubroRepository.GetAllAsync();
        return rubros.Select(r => new RubroDto
        {
            Id = r.Id,
            Descripcion = r.Descripcion,
            Tipo = r.Tipo,
            PenalizacionPorMoraMonto = r.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = r.PenalizacionPorMoraPorcentaje,
            FechaLimitePagoAmarillo = r.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = r.FechaLimitePagoRojo,
            EsColegiatura = r.EsColegiatura,
            DiaLimitePagoAmarillo = r.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = r.DiaLimitePagoRojo,
            MesLimitePago = r.MesLimitePago,
            NivelEducativoId = r.NivelEducativoId,
            NivelEducativoNombre = r.NivelEducativo?.Nombre,
            GradoId = r.GradoId,
            GradoNombre = r.Grado?.Nombre,
            MontoPreestablecido = r.MontoPreestablecido,
            FechaInicioPromocion = r.FechaInicioPromocion,
            FechaFinPromocion = r.FechaFinPromocion,
            Notas = r.Notas,
            Activo = r.Activo,
            OrdenVisualizacionGrid = r.OrdenVisualizacionGrid,
            // Add mapping for audit fields
            FechaCreacion = r.FechaCreacion,
            FechaActualizacion = r.FechaActualizacion,
            UsuarioCreacionId = r.UsuarioCreacionId,
            UsuarioActualizacionId = r.UsuarioActualizacionId,
        });
    }


    public async Task<RubroDto?> GetRubroByIdAsync(int id)
    {
        var rubro = await _rubroRepository.GetByIdAsync(id);
        return rubro == null ? null : new RubroDto
        {
            Id = rubro.Id,
            Descripcion = rubro.Descripcion,
            Tipo = rubro.Tipo,
            PenalizacionPorMoraMonto = rubro.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = rubro.PenalizacionPorMoraPorcentaje,
            FechaLimitePagoAmarillo = rubro.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = rubro.FechaLimitePagoRojo,
            EsColegiatura = rubro.EsColegiatura,
            DiaLimitePagoAmarillo = rubro.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubro.DiaLimitePagoRojo,
            MesLimitePago = rubro.MesLimitePago,
            NivelEducativoId = rubro.NivelEducativoId,
            NivelEducativoNombre = rubro.NivelEducativo?.Nombre,
            GradoId = rubro.GradoId,
            GradoNombre = rubro.Grado?.Nombre,
            MontoPreestablecido = rubro.MontoPreestablecido,
            FechaInicioPromocion = rubro.FechaInicioPromocion,
            FechaFinPromocion = rubro.FechaFinPromocion,
            Notas = rubro.Notas,
            Activo = rubro.Activo,
            OrdenVisualizacionGrid = rubro.OrdenVisualizacionGrid,
            // Add mapping for audit fields
            FechaCreacion = rubro.FechaCreacion,
            FechaActualizacion = rubro.FechaActualizacion,
            UsuarioCreacionId = rubro.UsuarioCreacionId,
            UsuarioActualizacionId = rubro.UsuarioActualizacionId,
        };
    }


    public async Task AddRubroAsync(RubroDto rubroDto)
    {
        var rubro = new Rubro
        {
            Descripcion = rubroDto.Descripcion,
            Tipo = rubroDto.Tipo,
            PenalizacionPorMoraMonto = rubroDto.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = rubroDto.PenalizacionPorMoraPorcentaje,
            EsColegiatura = rubroDto.EsColegiatura,
            DiaLimitePagoAmarillo = rubroDto.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubroDto.DiaLimitePagoRojo,
            MesLimitePago = rubroDto.MesLimitePago,
            NivelEducativoId = rubroDto.NivelEducativoId,
            GradoId = rubroDto.GradoId,
            MontoPreestablecido = rubroDto.MontoPreestablecido,
            FechaInicioPromocion = rubroDto.FechaInicioPromocion,
            FechaFinPromocion = rubroDto.FechaFinPromocion,
            Notas = rubroDto.Notas,
            Activo = rubroDto.Activo,
            OrdenVisualizacionGrid = rubroDto.OrdenVisualizacionGrid,
        };
        
        // Handle DateTime properties correctly by converting to UTC
        if (rubroDto.FechaLimitePagoAmarillo.HasValue)
        {
            var dateTime = rubroDto.FechaLimitePagoAmarillo.Value;
            rubro.FechaLimitePagoAmarillo = dateTime.Kind != DateTimeKind.Utc 
                ? dateTime.ToUniversalTime() 
                : dateTime;
        }
        
        if (rubroDto.FechaLimitePagoRojo.HasValue)
        {
            var dateTime = rubroDto.FechaLimitePagoRojo.Value;
            rubro.FechaLimitePagoRojo = dateTime.Kind != DateTimeKind.Utc 
                ? dateTime.ToUniversalTime() 
                : dateTime;
        }
        
        // Set FechaCreacion using UTC time
        rubro.FechaCreacion = DateTime.UtcNow;
        rubro.UsuarioCreacionId = rubroDto.UsuarioCreacionId;

        await _rubroRepository.AddAsync(rubro);
    }

    public async Task UpdateRubroAsync(RubroDto rubroDto)
    {
        // First get the existing rubro to preserve creation info
        var existingRubro = await _rubroRepository.GetByIdAsync(rubroDto.Id);
        if (existingRubro == null)
        {
            throw new KeyNotFoundException($"Rubro with ID {rubroDto.Id} not found.");
        }

        var rubro = new Rubro
        {
            Id = rubroDto.Id,
            Descripcion = rubroDto.Descripcion,
            Tipo = rubroDto.Tipo,
            PenalizacionPorMoraMonto = rubroDto.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = rubroDto.PenalizacionPorMoraPorcentaje,
            EsColegiatura = rubroDto.EsColegiatura,
            DiaLimitePagoAmarillo = rubroDto.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubroDto.DiaLimitePagoRojo,
            MesLimitePago = rubroDto.MesLimitePago,
            NivelEducativoId = rubroDto.NivelEducativoId,
            GradoId = rubroDto.GradoId,
            MontoPreestablecido = rubroDto.MontoPreestablecido,
            FechaInicioPromocion = rubroDto.FechaInicioPromocion,
            FechaFinPromocion = rubroDto.FechaFinPromocion,
            Notas = rubroDto.Notas,
            Activo = rubroDto.Activo,
            OrdenVisualizacionGrid = rubroDto.OrdenVisualizacionGrid,
            // Preserve original creation information
            FechaCreacion = existingRubro.FechaCreacion,
            UsuarioCreacionId = existingRubro.UsuarioCreacionId,
            // Update modification information
        };
        
        // Handle DateTime properties correctly by converting to UTC
        if (rubroDto.FechaLimitePagoAmarillo.HasValue)
        {
            var dateTime = rubroDto.FechaLimitePagoAmarillo.Value;
            rubro.FechaLimitePagoAmarillo = dateTime.Kind != DateTimeKind.Utc 
                ? dateTime.ToUniversalTime() 
                : dateTime;
        }
        
        if (rubroDto.FechaLimitePagoRojo.HasValue)
        {
            var dateTime = rubroDto.FechaLimitePagoRojo.Value;
            rubro.FechaLimitePagoRojo = dateTime.Kind != DateTimeKind.Utc 
                ? dateTime.ToUniversalTime() 
                : dateTime;
        }
        
        // Set FechaActualizacion using UTC time
        rubro.FechaActualizacion = DateTime.UtcNow;
        rubro.UsuarioActualizacionId = rubroDto.UsuarioActualizacionId;

        await _rubroRepository.UpdateAsync(rubro);
    }


    public async Task DeleteRubroAsync(int id)
    {
        await _rubroRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<RubroDto>> GetAllActiveRubrosAsync()
    {
        var rubros = await _rubroRepository.GetAllActiveAsync();
        return rubros.Select(r => new RubroDto
        {
            Id = r.Id,
            Descripcion = r.Descripcion,
            Tipo = r.Tipo,
            PenalizacionPorMoraMonto = r.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = r.PenalizacionPorMoraPorcentaje,
            FechaLimitePagoAmarillo = r.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = r.FechaLimitePagoRojo,
            EsColegiatura = r.EsColegiatura,
            DiaLimitePagoAmarillo = r.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = r.DiaLimitePagoRojo,
            MesLimitePago = r.MesLimitePago,
            NivelEducativoId = r.NivelEducativoId,
            NivelEducativoNombre = r.NivelEducativo?.Nombre,
            GradoId = r.GradoId,
            GradoNombre = r.Grado?.Nombre,
            MontoPreestablecido = r.MontoPreestablecido,
            FechaInicioPromocion = r.FechaInicioPromocion,
            FechaFinPromocion = r.FechaFinPromocion,
            Notas = r.Notas,
            Activo = r.Activo,
            OrdenVisualizacionGrid = r.OrdenVisualizacionGrid,
            // Add mapping for audit fields
            FechaCreacion = r.FechaCreacion,
            FechaActualizacion = r.FechaActualizacion,
            UsuarioCreacionId = r.UsuarioCreacionId,
            UsuarioActualizacionId = r.UsuarioActualizacionId,
        });
    }

    public async Task<IEnumerable<PagoReadDto>> GetPagosByRubroIdAsync(int rubroId)
    {
        var pagos = await _rubroRepository.GetPagosByRubroIdAsync(rubroId);
        
        return pagos.Select(p => new PagoReadDto
        {
            Id = p.Id,
            Monto = p.Monto,
            Fecha = p.Fecha,
            CicloEscolar = p.CicloEscolar,
            MedioPago = p.MedioPago,
            MedioPagoDescripcion = p.MedioPago.ToString(),
            RubroId = p.RubroId,
            RubroDescripcion = p.Rubro?.Descripcion ?? "N/A",
            TipoRubro = p.Rubro?.Tipo ?? 0,
            TipoRubroDescripcion = p.Rubro?.Tipo.ToString() ?? "N/A",
            EsColegiatura = p.EsColegiatura,
            MesColegiatura = p.EsColegiatura ? p.MesColegiatura : null,
            AnioColegiatura = p.EsColegiatura ? p.AnioColegiatura : null,
            Notas = p.Notas ?? string.Empty,
            ImagenesPago = p.ImagenesPago?.Select(img => new PagoImagenDto
            {
                Id = img.Id,
                PagoId = img.PagoId,
                Url = img.ImagenUrl.ToString(),
                FechaCreacion = img.FechaCreacion,
            }).ToList() ?? new List<PagoImagenDto>(),
            MontoPreestablecido = p.Rubro?.MontoPreestablecido,
            PenalizacionPorMoraMonto = p.Rubro?.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = p.Rubro?.PenalizacionPorMoraPorcentaje,
            FechaLimitePagoAmarillo = p.Rubro?.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = p.Rubro?.FechaLimitePagoRojo,
            DiaLimitePagoAmarillo = p.Rubro?.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = p.Rubro?.DiaLimitePagoRojo,
            MesLimitePago = p.Rubro?.MesLimitePago,
            OrdenVisualizacionGrid = p.Rubro?.OrdenVisualizacionGrid,
            UsuarioNombre = p.Usuario != null ? $"{p.Usuario.Nombres} {p.Usuario.Apellidos}" : "Sistema",
            FechaCreacion = p.FechaCreacion,
            FechaActualizacion = p.FechaActualizacion,
            UsuarioCreacionId = p.UsuarioCreacionId,
            UsuarioActualizacionId = p.UsuarioActualizacionId,
        });
    }

    public async Task<int> GetPagosCountByRubroIdAsync(int rubroId)
    {
        return await _rubroRepository.GetPagosCountByRubroIdAsync(rubroId);
    }

    public async Task<bool> CanDeleteRubroAsync(int rubroId)
    {
        var pagosCount = await _rubroRepository.GetPagosCountByRubroIdAsync(rubroId);
        return pagosCount == 0; // Can only delete if there are no payments associated
    }
}
