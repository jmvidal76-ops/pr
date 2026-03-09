using Clients.ApiClient.Contracts;
using Common.Models.Almacen.DTO_MaestroEAN;
using Common.Models.Almacen.Proveedor;
using MSM.DTO;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.Proveedor
{
    public class DAO_Proveedor : IDAO_Proveedor
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriProveedorEAN;
        private string UriProveedor;

        private IApiClient _apiTrazabilidad;

        public DAO_Proveedor(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriProveedor = UriBase + "api/proveedor";
            UriProveedorEAN = UriProveedor + "/proveedorEAN";
        }


        public async Task<List<ProveedorEANDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ProveedorEANDto>>(UriProveedorEAN);
            return ret;
        }

        public async Task<ProveedorEANDto> Post(ProveedorEANDto proveedor)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<ProveedorEANDto>(proveedor,UriProveedorEAN);
            return ret;
        }

        public async Task<ProveedorEANDto> Put(ProveedorEANDto proveedor)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<ProveedorEANDto>(UriProveedorEAN,proveedor);
            return ret;
        }

    }
}