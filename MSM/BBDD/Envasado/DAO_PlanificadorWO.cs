using Clients.ApiClient.Contracts;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_PlanificadorWO: IDAO_PlanificadorWO
    {
        private IApiClient _api;
        private string _urlPlanificador;
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();

        // Variable para indicar que se está realizando una exportación, thread safe
        private static bool exportando = false;
        private static readonly object syncLock = new object();

        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public DAO_PlanificadorWO()
        {

        }

        public DAO_PlanificadorWO(IApiClient api)
        {
            _api = api;
            _urlPlanificador = string.Concat(UriEnvasado, "api/planificador/");
        }

        public async Task<List<DTO_PlanificadorConfiguracion>> ObtenerConfiguracion()
        {

            var result = await _api.GetPostsAsync<List<DTO_PlanificadorConfiguracion>>(string.Concat(_urlPlanificador, "Configuracion"));

            return result;
        }

        public async Task<DTO_PlanificadorConfiguracion> ActualizarConfiguracion(DTO_PlanificadorConfiguracion dto)
        {

            var result = await _api.PutPostsAsync<DTO_PlanificadorConfiguracion>(string.Concat(_urlPlanificador, "Configuracion"), dto);

            return result;
        }

        public async Task<List<DTO_PlanificadorWOPlanificadasJDE>> ObtenerWOPlanificadasJDE()
        {

            var result = await _api.GetPostsAsync<List<DTO_PlanificadorWOPlanificadasJDE>>(string.Concat(_urlPlanificador, "WOPlanificadasJDE"));

            return result;
        }

        public async Task<bool> CargarWOPlanificadasJDE(string idPlanta, DateTime fechaIni, DateTime fechaFin)
        {           
            await _api.GetPostsAsync<bool>(string.Concat(_urlPlanificador, "CargarWOPlanificadasJDE?idPlanta=", idPlanta, "&fechaIni=", fechaIni.ToUniversalTime().ToString("u"), "&fechaFin=", fechaFin.ToUniversalTime().ToString("u")));

            return true;
        }

        public async Task<bool> ProcesarWOSecuenciadasMES(DateTime fechaIni, DateTime fechaFin)
        {
            await _api.GetPostsAsync<bool>(string.Concat(_urlPlanificador, "ProcesarWOSecuenciadasMES?fechaIni=", fechaIni.ToUniversalTime().ToString("u"), "&fechaFin=", fechaFin.ToUniversalTime().ToString("u")));

            return true;
        }

        public async Task<List<DTO_PlanificadorWOSecuenciadasMES>> ObtenerWOSecuenciadasMES(DateTime fechaIni, DateTime fechaFin, string idLinea)
        {           
            var resultado = await _api.GetPostsAsync<List<DTO_PlanificadorWOSecuenciadasMES>>(string.Concat(_urlPlanificador, "WOSecuenciadasMES?fechaIni=", fechaIni.ToUniversalTime().ToString("u"), "&fechaFin=", fechaFin.ToUniversalTime().ToString("u"), !String.IsNullOrEmpty(idLinea) ? "&idLinea=" + idLinea : ""));

            return resultado;
        }

        public async Task<bool> CrearWOSecuenciadasMES(List<DTO_PlanificadorWOSecuenciadasMES> wos)
        {           
            var resultado = await _api.PostPostsAsync<dynamic>(wos, string.Concat(_urlPlanificador, "WOSecuenciadasMES"));

            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_PlanificadorWO.CrearWOSecuenciadasMES", IdiomaController.GetResourceName("PLANIFICADOR_EXITO_GUARDADO"), HttpContext.Current.User.Identity.Name);
            return resultado;
        }

        public async Task<bool> ActualizarWOSecuenciadasMES(List<DTO_PlanificadorWOSecuenciadasMES> wo)
        {           
            var resultado = await _api.PutPostsAsync<dynamic>(string.Concat(_urlPlanificador, "WOSecuenciadasMES"), wo);

            return resultado;
        }

        public async Task<bool> BorrarWOSecuenciadasMES(List<int> ids)
        {           
            var resultado = await _api.PutPostsAsync<dynamic>(string.Concat(_urlPlanificador, "WOSecuenciadasMES/borrarLote", "?actualizadoPor=", HttpContext.Current.User.Identity.Name), ids);

            return resultado;
        }

        //public async Task<bool> BorrarWOSecuenciadaMES(int id)
        //{           
        //    var resultado = await _api.DeletePostsAsync<dynamic>(string.Concat(_urlPlanificador, "WOSecuenciadasMES/", id.ToString(), "?actualizadoPor=", HttpContext.Current.User.Identity.Name));

        //    return resultado;
        //}

        public bool ComprobarExportacion(bool activarExportacion = false)
        {
            lock (syncLock)
            {
                if (exportando)
                {
                    return false;
                }
                else
                {
                    if (activarExportacion)
                    {
                        exportando = true;
                    }
                    return true;
                }
            }
        }

        public async Task ExportarWOLauncher(DateTime fechaInicio, DateTime fechaFin, string lineas, int semana, int anio, string userName )
        {

            hub.Clients.All.expSecuenciadorIniciada();

            var result = await ExportarWO(fechaInicio, fechaFin, lineas, semana, anio, userName);

            lock (syncLock)
            {
                exportando = false;
            }

            hub.Clients.All.expSecuenciadorFinalizada(result);

        }

        private async Task<Tuple<bool, string>> ExportarWO(DateTime fechaInicio, DateTime fechaFin, string lineas, int semana, int anio, string userName)
        {
            string errorMsg = "";
            string errorPPR = "";
            bool administratorError = false;
            string wosModificadas;

            try
            {
                var resultExport = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_PlanificadorExportarWO>>>(string.Concat(_urlPlanificador, "ExportarWO?fechaInicio=", fechaInicio.ToUniversalTime().ToString("u"), "&fechaFin=", fechaFin.ToUniversalTime().ToString("u"), "&lineas=", lineas));
                var wos = resultExport.Data;
                wosModificadas = resultExport.Message;
                //var wos = await _api.GetPostsAsync<List<DTO_PlanificadorExportarWO>>(string.Concat(_urlPlanificador, "ExportarWO?fechaInicio=", fechaInicio.ToUniversalTime().ToString("u"), "&fechaFin=", fechaFin.ToUniversalTime().ToString("u"), "&lineas=", lineas));

                if (wos.Count > 0)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_PlanificadorWO.ExportarWO", IdiomaController.GetResourceName("PLANIFICADOR_INICIO_EXPORTAR"), userName);                    
                    // Depende de la acción de cada WO hay que crearlas/editarlas/borrarlas de MES

                    DAO_Orden daoOrden = new DAO_Orden();
                    List<int> ids = new List<int>();

                    //CREACION NUEVAS WO
                    var wosCrear = wos.FindAll(f => f.Accion == EXPORTAR_WO_ACCION.CREAR);
                    var idsMES = new Dictionary<int, string>();
                    if (wosCrear.Count > 0)
                    {
                        hub.Clients.All.expSecuenciadorProgreso(new { msg = IdiomaController.GetResourceName("CREANDO_WOS") });
                        
                        idsMES = daoOrden.CrearWOsPlanificador(wosCrear, out errorMsg, out errorPPR, out administratorError, userName);                        
                    }

                    ids = wosCrear.Where(w => idsMES.ContainsKey(w.IdWOSecuenciadasMES)).Select(s => s.IdWOSecuenciadasMES).ToList();

                    // Con los nuevos IDS de MES actualizamos las WO Secuenciadas
                    try
                    {
                        await _api.PutPostsAsync<dynamic>(string.Concat(_urlPlanificador, "WOSecuenciadasMES/IdMES"), idsMES);
                    }
                    catch (Exception ex)
                    {
                        administratorError = true;
                        errorMsg += IdiomaController.GetResourceName("ERROR_ACTUALIZANDO_IDMES_PLANIFICADOR") + ": "+ex.Message + ".&lt;br&gt;"; 
                    }

                    // Edicion de WO existentes
                    foreach (var wo in wos.FindAll(f => f.Accion == EXPORTAR_WO_ACCION.ACTUALIZAR))
                    {
                        var orden = new Orden()
                        {
                            id = wo.IdMES + ".1",
                            _refLinea = new Linea()
                            {
                                id = wo.IdLinea
                            },
                            cantPlanificada = (int)wo.Cantidad,
                            descripcion = wo.Descripcion,
                            dFecInicioEstimado = wo.FechaInicioPlanificada,
                            dFecFinEstimado = wo.FechaFinPlanificada,
                            producto = new Producto(wo.IdProducto, "")
                            {
                                udMedida = wo.UOM
                            }
                        };
                        string error;
                        try
                        {
                            hub.Clients.All.expSecuenciadorProgreso(new { msg = IdiomaController.GetResourceName("ACTUALIZANDO_WO").Replace("#WO", wo.IdMES) });
                            
                            daoOrden.EditarOrdenPlanificada(orden, out error, false, userName);
                            ids.Add(wo.IdWOSecuenciadasMES);
                        }
                        catch (Exception ex)
                        {
                            var message = ex.InnerException != null ? "IE: " + ex.InnerException.Message + ". " + ex.Message : ex.Message;
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, message + " -> " + ex.StackTrace, "DAO_Orden.EditarOrdenPlanificada", "WEB-ENVASADO", userName);
                            administratorError = true;
                            errorMsg += IdiomaController.GetResourceName("ERROR_EDITAR_ORDEN") + string.Concat("(id: ", wo.IdMES, " linea: ",wo.IdLinea, ", idProducto: ", wo.IdProducto, ", cantidad: ", wo.Cantidad
                                , ", fechaIni: ", wo.FechaInicioPlanificada.ToString(), ", fechaFin: ", wo.FechaFinPlanificada.ToString(), ": ", message, ".&lt;br&gt;");
                        }
                    }

                    // Borrado de WO
                    foreach (var wo in wos.FindAll(f => f.Accion == EXPORTAR_WO_ACCION.ELIMINAR))
                    {
                        try
                        {
                            hub.Clients.All.expSecuenciadorProgreso(new { msg = IdiomaController.GetResourceName("CANCELANDO_WO").Replace("#WO", wo.IdMES) });

                            DAO_Orden.cambiarEstadoOrden(wo.IdMES, wo.Estado, userName, userName);
                            ids.Add(wo.IdWOSecuenciadasMES);
                            DAO_Orden.cambiarEstadoOrden(wo.IdMES + ".1", wo.Estado, userName, userName);

                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Orden.cambiarEstadoOrden", "Orden cancelada (planificador) - " +
                                    "Linea: " + wo.IdLinea +
                                    "; WO: " + wo.IdMES +
                                    ", Producto: " + wo.IdProducto
                                , userName);
                        }
                        catch (Exception ex)
                        {
                            var message = ex.InnerException != null ? "IE: " + ex.InnerException.Message + ". " + ex.Message : ex.Message;
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, "Params: IdWO: " + wo.IdMES + ", Estado: " + wo.Estado + ". " +
                                message + " -> " + ex.StackTrace, "DAO_Orden.cambiarEstadoOrden", "WEB-ENVASADO", userName);
                            administratorError = true;
                            errorMsg += IdiomaController.GetResourceName("ERROR_CANCELANDO_WO") + string.Concat("(id: ", wo.IdMES, ": ", message, ".&lt;br&gt;");
                        }
                    }

                    // Actualizamos la fecha de exportación de las WO   
                    try
                    {
                        await _api.PutPostsAsync<dynamic>(string.Concat(_urlPlanificador, "WOSecuenciadasMES/FechaExportacion"), new { ids = ids });
                    }
                    catch(Exception ex)
                    {
                        administratorError = true;
                        errorMsg += IdiomaController.GetResourceName("ERROR_ACTUALIZANDO_FECHA_EXPORTACION_PLANIFICADOR") + ": " + ex.Message + ".&lt;br&gt;";
                    }

                    // Llamar al procedimiento SIT_EjecutarJobInterfazCreacionWoMesEnJde
                    // Si falla porque el JOB ya está en ejecución, lo reintentamos varias veces

                    hub.Clients.All.expSecuenciadorProgreso(new { msg = IdiomaController.GetResourceName("SINCRONIZANDO_CON_JDE") });

                    int tries = 4;
                    int interval = 20000;
                    bool finished = false;
                    while (!finished)
                    {
                        try
                        {
                            DAO_Orden.EjecutarJobICreacionWOenJDE();
                            finished = true;
                        }
                        catch (Exception ex)
                        {                            
                            System.Threading.Thread.Sleep(interval);
                            tries--;
                            if (tries <= 0)
                            {                                
                                if (!string.IsNullOrEmpty(errorPPR))
                                {
                                    errorPPR += "<br>";
                                }
                                errorPPR += IdiomaController.GetResourceName("PLANIFICADOR_INFO_RETRASO_JDE");
                                errorMsg += ex.Message;
                                finished = true;
                            }                            
                        }
                    }                                       
                }

                // Creación del informe de planificación
                //try
                //{
                //    hub.Clients.All.expSecuenciadorProgreso(new { msg = IdiomaController.GetResourceName("GENERANDO_INFORME_PLANIFICACION") });

                //    await this.GenerarInformePlanificacion(semana, anio, false);
                //}
                //catch(Exception ex)
                //{
                //    administratorError = true;
                //    errorMsg += IdiomaController.GetResourceName("ERROR_GENERANDO_INFORME_PLANIFICACION") + ": " + ex.Message + ".&lt;br&gt;";
                //}   
            }
            catch (Exception ex)
            {                
                errorMsg += IdiomaController.GetResourceName("PLANIFICADOR_ERROR_GENERAL_EXPORTAR_WOS")+": " + ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, errorMsg + " -> " + ex.StackTrace, "DAO_PlanificadorWO.ExportarWO", "WEB-ENVASADO", userName);
                return new Tuple<bool, string>(false, IdiomaController.GetResourceName("PLANIFICADOR_ERROR_GENERAL_EXPORTAR_WOS")+": "+ IdiomaController.GetResourceName("AVISA_ADMINISTRADOR"));
            }

            if (!string.IsNullOrEmpty(wosModificadas))
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("WOS_MODIFICADAS_PLANIFICADOR").Replace("#WOS#", wosModificadas), "DAO_PlanificadorWO.ExportarWO", "WEB-ENVASADO", userName);
            }

            if (!string.IsNullOrEmpty(errorMsg))
            {
                errorMsg = IdiomaController.GetResourceName("ERROR_PARCIAL_EXPORTACION_PLANIFICACION") + errorMsg;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, errorMsg, "DAO_PlanificadorWO.ExportarWO", "WEB-ENVASADO", userName);
                if (!string.IsNullOrEmpty(errorPPR) && !administratorError)
                {
                    return new Tuple<bool, string>(true, IdiomaController.GetResourceName("ERROR_PARCIAL_EXPORTACION_PLANIFICACION") + errorPPR);
                }
                return new Tuple<bool, string>(true, IdiomaController.GetResourceName("ERROR_PARCIAL_EXPORTACION_PLANIFICACION") + IdiomaController.GetResourceName("AVISA_ADMINISTRADOR"));

            }
            else
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_PlanificadorWO.ExportarWO", IdiomaController.GetResourceName("PLANIFICADOR_EXPORTACION_REALIZADA"), userName);
                return new Tuple<bool, string>(true, !string.IsNullOrEmpty(wosModificadas) ? 
                    IdiomaController.GetResourceName("PLANIFICADOR_EXITO_EXPORTAR") + " " + IdiomaController.GetResourceName("WOS_MODIFICADAS_PLANIFICADOR").Replace("#WOS#", wosModificadas) :
                    "");
            }
        }

        public async Task<bool> GenerarInformePlanificacion(int semana, int anio, bool borrador)
        {            
            await _api.GetPostsAsync<dynamic>(string.Concat(_urlPlanificador, "GenerarInformePlanificacion?semana=", semana.ToString(), "&anio=", anio.ToString(), "&borrador=", borrador.ToString()));

            return true;            
        }

        public async Task<bool> ActualizarEstadosWOPlanificadasJDE(dynamic body)
        {
            var resultado = await _api.PutPostsAsync<dynamic>(string.Concat(_urlPlanificador, "WOPlanificadasJDE/estados"), body);

            return resultado;
        }

        public async Task<List<DTO_UltimasProducciones>> ObtenerUltimasProduccionesLineas(DateTime fecha)
        {
            var resultado = await _api.GetPostsAsync<List<DTO_UltimasProducciones>>(string.Concat(_urlPlanificador, "UltimasProducciones?fecha=", fecha.ToUniversalTime().ToString("u")));

            return resultado;
        }

        public async Task<List<DTO_ClaveValorInfo>> ObtenerProductosSIGI()
        {
            var resultado = await _api.GetPostsAsync<List<DTO_ClaveValorInfo>>(string.Concat(_urlPlanificador, "ProductosSIGI"));

            return resultado;
        }

        #region JustificacionesCambiosPlanificacion

        public async Task<DTO_RespuestaAPI<List<DTO_PlanificadorJustificacionCambioPlanificacion>>> ObtenerJustificacionesCambiosPlanificacion(DateTime? fechaDesde, DateTime? fechaHasta)
        {
            var resultado = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_PlanificadorJustificacionCambioPlanificacion>>>(string.Concat(_urlPlanificador, "JustificacionesCambiosPlanificacion", 
                fechaDesde != null || fechaHasta != null ? string.Concat("?", 
                    fechaDesde != null ? $"fechaDesde={fechaDesde.Value.ToUniversalTime().ToString("u")}&" : "",
                    fechaHasta != null ? $"fechaHasta={fechaHasta.Value.ToUniversalTime().ToString("u")}" : "")
                : ""));

            return resultado;
        }

        public async Task<DTO_RespuestaAPI<bool>> CrearJustificacionCambioPlanificacion(DTO_PlanificadorJustificacionCambioPlanificacion item)
        {
            var resultado = await _api.PostPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(item, string.Concat(_urlPlanificador, "JustificacionesCambiosPlanificacion"));

            return resultado;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarJustificacionCambioPlanificacion(DTO_PlanificadorJustificacionCambioPlanificacion item)
        {
            var resultado = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlPlanificador, "JustificacionesCambiosPlanificacion"), item);

            return resultado;
        }

        public async Task<DTO_RespuestaAPI<bool>> EliminarJustificacionCambioPlanificacion(DTO_PlanificadorJustificacionCambioPlanificacion item)
        {
            var resultado = await _api.DeletePostsAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlPlanificador, "JustificacionesCambiosPlanificacion/", item.IdJustificacion.ToString()));

            return resultado;
        }
        #endregion

    }
}