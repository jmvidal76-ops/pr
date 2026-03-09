using MSM.Models.Envasado;
using MSM.Security;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using MSM.BBDD.Planta;
using MSM.BBDD;
using MSM.Controllers.Planta;
using MSM.BBDD.Model;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class AccionesMejoraController : ApiController
    {
        [Route("api/accionesMejora")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_22_VisualizacionSintesisDeParos, Funciones.ENV_PROD_EXE_24_VisualizacionSintesisDeCambio,
                      Funciones.ENV_PROD_EXE_26_VisualizacionSintesisDeArranque)]
        public IEnumerable<AccionMejora> GetAccionesMejora(dynamic datos)
        {
            try
            {
                List<AccionMejora> listaAccionMejora = new List<AccionMejora>();
                DAO_AccionMejora daoAccionMejora = new DAO_AccionMejora();

                listaAccionMejora = daoAccionMejora.ObtenerAccionesMejora(datos);
                
                return listaAccionMejora;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.GetAcciones", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.GetAcciones", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ACCIONES"));
            }
        }

        [Route("api/accionesMejora/{idAccion}/ParosPerdidas")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_22_VisualizacionSintesisDeParos)]
        public IEnumerable GetParosPerdidas(int idAccion)
        {
            try
            {
                List<ParosPerdidas> parosPerdidas = null;
                DAO_AccionMejora daoAccionesMejoras = new DAO_AccionMejora();

                parosPerdidas = daoAccionesMejoras.ObtenerAccionMejoraParosPerdidas(idAccion);
                
                return parosPerdidas.Select(p => new
                {
                    p.Id,
                    p.TipoParoPerdida,
                    p.IdLinea,
                    p.DescLinea,
                    p.NumeroLineaDescripcion,
                    p.FechaTurno,
                    p.IdTipoTurno,
                    p.NombreTipoTurno,
                    InicioLocal = p.InicioLocal.HasValue ? p.InicioLocal.Value.AddMilliseconds(- p.InicioLocal.Value.Millisecond) : p.InicioLocal,
                    FinLocal = p.FinLocal.HasValue ? p.FinLocal.Value.AddMilliseconds(- p.FinLocal.Value.Millisecond) : p.FinLocal,
                    p.EquipoDescripcion,
                    p.MaquinaCausaNombre,
                    p.EquipoNombre,
                    p.EquipoConstructivoNombre,
                    p.MotivoNombre,
                    p.CausaNombre,
                    p.Descripcion,
                    p.Observaciones,
                    Duracion = TimeSpan.FromMinutes(p.Duracion).ToString(@"hh\:mm\:ss"),
                });
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.GetParosPerdidas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.GetParosPerdidas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS"));
            }
        }

        [Route("api/accionesMejora/{idAccion}/Cambios")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_24_VisualizacionSintesisDeCambio)]
        public List<OrdenesCambio> GetCambios(int idAccion)
        {
            try
            {
                List<OrdenesCambio> cambios = null;
                DAO_AccionMejora daoAccionesMejoras = new DAO_AccionMejora();

                cambios = daoAccionesMejoras.ObtenerAccionMejoraCambios(idAccion);
                
                return cambios;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.GetCambios", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.GetCambios", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CAMBIOS"));
            }
        }

        [Route("api/accionesMejora/{idAccion}/Arranques")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_26_VisualizacionSintesisDeArranque)]
        public List<OrdenesArranque> GetArranques(int idAccion)
        {
            try
            {
                List<OrdenesArranque> arranques = null;
                DAO_AccionMejora daoAccionesMejoras = new DAO_AccionMejora();
                
                arranques = daoAccionesMejoras.ObtenerAccionMejoraArranques(idAccion);
                
                return arranques;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.GetArranque", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.GetArranques", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ARRANQUES"));
            }
        }

        [Route("api/accionesMejora/insertar")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_23_GestionSintesisDeParos,
                      Funciones.ENV_PROD_EXE_25_GestionSintesisDeCambio,
                      Funciones.ENV_PROD_EXE_28_GestionSintesisDeArranque)]
        public long InsertarAccionMejora(AccionMejora accion)
        {
            try
            {
                accion.fechaAlta = DateTime.Now.ToUniversalTime();
                accion.usuario = HttpContext.Current.User.Identity.Name;

                DAO_AccionMejora daoParoPerdidas = new DAO_AccionMejora();
                daoParoPerdidas.InsertarAccionMejora(accion);

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.insertarAccionMejora", "Creada accion de mejora: " + accion.id, HttpContext.Current.User.Identity.Name);

                return accion.id;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.insertarAccionMejora", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.insertarAccionMejora", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_UNA"));
            }
        }

        [Route("api/accionesMejora/insertarParoMayor/{idAccion}/{idParoMayor}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_23_GestionSintesisDeParos)]
        public void InsertarAccionMejoraParoMayor(long idAccion, long idParoMayor)
        {
            try
            {
                DAO_AccionMejora daoParoPerdidas = new DAO_AccionMejora();
                daoParoPerdidas.InsertarAccionMejoraParoMayor(idAccion, idParoMayor);
                
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.insertarParoMayor", "Añadido paro mayor: " + idParoMayor + " a acción de mejora: " + idAccion, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.insertarParoMayor", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.insertarAccionMejoraParoMayor", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_UNA"));
            }
        }

        [Route("api/accionesMejora/insertarCambio/{idAccion}/{idCambio}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_25_GestionSintesisDeCambio)]
        public void InsertarAccionMejoraCambio(long idAccion, string idCambio)
        {
            try
            {
                DAO_AccionMejora daoParoPerdidas = new DAO_AccionMejora();
                daoParoPerdidas.InsertarAccionMejoraCambio(idAccion, idCambio);
                
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.insertarCambio", "Añadido cambio: " + idCambio + " a acción de mejora: " + idAccion, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.insertarAccionMejora", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.insertarAccionMejoraCambio", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_UNA"));
            }
        }

        [Route("api/accionesMejora/insertarArranque/{idAccion}/{idArranque}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_28_GestionSintesisDeArranque)]
        public void InsertarAccionMejoraArranque(long idAccion, string idArranque)
        {
            try
            {
                DAO_AccionMejora daoParoPerdidas = new DAO_AccionMejora();
                daoParoPerdidas.InsertarAccionMejoraArranque(idAccion, idArranque);
                
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.insertarArranque", "Añadido arranque: " + idArranque + " a acción de mejora: " + idAccion, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.insertarAccionMejora", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.insertarAccionMejoraArranque", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_UNA"));
            }
        }

        [Route("api/accionesMejora/actualizar")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_23_GestionSintesisDeParos,
                      Funciones.ENV_PROD_EXE_25_GestionSintesisDeCambio,
                      Funciones.ENV_PROD_EXE_28_GestionSintesisDeArranque)]
        public long ActualizarAccionMejora(AccionMejora accion)
        {
            try
            {
                //accion.fechaAlta = DateTime.Now.ToUniversalTime();
                accion.usuario = HttpContext.Current.User.Identity.Name;
                DAO_AccionMejora daoParoPerdidas = new DAO_AccionMejora();
                
                daoParoPerdidas.ActualizarAccionMejora(accion);
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.actualizarAccionMejora", "Modificada acción de mejora: " + accion.id, HttpContext.Current.User.Identity.Name);

                return accion.id;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.actualizarAccionMejora", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.actualizarAccionMejora", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_UNA"));
            }
        }

        [Route("api/accionesMejora/eliminar/{idAccion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_23_GestionSintesisDeParos, 
                      Funciones.ENV_PROD_EXE_25_GestionSintesisDeCambio,
                      Funciones.ENV_PROD_EXE_28_GestionSintesisDeArranque)]
        public void EliminarAccionMejora(int idAccion)
        {
            try
            {
                DAO_AccionMejora daoParoPerdidas = new DAO_AccionMejora();
                daoParoPerdidas.EliminarAccionMejora(idAccion);
                
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.EliminarAccionMejora", "Eliminada acción de mejora: " + idAccion, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.EliminarAccionMejora", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.EliminarAccionMejora", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_UNA_ACCION"));
            }
        }

        [Route("api/accionesMejora/eliminarParosPerdidas/{idAccion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_23_GestionSintesisDeParos)]
        public void EliminarAccionMejoraParosPerdidas(int idAccion)
        {
            try
            {
                DAO_AccionMejora daoAccionesMejoras = new DAO_AccionMejora();
                daoAccionesMejoras.EliminarAccionMejoraParosPerdidas(idAccion);

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.EliminarAccionMejoraParosPerdidas", "Eliminados paros y perdidas de acción de mejora: " + idAccion, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.EliminarAccionMejora", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.EliminarAccionMejoraParosPerdidas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_UNA_ACCION"));
            }
        }

        [Route("api/accionesMejora/eliminarCambios/{idAccion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_25_GestionSintesisDeCambio)]
        public void EliminarAccionMejoraCambios(int idAccion)
        {
            try
            {
                DAO_AccionMejora daoAccionesMejoras = new DAO_AccionMejora();
                daoAccionesMejoras.EliminarAccionMejoraCambios(idAccion);

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.EliminarAccionMejoraCambios", "Eliminados cambios de acción de mejora: " + idAccion, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.EliminarAccionMejoraCambios", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.EliminarAccionMejoraCambios", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_UNA_ACCION"));
            }
        }

        [Route("api/accionesMejora/eliminarArranques/{idAccion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_28_GestionSintesisDeArranque)]
        public void EliminarAccionMejoraArranques(int idAccion)
        {
            try
            {
                DAO_AccionMejora daoAccionesMejoras = new DAO_AccionMejora();
                daoAccionesMejoras.EliminarAccionMejoraArranques(idAccion);
                
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.EliminarAccionMejoraArranques", "Eliminados arranques de acción de mejora: " + idAccion, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.EliminarAccionMejoraArranques", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraController.EliminarAccionMejoraArranques", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_UNA_ACCION"));
            }
        }
    }
}