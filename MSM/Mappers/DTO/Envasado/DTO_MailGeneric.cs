using MSM.Controllers.Planta;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_MailGeneric
    {
        public string Subject { get; set; }
        public List<string> Recipients { get; set; } = new List<string>();
        public string BodyPathHtml { get; set; } = System.Web.HttpContext.Current.Server.MapPath("~/Portal/Administracion/html/FormatoHTMLMail.html");
        public string Message { get; set; }
        public string AutomaticMsg { get; set; } = IdiomaController.GetResourceName("MAIL_AUTOMATICO_MES");
        public string FooterMsg { get; set; } = IdiomaController.GetResourceName("NO_RESPONDA_ESTE_CORREO");

        public string ConstructBody { 
            get {
                string body = string.Empty;

                using (StreamReader reader = new StreamReader(BodyPathHtml))
                {
                    body = reader.ReadToEnd();
                }

                if (!string.IsNullOrEmpty(FooterMsg))
                {
                    body = body.Replace("{automaticMessage}", AutomaticMsg);
                }
                body = body.Replace("{subject}", Subject);
                body = body.Replace("{message}", Message);
                if (!string.IsNullOrEmpty(FooterMsg))
                {
                    body = body.Replace("{footerMessage}", FooterMsg);
                }

                return body;
            } 
        }
    }
}