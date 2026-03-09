using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecycleAppPool.Domain.Services;
using System.Net.Http;

namespace RecycleAppPool
{
    class RecycleApp
    {
        static void Main(string[] args)
        {
            LogService.registrarLogProcesos("Main", "Inicio Proceso RecycleApp");
            try
            {
                LogService.registrarLogProcesos("Main", "Cierre sesion usuarios");
                RunAsync().Wait();
                //Suspendemos el proceso durante 5 segundos para que se pueda cerrar las sesiones que puediesen estar abiertas
                System.Threading.Thread.Sleep(5000);
                string appPoolName = ConfigurationManager.AppSettings["AppPoolName"];
                LogService.registrarLogProcesos("Main", String.Format("Reciclado aplicacion: {0}",appPoolName));
                IISOperationService.reclycleApp(appPoolName);
                SendRequestService.sendRequestPortal();
            }
            catch (Exception ex)
            {
                LogService.registrarLogProcesos("Main", ex);
            }
            LogService.registrarLogProcesos("Main", "Fin Proceso RecycleApp");
        }

        /// <summary>
        /// Método para ejecutar asincronamente
        /// </summary>
        /// <returns></returns>
        static async Task RunAsync()
        {
            bool resp = await SendRequestService.SendCloseUserSesion();
        }
    }
}
