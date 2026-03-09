using MSM.BBDD.Trazabilidad.MetricasRT;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Trazabilidad.MetricasRT
{
    public class MetricasRTController : ApiController
    {
        private readonly IDAO_MetricasRT _iDAOMetricas;

        public MetricasRTController(IDAO_MetricasRT iDAOMetricas)
        {
            _iDAOMetricas = iDAOMetricas;
        }

        [Route("api/MetricasRT/ActivarMetrica")]
        [HttpGet]
        //[ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public IHttpActionResult ActivarMetricas(string metricaId)
        {
            try
            {
                _iDAOMetricas.ActivarMetrica(metricaId);

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("api/MetricasRT/DesactivarMetrica")]
        [HttpGet]
        //[ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public IHttpActionResult DesactivarMetricas(string metricaId)
        {
            try
            {
                _iDAOMetricas.DesactivarMetrica(metricaId);

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}