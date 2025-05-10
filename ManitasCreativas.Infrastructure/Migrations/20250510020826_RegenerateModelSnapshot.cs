using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RegenerateModelSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioActualizacionId",
                table: "PagoImagenes");

            migrationBuilder.DropForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioCreacionId",
                table: "PagoImagenes");

            migrationBuilder.DropForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioActualizacionId",
                table: "Rubros");

            migrationBuilder.DropForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioCreacionId",
                table: "Rubros");

            migrationBuilder.AddForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioActualizacionId",
                table: "PagoImagenes",
                column: "UsuarioActualizacionId",
                principalTable: "Usuarios",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioCreacionId",
                table: "PagoImagenes",
                column: "UsuarioCreacionId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioActualizacionId",
                table: "Rubros",
                column: "UsuarioActualizacionId",
                principalTable: "Usuarios",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioCreacionId",
                table: "Rubros",
                column: "UsuarioCreacionId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioActualizacionId",
                table: "PagoImagenes");

            migrationBuilder.DropForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioCreacionId",
                table: "PagoImagenes");

            migrationBuilder.DropForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioActualizacionId",
                table: "Rubros");

            migrationBuilder.DropForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioCreacionId",
                table: "Rubros");

            migrationBuilder.AddForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioActualizacionId",
                table: "PagoImagenes",
                column: "UsuarioActualizacionId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioCreacionId",
                table: "PagoImagenes",
                column: "UsuarioCreacionId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioActualizacionId",
                table: "Rubros",
                column: "UsuarioActualizacionId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioCreacionId",
                table: "Rubros",
                column: "UsuarioCreacionId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
