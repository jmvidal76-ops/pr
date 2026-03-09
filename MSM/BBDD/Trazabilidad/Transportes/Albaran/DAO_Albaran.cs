using Clients.ApiClient.Contracts;
using Common.Models.Material;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Albaran
{
    public class DAO_Albaran : IDAO_Albaran
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriAlbaran ;
        private string UriMateriales ;
        private string UriSyplyOrder ;
        private string UriAlbaranEntradaByIdTransporte ;
        
        private IApiClient _apiTrazabilidad;

        public DAO_Albaran(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriAlbaran = UriBase + "api/albaran";
            UriMateriales = UriBase + "api/material";
            UriSyplyOrder = UriAlbaran + "/SuplyOrder";
            UriAlbaranEntradaByIdTransporte = UriAlbaran + "/albaranes";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<AlbaranDto> Post(AlbaranDto albaran) 
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<AlbaranDto>(albaran, UriAlbaran);
            return ret;
        
        }

        public async Task<AlbaranDto> Get(int idTransporte,int tipo) {
            var ret = await _apiTrazabilidad.GetPostsAsync<AlbaranDto>(UriAlbaran+"/"+idTransporte+"/"+tipo);
            return ret;
        
        }

       
        public async Task<int> Delete(int idAlbaran)
        {
            string Uri = idAlbaran != 0 ? UriAlbaran + "/" + idAlbaran : UriAlbaran;
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(Uri);
            return ret;
        }

        
      
    }
}