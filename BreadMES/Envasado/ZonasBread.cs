using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads.Extensions;
using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BreadMES.Envasado
{
    public class ZonasBread
    {
        public static bool CrearZonasCompartidas(string nombrePlanta)
        {
            COB_MSM_ZONAS_COMPARTIDAS_BREAD contextp = new COB_MSM_ZONAS_COMPARTIDAS_BREAD();

            //List<COB_MSM_ZONAS_COMPARTIDAS> listZonasCompartidas = contextp.Select(string.Empty, 0, 0, string.Empty).ToList<COB_MSM_ZONAS_COMPARTIDAS>();

            //foreach (COB_MSM_ZONAS_COMPARTIDAS item in listZonasCompartidas)
            //{
            //    contextp.Delete(item);   
            //}
            ReturnValue returnVal = new ReturnValue();
            COB_MSM_ZONAS_COMPARTIDAS tp = null;
            switch (nombrePlanta)
            {
                case "BURGOS":
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "B15";
                    tp.ID_ZONA_2 = "B24";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2))
                    { returnVal = contextp.Create(tp); }
                    contextp = new COB_MSM_ZONAS_COMPARTIDAS_BREAD();
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "B20";
                    tp.ID_ZONA_2 = "B23";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    contextp = new COB_MSM_ZONAS_COMPARTIDAS_BREAD();
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "B32";
                    tp.ID_ZONA_2 = "B33";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    contextp = new COB_MSM_ZONAS_COMPARTIDAS_BREAD();
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "B40";
                    tp.ID_ZONA_2 = "B41";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    contextp = new COB_MSM_ZONAS_COMPARTIDAS_BREAD();
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "B40";
                    tp.ID_ZONA_2 = "B42";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    contextp = new COB_MSM_ZONAS_COMPARTIDAS_BREAD();
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "B41";
                    tp.ID_ZONA_2 = "B42";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    break;
                case "LLEIDA":

                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "L11";
                    tp.ID_ZONA_2 = "L12";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2))
                    {
                        returnVal = contextp.Create(tp);
                    }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "L10";
                    tp.ID_ZONA_2 = "L13";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "L21";
                    tp.ID_ZONA_2 = "L22";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "L24";
                    tp.ID_ZONA_2 = "L33";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "L20";
                    tp.ID_ZONA_2 = "L30";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "L40";
                    tp.ID_ZONA_2 = "L41";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "L40";
                    tp.ID_ZONA_2 = "L42";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "L41";
                    tp.ID_ZONA_2 = "L42";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    break;
                case "SOLAN":
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "S11";
                    tp.ID_ZONA_2 = "S12";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "S14";
                    tp.ID_ZONA_2 = "S24";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "S21";
                    tp.ID_ZONA_2 = "S22";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "S31";
                    tp.ID_ZONA_2 = "S32";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "S33";
                    tp.ID_ZONA_2 = "S43";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "S34";
                    tp.ID_ZONA_2 = "S44";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "S41";
                    tp.ID_ZONA_2 = "S42";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "S60";
                    tp.ID_ZONA_2 = "S63";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    break;
                case "ALOVERA":
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A10";
                    tp.ID_ZONA_2 = "A11";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A10";
                    tp.ID_ZONA_2 = "A13";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A20";
                    tp.ID_ZONA_2 = "A23";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A22";
                    tp.ID_ZONA_2 = "A32";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A24";
                    tp.ID_ZONA_2 = "A34";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A10";
                    tp.ID_ZONA_2 = "A14";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A90";
                    tp.ID_ZONA_2 = "A94";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A10";
                    tp.ID_ZONA_2 = "A90";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A10";
                    tp.ID_ZONA_2 = "A94";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A14";
                    tp.ID_ZONA_2 = "A94";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A14";
                    tp.ID_ZONA_2 = "A90";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "AA0";
                    tp.ID_ZONA_2 = "AA4";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A30";
                    tp.ID_ZONA_2 = "A32";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A40";
                    tp.ID_ZONA_2 = "A50";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A43";
                    tp.ID_ZONA_2 = "A53";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A42";
                    tp.ID_ZONA_2 = "A52";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A60";
                    tp.ID_ZONA_2 = "A61";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A60";
                    tp.ID_ZONA_2 = "A62";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A61";
                    tp.ID_ZONA_2 = "A62";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A70";
                    tp.ID_ZONA_2 = "A72";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A70";
                    tp.ID_ZONA_2 = "A71";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A81";
                    tp.ID_ZONA_2 = "A82";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A80";
                    tp.ID_ZONA_2 = "A84";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A91";
                    tp.ID_ZONA_2 = "A92";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "A90";
                    tp.ID_ZONA_2 = "A93";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "AA0";
                    tp.ID_ZONA_2 = "AA1";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "AA0";
                    tp.ID_ZONA_2 = "AA3";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    tp = new COB_MSM_ZONAS_COMPARTIDAS();
                    tp.ID_ZONA_1 = "AB0";
                    tp.ID_ZONA_2 = "AB1";
                    if (!checkIfExist(tp.ID_ZONA_1, tp.ID_ZONA_2)) { returnVal = contextp.Create(tp); }
                    break;
                default:
                    break;
            }


            return returnVal.succeeded;
        }

        private static bool checkIfExist(string zona1, string zona2)
        {
            COB_MSM_ZONAS_COMPARTIDAS_BREAD contextp = new COB_MSM_ZONAS_COMPARTIDAS_BREAD();
            string filtro = string.Format("{{ID_ZONA_1}} = '{0}' AND {{ID_ZONA_2}} = '{1}'", zona1, zona2);
            int count = contextp.SelectCount("", 0, -1, filtro);

            return count > 0;
        }

        public static bool CheckZonaConOrden(string id)
        {
            try
            {
                COB_MSM_ZONAS_BREAD contextp = new COB_MSM_ZONAS_BREAD();
                string filtro = string.Format("{{ID_ZONA}} = '{0}'", id);
                List<COB_MSM_ZONAS> encontrados = contextp.Select("", 0, -1, filtro).ToList();
                
                if (encontrados.Count() > 0)
                {
                    COB_MSM_ZONAS cob = encontrados.First();
                    return !string.IsNullOrEmpty(cob.ORDER_ID);
                }
            }
            catch
            {
                return false;

            }

            return false;
        }

    }
}
