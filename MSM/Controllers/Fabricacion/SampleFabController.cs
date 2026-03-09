using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using MSM.Utilidades;
using MSM.BBDD.Planta;
using MSM.BBDD.Model;
using Common.Models.Muestras;
using MSM.BBDD.Fabricacion;
using System.Threading.Tasks;
using SITCAB.DataSource.Libraries;

namespace MSM.Controllers.Fabricacion
{
    public class SampleFabController : ApiController
    {

         private readonly IDAO_Sample _IDAO_Sample;

         public SampleFabController(IDAO_Sample sample)
        {
            _IDAO_Sample = sample;
        }

        /// <summary>
        /// Getting the samples of an order
        /// </summary>
        /// <returns></returns>
        [Route("api/GetSampleByOrder/{IdOrder}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<List<SampleDto>> GetSamplesByOrder(int IdOrder)
        {
            try
            {
                return await _IDAO_Sample.GetSamplesList(IdOrder);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "SampleFabController.GetSamplesByOrder", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "SampleFabController.GetSamplesByOrder", "WEB-FABRICACION", "Sistema");
                throw ex;
            }

        }

        [Route("api/Sample/Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<SampleDto> CreateSample(SampleDto dto)
        {
            try
            {
                return await _IDAO_Sample.CreateSample(dto);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "SampleFabController.CreateSample", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "SampleFabController.CreateSample", "WEB-FABRICACION", "Sistema");
                throw ex;
            }

        }

        [Route("api/Sample/Destroy")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<ReturnValue> DeleteSample(SampleDto dto)
        {
            try
            {
                return await _IDAO_Sample.DeleteSample(dto);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "SampleFabController.DeleteSample", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "SampleFabController.DeleteSample", "WEB-FABRICACION", "Sistema");
                throw ex;
            }

        }

    }
}