using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
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
    public class AccionesCorrectivasTurnoController : ApiController
    {
        private readonly IDAO_AccionesCorrectivasTurno _iDAOAccionesCorrectivasTurno;

        public AccionesCorrectivasTurnoController(IDAO_AccionesCorrectivasTurno iDAOAccionesCorrectivasTurno)
        {
            _iDAOAccionesCorrectivasTurno = iDAOAccionesCorrectivasTurno;
        }

        /// <summary>
        /// Método que obtiene las AccionesCorrectivas de un turno
        /// </summary>
        /// <param name="idTurno">Id del turno</param>
        /// <returns>Lista con los datos solicitados</returns>
        [Route("api/accionesCorrectivasTurno/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_20_VisualizacionParosPerdidasLlenadora)]
        public async Task<IHttpActionResult> ObtenerAccionesCorrectivasTurno(int idTurno)
        {
            try
            {
                var result = await _iDAOAccionesCorrectivasTurno.ObtenerAccionCorrectivaTurno(idTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesCorrectivasTurnoController.ObtenerAccionesCorrectivasTurno", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_ACCIONES_CORRECTIVAS_TURNO"));
            }
        }

        /// <summary>
        /// Método que obtiene las AccionesCorrectivas que correspondan a un filtro
        /// </summary>
        /// <param name="fechaInicio">fecha de inicio del rango</param>
        /// <param name="fechaFin">fecha de fin del rango</param>
        /// <param name="idLinea">Id de la línea (opcional)</param>
        /// <returns>Lista con los datos solicitados</returns>        
        [Route("api/accionesCorrectivasTurno/filtro")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_53_VisualizacionAccionesCorrectivasTurno)]
        public async Task<IHttpActionResult> ObtenerAccionesCorrectivasFiltro(DateTime fechaInicio, DateTime fechaFin, string idLinea = null)
        {
            try
            {
                var result = await _iDAOAccionesCorrectivasTurno.ObtenerAccionCorrectivaFiltro(fechaInicio, fechaFin, idLinea);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesCorrectivasTurnoController.ObtenerOrdenesArranqueFiltro", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_ACCIONES_CORRECTIVAS_TURNO"));
            }
        }

        /// <summary>
        /// Método que actualiza la Accion Correctiva de un turno.
        /// </summary>
        /// <param name="datos">Datos de la acción correctiva a actualizar</param>
        /// <returns>Resultado de la operación (true/false)</returns>
        [Route("api/accionesCorrectivasTurno/")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_52_GestionAccionesCorrectivasTurno)]
        public async Task<IHttpActionResult> EditarAccionCorrectivaTurno([FromBody] DTO_AccionesCorrectivasTurno datos)
        {
            try
            {
                var result = await _iDAOAccionesCorrectivasTurno.EditarAccionCorrectivaTurno(datos);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesCorrectivasTurnoController.EditarAccionCorrectivaTurno", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_EDITAR_ACCIONES_CORRECTIVAS"));
            }
        }

        /// <summary>
        /// Método que actualiza la Accion Correctiva de un turno mediante el estándar JSON patch, permitiendo actualizaciones parciales..
        /// </summary>
        /// <param name="id">Id de la acción correctiva a actualizar</param>
        /// <param name="datos">Datos de la acción correctiva a actualizar</param>
        /// <returns>Resultado de la operación (true/false)</returns>
        [Route("api/accionesCorrectivasTurno")]
        [HttpPatch]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_52_GestionAccionesCorrectivasTurno)]
        public async Task<IHttpActionResult> PatchAccionCorrectivaTurno([FromBody] List<MPatchOperation> datos)
        {
            try
            {
                var result = await _iDAOAccionesCorrectivasTurno.PatchAccionCorrectivaTurno(datos);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesCorrectivasTurnoController.PatchAccionCorrectivaTurno", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_EDITAR_ACCIONES_CORRECTIVAS"));
            }
        }

        /// <summary>
        /// Método que crea las acciones correctivas de las 3 máquinas con mayores paros de un turno, de forma automática
        /// </summary>
        /// <param name="idTurno">accion correctiva a crear</param>
        /// <returns>Resultado de la operación</returns>
        [Route("api/accionesCorrectivasTurno/CrearAutomaticas/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_52_GestionAccionesCorrectivasTurno)]
        public async Task<IHttpActionResult> CrearAccionCorrectivaTurnoAuto(int idTurno)
        {
            try
            {
                var result = await _iDAOAccionesCorrectivasTurno.CrearAccionesCorrectivasTurnoAuto(idTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesCorrectivasTurnoController.CrearAccionCorrectivaTurnoAuto", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_CREAR_ACCIONES_CORRECTIVAS_AUTO"));
            }
        }

        /// <summary>
        /// Método que crea una acción correctiva manual
        /// </summary>
        /// <param name="accion">accion correctiva a crear</param>
        /// <returns>Resultado de la operación</returns>
        [Route("api/accionesCorrectivasTurno/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_52_GestionAccionesCorrectivasTurno)]
        public async Task<IHttpActionResult> CrearAccionCorrectivaTurnoManual([FromBody] DTO_AccionesCorrectivasTurno accion)
        {
            try
            {
                var result = await _iDAOAccionesCorrectivasTurno.CrearAccionCorrectivaTurno(accion);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesCorrectivasTurnoController.CrearAccionCorrectivaTurnoManual", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_CREAR_ACCION_CORRECTIVA_MANUAL"));
            }
        }

        /// <summary>
        /// Método que elimina las AccionesCorrectivas de un turno
        /// </summary>
        /// <param name="idTurno">Id del turno</param>
        /// <returns>Resultado del borrado (true/false)</returns>
        [Route("api/accionesCorrectivasTurno/BorrarPorTurno/{idTurno}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_40_GestionParosPerdidasLlenadora)]
        public async Task<IHttpActionResult>BorrarAccionesCorrectivasTurno(int idTurno)
        {
            try
            {
                var result = await _iDAOAccionesCorrectivasTurno.BorrarAccionCorrectivaTurno(idTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesCorrectivasTurnoController.BorrarAccionesCorrectivasTurno", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_BORRAR_ACCIONES_CORRECTIVAS_TURNO"));
            }
        }

        /// <summary>
        /// Método que elimina una acción correctiva
        /// </summary>
        /// <param name="datos">Objeto de acción correctiva</param>
        /// <returns>Resultado del borrado (true/false)</returns>
        [Route("api/accionesCorrectivasTurno")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_52_GestionAccionesCorrectivasTurno)]
        public async Task<IHttpActionResult> BorrarAccionCorrectiva(DTO_AccionesCorrectivasTurno datos)
        {
            try
            {
                var result = await _iDAOAccionesCorrectivasTurno.BorrarAccionCorrectiva(datos.Id);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesCorrectivasTurnoController.BorrarAccionCorrectiva", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_ELIMINAR_ACCION_CORRECTIVA"));
            }
        }

        /// <summary>
        /// Método que obtiene las AccionesCorrectivas que correspondan a un filtro
        /// </summary>
        /// <param name="fechaInicio">fecha de inicio del rango</param>
        /// <param name="fechaFin">fecha de fin del rango</param>
        /// <param name="idLinea">Id de la línea (opcional)</param>
        /// <returns>Lista con los datos solicitados</returns>        
        [Route("api/accionesCorrectivasTurno/emails")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_53_VisualizacionAccionesCorrectivasTurno)]
        public async Task<IHttpActionResult> ObtenerAccionesCorrectivasEmails()
        {
            try
            {
                var result = await _iDAOAccionesCorrectivasTurno.ObtenerAccionCorrectivaEmails();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesCorrectivasTurnoController.ObtenerAccionesCorrectivasEmails", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_EMAILS_ACCIONES_CORRECTIVAS"));
            }
        }
    }
}