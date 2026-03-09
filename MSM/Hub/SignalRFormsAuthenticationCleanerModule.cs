using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;

namespace MSM
{
    /// <summary>
    /// Módulo HTTP personalizado para evitar que se restablezca la hora de expiración de la cookie de autorización:
    /// SignalR por defecto hace un ping cada 5 minutos para verificar que esta conectado, de esta forma ya que tenemos activada slidingExpiration,
    /// nos reestablece sólo la hora de expiración de la cooki de atorización. Con lo que nunca nos expira la sesión. Con esta clase quitamos dicha cookie
    /// de la respuesta de las peticiones de signalR evitando así que se reestablezca la hora de expiración de la cookie.
    /// 
    /// Nota: es necesario segistrar el módulo en el web.config
    /// </summary>
    public class SignalRFormsAuthenticationCleanerModule : IHttpModule
    {

        public void Init(HttpApplication application)
        {
            application.PreSendRequestHeaders += OnPreSendRequestHeaders;
        }

        private bool ShouldCleanResponse(string path)
        {
            path = path.ToLower();
            var urlsToClean = new string[] { "/signalr/", "/api/planta/comprobarSesionActiva/", "/api/planta/getTiempoSesion", "/api/planta/getSesionExpirateDate"};

            foreach (var url in urlsToClean)
            {
                var result = path.IndexOf(url, StringComparison.OrdinalIgnoreCase) > -1;
                if (result)
                    return true;
            }

            return false;
        }

        protected void OnPreSendRequestHeaders(object sender, EventArgs e)
        {
            var httpContext = ((HttpApplication)sender).Context;

            if (ShouldCleanResponse(httpContext.Request.Path))
            {
                // Eliminamos Auth Cookie de la respuesta
                httpContext.Response.Cookies.Remove(FormsAuthentication.FormsCookieName);
                return;
            }
        }

        public void Dispose()
        {
        }

    }
}