using MSM.BBDD.Envasado;
using MSM.Models.Envasado;
using MSM.Models;
using MSM.RealTime;
using MSM.Security;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using MSM.Utilidades;
using SignalR = Microsoft.AspNet.SignalR;
using MSM.Models.Planta;
using MSM.BBDD.Planta;


namespace MSM.Controllers.Planta
{
    [Authorize]
    public class ChatController : ApiController
    {
        public SignalR.IHubContext hub = SignalR.GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        [Route("api/obtenerGuid")]
        [HttpGet]
        public Guid obtenerGuid()
        {
            try
            {
                return Guid.NewGuid();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ChatController.obtenerGuid", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ChatController.obtenerGuid", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_GUID"));
            }

        }

        [Route("api/ObtenerUsuariosConectados/{idlinea}/{usuario}")]
        [HttpGet]
        public object ObtenerUsuariosConectados(int? idLinea, string usuario)
        {
            try
            {
                List<Sesion> listSesion = new List<Sesion>();
                System.Collections.Hashtable u = PlantaRT.usuarios;
                foreach (DictionaryEntry item in PlantaRT.usuarios)
                {
                    Sesion sesion = (Sesion)item.Value;
                    listSesion.Add(sesion);
                }

                if (!idLinea.HasValue)
                {
                    listSesion = listSesion.Where(p =>
                    (p.funciones.Any(f => f.codigo == Funciones.UC_GEN_TT_4_Chat.ToString())) &&
                    p.usuario != usuario).ToList();
                }
                else
                {
                    listSesion = listSesion.Where(p => ((p.linea != null && p.linea.numLinea == idLinea) || p.portal) &&
                        (p.funciones.Any(f => f.codigo == Funciones.UC_GEN_TT_4_Chat.ToString())) &&
                        p.usuario != usuario).ToList();

                }
                List<Hashtable> lisUsersConected = new List<Hashtable>();
                foreach (Sesion sesion in listSesion)
                {
                    Hashtable userconected = new Hashtable();
                    userconected.Add("usuario", sesion.usuario);
                    userconected.Add("zona", sesion.zona == null ? string.Empty : sesion.zona.descripcion);
                    lisUsersConected.Add(userconected);
                }
                return lisUsersConected;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ChatController.ObtenerUsuariosConectados", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ChatController.ObtenerUsuariosConectados", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_USUARIOS"));
            }
        }

        [Route("api/AsociarUsuarioLinea/{usuario}/{numLinea}")]
        [HttpPost]
        public void AsociarUsuarioLinea(string usuario, int numLinea)
        {
            try
            {
                List<Sesion> listSesion = new List<Sesion>();
                System.Collections.Hashtable u = PlantaRT.usuarios;
                foreach (DictionaryEntry item in PlantaRT.usuarios)
                {
                    Sesion sesion = (Sesion)item.Value;
                    listSesion.Add(sesion);
                }
                Sesion sesionUsuario = listSesion.Where(p => p.usuario == usuario).FirstOrDefault();
                if (sesionUsuario != null)
                {
                    sesionUsuario.linea = PlantaRT.planta.lineas.Find(linea => linea.numLinea == numLinea);
                    hub.Clients.All.actualizarUsuariosChat();
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ChatController.AsociarUsuarioLinea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ChatController.AsociarUsuarioLinea", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_COMPROBANDO_ACCESO"));
            }
        }
    }
}