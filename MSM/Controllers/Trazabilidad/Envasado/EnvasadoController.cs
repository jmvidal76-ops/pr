using Common.Models.Trazabilidad.Estado;
using MSM.BBDD.Trazabilidad.Envasado;
using MSM.Mappers.DTO.Envasado;
using MSM.Security;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using System.Web.Http;

namespace MSM.Controllers.EnvasadoController
{
    [Authorize]
    public class EnvasadoController : ApiController
    {
        private readonly IDAO_TraceEnvasado _IDAO_TraceEnvasado;
        CultureInfo _culture = new CultureInfo("fr-CA");

        public EnvasadoController(IDAO_TraceEnvasado iDAO_TraceEnvasado)
        {
            _IDAO_TraceEnvasado = iDAO_TraceEnvasado;
        }

        [Route("api/ObtenerPaletsPorMMPP")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_MMPP_PA_1_VisualizacionEnvasadoTrazabilidadDescendente, Funciones.TRA_MMPP_PA_1_GestionEnvasadoTrazabilidadDescendente)]
        public async Task<List<PaletMMPPDto>> ObtenerPaletsPorMMPP(PaletMMPPDto _filters)
        {
            List<PaletMMPPDto> _listStock = new List<PaletMMPPDto>();
            var _result = await _IDAO_TraceEnvasado.GetPaletsPorMMPP(_filters);
            if (_result != null) _listStock = _result;
            return _listStock;
        }

        [Route("api/ObtenerPaletsPorMMPPPorIdList")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_MMPP_PA_1_VisualizacionEnvasadoTrazabilidadDescendente, Funciones.TRA_MMPP_PA_1_GestionEnvasadoTrazabilidadDescendente)]
        public async Task<List<PaletMMPPDto>> ObtenerPaletsPorMMPPPorIdList(PaletMMPPDto _filters)
        {
            List<PaletMMPPDto> _listStock = new List<PaletMMPPDto>();
            if(_filters != null)
            {
                var _result = await _IDAO_TraceEnvasado.ObtenerPaletsPorMMPPPorIdList(_filters.LotesEnvasado, _filters.CantPaletasExtra.Value);
                if (_result != null) _listStock = _result;

            }
            return _listStock;
        }

        [Route("api/ObtenerLotesConsumidos")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PA_MMPP_1_VisualizacionEnvasadoTrazabilidadAscendente, Funciones.TRA_PA_MMPP_1_GestionEnvasadoTrazabilidadAscendente)]
        public async Task<List<LoteConsumidoDto>> ObtenerLotesConsumidos(ProAcaMMPPDto _filters)
        {
            List<LoteConsumidoDto> _dato = new List<LoteConsumidoDto>();
            var _result = await _IDAO_TraceEnvasado.GetLotesConsumidos(_filters);
            if (_result != null) _dato = _result;
            return _dato;
        }

        [Route("api/ObtenerLoteMMPPEnvasado")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_VisualizacionMovimientoLotesFabricacion, Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion,
              Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<DTO_LoteMateriaPrima> ObtenerLoteMMPPEnvasado([FromUri] int? id)
        {
            if (id.HasValue)
                return await _IDAO_TraceEnvasado.ObtenerLoteEnvasado(id.Value);

            return new DTO_LoteMateriaPrima();
        }

        [Route("api/ObtenerInfoLotesProductoAcabado")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PA_MMPP_1_VisualizacionEnvasadoTrazabilidadAscendente, Funciones.TRA_PA_MMPP_1_GestionEnvasadoTrazabilidadAscendente)]
        public async Task<List<InfoLoteProductoAcabadoDto>> ObtenerInfoLotesProductoAcabado(ProAcaMMPPDto _filters)
        {
            List<InfoLoteProductoAcabadoDto> _dato = new List<InfoLoteProductoAcabadoDto>();
            var _result = await _IDAO_TraceEnvasado.GetInfoLotesProductoAcabado(_filters);
            if (_result != null) _dato = _result;
            return _dato;
        }

        [Route("api/ObtenerEnvaseProductoAcabado")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_ENV_PA_1_VisualizacionEnvasadoProductoAcabado, Funciones.TRA_ENV_PA_1_GestionEnvasadoProductoAcabado)]
        public async Task<List<PaletMMPPDto>> ObtenerEnvaseProductoAcabado(ProAcaMMPPDto _filters)
        {
            List<PaletMMPPDto> _listStock = new List<PaletMMPPDto>();
            var _result = await _IDAO_TraceEnvasado.GetEnvaseProductoAcabado(_filters);
            if (_result != null) _listStock = _result;
            return _listStock;
        }

        [Route("api/convertirLoteALineaFecha/{loteEnvase}")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_ENV_PA_1_GestionEnvasadoProductoAcabado)]
        public async Task<IHttpActionResult> ConvertirLoteALineaFecha(string loteEnvase)
        {
            var _result = await _IDAO_TraceEnvasado.ConvertirLoteALineaFecha(loteEnvase);

            if (_result.Exception != null)
            {
                return BadRequest(_result.Exception.Message);
            }

            return Ok(_result.Data);
        }
    }
}