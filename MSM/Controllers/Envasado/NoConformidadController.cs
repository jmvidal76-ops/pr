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
    public class NoConformidadController : ApiController
    {
        private readonly IDAO_NoConformidad _iDAONoConformidad;

        public NoConformidadController(IDAO_NoConformidad iDAONoConformidad)
        {
            _iDAONoConformidad = iDAONoConformidad;
        }

        [Route("api/noConformidad/obtenerNoConformidades/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_37_VisualizacionGestionNoConformidad)]
        public async Task<IHttpActionResult> ObtenerNoConformidades(DateTime fechaDesde, DateTime fechaHasta)
        {
            try
            {
                var result = await _iDAONoConformidad.ObtenerNoConformidades(fechaDesde, fechaHasta);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "NoConformidadController.ObtenerNoConformidades", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_NO"));
            }
        }
    }
}