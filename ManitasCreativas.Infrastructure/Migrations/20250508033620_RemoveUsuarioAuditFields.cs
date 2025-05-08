using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUsuarioAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UsuarioActualizacion",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacion",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacion",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacion",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacion",
                table: "PagoImagenes");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacion",
                table: "PagoImagenes");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacion",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacion",
                table: "Alumnos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UsuarioActualizacion",
                table: "Rubros",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioCreacion",
                table: "Rubros",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UsuarioActualizacion",
                table: "Pagos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioCreacion",
                table: "Pagos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UsuarioActualizacion",
                table: "PagoImagenes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioCreacion",
                table: "PagoImagenes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UsuarioActualizacion",
                table: "Alumnos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioCreacion",
                table: "Alumnos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
