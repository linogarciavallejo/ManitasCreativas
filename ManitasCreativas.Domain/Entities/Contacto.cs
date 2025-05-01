using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class Contacto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string TelefonoTrabajo { get; set; }
        public string Celular { get; set; }
        public string Email { get; set; }
        public string Direccion { get; set; }
        public int AlumnoId { get; set; }
        public string? Nit { get; set; }

        public ICollection<AlumnoContacto> AlumnosContacto { get; set; }
    }
}
