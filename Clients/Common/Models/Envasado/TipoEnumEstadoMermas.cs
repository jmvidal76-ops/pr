using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Envasado
{
   
    public enum TipoEnumEstadoMermas
    {
        SIN_ESTADO = 0,
        CORRECTO = 1,
        SOBRE_MINIMO = 2,
        SOBRE_MAXIMO = 3
    }

    public static class TipoEnumEstadoMermasExtensions
    {
        public static TipoEnumEstadoMermas GetEnum(int num)
        {
            switch (num)
            {
                case 1:
                    return TipoEnumEstadoMermas.CORRECTO;
                case 2:
                    return TipoEnumEstadoMermas.SOBRE_MINIMO;
                case 3:
                    return TipoEnumEstadoMermas.SOBRE_MAXIMO;
                default:
                    return TipoEnumEstadoMermas.SIN_ESTADO;
            }
        }

        public static string GetColor(this TipoEnumEstadoMermas e)
        {
            switch (e)
            {
                case TipoEnumEstadoMermas.CORRECTO:
                    return "Verde";
                case TipoEnumEstadoMermas.SOBRE_MINIMO:
                    return "Naranja";
                case TipoEnumEstadoMermas.SOBRE_MAXIMO:
                    return "Rojo";
                default:
                    return "";
            }
        }
    }
}
