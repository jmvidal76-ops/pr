using Common.Models.RTDS;
using MSM.BBDD.Alt;
using MSM.BBDD.Planta;
using MSM.BBDD.RTDS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Alt
{
    public class rtdsController : ApiController
    {

        #region ATRIBUTES
        private readonly ISitRTDS _sitRTDS;
        #endregion

        #region CONSTRUCTOR
        public rtdsController(ISitRTDS sitRTDS)
        {
            _sitRTDS = sitRTDS;
        }
        #endregion

        #region RTDS
        /// <summary>
        /// Metodo que obtiene el valor de un array de variables de la RTDS
        /// </summary>
        /// <param name="arrayTags">array de tags a leer</param>
        /// <returns></returns>
        [Route("api/RTDSreadTags")]
        [HttpPost]
        [AllowAnonymous]
        public async Task<object> RTDSreadTags(dynamic filterdata)
        {
            try
            {
                RTDSValuesDto filter = new RTDSValuesDto() { Tags = filterdata.tags.ToObject<List<string>>(), Unit = "RTDS" };
                var ret = await _sitRTDS.readRTDS(filter);
                return ret;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Metodo que obtiene el valor de un array de variables de la RTDS
        /// </summary>
        /// <param name="arrayTags">array de tags a leer</param>
        /// <returns></returns>
        [Route("api/RTDScheckTags")]
        [HttpPost]
        [AllowAnonymous]
        public async Task<List<bool>> checkRTDSVariables(dynamic filterdata)
        {
            try
            {
                RTDSValuesDto filter = new RTDSValuesDto() { Tags = filterdata.tags.ToObject<List<string>>(), Unit = "RTDS" };
                var ret = await _sitRTDS.checkRTDSVariables(filter);
                return ret;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }    
        
        [Route("api/getPPARTDSPoints")]
        [HttpGet]
        [AllowAnonymous]
        public List<object> getPPARTDSPoints()
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    context.Configuration.ProxyCreationEnabled = false;
                    return context.SIT_RTDS_Points.AsNoTracking().Select(r => new { r.Unit, r.Point }).Distinct().ToList<object>();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        #endregion
    }
}