using MSM.BBDD.General;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.General
{
    public class GeneralController : ApiController
    {
        private readonly IDAO_General _iDAOGeneral;

        public GeneralController(IDAO_General iDAOGeneral)
        {
            _iDAOGeneral = iDAOGeneral;
        }

        [Route("api/General/ColoresSemaforo")]
        [HttpGet]
        public async Task<IHttpActionResult> ObtenerColoresSemaforo()
        {
            try
            {
                var result = await _iDAOGeneral.ObtenerColoresSemaforo();

                return Json(result);
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }

        [Route("api/General/ping")]
        [HttpGet]
        public IHttpActionResult Ping()
        {
            return Ok();
        }

        [Route("api/General/EnviarEmailGenerico")]
        [HttpPost]
        public IHttpActionResult EnviarEmailGenerico( DTO_MailGeneric mailInfo )
        {
            try
            {
                var result = _iDAOGeneral.EnviarEmailGenerico( mailInfo );

                return Json(result);
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }


        [Route("api/General/ObtenerValorParametroGeneral")]
        [HttpGet]
        public async Task<IHttpActionResult> ObtenerValorParametroGeneral(string bbdd, string clave)
        {
            try
            {
                var result = await _iDAOGeneral.ObtenerValorParametroGeneral(bbdd, clave);

                return Json(result);
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }
    }
}