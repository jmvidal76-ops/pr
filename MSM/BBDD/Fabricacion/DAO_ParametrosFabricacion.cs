using Clients.ApiClient.Contracts;
using Common.Models.Fabricacion.Coccion;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public class DAO_ParametrosFabricacion : IDAO_ParametrosFabricacion
    {

        private string UriBase = ConfigurationManager.AppSettings["HostApiSiemensBrewingData"].ToString();
        private string UriBaseFabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();

        private string _urlParametrosFabricacion;
        private string _urlProcessParameter;

        private IApiClient _api;
        public DAO_ParametrosFabricacion()
        {
            _urlParametrosFabricacion = UriBase + "ParametroFabricacion/";
            _urlProcessParameter = UriBase + "processParameter/";
        }

        public DAO_ParametrosFabricacion(IApiClient api)
        {
            _api = api;
        }
        public async Task<List<ParametrosFabricacionDto>> ObtenerParametrosFabricacionPorTipoOrden(int IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<ParametrosFabricacionDto>>(UriBaseFabricacion + "api/ParametrosFabricacion/ObtenerParametrosFabricacionPorTipoOrden/?IdTipoOrden=" + IdTipoOrden);
            return ret;
        }
        public async Task<List<MaestroParametrosFabricacionDto>> ObtenerMaestroParametrosFabricacionPorTipoOrden(int IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<MaestroParametrosFabricacionDto>>(UriBaseFabricacion + "api/ParametrosFabricacion/ObtenerMaestroParametrosFabricacionPorTipoOrden/?IdTipoOrden=" + IdTipoOrden);
            return ret;
        }
        public async Task<bool> EliminarParametroFabricacion(int id)
        {
            var ret = await _api.DeletePostsAsync<bool>(UriBaseFabricacion + "api/ParametrosFabricacion/EliminarParametrosFabricacion/" + id);
            return ret;
        }
        public async Task<bool> CrearParametroFabricacion(ParametrosFabricacionDto Parametro)
        {
            var ret = await _api.PostPostsAsync<dynamic>(Parametro, UriBaseFabricacion + "api/ParametrosFabricacion/CrearParametroFabricacion");
            return ret;
        }
        public async Task<bool> ActualizarParametroFabricacion(ParametrosFabricacionDto Parametro)
        {
            var ret = await _api.PutPostsAsync<dynamic>(UriBaseFabricacion + "api/ParametrosFabricacion/ActualizarParametroFabricacion", Parametro);
            return ret;
        }
    }
}