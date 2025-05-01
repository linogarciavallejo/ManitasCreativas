using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class NivelEducativo
    {
        public int Id { get; set; }
        public required string Nombre { get; set; }
        public ICollection<Grado> Grados { get; set; } = new List<Grado>();
        public bool? Activo { get; set; } = true;
    }
}
