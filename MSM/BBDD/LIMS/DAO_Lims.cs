using Clients.ApiClient.Contracts;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.LIMS;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;

namespace MSM.BBDD.LIMS
{
    public class DAO_Lims : IDAO_LIMS
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiLIMS"].ToString();
        private string UriLIMS;

        private IApiClient _api;

        public DAO_Lims(IApiClient apiLims)
        {
            _api = apiLims;
            UriLIMS = UriBase + "api/LIMS";
        }

        public async Task<DTO_RespuestaAPI<DTO_ClaveValor>> ObtenerEstadoLIMsDetalleOrden(string loteMES)
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<DTO_ClaveValor>>(UriLIMS + "/ObtenerEstadoLIMsDetalleOrden?LoteMES=" + loteMES);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_ClaveValor>>> ObtenerEstadosLIMsDetalleOrdenMultiple(List<string> lotesMES)
        {
            var queryString = string.Join(",", lotesMES.Select(l => Uri.EscapeDataString(l)));
            var url = $"{UriLIMS}/ObtenerEstadosLIMsDetalleOrdenMultiple?lotesMES={queryString}";

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_ClaveValor>>>(url);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<DateTime?>> ObtenerFechaUltimaPeticionLIMs(string loteMES, bool dependeMuestra)
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<DateTime?>>(UriLIMS + "/ObtenerFechaUltimaPeticionLIMs?LoteMES=" + loteMES + "&dependeMuestra=" + dependeMuestra);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_MuestraLIMS>>> ObtenerMuestrasLIMSOrden(string loteMES)
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_MuestraLIMS>>>(UriLIMS + "/ObtenerMuestrasLIMS?LoteMES=" + loteMES);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_MuestraLIMS>>> ObtenerMuestrasLIMSMultiples(List<string> lotesMES)
        {
            var result = await _api.PostPostsAsync<dynamic>(lotesMES, UriLIMS + "/ObtenerMuestrasLIMSMultiples");

            var json = result.ToString(); 
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<List<DTO_MuestraLIMS>>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_WorkflowLIMS>>> ObtenerWorkflowsLIMS()
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_WorkflowLIMS>>>(UriLIMS + "/ObtenerWorkflowsLIMS");
            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_ConfiguracionMuestrasAutomaticas>>> ObtenerConfiguracionMuestrasAutomaticasWorkflowsLIMS()
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_ConfiguracionMuestrasAutomaticas>>>(UriLIMS + "/ObtenerConfiguracionMuestrasAutomaticas");
            return ret;
        }

        public async Task<DTO_RespuestaAPI<string>> ObtenerParametroGeneral_LIMS(string Clave)
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<string>>(UriLIMS + "/ObtenerParametroGeneral_LIMS?Clave=" + Clave);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> PeticionMuestraLIMS(DTO_PeticionMuestraLIMS dto)
        {
            var jsonResult = await _api.PostPostsAsync<dynamic>(dto, UriLIMS + "/PeticionMuestraLIMS");

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<DTO_ClaveValor>> obtenerEstadoLIMSdeWOEnvasado(string wo)
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<DTO_ClaveValor>>(UriLIMS + "/obtenerEstadoLIMSdeWOEnvasado?wo=" + wo);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_LanzamientoMuestrasLIMs>>> ObtenerMuestrasLanzadasUltimoDia(string idLinea)
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_LanzamientoMuestrasLIMs>>>(UriLIMS + "/MuestrasLanzadasUltimoDia?idLinea=" + idLinea);

            return result;
        }

        #region Antiguo LIMS
        //public async Task<List<OrdenesMuestrasDto>> GetSamplesList(int IdOrder)
        // {
        //     var ret = await _apiTrazabilidad.GetPostsAsync<List<OrdenesMuestrasDto>>(UriOrdenesMuestra + IdOrder.ToString());
        //     return ret;
        // }

        // public async Task<OrdenesMuestrasDto> Post(OrdenesMuestrasDto dto)
        // {
        //     var ret = await _apiTrazabilidad.PostPostsAsync<OrdenesMuestrasDto>(dto, UriOrdenesMuestra);
        //     return ret;
        // }

        // public async Task<ReturnValue> DeleteSample(int idSample)
        // {
        //     var ret = await _apiTrazabilidad.DeletePostsAsync<ReturnValue>(UriOrdenesMuestra + idSample.ToString());
        //     return ret;
        // }

        // public async Task<List<TipoMuestrasDto>> GetSampleTypes(string subDep)
        // {
        //     var ret = await _apiTrazabilidad.GetPostsAsync<List<TipoMuestrasDto>>(UriBase + "api/tipoMuestras/" + subDep);
        //     return ret;
        // }

        // public async Task<List<DepartamentoDto>> GetDepartament(int idSampleType)
        // {
        //     var ret = await _apiTrazabilidad.GetPostsAsync<List<DepartamentoDto>>(UriBase + "api/Departament/" + idSampleType.ToString());
        //     return ret;
        // }

        // public async Task<List<SubDepartamentoDto>> GetSubDepartament(string department)
        // {
        //     var ret = await _apiTrazabilidad.GetPostsAsync<List<SubDepartamentoDto>>(UriBase + "api/SubDepartament/" + department);
        //     return ret;
        // }

        // public async Task<List<DetalleMuestraDto>> GetSampleDetails(int idSample)
        // {
        //     var ret = await _apiTrazabilidad.GetPostsAsync<List<DetalleMuestraDto>>(UriBase + "api/detalleMuestra/" + idSample.ToString());
        //     return ret;
        // }

        #endregion
    }
}