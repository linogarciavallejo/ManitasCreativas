using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class EntradaUniformeDetalle
    {
        public int Id { get; set; }
        public int EntradaUniformeId { get; set; }
        public int PrendaUniformeId { get; set; }
        public int Cantidad { get; set; }
        public decimal Subtotal { get; set; }

        // Navigation properties
        public EntradaUniforme EntradaUniforme { get; set; }
        public PrendaUniforme PrendaUniforme { get; set; }
    }
}
