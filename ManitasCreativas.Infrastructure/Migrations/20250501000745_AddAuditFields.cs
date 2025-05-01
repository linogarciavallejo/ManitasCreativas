using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PenalizacionPorMora",
                table: "Rubros",
                newName: "PenalizacionPorMoraPorcentaje");

            migrationBuilder.RenameColumn(
                name: "FechaLimitePago",
                table: "Rubros",
                newName: "FechaLimitePagoRojo");

            migrationBuilder.RenameColumn(
                name: "DiaLimitePago",
                table: "Rubros",
                newName: "NivelEducativoId");

            migrationBuilder.RenameColumn(
                name: "Telefono",
                table: "Contactos",
                newName: "TelefonoTrabajo");

            migrationBuilder.AddColumn<int>(
                name: "DiaLimitePagoAmarillo",
                table: "Rubros",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DiaLimitePagoRojo",
                table: "Rubros",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaActualizacion",
                table: "Rubros",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaCreacion",
                table: "Rubros",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaLimitePagoAmarillo",
                table: "Rubros",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GradoId",
                table: "Rubros",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notas",
                table: "Rubros",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PenalizacionPorMoraMonto",
                table: "Rubros",
                type: "numeric",
                nullable: true);

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

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaActualizacion",
                table: "Pagos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaCreacion",
                table: "Pagos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

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

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaActualizacion",
                table: "PagoImagenes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaCreacion",
                table: "PagoImagenes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

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
                name: "Celular",
                table: "Contactos",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Direccion",
                table: "Contactos",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Nit",
                table: "Contactos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Estado",
                table: "Alumnos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaActualizacion",
                table: "Alumnos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaCreacion",
                table: "Alumnos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<string>(
                name: "Seccion",
                table: "Alumnos",
                type: "text",
                nullable: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_Rubros_GradoId",
                table: "Rubros",
                column: "GradoId");

            migrationBuilder.CreateIndex(
                name: "IX_Rubros_NivelEducativoId",
                table: "Rubros",
                column: "NivelEducativoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rubros_Grados_GradoId",
                table: "Rubros",
                column: "GradoId",
                principalTable: "Grados",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Rubros_NivelesEducativos_NivelEducativoId",
                table: "Rubros",
                column: "NivelEducativoId",
                principalTable: "NivelesEducativos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rubros_Grados_GradoId",
                table: "Rubros");

            migrationBuilder.DropForeignKey(
                name: "FK_Rubros_NivelesEducativos_NivelEducativoId",
                table: "Rubros");

            migrationBuilder.DropIndex(
                name: "IX_Rubros_GradoId",
                table: "Rubros");

            migrationBuilder.DropIndex(
                name: "IX_Rubros_NivelEducativoId",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "DiaLimitePagoAmarillo",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "DiaLimitePagoRojo",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "FechaActualizacion",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "FechaCreacion",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "FechaLimitePagoAmarillo",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "GradoId",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "Notas",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "PenalizacionPorMoraMonto",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacion",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacion",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "FechaActualizacion",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "FechaCreacion",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacion",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacion",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "FechaActualizacion",
                table: "PagoImagenes");

            migrationBuilder.DropColumn(
                name: "FechaCreacion",
                table: "PagoImagenes");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacion",
                table: "PagoImagenes");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacion",
                table: "PagoImagenes");

            migrationBuilder.DropColumn(
                name: "Celular",
                table: "Contactos");

            migrationBuilder.DropColumn(
                name: "Direccion",
                table: "Contactos");

            migrationBuilder.DropColumn(
                name: "Nit",
                table: "Contactos");

            migrationBuilder.DropColumn(
                name: "Estado",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "FechaActualizacion",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "FechaCreacion",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "Seccion",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "UsuarioActualizacion",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "UsuarioCreacion",
                table: "Alumnos");

            migrationBuilder.RenameColumn(
                name: "PenalizacionPorMoraPorcentaje",
                table: "Rubros",
                newName: "PenalizacionPorMora");

            migrationBuilder.RenameColumn(
                name: "NivelEducativoId",
                table: "Rubros",
                newName: "DiaLimitePago");

            migrationBuilder.RenameColumn(
                name: "FechaLimitePagoRojo",
                table: "Rubros",
                newName: "FechaLimitePago");

            migrationBuilder.RenameColumn(
                name: "TelefonoTrabajo",
                table: "Contactos",
                newName: "Telefono");
        }
    }
}
