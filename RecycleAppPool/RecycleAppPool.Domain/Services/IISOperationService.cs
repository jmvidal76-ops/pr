using Microsoft.Web.Administration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RecycleAppPool.Domain.Services
{
    public class IISOperationService
    {
        /// <summary>
        /// Método que recicla un pool de applicaciones.
        /// </summary>
        /// <param name="appPoolName">Nombre del pool de aplicaciones a reciclar</param>
        public static void reclycleApp(string appPoolName)
        {
            try
            {
                ServerManager serverManager = new ServerManager();
                ApplicationPoolCollection applicationPoolCollection = serverManager.ApplicationPools;

                ApplicationPool applicationPool = applicationPoolCollection.FirstOrDefault(ap => ap.Name.Equals(appPoolName));

                if (applicationPool != null)
                {
                    applicationPool.Recycle();
                }
            }
            catch (Exception ex)
            {
                LogService.registrarLogProcesos("reclycleApp", ex);
                throw ex;
            }
        }
    }
}
