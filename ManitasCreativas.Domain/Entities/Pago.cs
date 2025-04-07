using System;
using System.Collections.Generic;
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
        public int AlumnoId { get; set; }
        public Alumno Alumno { get; set; }
        public int RubroId { get; set; }
        public Rubro Rubro { get; set; }
        public bool EsColegiatura { get; set; }
        public int MesColegiatura { get; set; }
        public int AnioColegiatura { get; set; }
        public int? UsuarioId { get; set; }
        public Usuario? Usuario { get; set; } // Relación opcional con Usuario

    }
}
