using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.BBDD.PRL
{
    public class DAO_PRL
    {
        internal static DateTime ObtenerFechaUltimoAccidente(string linea)
        {
            string fecha = string.Empty;
            string parametro = linea + " - " + IdiomaController.GetResourceName("FECHA_ULTIMO_ACCIDENTE");

            using (MESEntities contexto = new MESEntities())
            {
                fecha = contexto.ParametrosPRL.AsNoTracking().Where(x => x.Parametro == parametro).Select(x => x.Valor).FirstOrDefault();
            }

            return fecha == null ? DateTime.Today : Convert.ToDateTime(fecha);
        }

        internal static bool GuardarFechaUltimoAccidente(ParametrosPRL parametro)
        {
            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    ParametrosPRL paramActual = contexto.ParametrosPRL.FirstOrDefault(x => x.Parametro == parametro.Parametro);

                    if (paramActual == null) // No existe el parametro así que lo creamos
                    {
                        contexto.ParametrosPRL.Add(parametro);
                    }
                    else // El parametro existe y hay que modificarlo
                    {
                        paramActual.Valor = parametro.Valor;
                    }

                    contexto.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ParametrosPRL.GuardarFechaUltimoAccidente", "WEB-PRL", "Sistema");
                return false;
            }
        }

        internal static bool HayAvisoEvacuacion()
        {
            string estadoAviso = string.Empty;
            string parametro = IdiomaController.GetResourceName("AVISO_EVACUACION");
            
            using (MESEntities contexto = new MESEntities())
            {
                estadoAviso = contexto.ParametrosPRL.AsNoTracking().Where(x => x.Parametro == parametro).Select(x => x.Valor).FirstOrDefault();
            }

            return estadoAviso == IdiomaController.GetResourceName("ACTIVADO");
        }

        internal static bool ActivarAvisoEvacuacion(ParametrosPRL parametro)
        {
            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    ParametrosPRL paramActual = contexto.ParametrosPRL.FirstOrDefault(x => x.Parametro == parametro.Parametro);

                    if (paramActual == null) // No existe el parametro así que lo creamos
                    {
                        contexto.ParametrosPRL.Add(parametro);
                    }
                    else // El parametro existe y hay que modificarlo
                    {
                        paramActual.Valor = parametro.Valor;
                    }

                    contexto.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ParametrosPRL.ActivarAvisoEvacuacion", "WEB-PRL", "Sistema");
                return false;
            }
        }
    }
}