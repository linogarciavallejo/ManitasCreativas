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
            PenalizacionPorMora = r.PenalizacionPorMora,
            FechaLimitePago = r.FechaLimitePago,
            MesColegiatura = r.MesColegiatura,
            DiaLimitePago = r.DiaLimitePago,
            MesLimitePago = r.MesLimitePago,
            MontoPreestablecido = r.MontoPreestablecido,
            Activo = r.Activo
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
            PenalizacionPorMora = rubro.PenalizacionPorMora,
            FechaLimitePago = rubro.FechaLimitePago,
            MesColegiatura = rubro.MesColegiatura,
            DiaLimitePago = rubro.DiaLimitePago,
            MesLimitePago = rubro.MesLimitePago,
            MontoPreestablecido = rubro.MontoPreestablecido,
            Activo = rubro.Activo
        };
    }

    public async Task AddRubroAsync(RubroDto rubroDto)
    {
        var rubro = new Rubro
        {
            Descripcion = rubroDto.Descripcion,
            Tipo = rubroDto.Tipo,
            PenalizacionPorMora = rubroDto.PenalizacionPorMora,
            FechaLimitePago = rubroDto.FechaLimitePago,
            MesColegiatura = rubroDto.MesColegiatura,
            DiaLimitePago = rubroDto.DiaLimitePago,
            MesLimitePago = rubroDto.MesLimitePago,
            MontoPreestablecido = rubroDto.MontoPreestablecido,
            Activo = rubroDto.Activo
        };
        await _rubroRepository.AddAsync(rubro);
    }

    public async Task UpdateRubroAsync(RubroDto rubroDto)
    {
        var rubro = new Rubro
        {
            Id = rubroDto.Id,
            Descripcion = rubroDto.Descripcion,
            Tipo = rubroDto.Tipo,
            PenalizacionPorMora = rubroDto.PenalizacionPorMora,
            FechaLimitePago = rubroDto.FechaLimitePago,
            MesColegiatura = rubroDto.MesColegiatura,
            DiaLimitePago = rubroDto.DiaLimitePago,
            MesLimitePago = rubroDto.MesLimitePago,
            MontoPreestablecido = rubroDto.MontoPreestablecido,
            Activo = rubroDto.Activo
        };
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
            PenalizacionPorMora = r.PenalizacionPorMora,
            FechaLimitePago = r.FechaLimitePago,
            MesColegiatura = r.MesColegiatura,
            DiaLimitePago = r.DiaLimitePago,
            MesLimitePago = r.MesLimitePago,
            MontoPreestablecido = r.MontoPreestablecido,
            Activo = r.Activo
        });
    }
}
