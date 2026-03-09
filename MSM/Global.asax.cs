using Microsoft.AspNet.SignalR;
using Microsoft.Diagnostics.Runtime;
using MSM.RealTime;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web.Http;

namespace MSM
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        static DateTime highCpuStartTime = DateTime.MinValue;
        static bool isHighCpuDetected = false;
        private static Timer _cpuMonitorTimer;
        private static HashSet<string> _loggedMethods = new HashSet<string>(); // Almacena métodos ya registrados


        //Programador actualizaciones;
        protected void Application_Start()
        {
            _cpuMonitorTimer = new Timer(state => CheckCPUUsage(state), null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
            //Elimino que el sistema devuelva en XML, sólo trabajaremos con JSON
            GlobalConfiguration.Configuration.Formatters.Remove(GlobalConfiguration.Configuration.Formatters.XmlFormatter);
            GlobalConfiguration.Configure(WebApiConfig.Register);

            JsonSerializerSettings jSettings = new JsonSerializerSettings();
            GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings = jSettings;

            HttpConfiguration config = GlobalConfiguration.Configuration;
            config.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;

            //Lanzamos la carga inicial de datos en memoria de la Planta
            PlantaRT.ObtenerDatosPlantaCiclico();

            BBDD.Planta.DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 1, "Zona horaria del servidor: " + TimeZoneInfo.Local.ToString(), "Global.Application_Start", "WEB-ENVASADO", "Sistema");


            
            GlobalHost.Configuration.ConnectionTimeout = TimeSpan.FromMinutes(60);
            GlobalHost.Configuration.DisconnectTimeout = TimeSpan.FromSeconds(120);
            GlobalHost.Configuration.KeepAlive = TimeSpan.FromSeconds(40);
            //GlobalHost.Configuration.ConnectionTimeout = TimeSpan.FromSeconds(30);
            //GlobalHost.Configuration.DisconnectTimeout = TimeSpan.FromSeconds(15);
            //GlobalHost.Configuration.KeepAlive = null; // Desactiva KeepAlive


            ThreadPool.SetMinThreads(4, 4);
            // Limitar el tamaño máximo de mensajes WebSocket para evitar excesivo uso de memoria
            GlobalHost.Configuration.MaxIncomingWebSocketMessageSize = 64 * 1024; // 64 KB
            // Limitar el número de conexiones activas en SignalR
            GlobalHost.Configuration.DefaultMessageBufferSize = 10; // Solo mantiene 10 mensajes en memoria
        }

        void Application_End(object sender, EventArgs e)
        {
            PlantaRT.programadorPlantaRT.pararActualizaciones();
        }

        static void CheckCPUUsage(object state)
        {
            try
            {
            var cpuUsage = GetCPUUsage();
            if (cpuUsage > 50) // Si la CPU pasa del 50%, registra los métodos
            {
                    if (!isHighCpuDetected)
                    {
                        highCpuStartTime = DateTime.Now;
                        isHighCpuDetected = true;
                    }

                    // Si han pasado al menos 1 minuto con CPU alta, registrar métodos
                    if ((DateTime.Now - highCpuStartTime).TotalSeconds >= 30)
                    {
                        
                        LogHighCPUUsage(cpuUsage);
                        isHighCpuDetected = false; // Resetear la detección después de loguear
                    }
                }
                else
                {
                    // Si la CPU bajó antes del minuto, reiniciar contador
                    isHighCpuDetected = false;
                    //_loggedMethods.Clear();
                }

            }catch(Exception ex)
            {
                BBDD.Planta.DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 1, $"Se ha producido una excepcion al guardar registro de CPU: {ex.Message}", "LogHighCPUUsage", "WEB-GLOBAL", "Sistema");

            }
        }

        static double GetCPUUsage()
        {
            using (PerformanceCounter cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total"))
            {
                cpuCounter.NextValue();
                Thread.Sleep(1000); // Espera 1 segundo para obtener un valor real
                return cpuCounter.NextValue();
            }
        }

        private static void LogHighCPUUsage(double cpuUsage)
        {

                BBDD.Planta.DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 1, $"[{DateTime.Now}] CPU ALTA (+{cpuUsage}% durante 1 minuto)", "LogHighCPUUsage", "WEB-GLOBAL", "Sistema");
                Process process = Process.GetCurrentProcess();
            ProcessThread mostActiveThread = null;
            double maxCpuUsage = 0;
            foreach (ProcessThread thread in process.Threads)
            {
                try
                {
                    double threadCpuUsage = thread.TotalProcessorTime.TotalMilliseconds;
                    if (threadCpuUsage > maxCpuUsage)
                    {
                        maxCpuUsage = threadCpuUsage;
                        mostActiveThread = thread;
                    }
                }
                catch { }
            }

            
                if (mostActiveThread != null)
                {
                    CaptureStackTrace(process.Id, mostActiveThread.Id);
                }
                else
                {
                    BBDD.Planta.DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 1, "No se pudo determinar el hilo con mayor consumo", "LogHighCPUUsage", "WEB-GLOBAL", "Sistema");

                }


        }

        private static void CaptureStackTrace(int processId, int threadId)
        {
            try
            {
            using (DataTarget target = DataTarget.AttachToProcess(processId, 5000, AttachFlag.Passive))
            {
                string dacPath = @"C:\Windows\Microsoft.NET\Framework\v4.0.30319\mscordacwks.dll";
                var clrVersion = target.ClrVersions.FirstOrDefault();
                if (clrVersion == null)
                {
                        BBDD.Planta.DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 1, "No se encontró ninguna versión de CLR en el proceso.",
                                                                            "LogHighCPUUsage", "WEB-GLOBAL", "Sistema");
                        Console.WriteLine();
                    return;
                }

                ClrRuntime runtime = clrVersion.CreateRuntime(dacPath);
                //ClrRuntime runtime = target.ClrVersions.First().CreateRuntime();
                ClrThread thread = runtime.Threads.FirstOrDefault(t => t.OSThreadId == threadId);


                    if (thread != null)
                    {
                        foreach (var frame in thread.StackTrace)
                        {
                                //_loggedMethods.Add(frame.DisplayString);
                                BBDD.Planta.DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 1, $"Método: {frame.DisplayString} " ,
                                                                                "LogHighCPUUsage", "WEB-GLOBAL", "Sistema");
                        }
                    }
                    else
                    {
                        BBDD.Planta.DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 1, "No se pudo determinar el hilo con mayor consumo", "LogHighCPUUsage", "WEB-GLOBAL", "Sistema");

                    }
            }
            }
            catch(Exception ex)
            {
                BBDD.Planta.DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 1, "Error al leer fichero", "LogHighCPUUsage", "WEB-GLOBAL", "Sistema");

            }
        }
    }
}
