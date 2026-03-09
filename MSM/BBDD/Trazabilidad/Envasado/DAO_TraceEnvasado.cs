using Clients.ApiClient.Contracts;
using Common.Models.Trazabilidad.Estado;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;
using System;

namespace MSM.BBDD.Trazabilidad.Envasado
{
    public class DAO_TraceEnvasado : IDAO_TraceEnvasado
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriPaletMMPP ;
        private string UriLoteConsumido;
        private string UriLoteProductoConsumido;
        private string UriEnvaseProductoAcabado;
        private string UriIdPaletMMPP;
        private string UriLoteEnvasado;


        private IApiClient _apiTrazabilidad;

        public DAO_TraceEnvasado(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriPaletMMPP = UriBase + "api/PaletsPorMMPP";
            UriIdPaletMMPP = UriBase + "api/PaletsPorIdMMPP";
            UriLoteConsumido = UriBase + "api/TraceLotesConsumidos";
            UriLoteProductoConsumido = UriBase + "api/TraceInfoLotesProductoAcabado";
            UriEnvaseProductoAcabado = UriBase + "api/EnvaseProductoAcabado";
            UriLoteEnvasado = UriBase + "api/lote/materiaPrimaEnvasado";
        }

        public async Task<List<PaletMMPPDto>> GetPaletsPorMMPP(PaletMMPPDto _filters)
        {
            string _filtersString = "IdProveedor=" + _filters.IdProveedor + "&IdLoteMES=" + _filters.IdLoteMES + "&IdLoteMES=" + _filters.Codigo_JDE + "&LoteProveedor=" + _filters.LoteProveedor + "&CantPaletasExtra=" + _filters.CantPaletasExtra;
            var ret = await _apiTrazabilidad.GetPostsAsync<List<PaletMMPPDto>>(UriPaletMMPP + "?" + _filtersString);
            return ret;

        }

        public async Task<List<PaletMMPPDto>> ObtenerPaletsPorMMPPPorIdList(List<int> lotesEnvasado, int cantPaletas)
        {
            List<PaletMMPPDto> _result = new List<PaletMMPPDto>();
            foreach (var idLote in lotesEnvasado)
            {
                string _filtersString = "IdLote=" + idLote + "&CantPaletasExtra=" + cantPaletas;
                var ret = await _apiTrazabilidad.GetPostsAsync<List<PaletMMPPDto>>(UriPaletMMPP + "?" + _filtersString);
                if (ret != null && ret.Count > 0)
                {
                    _result.AddRange(ret);
                }
            }
            
            return _result;

        }

        public async Task<List<LoteConsumidoDto>> GetLotesConsumidos(ProAcaMMPPDto _filters)
        {
            string _filtersString = "obj=" + JsonConvert.SerializeObject(_filters);
            var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteConsumidoDto>>(UriLoteConsumido + "?" + _filtersString);
            return ret;
        }

        public async Task<DTO_LoteMateriaPrima> ObtenerLoteEnvasado(int id)
        {
            try
            {
                var ret = await _apiTrazabilidad.GetPostsAsync<DTO_LoteMateriaPrima>(string.Concat(UriLoteEnvasado, "/", id));
                return ret;
            }
            catch (Exception ex)
            {
                return new DTO_LoteMateriaPrima();
            }
        }
        public async Task<List<InfoLoteProductoAcabadoDto>> GetInfoLotesProductoAcabado(ProAcaMMPPDto _filters)
        {
            string _filtersString = "obj=" + JsonConvert.SerializeObject(_filters);
            var ret = await _apiTrazabilidad.GetPostsAsync<List<InfoLoteProductoAcabadoDto>>(UriLoteProductoConsumido + "?" + _filtersString);
            return ret;
        }

        public async Task<List<PaletMMPPDto>> GetEnvaseProductoAcabado(ProAcaMMPPDto _filters)
        {
            string _filtersString = "obj=" + JsonConvert.SerializeObject(_filters);
            var ret = await _apiTrazabilidad.GetPostsAsync<List<PaletMMPPDto>>(UriEnvaseProductoAcabado + "?" + _filtersString);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<ProAcaMMPPDto>> ConvertirLoteALineaFecha(string loteEnvase)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<DTO_RespuestaAPI<ProAcaMMPPDto>>(UriEnvaseProductoAcabado + "?" + "loteEnvase=" + loteEnvase);
            return ret;
        }
    }
}