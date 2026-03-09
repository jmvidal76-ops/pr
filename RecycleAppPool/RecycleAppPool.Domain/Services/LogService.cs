using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecycleAppPool.Infrastructure.Repositories;

namespace RecycleAppPool.Domain.Services
{
    public class LogService
    {
        /// <summary>
        /// Método para registra el log en BBDD
        /// </summary>
        /// <param name="funcion">Nombre dél método desde el que se registra la incidencia</param>
        /// <param name="incidencia">Excepción</param>
        public static void registrarLogProcesos(string funcion, Exception incidencia) 
        {
            LogRePository.registrarLogProcesos(funcion, incidencia);
        }

        /// <summary>
        /// Método para registra el log en BBDD
        /// </summary>
        /// <param name="funcion">Nombre dél método desde el que se registra la traza</param>
        /// <param name="incidencia">Información de la traza</param>
        public static void registrarLogProcesos(string funcion, string incidencia) 
        {
            LogRePository.registrarLogProcesos(funcion, incidencia);
        }
    }
}
