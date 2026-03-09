using Common.Models.Planta;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Alt;
using MSM.BBDD.Planta;
using MSM.RealTime;
using Quartz;
using System;
using System.Data;
using System.Diagnostics;
using System.Linq;

namespace MSM
{
    public class ActDatosAlt : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public async void Execute(IJobExecutionContext context)
        {
            try
            {
                if (PlantaRT.activarLogCambioALT)
                {
                    DAO_Log.EscribeLog("CAMBIOS DE TRIGGERS DE ALT", "INICIO", "Info");
                }
                Stopwatch tim = Stopwatch.StartNew();
                tim.Start();

                await DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian((int)TipoEnumProcesoPerroGuardian.CambioTriggersALT);

                hub.Clients.All.checkALTForms(); //evento para que los terminales consulten si tienen formularios por rellenar

                if (PlantaRT.activarLogCambioALT)
                {
                    DAO_Log.EscribeLog("ALT-DURACIÓN", tim.Elapsed.ToString(), "Info");
                    DAO_Log.EscribeLog("CAMBIOS DE TRIGGERS DE ALT", "FIN", "Info");
                }
                tim.Stop();
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogCambioALT)
                {
                    DAO_Log.EscribeLog("ALT-Eventos de Calidad", "Error: " + ex.Message, "Error");
                }
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, ex.Message, "Realtime/ActDatosAlt/Execute", "I-MES-REALTIME", "System");
            }
        }
    }
}
