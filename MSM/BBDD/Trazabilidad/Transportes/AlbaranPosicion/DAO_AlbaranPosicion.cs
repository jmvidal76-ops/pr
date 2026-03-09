using Clients.ApiClient.Contracts;
using Common.Models.AlbaranPosicion;
using Common.Models.Material;
using Common.Models.Operation;
using Common.Models.Transporte;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.AlbaranPosicion
{
    public class DAO_AlbaranPosicion : IDAO_AlbaranPosicion
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriJDE = ConfigurationManager.AppSettings["HostApiJDE"].ToString();
        private string UriAlbaran;
        private string UriAlbaranPosicionLote ;
        private string UriMateriales ;
        private string UriSyplyOrder ;
        private string UriUnidadesMaterial;
        private string UriOA;
        private string UriAlbaranPosicionCalidad;
        private IApiClient _apiTrazabilidad;

        public DAO_AlbaranPosicion(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;

            UriAlbaran = UriBase + "api/albaran";
            UriAlbaranPosicionCalidad = UriBase + "api/Quality";
            UriAlbaranPosicionLote = UriAlbaran + "/albaranLote/";
            UriMateriales = UriBase + "api/material";
            UriSyplyOrder = UriAlbaran + "/SuplyOrder";
            UriUnidadesMaterial = UriBase + "api/UnidadesMaterial/";
            UriOA = UriJDE + "api/OA";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<List<AlbaranDto>> GetAlbaranPosicionByIdTransporte(int idTransporte, int tipo)
        {
            string Uri = idTransporte != 0 ? UriAlbaran + "/"+ idTransporte+"/tipoAlbaran/"+tipo : UriAlbaran;
            var ret = await _apiTrazabilidad.GetPostsAsync<List<AlbaranDto>>(Uri);
            return ret;
        }

        public async Task<List<OperationDto>> GetAllAlbaranPosicion(string idMaterial) 
        {
            UriAlbaran += "/Lotes/" + idMaterial;
            var ret = await _apiTrazabilidad.GetPostsAsync<List<OperationDto>>(UriAlbaran);
            return ret;
        }

        public async Task<int> DeleteAlbaranPosicion(int? idAlbaranPosicion)
        {
            string Uri = idAlbaranPosicion != 0 ? UriAlbaran + "/" + idAlbaranPosicion : UriAlbaran;
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(Uri);
            return ret;
        }

        public async Task<List<MaterialDto>> GetMaterials() {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MaterialDto>>(UriMateriales);
            return ret;

            }


        public async Task<List<MaterialUnitsDto>> GetMaterialsUnits(string idMaterial)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MaterialUnitsDto>>(UriUnidadesMaterial+idMaterial);
            return ret;
        }

        public async Task<List<object>> GetSuplyOrders(string refMaterial)
        {
            List<FiltersOADto> _ListFilters = new List<FiltersOADto>();
            FiltersOADto _filters = new FiltersOADto() { 
                RefMaterial = refMaterial
            };

            _ListFilters.Add(_filters);

            var ret = await _apiTrazabilidad.PostObjectAsJsonAsync(_filters, UriOA);
            return ret;
        
        }

        public async Task<AlbaranDto> PostAlbaranPosicion(AlbaranDto albaran)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<AlbaranDto>(albaran, UriAlbaran);
            return ret;
        
        }

        public async Task<AlbaranPosicionLoteDto> PostAlbaranPosicionLote(AlbaranPosicionLoteDto albaranPosicionLote)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<AlbaranPosicionLoteDto>(albaranPosicionLote, UriAlbaranPosicionLote);
            return ret;

        }

        //public async Task<int> DeleteAlbaranPosicionLote(int? idAlbaranPosicion,string IdLote )
        //{
        //    string Uri = idAlbaranPosicion != 0 ? UriAlbaranPosicionLote + "/" + idAlbaranPosicion + "/" + IdLote : UriAlbaranPosicionLote;
        //    var ret = await _apiTrazabilidad.DeletePostsAsync<int>(Uri);
        //    return ret;
        //}

        public async Task<int> DeleteAllAlbaranPosicionLote(int idAlbaranPosicion)
        {
            string Uri = idAlbaranPosicion != 0 ? UriAlbaranPosicionLote + idAlbaranPosicion : UriAlbaranPosicionLote;
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(Uri);
            return ret;
        }

        public async Task<AlbaranDto> Put(AlbaranDto albaran)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<AlbaranDto>(UriAlbaran, albaran);
            return ret;
        }

        public async Task<List<AlbaranPosicionCalidadDto>> GetFormsByIdAlbaranPosicion(int idAlbaranPosicion) {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<AlbaranPosicionCalidadDto>>(UriAlbaranPosicionCalidad + "/" + idAlbaranPosicion);
            return ret;
        }

        public async Task<string> GetAlbaranPosicionByPDV(int idAlbaran, string idMaterial)
        {
            var uri = UriAlbaranPosicionCalidad + "/" + idAlbaran + "/" + idMaterial; ;
            var ret = await _apiTrazabilidad.GetPostsAsync<string>(uri);
            return ret;
    
        }

        public async Task<List<AlbaranPosicionDto>> GetAlbaranPosicionLoteByFilters(string name, string filter)
        {
            var ret = name != null ? await _apiTrazabilidad.GetPostsAsync<List<AlbaranPosicionDto>>(UriAlbaran + "/lotes/filters?" + filter + "=" + name) : null;
            return ret;
        }

        public async Task<List<AlbaranPosicionDto>> GetAlbaranPosicionLoteNoConsumido() {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<AlbaranPosicionDto>>(UriAlbaran + "/lotes/noConsumidos") ;
            return ret;
        
        }

        public async Task<List<AlbaranPosicionDto>> GetAlbaranPosicionLotesConsumidos()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<AlbaranPosicionDto>>(UriAlbaran + "/lotes/consumidos");
            return ret;

        }

        public async Task<List<ParametrosAlbaranDto>> GetParametrosAlbaran()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ParametrosAlbaranDto>>(UriAlbaran + "/parametros");
            return ret;
        }
    }
}