using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixGradoNivelEducativoRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grados_NivelesEducativos_Id",
                table: "Grados");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Grados",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "NivelEducativoId",
                table: "Grados",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Grados_NivelEducativoId",
                table: "Grados",
                column: "NivelEducativoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Grados_NivelesEducativos_NivelEducativoId",
                table: "Grados",
                column: "NivelEducativoId",
                principalTable: "NivelesEducativos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grados_NivelesEducativos_NivelEducativoId",
                table: "Grados");

            migrationBuilder.DropIndex(
                name: "IX_Grados_NivelEducativoId",
                table: "Grados");

            migrationBuilder.DropColumn(
                name: "NivelEducativoId",
                table: "Grados");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Grados",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddForeignKey(
                name: "FK_Grados_NivelesEducativos_Id",
                table: "Grados",
                column: "Id",
                principalTable: "NivelesEducativos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
