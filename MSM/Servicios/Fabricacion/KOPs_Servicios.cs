using Common.Models.Fabricacion.Coccion;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace MSM.Servicios.Fabricacion
{
    public class KOPs_Servicios
    {

        public static bool ValidacionValoresKOPs(DTO_KOPs_Config kops)
        {
            decimal num;
            bool result = true;
            NumberFormatInfo proveedor = new NumberFormatInfo();
            proveedor.NumberDecimalSeparator = ".";
            NumberStyles estilos = new NumberStyles();
            estilos = NumberStyles.AllowExponent | NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign;

            switch (kops.Tipo)
            {
                case "int":
                case "float":

                    if (!string.IsNullOrEmpty(kops.Maximo))
                    {
                        if (Decimal.TryParse(kops.Maximo, estilos, proveedor, out num))
                        {
                            result = true;
                        }
                        else
                        {
                            result = false;
                        }
                    }

                    if (!string.IsNullOrEmpty(kops.Minimo))
                    {
                        if (Decimal.TryParse(kops.Minimo, estilos, proveedor, out num))
                        {
                            result = true;
                        }
                        else
                        {
                            result = false;
                        }
                    }

                    break;
                default:
                    break;
            }

            return result;
        }
    }
}