using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAndChangeRubroFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MesColegiatura",
                table: "Rubros");

            migrationBuilder.AddColumn<bool>(
                name: "EsColegiatura",
                table: "Rubros",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaFinPromocion",
                table: "Rubros",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaInicioPromocion",
                table: "Rubros",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsColegiatura",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "FechaFinPromocion",
                table: "Rubros");

            migrationBuilder.DropColumn(
                name: "FechaInicioPromocion",
                table: "Rubros");

            migrationBuilder.AddColumn<int>(
                name: "MesColegiatura",
                table: "Rubros",
                type: "integer",
                nullable: true);
        }
    }
}
