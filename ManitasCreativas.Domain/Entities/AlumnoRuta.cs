using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class AlumnoRuta
    {
        public int Id { get; set; }
        public int AlumnoId { get; set; }
        public Alumno Alumno { get; set; }
        public int RubroTransporteId { get; set; }
        public Rubro RubroTransporte { get; set; }
        
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
    }
}
