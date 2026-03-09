using MSM.BBDD.Fabricacion;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Fabricacion;
using MSM.Security;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    public class ProcedimientosFABController : ApiController
    {
        private readonly IDAO_ProcesoSAI _idao_ProcesoSAI;

        public ProcedimientosFABController(IDAO_ProcesoSAI idao_ProcesoSAI)
        {
           _idao_ProcesoSAI = idao_ProcesoSAI;
        }



        /// <summary>
        /// Funcion que devuelve la lista de procedimientos de una orden
        /// </summary>
        /// param name="idOrden" recibe el id (PK) de la orden
        /// returns Lista de ordenes
        [Route("api/OrdenesFab/GetProcedimientosOrden/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<Procedimiento> GetProcedimientosOrden(int idOrden)
        {
            try
            {
                List<Procedimiento> listaProcedimientos = new List<Procedimiento>();
                listaProcedimientos = DAO_Procedimiento.GetProcedimientosOrden(idOrden);
                return listaProcedimientos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.GetProcedimientosOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.GetProcedimientosOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PROCEDIMIENTOS_DE"));
            }
        }

        [Route("api/OrdenesFab/GetProcedimientosOrdenDetalle/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<ProcesoWO> GetProcedimientosOrdenDetalle(int idOrden)
        {
            try
            {
                return DAO_Procedimiento.GetProcedimientosOrdenDetalle(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.GetProcedimientosOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.GetProcedimientosOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PROCEDIMIENTOS_DE"));
            }
        }

        [Route("api/OrdenesFab/GetProcedimientosOrdenByPO/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<Procedimiento> GetProcedimientosOrdenByPO(int idOrden)
        {
            try
            {
                List<Procedimiento> listaProcedimientos = new List<Procedimiento>();
                listaProcedimientos = DAO_Procedimiento.GetProcedimientosOrdenByPO(idOrden);
                return listaProcedimientos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.GetProcedimientosOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.GetProcedimientosOrdenByPO", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PROCEDIMIENTOS_DE"));
            }
        }
        /// <summary>
        /// Funcion que devuelve la lista de procedimientos de una orden incluyendo el de la orden de coccion
        /// </summary>
        /// param name="idOrden" recibe el id (PK) de la orden
        /// returns Lista de ordenes
        [Route("api/OrdenesFab/GetProcedimientosOrdenConWP/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<List<Procedimiento>> GetProcedimientosOrdenConWP(int idOrden)
        {
            try
            {
                List<Procedimiento> listaProcedimientos = new List<Procedimiento>();
                DAO_Procedimiento _daoProcedimiento = new DAO_Procedimiento();
                listaProcedimientos = await _daoProcedimiento.GetProcedimientosOrdenConWP(idOrden);
                return listaProcedimientos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.GetProcedimientosOrdenConWP", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.GetProcedimientosOrdenConWP", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PROCEDIMIENTOS_DE_UNA"));
            }
        }

        [Route("api/OrdenesFab/GetProcedimientosByWoType/{Type}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<List<Procedimiento>> GetProcedimientosByWoType(String type)
        {
            try
            {
                List<Procedimiento> listaProcedimientos = new List<Procedimiento>();
                DAO_Procedimiento _daoProc = new DAO_Procedimiento();
                listaProcedimientos = await _daoProc.GetProcedimientosOrdenConWo(type);
                return listaProcedimientos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.GetProcedimientosOrdenConWP", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.GetProcedimientosByWoType", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PROCEDIMIENTOS_DE_UNA"));
            }
        }

        [Route("api/crearProceso")]
        [HttpPost]
        public async Task<bool> CrearProceso(dynamic datos)
        {
            try
            {
                var daoProcedimiento = new DAO_Procedimiento();
                return await daoProcedimiento.CrearProceso(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.CrearProceso", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.CrearProceso", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_CREAR_UN_PROCEDIMIENTO"));
            }
        }

        [Route("api/UpdateProc")]
        [HttpPost]
        public bool UpdateProc(dynamic datos)
        {
            try
            {
                DateTime? startDate = DateTime.Parse(datos.startDate.ToString());
                DateTime? endDate = DateTime.Parse(datos.endDate.ToString());
                var daoProcedimiento = new DAO_Procedimiento();
                return daoProcedimiento.UpdateProcessDateTime(datos.entryPK.ToString(), startDate, endDate);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.UpdateProc", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.UpdateProc", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_ACTUALIZAR"));
            }
        }

        /// <summary>
        /// Funcion que cambia el estado de un procedimiento
        /// </summary>
        /// returns bool
        [Route("api/cambiarEstadoProc")]
        [HttpPost]
        public bool cambiaEstadoProcedimiento(dynamic datos)
        {
            try
            {
                var daoProcedimiento = new DAO_Procedimiento();
                return daoProcedimiento.cambiaEstadoProcedimiento(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.cambiaEstadoProcedimiento", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.cambiaEstadoProcedimiento", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_EL_ESTADO"));
            }
        }


        /// <summary>
        /// Funcion que busca los mensajes de DeltaV para ese procedimiento
        /// </summary>
        /// returns Lista de Mensajes
        [Route("api/Procedimiento/ObtenerMensajesDeltaV/{orden}/{idSubProcesoSAI}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<List<msgDeltaV>> ObtenerMensajesDeltaV(string orden, string idSubProcesoSAI)
        {
            try
            {
                List<msgDeltaV> list = await _idao_ProcesoSAI.ObtenerListadoSubProcesoSAI(orden, idSubProcesoSAI);

                return  list;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.ObtenerMensajesDeltaV", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.ObtenerMensajesDeltaV", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_BUSCANDO_LOS_MENSAJES"));
            }
        }


        /// <summary>
        /// Funcion que manda los datos al metodo de duplicar un procedimiento
        /// </summary>
        /// returns Lista de Mensajes
        [Route("api/duplicarEntry")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO)]
        public bool DuplicarEntry(dynamic datos)
        {
            try
            {
                var daoProcedimiento = new DAO_Procedimiento();
                return daoProcedimiento.DuplicarEntry(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.DuplicarEntry", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.DuplicarEntry", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_DUPLICAR"));
            }
        }


        /// <summary>
        /// Funcion que manda los datos al metodo de duplicar un procedimiento
        /// </summary>
        /// returns Lista de Mensajes
        [Route("api/ObtenerFechasProcHistorian/{orden}/{proc}/{check}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<string> ObtenerFechasProcHistorian(int orden, int proc, int check)
        {
            try
            {
                return DAO_Procedimiento.ObtenerFechasProcHistorian(orden, proc, check);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.ObtenerFechasProcHistorian", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.ObtenerFechasProcHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_BUSCANDO_LAS"));
            }
        }

        /// <summary>
        /// Funcion que manda los datos al metodo de editar
        /// </summary>
        /// returns Lista de Mensajes
        [Route("api/editarProcedimiento")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO)]
        public bool editarProcedimiento(dynamic datos)
        {
            try
            {
                var daoProcedimiento = new DAO_Procedimiento();
                ReturnValue ret = daoProcedimiento.editarProcedimiento(datos);
                
                if (!ret.succeeded)// si el succeeded es falso guardamos el mensjae de error
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "ProcedimientosFabController.editarProcedimiento", "WEB-FABRICACION", "Sistema");

                return true;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProcedimientosFabController.editarProcedimiento", ex, HttpContext.Current.User.Identity.Name);
                //DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.editarProcedimiento", "WEB-FABRICACION", "Sistema");
                //throw new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_LA"));
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ProcedimientosFabController.editarProcedimiento", "WEB-FABRICACION", "Sistema");
                return true;
            }
        }

    }
}