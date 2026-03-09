using Common.Models.Lote;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad.Fabricacion;
using MSM.Controllers.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    [Authorize]
    public class PropiedadesLotesController : ApiController
    {
        private readonly IDAO_PropiedadesLotes _iPropiedadesLotes;

        public PropiedadesLotesController(IDAO_PropiedadesLotes iPropiedadesLotes)
        {
            _iPropiedadesLotes = iPropiedadesLotes;
        }

        [Route("api/ObtenerPropiedadesLotes")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_VisualizacionConfigPropiedadesLotes, Funciones.TRA_PROD_FAB_1_GestionConfigPropiedadesLotes)]
        public async Task<List<PropiedadLoteDto>> ObtenerPropiedadesLotes()
        {
            try
            {
                return await _iPropiedadesLotes.ObtenerPropiedadesLotes();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesLotesController.ObtenerPropiedadesLotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/ObtenerAccionesPropiedadesLotes")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_VisualizacionConfigPropiedadesLotes, Funciones.TRA_PROD_FAB_1_GestionConfigPropiedadesLotes)]
        public async Task<List<AccionPropiedadLoteDto>> ObtenerAccionesPropiedadesLotes()
        {
            try
            {
                return await _iPropiedadesLotes.ObtenerAccionesPropiedadesLotes();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesLotesController.ObtenerAccionesPropiedadesLotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/AgregarPropiedadesLotes")]
        [HttpPost]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionConfigPropiedadesLotes)]
        public async Task<PropiedadLoteDto> AgregarPropiedadesLotes(PropiedadLoteDto propiedad)
        {
            try
            {
                propiedad.CreadoPor = HttpContext.Current.User.Identity.Name;
                return await _iPropiedadesLotes.AgregarPropiedadesLotes(propiedad);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesLotesController.AgregarPropiedadesLotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/ActualizarPropiedadesLotes")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionConfigPropiedadesLotes)]
        public async Task<PropiedadLoteDto> ActualizarPropiedadesLotes(PropiedadLoteDto propiedad)
        {
            try
            {
                propiedad.ActualizadoPor = HttpContext.Current.User.Identity.Name;
                return await _iPropiedadesLotes.ActualizarPropiedadesLotes(propiedad);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesLotesController.ActualizarPropiedadesLotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/EliminarPropiedadesLotes")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionConfigPropiedadesLotes)]
        public async Task<PropiedadLoteDto> EliminarPropiedadesLotes([FromUri] int id)
        {
            try
            {
                return await _iPropiedadesLotes.EliminarPropiedadesLotes(id);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesLotesController.ActualizarPropiedadesLotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }
    }
}