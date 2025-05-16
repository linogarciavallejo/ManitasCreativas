using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixCarnetFieldsRubroPago : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstadoCarnet",
                table: "Rubros");

            migrationBuilder.AddColumn<bool>(
                name: "EsPagoDeCarnet",
                table: "Pagos",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EstadoCarnet",
                table: "Pagos",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsPagoDeCarnet",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "EstadoCarnet",
                table: "Pagos");

            migrationBuilder.AddColumn<string>(
                name: "EstadoCarnet",
                table: "Rubros",
                type: "text",
                nullable: true);
        }
    }
}
