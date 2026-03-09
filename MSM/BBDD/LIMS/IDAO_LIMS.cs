using Common.Models.Muestras;
using Common.Models.OrdenesMuestras;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.LIMS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.LIMS
{
    public interface IDAO_LIMS
    {
        Task<DTO_RespuestaAPI<DTO_ClaveValor>> ObtenerEstadoLIMsDetalleOrden(string loteMES);
        Task<DTO_RespuestaAPI<List<DTO_ClaveValor>>> ObtenerEstadosLIMsDetalleOrdenMultiple(List<string> lotesMES);
        Task<DTO_RespuestaAPI<DateTime?>> ObtenerFechaUltimaPeticionLIMs(string loteMES, bool dependeMuestra);
        Task<DTO_RespuestaAPI<List<DTO_MuestraLIMS>>> ObtenerMuestrasLIMSOrden(string loteMES);
        Task<DTO_RespuestaAPI<List<DTO_MuestraLIMS>>> ObtenerMuestrasLIMSMultiples(List<string> lotesMES);
        Task<DTO_RespuestaAPI<List<DTO_WorkflowLIMS>>> ObtenerWorkflowsLIMS();
        Task<DTO_RespuestaAPI<List<DTO_ConfiguracionMuestrasAutomaticas>>> ObtenerConfiguracionMuestrasAutomaticasWorkflowsLIMS();
        Task<DTO_RespuestaAPI<string>> ObtenerParametroGeneral_LIMS(string Clave);
        Task<DTO_RespuestaAPI<bool>> PeticionMuestraLIMS(DTO_PeticionMuestraLIMS dto);
        Task<DTO_RespuestaAPI<DTO_ClaveValor>> obtenerEstadoLIMSdeWOEnvasado(string wo);
        Task<DTO_RespuestaAPI<List<DTO_LanzamientoMuestrasLIMs>>> ObtenerMuestrasLanzadasUltimoDia(string idLinea);

        //Task<List<OrdenesMuestrasDto>> GetSamplesList(int IdOrder);

        //Task<OrdenesMuestrasDto> Post(OrdenesMuestrasDto dto);

        //Task<ReturnValue> DeleteSample(int dto);

        //Task<List<TipoMuestrasDto>> GetSampleTypes(string subDep);

        //Task<List<DepartamentoDto>> GetDepartament(int idSampleType);

        //Task<List<SubDepartamentoDto>> GetSubDepartament(string department);

        //Task<List<DetalleMuestraDto>> GetSampleDetails(int idSample);
    }
}