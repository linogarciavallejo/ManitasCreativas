﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Entities
{
    public class PagoImagen
    {
        public int Id { get; set; }
        public required Uri ImagenUrl { get; set; } // URL of the image
        public int PagoId { get; set; }
        public Pago Pago { get; set; }

        // Audit fields
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public int UsuarioCreacionId { get; set; }
        [ForeignKey("UsuarioCreacionId")]
        public Usuario? UsuarioCreacion { get; set; }

        public int? UsuarioActualizacionId { get; set; }
        [ForeignKey("UsuarioActualizacionId")]
        public Usuario? UsuarioActualizacion { get; set; }

        public bool? EsImagenEliminada { get; set; } = false;

    }
}
