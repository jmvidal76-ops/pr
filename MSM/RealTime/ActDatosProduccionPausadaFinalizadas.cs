using Common.Models.Planta;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.RealTime;
using Quartz;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Linq;

namespace MSM
{
    [DisallowConcurrentExecution]
    public class ActDatosProduccionPausadasFinalizadas : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public async void Execute(IJobExecutionContext context)
        {
            if (PlantaRT.activarLogOrdenesPausadasFinalizadas)
            {
                DAO_Log.EscribeLog("ACTUALIZAR PRODUCCIÓN ORDENES PAUSADAS FINALIZADAS", "INICIO", "Info");
            }
            Stopwatch tim = Stopwatch.StartNew();
            tim.Start();

            await DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian((int)TipoEnumProcesoPerroGuardian.ActualizarProduccionPausadasFinalizadas);
            ActualizarDatosProduccionPausadasFinalizadas();

            if (PlantaRT.activarLogOrdenesPausadasFinalizadas)
            {
                DAO_Log.EscribeLog("ORD_PAU_FIN-DURACIÓN", tim.Elapsed.ToString(), "Info");
                DAO_Log.EscribeLog("ACTUALIZAR PRODUCCIÓN ORDENES PAUSADAS FINALIZADAS", "FIN", "Info");
            }

            tim.Stop();
        }

        public void ActualizarDatosProduccionPausadasFinalizadas()
        {
            DAO_Produccion daoProduccion = new DAO_Produccion();
            try
            {
                Stopwatch timer = Stopwatch.StartNew();
                timer.Start();

                List<string> listaWO;

                using (MESEntities contexto = new MESEntities())
                {
                    listaWO = contexto.Particiones.AsNoTracking().Where(x => x.EstadoAct == "Pausada" || x.EstadoAct == "Finalizada").Select(x => x.Id).ToList();
                }

                foreach (var idParticion in listaWO)
                {
                    if (PlantaRT.activarLogOrdenesPausadasFinalizadas)
                    {
                        DAO_Log.EscribeLog("ORD_PAU_FIN-Tratamiento WO " + idParticion, "Inicio", "Info");
                    }

                    DAO_Orden.ActualizarDatosWO(idParticion);

                    if (PlantaRT.activarLogOrdenesPausadasFinalizadas)
                    {
                        DAO_Log.EscribeLog("ORD_PAU_FIN-Duración WO " + idParticion, timer.Elapsed.ToString(), "Info");
                        DAO_Log.EscribeLog("ORD_PAU_FIN-Tratamiento WO " + idParticion, "Fin", "Info");
                    }

                    timer.Restart();
                }

                timer.Stop();
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogOrdenesPausadasFinalizadas)
                {
                    DAO_Log.EscribeLog("ORD_PAU_FIN-Obtener Producción Ordenes Pausadas Finalizadas", "Error: " + ex.Message, "Error");
                }

                throw ex;
            }
        }
    }
}