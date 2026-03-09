using MSM.BBDD.Fabricacion;
using MSM.BBDD.Planta;
using MSM.BBDD.RTDS;
using MSM.Controllers.Planta;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;


namespace MSM.Controllers.Fabricacion
{
    public class DeltaVFabController : ApiController
    {

        private readonly ISitRTDS _sitRTDS;
        private readonly IDAO_Orden _iOrden;

        public DeltaVFabController(ISitRTDS sitRTDS, IDAO_Orden iorden)
        {
            _sitRTDS = sitRTDS;
            _iOrden = iorden;
        }

        [Route("api/GetWoNumber/{anyo}/{text}")]
        [HttpGet]
        public async Task<String> GetWoNumber(int anyo, String text)
        {
            try
            {
                return await _iOrden.GetOrderIDByDeltav(anyo, text, _sitRTDS);  
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.GetWoNumber", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DeltaVFabController.GetWoNumber", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO_DE"));
            }
        }
        
    }
}