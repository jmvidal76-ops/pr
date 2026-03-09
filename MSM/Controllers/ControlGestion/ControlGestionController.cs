using MSM.BBDD.ControlGestion;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.ControlGestion;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.ControlGestion
{
    [Authorize]
    public class ControlGestionController : ApiController
    {
        private readonly IDAO_ControlGestion _iDAOControlGestion;

        public ControlGestionController(IDAO_ControlGestion iDAOControlGestion)
        {
            _iDAOControlGestion = iDAOControlGestion;
        }

        #region Fabricacion

        [Route("api/controlGestion/consumosMMPPCoccion")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_CON_1_VisualizacionConsumoMMPP)]
        public async Task<IHttpActionResult> ObtenerConsumosMMPPCoccion(DateTime fechaDesde, DateTime fechaHasta)
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerConsumosMMPPCoccion(fechaDesde, fechaHasta);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerConsumosMMPPCoccion", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_CONSUMO"));
            }
        }

        [Route("api/controlGestion/revisionMMPPCoccion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_19_VisualizacionRevisionMMPPCoccion, Funciones.FAB_PROD_EXE_20_VisualizacionRevisionLotesMMPPCoccion)]
        public async Task<IHttpActionResult> ObtenerRevisionMMPPCoccion(DateTime fechaDesde, DateTime fechaHasta)
        {
            try
            {
                DTO_RespuestaAPI<List<DTO_RevisionMMPPCoccion>> result = await _iDAOControlGestion.ObtenerRevisionMMPPCoccion(fechaDesde, fechaHasta);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerRevisionMMPPCoccion", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_CONSUMO") + " REVISION");
            }
        }

        [Route("api/controlGestion/coccion")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_COC_1_VisualizacionDatosCoccion)]
        public async Task<IHttpActionResult> ObtenerDatosCoccion(DateTime fechaDesde, DateTime fechaHasta)
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerDatosCoccion(fechaDesde, fechaHasta);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerDatosCoccion", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_COCCIONES"));
            }
        }

        [Route("api/controlGestion/historicoStocks")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_HIS_1_VisualizacionHistoricoStocks)]
        public async Task<IHttpActionResult> ObtenerHistoricoStocks(DateTime fecha)
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerHistoricoStocks(fecha);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerHistoricoStocks", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_HISTORICO_STOCKS"));
            }
        }

        [Route("api/controlGestion/coeficientesCorreccionCoccion")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_COE_1_VisualizacionCoeficientesCorreccion)]
        public async Task<IHttpActionResult> ObtenerCoeficientesCorreccionCoccion()
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerCoeficientesCorreccionCoccion();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerCoeficientesCorreccionCoccion", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_COEFICIENTES_CORRECCION"));
            }
        }

        [Route("api/controlGestion/coeficientesCorreccionHistoricoStocks")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_COE_1_VisualizacionCoeficientesCorreccion)]
        public async Task<IHttpActionResult> ObtenerCoeficientesCorreccionHistoricoStocks()
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerCoeficientesCorreccionHistoricoStocks();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerCoeficientesCorreccionHistoricoStocks", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_COEFICIENTES_CORRECCION"));
            }
        }

        [Route("api/controlGestion/coeficienteCorreccionCoccion")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_COE_1_GestionCoeficientesCorreccion)]
        public async Task<IHttpActionResult> AñadirCoeficienteCorreccionCoccion(DTO_CoefCorreccionCoccion dtoCoeficiente)
        {
            try
            {
                var result = await _iDAOControlGestion.AñadirCoeficienteCorreccionCoccion(dtoCoeficiente);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.AñadirCoeficienteCorreccionCoccion", 
                    "WEB-CONTROL-GESTION", HttpContext.Current.User.Identity.Name);

                return Json(false);
            }
        }

        [Route("api/controlGestion/coeficienteCorreccionHistoricoStocks")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_COE_1_GestionCoeficientesCorreccion)]
        public async Task<IHttpActionResult> AñadirCoeficienteCorreccionHistoricoStocks(DTO_CoefCorreccionHistoricoStocks dtoCoeficiente)
        {
            try
            {
                var result = await _iDAOControlGestion.AñadirCoeficienteCorreccionHistoricoStocks(dtoCoeficiente);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.AñadirCoeficienteCorreccionHistoricoStocks",
                    "WEB-CONTROL-GESTION", HttpContext.Current.User.Identity.Name);

                return Json(false);
            }
        }

        [Route("api/controlGestion/TCPs")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_TCP_1_VisualizacionDatosTCPs)]
        public async Task<IHttpActionResult> ObtenerDatosTCPs(DateTime fechaDesde, DateTime fechaHasta)
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerDatosTCPs(fechaDesde, fechaHasta);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerDatosTCPs", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_TCPS"));
            }
        }

        [Route("api/controlGestion/coeficientesCorreccionTCPs")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_COE_1_VisualizacionCoeficientesCorreccion)]
        public async Task<IHttpActionResult> ObtenerCoeficientesCorreccionTCPs()
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerCoeficientesCorreccionTCPs();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerCoeficientesCorreccionTCPs", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_COEFICIENTES_CORRECCION"));
            }
        }

        [Route("api/controlGestion/coeficienteCorreccionTCPs")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_COE_1_GestionCoeficientesCorreccion)]
        public async Task<IHttpActionResult> AñadirCoeficienteCorreccionTCPs(DTO_CoefCorreccionTCPs dtoCoeficiente)
        {
            try
            {
                var result = await _iDAOControlGestion.AñadirCoeficienteCorreccionTCPs(dtoCoeficiente);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.AñadirCoeficienteCorreccionTCPs",
                    "WEB-CONTROL-GESTION", HttpContext.Current.User.Identity.Name);

                return Json(false);
            }
        }

        [Route("api/controlGestion/consumosMMPP_TCPs")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_CON_3_VisualizacionConsumoMMPP_TCPs)]
        public async Task<IHttpActionResult> ObtenerConsumosMMPP_TCPs(DateTime fechaDesde, DateTime fechaHasta)
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerConsumosMMPP_TCPs(fechaDesde, fechaHasta);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerConsumosMMPP_TCPs", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_CONSUMO"));
            }
        }

        #endregion

        #region Facturacion

        [Route("api/controlGestion/facturacionSubproductos")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAC_SUB_1_VisualizacionFacturacionSubproductos)]
        public async Task<IHttpActionResult> ObtenerFacturacionSubproductos(DateTime? fechaInicio = null, DateTime? fechaFin = null)
        {            
            try
            {
                if (fechaInicio == null || fechaFin == null)
                {
                    return StatusCode(System.Net.HttpStatusCode.MethodNotAllowed);
                }

                DateTime inicio = fechaInicio.Value.Date.ToUniversalTime();
                DateTime fin = fechaFin.Value.AddDays(1).Date.ToUniversalTime();

                if (inicio >= fin)
                {
                    return StatusCode(System.Net.HttpStatusCode.NotAcceptable);
                }

                return Json(await _iDAOControlGestion.ObtenerFacturacionSubproductos(inicio, fin));
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerFacturacionSubproductos", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_FACTURACION_SUBPRODUCTOS"));
            }
        }
        
        [Route("api/controlGestion/EnviarFacturacionSubproductos")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAC_SUB_1_EnvioFacturacionSubproductos)]
        public async Task<IHttpActionResult> EnviarFacturacionSubproductos([FromBody] List<DTO_FacturacionSubproducto> lista)
        {
            try
            {
                foreach(var i in lista)
                {
                    i.Transporte.ActualizadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
                }

                var result = await _iDAOControlGestion.EnviarFacturacionSubproductos(lista);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.EnviarFacturacionSubproductos", "WEB-CONTROL-GESTION", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_ENVIAR_FACTURACION"));
            }
        }
        
        [Route("api/controlGestion/facturacionSubproductosHistorico")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAC_SUB_1_VisualizacionFacturacionSubproductos)]
        public async Task<IHttpActionResult> ObtenerFacturacionSubproductosHistorico(int idTransporte)
        {

            try
            {
                return Json(await _iDAOControlGestion.ObtenerFacturacionSubproductosHistorico(idTransporte));
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerFacturacionSubproductosHistorico", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_FACTURACION_SUBPRODUCTOS_HISTORICO"));
            }
        }

        #endregion

        [Route("api/controlGestion/ComprobarDatosFabJDE")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_COC_1_EnvioDatosCoccionJDE
            , Funciones.CDG_FAB_CON_1_EnvioDatosConsumoMMPPJDE
            , Funciones.CDG_FAB_TCP_1_EnvioDatosTCPJDE
            , Funciones.CDG_FAB_CON_3_EnvioDatosConsumoTCPJDE)]
        public async Task<IHttpActionResult> ComprobarDatosFabJDE([FromUri] DateTime fecha, [FromUri] int tipoDato)
        {
            try
            {
                var result = await _iDAOControlGestion.ComprobarDatosFabJDE(fecha, tipoDato);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ComprobarDatosCoccionJDE", "WEB-CONTROL-GESTION", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_COMPROBAR_COCCIONES_JDE"));
            }
        }

        [Route("api/controlGestion/ComprobarMaterialesJDE")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_CON_1_EnvioDatosConsumoMMPPJDE)]
        public async Task<IHttpActionResult> ComprobarMaterialesJDE([FromBody] List<string> materiales)
        {
            try
            {
                var result = await _iDAOControlGestion.ComprobarMaterialesJDE(materiales);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ComprobarMaterialesJDE", "WEB-CONTROL-GESTION", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_COMPROBANDO_MATERIALES_JDE"));
            }
        }

        [Route("api/controlGestion/ComprobarCoccionesJDE")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_CON_1_EnvioDatosConsumoMMPPJDE)]
        public async Task<IHttpActionResult> ComprobarCoccionesJDE([FromBody] List<int> cocciones)
        {
            try
            {
                var result = await _iDAOControlGestion.ComprobarCoccionesJDE(cocciones);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ComprobarCoccionesJDE", "WEB-CONTROL-GESTION", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_COMPROBANDO_COCCIONES_JDE"));
            }
        }

        [Route("api/controlGestion/EnvioDatosCoccionJDE")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_COC_1_EnvioDatosCoccionJDE)]
        public async Task<IHttpActionResult> EnviarDatosCoccionJDE([FromBody] List<DTO_DatosCoccion> lista, [FromUri] DateTime fecha)
        {
            try
            {
                var result = await _iDAOControlGestion.EnviarDatosCoccionJDE(lista, fecha, HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.EnviarDatosCoccionJDE", "WEB-CONTROL-GESTION", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_ENVIO_COCCIONES_JDE"));
            }
        }
        
        [Route("api/controlGestion/EnvioDatosConsumoMMPPCoccionJDE")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_CON_1_EnvioDatosConsumoMMPPJDE)]
        public async Task<IHttpActionResult> EnviarDatosConsumoMMPPCoccionJDE([FromBody] List<DTO_ConsumoMMPPCoccion> lista, [FromUri] DateTime fecha)
        {
            try
            {
                var result = await _iDAOControlGestion.EnviarDatosConsumoMMPPCoccionJDE(lista, fecha, HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.EnviarDatosConsumoMMPPJDE", "WEB-CONTROL-GESTION", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_ENVIO_CONSUMO_MMPP_JDE"));
            }
        }

        [Route("api/controlGestion/EnvioDatosTCPsJDE")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_TCP_1_EnvioDatosTCPJDE)]
        public async Task<IHttpActionResult> EnviarDatosTCPsJDE([FromBody] List<DTO_HistoricoStocks> lista, [FromUri] DateTime fecha)
        {
            try
            {
                var result = await _iDAOControlGestion.EnviarDatosTCPsJDE(lista, fecha, HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.EnviarDatosTCPsJDE", "WEB-CONTROL-GESTION", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_ENVIO_TCP_JDE"));
            }
        }

        [Route("api/controlGestion/EnvioDatosConsumoMMPPTCPsJDE")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_CON_3_EnvioDatosConsumoTCPJDE)]
        public async Task<IHttpActionResult> EnviarDatosConsumoMMPPTCPsJDE([FromBody] List<DTO_ConsumoMMPP_TCPs> lista, [FromUri] DateTime fecha)
        {
            try
            {
                var result = await _iDAOControlGestion.EnviarDatosConsumoMMPPTCPsJDE(lista, fecha, HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.EnviarDatosConsumoMMPPTCPsJDE", "WEB-CONTROL-GESTION", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_ENVIO_CONSUMO_MMPP_TCP_JDE"));
            }
        }

        #region Ajuste Stock JDE

        /// <summary>
        /// Método que devuelve la configuración de materiales para el ajuste de stock de JDE
        /// </summary>
        /// <returns>Lista con los datos solicitados</returns>
        [Route("api/controlGestion/obtenerConfiguracionMaterialesAjusteStockJDE")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_CON_2_VisualizacionConfiguracionMateriales)]
        public async Task<IHttpActionResult> ObtenerConfiguracionMaterialesAjusteStockJDE()
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerConfiguracionMaterialesAjusteStockJDE();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerConfiguracionMaterialesAjusteStockJDE", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONFIGURACION"));
            }
        }

        /// <summary>
        /// Método que inserta un material para el ajuste de stock de JDE
        /// </summary>
        /// <param name="datos"></param>
        /// <returns>Verdadero si ha ido bien, falso si ha habido error</returns>
        [Route("api/controlGestion/insertarMaterialAjusteStockJDE")]
        [HttpPost]
        [ApiAuthorize(Funciones.CDG_FAB_CON_2_GestionConfiguracionMateriales)]
        public async Task<IHttpActionResult> InsertarMaterialAjusteStockJDE([FromBody] DTO_ConfiguracionMaterialesAjusteStockJDE datos)
        {
            try
            {
                var result = await _iDAOControlGestion.InsertarMaterialAjusteStockJDE(datos);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_GUARDAR") + ". " + ex.Message + " -> " + ex.StackTrace,
                    "ControlGestionController.InsertarMaterialAjusteStockJDE", "WEB-CONTROL-GESTION", HttpContext.Current.User.Identity.Name);
                
                return BadRequest();
            }
        }

        /// <summary>
        /// Método que actualiza un material para el ajuste de stock de JDE
        /// </summary>
        /// <param name="datos"></param>
        /// <returns>Verdadero si ha ido bien, falso si ha habido error</returns>
        [Route("api/controlGestion/actualizarMaterialAjusteStockJDE")]
        [HttpPut]
        [ApiAuthorize(Funciones.CDG_FAB_CON_2_GestionConfiguracionMateriales)]
        public async Task<IHttpActionResult> ActualizarMaterialAjusteStockJDE([FromBody] DTO_ConfiguracionMaterialesAjusteStockJDE datos)
        {
            try
            {
                var result = await _iDAOControlGestion.ActualizarMaterialAjusteStockJDE(datos);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_AL_MODIFICAR_LOS") + ". " + ex.Message + " -> " + ex.StackTrace,
                    "ControlGestionController.ActualizarMaterialAjusteStockJDE", "WEB-CONTROL-GESTION", HttpContext.Current.User.Identity.Name);

                return BadRequest();
            }
        }

        /// <summary>
        /// Método que elimina un registro de materiales para el ajuste de stock de JDE
        /// </summary>
        /// <param name="idConfig"></param>
        /// <returns>Verdadero si ha ido bien, falso si ha habido error</returns>
        [Route("api/controlGestion/eliminarMaterialAjusteStockJDE/{idConfig}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.CDG_FAB_CON_2_GestionConfiguracionMateriales)]
        public async Task<IHttpActionResult> EliminarMaterialAjusteStockJDE([FromUri] int idConfig)
        {
            var result = await _iDAOControlGestion.EliminarMaterialAjusteStockJDE(idConfig);

            if (result)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ControlGestionController.EliminarMaterialAjusteStockJDE",
                    IdiomaController.GetResourceName("ELIMINACION_OK"), HttpContext.Current.User.Identity.Name);
            }
            else
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ELIMINACION_NO_OK"),
                    "ControlGestionController.EliminarMaterialAjusteStockJDE", "WEB-CONTROL-GESTION", HttpContext.Current.User.Identity.Name);
            }

            return Json(result);
        }

        /// <summary>
        /// Método que devuelve los datos para el ajuste de stock
        /// </summary>
        /// <returns>Lista con los datos solicitados</returns>
        [Route("api/controlGestion/obtenerAjusteStock")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_AJU_1_VisualizacionAjusteStock)]
        public async Task<IHttpActionResult> ObtenerAjusteStock()
        {
            try
            {
                var result = await _iDAOControlGestion.ObtenerAjusteStock();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ControlGestionController.ObtenerAjusteStock", "WEB-CONTROL-GESTION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_AJUSTE_STOCK"));
            }
        }

        /// <summary>
        /// Método que actualiza los datos de MMMP y Semielaborados de MES y JDE
        /// </summary>
        /// <returns>Verdadero si ha ido bien, falso si ha habido error</returns>
        [Route("api/controlGestion/actualizarStocksMESJDE")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_AJU_1_VisualizacionAjusteStock)]
        public async Task<IHttpActionResult> ActualizarStocksMESJDE()
        {
            var result = await _iDAOControlGestion.ActualizarStocksMESJDE();

            if (!result)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_ACTUALIZAR_STOCKS"), "ControlGestionController.ActualizarStocksMESJDE", "WEB-CONTROL-GESTION", "Sistema");
            }

            return Json(result);
        }

        #endregion
    }
}