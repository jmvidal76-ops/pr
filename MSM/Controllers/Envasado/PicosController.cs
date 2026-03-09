using BreadMES.Envasado;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Envasado;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class PicosController : ApiController
    {
        private readonly IDAO_Turnos _iDAOTurnos;

        public PicosController(IDAO_Turnos iDAOTurnos)
        {
            _iDAOTurnos = iDAOTurnos;
        }

        [Route("api/obtenerPicos/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_43_VisualizacionPicos)]
        public List<Pico> obtenerPicos(int idTurno)
        {
            try
            {
                List<Pico> listaPicos = null;
                DAO_Picos daoPicos = new DAO_Picos();
                listaPicos = daoPicos.ObtenerPicos(idTurno);

                return listaPicos;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PicosController.obtenerPicos", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PICOS"));
            }
        }

        [Route("api/crearPico")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO, 
                      Funciones.ENV_PROD_EXE_42_GestionPicos)]
        public async Task<bool> crearPico(Pico datosPico)
        {
            try
            {
                //bool returnValue = PicosBread.CrearPico(datosPico.particion, datosPico.turno, datosPico.cantidad);
                bool returnValue = DAO_Picos.CrearPico(datosPico);

                if (returnValue)
                {
                    DAO_Orden.actualizarDatosOrden(datosPico.particion, datosPico.linea);
                    await _iDAOTurnos.SetTurnoParaRecalculoICT(datosPico.turno);

                    DAO_Picos daoPicos = new DAO_Picos();
                    Pico _ultimoPico = daoPicos.ObtenerPicos(datosPico.turno).LastOrDefault();
                    
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "PicosController.crearPico", 
                        IdiomaController.GetResourceName("PICO_AÑADIDO") + ". " + " " + 
                        IdiomaController.GetResourceName("ID_PICO") + ": " + _ultimoPico.idPico + "; " + 
                        IdiomaController.GetResourceName("IDTURNO") + ": " + datosPico.turno + "; " +
                        IdiomaController.GetResourceName("FECHA_TURNO") + ": " + datosPico.fechaTurno.ToLocalTime().ToShortDateString() + "; " +
                        IdiomaController.GetResourceName("TURNO") + ": " + datosPico.TipoTurno + "; " +
                        IdiomaController.GetResourceName("PARTICION") + ": " + datosPico.particion + "; " + 
                        IdiomaController.GetResourceName("CANTIDAD") + ": " + datosPico.cantidad, 
                        HttpContext.Current.User.Identity.Name);
                }

                return returnValue;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PicosController.CrearPico", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/modificarPico")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO, 
                      Funciones.ENV_PROD_EXE_42_GestionPicos)]
        public async Task<bool> modificarPico(Pico datosPico)
        {
            try
            {
                //bool returnValue = PicosBread.ModificarPico(datosPico.idPico, datosPico.particion, datosPico.cantidad, datosPico.turno);
                bool returnValue = DAO_Picos.ModificarPico(datosPico);

                if (returnValue)
                {
                    DAO_Orden.actualizarDatosOrden(datosPico.particion, datosPico.linea);
                    await _iDAOTurnos.SetTurnoParaRecalculoICT(datosPico.turno);
                   
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "PicosController.modificarPico",
                        IdiomaController.GetResourceName("PICO_MODIFICADO") + ". " + " " + 
                        IdiomaController.GetResourceName("ID_PICO") + ": " + datosPico.idPico + "; " + 
                        IdiomaController.GetResourceName("IDTURNO") + ": " + datosPico.turno + "; " +
                        IdiomaController.GetResourceName("FECHA_TURNO") + ": " + datosPico.fechaTurno.ToLocalTime().ToShortDateString() + "; " +
                        IdiomaController.GetResourceName("TURNO") + ": " + datosPico.TipoTurno + "; " +
                        IdiomaController.GetResourceName("PARTICION") + ": " + datosPico.particion + "; " +
                        IdiomaController.GetResourceName("CANTIDAD") + ": " + datosPico.cantidad, 
                        HttpContext.Current.User.Identity.Name);
                }

                return returnValue;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PicosController.ModificarPico", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/eliminarPico")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO, 
                      Funciones.ENV_PROD_EXE_42_GestionPicos)]
        public async Task<bool> eliminarPico(Pico pico)
        {
            try
            {
                //bool returnValue = PicosBread.EliminarPico(pico.idPico);
                bool returnValue = DAO_Picos.EliminarPico(pico.idPico);

                if (returnValue)
                {
                    DAO_Orden.actualizarDatosOrden(pico.particion, pico.linea);
                    await _iDAOTurnos.SetTurnoParaRecalculoICT(pico.turno);
                    
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "PicosController.eliminarPico",
                        IdiomaController.GetResourceName("PICO_ELIMINADO") + " " + " " + 
                        IdiomaController.GetResourceName("ID_PICO") + ": " + pico.idPico + "; " + 
                        IdiomaController.GetResourceName("IDTURNO") + ": " + pico.turno + "; " +
                        IdiomaController.GetResourceName("FECHA_TURNO") + ": " + pico.fechaTurno.ToLocalTime().ToShortDateString() + "; " +
                        IdiomaController.GetResourceName("TURNO") + ": " + pico.TipoTurno + "; " +
                        IdiomaController.GetResourceName("PARTICION") + ": " + pico.particion + "; " + 
                        IdiomaController.GetResourceName("CANTIDAD") + ": " + pico.cantidad, 
                        HttpContext.Current.User.Identity.Name);
                }
                return returnValue;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PicosController.EliminarPico", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/obtenerPicosOrdenParticion/{idOrdenParticion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas, Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public List<Pico> ObtenerPicosOrdenParticion(string idOrdenParticion)
        {
            try
            {
                DAO_Picos daoPicos = new DAO_Picos();
                return daoPicos.ObtenerPicosOrdenParticion(idOrdenParticion);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PicosController.obtenerNumeroPicosParticion", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_NUMERO"));
            }
        }
    }
}
