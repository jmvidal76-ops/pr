using MSM.BBDD.Mantenimiento;
using MSM.BBDD.Planta;
using MSM.BBDD.Model;
using MSM.Controllers.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Threading.Tasks;
using MSM.Mappers.DTO.Mantenimiento;
using MSM.Models.Mantenimiento;
using System.Net.Http;
using MSM.BBDD.Envasado;
using MSM.Models.Envasado;
using MSM.Utilidades;
using MSM.RealTime;
using MSM.Mappers.DTO.Envasado;

namespace MSM.Controllers.Mantenimiento
{
    public class SolicitudesIntervencionController : ApiController
    {

        #region TERMINAL

        [Route("api/ObtenerSolicitudesIntervencionTerminal/{linea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_2_VisualizacionSolicitudIntervencionTerminal)]
        public IHttpActionResult ObtenerSolicitudesIntervencionTerminal(string linea)
        {
            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.ObtenerSolicitudesIntervencionTerminal(linea);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_SOLICITUDES_MANTENIMIENTO"));
        }

        [Route("api/CrearSolicitudIntervencionTerminal")]
        [HttpPost]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_2_GestionSolicitudIntervencionTerminal)]
        public IHttpActionResult CrearSolicitudIntervencionTerminal(DTO_SolicitudIntervencion solicitud)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            int newId;
            bool correcto = daoSolicitudes.CrearSolicitudIntervencion(solicitud, out newId);
            string mensaje = "";

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "SolicitudesIntervencionController.CrearSolicitudIntervencionTerminal", IdiomaController.GetResourceName("SE_HA_GUARDADO_SOLICITUD_MANTENIMIENTO").Replace("#ID", newId.ToString()), HttpContext.Current.User.Identity.Name);
            }
            else
            {
                mensaje = IdiomaController.GetResourceName("CREADA_OT_MANTENIMIENTO_SIN_EQUIPO_JDE")
                    .Replace("#NUMOT", newId.ToString())
                    .Replace("#EQUIPO", solicitud.EquipoConstructivo);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2, mensaje, "DAO_SolicitudIntervencion.CrearSolicitudIntervencion", "WEB-MANTENIMIENTO", "Sistema");
            }

            return Json(new { correcto = correcto, mensaje = mensaje });
        }

        [Route("api/CerrarSolicitudIntervencionTerminal")]
        [HttpPost]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_2_GestionSolicitudIntervencionTerminal)]
        public bool CerrarSolicitudIntervencionTerminal(DTO_SolicitudIntervencion solicitud)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            bool correcto = daoSolicitudes.CerrarSolicitudIntervencion(solicitud);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "SolicitudesIntervencionController.CerrarSolicitudIntervencionTerminal", IdiomaController.GetResourceName("SE_HA_CERRADO_SOLICITUD_MANTENIMIENTO").Replace("#ID", solicitud.NumOT.ToString()), HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }

        #endregion TERMINAL

        #region PORTAL

        [Route("api/ObtenerSolicitudesIntervencion")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_1_VisualizacionSolicitudesOTSPortalEnvasado, Funciones.MAN_PROD_SOL_3_VisualizacionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult ObtenerSolicitudesIntervencion([FromUri] string fInicio = null, [FromUri] string fFin = null, [FromUri] bool esEnvasado = true)
        {
            if (fInicio == null || fFin == null)
            {
                return StatusCode(System.Net.HttpStatusCode.MethodNotAllowed);
            }
            DateTime inicio = DateTime.Parse(fInicio).Date.ToUniversalTime();
            // Añadimos un día para que el rango llegue hasta las 00:00 del día siguiente
            DateTime fin = DateTime.Parse(fFin).AddDays(1).Date.ToUniversalTime();

            if (inicio >= fin)
            {
                return StatusCode(System.Net.HttpStatusCode.NotAcceptable);
            }

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();

            var lista = daoSolicitudes.ObtenerSolicitudesIntervencion(inicio, fin, esEnvasado);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_SOLICITUDES_MANTENIMIENTO"));
        }

        [Route("api/SolicitudesMantenimiento/CambiosEstado")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_1_VisualizacionSolicitudesOTSPortalEnvasado, Funciones.MAN_PROD_SOL_3_VisualizacionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult ObtenerCambiosEstadoMantenimiento([FromUri] string fInicio, [FromUri] string fFin, [FromUri] bool esEnvasado = true)
        {
            DateTime inicio = DateTime.Parse(fInicio).Date.ToUniversalTime();
            // Añadimos un día para que el rango llegue hasta las 00:00 del día siguiente
            DateTime fin = DateTime.Parse(fFin).AddDays(1).Date.ToUniversalTime();

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();

            var lista = daoSolicitudes.ObtenerCambiosEstadoMantenimiento(inicio, fin, esEnvasado);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CAMBIOS_ESTADO_MANTENIMIENTO"));
        }

        [Route("api/CrearSolicitudIntervencion")]
        [HttpPost]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_1_GestionSolicitudesOTSPortalEnvasado, Funciones.MAN_PROD_SOL_3_GestionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult CrearSolicitudIntervencion(DTO_SolicitudIntervencion solicitud)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            int newId;
            bool correcto = daoSolicitudes.CrearSolicitudIntervencion(solicitud, out newId);
            string mensaje = "";

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "SolicitudesIntervencionController.CrearSolicitudIntervencion", IdiomaController.GetResourceName("SE_HA_GUARDADO_SOLICITUD_MANTENIMIENTO").Replace("#ID", newId.ToString()), HttpContext.Current.User.Identity.Name);
            }
            else
            {
                mensaje = IdiomaController.GetResourceName("CREADA_OT_MANTENIMIENTO_SIN_EQUIPO_JDE")
                    .Replace("#NUMOT", newId.ToString())
                    .Replace("#EQUIPO", solicitud.EquipoConstructivo);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, mensaje, "SolicitudesIntervencionController.CrearSolicitudIntervencion", "WEB-MANTENIMIENTO", "Sistema");
            }

            return Json(new { correcto = correcto, mensaje = mensaje});
        }

        [Route("api/EditarSolicitudIntervencion")]
        [HttpPost]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_1_GestionSolicitudesOTSPortalEnvasado, Funciones.MAN_PROD_SOL_3_GestionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult EditarSolicitudIntervencion(DTO_SolicitudIntervencion solicitud)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            bool correcto = daoSolicitudes.EditarSolicitudIntervencion(solicitud);
            string mensaje = "";

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "SolicitudesIntervencionController.EditarSolicitudIntervencion", IdiomaController.GetResourceName("SE_HA_EDITADO_SOLICITUD_MANTENIMIENTO").Replace("#ID", solicitud.NumOT.ToString()), HttpContext.Current.User.Identity.Name);
            }
            else
            {
                mensaje = IdiomaController.GetResourceName("EDITADA_OT_MANTENIMIENTO_SIN_EQUIPO_JDE")
                    .Replace("#NUMOT", solicitud.NumOT.ToString())
                    .Replace("#EQUIPO", solicitud.EquipoConstructivo);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, mensaje, "SolicitudesIntervencionController.EditarSolicitudIntervencion", "WEB-MANTENIMIENTO", "Sistema");
            }

            return Json(new { correcto = correcto, mensaje = mensaje });
        }

        [Route("api/CerrarSolicitudIntervencion")]
        [HttpPost]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_1_GestionSolicitudesOTSPortalEnvasado, Funciones.MAN_PROD_SOL_3_GestionSolicitudesOTSPortalFabricacion)]
        public bool CerrarSolicitudIntervencion(DTO_SolicitudIntervencion solicitud)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            bool correcto = daoSolicitudes.CerrarSolicitudIntervencion(solicitud);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "SolicitudesIntervencionController.CerrarSolicitudIntervencion", IdiomaController.GetResourceName("SE_HA_CERRADO_SOLICITUD_MANTENIMIENTO").Replace("#ID", solicitud.NumOT.ToString()), HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }

        [Route("api/Mantenimiento/CalcularT1")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_1_GestionSolicitudesOTSPortalEnvasado, Funciones.MAN_PROD_SOL_3_GestionSolicitudesOTSPortalFabricacion)]
        public bool CalcularT1Mantenimiento(int idSolicitud)
        {

            bool correcto = DAO_SolicitudIntervencion.CalcularTiempoT1(idSolicitud);

            return correcto;
        }

        #region VALIDACION_ARRANQUES

        [Route("api/ConfValidacionArranques")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_VAL_1_VisualizacionValidacionArranque)]
        public IHttpActionResult ObtenerConfValidacionArranques()
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();

            var lista = daoSolicitudes.ObtenerConfValidacionArranque();

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONF_VALIDACION_ARRANQUE"));
        }

        [Route("api/ConfValidacionArranques")]
        [HttpPost]
        [ApiAuthorize(Funciones.MAN_PROD_VAL_1_GestionValidacionArranque)]
        public IHttpActionResult CrearConfValidacionArranques([FromBody] DTO_ConfValidacionArranque item)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();

            string error;

            var result = daoSolicitudes.CrearConfValidacionArranque(item, out error);

            if (result)
            {
                return Ok();
            }

            return BadRequest(error);
        }

        [Route("api/ConfValidacionArranques")]
        [HttpDelete]
        [ApiAuthorize(Funciones.MAN_PROD_VAL_1_GestionValidacionArranque)]
        public IHttpActionResult EliminarConfValidacionArranques([FromBody] DTO_ConfValidacionArranque item)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();

            var result = daoSolicitudes.EliminarConfValidacionArranque(item);

            if (result)
            {
                return Ok();
            }

            return BadRequest();
        }

        [Route("api/ValidacionArranque/check/{OT}")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_VAL_1_VisualizacionValidacionArranque)]
        public IHttpActionResult CheckValidacionArranque([FromUri] int OT)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();

            var validacionRequerida = daoSolicitudes.CheckValidacionArranque(OT);

            DTO_DatosValidacionArranque datosValidacion = null;

            if (validacionRequerida)
            {
                datosValidacion = daoSolicitudes.ObtenerDatosValidacionArranque(OT);                
            }

            return Json(new { ValidacionRequerida = validacionRequerida, DatosValidacion = datosValidacion });
        }

        [Route("api/ValidarArranque")]
        [HttpPost]
        [ApiAuthorize(Funciones.MAN_PROD_VAL_1_GestionValidacionArranque)]
        public IHttpActionResult ValidarArranque([FromBody] DTO_DatosValidacionArranque val)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();

            try
            {
                var result = daoSolicitudes.ValidarArranque(val);

                return Ok();
            }
            catch (Exception)
            {
                return BadRequest();
            }
        }

        #endregion VALIDACION_ARRANQUES

        #endregion PORTAL

        [Route("api/ParosPerdidasOTs")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_1_VisualizacionSolicitudesOTSPortalEnvasado, Funciones.MAN_PROD_SOL_2_VisualizacionSolicitudIntervencionTerminal)]
        public IHttpActionResult ObtenerParosRangoFechas([FromUri] string idLinea, [FromUri] int idSolicitud, [FromUri] string fDesde, [FromUri] string fHasta)
        {
            var daoTurnos = new DAO_Turnos();
            var daoParos = new DAO_ParosPerdidas();
            List<TurnoParo> turnos = new List<TurnoParo>();
            DateTime desde = DateTime.Parse(fDesde).ToUniversalTime();

            var paros = new List<DTO_ParosPerdidas>();

            try
            {
                if (fHasta == null)
                {

                    // Devolvemos los paros del turno actual y del anterior si no tenemos fecha de fin
                    var turnosAux = daoTurnos.ObtenerTurnos(idLinea, desde.AddDays(-1), desde.AddDays(+1));

                    var turnoActual = turnosAux.Find(t => t.inicioLocal <= desde && t.finLocal > desde);
                    var turnoAnterior = turnoActual != null ? turnosAux.FindAll(f => f.finLocal <= turnoActual.inicioLocal).OrderByDescending(d => d.inicioLocal).FirstOrDefault() : null;


                    if (turnoActual != null)
                    {
                        turnos.Add(turnoActual);
                    }
                    if (turnoAnterior != null && turnoAnterior.idTurno != turnoActual.idTurno)
                    {
                        turnos.Add(turnoAnterior);
                    }
                }
                else
                {
                    DateTime hasta = DateTime.Parse(fHasta).ToUniversalTime();
                    var turnosAux = daoTurnos.ObtenerTurnos(idLinea, desde, hasta);

                    turnos.AddRange(turnosAux);
                }

                var lineaObj = PlantaRT.planta.lineas.Find(l => l.id == idLinea);

                // Ordenamos los turnos por fecha, y obtenemos todos los paros entre la fecha de inicio del primer turno
                // y la fecha de fin del último turno
                turnos = turnos.OrderBy(e => e.inicio).ToList();

                if( turnos.Count > 0)
                {
                    var parosAux = DAO_ParosPerdidas.ObtenerParosPerdidasLlenadora(turnos.FirstOrDefault().inicioLocal, turnos.LastOrDefault().finLocal, lineaObj.numLinea, true);
                    paros.AddRange(parosAux.Cast<DTO_ParosPerdidas>());
                }

                //Añadimos los paros asociados a la OT si no están ya incluidos
                var parosAsociados = daoParos.ObtenerParosSolicitudMantenimiento(idSolicitud);

                foreach(var p in parosAsociados)
                {
                    var paro = paros.Find(e => e.Id == p.Id);
                    if (paro == null)
                    {
                        p.Asociado = true;
                        paros.Add(p);
                    }
                    else
                    {
                        paro.Asociado = true;
                    }
                }

                return Json(paros.OrderByDescending(e => e.InicioLocal));
            }
            catch (Exception)
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS_PERDIDAS_TURNO"));
            }
        }

        [Route("api/ParosSolicitudMantenimiento/{idSolicitud}")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_1_VisualizacionSolicitudesOTSPortalEnvasado, Funciones.MAN_PROD_SOL_2_VisualizacionSolicitudIntervencionTerminal)]
        public IHttpActionResult ParosSolicitudMantenimiento(int idSolicitud)
        {
            var daoParos = new DAO_ParosPerdidas();
            var lista = daoParos.ObtenerParosSolicitudMantenimiento(idSolicitud);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_PAROS_ASOCIADOS_MANTENIMIENTO"));
        }

        [Route("api/SolicitudMantenimientoPorParo/{idParo}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_53_VisualizacionAccionesCorrectivasTurno, Funciones.ENV_PROD_EXE_52_GestionAccionesCorrectivasTurno)]
        public IHttpActionResult SolicitudMantenimientoPorParo(int idParo)
        {
            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.ObtenerSolicitudMantenimientoPorParo(idParo);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_OTS_ASOCIADAS_PAROS"));
        }

        [Route("api/AsociarParosMantenimiento/{idSolicitud}")]
        [HttpPost]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_1_GestionSolicitudesOTSPortalEnvasado, Funciones.MAN_PROD_SOL_2_GestionSolicitudIntervencionTerminal)]
        public bool AsociarParosMantenimiento(int idSolicitud, [FromBody] int[] paros)
        {
            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            bool correcto = daoSolicitudes.AsociarParosSolicitudMantenimiento(idSolicitud, new List<int>(paros));

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "SolicitudesIntervencionController.AsociarParosMantenimiento", IdiomaController.GetResourceName("SE_HAN_ASOCIADO_PAROS_MANTENIMIENTO").Replace("#ID", idSolicitud.ToString()), HttpContext.Current.User.Identity.Name);
                // Calculamos el tiempo t1 de la OT tras asociar los paros
                DAO_SolicitudIntervencion.CalcularTiempoT1(idSolicitud);
            }

            return correcto;
        }

        [Route("api/TiposAverias")]
        [HttpGet]
        //[ApiAuthorize(Funciones.MAN_PROD_SOL_1_GestionSolicitudesOTSPortal, Funciones.MAN_PROD_SOL_2_GestionSolicitudIntervencionTerminal)]
        public IHttpActionResult ObtenerTiposAverias()
        {
            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.ObtenerTiposAveria();

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_TIPOS_AVERIAS"));

        }

        [Route("api/SolicitudesAbiertasLinea")]
        [HttpGet]
        //[ApiAuthorize(Funciones.MAN_PROD_SOL_1_VisualizacionSolicitudesOTSPortalEnvasado)]
        public IHttpActionResult ObtenerSolicitudesAbiertasLinea()
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.ObtenerSolicitudesAbiertasLinea();

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_SOLICITUDES_MANTENIMIENTO"));
        }

        #region MAESTROS_FABRICACION

        [Route("api/Mantenimiento/MaestroAreasFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_3_VisualizacionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult ObtenerMaestroAreasFabricacion()
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.ObtenerMaestroAreasFabricacion();

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_AREAS_FABRICACION"));
        }

        [Route("api/Mantenimiento/BuscadorTagFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_3_VisualizacionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult BuscadorTAGMantenimientoFabricacion(string tag = null)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.BuscadorTAGMantenimientoFabricacion(tag);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_BUSCAR_TAG"));
        }

        [Route("api/Mantenimiento/CargarTagFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_3_VisualizacionSolicitudesOTSPortalFabricacion)]
        public async Task<IHttpActionResult> CargarTAGMantenimientoFabricacion(string tag = null)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = await daoSolicitudes.CargarTAGMantenimientoFabricacion(tag);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_CARGAR_TAG"));
        }

        [Route("api/Mantenimiento/MaestroZonasFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_3_VisualizacionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult ObtenerMaestroZonasFabricacion([FromUri] int? idPadre)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.ObtenerMaestroZonasFabricacion(idPadre);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_ZONAS_FABRICACION"));
        }

        [Route("api/Mantenimiento/MaestroEquiposFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_3_VisualizacionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult ObtenerMaestroEquiposFabricacion([FromUri] int? idPadre)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.ObtenerMaestroEquiposFabricacion(idPadre);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_EQUIPOS_FABRICACION"));
        }

        [Route("api/Mantenimiento/MaestroGruposConstructivosFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_3_VisualizacionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult ObtenerMaestroGruposConstructivosFabricacion([FromUri] int? idPadre)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.ObtenerMaestroGruposConstructivosFabricacion(idPadre);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_GRUPOS_CONSTRUCTIVOS_FABRICACION"));
        }

        [Route("api/Mantenimiento/MaestroRepuestosFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.MAN_PROD_SOL_3_VisualizacionSolicitudesOTSPortalFabricacion)]
        public IHttpActionResult ObtenerMaestroRepuestosFabricacion([FromUri] int? idPadre)
        {

            DAO_SolicitudIntervencion daoSolicitudes = new DAO_SolicitudIntervencion();
            var lista = daoSolicitudes.ObtenerMaestroRepuestosFabricacion(idPadre);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_REPUESTOS_FABRICACION"));
        }

        #endregion

    }
}