using Common.Models.Fabricacion.Orden;
using Common.Models.Fabricacion.Sala;
using Common.Models.Trazabilidad.Fabricacion;
using MSM.BBDD.Model;
using MSM.BBDD.RTDS;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api;
using MSM.Mappers.DTO.Fabricacion.Api.Lot;
using MSM.Models.Fabricacion;
using MSM_FabricacionAPI.Models.Orden;
using Siemens.Brewing.Domain.Entities;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public interface IDAO_Orden
    {
        //List<Orden> GetListaOrdenesProgramaFabricacion(DateTime fechaInicio,DateTime fechaFin);
        Task<ReturnValue> ArrancarOrden(dynamic Datos);
        List<dynamic> GetAllOrdenPlanificada(int idTipo);
        Task<String> GetOrderNotes(string IdOrden);
        Task<String> GetPlannedOrderNotes(string IdOrden);
        Task<ReturnValue> SetOrderNotes(string IdOrden, string Nota);
        ReturnValue SetNoteWOFinalizadas(string IdOrden, string Nota);
        Task<ReturnValue> SetPlannedOrderNotes(string IdOrden, string Nota);
        Task<ReturnValue> CrearOrdenPlanificado(dynamic Orden);
        Task<ReturnValue> EvalueNumeroOrden(dynamic Orden);
        Task<bool> ConsolidarDatos(int IdOrden);
        Task<DTO_RespuestaAPI<bool>> CerrarOrden(int IdOrden);
        Task<bool> ReclasificarOrden(dynamic Datos);
        Task<bool> CreaFiltracion(dynamic Datos);
        Task<bool> UpdateDecanting(UpdateDecanting_DTO Datos);
        Task<bool> EditaFiltracion(UpdateFilter_DTO Datos);
        Task<ReturnValue> EditaWOFab(dynamic Orden);
        Task<bool> EliminarFiltracion(dynamic Datos);
        Task<bool> CrearOrdenPlanificada(dynamic OrdenPlanificada);
        Task<int> ObtenerSiguienteNumeroCoccion(int anyo, String text);
        Task<String> GetOrderIDByDeltav(int anyo, string text, ISitRTDS _sitRTDS);
        Task<ReturnValue> ArrancarCrearOrden(dynamic Datos);
        Task<ReturnValue> CrearOrdenesPlanificadaMultiple(dynamic Datos);
        Task<DateTime?> ObtenerUltimaFechaOrden(int idUbicacion);
        Task<ReturnValue> AddWONoPlanificada(dynamic Orden);
        Task<List<DTO_Orden>> ObtenerListadoOrdenes(int IdOrden);

        Task<List<DTO_Orden>> ObtenerListadoOrdenesCerradas(string FechaDesde, string fechaHasta);

        Task<DTO_Orden_Detalle> ObtenerDetalleOrden(int IdOrden, int IdTipoOrden);

        Task<List<DTO_KOPs>> ObtenerKOPsOrden(int IdOrden, int IdTipoOrden);
        Task<DTO_RespuestaAPI<List<DTO_KOPs>>> ObtenerKOPsWORevision(DateTime fechaDesde, DateTime fechaHasta);

        Task<int> ValidarNumeroCreacionOrdenManual(int NumeroOrden, int Anio, int IdUbicacion, int idTipoOrdem);

        Task<bool> CrearOrdenManual(dynamic Datos);

        Task<SitOrder> SelectOrderById(string Id);

        Task<string> LotNameByOrder(SitOrder Datos);
        Task<List<DTO_Orden_Planificada>> ObtenerListadoOrdenPlanificada(int IdTipoOrden);
        Task<bool> EditarOrdenPlanificada(dynamic OrdenPlanificada);
        Task<bool> EditarParametroOrdenPlanificada(dynamic ParametroOrdenPlanificada);
        Task<List<DTO_Orden_Planificada_Parametro>> ObtenerListadoParametrosOrden();
        Task<bool> ValidarFechaNuevaOrdenPlanificada(int IdTipoOrden, int IdSala, string FechaInicio);
        Task<bool> ValidarFechaNuevaOrdenPlanificadaPorIdOrden(int IdTipoOrden, int IdSala, string FechaInicio, int IdOrden);
        Task<DateTime?> ObtenerUltimaFechaOrdenTrasiego(int IdSala, int IdTipoOrden);
        Task<bool> IntercambioFechasOrdenOrigenDestino(dynamic Orden);
        Task<bool> ReplanificarOrdenPlanificadaTrasiego(int IdZona);
        Task<List<DTO_SalaOrigenDTO>> ObtenerSalasOrigenPorTipoOrden(int IdTipoOrden);
        Task<List<DTO_LoteMMPPFabricacion>> ObtenerLotesConsumosPorLoteMES(string LoteMES);
        Task<dynamic> ObtenerLotesConsumosPorIdLotes(List<DTO_LoteMMPPFabricacion> LoteMES);
        Task<dynamic> ObtenerLotesConsumosFiltracion(List<int> listaIdsLotes);
        Task<List<DTO_LoteMMPPFabricacion>> ObtenerLotesProducidosPorLoteMES(string LoteMES);
        Task<dynamic> ObtenerLotesTransferenciasFiltracion(DTO_ListadoIdsLotesFiltracion listIds);
        Task<List<DTO_LoteMMPPFabricacion>> ObtenerLotesProducidosFiltracion(string fechaDesde, string fechaHasta, string idUbicacion);
        Task<List<TransferenciaLoteFabricacionDto>> ObtenerLotesTransferenciasPorLoteMES(string LoteMES);
        Task<List<DTO_Orden_Gantt>> GetListaOrdenesProgramaFabricacion(string FechaDesde, string FechaHasta);
        Task<dynamic> ObtenerLotesConsumosFiltracionFechas(string fechInicio, string fechaFin, string idUbicacion);
        Task<dynamic> ObtenerLotesTransferenciasFiltracionFechas(string fechaDesde, string fechaHasta, string idUbicacion);
        Task<dynamic> ObtenerLotesTransferenciasTrasiegoPorIdWO(int IdWO);
        Task<List<DTO_Transferencias>> ObtenerLotesProducidosTrasiegoPorIdWO(int IdWO);
        Task<List<DTO_Transferencias>> ObtenerLotesConsumoTrasiegoPorIdWO(int IdWO);
        Task<bool> EliminarMovimientosOrdenesFabricacion(List<int> idMovimientos);
        Task<List<DTO_TiposOrden>> ObtenerTiposWO();
    }
}