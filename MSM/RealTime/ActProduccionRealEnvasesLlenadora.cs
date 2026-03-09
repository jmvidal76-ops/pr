using Common.Models.Planta;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using Quartz;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace MSM.RealTime
{
    public class ActProduccionRealEnvasesLlenadora : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public async void Execute(IJobExecutionContext context)
        {
            if (PlantaRT.activarLogEnvasesLlenadora)
            {
                DAO_Log.EscribeLog("ACTUALIZAR PRODUCCIÓN ENVASES LLENADORA", "INICIO", "Info");
            }
            Stopwatch tim = Stopwatch.StartNew();
            tim.Start();

            await DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian((int)TipoEnumProcesoPerroGuardian.ProduccionEnvasesLlenadora);
            await GuardarProduccionRealLlenadorasAsync(context.FireTimeUtc.Value.DateTime);

            if (PlantaRT.activarLogEnvasesLlenadora)
            {
                DAO_Log.EscribeLog("PROD_ENV_LLE-DURACIÓN", tim.Elapsed.ToString(), "Info");
                DAO_Log.EscribeLog("ACTUALIZAR PRODUCCIÓN ENVASES LLENADORA", "FIN", "Info");
            }

            tim.Stop();
        }

        public async Task GuardarProduccionRealLlenadorasAsync(DateTime fireTimeUtc)
        {
            try
            {
                var daoTurnos = new DAO_Turnos();
                var daoProduccion = new DAO_Produccion();

                // Usar Stopwatch solo una vez para medir el tiempo de ejecución total.
                Stopwatch timer = Stopwatch.StartNew();

                // Se puede inicializar fuera del foreach, ya que no depende de cada iteración.
                List<Task> tasks = new List<Task>();

                foreach (var linea in PlantaRT.planta.lineas)
                {
                    if (PlantaRT.activarLogEnvasesLlenadora)
                    {
                        DAO_Log.EscribeLog($"PROD_ENV_LLE-Tratamiento línea {linea.id}", "Inicio", "Info");
                    }

                    var fechaInicio = daoTurnos.ObtenerFechaInicioTurnoPorLineaFecha(linea.id, fireTimeUtc);
                    if (fechaInicio == null) continue;

                    var turno = daoTurnos.ObtenerTurnoAnterior(linea.id, fechaInicio.Value);
                    if (turno != null)
                    {
                        var fechasTurnoAnterior = daoProduccion.ObtenerFechasFinProduccionReal(linea.id, turno.inicio.ToLocalTime(), turno.fin.ToLocalTime());

                        foreach (var fechaTurnoAnterior in fechasTurnoAnterior)
                        {
                            int? cantidadTurnoAnt = 0;
                            // Procesar todas las llenadoras de forma asíncrona para mejorar el rendimiento
                            tasks.Add(Task.Run(() =>
                            {
                                foreach (var llenadoraTurnoAnt in linea.llenadoras)
                                {
                                    cantidadTurnoAnt += daoProduccion.ObtenerProduccionRealLlenadoras(turno.inicio, fechaTurnoAnterior.ToUniversalTime(), llenadoraTurnoAnt.id);

                                    DAO_Log.registrarLogTraza("ActProduccionRealEnvasesLlenadora", "GuardarProduccionRealLlenadoras",
                                        $"FechaInicio: {turno.inicio}, FechaFin:{fechaTurnoAnterior.ToUniversalTime()}, Llenadora: {llenadoraTurnoAnt.id}, Cantidad: {cantidadTurnoAnt}");
                                }

                                daoProduccion.GuardarProduccionRealLlenadoras(linea.id, fechaTurnoAnterior, cantidadTurnoAnt == 0 ? null : cantidadTurnoAnt);
                            }));
                        }
                    }

                    var listaFechasFin = daoProduccion.ObtenerFechasFinProduccionReal(linea.id, fechaInicio.Value.ToLocalTime(), fireTimeUtc.ToLocalTime());

                    foreach (var fechaFin in listaFechasFin)
                    {
                        int? cantidad = 0;
                        // Procesar todas las llenadoras de forma asíncrona
                        tasks.Add(Task.Run(() =>
                        {
                            foreach (var llenadora in linea.llenadoras)
                            {
                                cantidad += daoProduccion.ObtenerProduccionRealLlenadoras(fechaInicio.Value, fechaFin.ToUniversalTime(), llenadora.id);

                                DAO_Log.registrarLogTraza("ActProduccionRealEnvasesLlenadora", "GuardarProduccionRealLlenadoras",
                                    $"FechaInicio: {fechaInicio.Value}, FechaFin:{fechaFin.ToUniversalTime()}, Llenadora: {llenadora.id}, Cantidad: {cantidad}");
                            }

                            daoProduccion.GuardarProduccionRealLlenadoras(linea.id, fechaFin, cantidad == 0 ? null : cantidad);
                        }));
                    }

                    if (PlantaRT.activarLogEnvasesLlenadora)
                    {
                        DAO_Log.EscribeLog($"PROD_ENV_LLE-Duración línea {linea.id}", timer.Elapsed.ToString(), "Info");
                        DAO_Log.EscribeLog($"PROD_ENV_LLE-Tratamiento línea {linea.id}", "Fin", "Info");
                    }
                }

                // Esperamos a que todas las tareas asíncronas finalicen.
                await Task.WhenAll(tasks);

                timer.Stop();
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogEnvasesLlenadora)
                {
                    DAO_Log.EscribeLog("PROD_ENV_LLE-Guardar Producción", $"Error: {ex.Message}", "Error");
                }
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"{ex.Message} -> {ex.StackTrace}", "Realtime/CurvaProduccionTurno", "I-MES-REALTIME", "System");
            }
        }


    }
}