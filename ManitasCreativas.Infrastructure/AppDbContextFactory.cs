using ManitasCreativas.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.IO;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Cadena de conexión hardcodeada
        var connectionString = "Host=manitascreativas.c1iw2yc4coaj.us-east-2.rds.amazonaws.com;Port=5432;Database=manitascreativas;Username=postgres;Password=IngenieroLonas";

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new AppDbContext(optionsBuilder.Options);
    }
}
