using Clients.ApiClient.Contracts;
using Common.Models.Material;
using Common.Models.Operation;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Material
{
    public class DAO_Material : IDAO_Material
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriBaseInterspec = ConfigurationManager.AppSettings["HostApiInterspec"].ToString();
        private string UriMaterial;
        private string UriUnidadesMaterial;
        private string UriPropiedadesExtendidasLote;
        private IApiClient _apiTrazabilidad;
        private string UriTipoMaterial;
        private string UriClaseMaterial;
        private string UriMaterialPerteneceProductoOrden;

        public DAO_Material(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;

            UriMaterial = UriBase + "api/material";
            UriUnidadesMaterial = UriBase + "api/UnidadesMaterial/";
            UriPropiedadesExtendidasLote = UriBase + "api/PropiedadExtendidasLote/";
            UriTipoMaterial = UriBase + "api/tipoMaterial";
            UriClaseMaterial = UriBase + "api/claseMaterial";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
            UriMaterialPerteneceProductoOrden = UriBaseInterspec + "api/provider/material/";
        }



        public async Task<List<MaterialDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MaterialDto>>(UriMaterial);
            return ret;

        }

        public async Task<List<MaterialDto>> Get(string tipo, string clase)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MaterialDto>>(UriMaterial + "/" + tipo + "/" + clase);
            return ret;

        }

        public async Task<List<TipoMaterialDto>> GetTipoMaterial()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TipoMaterialDto>>(UriTipoMaterial);
            return ret;

        }

        public async Task<List<TipoMaterialDto>> GetTipoMaterialPorReferencia(string idMaterial)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TipoMaterialDto>>(UriTipoMaterial + "/referenciaMaterial/" + idMaterial);
            return ret;

        }

        public async Task<List<ClaseMaterialDto>> GetClaseMaterial(string tipo)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ClaseMaterialDto>>(UriClaseMaterial + "/" + tipo);
            return ret;
        }

        public async Task<List<ClaseMaterialDto>> GetClaseMaterial()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ClaseMaterialDto>>(UriClaseMaterial);
            return ret;
        }

        public async Task<List<ClaseMaterialDto>> GetClaseMaterialPorReferencia(string idMaterial)
        {

            var ret = await _apiTrazabilidad.GetPostsAsync<List<ClaseMaterialDto>>(UriClaseMaterial + "/referenciaMaterial/" + idMaterial);
            return ret;
        }

        public async Task<List<MaterialUnitsDto>> GetUnitsById(string idMaterial)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MaterialUnitsDto>>(UriUnidadesMaterial + idMaterial);
            return ret;
        }

        public async Task<List<MaterialUnitsDto>> GetUnits()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MaterialUnitsDto>>(UriUnidadesMaterial);
            return ret;
        }


        public async Task<List<PropiedadesExtendidasDto>> GetExtendedPropertiesByIdMaterialAndLote(string idMaterial, string lote)
        {
            var Uri = UriPropiedadesExtendidasLote + idMaterial;
            Uri += lote == null ? "/null" : "/" + lote;
            var ret = await _apiTrazabilidad.GetPostsAsync<List<PropiedadesExtendidasDto>>(Uri);
            return ret;
        }

        public async Task<bool> GetMaterialConsumByCode(string IdLinea, string IdZona, string IdMaterial)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<dynamic>(UriMaterialPerteneceProductoOrden + IdLinea + "/" + IdZona + "/" + IdMaterial);

            return ret;
        }
    }
}