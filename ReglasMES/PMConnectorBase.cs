using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using G2Base;

namespace ReglasMES
{
    /// <summary>
    /// Clase base para las conexiones al production modeler
    /// </summary>
    public static class PMConnectorBase
    {
        private static string hostName = ConfigurationManager.AppSettings["IP_SIMATIC"];
        private static string port = ConfigurationManager.AppSettings["PUERTO_SIMATIC"];
        private static PMConnector pmConn = null;

        public static PMConnector PmConexion
        {
            get
            {
                return pmConn;
            }
        }

        /// <summary>
        /// Método para inicializar los valores necesarios para realizar la conexión
        /// </summary>
        private static void Inicialize()
        {
            if (pmConn == null)
            {
                pmConn = new PMConnector();
                pmConn.G2HostName = hostName;
                pmConn.G2Port = port;
            }
        }

        /// <summary>
        /// Método que establece la conexión con el production modeler en caso de que no esté activa.
        /// </summary>
        public static bool Connect()
        {
            Inicialize();

            return pmConn.IsConnected ? pmConn.IsConnected : pmConn.Connect();
        }

        /// <summary>
        /// Método para realizar la desconexión con el Production Modeler
        /// </summary>
        public static void Disconnect()
        {
            pmConn.Disconnect();
        }

        /// <summary>
        /// Método para liberar recursos de la conexión.
        /// </summary>
        public static void Dispose()
        {
            pmConn.Dispose();
        }
    }
}
