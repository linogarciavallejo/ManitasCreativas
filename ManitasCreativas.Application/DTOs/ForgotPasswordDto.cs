using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Application.DTOs
{
    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public int UsuarioCreacionId { get; set; }

    }
}
