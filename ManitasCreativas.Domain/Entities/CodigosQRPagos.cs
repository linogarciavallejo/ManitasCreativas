using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class CodigosQRPagos
    {
        public int Id { get; set; }
        public Guid TokenUnico { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaExpiracion { get; set; }

        // A flag to handle one-time use codes.
        public bool EstaUsado { get; set; } = false;
        
        // Navigation properties
        public int PagoId { get; set; }
        public Pago? Pago { get; set; }
    }
}
