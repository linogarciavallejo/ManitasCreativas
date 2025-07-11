using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class PagoDetalle
    {
        public int Id { get; set; }
        public int PagoId { get; set; }
        public int RubroUniformeDetalleId { get; set; }
        public decimal PrecioUnitario { get; set; }
        public int Cantidad { get; set; }
        public decimal Subtotal { get; set; }

        // Navigation properties
        public Pago Pago { get; set; }
        public RubroUniformeDetalle RubroUniformeDetalle { get; set; }
    }
}
