using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class Rubro
    {
        public int Id { get; set; }
        public required string Descripcion { get; set; }
        public decimal? PenalizacionPorMora { get; set; }
        public DateTime? FechaLimitePago { get; set; }
        public int? DiaLimitePago { get; set; }
        public int? MesLimitePago { get; set; }
        public ICollection<Pago> Pagos { get; set; }
    }
}
