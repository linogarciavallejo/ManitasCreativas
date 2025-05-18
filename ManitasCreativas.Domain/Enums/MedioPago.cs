using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Domain.Enums
{
    public enum MedioPago
    {
        Efectivo = 1,
        TarjetaCredito = 2,
        TarjetaDebito = 3,
        TransferenciaBancaria = 4,
        Cheque = 5,
        BoletaDeposito = 6,
        PagoMovil = 7
    }
}
