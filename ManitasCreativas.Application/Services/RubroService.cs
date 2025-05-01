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
            MesColegiatura = r.MesColegiatura,
            DiaLimitePagoAmarillo = r.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = r.DiaLimitePagoRojo,
            MesLimitePago = r.MesLimitePago,
            NivelEducativoId = r.NivelEducativoId,
            NivelEducativoNombre = r.NivelEducativo?.Nombre,
            GradoId = r.GradoId,
            GradoNombre = r.Grado?.Nombre,
            MontoPreestablecido = r.MontoPreestablecido,
            Notas = r.Notas,
            Activo = r.Activo,
            // Add mapping for audit fields
            FechaCreacion = r.FechaCreacion,
            FechaActualizacion = r.FechaActualizacion,
            UsuarioCreacion = r.UsuarioCreacion,
            UsuarioActualizacion = r.UsuarioActualizacion
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
            MesColegiatura = rubro.MesColegiatura,
            DiaLimitePagoAmarillo = rubro.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubro.DiaLimitePagoRojo,
            MesLimitePago = rubro.MesLimitePago,
            NivelEducativoId = rubro.NivelEducativoId,
            NivelEducativoNombre = rubro.NivelEducativo?.Nombre,
            GradoId = rubro.GradoId,
            GradoNombre = rubro.Grado?.Nombre,
            MontoPreestablecido = rubro.MontoPreestablecido,
            Notas = rubro.Notas,
            Activo = rubro.Activo,
            // Add mapping for audit fields
            FechaCreacion = rubro.FechaCreacion,
            FechaActualizacion = rubro.FechaActualizacion,
            UsuarioCreacion = rubro.UsuarioCreacion,
            UsuarioActualizacion = rubro.UsuarioActualizacion
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
            MesColegiatura = rubroDto.MesColegiatura,
            DiaLimitePagoAmarillo = rubroDto.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubroDto.DiaLimitePagoRojo,
            MesLimitePago = rubroDto.MesLimitePago,
            NivelEducativoId = rubroDto.NivelEducativoId,
            GradoId = rubroDto.GradoId,
            MontoPreestablecido = rubroDto.MontoPreestablecido,
            Notas = rubroDto.Notas,
            Activo = rubroDto.Activo,
            UsuarioCreacion = rubroDto.UsuarioCreacion
        };
        
        // Handle DateTime properties explicitly to ensure UTC format for PostgreSQL
        if (rubroDto.FechaLimitePagoAmarillo.HasValue)
        {
            rubro.FechaLimitePagoAmarillo = DateTime.SpecifyKind(
                rubroDto.FechaLimitePagoAmarillo.Value, DateTimeKind.Utc);
        }
        
        if (rubroDto.FechaLimitePagoRojo.HasValue)
        {
            rubro.FechaLimitePagoRojo = DateTime.SpecifyKind(
                rubroDto.FechaLimitePagoRojo.Value, DateTimeKind.Utc);
        }
        
        // Set FechaCreacion using UTC format
        rubro.FechaCreacion = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
        
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
            MesColegiatura = rubroDto.MesColegiatura,
            DiaLimitePagoAmarillo = rubroDto.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = rubroDto.DiaLimitePagoRojo,
            MesLimitePago = rubroDto.MesLimitePago,
            NivelEducativoId = rubroDto.NivelEducativoId,
            GradoId = rubroDto.GradoId,
            MontoPreestablecido = rubroDto.MontoPreestablecido,
            Notas = rubroDto.Notas,
            Activo = rubroDto.Activo,
            // Preserve original creation information
            FechaCreacion = existingRubro.FechaCreacion,
            UsuarioCreacion = existingRubro.UsuarioCreacion,
            // Update modification information
            UsuarioActualizacion = rubroDto.UsuarioActualizacion
        };
        
        // Handle DateTime properties explicitly to ensure UTC format for PostgreSQL
        if (rubroDto.FechaLimitePagoAmarillo.HasValue)
        {
            rubro.FechaLimitePagoAmarillo = DateTime.SpecifyKind(
                rubroDto.FechaLimitePagoAmarillo.Value, DateTimeKind.Utc);
        }
        
        if (rubroDto.FechaLimitePagoRojo.HasValue)
        {
            rubro.FechaLimitePagoRojo = DateTime.SpecifyKind(
                rubroDto.FechaLimitePagoRojo.Value, DateTimeKind.Utc);
        }
        
        // Set FechaActualizacion using UTC format
        rubro.FechaActualizacion = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
        
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
            MesColegiatura = r.MesColegiatura,
            DiaLimitePagoAmarillo = r.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = r.DiaLimitePagoRojo,
            MesLimitePago = r.MesLimitePago,
            NivelEducativoId = r.NivelEducativoId,
            NivelEducativoNombre = r.NivelEducativo?.Nombre,
            GradoId = r.GradoId,
            GradoNombre = r.Grado?.Nombre,
            MontoPreestablecido = r.MontoPreestablecido,
            Notas = r.Notas,
            Activo = r.Activo,
            // Add mapping for audit fields
            FechaCreacion = r.FechaCreacion,
            FechaActualizacion = r.FechaActualizacion,
            UsuarioCreacion = r.UsuarioCreacion,
            UsuarioActualizacion = r.UsuarioActualizacion
        });
    }
}
