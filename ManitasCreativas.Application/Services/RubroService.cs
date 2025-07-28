namespace ManitasCreativas.Application.Services;

using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;
using ManitasCreativas.Domain.Enums;

public class RubroService : IRubroService
{
    private readonly IRubroRepository _rubroRepository;
    private readonly INivelEducativoRepository _nivelEducativoRepository;
    private readonly IGradoRepository _gradoRepository;

    public RubroService(
        IRubroRepository rubroRepository,
        INivelEducativoRepository nivelEducativoRepository,
        IGradoRepository gradoRepository)
    {
        _rubroRepository = rubroRepository;
        _nivelEducativoRepository = nivelEducativoRepository;
        _gradoRepository = gradoRepository;
    }

    public async Task<IEnumerable<RubroDto>> GetAllRubrosAsync()
    {
        var rubros = await _rubroRepository.GetAllAsync();
        return rubros.Select(r => new RubroDto
        {
            Id = r.Id,
            Descripcion = r.Descripcion,
            Tipo = (int)r.Tipo,
            TipoDescripcion = r.Tipo.ToString(),
            PenalizacionPorMoraMonto = r.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = r.PenalizacionPorMoraPorcentaje,
            FechaLimitePagoAmarillo = r.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = r.FechaLimitePagoRojo,
            EsColegiatura = r.EsColegiatura,
            DiaLimitePagoAmarillo = r.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = r.DiaLimitePagoRojo,
            MesLimitePago = r.MesLimitePago,
            NivelEducativoId = r.NivelEducativoId,
            GradoId = r.GradoId,
            MontoPreestablecido = r.MontoPreestablecido,
            FechaInicioPromocion = r.FechaInicioPromocion,
            FechaFinPromocion = r.FechaFinPromocion,
            EsPagoDeCarnet = r.EsPagoDeCarnet,
            EsPagoDeTransporte = r.EsPagoDeTransporte,
            EsPagoDeUniforme = r.EsPagoDeUniforme,
            Notas = r.Notas,
            Activo = r.Activo ?? true,
            OrdenVisualizacionGrid = r.OrdenVisualizacionGrid,
            UsuarioCreacionId = r.UsuarioCreacionId,
            UsuarioActualizacionId = r.UsuarioActualizacionId
        });
    }

    public async Task<RubroDto?> GetRubroByIdAsync(int id)
    {
        var rubro = await _rubroRepository.GetByIdAsync(id);
        
        if (rubro == null) return null;
        
        return new RubroDto
        {
            Id = rubro.Id,
            Descripcion = rubro.Descripcion,
            Tipo = (int)rubro.Tipo,
            TipoDescripcion = rubro.Tipo.ToString(),
            PenalizacionPorMoraMonto = rubro.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = rubro.PenalizacionPorMoraPorcentaje,
            FechaLimitePagoAmarillo = rubro.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = rubro.FechaLimitePagoRojo,
            EsColegiatura = rubro.EsColegiatura,
            DiaLimitePagoAmarillo = rubro.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubro.DiaLimitePagoRojo,
            MesLimitePago = rubro.MesLimitePago,
            NivelEducativoId = rubro.NivelEducativoId,
            GradoId = rubro.GradoId,
            MontoPreestablecido = rubro.MontoPreestablecido,
            FechaInicioPromocion = rubro.FechaInicioPromocion,
            FechaFinPromocion = rubro.FechaFinPromocion,
            EsPagoDeCarnet = rubro.EsPagoDeCarnet,
            EsPagoDeTransporte = rubro.EsPagoDeTransporte,
            EsPagoDeUniforme = rubro.EsPagoDeUniforme,
            Notas = rubro.Notas,
            Activo = rubro.Activo ?? true,
            OrdenVisualizacionGrid = rubro.OrdenVisualizacionGrid
        };
    }

    public async Task AddRubroAsync(RubroDto rubroDto)
    {
        // Verify that UsuarioCreacionId is provided
        if (rubroDto.UsuarioCreacionId <= 0)
        {
            throw new Exception("UsuarioCreacionId is required and must be a valid user ID.");
        }

        // Check if nivel educativo exists if it's provided
        if (rubroDto.NivelEducativoId.HasValue)
        {
            var nivelEducativo = await _nivelEducativoRepository.GetByIdAsync(rubroDto.NivelEducativoId.Value);
            if (nivelEducativo == null)
            {
                throw new Exception($"NivelEducativo with ID {rubroDto.NivelEducativoId.Value} not found.");
            }
        }

        // Check if grado exists if it's provided
        if (rubroDto.GradoId.HasValue)
        {
            var grado = await _gradoRepository.GetByIdAsync(rubroDto.GradoId.Value);
            if (grado == null)
            {
                throw new Exception($"Grado with ID {rubroDto.GradoId.Value} not found.");
            }
        }

        var rubro = new Rubro
        {
            Descripcion = rubroDto.Descripcion,
            Tipo = (TipoRubro)rubroDto.Tipo,
            PenalizacionPorMoraMonto = rubroDto.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = rubroDto.PenalizacionPorMoraPorcentaje,
            FechaLimitePagoAmarillo = rubroDto.FechaLimitePagoAmarillo?.Kind == DateTimeKind.Utc 
                ? rubroDto.FechaLimitePagoAmarillo 
                : rubroDto.FechaLimitePagoAmarillo?.ToUniversalTime(),
            FechaLimitePagoRojo = rubroDto.FechaLimitePagoRojo?.Kind == DateTimeKind.Utc 
                ? rubroDto.FechaLimitePagoRojo 
                : rubroDto.FechaLimitePagoRojo?.ToUniversalTime(),
            EsColegiatura = rubroDto.EsColegiatura,
            DiaLimitePagoAmarillo = rubroDto.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubroDto.DiaLimitePagoRojo,
            MesLimitePago = rubroDto.MesLimitePago,
            NivelEducativoId = rubroDto.NivelEducativoId,
            GradoId = rubroDto.GradoId,
            MontoPreestablecido = rubroDto.MontoPreestablecido,
            FechaInicioPromocion = rubroDto.FechaInicioPromocion?.Kind == DateTimeKind.Utc 
                ? rubroDto.FechaInicioPromocion 
                : rubroDto.FechaInicioPromocion?.ToUniversalTime(),
            FechaFinPromocion = rubroDto.FechaFinPromocion?.Kind == DateTimeKind.Utc 
                ? rubroDto.FechaFinPromocion 
                : rubroDto.FechaFinPromocion?.ToUniversalTime(),
            EsPagoDeCarnet = rubroDto.EsPagoDeCarnet,
            EsPagoDeTransporte = rubroDto.EsPagoDeTransporte,
            EsPagoDeUniforme = rubroDto.EsPagoDeUniforme,
            Notas = rubroDto.Notas,
            Activo = rubroDto.Activo,
            OrdenVisualizacionGrid = rubroDto.OrdenVisualizacionGrid,
            FechaCreacion = DateTime.UtcNow,
            UsuarioCreacionId = rubroDto.UsuarioCreacionId // Set the user ID from DTO
        };

        // Debug logging for the entity before create
        Console.WriteLine($"RubroService.AddRubroAsync - Before create:");
        Console.WriteLine($"  EsPagoDeUniforme: {rubro.EsPagoDeUniforme}");
        Console.WriteLine($"  OrdenVisualizacionGrid: {rubro.OrdenVisualizacionGrid}");
        Console.WriteLine($"  UsuarioCreacionId: {rubro.UsuarioCreacionId}");

        await _rubroRepository.AddAsync(rubro);
        rubroDto.Id = rubro.Id;
        
        // Debug logging after create
        Console.WriteLine($"RubroService.AddRubroAsync - After create completed, ID: {rubro.Id}");
    }    public async Task UpdateRubroAsync(RubroDto rubroDto)
    {
        // Verify that UsuarioActualizacionId is provided
        if (rubroDto.UsuarioActualizacionId <= 0)
        {
            throw new Exception("UsuarioActualizacionId is required and must be a valid user ID.");
        }

        var existingRubro = await _rubroRepository.GetByIdAsync(rubroDto.Id);
        if (existingRubro == null)
        {
            throw new Exception($"Rubro with ID {rubroDto.Id} not found.");
        }

        // Check if nivel educativo exists if it's provided
        if (rubroDto.NivelEducativoId.HasValue)
        {
            var nivelEducativo = await _nivelEducativoRepository.GetByIdAsync(rubroDto.NivelEducativoId.Value);
            if (nivelEducativo == null)
            {
                throw new Exception($"NivelEducativo with ID {rubroDto.NivelEducativoId.Value} not found.");
            }
        }

        // Check if grado exists if it's provided
        if (rubroDto.GradoId.HasValue)
        {
            var grado = await _gradoRepository.GetByIdAsync(rubroDto.GradoId.Value);
            if (grado == null)
            {
                throw new Exception($"Grado with ID {rubroDto.GradoId.Value} not found.");
            }
        }

        existingRubro.Descripcion = rubroDto.Descripcion;
        existingRubro.Tipo = (TipoRubro)rubroDto.Tipo;
        existingRubro.PenalizacionPorMoraMonto = rubroDto.PenalizacionPorMoraMonto;
        existingRubro.PenalizacionPorMoraPorcentaje = rubroDto.PenalizacionPorMoraPorcentaje;        existingRubro.FechaLimitePagoAmarillo = rubroDto.FechaLimitePagoAmarillo?.Kind == DateTimeKind.Utc 
            ? rubroDto.FechaLimitePagoAmarillo 
            : rubroDto.FechaLimitePagoAmarillo?.ToUniversalTime();
        existingRubro.FechaLimitePagoRojo = rubroDto.FechaLimitePagoRojo?.Kind == DateTimeKind.Utc 
            ? rubroDto.FechaLimitePagoRojo 
            : rubroDto.FechaLimitePagoRojo?.ToUniversalTime();
        existingRubro.EsColegiatura = rubroDto.EsColegiatura;
        existingRubro.DiaLimitePagoAmarillo = rubroDto.DiaLimitePagoAmarillo;
        existingRubro.DiaLimitePagoRojo = rubroDto.DiaLimitePagoRojo;
        existingRubro.MesLimitePago = rubroDto.MesLimitePago;
        existingRubro.NivelEducativoId = rubroDto.NivelEducativoId;
        existingRubro.GradoId = rubroDto.GradoId;
        existingRubro.MontoPreestablecido = rubroDto.MontoPreestablecido;        existingRubro.FechaInicioPromocion = rubroDto.FechaInicioPromocion?.Kind == DateTimeKind.Utc 
            ? rubroDto.FechaInicioPromocion 
            : rubroDto.FechaInicioPromocion?.ToUniversalTime();
        existingRubro.FechaFinPromocion = rubroDto.FechaFinPromocion?.Kind == DateTimeKind.Utc 
            ? rubroDto.FechaFinPromocion 
            : rubroDto.FechaFinPromocion?.ToUniversalTime();
        existingRubro.EsPagoDeCarnet = rubroDto.EsPagoDeCarnet;
        existingRubro.EsPagoDeTransporte = rubroDto.EsPagoDeTransporte;
        existingRubro.EsPagoDeUniforme = rubroDto.EsPagoDeUniforme;
        existingRubro.Notas = rubroDto.Notas;
        existingRubro.Activo = rubroDto.Activo;
        existingRubro.OrdenVisualizacionGrid = rubroDto.OrdenVisualizacionGrid;
        existingRubro.FechaActualizacion = DateTime.UtcNow;
        existingRubro.UsuarioActualizacionId = rubroDto.UsuarioActualizacionId; // Set the user ID from DTO
        
        // Debug logging for the entity before update
        Console.WriteLine($"RubroService.UpdateRubroAsync - Before update:");
        Console.WriteLine($"  EsPagoDeUniforme: {existingRubro.EsPagoDeUniforme}");
        Console.WriteLine($"  OrdenVisualizacionGrid: {existingRubro.OrdenVisualizacionGrid}");
        Console.WriteLine($"  UsuarioActualizacionId: {existingRubro.UsuarioActualizacionId}");
 
        await _rubroRepository.UpdateAsync(existingRubro);
        
        // Debug logging after update
        Console.WriteLine($"RubroService.UpdateRubroAsync - After update completed");
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
            Tipo = (int)r.Tipo,
            TipoDescripcion = r.Tipo.ToString(),
            PenalizacionPorMoraMonto = r.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = r.PenalizacionPorMoraPorcentaje,
            FechaLimitePagoAmarillo = r.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = r.FechaLimitePagoRojo,
            EsColegiatura = r.EsColegiatura,
            DiaLimitePagoAmarillo = r.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = r.DiaLimitePagoRojo,
            MesLimitePago = r.MesLimitePago,
            NivelEducativoId = r.NivelEducativoId,
            GradoId = r.GradoId,
            MontoPreestablecido = r.MontoPreestablecido,
            FechaInicioPromocion = r.FechaInicioPromocion,
            FechaFinPromocion = r.FechaFinPromocion,
            EsPagoDeCarnet = r.EsPagoDeCarnet,
            EsPagoDeTransporte = r.EsPagoDeTransporte,
            EsPagoDeUniforme = r.EsPagoDeUniforme,
            Notas = r.Notas,
            Activo = r.Activo ?? true,
            OrdenVisualizacionGrid = r.OrdenVisualizacionGrid
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
            TipoRubro = (TipoRubro)(int)(p.Rubro?.Tipo ?? 0),
            TipoRubroDescripcion = p.Rubro?.Tipo.ToString() ?? "N/A",
            EsColegiatura = p.EsColegiatura,
            MesColegiatura = p.EsColegiatura ? p.MesColegiatura : null,
            AnioColegiatura = p.EsColegiatura ? p.AnioColegiatura : null,            Notas = p.Notas ?? string.Empty,
            ImagenesPago = p.ImagenesPago?.Where(img => img.EsImagenEliminada != true).Select(img => new PagoImagenDto
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
            UsuarioNombre = p.UsuarioCreacion != null ? $"{p.UsuarioCreacion.Nombres}   {p.UsuarioCreacion.Apellidos}" : "Sistema",
            FechaCreacion = p.FechaCreacion,
            FechaActualizacion = p.FechaActualizacion,
            UsuarioCreacionId = p.UsuarioCreacionId,
            UsuarioActualizacionId = p.UsuarioActualizacionId,
            EsPagoDeCarnet = p.Rubro?.EsPagoDeCarnet,
            EsPagoDeTransporte = p.Rubro?.EsPagoDeTransporte,
            EsPagoDeUniforme = p.Rubro?.EsPagoDeUniforme,
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
