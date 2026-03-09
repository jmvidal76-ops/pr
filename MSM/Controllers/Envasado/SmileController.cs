using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.BBDD.Almacen.ControlStock;
using MSM.Mappers.DTO.Envasado;
using Common.Models.Operation;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Threading.Tasks;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class SmileController : ApiController
    {
        private readonly IDAO_Smile _iDAOSmile;
        private readonly IDAO_ControlStock _iDAOControlStock;

        public SmileController(IDAO_Smile iDAO_Smile, IDAO_ControlStock iDAO_ControlStock)
        {
            _iDAOSmile = iDAO_Smile;
            _iDAOControlStock = iDAO_ControlStock;
        }

        [Route("api/ObtenerPeticionesMMPPSmile")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_60_GestionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_60_VisualizacionPeticionesMMPPSmile,
                      Funciones.ENV_PROD_EXE_61_GestionPeticionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_61_VisualizacionPeticionesMMPPSmileTerminal)]
        public async Task<IHttpActionResult> ObtenerPeticionesMMPPSmile(DateTime fechaIni, DateTime fechaFin, string idLinea)
        {
            try
            {
                var _result = await _iDAOSmile.ObtenerPeticionesMMPPSmile(fechaIni, fechaFin, idLinea);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.ObtenerPeticionesMMPPSmile", "WEB-ENVASADO", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/ObtenerPeticionesMMPPSmilePorParametros")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_68_VisualizacionDevolucionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal,
                      Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_67_VisualizacionDevolucionesMMPPSmile)]
        public async Task<IHttpActionResult> ObtenerPeticionesMMPPSmilePorParametros(int idSolicitud, string SSCC, string idLinea, string idMaterial)
        {
            try
            {
                var _result = await _iDAOSmile.ObtenerPeticionesMMPPSmilePorParametros(idSolicitud, SSCC, idLinea, idMaterial);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.ObtenerPeticionesMMPPSmilePorParametros", "WEB-ENVASADO", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/ObtenerSolicitudCompletadaSmile/{idSolicitud}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_60_GestionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_60_VisualizacionPeticionesMMPPSmile,
                      Funciones.ENV_PROD_EXE_61_GestionPeticionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_61_VisualizacionPeticionesMMPPSmileTerminal)]
        public async Task<IHttpActionResult> ObtenerSolicitudCompletadaSmile(int idSolicitud)
        {
            try
            {
                var _result = await _iDAOSmile.ObtenerSolicitudCompletadaSmile(idSolicitud);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.ObtenerSolicitudCompletadaSmile", "WEB-ENVASADO", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/ActualizarEstadoPeticionSmile/{idSolicitud}/{idEstadoSolicitud}")]
        [HttpPatch]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_60_GestionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_61_GestionPeticionesMMPPSmileTerminal)]
        public async Task<IHttpActionResult> ActualizarEstadoPeticionSmile(int idSolicitud, int idEstadoSolicitud)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;
                var _result = await _iDAOSmile.ActualizarEstadoPeticionSmile(idSolicitud, idEstadoSolicitud, usuario);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.ActualizarEstadoPeticionSmile", "WEB-ENVASADO", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/ObtenerStockMMPPSmile")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_62_GestionCreacionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_62_VisualizacionCreacionPeticionesMMPPSmile,
                      Funciones.ENV_PROD_EXE_63_GestionCreacionPeticionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_63_VisualizacionCreacionPeticionesMMPPSmileTerminal,
                      Funciones.ENV_PROD_EXE_64_GestionStockMMPPSmile, Funciones.ENV_PROD_EXE_64_VisualizacionStockMMPPSmile,
                      Funciones.ENV_PROD_EXE_65_GestionStockMMPPSmileTerminal, Funciones.ENV_PROD_EXE_65_VisualizacionStockMMPPSmileTerminal)]
        public async Task<IHttpActionResult> ObtenerStockMMPPSmile(string idProducto, string idLinea, string idMaterial, string idZona, bool agruparMMPP)
        {
            try
            {
                var _result = await _iDAOSmile.ObtenerStockMMPPSmile(idProducto, idLinea, idMaterial, idZona, agruparMMPP);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.ObtenerStockMMPPSmile", "WEB-ENVASADO", "Sistema");
                return BadRequest();
            }
        }


        [Route("api/CrearPeticionesSmile")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_62_GestionCreacionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_63_GestionCreacionPeticionesMMPPSmileTerminal)]
        public async Task<string> CrearPeticionesSmile([FromBody] List<DTO_SolicitudSmile> peticiones)
        {
            string result = "";
            try
            {
                foreach (var peticion in peticiones)
                {
                    peticion.CreadoPor = HttpContext.Current.User.Identity.Name;
                    int Pedir = peticion.Cantidad;
                    int Resto = 0;

                    //Si se piden mas de los disponibles hacemos 2 solicitudes
                    if (peticion.Cantidad > peticion.CantidadDisponible && peticion.EAN != "")
                    {
                        Pedir = peticion.CantidadDisponible;
                        Resto = peticion.Cantidad - Pedir;
                    }

                    //Hacemos Solicitud
                    peticion.Cantidad = Pedir;

                    try
                    {
                        var resultado = await _iDAOSmile.CrearPeticionSmile(peticion);
                        if (resultado.Exception != null || !resultado.Data)
                        {
                            //Si hay error guardamos en cual
                            result += $"\n - {peticion.IdMaterial} - {peticion.DescripcionMaterial}: {peticion.Cantidad} ud.";
                        }
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.CrearPeticionesSmile", "WEB-ENVASADO", "Sistema");
                    }


                    //Si hay Resto hacemos un pedido con EAN = 0
                    if (Resto > 0)
                    {
                        peticion.Cantidad = Resto;
                        peticion.EAN = "";

                        try
                        {
                            var resultado = await _iDAOSmile.CrearPeticionSmile(peticion);
                            if (resultado.Exception != null || !resultado.Data)
                            {
                                //Si hay error guardamos en cual
                                result += $"\n - {peticion.IdMaterial} - {peticion.DescripcionMaterial}: {peticion.Cantidad} ud.";
                            }
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.CrearPeticionesSmile", "WEB-ENVASADO", "Sistema");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Registrar el error en el log
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.CrearPeticionesSmile", "WEB-ENVASADO", "Sistema");
                throw ex;
            }

            await _iDAOSmile.EnviarSolicitudes();

            return result;
        }


        [Route("api/CrearDevolucionesSmile")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal)]
        public async Task<string> CrearDevolucionesSmile([FromBody] List<DTO_DevolucionSmile> peticiones)
        {
            string result = "";
            try
            {
                foreach (var peticion in peticiones)
                {
                    peticion.Solicitud.CreadoPor = HttpContext.Current.User.Identity.Name;

                    //Hacemos Solicitud
                    try
                    {
                        var resultado = await _iDAOSmile.CrearDevolucionesSmile(peticion.Solicitud);
                        if (resultado.Exception == null)
                        {
                            ////Si ha ido bien, ponemos el lote con cantidad 0 para que pase a consumidos
                            //OperationDto datosLote = new OperationDto();
                            //datosLote.IdLote = peticion.Lote;
                            //datosLote.Cantidad = 0;
                            //datosLote.IdUbicacionDestino = null;

                            //var res = await _iDAOControlStock.AjustarCantidadLote(datosLote);
                            //if (!res)
                            //{
                            //    result += $"\n - Error al poner Lote a 0: {datosLote.IdLote}";
                            //}
                        }
                        else
                        {
                            //Si hay error guardamos en cual
                            result += $"\n - {peticion.Solicitud.IdMaterial} - {peticion.Solicitud.DescripcionMaterial}: {peticion.Solicitud.Cantidad} ud.";
                        }
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.CrearDevolucionesSmile", "WEB-ENVASADO", "Sistema");
                    }
                }
            }
            catch (Exception ex)
            {
                // Registrar el error en el log
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.CrearDevolucionesSmile", "WEB-ENVASADO", "Sistema");
                throw ex;
            }

            await _iDAOSmile.EnviarSolicitudes();

            return result;
        }

        [Route("api/ObtenerDatosMaestroClaseSubClaseMMPPUbicacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_68_VisualizacionDevolucionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal)]
        public async Task<IHttpActionResult> ObtenerDatosMaestroClaseSubClaseMMPPUbicacion(string idLinea)
        {
            try
            {
                var _result = await _iDAOSmile.ObtenerDatosMaestroClaseSubClaseMMPPUbicacion(idLinea);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.ObtenerDatosMaestroClaseMMPPUbicacion", "WEB-ENVASADO", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/ObtenerDatosMaestroClaseSubClaseMMPPUbicacionMaterial")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_68_VisualizacionDevolucionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal,
                      Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_67_VisualizacionDevolucionesMMPPSmile,
                      Funciones.ENV_PROD_EXE_62_GestionCreacionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_62_VisualizacionCreacionPeticionesMMPPSmile,
                      Funciones.ENV_PROD_EXE_63_GestionCreacionPeticionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_63_VisualizacionCreacionPeticionesMMPPSmileTerminal)]
        public async Task<IHttpActionResult> ObtenerDatosMaestroClaseSubClaseMMPPUbicacionMaterial(string idLinea, string idMaterial)
        {
            try
            {
                var _result = await _iDAOSmile.ObtenerDatosMaestroClaseSubClaseMMPPUbicacion(idLinea, idMaterial);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Smile - " + ex.Message + " -> " + ex.StackTrace, "SmileController.ObtenerDatosMaestroClaseMMPPUbicacion", "WEB-ENVASADO", "Sistema");
                return BadRequest();
            }
        }
    }
}