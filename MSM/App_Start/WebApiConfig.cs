using log4net.Config;
using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.OData.Builder;

namespace MSM
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            //Log4Net Config
            XmlConfigurator.Configure();

            //// Configuración y servicios de API web
            AutofacContainerConfig.Configure();

            //// Rutas de API web
            config.MapHttpAttributeRoutes();

            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            var modelBuilder = new ODataConventionModelBuilder();
            modelBuilder.EntitySet<ParosPerdidas>("AccionesMejoraParosPerdidas");


            modelBuilder.EntitySet<OrdenesCambio>("AccionesMejoraCambios");
            modelBuilder.EntitySet<MSM.DTO.DTO_OrdenesArranques>("AccionesMejoraArranques");


            var translateAction = modelBuilder.Entity<ParosPerdidas>().Collection.Action("GetInterval");
            translateAction.Parameter<DateTime>("fInicio");
            translateAction.Parameter<DateTime>("fFin");
            translateAction.Parameter<int>("linea");
            translateAction.ReturnsCollectionFromEntitySet<ParosPerdidas>("ParosPerdidas");

            var model = modelBuilder.GetEdmModel();
            
            config.Routes.MapODataRoute(
                 routeName: "OData",
                 routePrefix: "odata",
                 model: model
                 );


            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                //routeTemplate: "api/{controller}"
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
                );

            // Uncomment the following line of code to enable query support for actions with an IQueryable or IQueryable<T> return type.
            // To avoid processing unexpected or malicious queries, use the validation settings on QueryableAttribute to validate incoming queries.
            // For more information, visit http://go.microsoft.com/fwlink/?LinkId=279712.
            config.EnableQuerySupport();

            // To disable tracing in your application, please comment out or remove the following line of code
            // For more information, refer to: http://www.asp.net/web-api
            //config.EnableSystemDiagnosticsTracing();
        }
    }
}
