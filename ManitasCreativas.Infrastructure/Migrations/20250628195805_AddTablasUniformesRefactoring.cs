using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTablasUniformesRefactoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EntradaUniformes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FechaEntrada = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsuarioCreacionId = table.Column<int>(type: "integer", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Notas = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Total = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioActualizacionId = table.Column<int>(type: "integer", nullable: true),
                    EsEliminado = table.Column<bool>(type: "boolean", nullable: false),
                    MotivoEliminacion = table.Column<string>(type: "text", nullable: true),
                    FechaEliminacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioEliminacionId = table.Column<int>(type: "integer", nullable: true)
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
                    table.ForeignKey(
                        name: "FK_EntradaUniformes_Usuarios_UsuarioEliminacionId",
                        column: x => x.UsuarioEliminacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                });

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
                    ExistenciaInicial = table.Column<int>(type: "integer", nullable: false),
                    Entradas = table.Column<int>(type: "integer", nullable: false),
                    Salidas = table.Column<int>(type: "integer", nullable: false),
                    Notas = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
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

            migrationBuilder.CreateTable(
                name: "PrendaUniformeImagenes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PrendaUniformeId = table.Column<int>(type: "integer", nullable: false),
                    Imagen = table.Column<string>(type: "text", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "RubroUniformeDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RubroId = table.Column<int>(type: "integer", nullable: false),
                    PrendaUniformeId = table.Column<int>(type: "integer", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacionId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioActualizacionId = table.Column<int>(type: "integer", nullable: true),
                    EsEliminado = table.Column<bool>(type: "boolean", nullable: false),
                    MotivoEliminacion = table.Column<string>(type: "text", nullable: true),
                    FechaEliminacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioEliminacionId = table.Column<int>(type: "integer", nullable: true)
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
                    table.ForeignKey(
                        name: "FK_RubroUniformeDetalles_Usuarios_UsuarioEliminacionId",
                        column: x => x.UsuarioEliminacionId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PagoDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PagoId = table.Column<int>(type: "integer", nullable: false),
                    RubroUniformeDetalleId = table.Column<int>(type: "integer", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
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
                name: "IX_EntradaUniformes_UsuarioEliminacionId",
                table: "EntradaUniformes",
                column: "UsuarioEliminacionId");

            migrationBuilder.CreateIndex(
                name: "IX_PagoDetalles_PagoId",
                table: "PagoDetalles",
                column: "PagoId");

            migrationBuilder.CreateIndex(
                name: "IX_PagoDetalles_RubroUniformeDetalleId",
                table: "PagoDetalles",
                column: "RubroUniformeDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_PrendasUniforme_UsuarioActualizacionId",
                table: "PrendasUniforme",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_PrendasUniforme_UsuarioCreacionId",
                table: "PrendasUniforme",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_PrendaUniforme_Sexo",
                table: "PrendasUniforme",
                column: "Sexo");

            migrationBuilder.CreateIndex(
                name: "IX_PrendaUniforme_Talla",
                table: "PrendasUniforme",
                column: "Talla");

            migrationBuilder.CreateIndex(
                name: "IX_PrendaUniformeImagenes_PrendaUniformeId",
                table: "PrendaUniformeImagenes",
                column: "PrendaUniformeId");

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
                name: "IX_RubroUniformeDetalles_UsuarioEliminacionId",
                table: "RubroUniformeDetalles",
                column: "UsuarioEliminacionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EntradaUniformeDetalles");

            migrationBuilder.DropTable(
                name: "PagoDetalles");

            migrationBuilder.DropTable(
                name: "PrendaUniformeImagenes");

            migrationBuilder.DropTable(
                name: "EntradaUniformes");

            migrationBuilder.DropTable(
                name: "RubroUniformeDetalles");

            migrationBuilder.DropTable(
                name: "PrendasUniforme");
        }
    }
}
