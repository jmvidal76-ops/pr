using MSM.BBDD.Almacen.JDERecepcion;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Common.Models.Almacen;
using Common.Models.Lote;
using MSM.BBDD.Planta;

namespace MSM.Controllers.Almacen.JDERecepcionController
{
    public enum TipoOrigenEnum
    {
        ClienteTipoOperacion
    }

    [Authorize]
    public class JDERecepcionController : ApiController
    {
        private readonly IDAO_JDERecepcion _iDAO_Recepcion;

        public JDERecepcionController(IDAO_JDERecepcion iDAO_Recepcion)
           {
               _iDAO_Recepcion = iDAO_Recepcion;
           }

        



         /// <summary>
         /// Metodo que obtiene la lista de todos los registros de JDE de recepcion
         /// </summary>
         /// <returns></returns>
         [Route("api/GetJDEReceptionMaterial/")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_5_JDERecepcion)]
        public async Task<List<JDERecepcionMaterialDto>> GetJDEReceptionMaterial(dynamic datos)
         {
             //Desde Javascript vienen las fechas en UTC
             DateTime fInicio = ((DateTime)datos.fInicio.Value).ToLocalTime();
             DateTime fFin = ((DateTime)datos.fFin.Value).ToLocalTime();

             List<JDERecepcionMaterialDto> listStatus = new List<JDERecepcionMaterialDto>();
             List<JDERecepcionMaterialDto> status = await _iDAO_Recepcion.Get(fInicio, fFin);
             if (status != null)
             {
                 if (status.Count > 0)
                 {
                     listStatus = status;
                 }
             }
             return listStatus;
         }

         [Route("api/GetJDECodeReception/{receptionCode}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_5_JDERecepcion)]
         public async Task<List<JDEPropiedadRecepcionDto>> GetLotStatus(string receptionCode)
         {
             List<JDEPropiedadRecepcionDto> listStatus = new List<JDEPropiedadRecepcionDto>();
             List<JDEPropiedadRecepcionDto> status = await _iDAO_Recepcion.GetProperties(receptionCode);
             if (status != null)
             {
                 if (status.Count > 0)
                 {
                     listStatus = status;
                 }
             }
             return listStatus;
         }


        [Route("api/ObtenerLoteSinCodigoJDE")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_VisualizacionLotesSinCodigoJDE)]
        public async Task<List<LoteSinCodigoJDEDto>> ObtenerLoteSinCodigoJDE()
        {
            try
            {
                return await _iDAO_Recepcion.ObtenerLoteSinCodigoJDE();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ObtenerLoteSinCodigoJDE", "WEB-TRAZABILIDAD", "Sistema");
            }

            return new List<LoteSinCodigoJDEDto>();
        }

        [Route("api/ActualizarLoteSinCodigoJDE")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_GestionLotesSinCodigoJDE)]
        public async Task ActualizarLoteSinCodigoJDE(LoteSinCodigoJDEDto lote)
        {
            try
            {
                 await _iDAO_Recepcion.ActualizarLoteSinCodigoJDE(lote);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ActualizarLoteSinCodigoJDE", "WEB-TRAZABILIDAD", "Sistema");
            }

        }

        /// <summary>
        /// Método que se encarga de generar lotes 
        /// </summary>
        /// <param name="id">Listado de Id de Lotes que se van a generar lotes</param>
        /// <returns></returns>
        [Route("api/GenerarLotes")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_GestionLotesSinCodigoJDE)]
        public async Task<bool> GenerarLotes(List<long> id)
        {
            try
            {
                await _iDAO_Recepcion.GenerarLotesSinCodigoJDE(id);
                return true;
            }
            catch(Exception ex)
            {
                return false;
            }
           
        }



    }
}