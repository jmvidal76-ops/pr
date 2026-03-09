using Common.Models;
using Common.Models.Operation;
using Common.Models.Transportes;
using Common.Models.Trazabilidad.Estado;
using Common.Models.Trazabilidad.Genealogia;
using MSM.DTO;
using MSM.Mappers.DTO.Fabricacion.Api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Genealogia
{
    public interface IDAO_Genealogia
    {
        Task<dynamic> Get(FilterDto filters);

        Task<List<ControlCalidadDto>> GetForms(string IdLote);

        Task<List<dynamic>> GetDataTransporte(string IdLote);

        Task<List<dynamic>> GetDataDescarga(string IdLote);

        Task<List<dynamic>> GetDataCarga(string IdLote);

        Task<List<DocumentoDto>> GetDocumentosTransportePorLote(string IdLote, int IdTipoAlbaran);

        Task<List<OperationDto>> GetOperacionesPorLote(string IdLote);

        Task<List<OperationDto>> GetTransformacionesPorLote(string IdLote);

        Task<List<OperationDto>> GetProcesosPorLote(string IdLote, bool HaciaProducto, string IdOrdenDestino);

        Task<List<OperationDto>> GetProcesosPaletsPorLote(string IdLote, bool HaciaProducto, string IdOrdenDestino);

        Task<List<LoteDto>> GetHijosPorLote(string IdLote);

        Task<List<MMPPDto>> GetArbolPadres(string IdLote, string fechaInicio, string fechaFin);
        Task<List<MMPPDto>> GetArbolHijos(string IdLote, string fechaInicio, string fechaFin);

        Task<List<PaletMMPPDto>> GetPaletsPorLote(string IdLote, string fechaInicio, string fechaFin);

        Task<List<OperationDto>> GetPadresPaletsPorLote(string IdLote);

        Task<dynamic> GetOrdenPorLote(string IdLote);

        Task<List<LoteDto>> ObtenerTrazabilidadDescendente(FilterDto filtro);

        Task<int> EliminarMovimiento(int idMovimiento);

        Task<List<LoteDto>> ObtenerTrazabilidadAscendente(FilterDto filtro);
        Task<List<LoteDto>> ObtenerTrazabilidadCruzada(FilterDto filtro);

        Task<dynamic> ObtenerMovimientosHaciaLotes(List<int> IdLote);

        Task<dynamic> ObtenerMovimientosHaciaLotesTotales(List<int> IdLote);

        Task<List<LoteDto>> ObtenerLotePorLoteMES(string loteMES);
    }
}
