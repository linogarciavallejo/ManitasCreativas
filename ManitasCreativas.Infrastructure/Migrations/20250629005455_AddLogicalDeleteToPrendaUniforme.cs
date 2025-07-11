using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLogicalDeleteToPrendaUniforme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsEliminado",
                table: "PrendasUniforme",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaEliminacion",
                table: "PrendasUniforme",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoEliminacion",
                table: "PrendasUniforme",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioEliminacionId",
                table: "PrendasUniforme",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EsPagoDeUniforme",
                table: "Pagos",
                type: "boolean",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrendasUniforme_UsuarioEliminacionId",
                table: "PrendasUniforme",
                column: "UsuarioEliminacionId");

            migrationBuilder.AddForeignKey(
                name: "FK_PrendasUniforme_Usuarios_UsuarioEliminacionId",
                table: "PrendasUniforme",
                column: "UsuarioEliminacionId",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrendasUniforme_Usuarios_UsuarioEliminacionId",
                table: "PrendasUniforme");

            migrationBuilder.DropIndex(
                name: "IX_PrendasUniforme_UsuarioEliminacionId",
                table: "PrendasUniforme");

            migrationBuilder.DropColumn(
                name: "EsEliminado",
                table: "PrendasUniforme");

            migrationBuilder.DropColumn(
                name: "FechaEliminacion",
                table: "PrendasUniforme");

            migrationBuilder.DropColumn(
                name: "MotivoEliminacion",
                table: "PrendasUniforme");

            migrationBuilder.DropColumn(
                name: "UsuarioEliminacionId",
                table: "PrendasUniforme");

            migrationBuilder.DropColumn(
                name: "EsPagoDeUniforme",
                table: "Pagos");
        }
    }
}
