using log4net;
using MSM.Controllers.Planta;
using MSM.Models.Planta;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Planta
{

    public class DAO_Log 
    {
        private static bool trazasActivas = Convert.ToBoolean(ConfigurationManager.AppSettings["Trazas"]);
        private static readonly object lockerFile = new object();
        private static readonly ILog logMSM = LogManager.GetLogger("TriggersLogger");

        // LOGS PARA EVENTOS DE USUARIO

        public static void RegistrarLogUsuarios(DateTime fechaHora, string funcion, string incidencia, string usuario)
        {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlCommand comando = new SqlCommand("[APP_RegistrarLog]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@fechaHora", fechaHora);
            comando.Parameters.AddWithValue("@funcion", funcion);
            comando.Parameters.AddWithValue("@tipo", "ACCION");
            comando.Parameters.AddWithValue("@incidencia", incidencia);
            comando.Parameters.AddWithValue("@usuario", usuario);
            comando.Parameters.AddWithValue("@traza", DBNull.Value);
            
            try
            {
                conexion.Open();
                comando.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                registrarLog("incidencias.log", fechaHora.ToString() + "\r\n" + usuario + "\r\n" + funcion + "\r\n" + incidencia + " --- " + ex.Message);
            }
            finally
            {
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        public static void logUsuario(string format, params object[] args)
        {
            var frame = new System.Diagnostics.StackFrame(1);
            var method = frame.GetMethod();
            var metodo = string.Format("{0}.{1}", method.ReflectedType.Name, method.Name);
            var texto = (args != null && args.Length > 0 ? string.Format(format, args) : format);
            DAO_Log.RegistrarLogUsuarios(DateTime.Now, metodo, texto, HttpContext.Current.User.Identity.Name);
        }

        /// <summary>
        /// Registrar Log
        /// </summary>
        /// <param name="funcion"></param>
        /// <param name="message"></param>
        public static void registrarLog(string filename, string message)
        {
            try
            {
                string path = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Log\\" + filename);
                if (!Directory.Exists(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Log")))
                {
                    Directory.CreateDirectory(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Log"));
                }
                if (!File.Exists(path))
                {
                    FileStream file = File.Create(path);
                    file.Close();
                }

                File.AppendAllText(path, message);
            }
            catch (Exception)
            {
            }
        }

        /// <summary>
        /// Registrar Trazas
        /// </summary>
        /// <param name="funcion"></param>
        /// <param name="message"></param>
        public static void registrarLogTraza(string clase, string method, string message)
        {
            if (trazasActivas)
            {
                lock (lockerFile)
                {
                    string path = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Log\\trazas.log");

                    if (!Directory.Exists(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Log")))
                    {
                        Directory.CreateDirectory(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Log"));
                    }

                    if (!File.Exists(path))
                    {
                        FileStream file = File.Create(path);
                        file.Close();
                    }

                    File.AppendAllText(path, string.Format("Fecha: {0}, Clase: {1}, Método: {2}, Traza: {3}\r\n", DateTime.Now.ToString(), clase, method, message));
                }
            }
        }

        public List<Log> ObtenerLogUsuarios(DateTime startDate, DateTime endDate)
        {
            List<Log> log = new List<Log>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[APP_ObtenerLogUsuarios]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@startDate", startDate);
            comando.Parameters.AddWithValue("@endDate", endDate);
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    log.Add(new Log(
                        DataHelper.GetLong(dr, "Id"),
                        DataHelper.GetDateForFilter(dr, "FechaHora"),
                        DataHelper.GetString(dr, "Funcion"),
                        DataHelper.GetString(dr, "Tipo"),
                        DataHelper.GetString(dr, "Evento"),
                        DataHelper.GetString(dr, "Usuario")
                    ));
                }
            }

            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Log.obtenerLogUsuarios", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Log.obtenerLogUsuarios", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOG"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return log;
        }

        internal static List<LogIncidenciasRecord> ObtenerLogIncidencias(DateTime startDate, DateTime endDate)
        {
            List<LogIncidenciasRecord> listaLogIncidencias = new List<LogIncidenciasRecord>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[APP_ObtenerLogIncidenciasIntervalo]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@startDate", startDate);
                    command.Parameters.AddWithValue("@endDate", endDate);
                    connection.Open();
                    using (SqlDataReader dr = command.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            LogIncidenciasRecord log = new LogIncidenciasRecord();

                            log.ID_INCIDENCIA = DataHelper.GetInt(dr, "ID_INCIDENCIA");
                            log.USUARIO = DataHelper.GetString(dr, "USUARIO");
                            log.DESCRIPCION = DataHelper.GetString(dr, "DESCRIPCION");
                            log.PANTALLA = DataHelper.GetString(dr, "PANTALLA");
                            log.APLICACION = DataHelper.GetString(dr, "APLICACION");
                            log.FECHA_CREACION = DataHelper.GetDate(dr, "FECHA_CREACION");
                            listaLogIncidencias.Add(log);
                        }
                    }
                }
            }
            return listaLogIncidencias;
        }

        internal static List<LogbookRecord> ObtenerLogBook(DateTime startDate, DateTime endDate)
        {
            List<LogbookRecord> listaLogBook = new List<LogbookRecord>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[APP_ObtenerLogBookIntervalo]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@startDate", startDate);
                    command.Parameters.AddWithValue("@endDate", endDate);
                    command.CommandTimeout = 180;
                    connection.Open();

                    using (SqlDataReader dr = command.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            LogbookRecord logMSM = new LogbookRecord();

                            logMSM.applicationID = DataHelper.GetString(dr, "ApplicationId");
                            logMSM.computerName = DataHelper.GetString(dr, "ComputerName");
                            logMSM.section = DataHelper.GetInt(dr, "Section");
                            logMSM.level = DataHelper.GetInt(dr, "Level");
                            logMSM.description = DataHelper.GetString(dr, "Description");
                            logMSM.Fecha = DataHelper.GetDateForFilter(dr, "TimeStamp").ToLocalTime();
                            logMSM.objectId = DataHelper.GetString(dr, "Id");
                            logMSM.processName = DataHelper.GetString(dr, "ProcessName");
                            logMSM.userName = DataHelper.GetString(dr, "UserName");

                            listaLogBook.Add(logMSM);
                        }
                    }
                }
            }
            return listaLogBook;
        }

        public static void RegistrarLogBook(string applicationID, int section, int level, string description, string objectID, string processName, string username)
        {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlCommand comando = new SqlCommand("[APP_RegistrarLogBookWeb]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@TimeStamp", DateTime.Now.ToUniversalTime());
            comando.Parameters.AddWithValue("@Bias", TimeZoneInfo.Local.GetUtcOffset(DateTime.UtcNow).TotalMinutes);
            comando.Parameters.AddWithValue("@ApplicationId", applicationID);
            comando.Parameters.AddWithValue("@Section", section);
            comando.Parameters.AddWithValue("@Level", level);
            comando.Parameters.AddWithValue("@Description", description);
            comando.Parameters.AddWithValue("@ObjectId", objectID);
            comando.Parameters.AddWithValue("@ProcessName", processName);
            comando.Parameters.AddWithValue("@UserName", username);
            comando.Parameters.AddWithValue("@ComputerName", "SYSTEM");
            
            try
            {
                conexion.Open();
                comando.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                registrarLog("incidencias.log", DateTime.Now + "\r\n" + username + "\r\n" + processName + "\r\n" + description + " --- " + ex.Message);
            }
            finally
            {
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        public static void EscribeLog(string cabecera, string descripcion, string tipo)
        {
            string mensajeLog = cabecera + " - " + descripcion;

            switch (tipo)
            {
                case "Info":
                    logMSM.Info(mensajeLog);
                    break;
                case "Debug":
                    logMSM.Debug(mensajeLog);
                    break;
                case "Error":
                    logMSM.Error(mensajeLog);
                    break;
                case "Aviso":
                    logMSM.Warn(mensajeLog);
                    break;
            }
        }
    }
}
