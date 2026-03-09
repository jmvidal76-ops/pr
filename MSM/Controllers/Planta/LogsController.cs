using MSM.BBDD.Planta;
using MSM.Models.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace MSM.Controllers.Planta
{
    [Authorize]
    public class LogsController : ApiController
    {
        
        [Route("api/obtenerLogUsuarios")]
        [HttpPost]
        [ApiAuthorize(Funciones.UC_GEN_TT_1_VisualizacionLogUsuarios)]
        public List<Log> obtenerLogUsuarios(dynamic datos)
        {
            try
            {
                List<Log> log = null;
                DAO_Log daoLog = new DAO_Log();
                //Desde Javascript vienen las fechas en UTC
                DateTime fInicio = ((DateTime)datos.fInicio.Value).ToLocalTime();
                DateTime fFin = ((DateTime)datos.fFin.Value).ToLocalTime();
                log = daoLog.ObtenerLogUsuarios(fInicio, fFin);

                return log;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogsController.obtenerLogUsuarios", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_LOG"));
            }
        }

        [Route("api/obtenerLogBook")]
        [HttpPost]
        [ApiAuthorize(Funciones.UC_GEN_TT_3_VisualizacionLogAplicacion)]
        public List<LogbookRecord> obtenerLogBoook(dynamic datos)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                DateTime fInicio = ((DateTime)datos.fInicio.Value).ToLocalTime();
                DateTime fFin = ((DateTime)datos.fFin.Value).ToLocalTime();

                return DAO_Log.ObtenerLogBook(fInicio, fFin);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogsController.obtenerLogBook", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOGBOOK"));
            }
        }

        [Route("api/obtenerLogIncidencias")]
        [HttpPost]
        [ApiAuthorize(Funciones.UC_GEN_TT_3_VisualizacionHistoricoIncidencias)]
        public List<LogIncidenciasRecord> obtenerLogIncidencias(dynamic datos)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                DateTime fInicio = ((DateTime)datos.fInicio.Value).ToLocalTime();
                DateTime fFin = ((DateTime)datos.fFin.Value).ToLocalTime();

                return DAO_Log.ObtenerLogIncidencias(fInicio, fFin);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogsController.obtenerLogIncidencias", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOGINCIDENCIAS"));
            }
        }
    }
}
