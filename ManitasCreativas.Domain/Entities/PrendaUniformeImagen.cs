using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class PrendaUniformeImagen
    {
        public int Id { get; set; }
        public int PrendaUniformeId { get; set; }
        public required Uri Imagen { get; set; } // URL of the image

        // Navigation properties
        public PrendaUniforme PrendaUniforme { get; set; }
    }
}
