using Clients.ApiClient.Contracts;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public class DAO_Producto : IDAO_Producto
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriProductos ;

        private IApiClient _apiTrazabilidad;

        public DAO_Producto(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriProductos = UriBase + "api/producto";
           // _apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<List<ProductoDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ProductoDto>>(UriProductos);
            return ret;
        }
        
        public async Task<List<ProductoDto>> GetPorOperacion(int operacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ProductoDto>>(UriProductos + "Operacion/" + operacion.ToString());
            return ret;
        }

        public async Task<int> Delete(int id)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriProductos + "/" + id);
            return ret;
        }

        public async Task<ProductoDto> Post(ProductoDto producto, int? operacion = null)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<ProductoDto>(producto, UriProductos + (operacion != null ? "?operacion=" + ((int)operacion).ToString() : ""));
            return ret;
        }

        public async Task<ProductoDto> Put(ProductoDto producto)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<ProductoDto>(UriProductos, producto);
            return ret;
        }
    }
}