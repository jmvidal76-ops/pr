using Common.Models.Planta;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Planta;
using MSM.RealTime;
using Quartz;
using System.Diagnostics;

namespace MSM
{
    public class ActVideowall : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public async void Execute(IJobExecutionContext context)
        {
            if (PlantaRT.activarLogVideowall)
            {
                DAO_Log.EscribeLog("ACTUALIZAR VIDEOWALL", "INICIO", "Info");
            }
            Stopwatch tim = Stopwatch.StartNew();
            tim.Start();

            await DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian((int)TipoEnumProcesoPerroGuardian.ActualizarVideowall);
            hub.Clients.All.notVideowall();

            if (PlantaRT.activarLogVideowall)
            {
                DAO_Log.EscribeLog("ACT_VIDEOWALL-DURACIÓN", tim.Elapsed.ToString(), "Info");
                DAO_Log.EscribeLog("ACTUALIZAR VIDEOWALL", "FIN", "Info");
            }
            tim.Stop();
        }
    }
}