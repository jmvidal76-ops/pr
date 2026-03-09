using Common.Models;
using Common.Models.Trazabilidad;
using Common.Models.Trazabilidad.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Fabricacion
{
    public interface IDAO_MovimientosLotes
    {
        Task<dynamic> ObtenerMovimientosLotes(dynamic fechas);

        Task<MovimientoLoteDto> AgregarMovimientosLotes(MovimientoLoteDto movimientoDto);
        Task<MovimientoLoteDto> EditarMovimientosLotes(MovimientoLoteDto movimientoDto);
        Task<MovimientoLoteDto> AgregarMovimientoLoteFabricacion(MovimientoLoteDto movimientoDto);
        Task<List<TransferenciaLoteFabricacionDto>> ObtenerTransferenciasLotes(int id);
        Task<TransferenciaLoteFabricacionDto> AgregarTransferenciaLotes(TransferenciaLoteFabricacionDto transferencia);
        Task<DTO_LoteMMPPFabricacion> ObtenerLoteMMPPFabricacion(int id);
        Task<string> ActualizarLoteMMPPFabricacion(DTO_LoteMMPPFabricacion lote);
        Task<string> ActualizarLoteSemielaborado(DTO_LoteSemielaborado lote);
        Task<DTO_LoteSemielaborado> ObtenerLoteSemielaborado(int id);
        Task<List<TransferenciaLoteFabricacionDto>> ObtenerTransferenciasPorLote(string lote);
        Task<DTO_LoteMMPPFabricacion> AgregarLoteMMPPFabricacion(DTO_LoteMMPPFabricacion entity);
        Task<DTO_LoteSemielaborado> AgregarLoteSemielaborado(DTO_LoteSemielaborado entity);
        Task<List<MaestroTipoLoteManualSemielaboradosDto>> ObtenerMaestroTipoLoteManualSemielaborados(string idTipoZona);
        Task<List<TransferenciaTCPDto>> AgregarTransferenciaTCP(TransferenciaTCPDto transferencia);
        Task<bool> ActualizarCantidadMovimientos(MovimientoLoteCantidadDto movimiento);
    }
}
