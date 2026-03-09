using Autofac;
using Common.Models.Planta;
using MSM.BBDD.Envasado;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.RealTime
{
    public class TareaFechaEstimadaFinWO : ITareaMSM
    {
        public string Nombre { get => NOMBRE; }
        public TipoEnumProcesoPerroGuardian Tipo { get => TipoEnumProcesoPerroGuardian.ActualizarFechaEstimadaFinWO; }
        public static string NOMBRE { get => "ActFechaEstimadaFinWO"; }


        private static string SIN_FECHA = IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE");
        private IDAO_Turnos dao_turnos = AutofacContainerConfig.Container.Resolve<IDAO_Turnos>(); 

        public async Task Tarea()
        {
            // Calculamos para cada linea de la planta, la fecha estimada de fin de la WO que esté en producción en ese momento
            // Usamos el objeto "ordenEnPaletizadora" de cada linea para el cálculo
            // También necesitamos el turno actual y los turnos futuros para calcular la fecha de fin dentro de tiempo planificado

            // Lineas
            var lineas = PlantaRT.planta.lineas;

            foreach(var linea in lineas)
            {
                var orden = linea.ordenEnPaletizadora;

                if (orden != null)
                {
                    // Obtenemos el turno actual
                    var turnoActualList = await dao_turnos.ObtenerTurnosConBreak(null, linea.id, DateTime.UtcNow, null, null);

                    if (turnoActualList != null && turnoActualList.Count > 0)
                    {
                        var turnoActual = turnoActualList[0];
                        double oee = (orden.produccion?.oee ?? orden.oeePreactor) ?? 0;

                        if (oee != 0)
                        {
                            DateTime fechaEstimada = DateTime.UtcNow;
                            int paletsPlanificados = orden.cantPlanificada;
                            int paletsProducidos = orden.produccion?.paletsEtiquetadoraProducidos ?? 0;
                            double velocidadNominal = orden.velocidadNominal;
                            double velocidadReal = (double)(oee * velocidadNominal) / 100;
                            double envasesPorPalet = orden.EnvasesPorPalet;
                            double envasesPendientes = (paletsPlanificados - paletsProducidos) * envasesPorPalet;
                            double duracion = velocidadReal != 0 ? envasesPendientes / velocidadReal : 0;
                            double horas = Math.Truncate(duracion);
                            double minutos = horas * 60 + (duracion - horas) * 60;

                            if (paletsProducidos <= paletsPlanificados)
                            {
                                double duracionRestante = minutos;

                                while(duracionRestante > 0 && turnoActual != null)
                                {
                                    var duracionEnTurno = DuracionEnTurno(fechaEstimada.AddMinutes(duracionRestante), fechaEstimada, turnoActual);
                                    duracionRestante = Math.Round(duracionRestante) - Math.Round(duracionEnTurno);

                                    fechaEstimada = fechaEstimada.AddMinutes(duracionEnTurno);

                                    if (duracionRestante > 0)
                                    {
                                        turnoActual = await dao_turnos.ObtenerTurnoConBreakConsecutivo(false, turnoActual.Id, null, null);
                                        if (turnoActual != null)
                                        {
                                            fechaEstimada = turnoActual.FechaInicio;
                                        }
                                    }
                                }

                                if (duracionRestante <= 0)
                                {
                                    PlantaRT.fechasFinEstimadasLinea[linea.id] = fechaEstimada.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss");
                                    continue;
                                }                                
                            } 
                        }
                    }
                }

                PlantaRT.fechasFinEstimadasLinea[linea.id] = SIN_FECHA;
            }
        }

        private double DuracionEnTurno(DateTime fechaFinEstimada, DateTime fechaActual , DTO_TurnosConBreak turno)
        {
            double duracionEnTurno = 0;

            if ((fechaActual >= turno.FechaInicio && fechaActual <= turno.FechaFin) ||
                        (fechaFinEstimada >= turno.FechaInicio && fechaFinEstimada <= turno.FechaFin) ||
                        (fechaActual < turno.FechaInicio && fechaFinEstimada > turno.FechaFin))
            {
                // hay produccion este turno
                // Comprobamos si tiene break
                if (turno.FechaInicioBreak == null)
                {
                    duracionEnTurno = ((fechaFinEstimada < turno.FechaFin ? fechaFinEstimada : turno.FechaFin) -
                            (fechaActual > turno.FechaInicio ? fechaActual : turno.FechaInicio)).TotalMinutes;
                }
                else
                {
                    if (fechaActual < turno.FechaInicioBreak)
                    {
                        duracionEnTurno += ((fechaFinEstimada < (DateTime)turno.FechaInicioBreak ? fechaFinEstimada : (DateTime)turno.FechaInicioBreak) -
                        (fechaActual > turno.FechaInicio ? fechaActual : turno.FechaInicio)).TotalMinutes;
                    }
                    // Si termina despues de iniciar el break, minimo sumamos el tiempo del break
                    if (fechaFinEstimada > turno.FechaInicioBreak)
                    {
                        var duracionBreak = ((DateTime)turno.FechaFinBreak - (DateTime)turno.FechaInicioBreak).TotalMinutes;
                        duracionEnTurno += duracionBreak;
                        fechaFinEstimada = fechaFinEstimada.AddMinutes(duracionBreak);
                    }
                    if (fechaFinEstimada > turno.FechaFinBreak)
                    {
                        duracionEnTurno += ((fechaFinEstimada < turno.FechaFin ? fechaFinEstimada : turno.FechaFin) -
                        (fechaActual > (DateTime)turno.FechaFinBreak ? fechaActual : (DateTime)turno.FechaFinBreak)).TotalMinutes;
                    }
                }
            }

            return duracionEnTurno;
        }
    }
}