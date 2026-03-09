using Clients.ApiClient.Contracts;
using Microsoft.AspNet.SignalR;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Almacen;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.PropiedadesMMPP
{
    public class DAO_PropiedadesMMPP: IDAO_PropiedadesMMPP
    {
        private IApiClient _api;
        private string _urlPropiedadesMMPP;
        private string uriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public DAO_PropiedadesMMPP()
        {

        }

        public DAO_PropiedadesMMPP(IApiClient api)
        {
            _api = api;
            _urlPropiedadesMMPP = string.Concat(uriEnvasado, "api/propiedadesMMPP/");
        }

        public async Task<List<DTO_PropiedadesMMPP>> ObtenerPropiedadesMMPPConPropiedades()
        {
            var result = await _api.GetPostsAsync<List<DTO_PropiedadesMMPP>>(string.Concat(_urlPropiedadesMMPP, "ConPropiedades"));

            return result;
        }

        public async Task<List<DTO_PropiedadesMMPP>> ObtenerPropiedadesMMPPSoloConPropiedadInicial()
        {
            var result = await _api.GetPostsAsync<List<DTO_PropiedadesMMPP>>(string.Concat(_urlPropiedadesMMPP, "SoloConPropiedadInicial"));

            return result;
        }

        public async Task<List<DTO_PropiedadesMMPP>> ObtenerPropiedadesMMPPSinPropiedades()
        {
            var result = await _api.GetPostsAsync<List<DTO_PropiedadesMMPP>>(string.Concat(_urlPropiedadesMMPP, "SinPropiedades"));

            return result;
        }

        public async Task<List<DTO_PropiedadesMMPP>> ObtenerMMPPTiposValoresPorEANIdMaterial(string codigoEAN, string codigoMaterial)
        {
            var result = await _api.GetPostsAsync<List<DTO_PropiedadesMMPP>>(string.Concat(_urlPropiedadesMMPP, 
                "TiposValoresPorEANIdMaterial?codigoEAN=", codigoEAN, "&codigoMaterial=", codigoMaterial));

            return result;
        }

        public async Task<List<DTO_ClaveValor>> ObtenerPropiedadesMMPPTipos()
        {
            var result = await _api.GetPostsAsync<List<DTO_ClaveValor>>(string.Concat(_urlPropiedadesMMPP, "Tipos"));

            return result;
        }

        public async Task<List<DTO_ClaveValor>> ObtenerPropiedadesMMPPValoresPorTipo(int idTipoPropiedad)
        {
            var result = await _api.GetPostsAsync<List<DTO_ClaveValor>>(string.Concat(_urlPropiedadesMMPP, "ValoresPorTipo?idTipoPropiedad=", idTipoPropiedad));

            return result;
        }

        public async Task<bool> CrearPropiedadMMPP(List<DTO_PropiedadesMMPP> datos)
        {
            var result = await _api.PostPostsAsync<dynamic>(datos, _urlPropiedadesMMPP);

            return result;
        }

        public async Task<bool> EditarPropiedadMMPP(DTO_PropiedadesMMPP datos)
        {
            var result = await _api.PutPostsAsync<dynamic>(_urlPropiedadesMMPP, datos);
            
            return result;
        }

        public async Task<bool> EliminarPropiedadMMPP(int idPropiedad)
        {
            var result = await _api.DeletePostsAsync<bool>(string.Concat(_urlPropiedadesMMPP, "?idPropiedad=", idPropiedad));

            return result;
        }

        public async Task<bool> FijarSinPropiedades(List<DTO_PropiedadesMMPP> datos)
        {
            var result = await _api.PutPostsAsymmetricAsync<bool>(string.Concat(_urlPropiedadesMMPP, "FijarSinPropiedades"), datos);

            return result;
        }
    }
}