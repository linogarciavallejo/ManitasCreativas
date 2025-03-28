using ManitasCreativas.Domain.Enums;
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
        public TipoRubro Tipo { get; set; }
        public decimal? PenalizacionPorMora { get; set; }
        public DateTime? FechaLimitePago { get; set; }
        // Opcional: Si deseas tener explícitamente el mes para los rubros de colegiatura
        public int? MesColegiatura { get; set; }
        // Si decides mantener los campos actuales, podrías evaluarlos o incluso eliminarlos
        public int? DiaLimitePago { get; set; }
        public int? MesLimitePago { get; set; }
        public ICollection<Pago> Pagos { get; set; }
    }
}
