using Common.Models.Fabricacion;
using Common.Models.Fabricacion.Orden;
using Common.Models.Trazabilidad.Fabricacion;
using MSM.BBDD.Fabricacion;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.RTDS;
using MSM.BBDD.Trazabilidad;
using MSM.BBDD.Trazabilidad.Operations;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api;
using MSM.Mappers.DTO.Fabricacion.Api.Lot;
using MSM.Models.Fabricacion;
using MSM.Security;
using MSM_FabricacionAPI.Models.Orden;
using Siemens.SimaticIT.POM.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    [Authorize]
    public class OrdenesFabController : ApiController
    {

        private readonly IDAO_Operations _iDAO_Operacion;
        private readonly IDAO_Ubicacion _iDAO_Ubicacion;
        private readonly ISitRTDS _sitRTDS;
        private readonly IDAO_Orden _iOrden;

        public OrdenesFabController(IDAO_Operations iDAO_Operacion, IDAO_Ubicacion iDAO_Ubicacion, ISitRTDS sitRTDS, IDAO_Orden iOrden)
        {
            _iDAO_Operacion = iDAO_Operacion;
            _iDAO_Ubicacion = iDAO_Ubicacion;
            _sitRTDS = sitRTDS;
            _iOrden = iOrden;

        }

        /// <summary>
        //Funcion para arrancar una orden planificada
        /// </summary>
        /// param name="datos" contiene las fechas de inicio y el pk de la orden
        [Route("api/arrancarOrden")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<ReturnValue> arrancarOrden(dynamic datos)
        {
            try
            {
                ReturnValue ret = await _iOrden.ArrancarOrden(datos);

                if (!ret.succeeded)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "OrdenesController.arrancarOrden", "WEB-FABRICACION", "Sistema");
                }

                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.arrancarOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ARRANCANDO_LA"));
            }
        }

        /// <summary>
        /// Funcion que devuelve la lista de ordenes para mostrar en el grid del Listado de WO
        /// </summary>
        /// returns Lista de ordenes
        [Route("api/OrdenesFab/GetListadoWO/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas, Funciones.FAB_PROD_SCH_7_VisualizacionListadoWOPlanificadas)]
        public List<dynamic> GetListadoWO(int IdTipoOrden)
        {
            try
            {
                return _iOrden.GetAllOrdenPlanificada(IdTipoOrden);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetListadoWO", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/OrdenesFab/GetOrderNotes")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<String> GetOrderNotes(dynamic datos)
        {
            try
            {
                String _orderID = datos.orderID.ToString();
                return await _iOrden.GetOrderNotes(_orderID);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetOrderNotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_EDITAR_LAS"));
            }
        }

        [Route("api/OrdenesFab/GetPlannedOrderNotes")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas, Funciones.FAB_PROD_SCH_7_VisualizacionListadoWOPlanificadas)]
        public async Task<String> GetPlannedOrderNotes(dynamic datos)
        {
            try
            {
                String _orderID = datos.orderID.ToString();

                return await _iOrden.GetPlannedOrderNotes(_orderID);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetOrderNotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_EDITAR_LAS"));
            }
        }

        [Route("api/OrdenesFab/SetOrderNotes")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<ReturnValue> SetOrderNotes(dynamic datas)
        {
            try
            {
                String _orderID = datas.orderID.ToString();
                String _note = datas.text.ToString();
                return await _iOrden.SetOrderNotes(_orderID, _note);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.SetOrderNotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_EDITAR_LAS"));
            }
        }

        [Route("api/OrdenesFab/SetNoteWOFinalizadas")]
        [HttpPost]
        [ApiAuthorize(
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO, Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<ReturnValue> SetNoteWOFinalizadas(dynamic datas)
        {
            try
            {
                string _orderID = datas.orderID;
                string _note = datas.text;

                return _iOrden.SetNoteWOFinalizadas(_orderID, _note);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.SetOrderNotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_EDITAR_LAS"));
            }
        }

        [Route("api/OrdenesFab/SetPlannedOrderNotes")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<ReturnValue> SetPlannedOrderNotes(dynamic datas)
        {
            try
            {
                String _orderID = datas.orderID.ToString();
                String _note = datas.text.ToString();
                return await _iOrden.SetPlannedOrderNotes(_orderID, _note);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.SetOrderNotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_EDITAR_LAS"));
            }
        }

        /// <summary>
        /// Funcion que devuelve la lista de ordenes para mostrar en el grid del Listado de WO Activas
        /// </summary>
        /// returns Lista de ordenes
        [Route("api/OrdenesFab/ObtenerListadoOrdenes/{idOrden}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas)]
        public async Task<List<DTO_Orden>> ObtenerListadoOrdenes(int idOrden)
        {

            try
            {
                List<DTO_Orden> result = await _iOrden.ObtenerListadoOrdenes(idOrden);

                return result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesFabController.ObtenerListadoOrdenes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }
        }


        /// <summary>
        ///  Funcion que devuelve la lista de ordenes para mostrar en el grid del Listado de WO Activas
        /// </summary>
        /// <returns>Lista de Ordenes que son del historico</returns>
        [Route("api/OrdenesFab/ObtenerListadoOrdenesCerradas/")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionHistoricoWO, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<List<DTO_Orden>> ObtenerListadoOrdenesCerradas(dynamic fechas)
        {

            try
            {

                //Desde Javascript vienen las fechas en UTC
                DateTime fInicio = ((DateTime)fechas.fInicio.Value).ToLocalTime();
                DateTime fFin = ((DateTime)fechas.fFin.Value).ToLocalTime();
                List<DTO_Orden> result = await _iOrden.ObtenerListadoOrdenesCerradas(fInicio.Date.ToString(), fFin.Date.ToString());
                return result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesFabController.ObtenerListadoOrdenesCerradas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }
        }

        /// <summary>
        /// Funcion que devuelve la lista de tipos de orden
        /// </summary>
        /// <returns>Lista de tipos de orden</returns>
        [Route("api/OrdenesFab/ObtenerTiposWO")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_14_GestionCapturaKOPsLIMs, Funciones.FAB_PROD_RES_14_VisualizacionCapturaKOPsLIMs)]
        public async Task<IHttpActionResult> ObtenerTiposWO()
        {
            try
            {
                var result = await _iOrden.ObtenerTiposWO();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesFabController.ObtenerTiposOrden", "WEB-FABRICACION", "Sistema");
                
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_TIPOS"));
            }  
        }

        /// <summary>
        /// Funcion que devuelve la lista de recursos para la orden especificada
        /// </summary>
        /// param name="tipoOrden" contiene el tipo de orden para el que se van a cargar los recursos
        /// returns Lista de recursos
        [Route("api/ObtenerRecursoTipoOrden/{tipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<RecursoTipoOrden_FAB> ObtenerRecursoTipoOrden(string tipoOrden)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    return context.RecursoTipoOrden_FAB.AsNoTracking().Where(p => p.TipoOrden.Equals(tipoOrden)).Distinct().ToList();
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerRecursoTipoOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_RECURSOS"));
            }
        }

        /// <summary>
        /// Funcion que crea una WO, recibe la informacion del formulario y la envia al bread
        /// </summary>
        /// param name="wo" Contiene la informacion del formulario en un array dinamico que se leera mas adelante
        /// returns booleano indicando si la ejecuccion fue correcta o no, si no error generico y almacena en BBDD el error
        [Route("api/AddOrdenFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<ReturnValue> AddOrdenFabricacion(dynamic wo)
        {
            try
            {
                var result = await _iOrden.CrearOrdenPlanificado(wo);

                return result;

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderContorller.AddOrdenFabricacion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.AddOrdenFabricacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Valida el numero de orden segun la sala de coccion
        /// </summary>
        /// param name="wo" Contiene la informacion del formulario en un array dinamico que se leera mas adelante
        /// returns string que indica si el codigo existe
        [Route("api/EvalueIdOrdenCoccion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<bool> EvalueIdOrdenCoccion(dynamic wo)
        {
            try
            {
                ReturnValue ejecucionCorrect = await _iOrden.EvalueNumeroOrden(wo);

                return ejecucionCorrect.succeeded;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderContorller.AddOrdenFabricacion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.EvalueIdOrdenCoccion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        [Route("api/GetOrderType")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public String GetOrderType(dynamic area)
        {
            try
            {
                String aux = area.ToString();
                return DAO_Orden.GetOrderType(System.Text.Encoding.UTF8.GetString(System.Text.Encoding.GetEncoding("ISO-8859-8").GetBytes(aux)).ToUpper());
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.GetAllOrderTypes", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetOrderType", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/GetAllOrderTypes")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_EXE_9_GestionHistoricoWO, Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas)]
        public String GetAllOrderTypes()
        {
            try
            {
                return DAO_Orden.GetOrderType("0");

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.GetAllOrderTypes", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetAllOrderTypes", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Metodo para obtener la informacion de la orden que se mostrara en el detalle de la pantalla de gestion de ordenes activas
        /// </summary>
        /// <param name="idOrden"></param>
        /// <returns></returns>
        [Route("api/ObtenerDetalleOrdenFab/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public Orden GetDetallesOrden(int idOrden)
        {
            try
            {
                Orden infoOrder = DAO_Orden.GetDetallesOrden(idOrden);

                return infoOrder;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.GetDetallesOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetDetallesOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/ConsolidarDatos/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<bool> ConsolidarDatos(int idOrden, [FromUri] string codWO, [FromUri] string estado)
        {
            try
            {
                bool result = await _iOrden.ConsolidarDatos(idOrden);

                if (result)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesFabController.ConsolidarDatos", "CodWO: " + codWO + ". Estado Anterior: " + 
                        estado + ". Cambio Estado: Consolidando datos", HttpContext.Current.User.Identity.Name);
                }
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("LA_WO_NO_SE"),
                        "OrdenesFabController.ConsolidarDatos", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                }

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesFabController.ConsolidarDatos", 
                    "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Metodo que gestiona el cierre de orden, comprobando si el usuario tiene permiso y viendo si la orden esta lista para ser cerrada
        /// </summary>
        /// <param name="pkOrden"></param>
        /// <returns></returns>
        [Route("api/OrdenesFab/CerrarOrden/{pkOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<IHttpActionResult> CerrarOrden(int pkOrden, [FromUri] string codWO, [FromUri] string estado)
        {
            var userName = string.IsNullOrWhiteSpace(HttpContext.Current?.User?.Identity?.Name) ? "SISTEMA" : HttpContext.Current.User.Identity.Name;

            try
            {
                var result = await _iOrden.CerrarOrden(pkOrden);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                if (result.Data)
                {
                    try
                    {
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesFabController.CerrarOrden",
                            "CodWO: " + codWO + ". Estado Anterior: " + estado + ". Cambio Estado: Cerrada", userName);
                    }
                    catch (Exception exLog)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2,
                            "Error al registrar en LogUsuarios -> " + exLog.Message + " CodWO: " + codWO, "OrdenesFabController.CerrarOrden", "WEB-FABRICACION", userName);
                    }
                }
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_CERRANDO_LA") + " CodWO: " + codWO,
                        "OrdenesFabController.CerrarOrden", "WEB-FABRICACION", userName);
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " CodWO: " + codWO + " -> " + ex.StackTrace, "OrdenesFabController.CerrarOrden",
                    "WEB-FABRICACION", userName);

                return BadRequest(IdiomaController.GetResourceName("ERROR_CERRANDO_LA"));
            }
        }

        /// <summary>
        /// Metodo para reclasificar la informacion de orden
        /// </summary>
        /// <returns></returns>
        [Route("api/ReclasificarOrden")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public bool ReclasificarOrden(dynamic datos)
        {
            try
            {

                return _iOrden.ReclasificarOrden(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.ReclasificarOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ReclasificarOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }


        /// <summary>
        /// Metodo para crear una nueva filtracion
        /// </summary>
        /// <returns></returns>
        [Route("api/CreaFiltracion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<bool> CreaFiltracion(dynamic datos)
        {
            try
            {
                return await _iOrden.CreaFiltracion(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.creaFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.CreaFiltracion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/UpdateDecanting")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<bool> UpdateDecanting(dynamic datos)
        {
            try
            {
                UpdateDecanting_DTO _updateDecanting = new UpdateDecanting_DTO()
                {
                    Cantidad = datos.cantidad != null ? datos.cantidad.ToString() : string.Empty,
                    Material = datos.material != null ? datos.material.ToString() : string.Empty,
                    CantidadDouble = datos.cantidad != null ? double.Parse(datos.cantidad) : 0,
                    Inicio = datos.inicioEstimado != null ? datos.inicioEstimado.ToString() : string.Empty,
                    SourceEquipPK = datos.sourceEquipPK != null ? int.Parse(datos.sourceEquipPK.ToString()) : 0,
                    DestinationEquipPK = datos.DestinationEquipPK != null ? int.Parse(datos.destinationEquipPK.ToString()) : 0,
                    IdOrden = datos.idOrden != null ? datos.idOrden.ToString() : string.Empty,
                };
                return await _iOrden.UpdateDecanting(_updateDecanting);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.creaFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.UpdateDecanting", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/editaFiltracion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<bool> editaFiltracion(dynamic datos)
        {
            try
            {
                UpdateFilter_DTO _data = new UpdateFilter_DTO()
                {
                    Date = datos.fecha != null ? datos.fecha.ToString() : string.Empty,
                    IdOrder = datos.idOrden != null ? datos.idOrden.ToString() : string.Empty,
                    OtherMaterials = datos.otrosMateriales != null ? datos.otrosMateriales.ToObject<dynamic[]>() : null
                };

                return await _iOrden.EditaFiltracion(_data);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.editaFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.EditaFiltracion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }
        [Route("api/editaWOFab")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<ReturnValue> editaWOFab(dynamic datos)
        {
            try
            {
                return await _iOrden.EditaWOFab(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.editaFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.editaWOFab", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }
        [Route("api/eliminarFiltracion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<bool> eliminarFiltracion(dynamic datos)
        {
            try
            {
                return await _iOrden.EliminarFiltracion(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.eliminarFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.EliminarFiltracion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }


        /// <summary>
        /// Metodo para obtener el siguiente numero de coccion disponible
        /// </summary>
        /// <returns></returns>
        [Route("api/ObtenerSiguienteNumeroCoccion/{anyo}/{text}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas)]
        public async Task<int> ObtenerSiguienteNumeroCoccion(int anyo, String text)
        {
            try
            {

                return await _iOrden.ObtenerSiguienteNumeroCoccion(anyo, text);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.ObtenerSiguienteNumeroCoccion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerSiguienteNumeroCoccion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }


        /// <summary>
        /// Funcion que devuelve la lista de ordenes para mostrar en el grid del Listado de WO Activas
        /// </summary>
        /// returns Lista de ordenes
        [Route("api/obtenerTiposOrdenCurvas")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas)]
        public List<OrderType> obtenerTiposOrdenCurvas()
        {
            try
            {
                List<OrderType> ordenes = new List<OrderType>();
                ordenes = DAO_Orden.ObtenerTiposOrdenCurvas();
                return ordenes;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerTiposOrdenCurvas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerTiposOrdenCurvas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO_DE"));
            }
        }

        [Route("api/CurrentBrewNumber/{anyo}/{text}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas)]
        public async Task<String> CurrentBrewNumber(int anyo, String text)
        {
            try
            {
                return await _iOrden.GetOrderIDByDeltav(anyo, text, _sitRTDS);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.CurrentBrewNumber", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.CurrentBrewNumber", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO_DE"));
            }
        }

        [Route("api/ArrancarCrearOrden")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<ReturnValue> ArrancarCrearOrden(dynamic datos)
        {
            try
            {
                return await _iOrden.ArrancarCrearOrden(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.eliminarFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ArrancarCrearOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/CrearOrdenPlanificadaMultiple")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public async Task<ReturnValue> CrearOrdenesPlanificadaMultiple(dynamic Datos)
        {
            try
            {
                return await _iOrden.CrearOrdenesPlanificadaMultiple(Datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.eliminarFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.CrearOrdenesPlanificadaMultiple", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/ObtenerUltimaFechaOrden/{idUbicacion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public async Task<DateTime?> ObtenerUltimaFechaOrden(int idUbicacion)
        {
            try
            {
                DateTime? _result = await _iOrden.ObtenerUltimaFechaOrden(idUbicacion);
                return _result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.eliminarFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerUltimaFechaOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Metodo para obtener la informacion de la orden que se mostrara en el detalle de la pantalla de gestion de ordenes activas
        /// </summary>
        /// <param name="idOrden"></param>
        /// <returns></returns>
        [Route("api/OrdenesFab/ObtenerDetalleOrden/{idOrden}/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<DTO_Orden_Detalle> ObtenerDetalleOrden(int IdOrden, int IdTipoOrden)
        {
            try
            {
                DTO_Orden_Detalle infoOrder = await _iOrden.ObtenerDetalleOrden(IdOrden, IdTipoOrden);

                return infoOrder;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesFabController.ObtenerDetalleOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Funcion que devuelve una lista de los KOPs de la orden activa seleccionada
        /// </summary>
        /// returns Lista de mostos
        [Route("api/OrdenesFab/ObtenerKOPsOrden/{idOrden}/{IdTipoOrdenWO}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos, Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico, Funciones.FAB_PROD_EXE_9_GestionKOPHistorico)]
        public async Task<List<DTO_KOPs>> ObtenerKOPsOrden(int idOrden, int IdTipoOrdenWO)
        {
            try
            {
                List<DTO_KOPs> result = await _iOrden.ObtenerKOPsOrden(idOrden, IdTipoOrdenWO);

                return result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesFabController.ObtenerKOPsOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        /// <summary>
        /// Función que obtiene listado de KOPs de las WO que tengan de estado Consolidando Datos y que la fecha fin real este en el rango de fechas
        /// que además sean editables.
        /// </summary>
        /// returns Lista de mostos
        [Route("api/OrdenesFab/ObtenerKOPsWORevision/")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_21_GestionRevisionKOPsWO, Funciones.FAB_PROD_EXE_21_VisualizacionRevisionKOPsWO)]
        public async Task<IHttpActionResult> ObtenerKOPsWORevision(DateTime fechaDesde, DateTime fechaHasta)
        {
            try
            {
                var _result = await _iOrden.ObtenerKOPsWORevision(fechaDesde, fechaHasta);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesFabController.ObtenerKOPsWORevision", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }
        }

        /// <summary>
        /// Metodo que valida el número segun el tipo de la orden (Mediante formulario)
        /// </summary>
        /// <param name="nTipo"></param>
        /// <param name="Anio"></param>
        /// <param name="IdUbicacion"></param>
        /// <param name="Tipo"></param>
        /// <returns>Devuelve true o false según el resultado</returns>
        [Route("api/OrdenesFab/ValidarNumeroCreacionWOManual/{nTipo}/{Anio}/{IdUbicacion}/{Tipo}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<int> ValidarNumeroCreacionWOManual(int nTipo, int Anio, int IdUbicacion, int Tipo)
        {
            try
            {
                int? result = await _iOrden.ValidarNumeroCreacionOrdenManual(nTipo, Anio, IdUbicacion, Tipo);

                if (result == null)
                {
                    result = (int?)ValidacionNumeroMaxEnum.ERROR;
                }

                return (int)result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ValidarNumeroCreacionWOManual", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Metodo que crea una orden de forma manual (mediante formulario)
        /// </summary>
        /// <param name="Datos">Un listado que tiene informacion de la orden</param>
        /// <returns></returns>
        [Route("api/OrdenesFab/CrearWOManual/")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<bool> CrearWOManual(dynamic Datos)
        {

            try
            {
                var result = await _iOrden.CrearOrdenManual(Datos);


                return result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.CrearWOManual", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Funcion que devuelve la lista de ordenes planificadas segun su tipo
        /// </summary>
        /// returns Lista de ordenes planificadas
        [Route("api/OrdenesFab/ObtenerListadoOrdenPlanificada/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas, Funciones.FAB_PROD_SCH_7_VisualizacionListadoWOPlanificadas)]
        public Task<List<DTO_Orden_Planificada>> ObtenerListadoOrdenPlanificada(int IdTipoOrden)
        {
            try
            {
                Task<List<DTO_Orden_Planificada>> _result = _iOrden.ObtenerListadoOrdenPlanificada(IdTipoOrden);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerListadoOrdenPlanificada", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        /// <summary>
        /// Metodo que crea una orden planificada
        /// </summary>
        /// param name="OrdenPlanificada" Contiene la informacion del formulario en un array dinamico que se leera mas adelante
        [Route("api/CrearOrdenPlanificada/")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<bool> CrearOrdenPlanificada(dynamic OrdenPlanificada)
        {
            try
            {
                bool _result = await _iOrden.CrearOrdenPlanificada(OrdenPlanificada);
                if (_result)
                {
                    _result = await _iOrden.ReplanificarOrdenPlanificadaTrasiego(Convert.ToInt32(OrdenPlanificada.IdSalaUbicacion));
                }
                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.CrearOrdenPlanificada", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Metodo que edita una orden planificada
        /// </summary>
        /// <param name="Datos">Un listado que tiene informacion de la orden</param>
        /// <returns></returns>
        [Route("api/OrdenesFab/EditarOrdenPlanificada/")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<bool> EditarOrdenPlanificada(dynamic OrdenPlanificada)
        {

            try
            {
                bool _result = await _iOrden.EditarOrdenPlanificada(OrdenPlanificada);
                if (_result)
                {
                    _result = await _iOrden.ReplanificarOrdenPlanificadaTrasiego(Convert.ToInt32(OrdenPlanificada.IdSalaUbicacion));
                }

                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.EditarOrdenPlanificada", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Funcion que obtiene una lista de parametros de configuracion de las ordenes
        /// </summary>
        /// returns Lista de ordenes
        [Route("api/OrdenesFab/ObtenerListadoParametrosOrden/")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_7_VisualizacionListadoWOPlanificadas,
            Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public Task<List<DTO_Orden_Planificada_Parametro>> ObtenerListadoParametrosOrden()
        {
            try
            {
                Task<List<DTO_Orden_Planificada_Parametro>> _result = _iOrden.ObtenerListadoParametrosOrden();
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerListadoParametrosOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        /// <summary>
        /// Metodo que edita un parametro de una orden planificada
        /// </summary>
        /// <param name="ParametroOrdenPlanificada">Un listado que tiene informacion del parametro de la orden planificada</param>
        /// <returns></returns>
        [Route("api/OrdenesFab/EditarParametroOrdenPlanificada/")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<bool> EditarParametroOrdenPlanificada(dynamic ParametroOrdenPlanificada)
        {

            try
            {
                var result = await _iOrden.EditarParametroOrdenPlanificada(ParametroOrdenPlanificada);


                return result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.EditarOrdenPlanificada", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Metodo que valida la nueva fecha introducida por tipo de la orden y la sala (mediante formulario)
        /// </summary>
        /// <param name="Datos">Un listado que tiene informacion de la orden</param>
        /// <returns>Retorna un booleano</returns>
        [Route("api/OrdenesFab/ValidarFechaNuevaOrdenPlanificada/")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<bool> ValidarFechaNuevaOrdenPlanificada(dynamic Datos)
        {

            try
            {
                DateTime FechaInicio = Datos.FechaInicio.Value;
                int IdTipoOrden = (int)Datos.IdTipoOrden.Value;
                int IdSala = Convert.ToInt32(Datos.IdSala.Value);

                bool result = await _iOrden.ValidarFechaNuevaOrdenPlanificada(IdTipoOrden, IdSala, FechaInicio.ToString());


                return result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ValidarFechaNuevaWOPlanificada", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Metodo que valida la nueva fecha introducida por tipo de la orden, la sala y por la ID de la Orden (mediante formulario)
        /// </summary>
        /// <param name="Datos">Un listado que tiene informacion de la orden</param>
        /// <returns>Retorna un booleano</returns>
        [Route("api/OrdenesFab/ValidarFechaNuevaOrdenPlanificadaPorIdOrden/")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<bool> ValidarFechaNuevaOrdenPlanificadaPorIdOrden(dynamic Datos)
        {

            try
            {
                DateTime FechaInicio = Datos.FechaInicio.Value;
                int IdTipoOrden = (int)Datos.IdTipoOrden.Value;
                int IdSala = Convert.ToInt32(Datos.IdSala.Value);
                int IdOrden = Convert.ToInt32(Datos.IdOrden.Value);

                bool result = await _iOrden.ValidarFechaNuevaOrdenPlanificadaPorIdOrden(IdTipoOrden, IdSala, FechaInicio.ToString(), IdOrden);


                return result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ValidarFechaNuevaOrdenPlanificadaPorIdOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Metodo que obtiene la ultima fecha de las ordenes de trasiego
        /// </summary>
        /// <param name="idSala"></param>
        /// <param name="IdTipoOrdenWO"></param>
        /// <returns>Ultima fecha</returns>
        [Route("api/ObtenerUltimaFechaOrdenTrasiego/{idSala}/{IdTipoOrdenWO}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas, Funciones.FAB_PROD_SCH_7_VisualizacionListadoWOPlanificadas)]
        public async Task<DateTime?> ObtenerUltimaFechaOrdenTrasiego(int idSala, int IdTipoOrdenWO)
        {
            try
            {
                return await _iOrden.ObtenerUltimaFechaOrdenTrasiego(idSala, IdTipoOrdenWO);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.eliminarFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerUltimaFechaOrdenTrasiego", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Metodo que intercambia las fechas entre las ordenes de origen con el destino
        /// </summary>
        /// <param name="Datos"></param>
        /// <returns></returns>
        [Route("api/IntercambioFechasOrdenOrigenDestino")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public async Task<bool> IntercambioFechasOrdenOrigenDestino(dynamic Datos)
        {
            try
            {
                bool _result = await _iOrden.IntercambioFechasOrdenOrigenDestino(Datos);
                if (_result)
                {
                    _result = await _iOrden.ReplanificarOrdenPlanificadaTrasiego(Convert.ToInt32(Datos.IdZona));
                }
                return _result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrderController.editaFiltracion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.editaWOFab", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Funcion que obtiene los lotes consumidos mediante lote MES de una Orden
        /// </summary>
        /// <returns>Retorna una lista de lotes consumidos</returns>
        [Route("api/OrdenesFab/ObtenerLotesConsumosPorLoteMES/{LoteMES}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public async Task<List<DTO_LoteMMPPFabricacion>> ObtenerLotesConsumosPorLoteMES(string LoteMES)
        {
            try
            {
                List<DTO_LoteMMPPFabricacion> _result = await _iOrden.ObtenerLotesConsumosPorLoteMES(LoteMES);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesConsumosPorLoteMES", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/OrdenesFab/ObtenerLotesConsumosPorIdLotes")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public async Task<dynamic> ObtenerLotesConsumosPorIdLotes([FromBody] List<DTO_LoteMMPPFabricacion> lotes)
        {
            try
            {
                dynamic _result = await _iOrden.ObtenerLotesConsumosPorIdLotes(lotes);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesConsumosPorLoteMES", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/OrdenesFab/ObtenerLotesConsumosFiltracion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public async Task<dynamic> ObtenerLotesConsumosFiltracion([FromBody] List<int> listaIdsLotes)
        {
            try
            {
                if (listaIdsLotes != null && listaIdsLotes.Count() > 0)
                {
                    return await _iOrden.ObtenerLotesConsumosFiltracion(listaIdsLotes);
                }

                return new List<DTO_LoteMMPPFabricacion>();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesConsumosFiltracion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }



        [Route("api/OrdenesFab/ObtenerLotesTransferenciasFiltracion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public async Task<dynamic> ObtenerLotesTransferenciasFiltracion([FromBody] DTO_ListadoIdsLotesFiltracion listadoIds)
        {
            try
            {
                if (listadoIds.ListaIdsLotesConsumos != null && listadoIds.ListaIdsLotesConsumos.Count() > 0 && listadoIds.ListaIdsProducciones != null && listadoIds.ListaIdsProducciones.Count() > 0)
                {
                    return await _iOrden.ObtenerLotesTransferenciasFiltracion(listadoIds);
                }

                return new List<DTO_LoteMMPPFabricacion>();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesTransferenciasFiltracion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        /// <summary>
        /// Funcion que obtiene los lotes producidos mediante lote MES de una Orden
        /// </summary>
        /// <returns>Retorna una lista de lotes producidos</returns>
        [Route("api/OrdenesFab/ObtenerLotesProducidosPorLoteMES/{LoteMES}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public Task<List<DTO_LoteMMPPFabricacion>> ObtenerLotesProducidosPorLoteMES(string LoteMES)
        {
            try
            {
                Task<List<DTO_LoteMMPPFabricacion>> _result = _iOrden.ObtenerLotesProducidosPorLoteMES(LoteMES);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesProducidosPorLoteMES", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        /// <summary>
        /// Funcion que obtiene los lotes producidos mediante Fechas de Inicio y Fin
        /// </summary>
        /// <returns>Retorna una lista de lotes producidos</returns>
        [Route("api/OrdenesFab/ObtenerLotesProducidosFiltracion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public async Task<List<DTO_LoteMMPPFabricacion>> ObtenerLotesProducidosFiltracion(string fechaDesde, string fechaHasta, string idUbicacion)
        {
            try
            {
                List<DTO_LoteMMPPFabricacion> _result = await _iOrden.ObtenerLotesProducidosFiltracion(fechaDesde, fechaHasta, idUbicacion);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesProducidosFiltracion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        /// <summary>
        /// Funcion que obtiene los lotes de consumo mediante Fechas de Inicio y Fin
        /// </summary>
        /// <returns>Retorna una lista de lotes producidos</returns>
        [Route("api/OrdenesFab/ObtenerLotesConsumosFiltracionFechas")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public async Task<dynamic> ObtenerLotesConsumosFiltracionFechas([FromUri] string fechaDesde, string fechaHasta, string idUbicacion)
        {
            try
            {
                var _result = await _iOrden.ObtenerLotesConsumosFiltracionFechas(fechaDesde, fechaHasta, idUbicacion);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesConsumosFiltracionFechas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        /// <summary>
        /// Funcion que obtiene los lotes transferencias mediante Fechas de Inicio y Fin
        /// </summary>
        /// <returns>Retorna una lista de lotes producidos</returns>
        [Route("api/OrdenesFab/ObtenerLotesTransferenciasFiltracionFechas")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public Task<dynamic> ObtenerLotesTransferenciasFiltracionFechas([FromUri] string fechaDesde, string fechaHasta, string idUbicacion)
        {
            try
            {
                var _result = _iOrden.ObtenerLotesTransferenciasFiltracionFechas(fechaDesde, fechaHasta, idUbicacion);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesTransferenciasFiltracionFechas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        /// <summary>
        /// Funcion que obtiene los lotes de transferencia mediante lote MES de una Orden
        /// </summary>
        /// <returns>Retorna una lista de lotes de transferencias</returns>
        [Route("api/OrdenesFab/ObtenerLotesTransferenciasPorLoteMES/{LoteMES}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public Task<List<TransferenciaLoteFabricacionDto>> ObtenerLotesTransferenciasPorLoteMES(string LoteMES)
        {
            try
            {
                Task<List<TransferenciaLoteFabricacionDto>> _result = _iOrden.ObtenerLotesTransferenciasPorLoteMES(LoteMES);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesTransferenciasPorLoteMES", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        /// <summary>
        /// Funcion que devuelve la lista de ordenes para mostrar en el Gantt de programa de envasado
        /// </summary>
        /// param name="filtro" contiene las fechas de inicio y fin del diagrama
        /// returns Lista de ordenes
        [Route("api/OrdenesFab/GetListaOrdenesProgramaFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_9_VerProgFabricacion)]
        public async Task<List<DTO_Orden_Gantt>> GetListaOrdenesProgramaFabricacion(dynamic Fechas)
        {
            try
            {
                DateTime fInicio = ((DateTime)Fechas.FechaInicio.Value).ToLocalTime();
                DateTime fFin = ((DateTime)Fechas.FechaFin.Value).ToLocalTime();
                //return _iOrden.GetListaOrdenesProgramaFabricacion((DateTime)filtro.start.Value, (DateTime)filtro.end.Value);
                List<DTO_Orden_Gantt> result = await _iOrden.GetListaOrdenesProgramaFabricacion(fInicio.ToString(), fFin.ToString());
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerOrdenesPlanificadas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetTodasOrdenesFab", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDENES_PLANIFICADAS"));
            }
        }

        [Route("api/OrdenesFab/ObtenerLotesTransferenciasTrasiegoPorIdWO/{IdWO}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public async Task<dynamic> ObtenerLotesTransferenciasTrasiegoPorIdWO(int IdWO)
        {
            try
            {
                var _result = await _iOrden.ObtenerLotesTransferenciasTrasiegoPorIdWO(IdWO);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesTransferenciasTrasiegoPorIdWO", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/OrdenesFab/ObtenerLotesProducidosTrasiegoPorIdWO/{IdWO}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public Task<List<DTO_Transferencias>> ObtenerLotesProducidosTrasiegoPorIdWO(int IdWO)
        {
            try
            {
                Task<List<DTO_Transferencias>> _result = _iOrden.ObtenerLotesProducidosTrasiegoPorIdWO(IdWO);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesProducidosTrasiegoPorIdWO", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/OrdenesFab/ObtenerLotesConsumoTrasiegoPorIdWO/{IdWO}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_12_VisualizacionMaterialActivos, Funciones.FAB_PROD_EXE_12_VisualizacionMaterialHistorico)]
        public async Task<List<DTO_Transferencias>> ObtenerLotesConsumoTrasiegoPorIdWO(int IdWO)
        {
            try
            {
                List<DTO_Transferencias> _result = await _iOrden.ObtenerLotesConsumoTrasiegoPorIdWO(IdWO);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerLotesConsumoTrasiegoPorIdWO", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/OrdenesFab/EliminarMovimientos")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_18_GestionEliminarMovimientosWO, Funciones.FAB_PROD_EXE_19_GestionRevisionMMPPCoccion)]
        public async Task<bool> EliminarMovimientosOrdenesFabricacion(List<int> idMovimientos)
        {
            try
            {
                bool correcto = await _iOrden.EliminarMovimientosOrdenesFabricacion(idMovimientos);
                return correcto;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesFabController.EliminarMovimientosOrdenesFabricacion", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

    }
}