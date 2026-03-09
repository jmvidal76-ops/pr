using MSM.BBDD.Fabricacion;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    [Authorize]
    public class MensajesSAIController : ApiController
    {

        private readonly IDAO_MensajesSAI _dao;
        public MensajesSAIController(IDAO_MensajesSAI dao)
        {
            _dao = dao;
        }

        [Route("api/ObtenerMensajesSAI")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_15_VisualizacionMensajesSAI)]
        public async Task<IHttpActionResult> GetMensajesSAI(dynamic fechas)
        {
            try
            {
                DateTime fechaInicio = ((DateTime)fechas.fechaInicio.Value).ToLocalTime();
                DateTime fechaFin = ((DateTime)fechas.fechaFin.Value).ToLocalTime();

                return Ok(await _dao.GetMensajesSAI(fechaInicio, fechaFin));
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_MENSAJES_SAI"));
            }
        }

        [Route("api/ObtenerTransferencias")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_16_VisualizacionTransferencias)]
        public async Task<IHttpActionResult> ObtenerTransferencias(dynamic fechas)
        {
            try
            {
                DateTime fechaInicio = ((DateTime)fechas.fechaInicio.Value).ToLocalTime();
                DateTime fechaFin = ((DateTime)fechas.fechaFin.Value).ToLocalTime();

                return Ok(await _dao.GetTransferencias(fechaInicio, fechaFin));
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TRANSFERENCIAS"));
            }
        }

        [Route("api/ObtenerAjustesNivel")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_17_VisualizacionAjustesNivel)]
        public async Task<IHttpActionResult> ObtenerAjustesNivel(dynamic fechas)
        {
            try
            {
                DateTime fechaInicio = ((DateTime)fechas.fechaInicio.Value).ToLocalTime();
                DateTime fechaFin = ((DateTime)fechas.fechaFin.Value).ToLocalTime();

                return Ok(await _dao.GetAjustesNivel(fechaInicio, fechaFin));
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_AJUSTES_NIVEL"));
            }
        }
    }
}
