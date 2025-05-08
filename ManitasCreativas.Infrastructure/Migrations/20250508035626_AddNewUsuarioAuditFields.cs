using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNewUsuarioAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UsuarioActualizacionId",
                table: "Rubros",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioCreacionId",
                table: "Rubros",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioActualizacionId",
                table: "Pagos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioCreacionId",
                table: "Pagos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioActualizacionId",
                table: "PagoImagenes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioCreacionId",
                table: "PagoImagenes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioActualizacionId",
                table: "Alumnos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioCreacionId",
                table: "Alumnos",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Rubros_UsuarioActualizacionId",
                table: "Rubros",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Rubros_UsuarioCreacionId",
                table: "Rubros",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_UsuarioActualizacionId",
                table: "Pagos",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_UsuarioCreacionId",
                table: "Pagos",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_PagoImagenes_UsuarioActualizacionId",
                table: "PagoImagenes",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_PagoImagenes_UsuarioCreacionId",
                table: "PagoImagenes",
                column: "UsuarioCreacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_UsuarioActualizacionId",
                table: "Alumnos",
                column: "UsuarioActualizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_UsuarioCreacionId",
                table: "Alumnos",
                column: "UsuarioCreacionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Alumnos_Usuarios_UsuarioActualizacionId",
                table: "Alumnos",
                column: "UsuarioActualizacionId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Alumnos_Usuarios_UsuarioCreacionId",
                table: "Alumnos",
                column: "UsuarioCreacionId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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
                name: "FK_Pagos_Usuarios_UsuarioActualizacionId",
                table: "Pagos",
                column: "UsuarioActualizacionId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_Usuarios_UsuarioCreacionId",
                table: "Pagos",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alumnos_Usuarios_UsuarioActualizacionId",
                table: "Alumnos");

            migrationBuilder.DropForeignKey(
                name: "FK_Alumnos_Usuarios_UsuarioCreacionId",
                table: "Alumnos");

            migrationBuilder.DropForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioActualizacionId",
                table: "PagoImagenes");

            migrationBuilder.DropForeignKey(
                name: "FK_PagoImagenes_Usuarios_UsuarioCreacionId",
                table: "PagoImagenes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_Usuarios_UsuarioActualizacionId",
                table: "Pagos");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_Usuarios_UsuarioCreacionId",
                table: "Pagos");

            migrationBuilder.DropForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioActualizacionId",
                table: "Rubros");

            migrationBuilder.DropForeignKey(
                name: "FK_Rubros_Usuarios_UsuarioCreacionId",
                table: "Rubros");

            migrationBuilder.DropIndex(
                name: "IX_Rubros_UsuarioActualizacionId",
                table: "Rubros");

            migrationBuilder.DropIndex(
                name: "IX_Rubros_UsuarioCreacionId",
                table: "Rubros");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_UsuarioActualizacionId",
                table: "Pagos");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_UsuarioCreacionId",
                table: "Pagos");

            migrationBuilder.DropIndex(
                name: "IX_PagoImagenes_UsuarioActualizacionId",
                table: "PagoImagenes");

            migrationBuilder.DropIndex(
                name: "IX_PagoImagenes_UsuarioCreacionId",
                table: "PagoImagenes");

            migrationBuilder.DropIndex(
                name: "IX_Alumnos_UsuarioActualizacionId",
                table: "Alumnos");

            migrationBuilder.DropIndex(
                name: "IX_Alumnos_UsuarioCreacionId",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacionId",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacionId",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacionId",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacionId",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacionId",
                table: "PagoImagenes");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacionId",
                table: "PagoImagenes");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacionId",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacionId",
                table: "Alumnos");
        }
    }
}
