using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAlumnoRuta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AlumnoRutas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlumnoId = table.Column<int>(type: "integer", nullable: false),
                    RubroTransporteId = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_UsuarioAnulacionId",
                table: "Pagos",
                column: "UsuarioAnulacionId");

            migrationBuilder.CreateIndex(
                name: "IX_AlumnoRutas_AlumnoId",
                table: "AlumnoRutas",
                column: "AlumnoId");

            migrationBuilder.CreateIndex(
                name: "IX_AlumnoRutas_RubroTransporteId",
                table: "AlumnoRutas",
                column: "RubroTransporteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_Usuarios_UsuarioAnulacionId",
                table: "Pagos",
                column: "UsuarioAnulacionId",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_Usuarios_UsuarioAnulacionId",
                table: "Pagos");

            migrationBuilder.DropTable(
                name: "AlumnoRutas");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_UsuarioAnulacionId",
                table: "Pagos");
        }
    }
}
