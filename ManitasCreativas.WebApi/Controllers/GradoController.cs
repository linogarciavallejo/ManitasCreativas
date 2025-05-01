using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ManitasCreativas.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GradoController : ControllerBase
{
    private readonly IGradoService _gradoService;

    public GradoController(IGradoService gradoService)
    {
        _gradoService = gradoService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<GradoDto>>> GetAll()
    {
        var grados = await _gradoService.GetAllAsync();
        return Ok(grados);
    }

    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<GradoDto>>> GetActive()
    {
        var grados = await _gradoService.GetActiveAsync();
        return Ok(grados);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<GradoDto>> GetById(int id)
    {
        var grado = await _gradoService.GetByIdAsync(id);
        if (grado == null)
        {
            return NotFound();
        }
        return Ok(grado);
    }

    [HttpGet("nivel-educativo/{nivelEducativoId}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<GradoDto>>> GetByNivelEducativoId(int nivelEducativoId)
    {
        var grados = await _gradoService.GetByNivelEducativoIdAsync(nivelEducativoId);
        return Ok(grados);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<GradoDto>> Create(GradoDto gradoDto)
    {
        try
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "system";
            var newGrado = await _gradoService.CreateAsync(gradoDto);
            return CreatedAtAction(nameof(GetById), new { id = newGrado.Id }, newGrado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Update(int id, GradoDto gradoDto)
    {
        if (id != gradoDto.Id)
        {
            return BadRequest("El ID de la ruta y el ID del grado no coinciden");
        }

        try
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "system";
            await _gradoService.UpdateAsync(gradoDto.Id, gradoDto);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _gradoService.DeleteAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}