using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class AlumnoContacto
    {
        public int AlumnoId { get; set; }
        public required Alumno Alumno { get; set; }
        public int ContactoId { get; set; }
        public required Contacto Contacto { get; set; }
    }
}
