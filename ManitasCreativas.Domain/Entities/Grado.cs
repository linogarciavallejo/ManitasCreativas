using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities;

public class Grado
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int NivelEducativoId { get; set; }
    public NivelEducativo? NivelEducativo { get; set; }
    
    // Navigation properties
    public ICollection<Rubro>? Rubros { get; set; }
}
