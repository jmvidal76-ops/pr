using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Envasado
{
    public enum TipoEnumMaquinasClases
    {
        DESPALETIZADORA,
        LLENADORA,
        ETIQUETADORA_PALETS,
        EMPAQUETADORA,
        PALETIZADORA,
        INSPECTOR_BOTELLAS_VACIAS,
        ETIQUETADORA_BOTELLAS,
        INSPECTOR_BOTELLAS_LLENAS,
        BASCULA,
        INSPECTOR_SALIDA_LLENADORA
    }

    public static class TipoEnumMaquinasClasesExtensions
    {
        public static TipoEnumMaquinasClases GetEnumAbrev(string abv)
        {
            switch (abv.ToUpper())
            {
                case "DPL":
                    return TipoEnumMaquinasClases.DESPALETIZADORA;
                case "LLE":
                    return TipoEnumMaquinasClases.LLENADORA;
                case "EQP":
                    return TipoEnumMaquinasClases.ETIQUETADORA_PALETS;
                case "PAL":
                    return TipoEnumMaquinasClases.PALETIZADORA;
                case "IBV":
                    return TipoEnumMaquinasClases.INSPECTOR_BOTELLAS_VACIAS;
                case "ETQ":
                    return TipoEnumMaquinasClases.ETIQUETADORA_BOTELLAS;
                case "IBL":
                    return TipoEnumMaquinasClases.INSPECTOR_BOTELLAS_LLENAS;
                case "BAS":
                    return TipoEnumMaquinasClases.BASCULA;
                case "ISL":
                    return TipoEnumMaquinasClases.INSPECTOR_SALIDA_LLENADORA;
                default:
                    return TipoEnumMaquinasClases.DESPALETIZADORA;
            }
        }
        
        public static string GetAbrevFromEnum(this TipoEnumMaquinasClases e)
        {
            switch (e)
            {
                case TipoEnumMaquinasClases.DESPALETIZADORA:
                    return "DPL";
                case TipoEnumMaquinasClases.LLENADORA:
                    return "LLE";
                case TipoEnumMaquinasClases.ETIQUETADORA_PALETS:
                    return "EQP";
                case TipoEnumMaquinasClases.PALETIZADORA:
                    return "PAL";
                case TipoEnumMaquinasClases.INSPECTOR_BOTELLAS_VACIAS:
                    return "IBV";
                case TipoEnumMaquinasClases.ETIQUETADORA_BOTELLAS:
                    return "ETQ";
                case TipoEnumMaquinasClases.INSPECTOR_BOTELLAS_LLENAS:
                    return "IBL";
                case TipoEnumMaquinasClases.BASCULA:
                    return "BAS";
                case TipoEnumMaquinasClases.INSPECTOR_SALIDA_LLENADORA:
                    return "ISL";
                default:
                    return "";
            }
        }
    }
}
