using MSM.BBDD;
using MSM.BBDD.Planta;
using Quartz;
using Quartz.Impl;
using Quartz.Impl.Matchers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace MSM.RealTime
{
    public class Programador
    {
        ISchedulerFactory fProgramacion;
        IScheduler programador;
        public Programador()
        {
            fProgramacion = new StdSchedulerFactory();
        }

        public bool iniciar()
        {
            programador = fProgramacion.GetScheduler();
            //programador.Start();

            //--------------------------------------------------------------
            // Planificación de refresco de cambios de estado de ordenes (cada 3 segundos)
            //---------------------------------------------------------------
            if (ConfigurationManager.AppSettings["CAMBIOS_ESTADO_ORDENES"] == "true")
            {
                try
                {
                    string cronAct = ConfigurationManager.AppSettings["T_CAMBIOS_ESTADO_ORDENES"];
                    IJobDetail jobCambiosEstadosOrdenes = JobBuilder.Create<CambiosEstadosOrdenes>()
                        .WithIdentity("CambiosEstadosOrdenes", "ordenes")
                        .WithDescription("Cambios de estado de las órdenes (cada 3 segundos)")
                        .Build();

                    ITrigger triggerCambiosEstadosOrdenes = TriggerBuilder.Create()
                      .WithIdentity("triggerCambiosEstadosOrdenes", "ordenes")
                      .StartNow()
                      .WithSchedule(CronScheduleBuilder.CronSchedule(new CronExpression(cronAct)))
                      .Build();

                    programador.ScheduleJob(jobCambiosEstadosOrdenes, triggerCambiosEstadosOrdenes);
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "Programador.CambioEstadoOrdenes", "I-MES-REALTIME", "Sistema");
                    return false;
                }
            }
            //---------------------------------------------------------------

            // Planificación de refresco de cambios de estado de máquinas (cada 3 segundos)
            //---------------------------------------------------------------
            if (ConfigurationManager.AppSettings["CAMBIOS_ESTADO_MAQUINAS"] == "true")
            {
                try
                {
                    string cronAct = ConfigurationManager.AppSettings["T_CAMBIOS_ESTADO_MAQUINAS"];
                    IJobDetail jobCambiosEstadosMaquinas = JobBuilder.Create<CambiosEstadosMaquinas>()
                        .WithIdentity("CambiosEstadosMaquinas", "ordenes")
                        .WithDescription("Cambios de estado de las máquinas (cada 3 segundos)")
                        .Build();

                    ITrigger triggerCambiosEstadosMaquinas = TriggerBuilder.Create()
                      .WithIdentity("triggerCambiosEstadosMaquinas", "ordenes")
                      .StartNow()
                      .WithSchedule(CronScheduleBuilder.CronSchedule(new CronExpression(cronAct)))                      
                      .Build();

                    programador.ScheduleJob(jobCambiosEstadosMaquinas, triggerCambiosEstadosMaquinas);
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "Programador.CambioEstadoMaquinas", "I-MES-REALTIME", "Sistema");
                    return false;
                }
            }

            // Planificación de refresco de datos de produccion de ordenes pausadas y finalizadas 
            //---------------------------------------------------------------
            if (ConfigurationManager.AppSettings["ACT_DATOS_PRODUCCION_FINALIZADAS_PAUSADAS"] == "true")
            {
                try
                {
                    string cronAct = ConfigurationManager.AppSettings["T_ACT_DATOS_PRODUCCION_FINALIZADAS_PAUSADAS"];
                    IJobDetail jobActDatosProduccionPausadasFinalizadas = JobBuilder.Create<ActDatosProduccionPausadasFinalizadas>()
                        .WithIdentity("ActDatosProduccionPausadasFinalizadas", "ordenes")
                        .WithDescription("Actualizar datos de producción de las órdenes pausadas y finalizadas")
                        .Build();

                    ITrigger triggerActDatosProduccionPausadasFinalizadas = TriggerBuilder.Create()
                      .WithIdentity("ActDatosProduccionPausadasFinalizadas", "ordenes")
                      .StartNow()
                      .WithSchedule(CronScheduleBuilder.CronSchedule(new CronExpression(cronAct)))
                      .Build();

                    programador.ScheduleJob(jobActDatosProduccionPausadasFinalizadas, triggerActDatosProduccionPausadasFinalizadas);
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "Programador.FinalizadasPausadas", "I-MES-REALTIME", "Sistema");
                    return false;
                }
            }

            // Planificación de refresco de datos de producción y gestion de cambios de turno
            //---------------------------------------------------------------
            if (ConfigurationManager.AppSettings["ACT_DATOS_PRODUCCION"] == "true" || true)
            {
                try
                {
                    string cronAct = ConfigurationManager.AppSettings["T_ACT_DATOS_PRODUCCION"];
                    IJobDetail jobActDatosProduccionMaquina = JobBuilder.Create<ActDatosProduccionMaquina>()
                        .WithIdentity("ActDatosProduccionMaquina", "produccion")
                        .WithDescription("Actualizar datos de producción y gestión de cambios de turno (cada 10 minutos)")
                        .Build();

                    ITrigger triggerActDatosProduccionMaquina = TriggerBuilder.Create()
                      .WithIdentity("triggerActDatosProduccionMaquina", "produccion")
                      .StartNow()
                      .WithSchedule(CronScheduleBuilder.CronSchedule(new CronExpression(cronAct)))
                      .WithPriority(1)
                      .Build();

                    programador.ScheduleJob(jobActDatosProduccionMaquina, triggerActDatosProduccionMaquina);
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "Programador.DatosProduccion", "I-MES-REALTIME", "Sistema");
                    return false;
                }
            }

            // Planificación de refresco de actualizacion de videowall (cada 30 minutos)
            //---------------------------------------------------------------
            if (ConfigurationManager.AppSettings["ACT_VIDEOWALL"] == "true")
            {
                try
                {
                    string cronAct = ConfigurationManager.AppSettings["T_ACT_VIDEOWALL"];
                    IJobDetail jobActVideowall = JobBuilder.Create<ActVideowall>()
                        .WithIdentity("ActVideowall", "videowall")
                        .WithDescription("Actualizar el videowall (cada 30 minutos)")
                        .Build();

                    ITrigger triggerActVideowall = TriggerBuilder.Create()
                      .WithIdentity("triggerActVideowall", "videowall")
                      .StartNow()
                      .WithSchedule(CronScheduleBuilder.CronSchedule(new CronExpression(cronAct)))
                       .WithPriority(2)
                      .Build();

                    programador.ScheduleJob(jobActVideowall, triggerActVideowall);
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "Programador.ActVideowall", "I-MES-REALTIME", "Sistema");
                    return false;
                }
            }

            // Planificación de refresco de cambios de triggers de ALT (cada 5 minutos)
            //---------------------------------------------------------------
            if (ConfigurationManager.AppSettings["ACT_ALT"] == "true")
            {
                try
                {
                    int tAct = int.Parse(ConfigurationManager.AppSettings["T_ACT_ALT"]);
                    IJobDetail jobCambiosALT = JobBuilder.Create<ActDatosAlt>()
                        .WithIdentity("CambiosALT", "ALT")
                        .WithDescription("Cambios de triggers de ALT (cada 5 minutos)")
                        .Build();

                    ITrigger triggerCambiosALT = TriggerBuilder.Create()
                      .WithIdentity("triggerCambiosALT", "ALT")
                      .StartNow()
                      .WithSimpleSchedule(x => x
                          .WithIntervalInSeconds(tAct)
                          .RepeatForever())
                      .Build();

                    programador.ScheduleJob(jobCambiosALT, triggerCambiosALT);
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "Programador.ActALT", "I-MES-REALTIME", "Sistema");
                    return false;
                }
            }

            // Planificación de refresco de notificaciones de emails para los tiempos de paros de máquina (cada 30 segundos)
            //---------------------------------------------------------------
            if (ConfigurationManager.AppSettings["ACT_NOTIFICATION_MAIL"] == "true")
            {
                try
                {
                    int tAct = int.Parse(ConfigurationManager.AppSettings["T_ACT_NOTIFICATION_MAIL"]);
                    string pathHTML = System.Web.Hosting.HostingEnvironment.MapPath("~/Portal/Administracion/html/FormatoHTMLMail.html");
                    
                    if (pathHTML != null)
                    {
                        IJobDetail jobTiempoParosMaquina = JobBuilder.Create<ActNotificacionMail>()
                            .WithIdentity("ActNotificacionMail", "produccion")
                            .WithDescription("Tiempos de paros de máquina (cada 30 segundos)")
                            .UsingJobData("jobPath", pathHTML)
                            .Build();

                        ITrigger triggerTiempoParosMaquina = TriggerBuilder.Create()
                          .WithIdentity("ActNotificacionMail", "produccion")
                          .StartNow()
                          .WithSimpleSchedule(x => x
                              .WithIntervalInSeconds(tAct)
                              .RepeatForever())
                          .Build();

                        programador.ScheduleJob(jobTiempoParosMaquina, triggerTiempoParosMaquina);
                    }
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "Programador.TiemposParosMaquina", "I-MES-REALTIME", "Sistema");
                    return false;
                }
            }

            // Planificación de refresco de producción real de envases de llenadora (cada 10 minutos)
            //---------------------------------------------------------------
            if (ConfigurationManager.AppSettings["ACT_PRODUCCION_REAL_ENVASES_LLENADORA"] == "true")
            {
                try
                {
                    string cronAct = ConfigurationManager.AppSettings["T_ACT_PRODUCCION_REAL_ENVASES_LLENADORA"];
                    IJobDetail jobActProdRealEnvasesLlenadora = JobBuilder.Create<ActProduccionRealEnvasesLlenadora>()
                        .WithIdentity("ActProduccionRealEnvasesLlenadora", "produccion")
                        .WithDescription("Actualizar la producción real de envases de llenadora (cada 10 minutos)")
                        .Build();

                    ITrigger triggerActProdRealEnvasesLlenadora = TriggerBuilder.Create()
                      .WithIdentity("ActProduccionRealEnvasesLlenadora", "produccion")
                      .StartNow()
                      .WithSchedule(CronScheduleBuilder.CronSchedule(new CronExpression(cronAct)))
                      .Build();

                    programador.ScheduleJob(jobActProdRealEnvasesLlenadora, triggerActProdRealEnvasesLlenadora);
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "Programador.ProduccionEnvasesLlenadora", "I-MES-REALTIME", "Sistema");
                    return false;
                }
            }

            programador.Start();
            return true;
        }

        public void pararActualizaciones()
        {
            programador.Shutdown();
        }

        public List<dynamic> ComprobarJobs()
        {
            var result = new List<dynamic>();

            if (programador == null)
            {
                result.Add(new { message = "Programador no cargado " });
                return result;
            }

            foreach (string groupName in programador.GetJobGroupNames())
            {
                foreach (JobKey jobKey in programador.GetJobKeys(GroupMatcher<JobKey>.GroupEquals(groupName)))
                {
                    var detail = programador.GetJobDetail(jobKey);
                    var triggers = programador.GetTriggersOfJob(jobKey);
                    result.Add(
                        new
                        {
                            group = groupName,
                            jobName = jobKey.Name,
                            description = detail.Description,
                            triggers = triggers.Select(t => new {
                                name = t.Key.Name,
                                type = t.GetType().Name,
                                state = programador.GetTriggerState(t.Key),
                                stateDesc = programador.GetTriggerState(t.Key).ToString(),
                                lastFireTime = t.GetPreviousFireTimeUtc().HasValue ? t.GetPreviousFireTimeUtc().Value.LocalDateTime.ToString() : "N/A",
                                nextFireTime = t.GetNextFireTimeUtc().HasValue ? t.GetNextFireTimeUtc().Value.LocalDateTime.ToString() : "N/A"
                            })
                        });
                }
            }

            return result;
        }
    }
}
