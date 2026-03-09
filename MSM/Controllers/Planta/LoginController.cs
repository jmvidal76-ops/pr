using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.Models.Planta;
using MSM.RealTime;
using MSM.Security;
using MSM.Utilidades;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Security;
using SignalR = Microsoft.AspNet.SignalR;


namespace MSM.Controllers.Planta
{
    /// <summary>
    /// Gestiona todas las operaciones necesarias para validar el acceso de usuarios al sistema
    /// asi como el cambio de puestos de trabajo o la salida de usuarios del sistema
    /// </summary>
    /// 
    [Authorize]
    public class LoginController : ApiController
    {
        public SignalR.IHubContext hub = SignalR.GlobalHost.ConnectionManager.GetHubContext<MSMHub>();
        /// <summary>
        /// Comprueba si el usuario esta logueado en el sistema
        /// </summary>
        /// <returns>La sesion del usuario</returns>
        [AllowAnonymous]
        [HttpGet]
        [Route("api/compruebaLogin/{aplicacion}")]
        public HttpResponseMessage compruebaLogin(string aplicacion)
        {
            try
            {
                if (PlantaRT.planta == null)
                {
                    return Request.CreateErrorResponse(HttpStatusCode.ServiceUnavailable, "Datos de planta no cargados");
                }

                if (User.Identity.IsAuthenticated)
                {
                    Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[User.Identity.Name];
                    if (sesionUsuario == null)
                    {
                        return Request.CreateResponse(HttpStatusCode.OK, new Sesion(false, "", "", null, null, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);

                    }
                    else
                    {
                        sesionUsuario.fechaSesion = DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss");
                        if (aplicacion == "terminal" && sesionUsuario.linea == null && sesionUsuario.zona == null)
                        {
                            return Request.CreateResponse(HttpStatusCode.OK, sesionUsuario, Configuration.Formatters.JsonFormatter);
                        }
                        else return Request.CreateResponse(HttpStatusCode.OK, sesionUsuario, Configuration.Formatters.JsonFormatter);
                    }
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new Sesion(User.Identity.IsAuthenticated, User.Identity.Name, "", null, null, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LoginController.compruebaLogin", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LoginController.compruebaLogin", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_COMPROBANDO_LOGIN"));
            }
        }

        /// <summary>
        /// Realiza el login del usuario contra la aplicación Terminal
        /// </summary>
        /// <param name="sesion"></param>
        /// <returns>La sesión del usuario</returns>
        [AllowAnonymous]
        [HttpPost]
        [Route("api/loginTerminal")]
        public HttpResponseMessage loginTerminal(Sesion sesion)
        {
            try
            {
                //-------------------------------------------Comprobación valores de entrada----------------
                if (string.IsNullOrEmpty(sesion.usuario))
                {
                    throw new Exception(IdiomaController.GetResourceName("NO_SE_HA_INDICADO"));
                }
                if (string.IsNullOrEmpty(sesion.password))
                {
                    throw new Exception(IdiomaController.GetResourceName("NO_SE_HA_INDICADO_LA_PASSWORD"));
                }
                if (sesion.linea == null)
                {
                    throw new Exception(IdiomaController.GetResourceName("NO_SE_HA_INDICADO_LA"));
                }
                if (sesion.zona == null)
                {
                    throw new Exception(IdiomaController.GetResourceName("NO_SE_HA_INDICADO_LA_ZONA"));
                }

                //----------------------------------------------------------------------------
                ///TODO Validar credenciales
                UserManager<Usuario> gestorUsuarios = new UserManager<Usuario>(new UserStore<Usuario>(new ApplicationDbContext()));
                Usuario user = gestorUsuarios.Users.Where(u => u.UserName.ToLower().Equals(sesion.usuario)).FirstOrDefault();

                if (user != null)
                {
                    Usuario usu = gestorUsuarios.Find(user.UserName, sesion.password);

                    if (usu != null && sesion.usuario.Equals(usu.UserName.ToLower()))
                    {
                        if (usu.LockoutEnabled)
                        {
                            Sesion session = new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss"));
                            session.bloqueado = true;
                            return Request.CreateResponse(HttpStatusCode.Forbidden, session, Configuration.Formatters.JsonFormatter);
                        }
                        else
                        {
                            sesion.validada = true;
                            sesion.userRol = gestorUsuarios.GetRoles(usu.Id).ToList().FirstOrDefault();
                            sesion.linea = PlantaRT.planta.lineas.Find(linea => linea.id == sesion.linea.id);
                            sesion.zona = sesion.linea.zonas.Find(zona => zona.id == sesion.zona.id);
                            sesion.ip = HttpContext.Current.Request.UserHostAddress;
                            sesion.usuarioId = user.Id;
                            if (!PlantaRT.usuarios.ContainsKey(sesion.usuario)) // El usuario no esta en la lista
                            {
                                PlantaRT.usuarios.Add(sesion.usuario, sesion);
                            }
                            else // si esta en la lista
                            {
                                Sesion oldUserSesion = (Sesion)PlantaRT.usuarios[sesion.usuario];
                                //cerramos la sesión que pudiera tener abierta y volvernos a loguear
                                FormsAuthentication.SignOut();
                                PlantaRT.usuarios.Remove(sesion.usuario);
                                hub.Clients.All.actualizarUsuariosChat();
                                hub.Clients.All.comprobarUsuarioLogado();

                                //Suspendemos el proceso durante 3 segundos para que se pueda cerrar la sesion que puediese estar abierta
                                System.Threading.Thread.Sleep(3000);

                                //Si tienen la misma ip actualizamos la zona y linea
                                if (oldUserSesion.ip.Equals(sesion.ip))
                                {
                                    oldUserSesion.zona = sesion.zona;
                                    oldUserSesion.linea = sesion.linea;
                                }
                                else // Usamos su misma sesion y actualizamos ip
                                {
                                    oldUserSesion.zona = sesion.zona;
                                    oldUserSesion.linea = sesion.linea;
                                    oldUserSesion.ip = sesion.ip;
                                }
                                oldUserSesion.usuarioId = user.Id;
                                PlantaRT.usuarios.Add(sesion.usuario, oldUserSesion);
                            }
                            //FormsAuthentication.SetAuthCookie(sesion.usuario, false);
                            Utils.SetAuthCookie(sesion.usuario, false, sesion.ip);
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LoginController.login", "Acceso usuario a Terminal-> Linea: " + sesion.linea.numLinea + " - Zona: " + sesion.zona.id, sesion.usuario);

                            hub.Clients.All.actualizarUsuariosChat();
                            sesion.fechaSesion = DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss");
                            return Request.CreateResponse(HttpStatusCode.OK, sesion, Configuration.Formatters.JsonFormatter);
                        }
                    }
                    else
                    {
                        if (sesion.validada && PlantaRT.usuarios.ContainsKey(sesion.usuario)) //Si viene logado del portal, actualizamos sus datos
                        {
                            Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[sesion.usuario];
                            sesionUsuario.linea = PlantaRT.planta.lineas.Find(linea => linea.id == sesion.linea.id);
                            sesionUsuario.zona = sesionUsuario.linea.zonas.Find(zona => zona.id == sesion.zona.id);
                            sesionUsuario.usuarioId = user.Id;

                            return Request.CreateResponse(HttpStatusCode.OK, sesionUsuario, Configuration.Formatters.JsonFormatter);
                        }
                        else
                        {
                            return Request.CreateResponse(HttpStatusCode.Forbidden, new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
                        }

                        //return Request.CreateResponse(HttpStatusCode.OK, new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
                    }
                }
                else
                {
                    if (sesion.validada && PlantaRT.usuarios.ContainsKey(sesion.usuario)) //Si viene logado del portal, actualizamos sus datos
                    {
                        Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[sesion.usuario];
                        sesionUsuario.linea = PlantaRT.planta.lineas.Find(linea => linea.id == sesion.linea.id);
                        sesionUsuario.zona = sesionUsuario.linea.zonas.Find(zona => zona.id == sesion.zona.id);
                        sesionUsuario.usuarioId = user.Id;

                        return Request.CreateResponse(HttpStatusCode.OK, sesionUsuario, Configuration.Formatters.JsonFormatter);
                    }
                    else
                    {
                        return Request.CreateResponse(HttpStatusCode.Forbidden, new Sesion(true, sesion.usuario, string.Empty, 
                            sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
                    }

                    //return Request.CreateResponse(HttpStatusCode.OK, new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
                }
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.Forbidden, new Sesion(true, sesion.usuario, string.Empty, 
                    sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
            }
        }

        /// <summary>
        /// Realiza el login del usuario contra la aplicación Portal
        /// </summary>
        /// <param name="sesion">Objeto sesión con los datos de login</param>
        /// <returns>La sesion del usuario</returns>
        [AllowAnonymous]
        [HttpPost]
        [Route("api/loginPortal")]
        public HttpResponseMessage loginPortal(Sesion sesion)
        {
            try
            {
                //-------------------------------------------Comprobación valores de entrada----------------
                if (string.IsNullOrEmpty(sesion.usuario))
                {
                    throw new Exception(IdiomaController.GetResourceName("NO_SE_HA_INDICADO"));
                }
                if (string.IsNullOrEmpty(sesion.password))
                {
                    throw new Exception(IdiomaController.GetResourceName("NO_SE_HA_INDICADO_LA_PASSWORD"));
                }

                UserManager<Usuario> gestorUsuarios = new UserManager<Usuario>(new UserStore<Usuario>(new ApplicationDbContext()));
                Usuario user = gestorUsuarios.Users.Where(u => u.UserName.ToLower().Equals(sesion.usuario)).FirstOrDefault();

                if (user != null)
                {
                    Usuario usu = gestorUsuarios.Find(user.UserName, sesion.password);

                    if (usu != null && sesion.usuario.Equals(usu.UserName.ToLower()))
                    {
                        if (usu.LockoutEnabled)
                        {
                            Sesion session = new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss"));
                            session.bloqueado = true;
                            return Request.CreateResponse(HttpStatusCode.Forbidden, session, Configuration.Formatters.JsonFormatter);
                        }
                        else
                        {
                            sesion.validada = true;
                            sesion.portal = true;
                            sesion.userRol = gestorUsuarios.GetRoles(usu.Id).ToList().FirstOrDefault();
                            sesion.ip = HttpContext.Current.Request.UserHostAddress;
                            sesion.usuarioId = user.Id;
                            //sesion.linea = PlantaRT.planta.lineas.Find(linea => linea.numLinea == getLineaUsuario(usu));
                            if (!PlantaRT.usuarios.ContainsKey(sesion.usuario))
                            {
                                PlantaRT.usuarios.Add(sesion.usuario, sesion);
                            }
                            else
                            {
                                Sesion oldUserSesion = (Sesion)PlantaRT.usuarios[sesion.usuario];
                                //Cerramos la sesión que pudiera tener abierta y volvernos a loguear
                                FormsAuthentication.SignOut();
                                PlantaRT.usuarios.Remove(oldUserSesion.usuario);
                                hub.Clients.All.actualizarUsuariosChat();
                                hub.Clients.All.comprobarUsuarioLogado();

                                //Suspendemos el proceso durante 3 segundos para que se pueda cerrar la sesion que puediese estar abierta
                                System.Threading.Thread.Sleep(5000);
                                //Si tienen diferente actualizamos ip,
                                if (!oldUserSesion.ip.Equals(sesion.ip))
                                {
                                    oldUserSesion.ip = sesion.ip;
                                }
                                oldUserSesion.usuarioId = user.Id;
                                PlantaRT.usuarios.Add(sesion.usuario, oldUserSesion);
                            }
                            //FormsAuthentication.SetAuthCookie(sesion.usuario, false);
                            Utils.SetAuthCookie(sesion.usuario, false, sesion.ip);

                            hub.Clients.All.actualizarUsuariosChat();
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LoginController.login", "Acceso usuario", sesion.usuario);
                            return Request.CreateResponse(HttpStatusCode.OK, new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")) { portal = sesion.portal, usuarioId = sesion.usuarioId }, Configuration.Formatters.JsonFormatter);
                        }
                    }
                    else
                    {
                        if (sesion.validada && PlantaRT.usuarios.ContainsKey(sesion.usuario)) //Si viene logado del terminal, actualizamos sus datos
                        {
                            Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[sesion.usuario];
                            sesionUsuario.portal = true;
                            sesionUsuario.usuarioId = user.Id;
                            return Request.CreateResponse(HttpStatusCode.OK, sesionUsuario, Configuration.Formatters.JsonFormatter);
                        }
                        else
                        {
                            return Request.CreateResponse(HttpStatusCode.Forbidden, new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
                        }
                        //return Request.CreateResponse(HttpStatusCode.Forbidden, new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
                    }
                }
                else
                {
                    if (sesion.validada && PlantaRT.usuarios.ContainsKey(sesion.usuario)) //Si viene logado del terminal, actualizamos sus datos
                    {
                        Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[sesion.usuario];
                        sesionUsuario.portal = true;
                        sesionUsuario.usuarioId = user.Id;
                        return Request.CreateResponse(HttpStatusCode.OK, sesionUsuario, Configuration.Formatters.JsonFormatter);
                    }
                    else
                    {
                        return Request.CreateResponse(HttpStatusCode.Forbidden, new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
                    }
                    //return Request.CreateResponse(HttpStatusCode.Forbidden, new Sesion(true, sesion.usuario, "", sesion.linea, sesion.zona, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")), Configuration.Formatters.JsonFormatter);
                }
            }
            catch
            {
                throw new Exception(IdiomaController.GetResourceName("LOGIN_INCORRECTO"));
            }
        }

        /// <summary>
        /// Realiza el log out del usuario
        /// </summary>
        /// <returns>Validación del logout</returns>        
        [HttpPost]
        [Route("api/logout")]
        public HttpResponseMessage logout()
        {
            try
            {
                FormsAuthentication.SignOut();
                Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[User.Identity.Name];
                //Si la ip de la sesion del usuario es la misma que la de la solicitud quitamos al usuario de la lista de usuarios en planta,
                // en caso contrario se tratará de una actualizacion de sesión (usuario conectandose desde otro equipo)
                if (Utils.checkIpUserSesion(sesionUsuario))
                {
                    if (PlantaRT.usuarios.ContainsKey(User.Identity.Name)) PlantaRT.usuarios.Remove(User.Identity.Name);
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LoginController.login", "Salida usuario", User.Identity.Name);
                    hub.Clients.All.actualizarUsuariosChat();
                    hub.Clients.All.comprobarUsuarioLogado();
                }
                else
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LoginController.login", "Cierre sesion usuario", User.Identity.Name);
                }

                return Request.CreateResponse(HttpStatusCode.OK, "logout");
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LoginController.logout", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LoginController.logout", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_HACIENDO_LOGOUT"));
            }
        }

        /// <summary>
        /// Realiza el log out del usuario
        /// </summary>
        /// <returns>Validación del logout</returns>        
        [HttpGet]
        [Route("api/ComprobarUsuarioLogado/{user}")]
        public HttpResponseMessage ComprobarLoginUsuario(string user)
        {
            try
            {
                Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[user];
                if (PlantaRT.usuarios.Contains(user) && Utils.checkIpUserSesion(sesionUsuario))
                {
                    return Request.CreateResponse(HttpStatusCode.OK, "Logado");
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.OK, "No Logado");
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LoginController.logout", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LoginController.ComprobarLoginUsuario", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_HACIENDO_LOGOUT"));
            }
        }

        /// <summary>
        /// Controla el cambio de puesto para un usuario de la aplicación terminal
        /// </summary>
        /// <param name="sesion">La variable sesión con la nueva linea y zona a la que cambia el usuario</param>
        /// <returns>Validación de la operación</returns>        
        [HttpPost]
        [Route("api/cambioPuesto")]
        public HttpResponseMessage CambioPuesto(Sesion sesion)
        {
            try
            {
                if (PlantaRT.usuarios.Contains(sesion.usuario))
                {
                    Sesion oldSesion = PlantaRT.usuarios[sesion.usuario] as Sesion;
                    if (oldSesion != null)
                    {
                        oldSesion.linea = PlantaRT.planta.lineas.Find(linea => linea.id == sesion.linea.id);
                        oldSesion.zona = oldSesion.linea.zonas.Find(zona => zona.id == sesion.zona.id);
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LoginController.CambioPuesto", "Cambio de puesto a linea: " + sesion.linea.numLinea + " zona: " + sesion.zona.id, sesion.usuario);
                        hub.Clients.All.actualizarUsuariosChat();
                        hub.Clients.All.eventCambioPuestoGlobal(new { sesion = sesion });
                        return Request.CreateResponse(HttpStatusCode.OK, "Cambio realizado");
                    }
                    else
                    {
                        throw new ApplicationException("sesion no registrada");
                    }
                }
                else
                {
                    throw new ApplicationException("usuario no registrado");
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LoginController.CambioPuesto", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_EL_PUESTO"));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="codZona"></param>
        /// <returns></returns>         
        [HttpPost]
        [Route("api/cambiaLineaZonaCompartida")]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_VisualizacionListadoDeWo)]
        public HttpResponseMessage cambiaLineaZonaCompartida(dynamic datos)
        {
            int numLinea = datos.numLinea;
            string idZona = datos.idZona;
            Sesion sesion = (Sesion)PlantaRT.usuarios[HttpContext.Current.User.Identity.Name];
            try
            {
                if (sesion != null)
                {
                    Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea);
                    Zona zona = linea.zonas.Find(z => z.id.Equals(idZona));
                    sesion.linea = linea;
                    sesion.zona = zona;
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LoginController.cambiaLineaZonaCompartida", "Cambio de puesto de linea: " + sesion.linea.numLinea + " zona: " + sesion.zona.id, sesion.usuario);
                    return Request.CreateResponse(HttpStatusCode.OK, sesion, Configuration.Formatters.JsonFormatter);
                }
                else throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_LA"));
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LoginController.cambiaLineaZonaCompartida", ex, sesion.usuario);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LoginController.cambiaLineaZonaCompartida", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_LA"));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="codZona"></param>
        /// <returns></returns> 
        [HttpPost]
        [Route("api/cambiaSubZona")]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_VisualizacionListadoDeWo)]
        public HttpResponseMessage cambiaSubZona(dynamic datos)
        {
            string idZona = datos.idZona;
            Sesion sesion = (Sesion)PlantaRT.usuarios[HttpContext.Current.User.Identity.Name];
            try
            {
                if (sesion != null)
                {
                    sesion.linea = sesion.zona._refLinea;
                    sesion.zona = sesion.linea.zonas.Find(zona => zona.id == idZona);
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LoginController.cambiaLineaZonaCompartida", "Cambio de puesto de linea: " + sesion.linea.numLinea + " zona: " + sesion.zona.id, sesion.usuario);
                    return Request.CreateResponse(HttpStatusCode.OK, sesion, Configuration.Formatters.JsonFormatter);

                }
                else throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_LA"));
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LoginController.cambiaLineaZonaCompartida", ex, sesion.usuario);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LoginController.cambiaSubZona", "WEB-PLANTA", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_LA"));
            }
        }
    }
}
