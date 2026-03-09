using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using MSM.RealTime;
using MSM.Utilidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [AllowAnonymous]
    public class VideowallController : ApiController
    {
        private readonly IDAO_Turnos _iDAOTurnos;

        public VideowallController(IDAO_Turnos iDAOTurnos)
        {
            _iDAOTurnos = iDAOTurnos;
        }

        /// <summary>
        /// Obtiene la información del turno de las lineas pasadas como parametros (5 lineas máximo en una pantalla)
        /// </summary>
        /// <param name="lineas">Líneas de las que se quieren conconer los datos del turno</param>
        /// <returns></returns>
        [Route("api/videowall/turnoslineas/{lineas}")]
        [HttpGet]
        public async Task<List<DTO_CuadroMandoPlanta>> ObtenerInfoCuadroMandoVideowall(string lineas)
        {
            try
            {
                return await _iDAOTurnos.ObtenerInfoCuadroMandoVideowall(lineas);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "VideowallController.ObtenerCuadroMandoVideowall", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LINEAS"));
            }
        }

        [Route("api/videowall/obtenerPantallasVideowall")]
        [HttpGet]
        public List<VideowallPantallas> ObtenerPantallasVideowall()
        {
            try
            {
                DAO_Planta daoPlanta = new DAO_Planta();
                List<VideowallPantallas> lstVideowall = daoPlanta.ObtenerPantallasVideowall();
                return lstVideowall;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "VideoWallController.ObtenerPantallasVideowall", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }
        /// <summary>
        /// Metodo que se le pasa la idpantalla para obtener un listado de lineas
        /// </summary>
        /// <param name="idPantalla"></param>
        /// <returns>Metodo que retorna un listado de lineas del videowall</returns>
        [Route("api/videowall/ObtenerInformacionLineaVideowall/{idPantalla}")]
        [HttpGet]
        public List<DTO_Videowall> ObtenerInformacionLineaVideowall(int idPantalla)
        {
            try
            {
                DAO_Planta daoPlanta = new DAO_Planta();
                List<DTO_Videowall> lstLineas = daoPlanta.ObtenerInformacionLineaVideowall(idPantalla);
                return lstLineas;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "VideoWallController.ObtenerLineasPantalla", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/videowall/getServerDateTime")]
        [HttpGet]
        public DateTime getServerDateTime()
        {
            try
            {
                return DateTime.Now;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "obtenerPantallasVideowall", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "VideoWallController.getServerDateTime", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PANTALLAS"));
            }
        }

        [Route("api/videowall/rendimientoTurnos/{idLinea}")]
        [HttpGet]
        [AllowAnonymous]
        public IHttpActionResult ObtenerPantallaRendimientoTurnos(string idLinea)
        {
            try
            {
                // Primero obtenemos los turnos de hoy en la línea específicada
                var hoy = DateTime.Now;

                DAO_Turnos daoTurnos = new DAO_Turnos();
                List<Turno> turnos = daoTurnos.ObtenerTurnosLineaDia(idLinea, hoy);

                // Obtenemos los datos de rendimiento del turno en el que nos encontremos
                var turno = turnos.Find(t => t.inicioLocal.Ticks <= hoy.Ticks && hoy.Ticks < t.finLocal.Ticks);
                RendimientoTurno rendimiento = null;

                if (turno != null)
                {
                    rendimiento = daoTurnos.ObtenerDatosCurvaRendimiento(idLinea, turno.idTurno);
                }

                return Json(new { turno = turno, datos = rendimiento });
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "obtenerPantallasVideowall", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "VideoWallController.ObtenerPantallaRendimientoTurnos", "WEB-ENVASADO", "Sistema");
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PANTALLAS"));
            }
        }

        [Route("api/videowall/OEEFabrica")]
        [HttpGet]
        [AllowAnonymous]
        public IHttpActionResult ObtenerPantallaOEEFabrica(DateTime desde, DateTime hasta)
        {

            return Json(DAO_Planta.ObtenerOEEFabrica(desde, hasta));
        }

        [Route("api/videowall/ObtenerLineas")]
        [HttpGet]
        [AllowAnonymous]
        public List<SIGI_Configuracion> ObtenerLineas()
        {
            try
            {
                DAO_Sigi daoSigi = new DAO_Sigi();
                var lista = daoSigi.ObtenerLineas();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "VIDEOWALL-SIGI - " + ex.Message + " -> " + ex.StackTrace, "VideoWallController.ObtenerLineas", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/videowall/ObtenerInfoTrenes/{idEtiquetaSIGI}")]
        [HttpGet]
        [AllowAnonymous]
        public List<string> ObtenerInfoTrenes(int idEtiquetaSIGI)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var info = daoSigi.ObtenerInfoTrenes(idEtiquetaSIGI);

            return info;
        }
    }
    }