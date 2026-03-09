//using ApplicationCore.DTOs;
using Common.Models.Fabricacion;
using Common.Models.Material;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Models.Fabricacion;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Fabricacion
{
    public interface IDAO_PlantillaConsumosMMPP
    {

        Task<List<PlantillaConsumoMMPP_DTO>> ObtenerPlantillasConsumosMMPP();

        Task<PlantillaConsumoMMPP_DTO> ObtenerPlantillasConsumosMMPPPorId(int id);

        Task<List<DTO_TiposOrden>> ObtenerTipoOrdenFabricacion();

        Task<List<TipoDisparador_DTO>> ObtenerTipoDisparador();

        Task<List<ModoDescuentoConsumoMMPP_DTO>> ObtenerModoDescuento();

        Task<PlantillaConsumoMMPP_DTO> Create(PlantillaConsumoMMPP_DTO plantilla);

        Task<PlantillaConsumoMMPP_DTO> Update(PlantillaConsumoMMPP_DTO plantilla);

        Task<int> Delete(int id);

        Task<List<UbicacionesPlantillaConsumoDto>> ObtenerUbicacionesPlantilla(int id);

        Task<List<TipoSemielaboradoPlantillaConsumoDto>> ObtenerTiposSemielaboradosPlantilla(int id);

        Task<TipoSemielaboradoPlantillaConsumoDto> ActualizarCantidadTiposSemielaboradosPlantilla(TipoSemielaboradoPlantillaConsumoDto tipoSemi);

        Task<PlantillaUbicacionesDto> ActualizarPlantillaUbicaciones(PlantillaUbicacionesDto plantillaUbicacion);

        Task<PlantillaTiposSemielaboradosDto> ActualizarPlantillaTiposSemielaborados(PlantillaTiposSemielaboradosDto plantillaTipo);

        Task<List<DisparadorKOPDto>> ObtenerDisparadorKOPPlantilla(int id);

        Task<PlantillaDisparadoresKOPDto> ActualizarPlantillaDisparadorKOP(PlantillaDisparadoresKOPDto disparadores);

        Task<List<DisparadorTransferenciaDto>> ObtenerDisparadorTransferenciaPlantilla(int id);

        Task<List<PrefijosLoteSAIDto>> ObtenerPrefijosLoteSAI();

        Task<List<MaterialSAIDto>> ObtenerMaterialSAI();

        Task<DisparadorTransferenciaDto> CreateDisparadorTransferencia(DisparadorTransferenciaDto disparador);

        Task<DisparadorTransferenciaDto> UpdateDisparadorTransferencia(DisparadorTransferenciaDto disparador);

        Task<int> DeleteDisparadorTransferencia(int idDisparadorTransferencia);

        Task<List<LoteAsociadoDto>> ObtenerLotesAsociados(int idPlantilla, int idUbicacion, string idMaterial);

        Task<PlantillaLotesAsociadosDto> ActualizarPlantillaLotesAsociados(PlantillaLotesAsociadosDto lotesAsociados);
    }


}
