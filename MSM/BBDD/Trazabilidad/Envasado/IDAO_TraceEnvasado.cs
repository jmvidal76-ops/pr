using Common.Models;
using Common.Models.Trazabilidad.Estado;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Envasado
{
    public interface IDAO_TraceEnvasado
    {
        Task<List<PaletMMPPDto>> GetPaletsPorMMPP(PaletMMPPDto _filters);
        Task<List<PaletMMPPDto>> ObtenerPaletsPorMMPPPorIdList(List<int> lotesEnvasado, int cantPaletas);
        
        Task<List<LoteConsumidoDto>> GetLotesConsumidos(ProAcaMMPPDto _filters);
        Task<DTO_LoteMateriaPrima> ObtenerLoteEnvasado(int id);
        Task<List<InfoLoteProductoAcabadoDto>> GetInfoLotesProductoAcabado(ProAcaMMPPDto _filters);
        Task<List<PaletMMPPDto>> GetEnvaseProductoAcabado(ProAcaMMPPDto _filters);
        Task<DTO_RespuestaAPI<ProAcaMMPPDto>> ConvertirLoteALineaFecha(string loteEnvase);
    }
}
