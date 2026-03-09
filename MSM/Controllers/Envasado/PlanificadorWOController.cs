using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Security;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    public class PlanificadorWOController : ApiController
    {
        private readonly IDAO_PlanificadorWO _iDAOPlanificador;

        public PlanificadorWOController(IDAO_PlanificadorWO iDAOPlanificador)
        {
            _iDAOPlanificador = iDAOPlanificador;
        }

        [Route("api/Planificador/Configuracion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public async Task<IHttpActionResult> ObtenerConfiguracion()
        {
            try
            {
                var result = await _iDAOPlanificador.ObtenerConfiguracion();

                return Json(result);
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_OBTENER_CONFIGURACION"));
            }
        }

        [Route("api/Planificador/Configuracion")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_GestionSecuenciadorWO)]
        public async Task<IHttpActionResult> ActualizarConfiguracion([FromBody] DTO_PlanificadorConfiguracion dto)
        {
            try
            {
                var result = await _iDAOPlanificador.ActualizarConfiguracion(dto);

                return Json(result);
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName(ex.Message));
            }
        }

        [Route("api/Planificador/WOPlanificadasJDE")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public async Task<IHttpActionResult> ObtenerWOPlanificadasJDE()
        {
            try
            {
                var result = await _iDAOPlanificador.ObtenerWOPlanificadasJDE();

                return Json(result);
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_OBTENER_WOPLANIFICADASJDE"));
            }
        }

        [Route("api/Planificador/CargarWOPlanificadasJDE")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public async Task<IHttpActionResult> CargarWOPlanificadasJDE(DateTime fechaIni, DateTime fechaFin)
        {
            try
            {
                string idPlanta = ConfigurationManager.AppSettings["PlantaCod"];
                await _iDAOPlanificador.CargarWOPlanificadasJDE(idPlanta, fechaIni, fechaFin);

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_CARGAR_WOPLANIFICADASJDE"));
            }
        }


        [Route("api/Planificador/WOPlanificadasJDE/Estados")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_GestionSecuenciadorWO)]
        public async Task<IHttpActionResult> ActualizarEstadosWOPlanificadasJDE([FromBody] dynamic body)
        {
            try
            {

                if (await _iDAOPlanificador.ActualizarEstadosWOPlanificadasJDE(body))
                {
                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_CARGAR_WOPLANIFICADASJDE"));
            }
        }

        /// <summary>
        /// Función para procesaro los datos de WOSecuenciadasMES, añade las posibles nuevas WO Manuales, y actualiza los estados
        /// </summary>
        /// <param name="fechaIni">fecha Inicio del rango</param>
        /// <param name="fechaFin">fecha Fin (inclusiva) del rango</param>
        /// <returns></returns>
        [Route("api/Planificador/ProcesarWOSecuenciadasMES")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public async Task<IHttpActionResult> ProcesarWOSecuenciadasMES(DateTime fechaIni, DateTime fechaFin)
        {
            try
            {
                await _iDAOPlanificador.ProcesarWOSecuenciadasMES(fechaIni, fechaFin);

                return Ok();

            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [Route("api/Planificador/WOSecuenciadasMES")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public async Task<IHttpActionResult> ObtenerWOSecuenciadasMES(DateTime fechaIni, DateTime fechaFin, string idLinea = null)
        {
            try
            {
                var resultado = await _iDAOPlanificador.ObtenerWOSecuenciadasMES(fechaIni, fechaFin, idLinea);

                return Json(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_CARGAR_WOSECUENCIADASMES"));
            }
        }

        [Route("api/Planificador/WOSecuenciadasMES")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_GestionSecuenciadorWO)]
        public async Task<IHttpActionResult> CrearWOSecuenciadasMes([FromBody] List<DTO_PlanificadorWOSecuenciadasMES> wo)
        {
            try
            {
                if (await _iDAOPlanificador.CrearWOSecuenciadasMES(wo))
                {
                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("PLANIFICADOR_ERROR_GUARDANDO_WO") + " -> " + ex.StackTrace, "DAO_PlanificadorWO.CrearWOSecuenciadasMES", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_CREAR_WOSECUENCIADASMES"));
            }
        }

        [Route("api/Planificador/WOSecuenciadasMES")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_GestionSecuenciadorWO)]
        public async Task<IHttpActionResult> ActualizarWOSecuenciadasMes(List<DTO_PlanificadorWOSecuenciadasMES> wo)
        {
            try
            {
                if (await _iDAOPlanificador.ActualizarWOSecuenciadasMES(wo))
                {
                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_ACTUALIZAR_WOSECUENCIADASMES"));
            }
        }

        [Route("api/Planificador/WOSecuenciadasMES/borrarLote")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_GestionSecuenciadorWO)]
        public async Task<IHttpActionResult> BorrarLoteWOSecuenciadasMes(List<int> ids)
        {
            try
            {
                if (await _iDAOPlanificador.BorrarWOSecuenciadasMES(ids))
                {
                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_BORRAR_WOSECUENCIADASMES"));
            }
        }

        //[Route("api/Planificador/WOSecuenciadasMES/{id}")]
        //[HttpDelete]
        //[ApiAuthorize(Funciones.ENV_PROD_SCH_1_GestionSecuenciadorWO)]
        //public async Task<IHttpActionResult> BorrarWOSecuenciadasMes(int id)
        //{
        //    try
        //    {
        //        if (await _iDAOPlanificador.BorrarWOSecuenciadaMES(id))
        //        {
        //            return Ok();
        //        }
        //        else
        //        {
        //            return BadRequest();
        //        }                
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_BORRAR_WOSECUENCIADASMES"));
        //    }
        //}

        [Route("api/Planificador/ComprobarExportacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_GestionSecuenciadorWO)]
        public IHttpActionResult ComprobarExportacion() {

            return Ok(_iDAOPlanificador.ComprobarExportacion());
        }

        [Route("api/Planificador/ExportarWO")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_GestionSecuenciadorWO)]
        public IHttpActionResult ExportarWO(DateTime fechaInicio, DateTime fechaFin, string lineas, int semana, int anio)
        {
            if (_iDAOPlanificador.ComprobarExportacion(true))
            {
                // Esta llamada no espera que la exportación termine y devuelve el resultado a la web en el momento
                // El seguimiento del estado de la exportación se realiza mediante eventos de realtime

                // Al ejecutarse en un hilo paralelo no existe el contexto web, por lo que el usuario se pasa directamente para los logs
                string userName = HttpContext.Current.User.Identity.Name;

                Task.Run(() => _iDAOPlanificador.ExportarWOLauncher(fechaInicio, fechaFin, lineas, semana, anio, userName));

                return Ok(true);
            }
            else
            {
                return Ok(false);
            }
        }

        [Route("api/Planificador/DescargarInformePlanificacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_GestionSecuenciadorWO, Funciones.ENV_PROD_SCH_4_VisualizacionDelProgramaDeEnvasado)]
        public async Task<IHttpActionResult> DescargarInformePlanificacion(int semana, int anio, bool borrador = true)
        {
            var result = new { valido = false, msg = IdiomaController.GetResourceName("ERROR_GENERANDO_INFORME_PLANIFICACION") };
            try
            {
                if (await _iDAOPlanificador.GenerarInformePlanificacion(semana, anio, borrador))
                {
                    var datosFichero = new List<string>();

                    var ruta = new DirectoryInfo(DAO_Administracion.ObtenerEnlaceExterno( borrador ? 36 : 5 ));
                    if (!ruta.Exists){
                        ruta.Create();
                    }
                    var files = ruta.GetFiles();
                    if(files.Count() == 0)
                    {
                        return Json(new { valido = false, msg = IdiomaController.GetResourceName("PLANIFICADOR_ERROR_EXPORTAR_INFORME_NO_WOS") });
                    }
                    var fichero = files.Where(x => x.Name.Contains("xlsx")).OrderByDescending(f => f.LastWriteTime).First();
                    var rutaCompleta = Path.Combine(ruta.FullName, fichero.Name);
                    var bytes = File.ReadAllBytes(rutaCompleta);
                    var base64 = Convert.ToBase64String(bytes);

                    datosFichero.Add(base64);
                    datosFichero.Add(fichero.Name);

                    // Borramos el fichero que se acaba de descargar
                    try
                    {
                        File.Delete(rutaCompleta);
                    }
                    catch(Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, "Error eliminando el " + (borrador ? "borrador" : "informe") + " de planificación: " + ex.Message + " => " + ex.StackTrace, "PlanificadorWOController.DescargarInformePlanificacion", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    }

                    return Json(new { valido = true, data = datosFichero });
                }
                else
                {
                    return Json(result);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_GENERANDO_INFORME_PLANIFICACION") +": "+ ex.Message + " => " + ex.StackTrace, "PlanificadorWOController.DescargarInformePlanificacion", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return Json(result);
            }
        }

        [Route("api/Planificador/UltimasProducciones")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public async Task<IHttpActionResult> ObtenerUltimasProduccionesLineas(DateTime fecha)
        {
            try
            {
                var resultado = await _iDAOPlanificador.ObtenerUltimasProduccionesLineas(fecha);

                return Json(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("PLANIFICADOR_ERROR_OBTENIENDO_ULTIMAS_PRODUCCIONES"));
            }
        }

        [Route("api/Planificador/ProductosSIGI")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public async Task<IHttpActionResult> ObtenerProductosSIGI()
        {
            try
            {
                var resultado = await _iDAOPlanificador.ObtenerProductosSIGI();

                return Json(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_PRODUCTOS_SIGI"));
            }
        }

        #region JustificacionesCambiosPlanificacion

        [Route("api/Planificador/JustificacionesCambiosPlanificacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_5_VisualizacionRegistroCambiosPlanificacion, Funciones.ENV_PROD_SCH_5_GestionRegistroCambiosPlanificacion)]
        public async Task<IHttpActionResult> ObtenerJustificacionesCambiosPlanificacion(DateTime? fechaDesde, DateTime? fechaHasta)
        {
            try
            {
                var result = await _iDAOPlanificador.ObtenerJustificacionesCambiosPlanificacion(fechaDesde, fechaHasta);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificadorController.ObtenerJustificacionesCambiosPlanificacion", "WEB-ENVASADO", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_JUSTIFICACION_EXPORTACION"));
            }
        }
  
        [Route("api/Planificador/JustificacionesCambiosPlanificacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_5_GestionRegistroCambiosPlanificacion)]

        public async Task<IHttpActionResult> CrearJustificacionCambioPlanificacion(DTO_PlanificadorJustificacionCambioPlanificacion item)
        {
            try
            {
                item.Creado = HttpContext.Current?.User?.Identity?.Name ?? "Sistema";
                var result = await _iDAOPlanificador.CrearJustificacionCambioPlanificacion(item);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "PlanificadorController.CrearJustificacionCambioPlanificacion", 
                    $"Registro de cambios de planificación; Registro creado; Año: {item.Anio}; Semana: {item.Semana}; Líneas: {string.Join("; ", item.Lineas)}; Motivo: {item.IdMotivo}; Comentario: {item.Comentario}", 
                    HttpContext.Current.User.Identity.Name);

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificadorController.CrearJustificacionCambioPlanificacion", "WEB-ENVASADO", item.Creado);

                return BadRequest(IdiomaController.GetResourceName("ERROR_CREANDO_JUSTIFICACION_EXPORTACION"));
            }
        }
     
        [Route("api/Planificador/JustificacionesCambiosPlanificacion")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_5_GestionRegistroCambiosPlanificacion)]
        public async Task<IHttpActionResult> ActualizarJustificacionCambioPlanificacion(DTO_PlanificadorJustificacionCambioPlanificacion item)
        {
            try
            {
                item.Creado = HttpContext.Current?.User?.Identity?.Name ?? "Sistema";
                var result = await _iDAOPlanificador.ActualizarJustificacionCambioPlanificacion(item);                

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "PlanificadorController.ActualizarJustificacionCambioPlanificacion",
                    $"Registro de cambios de planificación; Registro modificado; Año: {item.Anio}; Semana: {item.Semana}; Línea: {item.Linea}; Motivo: {item.IdMotivo}; Comentario: {item.Comentario}",
                    HttpContext.Current.User.Identity.Name);

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificadorController.ActualizarJustificacionCambioPlanificacion", "WEB-ENVASADO", item.Creado);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ACTUALIZANDO_JUSTIFICACION_EXPORTACION"));
            }
        }
        
        [Route("api/Planificador/JustificacionesCambiosPlanificacion")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_5_GestionRegistroCambiosPlanificacion)]
        public async Task<IHttpActionResult> EliminarJustificacionCambioPlanificacion(DTO_PlanificadorJustificacionCambioPlanificacion item)
        {
            try
            {
                var result = await _iDAOPlanificador.EliminarJustificacionCambioPlanificacion(item);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "PlanificadorController.EliminarJustificacionCambioPlanificacion",
                    $"Registro de cambios de planificación; Registro eliminado; Año: {item.Anio}; Semana: {item.Semana}; Línea: {item.Linea}; Motivo: {item.IdMotivo}; Comentario: {item.Comentario}",
                    HttpContext.Current.User.Identity.Name);

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlanificadorController.EliminarJustificacionCambioPlanificacion", "WEB-ENVASADO", HttpContext.Current?.User?.Identity?.Name ?? "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_ELIMINANDO_JUSTIFICACION_EXPORTACION"));
            }
        }

        #endregion

    }
}