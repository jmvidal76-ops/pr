using BreadMES.Envasado;
using Common.Models.Planta;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.Models.Planta;
using MSM.RealTime;
using MSM.Security;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Web;
using System.Web.Http;
using System.Web.Security;
using P = MSM.Models.Planta;

namespace MSM.Controllers.Planta
{

    public class PlantaController : ApiController
    {
       // [HasPermission("permisoB")]

        public Microsoft.AspNet.SignalR.IHubContext hub = Microsoft.AspNet.SignalR.GlobalHost.ConnectionManager.GetHubContext<MSMHub>();
        [Route("api/planta/avisoCierre")]
        [HttpGet]
        public bool obtenerAvisoCierre()
        {
            return (ConfigurationManager.AppSettings["AVISO_CIERRE"] == "true");
        }

        [Route("api/planta/estadoDatos")]
        [HttpGet]
        public bool estadoDatos()
        {
            return PlantaRT.datosOk;
        }

        [Route("api/planta/configuracion")]
        [HttpGet]
        public P.Planta cargarPlanta()
        {
            return PlantaRT.planta;
        }

        [Route("api/planta/turnos")]
        [HttpGet]
        public List<Turno> cargarTurnos()
        {
            return PlantaRT.planta.turnoActual;
        }

        [Route("api/planta/turno/{idLinea}")]
        [HttpGet]
        public List<Turno> cargarTurnoLinea(string idLinea)
        {
            return PlantaRT.planta.turnoActual.FindAll(t => t.linea.id == idLinea);
        }

        [Route("api/planta/servidores")]
        [HttpGet]
        public JObject getServidores()
        {
            dynamic servidor = new JObject();
            servidor["servidorReportingInterspec"] = ConfigurationManager.AppSettings["servidorReportingInterspec"].ToString();
            servidor["servidorReportingMES"] = ConfigurationManager.AppSettings["servidorReportingMES"].ToString();

            return servidor;
        }

        /// <summary>
        /// Controla el cambio de puesto para un usuario de la aplicación terminal
        /// </summary>
        /// <param name="sesion">La variable sesión con la nueva linea y zona a la que cambia el usuario</param>
        /// <returns>Validación de la operación</returns>        
        [HttpPost]
        [Route("api/actualizarDatosSesion")]
        public Sesion actualizarDatosSesion(Sesion sesion)
        {
            if (sesion == null)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2, "La sesión enviada es null", "PlantaController.actualizarDatosSesion", "WEB-PLANTA", "Sistema");
                return null;
            }

            try
            {
                // Validaciones básicas
                if (string.IsNullOrEmpty(sesion.usuario) ||
                    sesion.linea == null || string.IsNullOrEmpty(sesion.linea.id) ||
                    sesion.zona == null || string.IsNullOrEmpty(sesion.zona.id))
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                        $"Datos insuficientes en la sesión: Usuario: {sesion.usuario ?? "null"}, Línea ID: {sesion.linea?.id ?? "null"}, Zona ID: {sesion.zona?.id ?? "null"}",
                        "PlantaController.actualizarDatosSesion", "WEB-PLANTA", sesion.usuario ?? "Sistema");
                    return null;
                }

                // Verificamos que el usuario exista en la lista
                if (!PlantaRT.usuarios.ContainsKey(sesion.usuario) || PlantaRT.usuarios[sesion.usuario] == null)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                        $"No se encontró una sesión activa para el usuario: {sesion.usuario}",
                        "PlantaController.actualizarDatosSesion", "WEB-PLANTA", "Sistema");
                    return null;
                }

                Sesion oldSesion = PlantaRT.usuarios[sesion.usuario] as Sesion;

                if (oldSesion == null)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                        $"Error al convertir la sesión para el usuario: {sesion.usuario}",
                        "PlantaController.actualizarDatosSesion", "WEB-PLANTA", "Sistema");
                    return null;
                }

                // Buscamos la línea
                if (PlantaRT.planta?.lineas == null)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                        "La lista de líneas de planta no está inicializada.",
                        "PlantaController.actualizarDatosSesion", "WEB-PLANTA", sesion.usuario);
                    return null;
                }

                var lineaEncontrada = PlantaRT.planta.lineas.Find(linea => linea.id == sesion.linea.id);
                if (lineaEncontrada == null)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                        $"No se encontró la línea con id: {sesion.linea.id}",
                        "PlantaController.actualizarDatosSesion", "WEB-PLANTA", sesion.usuario);
                    return null;
                }

                var zonaEncontrada = lineaEncontrada.zonas?.Find(zona => zona.id == sesion.zona.id);
                if (zonaEncontrada == null)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                        $"No se encontró la zona con id: {sesion.zona.id} en la línea {sesion.linea.id}",
                        "PlantaController.actualizarDatosSesion", "WEB-PLANTA", sesion.usuario);
                    return null;
                }

                // Actualizamos
                oldSesion.linea = lineaEncontrada;
                oldSesion.zona = zonaEncontrada;

                return oldSesion;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2,
                    $"{ex.Message} -> {ex.StackTrace}",
                    "PlantaController.actualizarDatosSesion", "WEB-PLANTA", sesion.usuario ?? "Sistema");

                throw new Exception(IdiomaController.GetResourceName("ERROR_ACTUALIZANDO_DATOS"));
            }
        }


        [Route("api/planta/comprobarSesionActiva/{usuario}")]
        [HttpGet]
        public JObject comprobarSesionActiva(string usuario)
        {
            dynamic data = new JObject();
            HttpCookie authCookie = HttpContext.Current.Request.Cookies[FormsAuthentication.FormsCookieName];

            if (authCookie != null)
            {
                string encTicket = authCookie.Value;

                if (!String.IsNullOrEmpty(encTicket))
                {
                    // decrypt the ticket if possible.
                    FormsAuthenticationTicket ticket = FormsAuthentication.Decrypt(encTicket);

                    data["activa"] = !ticket.Expired;
                    if (!ticket.Expired)
                    {
                        DateTime dtNow = DateTime.Now;
                        data["miliseconds"] = ticket.Expiration.Subtract(dtNow).TotalMilliseconds + 1000;
                    }                                       
                }
            }
            else
            {
                PlantaRT.usuarios.Remove(usuario);
            }
            return data;
        }

        [Route("api/planta/getTiempoSesion")]
        [HttpGet]
        public double getTiempoSesion()
        {
            return FormsAuthentication.Timeout.TotalMilliseconds + 1000;
        }

        [Route("api/planta/getSesionExpirateDate")]
        [HttpGet]
        public JObject getSesionExpirateDate()
        {
            dynamic data = new JObject();
            HttpCookie authCookie = HttpContext.Current.Request.Cookies[FormsAuthentication.FormsCookieName];

            if (authCookie != null)
            {
                string encTicket = authCookie.Value;

                if (!String.IsNullOrEmpty(encTicket))
                {
                    // decrypt the ticket if possible.
                    FormsAuthenticationTicket ticket = FormsAuthentication.Decrypt(encTicket);

                    data["activa"] = !ticket.Expired;
                    if (!ticket.Expired)
                    {
                        DateTime dtNow = DateTime.Now;
                        data["miliseconds"] = ticket.Expiration;
                    }
                }
            }
            
            return data;
        }

        [Route("api/planta/getClientIp")]
        [HttpGet]
        public string getClientIp()
        {
            return HttpContext.Current.Request.UserHostAddress;
        }

        [Route("api/planta/crearZonasCompartidas")]
        [HttpGet]
        public bool crearZonasCompartidas()
        {

            return ZonasBread.CrearZonasCompartidas(PlantaRT.planta.nombre);
        }

        /// <summary>
        /// Manda el mensaje del log out de todos los usuarios conectados
        /// </summary>
        /// <returns>Validación del logout</returns>        
        [HttpGet]
        [Route("api/eventoCerrarSesionUsuarios")]
        public bool eventoCerrarSesionUsuarios()
        {
            try
            {
                hub.Clients.All.cerrarSesionUsuarios();
                return true;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "eventoCerrarSesionUsuarios.logout", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PlantaController.eventoCerrarSesionUsuarios", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_APLICACION"));
            }

        }

        [Route("api/planta/pruebaBreak")]
        [HttpGet]
        public void pruebaBreak()
        {
            CalendarioBread.getBreak();
        }

        [Route("api/planta/eliminarHistorico/{orden}")]
        [HttpGet]
        public bool eliminarHistorico(string orden)
        {
            return ContingenciaBread.EliminarHistorico(orden);
        }

        [Route("api/planta/estadoJobsProgramador")]
        [HttpGet]
        public IHttpActionResult EstadoJobsProgramador()
        {
            var jobs = PlantaRT.programadorPlantaRT.ComprobarJobs();
            return Json(jobs);
        }

        [Route("api/planta/ProgramadorMSM/estado")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_TT_6_VisualizacionPerroGuardian)]
        public IHttpActionResult EstadoProgramadorMSM(string nombreTarea)
        {
            if (String.IsNullOrEmpty(nombreTarea))
            {
                var estados = PlantaRT.programadorPlantaRT_MSM.ObtenerEstadosTarea();
                return Json(estados);
            }
            else 
            {
                var estados = PlantaRT.programadorPlantaRT_MSM.ObtenerEstadoTarea(nombreTarea);
                return Json(estados);
            }            
        }

        [Route("api/planta/ProgramadorMSM/cambiarIntervalo")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_TT_6_VisualizacionPerroGuardian)]
        public IHttpActionResult CambiarIntervaloProgramadorMSM(string nombreTarea, int nuevoIntervalo, bool ejecutarYa)
        {
            try
            {
                if (!String.IsNullOrEmpty(nombreTarea))
                {
                    PlantaRT.programadorPlantaRT_MSM.CambiarIntervaloTarea(nombreTarea, nuevoIntervalo, ejecutarYa);
                    return Ok();
                }

                return NotFound();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("api/planta/ProgramadorMSM/cambiarTarea")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_TT_6_VisualizacionPerroGuardian)]
        public IHttpActionResult CambiarTareaProgramadorMSM(string nombreTarea, AccionesTareaEnum accion)
        {
            try
            {
                if (!String.IsNullOrEmpty(nombreTarea))
                {
                    switch (accion)
                    {
                        case AccionesTareaEnum.Pausar:
                            PlantaRT.programadorPlantaRT_MSM.PausarTarea(nombreTarea);
                            break;
                        case AccionesTareaEnum.Reanudar:
                            PlantaRT.programadorPlantaRT_MSM.ReanudarTarea(nombreTarea);
                            break;
                        case AccionesTareaEnum.Eliminar:
                            PlantaRT.programadorPlantaRT_MSM.EliminarTarea(nombreTarea);
                            break;
                        case AccionesTareaEnum.EjecutarAhora:
                            PlantaRT.programadorPlantaRT_MSM.EjecutarTareaAhora(nombreTarea);
                            break;
                    }

                    return Ok();
                }

                return NotFound();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //[Route("api/planta/activarLogsProgramador")]
        //[HttpGet]
        //public IHttpActionResult ActivarLogsProgramador(bool activar)
        //{
        //    PlantaRT.logsProgramador = activar;
        //    return Json(activar);
        //}

        [Route("api/planta/activarLogTriggers")]
        [HttpGet]
        public IHttpActionResult ActivarLogTriggers(int? tipoTrigger = null, bool? activar = null)
        {
            if (tipoTrigger == null) 
            { 
                return Json(TipoEnumProcesoPerroGuardianExtensions.GetTriggersInfo()); 
            }

            if (tipoTrigger == 0)
            {
                PlantaRT.activarLogCambioEstadoOrdenes = activar ?? false;
                PlantaRT.activarLogCambioEstadoMaquinas = activar ?? false;
                PlantaRT.activarLogOrdenesPausadasFinalizadas = activar ?? false;
                PlantaRT.activarLogDatosProduccionCambiosTurno = activar ?? false;
                PlantaRT.activarLogVideowall = activar ?? false; 
                PlantaRT.activarLogCambioALT = activar ?? false;
                PlantaRT.activarLogTiemposParosMaquina = activar ?? false;
                PlantaRT.activarLogEnvasesLlenadora = activar ?? false;
            }
            else 
            {
                switch ((TipoEnumProcesoPerroGuardian) tipoTrigger)
                {
                    case TipoEnumProcesoPerroGuardian.CambioEstadoOrden:
                        PlantaRT.activarLogCambioEstadoOrdenes = activar ?? false;
                        break;
                    case TipoEnumProcesoPerroGuardian.CambioEstadoMaquina:
                        PlantaRT.activarLogCambioEstadoMaquinas = activar ?? false;
                        break;
                    case TipoEnumProcesoPerroGuardian.ActualizarProduccionPausadasFinalizadas:
                        PlantaRT.activarLogOrdenesPausadasFinalizadas = activar ?? false;
                        break;
                    case TipoEnumProcesoPerroGuardian.ActualizarProduccionYCambioTurno:
                        PlantaRT.activarLogDatosProduccionCambiosTurno = activar ?? false;
                        break;
                    case TipoEnumProcesoPerroGuardian.ActualizarVideowall:
                        PlantaRT.activarLogVideowall = activar ?? false;
                        break;
                    case TipoEnumProcesoPerroGuardian.CambioTriggersALT:
                        PlantaRT.activarLogCambioALT = activar ?? false;
                        break;
                    case TipoEnumProcesoPerroGuardian.TiempoParosMaquina:
                        PlantaRT.activarLogTiemposParosMaquina = activar ?? false;
                        break;
                    case TipoEnumProcesoPerroGuardian.ProduccionEnvasesLlenadora:
                        PlantaRT.activarLogEnvasesLlenadora = activar ?? false;
                        break;
                    default:
                        break;
                }
            }

            return Json(activar ?? false);
        }

        [Route("api/planta/comprobarNuevasMMPPSinPropiedades")]
        [HttpGet]
        public bool HayNuevaMMPPSinPropiedades()
        {
            return DAO_Planta.HayNuevaMMPPSinPropiedades(); 
        }

        [Route("api/ObtenerMensajeAdministracion")]
        [HttpGet]
        public MensajeAdministracion ObtenerMensajeAdministracion()
        {
            try
            {
                DAO_Administracion daoAdmin = new DAO_Administracion();
                var lista = daoAdmin.ObtenerMensajeAdministracion();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, ex.Message + " -> " + ex.StackTrace, "AdministracionController.ObtenerMensajeAdministracion", "WEB", "Sistema");
                throw ex;
            }
        }
    }
}
