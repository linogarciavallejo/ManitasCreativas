using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class PrendaUniforme
    {
        public int Id { get; set; }
        public required string Descripcion { get; set; }
        public required string Sexo { get; set; } // "M", "F", "Unisex"
        public required string Talla { get; set; } // (1, 2, 3, .... n) || (XXS, XS, ... XXXL)
        public decimal Precio { get; set; }
        public int ExistenciaInicial { get; set; }
        public int Entradas { get; set; }
        public int Salidas { get; set; }
        public string? Notas { get; set; }

        // Navigation properties
        public ICollection<PrendaUniformeImagen> ImagenesPrenda { get; set; } = new List<PrendaUniformeImagen>();
        public ICollection<EntradaUniformeDetalle> EntradaUniformeDetalles { get; set; } = new List<EntradaUniformeDetalle>();
        public ICollection<RubroUniformeDetalle> RubroUniformeDetalles { get; set; } = new List<RubroUniformeDetalle>();

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
