﻿// <auto-generated />
using System;
using ManitasCreativas.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ManitasCreativas.Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Alumno", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<decimal?>("BecaParcialPorcentaje")
                        .HasColumnType("numeric");

                    b.Property<bool?>("Becado")
                        .HasColumnType("boolean");

                    b.Property<string>("Codigo")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("GradoId")
                        .HasColumnType("integer");

                    b.Property<string>("PrimerApellido")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PrimerNombre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("SedeId")
                        .HasColumnType("integer");

                    b.Property<string>("SegundoApellido")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("SegundoNombre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("GradoId");

                    b.HasIndex("SedeId");

                    b.ToTable("Alumnos");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.AlumnoContacto", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("AlumnoId")
                        .HasColumnType("integer");

                    b.Property<int>("ContactoId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("AlumnoId");

                    b.HasIndex("ContactoId");

                    b.ToTable("AlumnoContactos");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Contacto", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("AlumnoId")
                        .HasColumnType("integer");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Telefono")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Contactos");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Grado", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Grados");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Pago", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("AlumnoId")
                        .HasColumnType("integer");

                    b.Property<int>("CicloEscolar")
                        .HasColumnType("integer");

                    b.Property<DateTime>("Fecha")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("MedioPago")
                        .HasColumnType("integer");

                    b.Property<decimal>("Monto")
                        .HasColumnType("numeric");

                    b.Property<int>("RubroId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("AlumnoId");

                    b.HasIndex("RubroId");

                    b.ToTable("Pagos");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.PagoImagen", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("ImagenUrl")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("PagoId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("PagoId");

                    b.ToTable("PagoImagenes");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Rol", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<bool>("EsAdmin")
                        .HasColumnType("boolean");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Roles");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            EsAdmin = true,
                            Nombre = "Admin"
                        },
                        new
                        {
                            Id = 2,
                            EsAdmin = false,
                            Nombre = "Usuario"
                        });
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Rubro", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Descripcion")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("DiaLimitePago")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("FechaLimitePago")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int?>("MesColegiatura")
                        .HasColumnType("integer");

                    b.Property<int?>("MesLimitePago")
                        .HasColumnType("integer");

                    b.Property<decimal?>("PenalizacionPorMora")
                        .HasColumnType("numeric");

                    b.Property<int>("Tipo")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.ToTable("Rubros");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Sede", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Direccion")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Sedes");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Usuario", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Apellidos")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Celular")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("CodigoUsuario")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("EstadoUsuario")
                        .HasColumnType("integer");

                    b.Property<string>("Nombres")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("RolId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("RolId");

                    b.ToTable("Usuarios");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Alumno", b =>
                {
                    b.HasOne("ManitasCreativas.Domain.Entities.Grado", "Grado")
                        .WithMany("Alumnos")
                        .HasForeignKey("GradoId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ManitasCreativas.Domain.Entities.Sede", "Sede")
                        .WithMany("Alumnos")
                        .HasForeignKey("SedeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Grado");

                    b.Navigation("Sede");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.AlumnoContacto", b =>
                {
                    b.HasOne("ManitasCreativas.Domain.Entities.Alumno", "Alumno")
                        .WithMany("AlumnoContactos")
                        .HasForeignKey("AlumnoId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ManitasCreativas.Domain.Entities.Contacto", "Contacto")
                        .WithMany("AlumnosContacto")
                        .HasForeignKey("ContactoId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Alumno");

                    b.Navigation("Contacto");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Pago", b =>
                {
                    b.HasOne("ManitasCreativas.Domain.Entities.Alumno", "Alumno")
                        .WithMany("Pagos")
                        .HasForeignKey("AlumnoId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ManitasCreativas.Domain.Entities.Rubro", "Rubro")
                        .WithMany("Pagos")
                        .HasForeignKey("RubroId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Alumno");

                    b.Navigation("Rubro");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.PagoImagen", b =>
                {
                    b.HasOne("ManitasCreativas.Domain.Entities.Pago", "Pago")
                        .WithMany("ImagenesPago")
                        .HasForeignKey("PagoId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Pago");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Usuario", b =>
                {
                    b.HasOne("ManitasCreativas.Domain.Entities.Rol", "Rol")
                        .WithMany()
                        .HasForeignKey("RolId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Rol");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Alumno", b =>
                {
                    b.Navigation("AlumnoContactos");

                    b.Navigation("Pagos");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Contacto", b =>
                {
                    b.Navigation("AlumnosContacto");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Grado", b =>
                {
                    b.Navigation("Alumnos");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Pago", b =>
                {
                    b.Navigation("ImagenesPago");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Rubro", b =>
                {
                    b.Navigation("Pagos");
                });

            modelBuilder.Entity("ManitasCreativas.Domain.Entities.Sede", b =>
                {
                    b.Navigation("Alumnos");
                });
#pragma warning restore 612, 618
        }
    }
}
