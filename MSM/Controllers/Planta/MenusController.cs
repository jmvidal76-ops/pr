using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MSM.BBDD.Envasado;
using MSM.Models.Envasado;
using System.Web;
using MSM.Security;
using System.Threading;
using MSM.RealTime;
using MSM.Models.Planta;
using MSM.BBDD.Planta;

namespace MSM.Controllers.Planta
{

    public class MenusController : ApiController
    {

        // GET: api/Menus
        [Route("api/menus/{app}")]
        [HttpGet]
        public IEnumerable<Menu> Get(string app)
        {
            try
            {
                var identity = Thread.CurrentPrincipal.Identity;
                Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[identity.Name];

                List<Menu> listaMenus = null;
                if (sesionUsuario != null)
                {
                    DAO_Menu daoMenu = new DAO_Menu();
                    listaMenus = daoMenu.obtenerMenusPadre(app, sesionUsuario.funciones);
                }

                return listaMenus;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MenusController.Get", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MenusController.Get", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_OPCIONES"));
            }


        }


        // GET: api/Menus
        [Route("api/vistas/{aplicacion}")]
        [HttpGet]
        public List<Vista> Vistas(string aplicacion)
        {
            try
            {
                List<Vista> vistas = null;
                DAO_Menu daoMenu = new DAO_Menu();
                vistas = daoMenu.obtenerVistas(aplicacion);
                return vistas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MenusController.Vistas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MenusController.Vistas", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_VISTAS"));
            }
        }


        // POST: api/ReportarIncidencia
        [Route("api/reportarIncidencia")]
        [HttpPost]
        public HttpResponseMessage ReportarIncidencia(Incidencia inc)
        {
            try
            {
                DAO_Menu daoMenu = new DAO_Menu();
                daoMenu.InsertarIncidenciaReportada(inc);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MenusController.ReportarIncidencia", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MenusController.ReportarIncidencia", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_REPORTAR"));
            }
        }

    }
}
