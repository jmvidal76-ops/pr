
using MSM.Models;
using MSM.Models.Planta;
using MSM.RealTime;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Http.Routing;
using System.Web.Security;

namespace MSM.Security
{

    public class ApiAuthorizeAttribute : AuthorizeAttribute
    {
        
        private string[] _funciones;

        //public ApiAuthorizeAttribute(Funciones function) {
        //    _funciones = new string[] {function.ToString()};
        //}

        public ApiAuthorizeAttribute(params Funciones[] functions)
        {
            _funciones = functions.Select(f => f.ToString()).ToArray();
        }

        public ApiAuthorizeAttribute(string function)
        {
            _funciones = function.Split(',');
        }

        public override void OnAuthorization(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
           
            if (!Authorize(actionContext))
            {
                HandleUnauthorizedRequest(actionContext);
            }
            
        }

        protected override void HandleUnauthorizedRequest(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            //Comprobamos si el usuario esta logado
            string name = HttpContext.Current.User.Identity.Name;
            Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[name];
            if (sesionUsuario != null && sesionUsuario.validada && Utilidades.Utils.checkIpUserSesion(sesionUsuario))
            {
                //Si esta logado mandamos respuesta indicando queel servidor rechaza atender la solicitud, con el mensaje "NotAuthorized", de esta forma
                //evitamos que se recargue la página ya que con un HttpStatusCode.Unauthorized por defecto se hace una recarga de la pagina.
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Forbidden, "NotAuthorized");
            }
            else
            {
                base.HandleUnauthorizedRequest(actionContext);
            }

        }

        private bool Authorize(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            try
            {
                bool sw = false;
                
                var identity = Thread.CurrentPrincipal.Identity;
                Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[identity.Name];
                                
                //Comprobamos la ip de la sesion del usuario y del context
                if (Utilidades.Utils.checkIpUserSesion(sesionUsuario))
                {
                    //Comprobamos que no se haya especificado un conjunto de funciones
                    if (sesionUsuario != null
                            && sesionUsuario.funciones != null
                            && _funciones != null
                            && _funciones.Length > 0)
                    {
                        foreach (var funcion in _funciones)
                        {
                            if (sesionUsuario.funciones.Exists(f => f.codigo == funcion))
                            {
                                sw = true;
                                break;
                            }
                        }
                    }

                    return sw;
                }
                else
                {
                    return sw;
                }
            }
            catch (Exception)
            {
                return false;
            }
        }
        
    }


    //public class HasPermissionAttribute : ActionFilterAttribute
    //{

    //    private string _funcion;

    //    public HasPermissionAttribute(string funcion)
    //    {
    //        this._funcion = funcion;
    //    }
    //    public override void OnActionExecuting(HttpActionContext actionContext)
    //    {
     
    //       //  actionContext.RequestContext.Principal.IsInRole;
    //        try
    //        {
               
    //        catch (Exception Ex)
    //        {
    //        }
       
    //    }
    //}
}