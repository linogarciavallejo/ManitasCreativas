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
        public decimal? PenalizacionPorMoraMonto { get; set; }
        public decimal? PenalizacionPorMoraPorcentaje { get; set; }

        public DateTime? FechaLimitePagoAmarillo { get; set; }
        // Opcional: Si deseas tener explícitamente la fecha para los rubros de colegiatura. Este campo es para el rango amarillo.

        public DateTime? FechaLimitePagoRojo { get; set; }
        // Opcional: Si deseas tener explícitamente la fecha para los rubros de colegiatura. Este campo es para el rango rojo.

        public bool EsColegiatura { get; set; } = false;
        // Opcional: Si deseas identificar explícitamente un rubro de colegiatura. 1 = Si, 0 = No.

        public int? DiaLimitePagoAmarillo { get; set; }
        // Opcional: Si deseas tener explícitamente el dia para los rubros de colegiatura. Este campo es para el rango amarillo: 1-5 dias de atraso.

        public int? DiaLimitePagoRojo { get; set; }
        // Opcional: Si deseas tener explícitamente el dia para los rubros de colegiatura. Este campo es para el rango rojo: 6-15 dias de atraso.

        public int? MesLimitePago { get; set; }
        // Opcional: Si deseas tener explícitamente el mes para los rubros de colegiatura

        public int? NivelEducativoId { get; set; }
        // Opcional: Si deseas tener explícitamente el nivel educativo relacionado con algun rubro especifico, por ejemplo: Inscripcion, uniforme, etc.

        public NivelEducativo? NivelEducativo { get; set; }
        // Opcional: Si deseas tener explícitamente el nivel educativo relacionado con algun rubro especifico, por ejemplo: Inscripcion, uniforme, etc.

        public int? GradoId { get; set; }
        // Opcional: Si deseas tener explícitamente el grado relacionado con algun rubro especifico, por ejemplo: Inscripcion, uniforme, etc.

        public Grado? Grado { get; set; }
        // Opcional: Si deseas tener explícitamente el grado relacionado con algun rubro especifico, por ejemplo: Inscripcion, uniforme, etc.

        public decimal? MontoPreestablecido { get; set; }
        // Opcional: Si deseas tener explícitamente el monto preestablecido relacionado con algun rubro especifico, por ejemplo: Inscripcion, uniforme, etc.

        public DateTime? FechaInicioPromocion { get; set; }
        // Opcional: Si deseas tener explícitamente la fecha de inicio de la promocion para el rubro.
        public DateTime? FechaFinPromocion { get; set; }
        // Opcional: Si deseas tener explícitamente la fecha de fin de la promocion para el rubro.

        public string? Notas { get; set; } = string.Empty;
        // Opcional: Si deseas tener notas adicionales para el rubro.
        public bool? Activo { get; set; } = true;

        public int? OrdenVisualizacionGrid { get; set; }

        // Audit fields
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public int? UsuarioCreacionId { get; set; }
        public int? UsuarioActualizacionId { get; set; }

        public ICollection<Pago> Pagos { get; set; }
    }
}
