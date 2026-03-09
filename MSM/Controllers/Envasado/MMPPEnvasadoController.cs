using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [RoutePrefix("api/solicitudes-mmpp")]
    public class MMPPEnvasadoController : ApiController
    {
        private readonly IDAO_MMPPEnvasado _dao;
        public MMPPEnvasadoController(IDAO_MMPPEnvasado iDAO_MMPPEnvasado)
        {
            _dao = iDAO_MMPPEnvasado ?? throw new ArgumentNullException(nameof(iDAO_MMPPEnvasado));
        }

        /// <summary>
        /// GET /api/solicitudes-mmpp?fechaIni=...&fechaFin=...&idLinea=...
        /// Listado con filtros por fecha e id de línea.
        /// Contrato: 200 con lista (vacía si no hay resultados).
        /// </summary>
        [HttpGet]
        [Route("")]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_71_GestionPeticionesMMPPEnvasado, Funciones.ENV_PROD_EXE_71_VisualizacionPeticionesMMPPEnvasado)]
        public async Task<IHttpActionResult> GetSolicitudesMMPPEnvasado([FromUri] DateTime fechaIni, [FromUri] DateTime fechaFin, [FromUri] string idLinea, CancellationToken ct)
        {

            if (fechaIni > fechaFin)
                return BadRequest(IdiomaController.GetResourceName("FECHA_INICIAL_SUPERIOR_FINAL"));

            try
            {
                var result = await _dao.ObtenerPeticionesMMPPEnvasado(fechaIni, fechaFin, idLinea, ct);
                if (result.Exception != null) throw result.Exception;

                // devuelven 200 con [] si no hay datos
                return Ok(result.Data ?? new List<DTO_SolicitudMMPPEnvasado>());
            }
            catch (OperationCanceledException)
            {
                return StatusCode((HttpStatusCode)499);
            }
            catch (Exception ex)
            {
                LogError(ex, "MMPPEnvasadoController.GetSolicitudesMMPPEnvasado");
                return Content(HttpStatusCode.InternalServerError, IdiomaController.GetResourceName("ERROR_DATOS_PETICIONES"));
            }
        }


        /// <summary>
        /// GET /api/solicitudes-mmpp/{idSolicitud}
        /// Detalle de la solicitud (completada/enriquecida si ese es el contrato del DAO).
        /// Contrato: 404 si no existe.
        /// </summary>
        [HttpGet]
        [Route("{idSolicitud:int}")]
        /*[ApiAuthorize(Funciones.ENV_PROD_EXE_60_GestionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_60_VisualizacionPeticionesMMPPSmile,
              Funciones.ENV_PROD_EXE_61_GestionPeticionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_61_VisualizacionPeticionesMMPPSmileTerminal)]*/
        public async Task<IHttpActionResult> GetSolicitudCompletadaMMPPEnvasado(int idSolicitud, CancellationToken ct)
        {
            try
            {
                var result = await _dao.ObtenerSolicitudCompletadaMMPPEnvasado(idSolicitud, ct);

                if (result.Exception != null) throw result.Exception;
                if (result.Data == null) return NotFound();

                return Ok(result.Data);
            }
            catch (OperationCanceledException)
            {
                return StatusCode((HttpStatusCode)499);
            }
            catch (Exception ex)
            {
                LogError(ex, "MMPPEnvasadoController.GetSolicitudCompletadaMMPPEnvasado");
                return Content(HttpStatusCode.InternalServerError, IdiomaController.GetResourceName("NO_SE_HA_PODIDO_OBTENER_SOLICITUD"));
            }
        }
        /// <summary>
        /// GET /api/solicitudes-mmpp/search?idSolicitud=...&SSCC=...&idLinea=...&idMaterial=
        /// Obtiene las solicitudes por parametros
        /// </summary>
        [HttpGet]
        [Route("search")]
        /*[ApiAuthorize(Funciones.ENV_PROD_EXE_68_VisualizacionDevolucionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal,
              Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_67_VisualizacionDevolucionesMMPPSmile)]*/
        public async Task<IHttpActionResult> SearchSolicitudes( [FromUri] int idSolicitud, [FromUri] string SSCC, [FromUri] string idLinea, [FromUri] string idMaterial)
        {
            try
            {
                var result = await _dao.ObtenerPeticionesMMPPEnvasadoPorParametros(idSolicitud, SSCC, idLinea, idMaterial);
                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                LogError(ex, "MMPPEnvasadoController.SearchSolicitudes");
                return BadRequest();
            }
        }
        /// <summary>
        /// PUT /api/solicitudes-mmpp/{idSolicitud}/estado
        /// Cambia el estado de la solicitud. Body: { "idEstadoSolicitud": int }
        /// Contrato: 404 si no existe, 200 si se actualiza.
        /// </summary>
        [HttpPut]
        [Route("{idSolicitud:int}/estado")]
        //[ApiAuthorize(Funciones.ENV_PROD_EXE_60_GestionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_61_GestionPeticionesMMPPSmileTerminal)]
        public async Task<IHttpActionResult> PutEstadoMMPPEnvasado(int idSolicitud, [FromBody] DTO_EstadoSolicitud estadoSolicitud, CancellationToken ct)
        {
            try
            {
                if (estadoSolicitud == null)
                    return BadRequest(IdiomaController.GetResourceName("ERROR_FALTA_OBJETO"));

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!EsEstadoSolicitudValido(estadoSolicitud.IdEstadoSolicitud))
                    return BadRequest(IdiomaController.GetResourceName("ESTADO_NO_VALIDO"));

                var usuario = GetUsuario();
                var result = await _dao.ActualizarEstadoPeticionMMPPEnvasado(idSolicitud, estadoSolicitud.IdEstadoSolicitud, usuario, ct);

                if (result.Exception != null) throw result.Exception;
                if (result.Data == false) return NotFound();

                return Ok(result.Data);
            }
            catch (OperationCanceledException)
            {
                return StatusCode((HttpStatusCode)499);
            }
            catch (Exception ex)
            {
                LogError(ex, "MMPPEnvasadoController.PutEstadoMMPPEnvasado");
                return Content(HttpStatusCode.InternalServerError, IdiomaController.GetResourceName("ERROR_ACTUALIZAR_ESTADO"));
            }
        }
        /// <summary>
        /// GET /api/solicitudes-mmpp/stock?... (idProducto, idLinea, idMaterial, idZona, agruparMMPP)        
        /// </summary>
        [HttpGet]
        [Route("stock")]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_72_GestionCreacionPeticionesMMPPEnvasado, Funciones.ENV_PROD_EXE_72_VisualizacionCreacionPeticionesMMPPEnvasado)]
        /*[ApiAuthorize(Funciones.ENV_PROD_EXE_62_GestionCreacionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_62_VisualizacionCreacionPeticionesMMPPSmile,
              Funciones.ENV_PROD_EXE_63_GestionCreacionPeticionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_63_VisualizacionCreacionPeticionesMMPPSmileTerminal,
              Funciones.ENV_PROD_EXE_64_GestionStockMMPPSmile, Funciones.ENV_PROD_EXE_64_VisualizacionStockMMPPSmile,
              Funciones.ENV_PROD_EXE_65_GestionStockMMPPSmileTerminal, Funciones.ENV_PROD_EXE_65_VisualizacionStockMMPPSmileTerminal)]*/
        public async Task<IHttpActionResult> ObtenerStockMMPPEnvasado(
            [FromUri] string idProducto = null, 
            [FromUri]  string idLinea = null, 
            [FromUri]  string idMaterial = null, 
            [FromUri] string idZona = null, 
            [FromUri] bool? agruparMMPP = null, 
            CancellationToken ct = default)
        {
            try
            {
                bool agrupar = agruparMMPP ?? false;

                var result = await _dao.ObtenerStockMMPPEnvasado(idProducto, idLinea, idMaterial, idZona, agrupar, ct);

                if (result.Exception != null) throw result.Exception;

                return Ok(result.Data ?? new List<DTO_StockEnvasado>());
            }
            catch (OperationCanceledException)
            {
                return StatusCode((HttpStatusCode)499);
            }
            catch (Exception ex)
            {
                LogError(ex, "MMPPEnvasadoController.ObtenerStockMMPPEnvasado");
                return Content(HttpStatusCode.InternalServerError, IdiomaController.GetResourceName("ERROR_OBTENER_STOCK"));
            }
        }
        /// <summary>
        /// POST /api/solicitudes-mmpp
        /// Body: List<DTO_SolicitudMMPPEnvasad
        /// </summary>
        [HttpPost]
        [Route("")]
        public async Task<IHttpActionResult> CrearPeticionesEnvasado([FromBody] List<DTO_SolicitudMMPPEnvasado> peticiones, CancellationToken ct)
        {
            try
            {
                if (peticiones == null || peticiones.Count == 0)
                    return BadRequest("No hay peticiones.");

                var usuario = GetUsuario();
                var errores = new List<object>();

                foreach (var p in peticiones)
                {
                    ct.ThrowIfCancellationRequested();

                    var resultado = await ProcesarPeticion(p, usuario, ct);

                    if (!resultado.Ok)
                    {
                        errores.Add(new
                        {
                            p.IdMaterial,
                            p.DescripcionMaterial,
                            p.Cantidad,
                            resultado.Error
                        });
                    }
                }

                return Ok(new
                {
                    total = peticiones.Count,
                    correctas = peticiones.Count - errores.Count,
                    fallidas = errores.Count,
                    errores
                });
            }
            catch (OperationCanceledException)
            {
                return Content(HttpStatusCode.RequestTimeout, "Operación cancelada por el cliente.");
            }
            catch (Exception ex)
            {
                LogError(ex, "MMPPEnvasadoController.CrearPeticionesEnvasado");

                return Content(HttpStatusCode.InternalServerError,"No se ha podido crear las peticiones.");
            }
        }
        [HttpPost]
        [Route("devoluciones")]
        //[ApiAuthorize(Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal)]
        public async Task<IHttpActionResult> CrearDevolucionesMMPPEnvasado([FromBody] List<DTO_DevolucionMMPPEnvasado> peticiones, CancellationToken ct)
        {
            if (peticiones == null || peticiones.Count == 0)
                return BadRequest("No hay devoluciones.");

            string result = "";
            string usuario = GetUsuario();

            try
            {
                foreach (var peticion in peticiones)
                {
                    peticion.Solicitud.CreadoPor = usuario;

                    try
                    {
                        var respuesta = await _dao.CrearDevolucionesMMPPEnvasado(peticion.Solicitud);

                        if (respuesta.Exception != null)
                        {
                            result += $"\n - {peticion.Solicitud.IdMaterial} - {peticion.Solicitud.DescripcionMaterial}: {peticion.Solicitud.Cantidad} ud.";
                        }
                    }
                    catch (Exception ex)
                    {
                        LogError(ex, "MMPPEnvasadoController.CrearDevolucionesMMPPEnvasado");
                        result += $"\n - {peticion.Solicitud.IdMaterial} ERROR interno.";
                    }
                }

                await _dao.EnviarSolicitudes(ct);

                return Ok(new
                {
                    errores = result,
                    ok = string.IsNullOrWhiteSpace(result)
                });
            }
            catch (Exception ex)
            {
                LogError(ex, "MMPPEnvasadoController.CrearDevolucionesMMPPEnvasado");
                return Content(HttpStatusCode.InternalServerError,
                    "No se ha podido crear las devoluciones.");
            }
        }

        private async Task<DTO_ResultadoPeticion> ProcesarPeticion(
            DTO_SolicitudMMPPEnvasado peticion,
            string usuario,
            CancellationToken ct)
        {
            try
            {
                peticion.CreadoPor = usuario;

                int pedir = Math.Min(peticion.Cantidad, peticion.CantidadDisponible);
                int resto = peticion.Cantidad - pedir;

                // Solicitud principal
                peticion.Cantidad = pedir;
                var res1 = await _dao.CrearPeticionMMPPEnvasado(peticion, ct);

                if (res1.Exception != null || res1.Data == false)
                {
                    return new DTO_ResultadoPeticion
                    {
                        Ok = false,
                        Error = "Error al crear la solicitud principal"
                    };
                }

                // Solicitud del resto
                if (resto > 0)
                {
                    peticion.Cantidad = resto;
                    peticion.LoteProveedor = "";

                    var res2 = await _dao.CrearPeticionMMPPEnvasado(peticion, ct);

                    if (res2.Exception != null || res2.Data == false)
                    {
                        return new DTO_ResultadoPeticion
                        {
                            Ok = false,
                            Error = "Error al crear la solicitud del resto"
                        };
                    }
                }

                return new DTO_ResultadoPeticion { Ok = true };
            }
            catch (Exception ex)
            {
                LogError(ex, "MMPPEnvasadoController.ProcesarPeticion");

                return new DTO_ResultadoPeticion
                {
                    Ok = false,
                    Error = "Excepción en ProcesarPeticion: " + ex.Message
                };
            }
        }

        [Route("datos-maestroClasesUbicaciones")]
        [HttpGet]
        /*[ApiAuthorize(Funciones.ENV_PROD_EXE_68_VisualizacionDevolucionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal,
              Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_67_VisualizacionDevolucionesMMPPSmile,
              Funciones.ENV_PROD_EXE_62_GestionCreacionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_62_VisualizacionCreacionPeticionesMMPPSmile,
              Funciones.ENV_PROD_EXE_63_GestionCreacionPeticionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_63_VisualizacionCreacionPeticionesMMPPSmileTerminal)]*/
        public async Task<IHttpActionResult> ObtenerDatosMaestroClasesUbicaciones(string idLinea, string idMaterial, CancellationToken ct)
        {
            try
            {
                var _result = await _dao.ObtenerDatos_MaestroClasesUbicaciones(idLinea, idMaterial, ct);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                LogError(ex, "MMPPEnvasadoController.ObtenerDatosMaestroClasesUbicaciones");                
                return BadRequest();
            }
        }

        private bool EsEstadoSolicitudValido(int estado)
        {
            return estado >= 1; //Falta ajstar a estados
        }

        private string GetUsuario()
        {
            var p = HttpContext.Current?.User ?? Thread.CurrentPrincipal;
            if (p?.Identity?.IsAuthenticated == true)
                return p.Identity.Name;
            return "Sistema";
        }

        private void LogError(Exception ex, string metodo)
        {
            DAO_Log.RegistrarLogBook("WEB-BACKEND",5,1,$"MMPPEnvasado - {ex.Message} -> {ex.StackTrace}",metodo,"WEB-ENVASADO","Sistema");
        }
    }
}