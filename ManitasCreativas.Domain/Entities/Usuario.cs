using ManitasCreativas.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class Usuario
    {
        public int Id { get; set; }
        public required string CodigoUsuario { get; set; }

        public required string Nombres { get; set; }

        public required string Apellidos { get; set; }

        public required string Email { get; set; }

        public string Celular { get; set; }

        public required string Password { get; set; }

        public EstadoUsuario EstadoUsuario { get; set; }

        public required Rol Rol { get; set; }

        // Password reset fields
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetExpires { get; set; }
    }
}
