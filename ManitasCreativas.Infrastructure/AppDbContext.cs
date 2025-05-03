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
        public DbSet<NivelEducativo> NivelesEducativos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Rol>().HasData(
                new Rol { Id = 1, Nombre = "Admin", EsAdmin = true },
                new Rol { Id = 2, Nombre = "Usuario", EsAdmin = false }
            );

            // Configure Grado -> NivelEducativo relationship
            modelBuilder.Entity<Grado>()
                .HasOne(g => g.NivelEducativo)
                .WithMany(n => n.Grados)
                .HasForeignKey(g => g.NivelEducativoId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Configure audit fields for entities
            ConfigureAuditFields(modelBuilder);
        }
        
        private void ConfigureAuditFields(ModelBuilder modelBuilder)
        {
            // Configure Rubro audit fields
            modelBuilder.Entity<Rubro>()
                .Property(r => r.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            modelBuilder.Entity<Rubro>()
                .Property(r => r.UsuarioCreacion)
                .HasMaxLength(100)
                .IsRequired();
                
            modelBuilder.Entity<Rubro>()
                .Property(r => r.UsuarioActualizacion)
                .HasMaxLength(100);
                
            // Configure Alumno audit fields
            modelBuilder.Entity<Alumno>()
                .Property(a => a.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            modelBuilder.Entity<Alumno>()
                .Property(a => a.UsuarioCreacion)
                .HasMaxLength(100)
                .IsRequired();
                
            modelBuilder.Entity<Alumno>()
                .Property(a => a.UsuarioActualizacion)
                .HasMaxLength(100);
                
            // Configure Pago audit fields
            modelBuilder.Entity<Pago>()
                .Property(p => p.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            modelBuilder.Entity<Pago>()
                .Property(p => p.UsuarioCreacion)
                .HasMaxLength(100)
                .IsRequired();
                
            modelBuilder.Entity<Pago>()
                .Property(p => p.UsuarioActualizacion)
                .HasMaxLength(100);
                
            // Configure PagoImagen audit fields
            modelBuilder.Entity<PagoImagen>()
                .Property(pi => pi.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            modelBuilder.Entity<PagoImagen>()
                .Property(pi => pi.UsuarioCreacion)
                .HasMaxLength(100)
                .IsRequired();
                
            modelBuilder.Entity<PagoImagen>()
                .Property(pi => pi.UsuarioActualizacion)
                .HasMaxLength(100);
                
        }
        
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Automatically update audit fields before saving changes
            UpdateAuditFields();
            return base.SaveChangesAsync(cancellationToken);
        }
        
        public override int SaveChanges()
        {
            // Automatically update audit fields before saving changes
            UpdateAuditFields();
            return base.SaveChanges();
        }
        
        private void UpdateAuditFields()
        {
            var now = DateTime.UtcNow; // Use UTC time for all audit fields
            
            foreach (var entry in ChangeTracker.Entries())
            {
                // Skip entities that aren't being added or modified
                if (entry.State != EntityState.Added && entry.State != EntityState.Modified)
                    continue;
                
                // Convert all DateTime properties to UTC before saving
                ConvertDateTimePropertiesToUtc(entry);
                
                // Handle audit fields for Rubro
                if (entry.Entity is Rubro rubro)
                {
                    if (entry.State == EntityState.Added)
                    {
                        rubro.FechaCreacion = now;
                        // Note: UsuarioCreacion should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        rubro.FechaActualizacion = now;
                        // Note: UsuarioActualizacion should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacion").IsModified = false;
                    }
                }
                
                // Handle audit fields for Alumno
                else if (entry.Entity is Alumno alumno)
                {
                    if (entry.State == EntityState.Added)
                    {
                        alumno.FechaCreacion = now;
                        // Note: UsuarioCreacion should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        alumno.FechaActualizacion = now;
                        // Note: UsuarioActualizacion should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacion").IsModified = false;
                    }
                }
                
                // Handle audit fields for Pago
                else if (entry.Entity is Pago pago)
                {
                    if (entry.State == EntityState.Added)
                    {
                        pago.FechaCreacion = now;
                        // Note: UsuarioCreacion should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        pago.FechaActualizacion = now;
                        // Note: UsuarioActualizacion should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacion").IsModified = false;
                    }
                }
                
                // Handle audit fields for PagoImagen
                else if (entry.Entity is PagoImagen pagoImagen)
                {
                    if (entry.State == EntityState.Added)
                    {
                        pagoImagen.FechaCreacion = now;
                        // Note: UsuarioCreacion should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        pagoImagen.FechaActualizacion = now;
                        // Note: UsuarioActualizacion should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacion").IsModified = false;
                    }
                }
            }
        }

        // Helper method to convert all DateTime properties to UTC
        private void ConvertDateTimePropertiesToUtc(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            foreach (var property in entry.Properties)
            {
                // Handle regular DateTime properties
                if (property.CurrentValue is DateTime dateTime)
                {
                    if (dateTime.Kind != DateTimeKind.Utc)
                    {
                        property.CurrentValue = dateTime.ToUniversalTime();
                    }
                }
                // Handle nullable DateTime properties
                else if (property.CurrentValue is DateTime?)
                {
                    var nullableDateTime = (DateTime?)property.CurrentValue;
                    if (nullableDateTime.HasValue && nullableDateTime.Value.Kind != DateTimeKind.Utc)
                    {
                        property.CurrentValue = nullableDateTime.Value.ToUniversalTime();
                    }
                }
            }
        }
    }
}
