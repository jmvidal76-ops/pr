using Common.Models;
using Common.Models.Almacen;
using Common.Models.Almacen.ControlStock;
using MSM.DTO;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Fabricacion.Api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.ControlStockFabricacion
{
    public interface IDAO_ControlStockFabricacion
    {
        Task<List<DTO_Stock>> Get();

        Task<List<DTO_Stock>> GetConsumidos(DTO_Stock _filters);

        Task<List<DTO_Stock>> GetConsumidosAgrupado(DTO_Stock _filters);

        Task<UbicacionDto> PutState(string idLote, string idEstado);

        Task<List<DTO_LoteSemielaborado>> GetLoteSemielaborado();

        Task<List<DTO_LoteSemielaborado>> GetLoteSemielaboradoConsumido(DTO_Stock _filters);

        Task<DTO_Stock> ActualizarLotesFabricacionConsumidos(DTO_Stock _filters);

        Task<DTO_LoteSemielaborado> ActualizarLoteSemielaborado(DTO_LoteSemielaborado lote);

        Task<DTO_LoteSemielaborado> ActualizarLoteSemielaboradoConsumido(DTO_LoteSemielaborado lote);

        Task<DTO_LoteSemielaborado> AgregarLoteSemielaborado(DTO_LoteSemielaborado lote);

        Task<int> EliminarLoteSemielaborado(int idLote);

        Task<int> EliminarLoteSemielaboradoConsumido(int idLote);

        Task<int> EliminarLoteMMPPConsumido(int idLote);

        Task<List<AvisoStockMMPPFabricacionDto>> ObtenerAvisosStockMMPPFabricacion();

        Task<AvisoStockMMPPFabricacionDto> AgregarAvisoStockMMPPFabricacion(AvisoStockMMPPFabricacionDto aviso);

        Task<AvisoStockMMPPFabricacionDto> ModificarAvisoStockMMPPFabricacion(AvisoStockMMPPFabricacionDto aviso);

        Task<int> EliminarAvisoStockMMPPFabricacion(int idAviso);

        Task<DTO_RespuestaAPI<bool>> ActualizarArchivosAdjuntosStockFabricacion(DTO_FicherosAdjuntosLote datos);
    }
}
