using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MSM.Models.Envasado;
using MSM.RealTime;
using MSM.BBDD.Planta;
using System.Web;
using G2Base;
using ReglasMES;
using System.Configuration;
using Microsoft.AspNet.SignalR;
using MSM.Controllers.Planta;
using System.Threading.Tasks;
using MSM.BBDD.Utilidades.Utils;
using MSM.Mappers.DTO;

namespace MSM.Controllers.Envasado
{
    //[System.Web.Http.Authorize(Roles = "Administrador")]
    public class UtilidadesController : ApiController
    {
        [Route("api/CambiarEstadoMaquina/{parametro}/{valor}")]
        [HttpGet]
        public bool CambiarEstadoMaquina(string parametro, int valor)
        {
            ModificarEstadoMaquina regla = null;
            try
            {
                PMConnectorBase.Connect();
                regla = new ModificarEstadoMaquina(PMConnectorBase.PmConexion);
                double errCode = 0;
                string errDesc = "";
                string source = "";
                CallResult res = regla.Call(valor, parametro, ref errCode, ref errDesc, ref source);

                return res == CallResult.CR_Ok;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UtilidadesController.CambiarEstadoMaquina", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_ESTADO_DE"));
            }
            finally
            {
                regla.Dispose();
            }
        }

        [Route("api/ProduccionMaquina/{maquina}/{inicio}/{fin}")]
        [HttpGet]
        public DatosProduccion ProduccionMaquina(string maquina, double inicio, double fin)
        {
            ReglasMES.ObtenerProduccionMaquina regla = null;
            try
            {
                DatosProduccion prod = new DatosProduccion();
                PMConnectorBase.Connect();
                regla = new ReglasMES.ObtenerProduccionMaquina(PMConnectorBase.PmConexion);

                double errCode = 0.0;
                string errDesc = "";
                string errSource = "";
                double tPlanificado = 0.0;
                double tOperativo = 0.0;
                double tBruto = 0.0;
                double tNeto = 0.0;
                double vNominal = 0.0;
                int contadorProduccion = 0;
                int contadorRechazos = 0;

                CallResult res = regla.Call(inicio, fin, maquina, ref errCode, ref errDesc, ref errSource, ref tBruto, 
                    ref tNeto, ref tOperativo, ref tPlanificado, ref vNominal, ref contadorProduccion, ref contadorRechazos);

                if (res == CallResult.CR_Ok)
                {
                    prod.tiempoPlanificado = tPlanificado;
                    prod.tiempoOperativo = tOperativo;
                    prod.tiempoBruto = tBruto;
                    prod.tiempoNeto = tNeto;
                    prod.velocidadNominal = vNominal;
                    prod.cantidadProducida = contadorProduccion;
                    prod.rechazos = contadorRechazos;
                }
                else
                {
                    throw new Exception(errDesc);
                }

                return prod;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            finally
            {
                regla.Dispose();
            }
        }

        /// <summary>
        /// Envia avisos de actualizacion a los clientes
        /// </summary>
        /// <param name="nivel">Tipo de aviso: 0 Critico, 1 Importante, 2 leve</param>
        /// <param name="timeout">Segundos que estará activo el aviso</param>
        /// <param name="mensaje">Texto explicativo relativo a la actualización</param>
        /// <returns></returns>
        /// <example>
        ///api/AvisoActualizacion/2/2/Esto%20es%20una%20prueba
        ///api/AvisoActualizacion/1/null/Esto%20es%20una%20prueba
        ///api/AvisoActualizacion/0/5/Esto%20es%20una%20prueba
        ///api/AvisoActualizacion/0/0/Esto%20es%20una%20prueba
        /// </example>
        [Route("api/AvisoActualizacion/{nivel}/{timeout}/{mensaje}")]
        [HttpGet]
        public bool AvisoActualizacion(int nivel, double? timeout, string mensaje)
        {
            IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

            switch (nivel)
            {
                case 0://Nivel critico-> Echa a todo el mundo
                    hub.Clients.All.logoff(mensaje, timeout);
                    break;
                case 1://Nivel actualizacion importante -> Pide confirmación antes de cerrar
                    hub.Clients.All.asklogoff(mensaje);
                    break;
                case 2://Nivel actualizacion leve -> Avisa que es recomendable cerrar la sesión
                    hub.Clients.All.notUpdate("warning", mensaje, timeout * 1000);
                    break;
            }

            return true;
        }

        [Route("api/getSectionValue/{categoryName}/{sectionName}/{keyName}/{property}/")]
        [HttpGet]
        public string getSectionValue(string categoryName, string sectionName, string keyName, string property)
        {
            return Utilidades.Utils.getValueSection(categoryName,sectionName, keyName, property);
        }

        [Route("api/getTrazaServer/{keyName}")]
        [HttpGet]
        public string getTrazaServer(string keyName)
        {
            return ConfigurationManager.AppSettings[keyName].ToString();
        }

        [Route("api/general/ConfiguracionesVisualizacionColumnas/{pantalla}")]
        [HttpGet]
        public IHttpActionResult ObtenerConfiguracionesVisualizacionColumnas([FromUri] string pantalla)
        {

            var lista = DAO_Utils.ObtenerConfiguracionVisualizacionColumnas(pantalla);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONFIGURACIONES_COLUMNAS").Replace("#PANTALLA", pantalla));

        }

        [Route("api/general/ConfiguracionesVisualizacionColumnas")]
        [HttpPost]
        public IHttpActionResult CrearConfiguracionVisualizacionColumnas([FromBody] DTO_ConfiguracionVisualizacionColumnas datos)
        {

            bool resultado = DAO_Utils.GuardarConfiguracionVisualicacionColumnas(datos);

            if (resultado)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UtilidadesController.CrearConfiguracionVisualizacionColumnas", IdiomaController.GetResourceName("SE_HA_CREADO_CONFIGURACION_VISUALIZACION_COLUMNAS"), HttpContext.Current.User.Identity.Name);
            }

            return Json(resultado);

        }

        [Route("api/general/ConfiguracionesVisualizacionColumnas/{id}")]
        [HttpDelete]
        public IHttpActionResult EliminarConfiguracionVisualizacionColumnas([FromUri] int id)
        {

            bool resultado = DAO_Utils.EliminarConfiguracionVisualicacionColumnas(id);

            if (resultado)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UtilidadesController.EliminarConfiguracionVisualizacionColumnas", IdiomaController.GetResourceName("SE_HA_ELIMINADO_CONFIGURACION_VISUALIZACION_COLUMNAS"), HttpContext.Current.User.Identity.Name);
            }

            return Json(resultado);

        }
    }
}
