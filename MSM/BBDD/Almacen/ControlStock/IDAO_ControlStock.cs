using Common.Models;
using Common.Models.Almacen;
using Common.Models.Lote;
using Common.Models.Operation;
using Common.Models.Trazabilidad.Genealogia;
using MSM.DTO;
using MSM.Mappers.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MSM.Mappers.DTO.Envasado;

namespace MSM.BBDD.Almacen.ControlStock
{
    public interface IDAO_ControlStock
    {
        Task<List<DTO_Stock>> Get();

        Task<List<DTO_Stock>> GetConsumidos(DTO_Stock _filters);

        Task<List<DTO_Stock>> GetConsumidosAgrupado(DTO_Stock _filters);

        Task<UbicacionDto> PutState(string idLote, string idEstado);

        Task<List<LoteDto>> ObtenerLotesPorIdUbicacion(int idUbicacion, DateTime fechaInicio, DateTime fechaFin, bool soloLotesNoConsumidos = false);

        Task<List<DTO_LoteMMPP>> ObtenerLotesMateriaPrimaPorIdUbicacion(int idUbicacion);

        Task<bool> ActualizarLoteMateriaPrimaEnvasado(DTO_LoteMMPP LotesMMPP);

        Task<bool> AjustarCantidadLote(OperationDto datos);

        Task<DTO_LoteMateriaPrima> ObtenerLoteMateriaPrima(string idLote);

        Task<bool> CrearLoteMateriaPrima(DTO_LoteMateriaPrima Lote);

        Task<List<PropiedadLoteDto>> ObtenerPropiedadesLote(int IdLote,int IdTipo);

        Task<PropiedadLoteDto> ActualizarPropiedadesLote(PropiedadLoteDto propiedades);

        Task<List<LoteDto>> ObtenerLotesAsociadosAlbaran(int idAlbaran);

        Task DesasociarLoteAlbaran(LoteDto lote);

        Task<LoteDto> AgregarLoteAlbaran(LoteDto lote);

        Task<LoteDto> ActualizarLoteAlbaran(LoteDto lote);

        //Task<string> GetEstadoLIMs(string id);

        Task<bool> GetEstadoFicherosAdjuntos(int id, int tipoLote);

        Task<DTO_RespuestaAPI<bool>> ActualizarFicherosAdjuntosLote(DTO_FicherosAdjuntosLote datos);

        Task<DTO_RespuestaAPI<DTO_FicherosAdjuntosLote>> ObtenerFicherosAdjuntosLote(DTO_FicherosAdjuntosLote datos);

        Task<DTO_RespuestaAPI<bool>> EditarNotasLote(int idLote, string notas, int tipoLote);

        Task<string> ObtenerTCPOrigen(string ubicacion);

        Task<bool> CrearLoteCervezaLlenadora(dynamic datos);
    }
}
