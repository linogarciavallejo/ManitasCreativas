using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ManitasCreativas.Domain.Enums;

namespace ManitasCreativas.Domain.Entities
{
    public class Pago
    {
        public int Id { get; set; }
        public int CicloEscolar { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Monto { get; set; }
        public MedioPago MedioPago { get; set; }
        public string? Notas { get; set; }
        public ICollection<PagoImagen> ImagenesPago { get; set; }
        public ICollection<PagoDetalle> PagoDetalles { get; set; } = new List<PagoDetalle>();
        
        // One-to-one relationship with QR Code
        public CodigosQRPagos? CodigoQR { get; set; }
        public int AlumnoId { get; set; }
        public Alumno Alumno { get; set; }
        public int RubroId { get; set; }
        public Rubro Rubro { get; set; }
        public bool EsColegiatura { get; set; }
        public int MesColegiatura { get; set; }
        public int AnioColegiatura { get; set; }
        public bool? EsPagoDeCarnet { get; set; } = false;
        public string? EstadoCarnet { get; set; } = string.Empty;
        public bool? EsPagoDeTransporte { get; set; } = false;
        public bool? EsPagoDeUniforme { get; set; } = false;

        // Audit fields
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }

        public int UsuarioCreacionId { get; set; }
        [ForeignKey("UsuarioCreacionId")]
        public Usuario? UsuarioCreacion { get; set; }        public int? UsuarioActualizacionId { get; set; }
        [ForeignKey("UsuarioActualizacionId")]
        public Usuario? UsuarioActualizacion { get; set; }

        public bool EsAnulado { get; set; } = false;

        public string? MotivoAnulacion { get; set; } = string.Empty;

        public DateTime? FechaAnulacion { get; set; } = null;

        public int? UsuarioAnulacionId { get; set; } = null;
        [ForeignKey("UsuarioAnulacionId")]
        public Usuario? UsuarioAnulacion { get; set; }

    }
}
