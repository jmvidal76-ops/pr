using Common.Models.Almacen.ControlStock;
using Common.Models.Operation;
using Common.Models.Transportes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Operations
{
    public interface IDAO_Operations
    {

        Task<List<LotStatusDto>> GetStatusAll();

        Task<OperationDto> PostOperation(OperationDto operacionDto);

        Task<List<OperationDto>> GetOperationsByFilters(OperationDto filters);

        Task<List<TipoOperacionDto>> GetTypeOperation();

        Task<dynamic> GetLotInfo(string idLote);

        Task<OperationDto> GetOperationsByIdOperation(long id);

        Task<bool> UpdateOperations(OperationDto dto);

        Task<int> DeleteOperations(int dtos);

        Task<OperationDto> PostActualizarLotesConsumidos(OperationDto filters);

        Task<List<ProcesoLoteDto>> ObtenerProcesosLotes(bool isFabricacion);

        Task<List<ProcesoLoteDto>> ObtenerProcesosLotes();

    }
}
