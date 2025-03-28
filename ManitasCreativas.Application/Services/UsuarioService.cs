using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Domain.Entities;
using ManitasCreativas.Domain.Enums;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<IEnumerable<UsuarioDto>> GetAllUsuariosAsync()
    {
        var usuarios = await _usuarioRepository.GetAllAsync();
        return usuarios.Select(u => new UsuarioDto
        {
            Id = u.Id,
            Nombres = u.Nombres,
            Apellidos = u.Apellidos,
            CodigoUsuario = u.CodigoUsuario,
            Email = u.Email,
            Celular = u.Celular,
            Password = u.Password,
            EstadoUsuario = u.EstadoUsuario.ToString(),
            Rol = u.Rol.Nombre
        });
    }

    public async Task<UsuarioDto?> GetUsuarioByIdAsync(int id)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        return usuario == null ? null : new UsuarioDto
        {
            Id = usuario.Id,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            CodigoUsuario = usuario.CodigoUsuario,
            Email = usuario.Email,
            Celular = usuario.Celular,
            Password = usuario.Password,
            EstadoUsuario = usuario.EstadoUsuario.ToString(),
            Rol = usuario.Rol.Nombre
        };
    }

    public async Task AddUsuarioAsync(UsuarioDto usuarioDto)
    {
        var usuario = new Usuario
        {
            Nombres = usuarioDto.Nombres,
            Apellidos = usuarioDto.Apellidos,
            CodigoUsuario = usuarioDto.CodigoUsuario,
            Email = usuarioDto.Email,
            Celular = usuarioDto.Celular,
            Password = usuarioDto.Password,
            EstadoUsuario = Enum.Parse<EstadoUsuario>(usuarioDto.EstadoUsuario),
            Rol = new Rol { Nombre = usuarioDto.Rol }
        };
        await _usuarioRepository.AddAsync(usuario);
    }

    public async Task UpdateUsuarioAsync(UsuarioDto usuarioDto)
    {
        var usuario = new Usuario
        {
            Id = usuarioDto.Id,
            Nombres = usuarioDto.Nombres,
            Apellidos = usuarioDto.Apellidos,
            CodigoUsuario = usuarioDto.CodigoUsuario,
            Email = usuarioDto.Email,
            Celular = usuarioDto.Celular,
            Password = usuarioDto.Password,
            EstadoUsuario = Enum.Parse<EstadoUsuario>(usuarioDto.EstadoUsuario),
            Rol = new Rol { Nombre = usuarioDto.Rol }
        };
        await _usuarioRepository.UpdateAsync(usuario);
    }

    public async Task DeleteUsuarioAsync(int id)
    {
        await _usuarioRepository.DeleteAsync(id);
    }

    public async Task<UsuarioDto?> GetUsuarioByCodigoUsuarioAsync(string codigoUsuario)
    {
        var usuario = await _usuarioRepository.GetByCodigoUsuarioAsync(codigoUsuario);
        return usuario == null ? null : new UsuarioDto
        {
            Id = usuario.Id,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            CodigoUsuario = usuario.CodigoUsuario,
            Email = usuario.Email,
            Celular = usuario.Celular,
            Password = usuario.Password,
            EstadoUsuario = usuario.EstadoUsuario.ToString(),
            Rol = usuario.Rol.Nombre
        };
    }
}