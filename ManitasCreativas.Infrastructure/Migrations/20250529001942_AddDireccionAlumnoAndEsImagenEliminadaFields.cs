using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDireccionAlumnoAndEsImagenEliminadaFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsImagenEliminada",
                table: "PagoImagenes",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Direccion",
                table: "Alumnos",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsImagenEliminada",
                table: "PagoImagenes");

            migrationBuilder.DropColumn(
                name: "Direccion",
                table: "Alumnos");
        }
    }
}
