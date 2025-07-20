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
        public DbSet<AlumnoRuta> AlumnoRutas { get; set; }
        public DbSet<Rubro> Rubros { get; set; }
        public DbSet<Pago> Pagos { get; set; }
        public DbSet<PagoImagen> PagoImagenes { get; set; }
        public DbSet<PagoDetalle> PagoDetalles { get; set; }
        public DbSet<NivelEducativo> NivelesEducativos { get; set; }
        
        // Uniform entities
        public DbSet<PrendaUniforme> PrendasUniforme { get; set; }
        public DbSet<PrendaUniformeImagen> PrendaUniformeImagenes { get; set; }
        public DbSet<EntradaUniforme> EntradaUniformes { get; set; }
        public DbSet<EntradaUniformeDetalle> EntradaUniformeDetalles { get; set; }
        public DbSet<RubroUniformeDetalle> RubroUniformeDetalles { get; set; }
        
        // QR Code entities
        public DbSet<CodigosQRPagos> CodigosQRPagos { get; set; }

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
            // Configure AlumnoRuta relationships
            modelBuilder.Entity<AlumnoRuta>()
                .HasOne(ar => ar.Alumno)
                .WithMany()
                .HasForeignKey(ar => ar.AlumnoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AlumnoRuta>()
                .HasOne(ar => ar.RubroTransporte)
                .WithMany()
                .HasForeignKey(ar => ar.RubroTransporteId)
                .OnDelete(DeleteBehavior.Cascade);

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

            // Configure uniform entity relationships
            ConfigureUniformEntityRelationships(modelBuilder);

        }

        private void ConfigureUniformEntityRelationships(ModelBuilder modelBuilder)
        {
            // Configure PrendaUniforme -> PrendaUniformeImagen (one-to-many)
            modelBuilder.Entity<PrendaUniformeImagen>()
                .HasOne(pui => pui.PrendaUniforme)
                .WithMany(pu => pu.ImagenesPrenda)
                .HasForeignKey(pui => pui.PrendaUniformeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure EntradaUniforme -> EntradaUniformeDetalle (one-to-many)
            modelBuilder.Entity<EntradaUniformeDetalle>()
                .HasOne(eud => eud.EntradaUniforme)
                .WithMany(eu => eu.EntradaUniformeDetalles)
                .HasForeignKey(eud => eud.EntradaUniformeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure PrendaUniforme -> EntradaUniformeDetalle (one-to-many)
            modelBuilder.Entity<EntradaUniformeDetalle>()
                .HasOne(eud => eud.PrendaUniforme)
                .WithMany(pu => pu.EntradaUniformeDetalles)
                .HasForeignKey(eud => eud.PrendaUniformeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Rubro -> RubroUniformeDetalle (one-to-many)
            modelBuilder.Entity<RubroUniformeDetalle>()
                .HasOne(rud => rud.Rubro)
                .WithMany(r => r.RubroUniformeDetalles)
                .HasForeignKey(rud => rud.RubroId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure PrendaUniforme -> RubroUniformeDetalle (one-to-many)
            modelBuilder.Entity<RubroUniformeDetalle>()
                .HasOne(rud => rud.PrendaUniforme)
                .WithMany(pu => pu.RubroUniformeDetalles)
                .HasForeignKey(rud => rud.PrendaUniformeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure RubroUniformeDetalle -> PagoDetalle (one-to-many)
            modelBuilder.Entity<PagoDetalle>()
                .HasOne(pd => pd.RubroUniformeDetalle)
                .WithMany(rud => rud.PagoDetalles)
                .HasForeignKey(pd => pd.RubroUniformeDetalleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Pago -> PagoDetalle (one-to-many)
            modelBuilder.Entity<PagoDetalle>()
                .HasOne(pd => pd.Pago)
                .WithMany(p => p.PagoDetalles)
                .HasForeignKey(pd => pd.PagoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Pago -> CodigosQRPagos (one-to-one)
            modelBuilder.Entity<CodigosQRPagos>()
                .HasOne(qr => qr.Pago)
                .WithOne(p => p.CodigoQR)
                .HasForeignKey<CodigosQRPagos>(qr => qr.PagoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure audit user relationships for uniform entities
            ConfigureUniformAuditUserRelationships(modelBuilder);
            
            // Configure additional uniform entity properties
            ConfigureUniformEntityProperties(modelBuilder);
        }

        private void ConfigureUniformEntityProperties(ModelBuilder modelBuilder)
        {
            // Configure PrendaUniforme properties
            modelBuilder.Entity<PrendaUniforme>()
                .Property(pu => pu.Descripcion)
                .IsRequired()
                .HasMaxLength(200);
                
            modelBuilder.Entity<PrendaUniforme>()
                .Property(pu => pu.Sexo)
                .IsRequired()
                .HasMaxLength(10);
                
            modelBuilder.Entity<PrendaUniforme>()
                .Property(pu => pu.Talla)
                .IsRequired()
                .HasMaxLength(10);
                
            modelBuilder.Entity<PrendaUniforme>()
                .Property(pu => pu.Precio)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<PrendaUniforme>()
                .Property(pu => pu.Notas)
                .HasMaxLength(500);

            // Configure EntradaUniforme properties
            modelBuilder.Entity<EntradaUniforme>()
                .Property(eu => eu.Total)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<EntradaUniforme>()
                .Property(eu => eu.Notas)
                .HasMaxLength(500);

            // Configure EntradaUniformeDetalle properties
            modelBuilder.Entity<EntradaUniformeDetalle>()
                .Property(eud => eud.Subtotal)
                .HasPrecision(18, 2);

            // Configure PagoDetalle properties
            modelBuilder.Entity<PagoDetalle>()
                .Property(pd => pd.PrecioUnitario)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<PagoDetalle>()
                .Property(pd => pd.Subtotal)
                .HasPrecision(18, 2);

            // Configure indexes for better performance
            modelBuilder.Entity<PrendaUniforme>()
                .HasIndex(pu => pu.Sexo)
                .HasDatabaseName("IX_PrendaUniforme_Sexo");
                
            modelBuilder.Entity<PrendaUniforme>()
                .HasIndex(pu => pu.Talla)
                .HasDatabaseName("IX_PrendaUniforme_Talla");

            modelBuilder.Entity<EntradaUniforme>()
                .HasIndex(eu => eu.FechaEntrada)
                .HasDatabaseName("IX_EntradaUniforme_FechaEntrada");

            // Configure composite unique constraint for RubroUniformeDetalle
            modelBuilder.Entity<RubroUniformeDetalle>()
                .HasIndex(rud => new { rud.RubroId, rud.PrendaUniformeId })
                .IsUnique()
                .HasDatabaseName("IX_RubroUniformeDetalle_RubroId_PrendaUniformeId");
        }

        private void ConfigureUniformAuditUserRelationships(ModelBuilder modelBuilder)
        {
            // Configure PrendaUniforme -> Usuario relationships for audit
            modelBuilder.Entity<PrendaUniforme>()
                .HasOne(pu => pu.UsuarioCreacion)
                .WithMany()
                .HasForeignKey(pu => pu.UsuarioCreacionId)
                .IsRequired(true)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<PrendaUniforme>()
                .HasOne(pu => pu.UsuarioActualizacion)
                .WithMany()
                .HasForeignKey(pu => pu.UsuarioActualizacionId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure EntradaUniforme -> Usuario relationships for audit
            modelBuilder.Entity<EntradaUniforme>()
                .HasOne(eu => eu.UsuarioCreacion)
                .WithMany()
                .HasForeignKey(eu => eu.UsuarioCreacionId)
                .IsRequired(true)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<EntradaUniforme>()
                .HasOne(eu => eu.UsuarioActualizacion)
                .WithMany()
                .HasForeignKey(eu => eu.UsuarioActualizacionId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure RubroUniformeDetalle -> Usuario relationships for audit
            modelBuilder.Entity<RubroUniformeDetalle>()
                .HasOne(rud => rud.UsuarioCreacion)
                .WithMany()
                .HasForeignKey(rud => rud.UsuarioCreacionId)
                .IsRequired(true)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<RubroUniformeDetalle>()
                .HasOne(rud => rud.UsuarioActualizacion)
                .WithMany()
                .HasForeignKey(rud => rud.UsuarioActualizacionId)
                .IsRequired(false)
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
                
            // Configure uniform entity audit fields
            modelBuilder.Entity<PrendaUniforme>()
                .Property(pu => pu.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            modelBuilder.Entity<EntradaUniforme>()
                .Property(eu => eu.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            modelBuilder.Entity<RubroUniformeDetalle>()
                .Property(rud => rud.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            // Configure QR code audit fields
            modelBuilder.Entity<CodigosQRPagos>()
                .Property(qr => qr.FechaCreacion)
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
                
                // Handle audit fields for uniform entities
                else if (entry.Entity is PrendaUniforme prendaUniforme)
                {
                    if (entry.State == EntityState.Added)
                    {
                        prendaUniforme.FechaCreacion = now;
                        // Note: UsuarioCreacionId should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        prendaUniforme.FechaActualizacion = now;
                        // Note: UsuarioActualizacionId should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacionId").IsModified = false;
                    }
                }
                
                else if (entry.Entity is EntradaUniforme entradaUniforme)
                {
                    if (entry.State == EntityState.Added)
                    {
                        entradaUniforme.FechaCreacion = now;
                        // Note: UsuarioCreacionId should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        entradaUniforme.FechaActualizacion = now;
                        // Note: UsuarioActualizacionId should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacionId").IsModified = false;
                    }
                }
                
                else if (entry.Entity is RubroUniformeDetalle rubroUniformeDetalle)
                {
                    if (entry.State == EntityState.Added)
                    {
                        rubroUniformeDetalle.FechaCreacion = now;
                        // Note: UsuarioCreacionId should be set by the service/controller
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        rubroUniformeDetalle.FechaActualizacion = now;
                        // Note: UsuarioActualizacionId should be set by the service/controller
                        
                        // Prevent changes to creation audit fields
                        entry.Property("FechaCreacion").IsModified = false;
                        entry.Property("UsuarioCreacionId").IsModified = false;
                    }
                }
            }
        }        // Helper method to convert all DateTime properties to UTC
        private void ConvertDateTimePropertiesToUtc(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            foreach (var property in entry.Properties)
            {
                // Handle regular DateTime properties
                if (property.CurrentValue is DateTime dateTime)
                {
                    if (dateTime.Kind != DateTimeKind.Utc)
                    {
                        // If the DateTime is Unspecified, treat it as UTC to avoid timezone conversion issues
                        if (dateTime.Kind == DateTimeKind.Unspecified)
                        {
                            property.CurrentValue = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
                        }
                        else
                        {
                            property.CurrentValue = dateTime.ToUniversalTime();
                        }
                    }
                }
                // Handle nullable DateTime properties
                else if (property.CurrentValue is DateTime?)
                {
                    var nullableDateTime = (DateTime?)property.CurrentValue;
                    if (nullableDateTime.HasValue && nullableDateTime.Value.Kind != DateTimeKind.Utc)
                    {
                        // If the DateTime is Unspecified, treat it as UTC to avoid timezone conversion issues
                        if (nullableDateTime.Value.Kind == DateTimeKind.Unspecified)
                        {
                            property.CurrentValue = DateTime.SpecifyKind(nullableDateTime.Value, DateTimeKind.Utc);
                        }
                        else
                        {
                            property.CurrentValue = nullableDateTime.Value.ToUniversalTime();
                        }
                    }
                }
            }
        }
    }
}
