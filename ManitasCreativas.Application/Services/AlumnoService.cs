using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;

public class AlumnoService : IAlumnoService
{
    private readonly IAlumnoRepository _alumnoRepository;

    public AlumnoService(IAlumnoRepository alumnoRepository)
    {
        _alumnoRepository = alumnoRepository;
    }

    public async Task<IEnumerable<AlumnoDto>> GetAllAlumnosAsync()
    {
        var alumnos = await _alumnoRepository.GetAllAsync();
        return alumnos.Select(a => new AlumnoDto
        {
            Id = a.Id,
            Codigo = a.Codigo,
            PrimerNombre = a.PrimerNombre,
            SegundoNombre = a.SegundoNombre,
            PrimerApellido = a.PrimerApellido,
            SegundoApellido = a.SegundoApellido,
            SedeId = a.SedeId,
            SedeNombre = a.Sede.Nombre,
            GradoId = a.GradoId,
            GradoNombre = a.Grado.Nombre,
            Becado = a.Becado,
            BecaParcialPorcentaje = a.BecaParcialPorcentaje,
            Pagos = a.Pagos.Select(p => new PagoDto
            {
                Id = p.Id,
                Monto = p.Monto,
                Fecha = p.Fecha
            }).ToList()
        });
    }

    public async Task<AlumnoDto?> GetAlumnoByIdAsync(int id)
    {
        var alumno = await _alumnoRepository.GetByIdAsync(id);
        return alumno == null ? null : new AlumnoDto
        {
            Id = alumno.Id,
            Codigo = alumno.Codigo,
            PrimerNombre = alumno.PrimerNombre,
            SegundoNombre = alumno.SegundoNombre,
            PrimerApellido = alumno.PrimerApellido,
            SegundoApellido = alumno.SegundoApellido,
            SedeId = alumno.SedeId,
            SedeNombre = alumno.Sede.Nombre,
            GradoId = alumno.GradoId,
            GradoNombre = alumno.Grado.Nombre,
            Becado = alumno.Becado,
            BecaParcialPorcentaje = alumno.BecaParcialPorcentaje,
            Pagos = alumno.Pagos.Select(p => new PagoDto
            {
                Id = p.Id,
                Monto = p.Monto,
                Fecha = p.Fecha
            }).ToList()
        };
    }

    public async Task AddAlumnoAsync(AlumnoDto alumnoDto)
    {
        var alumno = new Alumno
        {
            PrimerNombre = alumnoDto.PrimerNombre,
            SegundoNombre = alumnoDto.SegundoNombre,
            PrimerApellido = alumnoDto.PrimerApellido,
            SegundoApellido = alumnoDto.SegundoApellido,
            Codigo = alumnoDto.Codigo,
            Sede = new Sede { Id = alumnoDto.SedeId, Nombre = alumnoDto.SedeNombre },
            Grado = new Grado { Id = alumnoDto.GradoId, Nombre = alumnoDto.GradoNombre }
        };
        await _alumnoRepository.AddAsync(alumno);
    }

    public async Task UpdateAlumnoAsync(AlumnoDto alumnoDto)
    {
        var alumno = new Alumno
        {
            Id = alumnoDto.Id,
            PrimerNombre = alumnoDto.PrimerNombre,
            SegundoNombre = alumnoDto.SegundoNombre,
            PrimerApellido = alumnoDto.PrimerApellido,
            SegundoApellido = alumnoDto.SegundoApellido,
            Codigo = alumnoDto.Codigo,
            Sede = new Sede { Id = alumnoDto.SedeId, Nombre = alumnoDto.SedeNombre },
            Grado = new Grado { Id = alumnoDto.GradoId, Nombre = alumnoDto.GradoNombre }
        };
        await _alumnoRepository.UpdateAsync(alumno);
    }

    public async Task DeleteAlumnoAsync(int id)
    {
        await _alumnoRepository.DeleteAsync(id);
    }

    public async Task<AlumnoDto?> GetAlumnoByCodigoAsync(string codigo)
    {
        var alumno = await _alumnoRepository.GetByCodigoAsync(codigo);
        return alumno == null ? null : new AlumnoDto
        {
            Id = alumno.Id,
            PrimerNombre = alumno.PrimerNombre,
            SegundoNombre = alumno.SegundoNombre,
            PrimerApellido = alumno.PrimerApellido,
            SegundoApellido = alumno.SegundoApellido,
            Codigo = alumno.Codigo
        };
    }

    public async Task<AlumnoDto?> GetAlumnoWithPagosAsync(int id)
    {
        var alumno = await _alumnoRepository.GetByIdAsync(id);
        if (alumno == null) return null;

        return new AlumnoDto
        {
            Id = alumno.Id,
            Codigo = alumno.Codigo,
            PrimerNombre = alumno.PrimerNombre,
            SegundoNombre = alumno.SegundoNombre,
            PrimerApellido = alumno.PrimerApellido,
            SegundoApellido = alumno.SegundoApellido,
            SedeId = alumno.SedeId,
            SedeNombre = alumno.Sede.Nombre,
            GradoId = alumno.GradoId,
            GradoNombre = alumno.Grado.Nombre,
            Becado = alumno.Becado,
            BecaParcialPorcentaje = alumno.BecaParcialPorcentaje,
            Pagos = alumno.Pagos.Select(p => new PagoDto
            {
                Id = p.Id,
                Monto = p.Monto,
                Fecha = p.Fecha,
                CicloEscolar = p.CicloEscolar,
                MedioPago = p.MedioPago,
                RubroNombre = p.Rubro.Descripcion,
                ImagenesPago = p.ImagenesPago.Select(pi => new PagoImagenDto
                {
                    Id = pi.Id,
                    PagoId = pi.PagoId,
                    Url = pi.ImagenUrl.ToString()
                }).ToList()
            }).ToList()
        };
    }
}