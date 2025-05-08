using ManitasCreativas.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class Alumno
    {
        public int Id { get; set; }
        public required string Codigo { get; set; }
        public required string PrimerNombre { get; set; }
        public string SegundoNombre { get; set; }
        public required string PrimerApellido { get; set; }
        public string SegundoApellido { get; set; }
        public int SedeId { get; set; }
        public required Sede Sede { get; set; }
        public int GradoId { get; set; }
        public required Grado Grado { get; set; }
        public string ? Seccion { get; set; }
        public bool? Becado { get; set; }
        public decimal? BecaParcialPorcentaje { get; set; }
        public EstadoAlumno Estado { get; set; } = EstadoAlumno.Activo;

        // Audit fields
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }

        public int? UsuarioCreacionId { get; set; }
        public int? UsuarioActualizacionId { get; set; }

        public ICollection<Pago> Pagos { get; set; }
        public ICollection<AlumnoContacto> AlumnoContactos { get; set; }
    }
}
