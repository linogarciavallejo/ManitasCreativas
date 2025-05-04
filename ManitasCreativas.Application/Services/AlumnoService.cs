using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;
using ManitasCreativas.Domain.Enums;
using NivelEducativo = ManitasCreativas.Domain.Entities.NivelEducativo;

public class AlumnoService : IAlumnoService
{
    private readonly IAlumnoRepository _alumnoRepository;
    private readonly IGradoRepository _gradoRepository;
    private readonly ISedeRepository _sedeRepository;

    public AlumnoService(
        IAlumnoRepository alumnoRepository, 
        IGradoRepository gradoRepository,
        ISedeRepository sedeRepository)
    {
        _alumnoRepository = alumnoRepository;
        _gradoRepository = gradoRepository;
        _sedeRepository = sedeRepository;
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
            Seccion = a.Seccion, // Added Seccion property mapping
            SedeId = a.SedeId,
            SedeNombre = a.Sede != null ? a.Sede.Nombre : string.Empty,
            GradoId = a.GradoId,
            GradoNombre = a.Grado != null ? a.Grado.Nombre : string.Empty,
            Becado = a.Becado,
            BecaParcialPorcentaje = a.BecaParcialPorcentaje,
            Estado = (int)a.Estado,
            Pagos = (a.Pagos ?? Enumerable.Empty<Pago>()).Select(p => new PagoReadDto
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
            Seccion = alumno.Seccion, // Added Seccion property mapping
            SedeId = alumno.SedeId,
            SedeNombre = alumno.Sede != null ? alumno.Sede.Nombre : string.Empty,
            GradoId = alumno.GradoId,
            GradoNombre = alumno.Grado != null ? alumno.Grado.Nombre : string.Empty,
            Becado = alumno.Becado,
            BecaParcialPorcentaje = alumno.BecaParcialPorcentaje,
            Estado = (int)alumno.Estado,
            Pagos = (alumno.Pagos ?? Enumerable.Empty<Pago>()).Select(p => new PagoReadDto
            {
                Id = p.Id,
                Monto = p.Monto,
                Fecha = p.Fecha
            }).ToList()
        };
    }

    public async Task AddAlumnoAsync(AlumnoDto alumnoDto)
    {
        // Fetch the Grado entity
        var grado = await _gradoRepository.GetByIdAsync(alumnoDto.GradoId);
        if (grado == null)
        {
            throw new Exception($"Grado with ID {alumnoDto.GradoId} not found.");
        }

        // Fetch the Sede entity
        var sede = await _sedeRepository.GetByIdAsync(alumnoDto.SedeId);
        if (sede == null)
        {
            throw new Exception($"Sede with ID {alumnoDto.SedeId} not found.");
        }

        var alumno = new Alumno
        {
            PrimerNombre = alumnoDto.PrimerNombre,
            SegundoNombre = alumnoDto.SegundoNombre,
            PrimerApellido = alumnoDto.PrimerApellido,
            SegundoApellido = alumnoDto.SegundoApellido,
            Codigo = alumnoDto.Codigo,
            Seccion = alumnoDto.Seccion,
            Becado = alumnoDto.Becado,
            BecaParcialPorcentaje = alumnoDto.BecaParcialPorcentaje,
            Estado = (EstadoAlumno)alumnoDto.Estado,
            SedeId = alumnoDto.SedeId,
            GradoId = alumnoDto.GradoId,
            // Set the required navigation properties using the fetched entities
            Sede = sede,
            Grado = grado,
            FechaCreacion = DateTime.UtcNow,
            UsuarioCreacion = alumnoDto.UsuarioCreacion
        };
        
        await _alumnoRepository.AddAsync(alumno);
        
        // Update the DTO with the new ID
        alumnoDto.Id = alumno.Id;
    }

    public async Task UpdateAlumnoAsync(AlumnoDto alumnoDto)
    {
        // Instead of creating a new entity, first fetch the existing one
        var existingAlumno = await _alumnoRepository.GetByIdAsync(alumnoDto.Id);
        if (existingAlumno == null)
        {
            throw new Exception($"Alumno with ID {alumnoDto.Id} not found.");
        }

        // Fetch the Grado entity
        var grado = await _gradoRepository.GetByIdAsync(alumnoDto.GradoId);
        if (grado == null)
        {
            throw new Exception($"Grado with ID {alumnoDto.GradoId} not found.");
        }

        // Fetch the Sede entity
        var sede = await _sedeRepository.GetByIdAsync(alumnoDto.SedeId);
        if (sede == null)
        {
            throw new Exception($"Sede with ID {alumnoDto.SedeId} not found.");
        }

        // Update the properties of the existing entity
        existingAlumno.PrimerNombre = alumnoDto.PrimerNombre;
        existingAlumno.SegundoNombre = alumnoDto.SegundoNombre;
        existingAlumno.PrimerApellido = alumnoDto.PrimerApellido;
        existingAlumno.SegundoApellido = alumnoDto.SegundoApellido;
        existingAlumno.Codigo = alumnoDto.Codigo;
        existingAlumno.Seccion = alumnoDto.Seccion; // This will now correctly update
        existingAlumno.Becado = alumnoDto.Becado;
        existingAlumno.BecaParcialPorcentaje = alumnoDto.BecaParcialPorcentaje;
        existingAlumno.Estado = (EstadoAlumno)alumnoDto.Estado;
        existingAlumno.SedeId = alumnoDto.SedeId;
        existingAlumno.GradoId = alumnoDto.GradoId;
        existingAlumno.Sede = sede;
        existingAlumno.Grado = grado;
        existingAlumno.FechaActualizacion = DateTime.UtcNow;
        existingAlumno.UsuarioActualizacion = alumnoDto.UsuarioActualizacion;
        
        await _alumnoRepository.UpdateAsync(existingAlumno);
    }

    public async Task DeleteAlumnoAsync(int id)
    {
        await _alumnoRepository.DeleteAsync(id);
    }

    public async Task<AlumnoDto?> GetAlumnoByCodigoAsync(string codigo)
    {
        var alumno = await _alumnoRepository.GetAlumnoByCodigoAsync(codigo);
        return alumno == null ? null : new AlumnoDto
        {
            Id = alumno.Id,
            PrimerNombre = alumno.PrimerNombre,
            SegundoNombre = alumno.SegundoNombre,
            PrimerApellido = alumno.PrimerApellido,
            SegundoApellido = alumno.SegundoApellido,
            Codigo = alumno.Codigo,
            SedeId = alumno.SedeId,
            SedeNombre = alumno.Sede != null ? alumno.Sede.Nombre : string.Empty,
            GradoId = alumno.GradoId,
            GradoNombre = alumno.Grado != null ? alumno.Grado.Nombre : string.Empty,
            Becado = alumno.Becado,
            BecaParcialPorcentaje = alumno.BecaParcialPorcentaje != null ? alumno.BecaParcialPorcentaje : 0,
            Pagos = (alumno.Pagos ?? Enumerable.Empty<Pago>()).Select(p => new PagoReadDto
            {
                Id = p.Id,
                Monto = p.Monto,
                Fecha = p.Fecha,
                CicloEscolar = p.CicloEscolar,
                MedioPago = p.MedioPago,
                RubroDescripcion = p.Rubro != null ? p.Rubro.Descripcion : string.Empty,
                ImagenesPago = (p.ImagenesPago ?? Enumerable.Empty<PagoImagen>())
                    .Select(i => new PagoImagenDto
                    {
                        Id = i.Id,
                        PagoId = i.PagoId,
                        Url = i.ImagenUrl.ToString()
                    })
                    .ToList()
            }).ToList(),
            Contactos = (alumno.AlumnoContactos ?? Enumerable.Empty<AlumnoContacto>())
            .Select(ac => new AlumnoContactoDto
            {
                AlumnoId = ac.AlumnoId,
                ContactoId = ac.ContactoId,
                Contacto = new ContactoDto
                {
                    Id = ac.Contacto.Id,
                    Nombre = ac.Contacto.Nombre,
                    TelefonoTrabajo = ac.Contacto.TelefonoTrabajo,
                    Celular = ac.Contacto.Celular,
                    Direccion = ac.Contacto.Direccion,
                    Email = ac.Contacto.Email,
                    Nit = ac.Contacto.Nit,
                },
                Parentesco = ac.Parentesco,
            }).ToList()
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
            Pagos = alumno.Pagos.Select(p => new PagoReadDto
            {
                Id = p.Id,
                Monto = p.Monto,
                Fecha = p.Fecha,
                CicloEscolar = p.CicloEscolar,
                MedioPago = p.MedioPago,
                RubroDescripcion = p.Rubro.Descripcion,
                ImagenesPago = p.ImagenesPago.Select(pi => new PagoImagenDto
                {
                    Id = pi.Id,
                    PagoId = pi.PagoId,
                    Url = pi.ImagenUrl.ToString()
                }).ToList()
            }).ToList()
        };
    }

    public async Task<IEnumerable<AlumnoDto>> GetAlumnosByNamesAsync(string nombre, string apellido)
    {
        var alumnos = await _alumnoRepository.GetAlumnosByNamesAsync(nombre, apellido) ?? Enumerable.Empty<Alumno>();

        return alumnos.Select(a => new AlumnoDto
        {
            Id = a.Id,
            Codigo = a.Codigo,
            PrimerNombre = a.PrimerNombre,
            SegundoNombre = a.SegundoNombre,
            PrimerApellido = a.PrimerApellido,
            SegundoApellido = a.SegundoApellido,
            SedeId = a.SedeId,
            SedeNombre = a.Sede != null ? a.Sede.Nombre : string.Empty,
            GradoId = a.GradoId,
            GradoNombre = a.Grado != null ? a.Grado.Nombre : string.Empty,
            Becado = a.Becado,
            BecaParcialPorcentaje = a.BecaParcialPorcentaje,
            Pagos = (a.Pagos ?? Enumerable.Empty<Pago>()).Select(p => new PagoReadDto
            {
                Id = p.Id,
                Monto = p.Monto,
                Fecha = p.Fecha,
                CicloEscolar = p.CicloEscolar,
                MedioPago = p.MedioPago,
                RubroDescripcion = p.Rubro != null ? p.Rubro.Descripcion : string.Empty,
                ImagenesPago = (p.ImagenesPago ?? Enumerable.Empty<PagoImagen>())
                                .Select(i => new PagoImagenDto
                                {
                                    Id = i.Id,
                                    PagoId = i.PagoId,
                                    Url = i.ImagenUrl.ToString()
                                })
                                .ToList()
            }).ToList()
        });
    }

    public async Task<IEnumerable<AlumnoSimpleDto>> GetAlumnosWithFullNameAsync()
    {
        var alumnos = await _alumnoRepository.GetAllAsync();
        return alumnos.Select(a => new AlumnoSimpleDto
        {
            Id = a.Id,
            Codigo = a.Codigo,
            FullName = string.Join(" ", new string?[]
            {
                a.PrimerNombre,
                a.SegundoNombre,
                a.PrimerApellido,
                a.SegundoApellido
            }.Where(s => !string.IsNullOrWhiteSpace(s)))
        })
        .OrderBy(dto => dto.FullName)
        .ToList();
    }

    // In AlumnoService.cs
    public async Task<IEnumerable<PagoReadDto>> GetAlumnoStatementAsync(int id)
    {
        var alumno = await _alumnoRepository.GetAlumnoWithFullPaymentDetailsAsync(id);

        if (alumno == null)
            return Enumerable.Empty<PagoReadDto>();

        return alumno.Pagos
            .OrderBy(p => p.Fecha)
            .Select(p => new PagoReadDto
        {
            Id = p.Id,
            Monto = p.Monto,
            Fecha = p.Fecha,
            CicloEscolar = p.CicloEscolar,
            MedioPago = p.MedioPago,
            MedioPagoDescripcion = p.MedioPago.ToString(),
            RubroId = p.RubroId,
            RubroDescripcion = p.Rubro?.Descripcion ?? string.Empty,
            TipoRubro = p.Rubro?.Tipo ?? TipoRubro.Otro,
            TipoRubroDescripcion = p.Rubro?.Tipo.ToString() ?? string.Empty,
            EsColegiatura = p.Rubro?.Tipo == TipoRubro.Colegiatura,
            MesColegiatura = p.MesColegiatura,
            AnioColegiatura = p.AnioColegiatura,
            Notas = p.Notas ?? string.Empty,
            MontoPreestablecido = p.Rubro?.MontoPreestablecido,
            PenalizacionPorMoraMonto = p.Rubro?.PenalizacionPorMoraMonto,
            PenalizacionPorMoraPorcentaje = p.Rubro?.PenalizacionPorMoraPorcentaje,
            FechaLimitePagoAmarillo = p.Rubro?.FechaLimitePagoAmarillo,
            FechaLimitePagoRojo = p.Rubro?.FechaLimitePagoRojo,
            DiaLimitePagoAmarillo = p.Rubro?.DiaLimitePagoAmarillo,
            DiaLimitePagoRojo = p.Rubro?.DiaLimitePagoRojo,
            MesLimitePago = p.Rubro?.MesLimitePago,
            UsuarioId = p.UsuarioId,
            UsuarioNombre = p.Usuario != null
                ? $"{p.Usuario.Nombres} {p.Usuario.Apellidos}"
                : string.Empty,
            ImagenesPago = (p.ImagenesPago ?? Enumerable.Empty<PagoImagen>())
                .Select(i => new PagoImagenDto
                {
                    Id = i.Id,
                    PagoId = i.PagoId,
                    Url = i.ImagenUrl?.ToString() ?? string.Empty
                    //FileName = i.FileName ?? string.Empty,
                    //ContentType = i.ContentType ?? string.Empty
                })
                .ToList()
        })
        .ToList();
    }

}