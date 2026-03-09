using MSM.BBDD.Almacen.PropiedadesMMPP;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Almacen;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.PropiedadesMMPP
{
    [Authorize]
    public class PropiedadesMMPPController: ApiController
    {
        private readonly IDAO_PropiedadesMMPP _iDAOPropiedadesMMPP;

        public PropiedadesMMPPController(IDAO_PropiedadesMMPP iDAOPropiedadesMMPP)
        {
            _iDAOPropiedadesMMPP = iDAOPropiedadesMMPP;
        }

        [Route("api/propiedadesMMPP/conPropiedades")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_VisualizacionPropiedadesMMPPEnvasado, Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> ObtenerPropiedadesMMPPConPropiedades()
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.ObtenerPropiedadesMMPPConPropiedades();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.ObtenerPropiedadesMMPPConPropiedades", "WEB-ALMACEN", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_PROPIEDADES"));
            }
        }

        [Route("api/propiedadesMMPP/soloConPropiedadInicial")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_VisualizacionPropiedadesMMPPEnvasado, Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> ObtenerPropiedadesMMPPSoloConPropiedadInicial()
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.ObtenerPropiedadesMMPPSoloConPropiedadInicial();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.ObtenerPropiedadesMMPPSoloConPropiedadInicial", "WEB-ALMACEN", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_PROPIEDADES"));
            }
        }

        [Route("api/propiedadesMMPP/sinPropiedades")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_VisualizacionPropiedadesMMPPEnvasado, Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> ObtenerPropiedadesMMPPSinPropiedades()
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.ObtenerPropiedadesMMPPSinPropiedades();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.ObtenerPropiedadesMMPPSinPropiedades", "WEB-ALMACEN", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_PROPIEDADES"));
            }
        }

        [Route("api/propiedadesMMPP/tiposValoresPorEANIdMaterial")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_VisualizacionPropiedadesMMPPEnvasado, Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> ObtenerMMPPTiposValoresPorEANIdMaterial(dynamic datos)
        {
            try
            {
                string codigoEAN = datos.codigoEAN.ToString();
                string codigoMaterial = datos.codigoMaterial.ToString();

                var result = await _iDAOPropiedadesMMPP.ObtenerMMPPTiposValoresPorEANIdMaterial(codigoEAN, codigoMaterial);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.ObtenerMMPPTiposValoresPorEANIdMaterial", "WEB-ALMACEN", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_CONSUMO"));
            }
        }

        [Route("api/propiedadesMMPP/tipos")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_VisualizacionPropiedadesMMPPEnvasado, Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> ObtenerPropiedadesMMPPTipos()
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.ObtenerPropiedadesMMPPTipos();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.ObtenerPropiedadesMMPPTipos", "WEB-ALMACEN", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_TIPOS_PROPIEDADES"));
            }
        }

        [Route("api/propiedadesMMPP/valoresPorTipo")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_VisualizacionPropiedadesMMPPEnvasado, Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> ObtenerPropiedadesMMPPValoresPorTipo(int idTipoPropiedad)
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.ObtenerPropiedadesMMPPValoresPorTipo(idTipoPropiedad);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.ObtenerPropiedadesMMPPValoresPorTipo", "WEB-ALMACEN", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_VALORES_PROPIEDADES"));
            }
        }

        [Route("api/propiedadesMMPP_Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> PropiedadesMMPP_Create(List<DTO_PropiedadesMMPP> propiedadesMMPP)
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.CrearPropiedadMMPP(propiedadesMMPP);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.PropiedadesMMPP_Create", "WEB-ALMACEN", "Sistema");

                return Json(false);
            }
        }

        [Route("api/propiedadesMMPP_Update")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> PropiedadesMMPP_Update(DTO_PropiedadesMMPP propiedadesMMPP)
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.EditarPropiedadMMPP(propiedadesMMPP);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.PropiedadesMMPP_Update", "WEB-ALMACEN", "Sistema");

                return Json(false);
            }
        }

        [Route("api/propiedadesMMPP_Delete")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> PropiedadesMMPP_Delete(DTO_PropiedadesMMPP propiedadesMMPP)
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.EliminarPropiedadMMPP(propiedadesMMPP.IdPropiedad);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.PropiedadesMMPP_Delete", "WEB-ALMACEN", "Sistema");

                return Json(false);
            }
        }

        [Route("api/propiedadesMMPP/fijarSinPropiedades")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> FijarSinPropiedades(List<DTO_PropiedadesMMPP> datos)
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.FijarSinPropiedades(datos);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.FijarSinPropiedades", "WEB-ALMACEN", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_ELIMINAR_PROPIEDADES"));
            }
        }

        [Route("api/propiedadesMMPP/AgregarMultiple")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_8_GestionPropiedadesMMPPEnvasado)]
        public async Task<IHttpActionResult> AgregarPropiedadesMMPP(List<DTO_PropiedadesMMPP> propiedadesMMPP)
        {
            try
            {
                var result = await _iDAOPropiedadesMMPP.CrearPropiedadMMPP(propiedadesMMPP);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PropiedadesMMPPController.AgregarPropiedadesMMPP", "WEB-ALMACEN", "Sistema");

                return Json(false);
            }
        }
    }
}