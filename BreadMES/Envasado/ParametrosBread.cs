using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads.Types;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace BreadMES.Envasado
{
    public class ParametrosBread
    {
        public static string ObtenerIdParametrosRepetidos()
        {
            Collection<COB_MSM_PARAMETROS_LINEA_PRODUCTO> parametros = null;
            try
            {
                COB_MSM_PARAMETROS_LINEA_PRODUCTO_BREAD daoParametros = new COB_MSM_PARAMETROS_LINEA_PRODUCTO_BREAD();
                parametros = daoParametros.Select("", 0, 10000, "");
                
                foreach (COB_MSM_PARAMETROS_LINEA_PRODUCTO p in parametros)
                {
                    daoParametros.Delete(p);
                }
            }
            catch (Exception ex)
            {
                return ex.Message.ToString();
            }

            return "Borrados " + parametros.Count;
        }

        public static bool ModificarParametrosRegistro(string idPPR, int velocidadNominal, int velNomMaqLimitante, double oeeObjetivo, 
                                                       double? oeeCritico, double? oeeCalculado, double oeePreactor, bool? inhabilitarCalculo)
        {
            string filtro = "{ID_PPR} = " + "'" + idPPR + "'";
            COB_MSM_PARAMETROS_LINEA_PRODUCTO_BREAD daoParametros = new COB_MSM_PARAMETROS_LINEA_PRODUCTO_BREAD();
            Collection<COB_MSM_PARAMETROS_LINEA_PRODUCTO> parametros = daoParametros.Select("", 0, 1, filtro);
            
            if (velocidadNominal != -1) parametros[0].VELOCIDAD_NOMINAL = velocidadNominal;
            if (velNomMaqLimitante != -1) parametros[0].VEL_NOM_MAQ_LIMITANTE = velNomMaqLimitante;
            if (oeeObjetivo != -1.0) parametros[0].OEE_OBJETIVO = (Single)oeeObjetivo;
            if (oeeCritico != null && oeeCritico != -1.0) parametros[0].OEE_CRITICO = (Single)oeeCritico;
            if (oeeCalculado != null && oeeCalculado.Value != -1.0) parametros[0].OEE_CALCULADO = (Single)oeeCalculado.Value;
            if (oeePreactor != -1.0) parametros[0].OEE_PREACTOR = (Single)oeePreactor;
            if (inhabilitarCalculo != null) parametros[0].INHABILITAR_CALCULO = inhabilitarCalculo.Value ? (short)1 : (short)0;
            
            daoParametros.Edit(parametros[0]);
            
            return true;
        }

        public static bool ModificarParametrosDefecto(long id, int velocidadNominal, int velNomMaqLimitante, double oeeObjetivo, double? oeeCritico, double oeePreactor)
        {
            string filtro = "{PK}like" + "'%#" + id + "'";
            COB_MSM_PARAMETROS_LINEA_FORMATO_BREAD daoParametros = new COB_MSM_PARAMETROS_LINEA_FORMATO_BREAD();
            Collection<COB_MSM_PARAMETROS_LINEA_FORMATO> parametros = daoParametros.Select("", 0, 1, filtro);

            if (velocidadNominal != -1) parametros[0].VELOCIDAD_NOMINAL = velocidadNominal;
            if (velNomMaqLimitante != -1) parametros[0].VEL_NOM_MAQ_LIMITANTE = velNomMaqLimitante;
            if (oeeObjetivo != -1.0) parametros[0].OEE_OBJETIVO = (Single)oeeObjetivo;
            if (oeeCritico != null && oeeCritico != -1.0) parametros[0].OEE_CRITICO = (Single)oeeCritico;
            if (oeePreactor != -1.0) parametros[0].OEE_PREACTOR = (Single)oeePreactor;

            daoParametros.Edit(parametros[0]);

            return true;
        }

        public static bool CrearParametro(int numLineas, bool rango)
        {
            COB_MSM_TIPOS_PARAMETROS_BREAD contextB = new COB_MSM_TIPOS_PARAMETROS_BREAD();
            COB_MSM_TIPOS_PARAMETROS tp = new COB_MSM_TIPOS_PARAMETROS();
            tp.PARAMETRO_ID = 15;
            tp.NOMBRE = "Tiempo sin WO y sin producción en Llenadora para considerar que es un arranque (h)";
            tp.DESCRIPCION = "Tiempo sin WO y sin producción en Llenadora para considerar que es un arranque (h)";
            tp.TIPO_VALOR = "Single";
            ReturnValue returnVal = contextB.Create(tp);
               
            if (rango)
            {
                for (int i = 1; i <= numLineas; i++)
                {
                    COB_MSM_PARAMETROS_LINEA_ADMIN_BREAD daoParametros = new COB_MSM_PARAMETROS_LINEA_ADMIN_BREAD();
                    COB_MSM_PARAMETROS_LINEA_ADMIN p = new COB_MSM_PARAMETROS_LINEA_ADMIN();
                    p.FK_LINEA_ID = i;
                    p.FK_PARAMETRO_ID = 15;
                    p.VALOR_INT = 5;
                    returnVal = daoParametros.Create(p);
                }
            }
            else
            {
                COB_MSM_PARAMETROS_LINEA_ADMIN_BREAD daoParametros = new COB_MSM_PARAMETROS_LINEA_ADMIN_BREAD();
                COB_MSM_PARAMETROS_LINEA_ADMIN p = new COB_MSM_PARAMETROS_LINEA_ADMIN();
                p.FK_LINEA_ID = numLineas;
                p.FK_PARAMETRO_ID = 14;
                p.VALOR_INT = 5;
                returnVal = daoParametros.Create(p);
            }
            
            return returnVal.succeeded;
        }

        public static bool ModificarParametroLineaAdmin(object parametrosPlanta)
        {
            int idLinea = (int)GetValue(parametrosPlanta, "IdLinea");
            short idParametro = (short)GetValue(parametrosPlanta, "IdParametro");
            string typeName = (string)GetValue(parametrosPlanta, "TipoValor");
            float? valFloat = (float?)GetValue(parametrosPlanta, "VALOR_FLOAT");
            int? valInt = (int?)GetValue(parametrosPlanta, "VALOR_INT");
            string valString = (string)GetValue(parametrosPlanta, "VALOR_STRING");

            string condition = string.Format("{{FK_PARAMETRO_ID}} = '{0}' AND {{FK_LINEA_ID}} = '{1}'", idParametro, idLinea);
            COB_MSM_PARAMETROS_LINEA_ADMIN_BREAD context = new COB_MSM_PARAMETROS_LINEA_ADMIN_BREAD(); ;
            COB_MSM_PARAMETROS_LINEA_ADMIN parametroPlanta = context.Select(string.Empty, 0, 1, condition).First<COB_MSM_PARAMETROS_LINEA_ADMIN>();

            Type type = Type.GetType(string.Format("System.{0}", typeName.ToLower()), false, true);
            switch (Type.GetTypeCode(type))
            {
                case TypeCode.Single:
                    parametroPlanta.VALOR_FLOAT = valFloat.Value;
                    parametroPlanta.SetPropertyValue("VALOR_INT", null);
                    parametroPlanta.SetPropertyValue("VALOR_STRING", null);
                    break;
                case TypeCode.String:
                    parametroPlanta.VALOR_STRING = valString;
                    parametroPlanta.SetPropertyValue("VALOR_INT", null);
                    parametroPlanta.SetPropertyValue("VALOR_FLOAT", null);
                    break;
                case TypeCode.Int32:
                    parametroPlanta.VALOR_INT = valInt.Value;
                    parametroPlanta.SetPropertyValue("VALOR_STRING", null);
                    parametroPlanta.SetPropertyValue("VALOR_FLOAT", null);
                    break;
            }

            ReturnValue returnVal = context.Edit(parametroPlanta);
            return returnVal.succeeded;
        }

        public static COB_MSM_TIPOS_PARAMETROS getTipoParametro(short IdParametro)
        {
            string condition = string.Format("{{PARAMETRO_ID}} = '{0}'", IdParametro);
            COB_MSM_TIPOS_PARAMETROS_BREAD context = new COB_MSM_TIPOS_PARAMETROS_BREAD();
            COB_MSM_TIPOS_PARAMETROS tipoParametro = context.Select(string.Empty, 0, 1, condition).FirstOrDefault<COB_MSM_TIPOS_PARAMETROS>();

            return tipoParametro;
        }

        public static object GetValue(object obj, string propName)
        {
            return obj.GetType().GetProperty(propName).GetValue(obj, null);
        }

        public static bool cargarParametrosLineaProducto(List<string> lista)
        {
            bool correcto = true;
            
            COB_MSM_PARAMETROS_LINEA_PRODUCTO_BREAD daoParametros = new COB_MSM_PARAMETROS_LINEA_PRODUCTO_BREAD();
            COB_MSM_PARAMETROS_LINEA_PRODUCTO parametros = new COB_MSM_PARAMETROS_LINEA_PRODUCTO();

            for (int i = 0; i < lista.Count; i++)
            {
                string[] resultados = lista[i].Split('@');

                string condition = string.Format("{{ID_PPR}} = '{0}'", resultados[0]);
                parametros = daoParametros.Select(String.Empty, 0, 1, condition).FirstOrDefault<COB_MSM_PARAMETROS_LINEA_PRODUCTO>();

                if (parametros != null)
                {
                    //parametros.ID_PPR = resultados[0];
                    parametros.VELOCIDAD_NOMINAL = int.Parse(resultados[1]);
                    parametros.OEE_CRITICO = int.Parse(resultados[2]);
                    parametros.OEE_OBJETIVO = int.Parse(resultados[3]);
                    parametros.OEE_CALCULADO = 0;
                    parametros.OEE_PREACTOR = int.Parse(resultados[3]);
                    daoParametros.Edit(parametros);
                }
            }

            return correcto;
        }

        public static COB_MSM_PARAMETROS_LINEA_ADMIN ObtenerParametrosLineaPorNombre(string nombre, int idLinea)
        {
            COB_MSM_TIPOS_PARAMETROS_BREAD tiposBread = new COB_MSM_TIPOS_PARAMETROS_BREAD();
            int fkValor = tiposBread.Select("", 0, 0, String.Format("{{NOMBRE}} like '{0}%'",nombre)).FirstOrDefault().PARAMETRO_ID;

            COB_MSM_PARAMETROS_LINEA_ADMIN_BREAD paramBread = new COB_MSM_PARAMETROS_LINEA_ADMIN_BREAD();
            COB_MSM_PARAMETROS_LINEA_ADMIN parametro = paramBread.Select("", 0, 0, "{FK_LINEA_ID}=" + idLinea.ToString() + " AND {FK_PARAMETRO_ID}=" + fkValor.ToString()).FirstOrDefault();
            
            return parametro;
        }
    }
}
