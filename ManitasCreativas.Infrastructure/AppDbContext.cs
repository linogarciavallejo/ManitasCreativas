using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ManitasCreativas.Infrastructure
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Rol> Roles { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Sede> Sedes { get; set; }
        public DbSet<Grado> Grados { get; set; }
        public DbSet<Alumno> Alumnos { get; set; }
        public DbSet<Contacto> Contactos { get; set; }
        public DbSet<AlumnoContacto> AlumnoContactos { get; set; }
        public DbSet<Rubro> Rubros { get; set; }
        public DbSet<Pago> Pagos { get; set; }
        public DbSet<PagoImagen> PagoImagenes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Rol>().HasData(
                new Rol { Id = 1, Nombre = "Admin", EsAdmin = true },
                new Rol { Id = 2, Nombre = "Usuario", EsAdmin = false }
            );
        }
    }
}
