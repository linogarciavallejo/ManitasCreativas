using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class EntradaUniforme
    {
        public int Id { get; set; }
        public DateTime FechaEntrada { get; set; }
        public int UsuarioCreacionId { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string? Notas { get; set; }
        public decimal Total { get; set; }

        // Navigation properties
        [ForeignKey("UsuarioCreacionId")]
        public Usuario? UsuarioCreacion { get; set; }
        public ICollection<EntradaUniformeDetalle> EntradaUniformeDetalles { get; set; } = new List<EntradaUniformeDetalle>();

        // Audit fields
        public DateTime? FechaActualizacion { get; set; }
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
