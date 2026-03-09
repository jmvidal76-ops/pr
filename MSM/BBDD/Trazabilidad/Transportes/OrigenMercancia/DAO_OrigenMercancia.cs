using Clients.ApiClient.Contracts;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public class DAO_OrigenMercancia : IDAO_OrigenMercancia
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriOrigenMercancia ;

        private IApiClient _apiTrazabilidad;

        public DAO_OrigenMercancia(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriOrigenMercancia = UriBase + "api/OrigenMercancia";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<List<OrigenMercanciaDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OrigenMercanciaDto>>(UriOrigenMercancia);
            return ret;
        }

        public async Task<List<OrigenMercanciaDto>> GetWithName(string name)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OrigenMercanciaDto>>(UriOrigenMercancia + "/filters?Descripcion=" + name);
            return ret;
        }

        public async Task<int> Delete(int id)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriOrigenMercancia + "/" + id);
            return ret;
        }

        public async Task<OrigenMercanciaDto> Post(OrigenMercanciaDto OrigenMercancia)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<OrigenMercanciaDto>(OrigenMercancia, UriOrigenMercancia);
            return ret;
        }

        public async Task<OrigenMercanciaDto> Put(OrigenMercanciaDto OrigenMercancia)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<OrigenMercanciaDto>(UriOrigenMercancia, OrigenMercancia);
            return ret;
        }
    }
}