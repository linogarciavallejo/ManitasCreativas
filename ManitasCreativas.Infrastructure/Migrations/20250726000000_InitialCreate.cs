using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create Roles table
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    EsAdmin = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            // Create Usuarios table
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Usuario = table.Column<string>(type: "text", nullable: false),
                    Clave = table.Column<string>(type: "text", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    RolId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordResetToken = table.Column<string>(type: "text", nullable: true),
                    PasswordResetTokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Roles_RolId",
                        column: x => x.RolId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create Sedes table
            migrationBuilder.CreateTable(
                name: "Sedes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sedes", x => x.Id);
                });

            // Create NivelesEducativos table
            migrationBuilder.CreateTable(
                name: "NivelesEducativos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NivelesEducativos", x => x.Id);
                });

            // Create Grados table
            migrationBuilder.CreateTable(
                name: "Grados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    NivelEducativoId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Grados_NivelesEducativos_NivelEducativoId",
                        column: x => x.NivelEducativoId,
                        principalTable: "NivelesEducativos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create Rubros table
            migrationBuilder.CreateTable(
                name: "Rubros",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Precio = table.Column<decimal>(type: "numeric", nullable: false),
                    MontoPreestablecido = table.Column<decimal>(type: "numeric", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EsCarnet = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EsTransporte = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EsPagoDeUniforme = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    OrdenVisualizacion = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacionId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioActualizacionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rubros", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rubros_Usuarios_UsuarioActualizacionId",
                        column: x => x.UsuarioActualizacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Rubros_Usuarios_UsuarioCreacionId",
                        column: x => x.UsuarioCreacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create Alumnos table
            migrationBuilder.CreateTable(
                name: "Alumnos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    PrimerNombre = table.Column<string>(type: "text", nullable: false),
                    SegundoNombre = table.Column<string>(type: "text", nullable: true),
                    TercerNombre = table.Column<string>(type: "text", nullable: true),
                    PrimerApellido = table.Column<string>(type: "text", nullable: false),
                    SegundoApellido = table.Column<string>(type: "text", nullable: true),
                    Direccion = table.Column<string>(type: "text", nullable: true),
                    Seccion = table.Column<string>(type: "text", nullable: true),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    Becado = table.Column<bool>(type: "boolean", nullable: true),
                    BecaParcialPorcentaje = table.Column<decimal>(type: "numeric", nullable: true),
                    Observaciones = table.Column<string>(type: "text", nullable: true),
                    SedeId = table.Column<int>(type: "integer", nullable: false),
                    GradoId = table.Column<int>(type: "integer", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacionId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioActualizacionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alumnos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alumnos_Grados_GradoId",
                        column: x => x.GradoId,
                        principalTable: "Grados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Alumnos_Sedes_SedeId",
                        column: x => x.SedeId,
                        principalTable: "Sedes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Alumnos_Usuarios_UsuarioActualizacionId",
                        column: x => x.UsuarioActualizacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Alumnos_Usuarios_UsuarioCreacionId",
                        column: x => x.UsuarioCreacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create Contactos table
            migrationBuilder.CreateTable(
                name: "Contactos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NombreCompleto = table.Column<string>(type: "text", nullable: false),
                    NumeroTelefono = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    WhatsApp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contactos", x => x.Id);
                });

            // Create AlumnoContactos table
            migrationBuilder.CreateTable(
                name: "AlumnoContactos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlumnoId = table.Column<int>(type: "integer", nullable: false),
                    ContactoId = table.Column<int>(type: "integer", nullable: false),
                    Parentesco = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlumnoContactos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlumnoContactos_Alumnos_AlumnoId",
                        column: x => x.AlumnoId,
                        principalTable: "Alumnos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AlumnoContactos_Contactos_ContactoId",
                        column: x => x.ContactoId,
                        principalTable: "Contactos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create AlumnoRutas table
            migrationBuilder.CreateTable(
                name: "AlumnoRutas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlumnoId = table.Column<int>(type: "integer", nullable: false),
                    RubroTransporteId = table.Column<int>(type: "integer", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlumnoRutas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlumnoRutas_Alumnos_AlumnoId",
                        column: x => x.AlumnoId,
                        principalTable: "Alumnos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AlumnoRutas_Rubros_RubroTransporteId",
                        column: x => x.RubroTransporteId,
                        principalTable: "Rubros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create Pagos table
            migrationBuilder.CreateTable(
                name: "Pagos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlumnoId = table.Column<int>(type: "integer", nullable: false),
                    RubroId = table.Column<int>(type: "integer", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric", nullable: false),
                    FechaPago = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notas = table.Column<string>(type: "text", nullable: true),
                    Anulado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MotivoAnulacion = table.Column<string>(type: "text", nullable: true),
                    FechaAnulacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacionId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioActualizacionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pagos_Alumnos_AlumnoId",
                        column: x => x.AlumnoId,
                        principalTable: "Alumnos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Pagos_Rubros_RubroId",
                        column: x => x.RubroId,
                        principalTable: "Rubros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Pagos_Usuarios_UsuarioActualizacionId",
                        column: x => x.UsuarioActualizacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pagos_Usuarios_UsuarioCreacionId",
                        column: x => x.UsuarioCreacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create PagoImagenes table
            migrationBuilder.CreateTable(
                name: "PagoImagenes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PagoId = table.Column<int>(type: "integer", nullable: false),
                    NombreArchivo = table.Column<string>(type: "text", nullable: false),
                    RutaArchivo = table.Column<string>(type: "text", nullable: false),
                    TipoMime = table.Column<string>(type: "text", nullable: false),
                    Tamano = table.Column<long>(type: "bigint", nullable: false),
                    EsImagenEliminada = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacionId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioActualizacionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagoImagenes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PagoImagenes_Pagos_PagoId",
                        column: x => x.PagoId,
                        principalTable: "Pagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PagoImagenes_Usuarios_UsuarioActualizacionId",
                        column: x => x.UsuarioActualizacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PagoImagenes_Usuarios_UsuarioCreacionId",
                        column: x => x.UsuarioCreacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create CodigosQRPagos table
            migrationBuilder.CreateTable(
                name: "CodigosQRPagos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PagoId = table.Column<int>(type: "integer", nullable: false),
                    CodigoQR = table.Column<string>(type: "text", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodigosQRPagos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodigosQRPagos_Pagos_PagoId",
                        column: x => x.PagoId,
                        principalTable: "Pagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create PrendasUniforme table
            migrationBuilder.CreateTable(
                name: "PrendasUniforme",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Sexo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Talla = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Precio = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Stock = table.Column<int>(type: "integer", nullable: false),
                    Notas = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EsEliminado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacionId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioActualizacionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrendasUniforme", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrendasUniforme_Usuarios_UsuarioActualizacionId",
                        column: x => x.UsuarioActualizacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrendasUniforme_Usuarios_UsuarioCreacionId",
                        column: x => x.UsuarioCreacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create PrendaUniformeImagenes table
            migrationBuilder.CreateTable(
                name: "PrendaUniformeImagenes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PrendaUniformeId = table.Column<int>(type: "integer", nullable: false),
                    NombreArchivo = table.Column<string>(type: "text", nullable: false),
                    RutaArchivo = table.Column<string>(type: "text", nullable: false),
                    TipoMime = table.Column<string>(type: "text", nullable: false),
                    Tamano = table.Column<long>(type: "bigint", nullable: false),
                    EsEliminado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrendaUniformeImagenes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrendaUniformeImagenes_PrendasUniforme_PrendaUniformeId",
                        column: x => x.PrendaUniformeId,
                        principalTable: "PrendasUniforme",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create EntradaUniformes table
            migrationBuilder.CreateTable(
                name: "EntradaUniformes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FechaEntrada = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Total = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Notas = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EsEliminado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacionId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioActualizacionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntradaUniformes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EntradaUniformes_Usuarios_UsuarioActualizacionId",
                        column: x => x.UsuarioActualizacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EntradaUniformes_Usuarios_UsuarioCreacionId",
                        column: x => x.UsuarioCreacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create RubroUniformeDetalles table
            migrationBuilder.CreateTable(
                name: "RubroUniformeDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RubroId = table.Column<int>(type: "integer", nullable: false),
                    PrendaUniformeId = table.Column<int>(type: "integer", nullable: false),
                    EsEliminado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacionId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioActualizacionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubroUniformeDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RubroUniformeDetalles_PrendasUniforme_PrendaUniformeId",
                        column: x => x.PrendaUniformeId,
                        principalTable: "PrendasUniforme",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RubroUniformeDetalles_Rubros_RubroId",
                        column: x => x.RubroId,
                        principalTable: "Rubros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RubroUniformeDetalles_Usuarios_UsuarioActualizacionId",
                        column: x => x.UsuarioActualizacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RubroUniformeDetalles_Usuarios_UsuarioCreacionId",
                        column: x => x.UsuarioCreacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create EntradaUniformeDetalles table
            migrationBuilder.CreateTable(
                name: "EntradaUniformeDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntradaUniformeId = table.Column<int>(type: "integer", nullable: false),
                    PrendaUniformeId = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntradaUniformeDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EntradaUniformeDetalles_EntradaUniformes_EntradaUniformeId",
                        column: x => x.EntradaUniformeId,
                        principalTable: "EntradaUniformes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EntradaUniformeDetalles_PrendasUniforme_PrendaUniformeId",
                        column: x => x.PrendaUniformeId,
                        principalTable: "PrendasUniforme",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create PagoDetalles table
            migrationBuilder.CreateTable(
                name: "PagoDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PagoId = table.Column<int>(type: "integer", nullable: false),
                    RubroUniformeDetalleId = table.Column<int>(type: "integer", nullable: true),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagoDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PagoDetalles_Pagos_PagoId",
                        column: x => x.PagoId,
                        principalTable: "Pagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PagoDetalles_RubroUniformeDetalles_RubroUniformeDetalleId",
                        column: x => x.RubroUniformeDetalleId,
                        principalTable: "RubroUniformeDetalles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_AlumnoContactos_AlumnoId",
                table: "AlumnoContactos",
                column: "AlumnoId");

            migrationBuilder.CreateIndex(
                name: "IX_AlumnoContactos_ContactoId",
                table: "AlumnoContactos",
                column: "ContactoId");

            migrationBuilder.CreateIndex(
                name: "IX_AlumnoRutas_AlumnoId",
                table: "AlumnoRutas",
                column: "AlumnoId");

            migrationBuilder.CreateIndex(
                name: "IX_AlumnoRutas_RubroTransporteId",
                table: "AlumnoRutas",
                column: "RubroTransporteId");

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_GradoId",
                table: "Alumnos",
                column: "GradoId");

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_SedeId",
                table: "Alumnos",
                column: "SedeId");

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_UsuarioActualizacionId",
                table: "Alumnos",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_UsuarioCreacionId",
                table: "Alumnos",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_CodigosQRPagos_PagoId",
                table: "CodigosQRPagos",
                column: "PagoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EntradaUniformeDetalles_EntradaUniformeId",
                table: "EntradaUniformeDetalles",
                column: "EntradaUniformeId");

            migrationBuilder.CreateIndex(
                name: "IX_EntradaUniformeDetalles_PrendaUniformeId",
                table: "EntradaUniformeDetalles",
                column: "PrendaUniformeId");

            migrationBuilder.CreateIndex(
                name: "IX_EntradaUniforme_FechaEntrada",
                table: "EntradaUniformes",
                column: "FechaEntrada");

            migrationBuilder.CreateIndex(
                name: "IX_EntradaUniformes_UsuarioActualizacionId",
                table: "EntradaUniformes",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_EntradaUniformes_UsuarioCreacionId",
                table: "EntradaUniformes",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Grados_NivelEducativoId",
                table: "Grados",
                column: "NivelEducativoId");

            migrationBuilder.CreateIndex(
                name: "IX_PagoDetalles_PagoId",
                table: "PagoDetalles",
                column: "PagoId");

            migrationBuilder.CreateIndex(
                name: "IX_PagoDetalles_RubroUniformeDetalleId",
                table: "PagoDetalles",
                column: "RubroUniformeDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_PagoImagenes_PagoId",
                table: "PagoImagenes",
                column: "PagoId");

            migrationBuilder.CreateIndex(
                name: "IX_PagoImagenes_UsuarioActualizacionId",
                table: "PagoImagenes",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_PagoImagenes_UsuarioCreacionId",
                table: "PagoImagenes",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_AlumnoId",
                table: "Pagos",
                column: "AlumnoId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_RubroId",
                table: "Pagos",
                column: "RubroId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_UsuarioActualizacionId",
                table: "Pagos",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_UsuarioCreacionId",
                table: "Pagos",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_PrendaUniformeImagenes_PrendaUniformeId",
                table: "PrendaUniformeImagenes",
                column: "PrendaUniformeId");

            migrationBuilder.CreateIndex(
                name: "IX_PrendaUniforme_Sexo",
                table: "PrendasUniforme",
                column: "Sexo");

            migrationBuilder.CreateIndex(
                name: "IX_PrendaUniforme_Talla",
                table: "PrendasUniforme",
                column: "Talla");

            migrationBuilder.CreateIndex(
                name: "IX_PrendasUniforme_UsuarioActualizacionId",
                table: "PrendasUniforme",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_PrendasUniforme_UsuarioCreacionId",
                table: "PrendasUniforme",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_RubroUniformeDetalle_RubroId_PrendaUniformeId",
                table: "RubroUniformeDetalles",
                columns: new[] { "RubroId", "PrendaUniformeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RubroUniformeDetalles_PrendaUniformeId",
                table: "RubroUniformeDetalles",
                column: "PrendaUniformeId");

            migrationBuilder.CreateIndex(
                name: "IX_RubroUniformeDetalles_UsuarioActualizacionId",
                table: "RubroUniformeDetalles",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_RubroUniformeDetalles_UsuarioCreacionId",
                table: "RubroUniformeDetalles",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Rubros_UsuarioActualizacionId",
                table: "Rubros",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Rubros_UsuarioCreacionId",
                table: "Rubros",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_RolId",
                table: "Usuarios",
                column: "RolId");

            // Insert initial data
            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "EsAdmin", "Nombre" },
                values: new object[,]
                {
                    { 1, true, "Admin" },
                    { 2, false, "Usuario" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlumnoContactos");

            migrationBuilder.DropTable(
                name: "AlumnoRutas");

            migrationBuilder.DropTable(
                name: "CodigosQRPagos");

            migrationBuilder.DropTable(
                name: "EntradaUniformeDetalles");

            migrationBuilder.DropTable(
                name: "PagoDetalles");

            migrationBuilder.DropTable(
                name: "PagoImagenes");

            migrationBuilder.DropTable(
                name: "PrendaUniformeImagenes");

            migrationBuilder.DropTable(
                name: "Contactos");

            migrationBuilder.DropTable(
                name: "EntradaUniformes");

            migrationBuilder.DropTable(
                name: "Pagos");

            migrationBuilder.DropTable(
                name: "RubroUniformeDetalles");

            migrationBuilder.DropTable(
                name: "Alumnos");

            migrationBuilder.DropTable(
                name: "PrendasUniforme");

            migrationBuilder.DropTable(
                name: "Rubros");

            migrationBuilder.DropTable(
                name: "Grados");

            migrationBuilder.DropTable(
                name: "Sedes");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "NivelesEducativos");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
