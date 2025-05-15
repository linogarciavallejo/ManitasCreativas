using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCarnetFieldsRubro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsPagoDeCarnet",
                table: "Rubros",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EstadoCarnet",
                table: "Rubros",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsPagoDeCarnet",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "EstadoCarnet",
                table: "Rubros");
        }
    }
}
