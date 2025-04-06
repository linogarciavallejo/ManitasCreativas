using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarColumnaNotasPago : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notas",
                table: "Pagos",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notas",
                table: "Pagos");
        }
    }
}
