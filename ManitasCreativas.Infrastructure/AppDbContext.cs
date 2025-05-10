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
                
            // Configure entity relationships
            ConfigureEntityRelationships(modelBuilder);
                
            // Configure audit fields for entities
            ConfigureAuditFields(modelBuilder);
            
            // Configure audit user relationships
            //ConfigureAuditUserRelationships(modelBuilder);
        }
        private void ConfigureEntityRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Alumno>()
                .HasOne(a => a.UsuarioCreacion)
                .WithMany()
                .HasForeignKey(a => a.UsuarioCreacionId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            modelBuilder.Entity<Alumno>()
                .HasOne(a => a.UsuarioActualizacion)
                .WithMany()
                .HasForeignKey(a => a.UsuarioActualizacionId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Pago -> Usuario relationship (different from audit relationship)
            // Use UsuarioCreacionId as the foreign key for the Usuario navigation property
            modelBuilder.Entity<Pago>()
                .HasOne(p => p.UsuarioCreacion) // Corrected to use the navigation property
                .WithMany()
                .HasForeignKey(p => p.UsuarioCreacionId) // Use existing UsuarioCreacionId field
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            modelBuilder.Entity<Pago>()
                .HasOne(p => p.UsuarioActualizacion) // Corrected to use the navigation property
                .WithMany()
                .HasForeignKey(p => p.UsuarioActualizacionId) // Use existing UsuarioActualizacionId field
                .OnDelete(DeleteBehavior.Restrict);

        }

        private void ConfigureAuditFields(ModelBuilder modelBuilder)
        {
            // Configure Rubro audit fields
            modelBuilder.Entity<Rubro>()
                .Property(r => r.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
               
            // Configure Alumno audit fields
            modelBuilder.Entity<Alumno>()
                .Property(a => a.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            // Configure Pago audit fields
            modelBuilder.Entity<Pago>()
                .Property(p => p.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            // Configure PagoImagen audit fields
            modelBuilder.Entity<PagoImagen>()
                .Property(pi => pi.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
        }
        
        private void ConfigureAuditUserRelationships(ModelBuilder modelBuilder)
        {
            // Configure Rubro -> Usuario relationships for audit
            modelBuilder.Entity<Rubro>()
                .HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(r => r.UsuarioCreacionId)
                .IsRequired(true)  // Changed from false to true
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Rubro>()
                .HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(r => r.UsuarioActualizacionId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Configure Alumno -> Usuario relationships for audit
            modelBuilder.Entity<Alumno>()
                .HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(a => a.UsuarioCreacionId)
                .IsRequired(true)  // Changed from false to true
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Alumno>()
                .HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(a => a.UsuarioActualizacionId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Configure Pago -> Usuario relationships for audit
            modelBuilder.Entity<Pago>()
                .HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(p => p.UsuarioCreacionId)
                .IsRequired(true)  // Changed from false to true
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Pago>()
                .HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(p => p.UsuarioActualizacionId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Configure PagoImagen -> Usuario relationships for audit
            modelBuilder.Entity<PagoImagen>()
                .HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(pi => pi.UsuarioCreacionId)
                .IsRequired(true)  // Changed from false to true
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<PagoImagen>()
                .HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(pi => pi.UsuarioActualizacionId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
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
                        // Note: UsuarioCreacionId should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        rubro.FechaActualizacion = now;
                        // Note: UsuarioActualizacionId should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacionId").IsModified = false;
                    }
                }
                
                // Handle audit fields for Alumno
                else if (entry.Entity is Alumno alumno)
                {
                    if (entry.State == EntityState.Added)
                    {
                        alumno.FechaCreacion = now;
                        // Note: UsuarioCreacionId should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        alumno.FechaActualizacion = now;
                        // Note: UsuarioActualizacionId should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacionId").IsModified = false;
                    }
                }
                
                // Handle audit fields for Pago
                else if (entry.Entity is Pago pago)
                {
                    if (entry.State == EntityState.Added)
                    {
                        pago.FechaCreacion = now;
                        // Note: UsuarioCreacionId should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        pago.FechaActualizacion = now;
                        // Note: UsuarioActualizacionId should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacionId").IsModified = false;
                    }
                }
                
                // Handle audit fields for PagoImagen
                else if (entry.Entity is PagoImagen pagoImagen)
                {
                    if (entry.State == EntityState.Added)
                    {
                        pagoImagen.FechaCreacion = now;
                        // Note: UsuarioCreacionId should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        pagoImagen.FechaActualizacion = now;
                        // Note: UsuarioActualizacionId should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacionId").IsModified = false;
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
