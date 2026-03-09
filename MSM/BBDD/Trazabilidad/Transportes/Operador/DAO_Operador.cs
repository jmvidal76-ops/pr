using Clients.ApiClient.Contracts;
using Common.Models.Operador;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public class DAO_Operador : IDAO_Operador
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriOperador ;

        private IApiClient _apiTrazabilidad;

        public DAO_Operador(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriOperador = UriBase + "api/Operador";
           // _apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<List<OperadorDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OperadorDto>>(UriOperador);
            return ret;
        }

        public async Task<List<OperadorDto>> GetWithName(string name)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OperadorDto>>(UriOperador + "/filters?Nombre=" + name);
            return ret;
        }

        public async Task<int> Delete(int id)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriOperador + "/" + id);
            return ret;
        }

        public async Task<OperadorDto> Post(OperadorDto Operador)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<OperadorDto>(Operador, UriOperador);
            return ret;
        }

        public async Task<OperadorDto> Put(OperadorDto Operador)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<OperadorDto>(UriOperador, Operador);
            return ret;
        }
    }
}