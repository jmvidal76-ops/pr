using Clients.ApiClient.Contracts;
using Common.Models.Operation;
using Common.Models.Transportes;
using Common.Models.Trazabilidad.Estado;
using Common.Models.Trazabilidad.Genealogia;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Genealogia
{
    public class DAO_Genealogia : IDAO_Genealogia
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriGenealogia;
        private string UriLoteTraza;
        private string UriLotes;
        private string UriLotesGenerados;
        private string UriCalidad;
        private List<OperationDto> listOperation;


        private IApiClient _apiTrazabilidad;

        public DAO_Genealogia(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriGenealogia = UriBase + "api/genealogia";
            UriLotes = UriGenealogia + "/lotes";
            UriLoteTraza = UriBase + "api/lote";
            UriLotesGenerados = UriGenealogia + "/lotesGenerados";
            UriCalidad = UriBase + "api/calidad";
            listOperation = new List<OperationDto>();
        }

        public async Task<dynamic> Get(FilterDto _filters)
        {
            List<LoteDto> _result = new List<LoteDto>();
            try
            {
                string _uri = UriLotesGenerados;
                var ret = await _apiTrazabilidad.PostPostsAsync<dynamic>(_filters, UriLotes);
                return ret;
            }
            catch (Exception ex)
            {

            }

            return _result;

        }

        public async Task<List<ControlCalidadDto>> GetForms(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ControlCalidadDto>>(UriCalidad + "/forms?IdLote=" + IdLote);
            return ret;
        }

        public async Task<List<dynamic>> GetDataTransporte(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriGenealogia + "/dataTransporte?IdLote=" + IdLote);
            return ret;
        }

        public async Task<List<dynamic>> GetDataDescarga(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriGenealogia + "/dataDescarga?IdLote=" + IdLote);
            return ret;
        }

        public async Task<List<dynamic>> GetDataCarga(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriGenealogia + "/dataCarga?IdLote=" + IdLote);
            return ret;
        }

        public async Task<List<DocumentoDto>> GetDocumentosTransportePorLote(string IdLote, int IdTipoAlbaran)
        {
            //var ret = await _apiTrazabilidad.GetPostsAsync<List<DocumentoDto>>(UriGenealogia + "/documentosTransporte?IdLote=" + IdLote + "&IdTipoAlbaran=" + IdTipoAlbaran);
            return new List<DocumentoDto>();
        }

        public async Task<List<OperationDto>> GetOperacionesPorLote(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OperationDto>>(UriGenealogia + "/operaciones?IdLote=" + IdLote);
            return ret;
        }

        public async Task<List<OperationDto>> GetTransformacionesPorLote(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OperationDto>>(UriGenealogia + "/operaciones/transformaciones?IdLote=" + IdLote);
            return ret;
        }

        public async Task<List<OperationDto>> GetProcesosPorLote(string IdLote, bool HaciaProducto, string IdOrdenDestino)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OperationDto>>(UriGenealogia + "/procesos?IdLote=" + IdLote + "&HaciaProducto=" + HaciaProducto + "&IdOrdenDestino=" + IdOrdenDestino);


            return ret;
        }

        public async Task<List<OperationDto>> GetProcesosPaletsPorLote(string IdLote, bool HaciaProducto, string IdOrdenDestino)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OperationDto>>(UriGenealogia + "/procesos?IdLote=" + IdLote + "&HaciaProducto=" + HaciaProducto + "&IdOrdenDestino=" + IdOrdenDestino);
            if (ret.Count > 0)
            {
                foreach (var item in ret)
                {
                    listOperation.Add(item);
                    if (!string.IsNullOrEmpty(item.IdLote) && IdLote != item.IdLote)
                    {
                        await GetProcesosPaletsPorLote(item.IdLote, true, "0");
                    }
                }
            }

            return listOperation;

        }

        public async Task<List<LoteDto>> GetHijosPorLote(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteDto>>(UriGenealogia + "/hijos?IdLote=" + IdLote);
            return ret;
        }

        public async Task<List<LoteDto>> GetPadresPorLote(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteDto>>(UriGenealogia + "/padres?IdLote=" + IdLote);
            return ret;
        }

        public async Task<List<OperationDto>> GetPadresPaletsPorLote(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OperationDto>>(UriGenealogia + "/padresPalets?IdLote=" + IdLote);
            return ret;
        }

        public async Task<List<MMPPDto>> GetArbolPadres(string IdLote, string fechaInicio, string fechaFin)
        {
            string uriFiltros = !string.IsNullOrEmpty(fechaInicio) && !string.IsNullOrEmpty(fechaFin) ? string.Format("/arbolPadres?idLote/{0}&fechaInicio={1}&fechaFin={2}", IdLote, fechaInicio, fechaFin) :
                                string.Format("/arbolPadres?idLote={0}", IdLote);
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MMPPDto>>(UriGenealogia + uriFiltros);
            ret = ret.Where(t => !string.IsNullOrEmpty(t.IdMaterial)).ToList();
            return ret;
        }

        public async Task<List<MMPPDto>> GetArbolHijos(string IdLote, string fechaInicio, string fechaFin)
        {
            string uriFiltros = !string.IsNullOrEmpty(fechaInicio) && !string.IsNullOrEmpty(fechaFin) ? string.Format("/arbolHijos?idLote/{0}&fechaInicio={1}&fechaFin={2}", IdLote, fechaInicio, fechaFin) :
                                string.Format("/arbolHijos?idLote={0}", IdLote);
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MMPPDto>>(UriGenealogia + uriFiltros);
            ret = ret.Where(t => !string.IsNullOrEmpty(t.IdMaterial)).ToList();
            return ret;
        }

        public async Task<List<PaletMMPPDto>> GetPaletsPorLote(string IdLote, string fechaInicio, string fechaFin)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<PaletMMPPDto>>(UriGenealogia + string.Format("/paletas/idLote/{0}/fechaInicio/{1}/fechaFin/{2}", IdLote, fechaInicio, fechaFin));
            return ret;
        }


        public async Task<dynamic> GetOrdenPorLote(string IdLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<dynamic>(UriGenealogia + "/ordenLote/" + IdLote);
            return ret;
        }

        public async Task<List<LoteDto>> ObtenerTrazabilidadDescendente(FilterDto filtro)
        {
            string queryUrl = !string.IsNullOrEmpty(filtro.IdLoteMES) ? string.Format("loteMES={0}", filtro.IdLoteMES.Trim()) : string.Format("loteProveedor={0}", filtro.LoteProveedor.Replace("/", "%2F").Trim());
            var result = await _apiTrazabilidad.GetPostsAsync<List<LoteDto>>(UriGenealogia + string.Format("/semielaboradosPorProceso?inicio={0}&fin={1}&{2}", filtro.FechaInicio, filtro.FechaFin,
                queryUrl));
            return result;
        }

        public async Task<List<LoteDto>> ObtenerTrazabilidadAscendente(FilterDto filtro)
        {
            var result = await _apiTrazabilidad.GetPostsAsync<List<LoteDto>>(UriGenealogia + string.Format("/trazabilidadAscendente?inicio={0}&fin={1}&loteMES={2}", filtro.FechaInicio, filtro.FechaFin,
               filtro.IdLoteMES.Trim()));
            return result;

        }


        public async Task<List<LoteDto>> ObtenerTrazabilidadCruzada(FilterDto filtro)
        {
            var result = await _apiTrazabilidad.GetPostsAsync<List<LoteDto>>(UriGenealogia + string.Format("/trazabilidadCruzada?inicio={0}&fin={1}&idUbicacion={2}", filtro.FechaInicio, filtro.FechaFin,
               filtro.IdUbicacion));
            return result;

        }

        public async Task<int> EliminarMovimiento(int idMovimiento)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriGenealogia + "/eliminarMovimientoLote/" + idMovimiento);
            return ret;
        }

        public async Task<dynamic> ObtenerMovimientosHaciaLotes(List<int> IdLote)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<dynamic>(IdLote, UriBase + "api/fabricacion/ObtenerMovimientosHaciaLotes");
            return ret;
        }

        public async Task<dynamic> ObtenerMovimientosHaciaLotesTotales(List<int> IdLote)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<dynamic>(IdLote, UriBase + "api/fabricacion/ObtenerMovimientosHaciaLotesTotales");
            return ret;
        }

        public async Task<List<LoteDto>> ObtenerLotePorLoteMES(string loteMES)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteDto>>(
                string.Format("{0}/ObtenerLotePorLoteMES/{1}", UriLoteTraza, loteMES)
            );
            return ret;
        }
    }
}