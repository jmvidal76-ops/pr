using Autofac;
using Autofac.Integration.WebApi;
using Clients.ApiClient;
using Clients.ApiClient.Contracts;
using MSM.BBDD.Envasado;
using MSM.BBDD.RTDS;
using MSM.BBDD.Trazabilidad.Transporte;
using Services.NetworkService.Network;
using Services.NetworkService.Network.Contracts;
using Services.NetworkService.Network.Models.Serializer;
using Services.NetworkService.Network.Models.Settings;
using Services.NetworkStatusServices.NetworkStatus;
using Services.NetworkStatusServices.NetworkStatus.Contracts;
using Services.TrackingService.Tracking;
using Services.TrackingService.Tracking.Contracts;
using System.Reflection;
using System.Web.Http;


namespace MSM
{
    public static class AutofacContainerConfig
    {
        public static IContainer Container { get; set; }

        public static void Configure()
        {
            var builder = new ContainerBuilder();
            var config = GlobalConfiguration.Configuration;

            var assemblies = new Assembly[]
            {
                //TRANSPORTES
                typeof(DAO_Transporte).Assembly,
                typeof(IDAO_Transporte).Assembly,
                
                typeof(DAO_Proveedor).Assembly,
                typeof(IDAO_Proveedor).Assembly,



                //Interface API Externo (Para REST de SIMATIC)
                typeof(ApiClient).Assembly,
                typeof(IApiClient).Assembly,

                typeof(NetworkService).Assembly,
                typeof(INetworkService).Assembly,

                typeof(TrackingService).Assembly,
                typeof(ITrackingService).Assembly,

                typeof(NetworkStatusService).Assembly,
                typeof(INetworkStatusService).Assembly,

                typeof(JsonSerializer).Assembly,
                typeof(ISerializer).Assembly,

                typeof(AuthByHeader).Assembly,
                typeof(IApiSettings).Assembly,


            };
           
            builder.RegisterAssemblyTypes(assemblies)
              .AsImplementedInterfaces()
              .InstancePerRequest();

            //for use interface out of controllers
            builder.RegisterAssemblyTypes(assemblies)
              .AsImplementedInterfaces()
              .InstancePerLifetimeScope();

            //register web api controllers
            builder.RegisterApiControllers(Assembly.GetExecutingAssembly());
  
            Container = builder.Build();
            config.DependencyResolver = new AutofacWebApiDependencyResolver(Container);
        }
    }
}
