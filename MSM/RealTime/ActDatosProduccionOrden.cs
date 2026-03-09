using Microsoft.AspNet.SignalR;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.RealTime;
using Quartz;
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace MSM
{

    public class ActDatosProduccionOrden : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public void Execute(IJobExecutionContext context)
        {
            if ((context.FireTimeUtc.Value.Minute != 0 && context.FireTimeUtc.Value.Minute != 30))//|| cambioturno
            {
                //ActualizarDatosProduccionOrden(context.FireTimeUtc.Value);
                ActualizarConversionesOrden();
                ActualizarHectolitrosProductoOrden();
            }
        }

        public void ActualizarDatosProduccion(DateTime fireDateTimeUtc, DateTime dtHoraActualUtc)
        {
            Stopwatch tim = Stopwatch.StartNew();
            tim.Start();

            ActualizarDatosProduccionOrden(fireDateTimeUtc, dtHoraActualUtc);

            if (PlantaRT.activarLogDatosProduccionCambiosTurno)
            {
                DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración método ActualizarDatosProduccionOrden", tim.Elapsed.ToString(), "Info");
            }
            tim.Restart();

            ActualizarConversionesOrden();

            if (PlantaRT.activarLogDatosProduccionCambiosTurno)
            {
                DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración proc. almacenado MES_ObtenerConversionesOrdenes", tim.Elapsed.ToString(), "Info");
            }
            tim.Restart();

            ActualizarHectolitrosProductoOrden();

            if (PlantaRT.activarLogDatosProduccionCambiosTurno)
            {
                DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración proc. almacenado MES_ObtenerHectolitrosProductoOrdenes", tim.Elapsed.ToString(), "Info");
            }

            tim.Stop();
        }

        private void ActualizarHectolitrosProductoOrden()
        {
            DAO_Produccion.GetHectolitrosOrden();
        }

        private void ActualizarConversionesOrden()
        {
            DAO_Produccion.GetConversionesOrden(PlantaRT.activarLogDatosProduccionCambiosTurno);
        }

        public void ActualizarDatosProduccionOrden(DateTime fireDateTimeUtc,DateTime dtHoraActualUtc)
        {
            DAO_Produccion daoProduccion = new DAO_Produccion();

            try
            {
                //Actualizamos los datos de producción para las ordenes activas
                foreach (Linea lin in PlantaRT.planta.lineas)
                {
                    List<Orden> ordenesActivas = lin.ordenesActivas;
                    int contador = 0;                    

                    while (contador < ordenesActivas.Count)
                    {
                        Orden ord = ordenesActivas[contador];
                        daoProduccion.obtenerDatosProduccionParticion(ord, fireDateTimeUtc, dtHoraActualUtc, PlantaRT.activarLogDatosProduccionCambiosTurno);
                        contador++;
                    }
                }
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-Método ActualizarDatosProduccionOrden", "Error: " + ex.Message, "Error");
                }

                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ActDatosProduccionOrden.ActualizarDatosProduccionOrden", "I-MES-REALTIME", "Sistema");
                throw ex;
            }
        }
    }
}
