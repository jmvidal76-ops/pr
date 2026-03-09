using MSM.BBDD.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using MSM.BBDD.LIMS;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.LIMS;

namespace MSM.Controllers.LIMS
{
    public class LIMSController: ApiController
    {
        private IDAO_LIMS _IDAO_Lims;

        public LIMSController(IDAO_LIMS IDAO_Lims)
        {
            _IDAO_Lims = IDAO_Lims;
        }

        /// <summary>
        /// Metodo que obtiene el color e id del estado de LIMs según la orden entrante
        /// </summary>
        /// <param name="loteMES"></param>
        /// <returns>Objeto ClaveValor con el color y el id del estado de la orden</returns>
        [Route("api/LIMS/ObtenerEstadoLIMsDetalleOrden/{loteMES}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionLIMs)]
        public async Task<IHttpActionResult> ObtenerEstadoLIMsDetalleOrden(string loteMES)
        {
            try
            {
                var _result = await _IDAO_Lims.ObtenerEstadoLIMsDetalleOrden(loteMES);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.ObtenerEstadoLIMsDetalleOrden", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        /// <summary>
        /// Metodo que obtiene el color e id del estado de LIMs según la orden entrante, para multiples lotes
        /// </summary>
        /// <param name="lotesMES"></param>
        /// <returns>Listado de Objetos ClaveValor con el color y el id del estado de la orden para cada lote</returns>
        [Route("api/LIMS/ObtenerEstadosLIMsDetalleOrdenMultiple/{lotesMES}")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO)]
        public async Task<IHttpActionResult> ObtenerEstadosLIMsDetalleOrdenMultiple([FromBody] List<string> lotesMES)
        {
            try
            {
                var _result = await _IDAO_Lims.ObtenerEstadosLIMsDetalleOrdenMultiple(lotesMES);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.ObtenerEstadosLIMsDetalleOrdenMultiple", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        /// <summary>
        /// Metodo que obtiene la fecha de la última petición de muestra de un lote
        /// dependeMuestra si es true y se hay resultado de muestra no devuelve nada en fecha ult. peticion, 
        /// si es false se devuelve siempre.
        /// </summary>
        /// <param name="loteMES"></param>
        /// <param name="dependeMuestra"></param>
        /// <returns>la fecha de la última petición de muestra pendiente</returns>
        [Route("api/LIMS/ObtenerFechaUltimaPeticionLIMs/{loteMES}/{dependeMuestra}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionLIMs, Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO, 
            Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas, Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public async Task<IHttpActionResult> ObtenerFechaUltimaPeticionLIMs(string loteMES, bool dependeMuestra)
        {
            try
            {
                var _result = await _IDAO_Lims.ObtenerFechaUltimaPeticionLIMs(loteMES, dependeMuestra);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.ObtenerFechaUltimaPeticionLIMs", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                return BadRequest();
            }          
        }
        
        [Route("api/LIMS/ObtenerMuestrasLIMS/{loteMES}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionLIMs, Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO)]
        public async Task<IHttpActionResult> ObtenerMuestrasLIMSOrden(string loteMES)
        {
            try
            {
                var _result = await _IDAO_Lims.ObtenerMuestrasLIMSOrden(loteMES);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.ObtenerMuestrasLIMSOrden", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/LIMS/ObtenerMuestrasLIMSMultiples")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO, Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas,
                      Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public async Task<IHttpActionResult> ObtenerMuestrasLIMSMultiples([FromBody] List<string> lotesMES)
        {
            try
            {
                var _result = await _IDAO_Lims.ObtenerMuestrasLIMSMultiples(lotesMES);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.ObtenerMuestrasLIMSOrdenMultiple", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/LIMS/obtenerEstadoLIMSdeWOEnvasado")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO)]
        public async Task<IHttpActionResult> obtenerEstadoLIMSdeWOEnvasado([FromUri] string wo)
        {
            try
            {
                var _result = await _IDAO_Lims.obtenerEstadoLIMSdeWOEnvasado(wo);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.obtenerEstadoLIMSdeWOEnvasado", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }        

        /// <summary>
        /// Metodo que obtiene los workflows existentes en MES
        /// </summary>
        /// <returns>La lista de workflows</returns>        
        [Route("api/LIMS/ObtenerWorkflowsLIMS")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionLIMs, Funciones.CEL_7_GestionLanzarMuestraLIMSLlenadoraCELTerminal,
                      Funciones.CEL_8_VisualizacionLanzarMuestraLIMSLlenadoraCELTerminal,
                      Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO,
                      Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas, Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public async Task<IHttpActionResult> ObtenerWorkflowsLIMS()
        {
            try
            {
                var _result = await _IDAO_Lims.ObtenerWorkflowsLIMS();
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.ObtenerWorkflowsLIMS", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        /// <summary>
        /// Metodo que obtiene las configuraciones de  muestras automaticas LIMS
        /// </summary>
        /// <returns>La lista de configuraciones</returns>        
        [Route("api/LIMS/ObtenerConfiguracionMuestrasAutomaticas")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_7_GestionLanzarMuestraLIMSLlenadoraCELTerminal, Funciones.CEL_8_VisualizacionLanzarMuestraLIMSLlenadoraCELTerminal)]
        public async Task<IHttpActionResult> ObtenerConfiguracionMuestrasAutomaticas()
        {
            try
            {
                var _result = await _IDAO_Lims.ObtenerConfiguracionMuestrasAutomaticasWorkflowsLIMS();
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.ObtenerConfiguracionMuestrasAutomaticasWorkflowsLIMS", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }


        /// <summary>
        /// Metodo que obtiene el valor de un parametro en la tabla de parametros generales de LIMS
        /// </summary>
        /// <returns>La lista de configuraciones</returns>        
        [Route("api/LIMS/ObtenerParametroGeneral_LIMS")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_7_GestionLanzarMuestraLIMSLlenadoraCELTerminal, Funciones.CEL_8_VisualizacionLanzarMuestraLIMSLlenadoraCELTerminal,
                      Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO,
                      Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas, Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public async Task<IHttpActionResult> ObtenerParametroGeneral_LIMS(string Clave)
        {
            try
            {
                var _result = await _IDAO_Lims.ObtenerParametroGeneral_LIMS(Clave);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.ObtenerParametroGeneral_LIMS", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        /// <summary>
        /// Metodo que registra una petición de muestra LIMS
        /// </summary>
        /// /// <param name="dto">Objeto PeticionMuestraLIMS con los datos de la peticion</param>
        /// <returns>resultado de la operación</returns>        
        [Route("api/LIMS/PeticionMuestraLIMS")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionLIMs, Funciones.CEL_7_GestionLanzarMuestraLIMSLlenadoraCELTerminal,
                      Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO)]
        public async Task<IHttpActionResult> PeticionMuestraLIMS([FromBody] DTO_PeticionMuestraLIMS dto)
        {
            try
            {
                var _result = await _IDAO_Lims.PeticionMuestraLIMS(dto);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.PeticionMuestraLIMS", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/LIMS/MuestrasLanzadasUltimoDia")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_8_VisualizacionLanzarMuestraLIMSLlenadoraCELTerminal)]
        public async Task<IHttpActionResult> ObtenerMuestrasLanzadasUltimoDia([FromUri] string idLinea)
        {
            try
            {
                var result = await _IDAO_Lims.ObtenerMuestrasLanzadasUltimoDia(idLinea);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LIMSController.ObtenerMuestrasLanzadasUltimoDia", "WEB-LIMS", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_MUESTRAS_LLENADORA"));
            }
        }

        #region Antiguo LIMS

        //[Route("api/LIMS/SamplesType/{subDep}")]
        //[HttpGet]
        //[ApiAuthorize(
        //    Funciones.FAB_PROD_EXE_9_GestionWoActivas,
        //    Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
        //    Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        //public async Task<List<TipoMuestrasDto>> SamplesType(string subDep)
        //{
        //    try
        //    {
        //        List<TipoMuestrasDto> _sample = new List<TipoMuestrasDto>();
        //        if (subDep != "0")
        //        {
        //            var _result = await _IDAO_Lims.GetSampleTypes(subDep);
        //            _sample = _result.Count() > 0 ? _result : _sample;
        //        }
        //        return _sample;
        //    }
        //    catch (Exception ex)
        //    {
        //        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LimsController.SamplesType", "WEB-FABRICACION", "Sistema");
        //        //DAO_Log.registrarLog(DateTime.Now, "LimsController.SamplesType", ex, HttpContext.Current.User.Identity.Name);
        //        throw ex;
        //    }

        //}

        //[Route("api/LIMS/GetSampleDetails/{IdOrder}")]
        //[HttpGet]
        //[ApiAuthorize(
        //    Funciones.FAB_PROD_EXE_9_GestionWoActivas,
        //    Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
        //    Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        //public async Task<List<DetalleMuestraDto>> GetSampleDetails(int IdOrder)
        //{
        //    try
        //    {
        //        List<DetalleMuestraDto> _sample = new List<DetalleMuestraDto>();
        //        var _result = await _IDAO_Lims.GetSampleDetails(IdOrder);
        //        _sample = _result.Count() > 0 ? _result : _sample;

        //        return _sample;

        //    }
        //    catch (Exception ex)
        //    {
        //        //DAO_Log.registrarLog(DateTime.Now, "LimsController.GetSampleDetails", ex, HttpContext.Current.User.Identity.Name);
        //        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LimsController.GetSampleDetails", "WEB-FABRICACION", "Sistema");
        //        throw ex;
        //    }

        //}

        //[Route("api/LIMS/GetSamplesByOrder/{IdOrder}")]
        //[HttpGet]
        //[ApiAuthorize(
        //    Funciones.FAB_PROD_EXE_9_GestionWoActivas,
        //    Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
        //    Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        //public async Task<List<OrdenesMuestrasDto>> GetSamplesByOrder(int IdOrder)
        //{
        //    try
        //    {
        //        List<OrdenesMuestrasDto> _sample = new List<OrdenesMuestrasDto>();
        //        var _result = await _IDAO_Lims.GetSamplesList(IdOrder);
        //            _sample = _result.Count() > 0 ? _result : _sample;

        //       return _sample;
        //    }
        //    catch (Exception ex)
        //    {
        //        //DAO_Log.registrarLog(DateTime.Now, "LimsController.GetSamplesByOrder", ex, HttpContext.Current.User.Identity.Name);
        //        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LimsController.GetSamplesByOrder", "WEB-FABRICACION", "Sistema");
        //        throw ex;
        //    }

        //}

        //[Route("api/LIMS/Create")]
        //[HttpPost]
        //[ApiAuthorize(
        //    Funciones.FAB_PROD_EXE_9_GestionWoActivas,
        //    Funciones.FAB_PROD_EXE_9_GestionHistoricoWO)]
        //public async Task<OrdenesMuestrasDto> Create(OrdenesMuestrasDto dto)
        //{
        //    try
        //    {
        //        OrdenesMuestrasDto _sample = new OrdenesMuestrasDto();
        //        var _result = await _IDAO_Lims.Post(dto);
        //        _sample = _result != null ? _result : _sample;
        //        return _sample;
        //    }
        //    catch (Exception ex)
        //    {
        //        //DAO_Log.registrarLog(DateTime.Now, "LimsController.Create", ex, HttpContext.Current.User.Identity.Name);
        //        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LimsController.Create", "WEB-FABRICACION", "Sistema");
        //        throw ex;
        //    }

        //}

        //[Route("api/LIMS/Departament/{idSampleType}")]
        //[HttpGet]
        //[ApiAuthorize(
        //    Funciones.FAB_PROD_EXE_9_GestionWoActivas,
        //    Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
        //    Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        //public async Task<List<DepartamentoDto>> Departament(int idSampleType)
        //{
        //    try
        //    {
        //        List<DepartamentoDto> _sample = new List<DepartamentoDto>();
        //        var _result = await _IDAO_Lims.GetDepartament(idSampleType);
        //        _sample = _result.Count() > 0 ? _result : _sample;

        //        return _sample;
        //    }
        //    catch (Exception ex)
        //    {
        //        //DAO_Log.registrarLog(DateTime.Now, "LimsController.Departament", ex, HttpContext.Current.User.Identity.Name);
        //        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LimsController.Departament", "WEB-FABRICACION", "Sistema");
        //        throw ex;
        //    }

        //}

        //[Route("api/LIMS/SubDepartament/{department}")]
        //[HttpGet]
        //[ApiAuthorize(
        //    Funciones.FAB_PROD_EXE_9_GestionWoActivas,
        //    Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
        //    Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        //public async Task<List<SubDepartamentoDto>> SubDepartament(string department)
        //{
        //    try
        //    {
        //        List<SubDepartamentoDto> _sample = new List<SubDepartamentoDto>();
        //        var _result = await _IDAO_Lims.GetSubDepartament(department);
        //        _sample = _result.Count() > 0 ? _result : _sample;
        //        return _sample;
        //    }
        //    catch (Exception ex)
        //    {
        //        //DAO_Log.registrarLog(DateTime.Now, "LimsController.SubDepartament", ex, HttpContext.Current.User.Identity.Name);
        //        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LimsController.SubDepartament", "WEB-FABRICACION", "Sistema");
        //        throw ex;
        //    }

        //}

        //[Route("api/LIMS/Destroy/{idSample}")]
        //[HttpDelete]
        //[ApiAuthorize(
        //    Funciones.FAB_PROD_EXE_9_GestionWoActivas,
        //    Funciones.FAB_PROD_EXE_9_GestionHistoricoWO)]
        //public async Task<ReturnValue> Destroy(int idSample)
        //{
        //    try
        //    {
        //        return await _IDAO_Lims.DeleteSample(idSample);
        //    }
        //    catch (Exception ex)
        //    {
        //        //DAO_Log.registrarLog(DateTime.Now, "LimsController.Destroy", ex, HttpContext.Current.User.Identity.Name);
        //        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LimsController.Destroy", "WEB-FABRICACION", "Sistema");
        //        throw ex;
        //    }

        //}

        #endregion
    }
}