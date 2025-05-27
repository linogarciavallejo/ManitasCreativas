using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusPaymentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsPagoDeTransporte",
                table: "Rubros",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EsPagoDeTransporte",
                table: "Pagos",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsPagoDeTransporte",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "EsPagoDeTransporte",
                table: "Pagos");
        }
    }
}
