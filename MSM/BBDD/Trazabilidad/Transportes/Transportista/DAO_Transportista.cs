using Clients.ApiClient.Contracts;
using Common.Models.Transportista;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transportista
{
    public class DAO_Transportista : IDAO_Transportista
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriTransportista ;
        private string UriMatriculas ;
        private string UriTransportistas ;

        private IApiClient _apiTrazabilidad;

        public DAO_Transportista(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriTransportista = UriBase + "api/transportista";
        }


        public async Task<List<TransportistaDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TransportistaDto>>(UriTransportista);
            return ret;
        }

        public async Task<List<TransportistaDto>> GetWithName(string name)
        {
            var ret = name != null? await _apiTrazabilidad.GetPostsAsync<List<TransportistaDto>>(UriTransportista+"/filters?Nombre="+name):null;
            return ret;
        }

        public async Task<List<TransportistaDto>> GetWithNIF(string nif)
        {
            var ret = nif != null? await _apiTrazabilidad.GetPostsAsync<List<TransportistaDto>>(UriTransportista+"/filters?NIF="+nif):null;
            return ret;
        }


        public async Task<int> Delete(int id)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriTransportista+"/"+id);
            return ret;
        }

        public async Task<TransportistaDto> Post(TransportistaDto Transportista)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<TransportistaDto>(Transportista, UriTransportista);
            return ret;
        }

        public async Task<TransportistaDto> Put(TransportistaDto Transportista)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<TransportistaDto>(UriTransportista, Transportista);
            return ret;
        }
    }
}