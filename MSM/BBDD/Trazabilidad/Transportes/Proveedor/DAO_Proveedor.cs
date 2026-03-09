using Clients.ApiClient.Contracts;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public class DAO_Proveedor : IDAO_Proveedor
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriProveedor ;
        private string UriProveedorEAN;
        private string UriMaestroProveedor;
        private string UriMaestroProveedorLoteMMPP;

        private IApiClient _apiTrazabilidad;

        public DAO_Proveedor(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriProveedor = UriBase + "api/proveedor";
            UriMaestroProveedor = UriBase + "api/maestroproveedor";
            UriMaestroProveedorLoteMMPP = UriBase + "api/maestroproveedorLoteMMPP";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<List<ProveedorDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ProveedorDto>>(UriProveedor);
            return ret;
        }

        public async Task<List<ProveedorDto>> GetMaestroProveedores()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ProveedorDto>>(UriMaestroProveedor);
            return ret;
        }

        public async Task<List<ProveedorDto>> GetMaestroProveedoresLoteMMPP()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ProveedorDto>>(UriMaestroProveedorLoteMMPP);
            return ret;
        }

        public async Task<int> Delete(int id)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriProveedor + "/" + id);
            return ret;
        }

        public async Task<ProveedorDto> Post(ProveedorDto Transportista)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<ProveedorDto>(Transportista, UriProveedor);
            return ret;
        }

        public async Task<ProveedorDto> Put(ProveedorDto Transportista)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<ProveedorDto>(UriProveedor, Transportista);
            return ret;
        }
    }
}