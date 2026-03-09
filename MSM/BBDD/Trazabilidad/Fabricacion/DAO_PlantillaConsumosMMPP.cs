using Clients.ApiClient.Contracts;
using Common.Models.Fabricacion;
using Common.Models.Material;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Fabricacion
{
    public class DAO_PlantillaConsumosMMPP: IDAO_PlantillaConsumosMMPP
    {
        private IApiClient _apiClient;

        private string UriBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriBaseFabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();
        private string UriPlantillaConsumoMMPP;
        private string UriTipoOrden;
        private string UriTipoDisparador;
        private string UriModoDescuento;
        private string UriUbicacionesPlantillaConsumoMMPP;
        private string UriTipoSemielaboradoPlantillaConsumoMMPP;
        private string UriDisparadorKOPPlantillaConsumoMMPP;
        private string UriDisparadorTransferenciaPlantillaConsumoMMPP;
        private string UriPrefijosLoteSAI;
        private string UriMaterialSAI;
        private string UriLotesAsociados;

        public DAO_PlantillaConsumosMMPP(IApiClient apiClient)
        {
            _apiClient = apiClient;
            UriPlantillaConsumoMMPP = UriBaseTrazabilidad + "api/plantillasConsumosMMPP";
            UriTipoOrden = UriBaseFabricacion + "api/orden/TiposWO";
            UriTipoDisparador = UriBaseTrazabilidad + "api/tiposDisparador";
            UriModoDescuento = UriBaseTrazabilidad + "api/modoDescuento";
            UriUbicacionesPlantillaConsumoMMPP = UriBaseTrazabilidad + "api/ubicacionesPlantillaConsumosMMPP/";
            UriDisparadorKOPPlantillaConsumoMMPP = UriBaseTrazabilidad + "api/disparadorKOPPlantillaConsumosMMPP/";
            UriTipoSemielaboradoPlantillaConsumoMMPP = UriBaseTrazabilidad + "api/tipoSemielaboradoPlantillaConsumosMMPP/";
            UriDisparadorTransferenciaPlantillaConsumoMMPP = UriBaseTrazabilidad + "api/disparadorTransferenciaPlantillaConsumosMMPP/";
            UriPrefijosLoteSAI =  UriBaseTrazabilidad + "api/prefijoLoteSAI";
            UriMaterialSAI = UriBaseTrazabilidad + "api/materialSAI";
            UriLotesAsociados = UriBaseTrazabilidad + "api/plantillasConsumosMMPP/LotesAsociados/";
        }

        public async Task<List<PlantillaConsumoMMPP_DTO>> ObtenerPlantillasConsumosMMPP()
        {
            var ret = await _apiClient.GetPostsAsync<List<PlantillaConsumoMMPP_DTO>>(UriPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<PlantillaConsumoMMPP_DTO> ObtenerPlantillasConsumosMMPPPorId(int id)
        {
            var ret = await _apiClient.GetPostsAsync<PlantillaConsumoMMPP_DTO>(string.Concat(UriPlantillaConsumoMMPP,"/",id));
            return ret;
        }

        public async Task<List<DTO_TiposOrden>> ObtenerTipoOrdenFabricacion()
        {
            var ret = await _apiClient.GetPostsAsync<List<DTO_TiposOrden>>(UriTipoOrden);
            return ret;
        }

        public async Task<List<TipoDisparador_DTO>> ObtenerTipoDisparador()
        {
            var ret = await _apiClient.GetPostsAsync<List<TipoDisparador_DTO>>(UriTipoDisparador);
            return ret;
        }

        public async Task<List<ModoDescuentoConsumoMMPP_DTO>> ObtenerModoDescuento()
        {
            var ret = await _apiClient.GetPostsAsync<List<ModoDescuentoConsumoMMPP_DTO>>(UriModoDescuento);
            return ret;
        }

        public async Task<PlantillaConsumoMMPP_DTO> Create(PlantillaConsumoMMPP_DTO plantilla)
        {
            var ret = await _apiClient.PostPostsAsync<PlantillaConsumoMMPP_DTO>(plantilla, UriPlantillaConsumoMMPP);
            return ret;
        }
        public async Task<PlantillaConsumoMMPP_DTO> Update(PlantillaConsumoMMPP_DTO plantilla)
        {
            var ret = await _apiClient.PutPostsAsync<PlantillaConsumoMMPP_DTO>(UriPlantillaConsumoMMPP, plantilla);
            return ret;
        }

        public async Task<int> Delete(int id)
        {
            UriPlantillaConsumoMMPP = UriPlantillaConsumoMMPP + '/' + id;
            var ret = await _apiClient.DeletePostsAsync<int>(UriPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<List<UbicacionesPlantillaConsumoDto>> ObtenerUbicacionesPlantilla(int id)
        {
            UriUbicacionesPlantillaConsumoMMPP = UriUbicacionesPlantillaConsumoMMPP + id;
            var ret = await _apiClient.GetPostsAsync<List<UbicacionesPlantillaConsumoDto>>(UriUbicacionesPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<List<TipoSemielaboradoPlantillaConsumoDto>> ObtenerTiposSemielaboradosPlantilla(int id)
        {
            UriTipoSemielaboradoPlantillaConsumoMMPP = UriTipoSemielaboradoPlantillaConsumoMMPP + id;
            var ret = await _apiClient.GetPostsAsync<List<TipoSemielaboradoPlantillaConsumoDto>>(UriTipoSemielaboradoPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<TipoSemielaboradoPlantillaConsumoDto> ActualizarCantidadTiposSemielaboradosPlantilla(TipoSemielaboradoPlantillaConsumoDto tipoSemi)
        {
            var ret = await _apiClient.PutPostsAsync<TipoSemielaboradoPlantillaConsumoDto>(UriTipoSemielaboradoPlantillaConsumoMMPP,tipoSemi);
            return ret;
        }

        public async Task<PlantillaUbicacionesDto> ActualizarPlantillaUbicaciones(PlantillaUbicacionesDto plantillaUbicacion)
        {
            var ret = await _apiClient.PostPostsAsync<PlantillaUbicacionesDto>(plantillaUbicacion, UriUbicacionesPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<PlantillaTiposSemielaboradosDto> ActualizarPlantillaTiposSemielaborados(PlantillaTiposSemielaboradosDto plantillaTipo)
        {
            var ret = await _apiClient.PostPostsAsync<PlantillaTiposSemielaboradosDto>(plantillaTipo, UriTipoSemielaboradoPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<List<DisparadorKOPDto>> ObtenerDisparadorKOPPlantilla(int id)
        {
            UriDisparadorKOPPlantillaConsumoMMPP = UriDisparadorKOPPlantillaConsumoMMPP + id;
            var ret = await _apiClient.GetPostsAsync<List<DisparadorKOPDto>>(UriDisparadorKOPPlantillaConsumoMMPP);

            if (ret.Count > 0)
                ret = ret.Where(t => t.IdTipoKOP == (int)TipoKOP.Capturado).ToList();

            return ret;
        }

        public async Task<PlantillaDisparadoresKOPDto> ActualizarPlantillaDisparadorKOP(PlantillaDisparadoresKOPDto disparadores)
        {
            var ret = await _apiClient.PostPostsAsync<PlantillaDisparadoresKOPDto>(disparadores, UriDisparadorKOPPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<List<DisparadorTransferenciaDto>> ObtenerDisparadorTransferenciaPlantilla(int id)
        {
            UriDisparadorTransferenciaPlantillaConsumoMMPP = UriDisparadorTransferenciaPlantillaConsumoMMPP + id;
            var ret = await _apiClient.GetPostsAsync<List<DisparadorTransferenciaDto>>(UriDisparadorTransferenciaPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<List<PrefijosLoteSAIDto>> ObtenerPrefijosLoteSAI()
        {
            var ret = await _apiClient.GetPostsAsync<List<PrefijosLoteSAIDto>>(UriPrefijosLoteSAI);
            return ret;
        }

        public async Task<List<MaterialSAIDto>> ObtenerMaterialSAI()
        {
            var ret = await _apiClient.GetPostsAsync<List<MaterialSAIDto>>(UriMaterialSAI);
            return ret;
        }

        public async Task<DisparadorTransferenciaDto> CreateDisparadorTransferencia(DisparadorTransferenciaDto disparador)
        {
            var ret = await _apiClient.PostPostsAsync<DisparadorTransferenciaDto>(disparador, UriDisparadorTransferenciaPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<DisparadorTransferenciaDto> UpdateDisparadorTransferencia(DisparadorTransferenciaDto disparador)
        {
            var ret = await _apiClient.PutPostsAsync<DisparadorTransferenciaDto>(UriDisparadorTransferenciaPlantillaConsumoMMPP, disparador);
            return ret;
        }

        public async Task<int> DeleteDisparadorTransferencia(int idDisparadorTransferencia)
        {
            UriDisparadorTransferenciaPlantillaConsumoMMPP = UriDisparadorTransferenciaPlantillaConsumoMMPP + '/' + idDisparadorTransferencia;
            var ret = await _apiClient.DeletePostsAsync<int>(UriDisparadorTransferenciaPlantillaConsumoMMPP);
            return ret;
        }

        public async Task<List<LoteAsociadoDto>> ObtenerLotesAsociados(int idPlantilla, int idUbicacion, string idMaterial)
        {
            var uri = string.Concat(UriLotesAsociados, idPlantilla, "/", idUbicacion, "/", idMaterial);
            return await _apiClient.GetPostsAsync<List<LoteAsociadoDto>>(uri);
        }

        public async Task<PlantillaLotesAsociadosDto> ActualizarPlantillaLotesAsociados(PlantillaLotesAsociadosDto lotesAsociados)
        {
            var ret = await _apiClient.PutPostsAsync<PlantillaLotesAsociadosDto>(UriLotesAsociados, lotesAsociados);
            return ret;
        }
    }
}