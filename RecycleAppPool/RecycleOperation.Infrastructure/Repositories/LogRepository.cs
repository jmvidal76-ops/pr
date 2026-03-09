using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RecycleAppPool.Infrastructure.Repositories
{
    public class LogRePository
    {
        private static string appName = System.Diagnostics.Process.GetCurrentProcess().ProcessName;

        /// <summary>
        /// Método para registra el log en BBDD
        /// </summary>
        /// <param name="funcion">Nombre dél método desde el que se registra la incidencia</param>
        /// <param name="incidencia">Excepción</param>
        public static void registrarLogProcesos(string funcion, Exception incidencia)
        {
            using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[APP_RegistrarLogProcesos]", conn))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@fechaHora", DateTime.Now);
                    command.Parameters.AddWithValue("@funcion", funcion);
                    command.Parameters.AddWithValue("@tipo", appName);
                    command.Parameters.AddWithValue("@incidencia", incidencia.Message);
                    command.Parameters.AddWithValue("@usuario", "Sistema");
                    command.Parameters.AddWithValue("@traza", incidencia.StackTrace);

                    conn.Open();
                    command.ExecuteNonQuery();
                }
            }
        }

        /// <summary>
        /// Método para registra el log en BBDD
        /// </summary>
        /// <param name="funcion">Nombre dél método desde el que se registra la traza</param>
        /// <param name="incidencia">Información de la traza</param>
        public static void registrarLogProcesos(string funcion, string incidencia)
        {
            using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[APP_RegistrarLogProcesos]", conn))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@fechaHora", DateTime.Now);
                    command.Parameters.AddWithValue("@funcion", funcion);
                    command.Parameters.AddWithValue("@tipo", appName);
                    command.Parameters.AddWithValue("@incidencia", incidencia);
                    command.Parameters.AddWithValue("@usuario", "Sistema");
                    command.Parameters.AddWithValue("@traza", DBNull.Value);

                    conn.Open();
                    command.ExecuteNonQuery();
                }
            }
        }
    }
}
