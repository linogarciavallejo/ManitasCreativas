using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class RubroUniformeDetalle
    {
        public int Id { get; set; }
        public int RubroId { get; set; }
        public int PrendaUniformeId { get; set; }

        // Navigation properties
        public Rubro Rubro { get; set; }
        public PrendaUniforme PrendaUniforme { get; set; }
        public ICollection<PagoDetalle> PagoDetalles { get; set; } = new List<PagoDetalle>();

        // Audit fields
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }

        public int UsuarioCreacionId { get; set; }
        [ForeignKey("UsuarioCreacionId")]
        public Usuario? UsuarioCreacion { get; set; }

        public int? UsuarioActualizacionId { get; set; }
        [ForeignKey("UsuarioActualizacionId")]
        public Usuario? UsuarioActualizacion { get; set; }

        public bool EsEliminado { get; set; } = false;
        public string? MotivoEliminacion { get; set; }
        public DateTime? FechaEliminacion { get; set; }
        public int? UsuarioEliminacionId { get; set; }
        [ForeignKey("UsuarioEliminacionId")]
        public Usuario? UsuarioEliminacion { get; set; }
    }
}
