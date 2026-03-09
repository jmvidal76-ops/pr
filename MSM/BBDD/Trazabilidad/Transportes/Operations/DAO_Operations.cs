using Clients.ApiClient.Contracts;
using Common.Models.Almacen.ControlStock;
using Common.Models.Operation;
using Common.Models.Transportes;
using MSM.BBDD.Trazabilidad.Operations;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Operations
{
    public class DAO_Operation : IDAO_Operations
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriOperation ;
        private string UriStatus ;
        private string UriTypeOperation ;
        private string UriOperationWithFilters;
        private string UriUnrelatedOperations;
        private string UriOperationByIdOperation;
        
        private string UriDeleteOperations;
        private string UriControlStock;
        private string UriProcesosLotes;

        private IApiClient _apiTrazabilidad;

        public DAO_Operation(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriOperation = UriBase + "api/operation";
            UriStatus = UriOperation + "/GetStatus";
            UriTypeOperation = UriOperation + "/GetTypeOperation";
            UriOperationWithFilters = UriOperation + "/GetAllByFilters?";
            UriUnrelatedOperations = UriOperation + "/GetUnrelatedOperations";
            UriOperationByIdOperation = UriOperation + "/GetOperationByIdOperation";
            UriDeleteOperations = UriBase + "api/eliminarLoteSinCodigoJDE";
            UriControlStock = UriBase + "api/controlStock";
            UriProcesosLotes = UriBase + "api/GetProcesosLotes";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }



        public async Task<List<LotStatusDto>> GetStatusAll()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<LotStatusDto>>(UriStatus);
            return ret;
        }

        public async Task<dynamic> GetLotInfo(string idLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<dynamic>(UriOperation+"/GetLotInfo/"+idLote);
            return ret;
        }

        public async Task<OperationDto> PostOperation(OperationDto operacionDto) {
            try
            {
                var ret = await _apiTrazabilidad.PostPostsAsync(operacionDto, UriOperation);
                return ret;
            }
            catch
            {
                return null;
            }
        
        }

        public async Task<List<OperationDto>> GetOperationsByFilters(OperationDto filters)
        {
            var ret = await _apiTrazabilidad.PostAsJsonAsync(filters,UriOperationWithFilters);
            return ret;
        }

        public async Task<List<TipoOperacionDto>> GetTypeOperation() {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TipoOperacionDto>>(UriTypeOperation);
            return ret;
        
        }

        

        public async Task<OperationDto> GetOperationsByIdOperation(long id)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<OperationDto>(UriOperationByIdOperation + id.ToString());
            return ret;
        }

        public async Task<bool> UpdateOperations(OperationDto dto)
        {
            try
            {
                await _apiTrazabilidad.PutPostsAsync<OperationDto>(UriOperation,dto);
            }
            catch
            {
                return false;
            }
            return true;
        }

        public async Task<int> DeleteOperations(int id)
        {
            return await _apiTrazabilidad.DeletePostsAsync<int>(UriDeleteOperations+"/"+id);
        }

        public async Task<OperationDto> PostActualizarLotesConsumidos(OperationDto operation)
        {
            var res = await _apiTrazabilidad.PostPostsAsync(operation, UriControlStock + "/ActualizarConsumedLotsFechas");
            return res;
        }

        public async Task<List<ProcesoLoteDto>> ObtenerProcesosLotes(bool isFabricacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ProcesoLoteDto>>(UriProcesosLotes);
            if(ret.Count > 0)
            {
                ret = isFabricacion ? ret.Where(t => t.IdProceso != (int)ProcesoLoteEnum.ENV && t.IdProceso != (int)ProcesoLoteEnum.REC).ToList() : ret.Where(t => t.IdProceso == (int)ProcesoLoteEnum.ENV || t.IdProceso == (int)ProcesoLoteEnum.REC).ToList();
            }

            return ret;
        }

        public async Task<List<ProcesoLoteDto>> ObtenerProcesosLotes()
        {
            return await _apiTrazabilidad.GetPostsAsync<List<ProcesoLoteDto>>(UriProcesosLotes);

        }


    }
}
