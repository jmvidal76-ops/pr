using Clients.ApiClient.Contracts;
using Common.Models.Destinatario;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public class DAO_Destinatario : IDAO_Destinatario
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriDestinatario ;

        private IApiClient _apiTrazabilidad;

        public DAO_Destinatario(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriDestinatario = UriBase + "api/Destinatario";
           // _apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<List<DestinatarioDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DestinatarioDto>>(UriDestinatario);
            return ret;
        }

        public async Task<int> Delete(int id)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriDestinatario + "/" + id);
            return ret;
        }

        public async Task<DestinatarioDto> Post(DestinatarioDto Destinatario)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<DestinatarioDto>(Destinatario, UriDestinatario);
            return ret;
        }

        public async Task<DestinatarioDto> Put(DestinatarioDto Destinatario)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<DestinatarioDto>(UriDestinatario, Destinatario);
            return ret;
        }
    }
}