# InitialCreate Migration for Production Database Setup

This document explains how to use the `InitialCreate` migration to set up a fresh production database for the ManitasCreativas application.

## Overview

The `InitialCreate` migration (`20250726000000_InitialCreate`) is a comprehensive migration that creates the entire database schema from scratch. It includes all the tables, relationships, indexes, and initial data needed for the application to run properly.

## Database Schema

The migration creates the following tables:

### Core Tables
- **Roles** - User roles (Admin, Usuario)
- **Usuarios** - Application users
- **Sedes** - School campuses/locations
- **NivelesEducativos** - Educational levels
- **Grados** - School grades
- **Alumnos** - Students
- **Contactos** - Contact information
- **AlumnoContactos** - Student-contact relationships

### Payment Tables
- **Rubros** - Payment categories/items
- **Pagos** - Payments
- **PagoImagenes** - Payment receipt images
- **PagoDetalles** - Payment details for uniform purchases
- **AlumnoRutas** - Student transportation routes
- **CodigosQRPagos** - QR codes for payments

### Uniform Management Tables
- **PrendasUniforme** - Uniform items
- **PrendaUniformeImagenes** - Uniform item images
- **EntradaUniformes** - Uniform inventory entries
- **EntradaUniformeDetalles** - Uniform inventory entry details
- **RubroUniformeDetalles** - Uniform items associated with payment categories

## Usage Instructions

### For a Fresh Production Database

1. **Backup Current Migrations (Optional)**
   If you have existing migrations you want to preserve:
   ```powershell
   .\create-initial-migration.ps1
   ```

2. **Manual Approach**
   - Delete all existing migration files except `AppDbContextModelSnapshot.cs`
   - Copy the provided `20250726000000_InitialCreate.cs` and `20250726000000_InitialCreate.Designer.cs` files to the Migrations folder
   - Update the connection string in `appsettings.Production.json`
   - Run the migration:
   ```bash
   dotnet ef database update --startup-project ManitasCreativas.WebApi --project ManitasCreativas.Infrastructure
   ```

3. **Using EF Core CLI**
   ```bash
   # Navigate to the Infrastructure project
   cd ManitasCreativas.Infrastructure
   
   # Apply the migration
   dotnet ef database update InitialCreate --startup-project ..\ManitasCreativas.WebApi
   ```

### Verify the Migration

After applying the migration, verify that:

1. All tables are created successfully
2. Initial data is seeded (Admin and Usuario roles)
3. Foreign key relationships are properly established
4. Indexes are created for performance optimization

## Key Features

### Audit Fields
Most entities include audit fields:
- `FechaCreacion` - Creation timestamp (UTC)
- `FechaActualizacion` - Last update timestamp (UTC) 
- `UsuarioCreacionId` - User who created the record
- `UsuarioActualizacionId` - User who last updated the record

### Soft Delete
Some entities support soft delete:
- `EsEliminado` - Logical delete flag for uniform-related entities
- `EsImagenEliminada` - Logical delete flag for payment images

### Performance Optimizations
- Indexes on frequently queried columns
- Precision specified for decimal fields
- Proper cascading delete behaviors
- Unique constraints where appropriate

## Initial Data

The migration automatically creates:
- **Admin Role** (Id: 1, EsAdmin: true)
- **Usuario Role** (Id: 2, EsAdmin: false)

## Database Provider

This migration is designed for **PostgreSQL** using Npgsql.EntityFrameworkCore.PostgreSQL.

## Connection String

Ensure your `appsettings.Production.json` has the correct connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-host;Database=your-database;Username=your-username;Password=your-password"
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection String**: Verify the connection string is correct for your production database
2. **Permissions**: Ensure the database user has CREATE, ALTER, and INSERT permissions
3. **Database Exists**: The database must exist before running the migration
4. **Version Conflicts**: If you have existing migrations, you may need to reset the migration history

### Reset Migration History (If Needed)

If you need to start fresh with migration history:

```sql
-- Connect to your database and run:
DELETE FROM "__EFMigrationsHistory";
```

Then apply the InitialCreate migration.

## Security Considerations

- Change default passwords for any seeded users
- Review and configure proper database permissions
- Ensure connection strings use secure credentials
- Consider enabling SSL/TLS for database connections

## Next Steps

After successfully applying this migration:

1. Create an initial admin user through the application
2. Configure any additional seed data your application needs
3. Test all application functionality
4. Set up regular database backups
5. Monitor application logs for any database-related issues

## Support

If you encounter issues with this migration:

1. Check the application logs for detailed error messages
2. Verify database connectivity
3. Ensure all required dependencies are installed
4. Review the Entity Framework Core documentation for your version
