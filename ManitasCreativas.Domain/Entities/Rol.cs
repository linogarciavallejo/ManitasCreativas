using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class Rol
    {
        public int Id { get; set; }
        public required string Nombre { get; set; }
        public bool EsAdmin { get; set; }
    }
}
