using MSM.BBDD.Fabricacion;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Models.Fabricacion;
using MSM.Security;
using MSM.Utilidades;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    public class PlanificacionFABController : ApiController
    {
        private readonly IDAO_Planificacion _iDAOPlanificacion;

        public PlanificacionFABController(IDAO_Planificacion iDAOPlanificacion)
        {
            _iDAOPlanificacion = iDAOPlanificacion;
        }

        public string GetJulianoDateFromWeekOfYear(int week, bool newYear)
        {
            int aux2;
            aux2 = newYear ? DateTime.Now.Year + 1 : DateTime.Now.Year;
            DateTime aux = DateTimeFormatInfo.CurrentInfo.Calendar.AddWeeks(new DateTime(aux2, 1, 1), week);
            aux = aux.AddDays(-12);
            return (Convert.ToInt32(string.Format("{0:yy}{1:D3}", aux, aux.DayOfYear)) + 100000).ToString();
        }

        [Route("api/GetHLCoccionByMaterial/{materialID}/{salaCoccion}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas, Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public Double GetHLCoccionByMaterial(String materialID, int salaCoccion)
        {
            try
            {
                return DAO_Orden.ObtenerCantidadPorMaterialUbicacion(materialID, salaCoccion);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlanificacionFABController.GetHLCoccionByMaterial", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.GetHLCoccionByMaterial", "WEB-FABRICACION", "Sistema");
                throw ex;
            }

        }

        [Route("api/GetArticles/{currentWeek}/{startWeek}/{endWeek}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_10_PlanificacionCocciones)]
        public List<PlanificacionCoccionStr> GetArticles(String currentWeek, String startWeek, String endWeek)
        {
            try
            {
                //si la semana inicial o la semana a contemplar son menores a la semana actual, 
                //quiere decir que se está mirando semanas del año siguiente.
                return DAO_Planificacion.SetPlanning(GetJulianoDateFromWeekOfYear(Convert.ToInt32(currentWeek), false),
                    GetJulianoDateFromWeekOfYear(Convert.ToInt32(startWeek), (Convert.ToInt16(startWeek) < Convert.ToInt16(currentWeek) ? true : false)),
                                                     GetJulianoDateFromWeekOfYear(Convert.ToInt32(endWeek), (Convert.ToInt16(endWeek) < Convert.ToInt16(currentWeek) ? true : false)));
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlanificacionFABController.GetArticles", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.GetArticles", "WEB-FABRICACION", "Sistema");
                throw ex;
            }

        }


        [Route("api/UpdatePlanningDatas/{currentWeek}/{startWeek}/{endWeek}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_10_PlanificacionCocciones)]
        public async Task<List<PlanificacionCoccionStr>> UpdatePlanningDatas(String currentWeek, String startWeek, String endWeek)
        {
            try
            {
                //si la semana inicial o la semana a contemplar son menores a la semana actual, 
                //quiere decir que se está mirando semanas del año siguiente.
                return await DAO_Planificacion.SetCompletePlanning(GetJulianoDateFromWeekOfYear(Convert.ToInt32(currentWeek), false),
                    GetJulianoDateFromWeekOfYear(Convert.ToInt32(startWeek), (Convert.ToInt16(startWeek) < Convert.ToInt16(currentWeek) ? true : false)),
                                                     GetJulianoDateFromWeekOfYear(Convert.ToInt32(endWeek), (Convert.ToInt16(endWeek) < Convert.ToInt16(currentWeek) ? true : false)));
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlanificacionFABController.GetArticles", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.UpdatePlanningDatas", "WEB-FABRICACION", "Sistema");
                throw ex;
            }

        }

        [Route("api/SetBeersParameters")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_12_PlanificacionTrasiegos)]
        public ReturnValue SetBeersParametersForDecanting(dynamic item)
        {
            try
            {
                return DAO_Planificacion.SetBeersParametersForDecanting(item);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlanificacionFABController.SetBeersParametersForDecanting", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.SetBeersParametersForDecanting", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
            }
        }

        [Route("api/SetMostosParameters")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_12_PlanificacionTrasiegos)]
        public ReturnValue SetArticlesParametersForDecanting(dynamic item)
        {
            try
            {
                return DAO_Planificacion.SetArticlesParametersForDecanting(item);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlanificacionFABController.SetArticlesParametersForDecanting", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.SetArticlesParametersForDecanting", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
            }
        }

        [Route("api/GetArticlesParametersForDecanting")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_12_PlanificacionTrasiegos)]
        public List<COB_MSM_ArticlesParametersForDecanting> GetArticlesParametersForDecanting()
        {
            try
            {
                return DAO_Planificacion.GetArticlesParametersForDecanting();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlanificacionFABController.GetArticlesParametersForDecanting", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.GetArticlesParametersForDecanting", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
            }
        }

        [Route("api/GetHDBeerParametersForDecanting")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_12_PlanificacionTrasiegos)]
        public List<COB_MSM_HDBeerParametersForDecanting> GetHDBeerParametersForDecanting()
        {
            try
            {
                return DAO_Planificacion.GetHDBeerParametersForDecanting();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlanificacionFABController.GetHDBeerParametersForDecanting", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.GetHDBeerParametersForDecanting", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
            }
        }

        [Route("api/GetPackingArticlesDatasForDecantingPlanning/{value}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_12_PlanificacionTrasiegos)]
        public Dictionary<String, Object> GetPackingArticlesDatasForDecantingPlanning(String value)
        {
            try
            {
                String aux = value.ToString();
                return DAO_Planificacion.GetDatasForDecantingPlanning(DateTime.Parse(aux).ToString());
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlanificacionFABController.GetPackingArticlesDatasForDecantingPlanning", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.GetPackingArticlesDatasForDecantingPlanning", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
            }
        }

        #region AYUDA FILTRACION

        [Route("api/ayudaPlanificacion/filtracion/conexionesTCPsLineas")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_14_VisualizacionAyudaFiltracion)]
        public async Task<IHttpActionResult> ObtenerConexionesTCPsLineas()
        {
            try
            {
                var result = await _iDAOPlanificacion.ObtenerConexionesTCPsLineas();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ObtenerConexionesTCPsLineas", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONEXIONES_TCP_LINEA"));
            }
        }

        [Route("api/ayudaPlanificacion/filtracion/conexionTCPLinea")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_14_GestionAyudaFiltracion)]
        public async Task<IHttpActionResult> ActualizarConexionTCPLinea(DTO_ConexionTCPLinea dto)
        {
            try
            {
                var result = await _iDAOPlanificacion.ActualizarConexionTCPLinea(dto);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ActualizarConexionTCPLinea", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        [Route("api/ayudaPlanificacion/filtracion/configuracion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_14_VisualizacionAyudaFiltracion)]
        public async Task<IHttpActionResult> ObtenerConfiguracionAyudaFiltracion()
        {
            try
            {
                var result = await _iDAOPlanificacion.ObtenerConfiguracionAyudaFiltracion();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ObtenerConfiguracionAyudaFiltracion", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONFIGURACION"));
            }
        }

        [Route("api/ayudaPlanificacion/filtracion/valorConfiguracion")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_14_GestionAyudaFiltracion)]
        public async Task<IHttpActionResult> ActualizarValorConfiguracionAyudaFiltracion(DTO_AyudaPlanificacionConfiguracion dto)
        {
            try
            {
                var result = await _iDAOPlanificacion.ActualizarValorConfiguracionAyudaFiltracion(dto);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace,
                    "PlanificacionFABController.ActualizarValorConfiguracionAyudaFiltracion", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        [Route("api/ayudaPlanificacion/filtracion/datosLineas")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_14_VisualizacionAyudaFiltracion)]
        public async Task<IHttpActionResult> ObtenerFiltracionDatosLineas()
        {
            try
            {
                var result = await _iDAOPlanificacion.ObtenerFiltracionDatosLineas();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ObtenerFiltracionDatosLineas", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_DATOS_CERVEZAS"));
            }
        }

        [Route("api/ayudaPlanificacion/filtracion/merma")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_14_GestionAyudaFiltracion)]
        public async Task<IHttpActionResult> ActualizarMermaFiltracion(dynamic datos)
        {
            try
            {
                DTO_RespuestaAPI<bool> result = await _iDAOPlanificacion.ActualizarMermaFiltracion(datos);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ActualizarMermaFiltracion", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        [Route("api/ayudaPlanificacion/filtracion/datosTotales")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_14_VisualizacionAyudaFiltracion)]
        public async Task<IHttpActionResult> ObtenerFiltracionDatosTotales()
        {
            try
            {
                var result = await _iDAOPlanificacion.ObtenerFiltracionDatosTotales();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ObtenerFiltracionDatosTotales", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_DATOS_CERVEZAS"));
            }
        }

        /// <summary>
        /// Método que actualiza los datos del cálculo de previsión
        /// </summary>
        /// <returns>Verdadero si ha ido bien, falso si ha habido error</returns>
        [Route("api/ayudaPlanificacion/filtracion/calculoPrevision")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_14_GestionAyudaFiltracion)]
        public async Task<IHttpActionResult> ActualizarFiltracionCalculoPrevision()
        {
            try
            {
                var result = await _iDAOPlanificacion.ActualizarFiltracionCalculoPrevision();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ActualizarFiltracionCalculoPrevision", 
                    "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        /// <summary>
        /// Método que comprueba que los datos del cálculo de previsión se hayan actualizado
        /// </summary>
        /// <returns>Verdadero si ha terminado, falso si no</returns>
        [Route("api/ayudaPlanificacion/filtracion/comprobarFinCalculoPrevision")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_14_GestionAyudaFiltracion)]
        public async Task<IHttpActionResult> ComprobarFinFiltracionCalculoPrevision()
        {
            try
            {
                var result = await _iDAOPlanificacion.ComprobarFinFiltracionCalculoPrevision();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ComprobarFinFiltracionCalculoPrevision",
                    "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        #endregion AYUDA FILTRACION

        #region AYUDA PLANIFICACIÓN COCCIÓN

        [Route("api/ayudaPlanificacion/coccion/mermaEnvasado")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ActualizarMermaEnvasadoCoccion(dynamic datos)
        {
            try
            {
                DTO_RespuestaAPI<bool> result = await _iDAOPlanificacion.ActualizarMermaEnvasadoCoccion(datos);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ActualizarMermaEnvasadoCoccion", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        [Route("api/ayudaPlanificacion/coccion/mermaFiltracion")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ActualizarMermaFiltracionCoccion(dynamic datos)
        {
            try
            {
                DTO_RespuestaAPI<bool> result = await _iDAOPlanificacion.ActualizarMermaFiltracionCoccion(datos);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ActualizarMermaFiltracionCoccion", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        [Route("api/ayudaPlanificacion/coccion/mermaFermGuarda")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ActualizarMermaFermGuardaCoccion(dynamic datos)
        {
            try
            {
                DTO_RespuestaAPI<bool> result = await _iDAOPlanificacion.ActualizarMermaFermGuardaCoccion(datos);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ActualizarMermaFermGuardaCoccion", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        [Route("api/ayudaPlanificacion/coccion/coefAumentoVolumen")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ActualizarCoefAumentoVolumenCoccion(dynamic datos)
        {
            try
            {
                DTO_RespuestaAPI<bool> result = await _iDAOPlanificacion.ActualizarCoefAumentoVolumenCoccion(datos);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ActualizarCoefAumentoVolumenCoccion", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        [Route("api/ayudaPlanificacion/coccion/configuracion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_VisualizacionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ObtenerConfiguracionAyudaCoccion()
        {
            try
            {
                var result = await _iDAOPlanificacion.ObtenerConfiguracionAyudaCoccion();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ObtenerConfiguracionAyudaCoccion", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONFIGURACION"));
            }
        }

        [Route("api/ayudaPlanificacion/coccion/valorConfiguracion")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ActualizarValorConfiguracionAyudaCoccion(DTO_AyudaPlanificacionConfiguracion dto)
        {
            try
            {
                var result = await _iDAOPlanificacion.ActualizarValorConfiguracionAyudaCoccion(dto);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, 
                    "PlanificacionFABController.ActualizarValorConfiguracionAyudaCoccion", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        [Route("api/ayudaPlanificacion/coccion/cervEnvasarCervAltaDensidad")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_VisualizacionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ObtenerCoccionCervEnvasarCervAltaDensidad()
        {
            try
            {
                var result = await _iDAOPlanificacion.ObtenerCoccionCervEnvasarCervAltaDensidad();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ObtenerCoccionCervEnvasarCervAltaDensidad", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_DATOS_CERVEZAS"));
            }
        }

        [Route("api/ayudaPlanificacion/coccion/cervAltaDensidadMostoFrio")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_VisualizacionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ObtenerCoccionCervAltaDensidadMostoFrio()
        {
            try
            {
                var result = await _iDAOPlanificacion.ObtenerCoccionCervAltaDensidadMostoFrio();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ObtenerCoccionCervAltaDensidadMostoFrio", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_DATOS_CERVEZAS"));
            }
        }

        [Route("api/ayudaPlanificacion/coccion/mostoFrio")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_VisualizacionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ObtenerCoccionMostoFrio()
        {
            try
            {
                var result = await _iDAOPlanificacion.ObtenerCoccionMostoFrio();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ObtenerCoccionMostoFrio", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_DATOS_CERVEZAS"));
            }
        }

        [Route("api/ayudaPlanificacion/coccion/valorConfiguracion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_VisualizacionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ObtenerValorConfiguracionAyudaCoccion()
        {
            try
            {
                var result = await _iDAOPlanificacion.ObtenerValorConfiguracionAyudaCoccion();

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ObtenerValorConfiguracionAyudaCoccion", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONFIGURACION"));
            }
        }

        /// <summary>
        /// Método que actualiza los datos del cálculo de previsión
        /// </summary>
        /// <returns>Verdadero si ha ido bien, falso si ha habido error</returns>
        [Route("api/ayudaPlanificacion/coccion/calculoPrevision")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public async Task<IHttpActionResult> ActualizarCoccionCalculoPrevision(int numSemanas)
        {
            try
            {
                var result = await _iDAOPlanificacion.ActualizarCoccionCalculoPrevision(numSemanas);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificacionFABController.ActualizarCoccionCalculoPrevision", 
                    "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACT_DATOS"));
            }
        }

        #endregion

    }
}