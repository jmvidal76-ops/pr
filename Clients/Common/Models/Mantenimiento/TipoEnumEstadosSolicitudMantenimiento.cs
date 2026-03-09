using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Mantenimiento
{

    public enum TipoEnumEstadosSolicitudMantenimiento
    {
        Cerrada,
        Cancelada,
        FueraDeAveria
    }

    public static class TipoEnumEstadosSolicitudMantenimientoExtensions
    {
        public static string GetString(this TipoEnumEstadosSolicitudMantenimiento me)
        {
            switch (me)
            {
                case TipoEnumEstadosSolicitudMantenimiento.Cerrada:
                    return "M5";
                case TipoEnumEstadosSolicitudMantenimiento.Cancelada:
                    return "M6";
                case TipoEnumEstadosSolicitudMantenimiento.FueraDeAveria:
                    return "M7";
                default:
                    return "";
            }
        }

        public static int StateOrder(string state)
        {
            switch (state)
            {
                case "N0":
                    return 1;
                case "N1":
                    return 2;
                case "N2":
                    return 3;
                case "N3":
                    return 4;
                case "N4":
                    return 5;
                case "M2":
                    return 6;
                case "M3":
                    return 7;
                case "M4":
                    return 8;
                case "M5":
                    return 9;
                case "M6":
                    return 10;
                case "M7":
                    return 11;
                default:
                    return 0;
            }
        }
    }
}
