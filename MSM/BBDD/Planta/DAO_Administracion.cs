using Microsoft.AspNet.SignalR;
using MSM.BBDD.Model;
using MSM.Mappers.DTO.Administracion;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using Quartz;
using Quartz.Impl;
using Quartz.Impl.Matchers;
using System.Collections.Generic;

namespace MSM.BBDD.Planta
{
    public class DAO_Administracion : IDAO_Administracion
    {
        private const string initVector = "pemgail9uzpgzl88";
        // This constant is used to determine the keysize of the encryption algorithm
        private const int keysize = 256;
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public DTO_MailConfiguration MailConfiguration_Read()
        {
            MailConfiguration _mailConfig = new MailConfiguration();
            using (MESEntities context = new MESEntities())
            {
                _mailConfig = context.MailConfiguration.AsNoTracking().FirstOrDefault();

                if (_mailConfig.Password != string.Empty)
                {
                    _mailConfig.Password = Decrypt(_mailConfig.Password);
                }
            }

            DTO_MailConfiguration dtoMail = ObtenerDtoMailConfiguration(_mailConfig);

            return dtoMail;
        }

        public bool MailConfiguration_Update(DTO_MailConfiguration mailConfiguration)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    MailConfiguration _mailConfig = context.MailConfiguration.Where(m => m.Id == mailConfiguration.Id).FirstOrDefault();
                    _mailConfig.IPServer = mailConfiguration.IPServer;
                    _mailConfig.MailAddress = mailConfiguration.MailAddress;
                    _mailConfig.Port = mailConfiguration.Port;
                    _mailConfig.SSL = mailConfiguration.SSL;
                    _mailConfig.Username = mailConfiguration.Username;
                    _mailConfig.Password = mailConfiguration.Password != string.Empty ? Encrypt(mailConfiguration.Password) : string.Empty;
                    _mailConfig.AuthenticationSMTP = mailConfiguration.IsBasicAuth ? "Basica" : "Anonima";

                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Administracion.MailConfiguration_Update", "WEB-Administracion", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        private string Encrypt(string plainText)
        {
            byte[] initVectorBytes = Encoding.UTF8.GetBytes(initVector);
            byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            PasswordDeriveBytes password = new PasswordDeriveBytes("encryptMSM", null);
            byte[] keyBytes = password.GetBytes(keysize / 8);
            RijndaelManaged symmetricKey = new RijndaelManaged();
            symmetricKey.Mode = CipherMode.CBC;
            ICryptoTransform encryptor = symmetricKey.CreateEncryptor(keyBytes, initVectorBytes);
            MemoryStream memoryStream = new MemoryStream();
            CryptoStream cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write);
            cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
            cryptoStream.FlushFinalBlock();
            byte[] cipherTextBytes = memoryStream.ToArray();
            memoryStream.Close();
            cryptoStream.Close();

            //return as base64 string
            return Convert.ToBase64String(cipherTextBytes);
        }

        public static string Decrypt(string cipherText)
        {
            byte[] initVectorBytes = Encoding.UTF8.GetBytes(initVector);
            byte[] cipherTextBytes = Convert.FromBase64String(cipherText);
            PasswordDeriveBytes password = new PasswordDeriveBytes("encryptMSM", null);
            byte[] keyBytes = password.GetBytes(keysize / 8);
            RijndaelManaged symmetricKey = new RijndaelManaged();
            symmetricKey.Mode = CipherMode.CBC;
            ICryptoTransform decryptor = symmetricKey.CreateDecryptor(keyBytes, initVectorBytes);
            MemoryStream memoryStream = new MemoryStream(cipherTextBytes);
            CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read);
            byte[] plainTextBytes = new byte[cipherTextBytes.Length];
            int decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
            memoryStream.Close();
            cryptoStream.Close();
            return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
        }

        public static string ObtenerEnlaceExterno(int idEnlace)
        {
            try
            {
                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_ObtenerEnlaceExterno]", conexion))
                    {
                        comando.CommandType = CommandType.StoredProcedure;
                        comando.Parameters.AddWithValue("@idEnlace", idEnlace);

                        using (SqlDataAdapter da = new SqlDataAdapter(comando))
                        {
                            conexion.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);

                            return dt.Rows[0]["Url"].ToString();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private DTO_MailConfiguration ObtenerDtoMailConfiguration(MailConfiguration mailConfiguration)
        {
            DTO_MailConfiguration dtoMail = new DTO_MailConfiguration();
            dtoMail.Id = mailConfiguration.Id;
            dtoMail.Name = mailConfiguration.Name;
            dtoMail.IPServer = mailConfiguration.IPServer;
            dtoMail.MailAddress = mailConfiguration.MailAddress;
            dtoMail.Port = mailConfiguration.Port;
            dtoMail.Username = mailConfiguration.Username;
            dtoMail.Password = mailConfiguration.Password;
            dtoMail.SSL = mailConfiguration.SSL;
            dtoMail.AuthenticationSMTP = mailConfiguration.AuthenticationSMTP;
            dtoMail.IsAnonymousAuth = mailConfiguration.AuthenticationSMTP == "Anonima";
            dtoMail.IsBasicAuth = mailConfiguration.AuthenticationSMTP == "Basica";

            return dtoMail;
        }
        /// <summary>
        /// Obtiene los videowall asociados a la planta
        /// </summary>
        /// <returns>Lista de videowalls de la planta</returns>
        public IEnumerable ObtenerInformacionVideowall()
        {
            IEnumerable listaPantallas = null;

            using (MESEntities context = new MESEntities())
            {
                var query = (from c in context.VideowallConfiguracion.AsNoTracking()
                             join p in context.VideowallPantallas.AsNoTracking() on c.IdPantalla equals p.IdPantalla
                             select new
                             {
                                 c.Id,
                                 c.IdPantalla,
                                 p.Descripcion,
                                 c.Pagina,
                                 c.Visible,
                                 c.Duracion
                             }).ToList();
                listaPantallas = query.OrderBy(x => x.IdPantalla).ThenBy(x => x.Id);
            }

            return listaPantallas;
        }

        /// <summary>
        /// Actualiza los datos de la linea del videowall
        /// </summary>
        /// <returns>Lista de videowalls de la planta</returns>
        public bool ActualizarPantallaVideowall(VideowallConfiguracion datos)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    VideowallConfiguracion videowallconfiguracion = context.VideowallConfiguracion.FirstOrDefault(x => x.Id == datos.Id);

                    if (videowallconfiguracion != null)
                    {
                        videowallconfiguracion.Visible = datos.Visible;
                        videowallconfiguracion.Duracion = datos.Duracion;
                        context.SaveChanges();
                    }
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public List<PerroGuardian> ObtenerDatosPerroGuardian()
        {
            var lista = new List<PerroGuardian>();

            using (MESEntities contexto = new MESEntities())
            {
                lista = contexto.PerroGuardian.AsNoTracking().ToList();
            }

            foreach (var item in lista)
            {
                item.FechaUltimaEjecucion = item.FechaUltimaEjecucion.Value.ToLocalTime();
            }

            return lista;
        }

        public MensajeAdministracion ObtenerMensajeAdministracion()
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    return context.MensajeAdministracion.AsNoTracking().FirstOrDefault();
                }
            }
            catch
            {
                return new MensajeAdministracion();
            }
        }

        public bool ActualizarMensajeAdministracion(DTO_MensajeAdministracion entity)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var param = context.MensajeAdministracion.FirstOrDefault();
                    param.Descripcion = entity.Descripcion;
                    param.Opcion = entity.Opcion;
                    param.Activo = entity.Activo;
                    context.SaveChanges();
                }

                hub.Clients.All.actualizarMensajeAdministracion();

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public List<DTO_TareasScheduler> TareasScheduler()
        {
            try
            {
                // Crear el programador
                ISchedulerFactory schedulerFactory = new StdSchedulerFactory();
                IScheduler scheduler = schedulerFactory.GetScheduler();

                var tareasScheduler = new List<DTO_TareasScheduler>();

                // Obtener las tareas en ejecución
                var executingJobs = scheduler.GetCurrentlyExecutingJobs();
                foreach (var job in executingJobs)
                {
                    // Obtener el JobDataMap para almacenar el inicio de la ejecución
                    var jobDataMap = job.JobDetail.JobDataMap;
                    string tiempoInicioKey = "tiempoInicioEjecucion";  // Clave personalizada en el JobDataMap

                    // Si no tenemos el tiempo de inicio, lo asignamos a la hora actual
                    if (!jobDataMap.ContainsKey(tiempoInicioKey))
                    {
                        jobDataMap[tiempoInicioKey] = DateTime.UtcNow;
                    }

                    // Obtener el tiempo de inicio de ejecución (cuando empezó la tarea a ejecutarse)
                    DateTime tiempoInicio = (DateTime)jobDataMap[tiempoInicioKey];

                    // Calcular el tiempo de ejecución desde que empezó la tarea a ejecutarse
                    var tiempoEjecucion = DateTime.UtcNow - tiempoInicio;
                    string tiempoEjecucionStr = tiempoEjecucion.TotalSeconds.ToString("F2");

                    // Obtener el estado del Trigger
                    var triggerState = scheduler.GetTriggerState(job.Trigger.Key);

                    // Crear la entrada para la tarea en ejecución
                    tareasScheduler.Add(new DTO_TareasScheduler
                    {
                        JobKey = job.JobDetail.Key.Name,
                        TriggerKey = job.Trigger.Key.Name,
                        TipoTarea = "En ejecución",
                        Grupo = job.JobDetail.Key.Group,
                        InicioTrigger = null,  // Vacío ya que está en ejecución
                        UltimaEjecucion = job.Trigger.GetPreviousFireTimeUtc()?.LocalDateTime,
                        ProximaEjecucion = job.Trigger.GetNextFireTimeUtc()?.LocalDateTime,
                        Estado = "En ejecución",
                        // Descripción con el tiempo de ejecución y estado del trigger
                        Descripcion = $"Tiempo de ejecución: {tiempoEjecucionStr} segundos | Estado del Trigger: {triggerState}"
                    });
                }

                // Obtener todas las tareas programadas
                foreach (var group in scheduler.GetJobGroupNames())
                {
                    foreach (var jobKey in scheduler.GetJobKeys(GroupMatcher<JobKey>.GroupEquals(group)))
                    {
                        var triggers = scheduler.GetTriggersOfJob(jobKey);
                        foreach (var trigger in triggers)
                        {
                            var state = scheduler.GetTriggerState(trigger.Key);
                            string cronExpresion = trigger is ICronTrigger cronTrigger ? cronTrigger.CronExpressionString : "N/A";

                            // Obtener el JobDetail para acceder a la descripción
                            var jobDetail = scheduler.GetJobDetail(jobKey);

                            tareasScheduler.Add(new DTO_TareasScheduler
                            {
                                JobKey = jobKey.Name,
                                TriggerKey = trigger.Key.Name,
                                TipoTarea = "Programada",
                                Grupo = jobKey.Group,
                                InicioTrigger = trigger.StartTimeUtc.LocalDateTime,
                                UltimaEjecucion = trigger.GetPreviousFireTimeUtc()?.LocalDateTime,
                                ProximaEjecucion = trigger.GetNextFireTimeUtc()?.LocalDateTime,
                                CronExpresion = cronExpresion,
                                Estado = state.ToString(),
                                Descripcion = jobDetail?.Description
                            });
                        }
                    }
                }

                return tareasScheduler;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
        }

    }
}