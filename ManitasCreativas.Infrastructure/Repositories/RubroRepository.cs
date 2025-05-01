namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class RubroRepository : IRubroRepository
{
    private readonly AppDbContext _context;

    public RubroRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Rubro?> GetByIdAsync(int id)
    {
        // Use explicit loading to avoid including non-existent columns
        var rubro = await _context.Rubros
            .Include(r => r.NivelEducativo)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rubro?.GradoId != null)
        {
            // Explicitly load only the properties that exist in the database
            await _context.Entry(rubro)
                .Reference(r => r.Grado)
                .LoadAsync();
        }

        return rubro;
    }

    public async Task<IEnumerable<Rubro>> GetAllAsync()
    {
        // First get rubros with just NivelEducativo loaded
        var rubros = await _context.Rubros
            .Include(r => r.NivelEducativo)
            .OrderBy(r => r.Descripcion)
            .ToListAsync();

        // Then explicitly load Grado for each rubro that has a GradoId
        foreach (var rubro in rubros.Where(r => r.GradoId.HasValue))
        {
            await _context.Entry(rubro).Reference(r => r.Grado).LoadAsync();

            // If you need NivelEducativo inside Grado, load that explicitly too
            if (rubro.Grado != null)
            {
                await _context.Entry(rubro.Grado).Reference(g => g.NivelEducativo).LoadAsync();
            }
        }

        return rubros;
    }

    public async Task AddAsync(Rubro rubro)
    {
        // Ensure all DateTime properties are in UTC format
        if (rubro.FechaLimitePagoAmarillo.HasValue)
        {
            rubro.FechaLimitePagoAmarillo = DateTime.SpecifyKind(
                rubro.FechaLimitePagoAmarillo.Value, DateTimeKind.Utc);
        }
        
        if (rubro.FechaLimitePagoRojo.HasValue)
        {
            rubro.FechaLimitePagoRojo = DateTime.SpecifyKind(
                rubro.FechaLimitePagoRojo.Value, DateTimeKind.Utc);
        }
        
        // Ensure FechaCreacion is UTC
        rubro.FechaCreacion = DateTime.SpecifyKind(rubro.FechaCreacion, DateTimeKind.Utc);
        
        await _context.Rubros.AddAsync(rubro);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Rubro rubro)
    {
        try
        {
            // Get the existing rubro directly
            var existingRubro = await _context.Rubros.FindAsync(rubro.Id);
            if (existingRubro == null)
            {
                throw new KeyNotFoundException($"Rubro with ID {rubro.Id} not found.");
            }

            // Detach the existing entity to avoid tracking conflicts
            _context.Entry(existingRubro).State = EntityState.Detached;

            // Create a SQL UPDATE statement to bypass EF Core's DateTime handling
            var sql = @"
                UPDATE ""Rubros""
                SET ""Descripcion"" = @Descripcion,
                    ""Tipo"" = @Tipo,
                    ""PenalizacionPorMoraMonto"" = @PenalizacionPorMoraMonto,
                    ""PenalizacionPorMoraPorcentaje"" = @PenalizacionPorMoraPorcentaje,
                    ""MesColegiatura"" = @MesColegiatura,
                    ""DiaLimitePagoAmarillo"" = @DiaLimitePagoAmarillo,
                    ""DiaLimitePagoRojo"" = @DiaLimitePagoRojo,
                    ""MesLimitePago"" = @MesLimitePago,
                    ""NivelEducativoId"" = @NivelEducativoId,
                    ""GradoId"" = @GradoId,
                    ""MontoPreestablecido"" = @MontoPreestablecido,
                    ""Notas"" = @Notas,
                    ""Activo"" = @Activo,
                    ""UsuarioActualizacion"" = @UsuarioActualizacion,
                    ""FechaActualizacion"" = @FechaActualizacion,
                    ""FechaLimitePagoAmarillo"" = @FechaLimitePagoAmarillo,
                    ""FechaLimitePagoRojo"" = @FechaLimitePagoRojo
                WHERE ""Id"" = @Id";

            var parameters = new[]
            {
                new Npgsql.NpgsqlParameter("@Descripcion", rubro.Descripcion),
                // Convert enum to int for PostgreSQL
                new Npgsql.NpgsqlParameter("@Tipo", (int)rubro.Tipo),
                new Npgsql.NpgsqlParameter("@PenalizacionPorMoraMonto", (object)rubro.PenalizacionPorMoraMonto ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@PenalizacionPorMoraPorcentaje", (object)rubro.PenalizacionPorMoraPorcentaje ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@MesColegiatura", (object)rubro.MesColegiatura ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@DiaLimitePagoAmarillo", (object)rubro.DiaLimitePagoAmarillo ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@DiaLimitePagoRojo", (object)rubro.DiaLimitePagoRojo ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@MesLimitePago", (object)rubro.MesLimitePago ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@NivelEducativoId", (object)rubro.NivelEducativoId ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@GradoId", (object)rubro.GradoId ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@MontoPreestablecido", (object)rubro.MontoPreestablecido ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@Notas", (object)rubro.Notas ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@Activo", rubro.Activo),
                new Npgsql.NpgsqlParameter("@UsuarioActualizacion", (object)rubro.UsuarioActualizacion ?? DBNull.Value),
                new Npgsql.NpgsqlParameter("@FechaActualizacion", DateTime.UtcNow),
                new Npgsql.NpgsqlParameter("@Id", rubro.Id)
            };

            // Add nullable DateTime parameters separately with special handling
            var amarilloParam = new Npgsql.NpgsqlParameter("@FechaLimitePagoAmarillo", System.Data.DbType.DateTime);
            if (rubro.FechaLimitePagoAmarillo.HasValue)
            {
                amarilloParam.Value = DateTime.SpecifyKind(rubro.FechaLimitePagoAmarillo.Value, DateTimeKind.Utc);
            }
            else
            {
                amarilloParam.Value = DBNull.Value;
            }

            var rojoParam = new Npgsql.NpgsqlParameter("@FechaLimitePagoRojo", System.Data.DbType.DateTime);
            if (rubro.FechaLimitePagoRojo.HasValue)
            {
                rojoParam.Value = DateTime.SpecifyKind(rubro.FechaLimitePagoRojo.Value, DateTimeKind.Utc);
            }
            else
            {
                rojoParam.Value = DBNull.Value;
            }

            // Execute the raw SQL update
            await _context.Database.ExecuteSqlRawAsync(sql, parameters.Concat(new[] { amarilloParam, rojoParam }).ToArray());
        }
        catch (Exception ex)
        {
            // Add logging here
            throw;
        }
    }

    public async Task DeleteAsync(int id)
    {
        var rubro = await _context.Rubros.FindAsync(id);
        if (rubro != null)
        {
            _context.Rubros.Remove(rubro);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Rubro>> GetAllActiveAsync()
    {
        // First get rubros with just NivelEducativo loaded
        var rubros = await _context.Rubros
            .Include(r => r.NivelEducativo)
            .Where(r => r.Activo == true)
            .OrderBy(r => r.Descripcion)
            .ToListAsync();

        // Then explicitly load Grado for each rubro that has a GradoId
        foreach (var rubro in rubros.Where(r => r.GradoId.HasValue))
        {
            await _context.Entry(rubro).Reference(r => r.Grado).LoadAsync();

            // If you need NivelEducativo inside Grado, load that explicitly too
            if (rubro.Grado != null)
            {
                await _context.Entry(rubro.Grado).Reference(g => g.NivelEducativo).LoadAsync();
            }
        }

        return rubros;
    }
}
