using Common.Models.Operation;
using Common.Models.Transportes;
using Common.Models.Trazabilidad.Estado;
using Common.Models.Trazabilidad.Fabricacion;
using Common.Models.Trazabilidad.Genealogia;
using MSM.BBDD.Envasado;
using MSM.BBDD.Trazabilidad.Fabricacion;
using MSM.BBDD.Trazabilidad.Genealogia;
using MSM.Controllers.Planta;
using MSM.Models.Trazabilidad;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Trazabilidad.Genealogia
{


    [Authorize]
    public class GenealogiaController : ApiController
    {
        CultureInfo _culture = new CultureInfo("fr-CA");
        public enum TipoDataGridEnum
        {
            DatosTransporteEntrada = 1,
            DatosTransporteSalida = 2,
            DatosCarga = 3,
            DatosDescarga = 4
        }
        private readonly IDAO_Genealogia _iDAO_Genealogia;
        private readonly IDAO_MovimientosLotes _iDAO_MovimientosLotes;

        public GenealogiaController(IDAO_Genealogia iDAO_Genealogia, IDAO_MovimientosLotes iDAO_MovimientosLotes)
        {
            _iDAO_Genealogia = iDAO_Genealogia;
            _iDAO_MovimientosLotes = iDAO_MovimientosLotes;
        }


        /// <summary>
        /// Metodo que obtiene los lotes
        /// </summary>
        /// <returns></returns>
        [Route("api/GetLotesGenealogia")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<dynamic> GetLotesGenealogia([FromBody] FilterDto filters)
        {
            return await _iDAO_Genealogia.Get(filters);
        }


        [Route("api/GetAnaliticaLote")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<LoteDto>> GetAnaliticaLote(string IdLote)
        {
            List<LoteDto> _list = new List<LoteDto>();
            if (String.IsNullOrEmpty(IdLote)) { }

            return _list;
        }

        [Route("api/GetControlCalidadLote")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<ControlCalidadDto>> GetControlCalidadLote(string IdLote)
        {
            List<ControlCalidadDto> _list = new List<ControlCalidadDto>();
            if (!String.IsNullOrEmpty(IdLote))
            {
                var _result = await _iDAO_Genealogia.GetForms(IdLote);
                if (_result != null) _list = _result;
            }

            return _list;
        }

        [Route("api/GetDatosByType")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<DataGridDto>> GetDatosByType(string IdLote, int tipo)
        {
            List<DataGridDto> _list = new List<DataGridDto>();
            DataGridDto dto = new DataGridDto();
            List<dynamic> _result = new List<dynamic>();
            if (!String.IsNullOrEmpty(IdLote))
            {
                switch (tipo)
                {
                    case (int)TipoDataGridEnum.DatosTransporteEntrada:
                        _result = await _iDAO_Genealogia.GetDataTransporte(IdLote);
                        if (_result.Count() > 0)
                        {
                            foreach (var item in _result[0])
                            {
                                dto = new DataGridDto();
                                if (item.Name != "FECHA_SALIDA")
                                {
                                    dto.Nombre = IdiomaController.GetResourceName(item.Name);
                                    dto.Valor = item.Value;
                                    _list.Add(dto);
                                }
                            }
                        }
                        break;
                    case (int)TipoDataGridEnum.DatosTransporteSalida:
                        _result = await _iDAO_Genealogia.GetDataTransporte(IdLote);
                        if (_result.Count() > 0)
                        {
                            foreach (var item in _result[0])
                            {
                                dto = new DataGridDto();
                                if (item.Name != "FECHA_ENTRADA")
                                {
                                    dto.Nombre = IdiomaController.GetResourceName(item.Name);
                                    dto.Valor = item.Value;
                                    _list.Add(dto);
                                }
                            }
                            if (_list.Count() > 0)
                            {
                                dto = new DataGridDto();
                                dto.Nombre = IdiomaController.GetResourceName("ALBARAN_SALIDA");
                                dto.Valor = IdiomaController.GetResourceName("INFORME"); ;
                                _list.Add(dto);
                            }
                        }
                        break;
                    case (int)TipoDataGridEnum.DatosCarga:
                        _result = await _iDAO_Genealogia.GetDataCarga(IdLote);
                        if (_result.Count() > 0)
                        {
                            foreach (var item in _result[0])
                            {
                                dto = new DataGridDto();
                                dto.Nombre = IdiomaController.GetResourceName(item.Name);
                                dto.Valor = item.Value;
                                _list.Add(dto);
                            }
                        }
                        break;
                    case (int)TipoDataGridEnum.DatosDescarga:
                        _result = await _iDAO_Genealogia.GetDataDescarga(IdLote);
                        if (_result.Count() > 0)
                        {
                            foreach (var item in _result[0])
                            {
                                dto = new DataGridDto();
                                dto.Nombre = IdiomaController.GetResourceName(item.Name);
                                dto.Valor = item.Value;
                                _list.Add(dto);
                            }
                        }
                        break;
                }
            }
            return _list;
        }

        [Route("api/GetDocumentosByLote")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<DocumentoDto>> GetDocumentosByLote(string IdLote, int IdTipoAlbaran)
        {
            List<DocumentoDto> _list = new List<DocumentoDto>();
            //if (!String.IsNullOrEmpty(IdLote)) {
            //    var _result = await _iDAO_Genealogia.GetDocumentosTransportePorLote(IdLote, IdTipoAlbaran);
            //    if (_result != null)
            //        _list = _result != null ? _result : _list;
            //}
            return _list;
        }


        [Route("api/GetProcesos")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<OperationDto>> GetProcesos(string IdLote, bool HaciaProducto, string IdOrdenDestino)
        {
            List<OperationDto> _list = new List<OperationDto>();
            if (!String.IsNullOrEmpty(IdLote))
            {

                var _result = await _iDAO_Genealogia.GetProcesosPorLote(IdLote, HaciaProducto, "0");

                _list = _result;

            }
            return _list;
        }

        [Route("api/GetOperaciones")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<OperationDto>> GetOperaciones(string IdLote)
        {
            List<OperationDto> _list = new List<OperationDto>();
            if (!String.IsNullOrEmpty(IdLote))
            {
                var _result = await _iDAO_Genealogia.GetOperacionesPorLote(IdLote);
                _result.Select(c => { c.TipoOperacion = IdiomaController.GetResourceName(c.TipoOperacion); return c; }).ToList();
                var _transformaciones = await _iDAO_Genealogia.GetTransformacionesPorLote(IdLote);
                if (_transformaciones != null)
                {
                    _transformaciones.Select(c => { c.TipoOperacion = IdiomaController.GetResourceName("TRANSFORMAR_LOTE"); return c; }).ToList();
                    _result.AddRange(_transformaciones);
                }
                if (_result != null)
                    _list = _result != null ? _result : _list;
            }
            return _list;
        }

        [Route("api/GetArbolPadres")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<MMPPDto>> GetArbolPadres(string IdLote)
        {
            if (!String.IsNullOrEmpty(IdLote))
            {
                var _result = await _iDAO_Genealogia.GetArbolPadres(IdLote, null, null);

                if (_result.Count() > 0)
                {
                    return _result.Where(t => !t.IdLote.Equals(IdLote)).ToList();
                }
            }
            return new List<MMPPDto>();
        }

        [Route("api/GetArbolHijos")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<MMPPDto>> GetArbolHijos(string IdLote)
        {
            if (!String.IsNullOrEmpty(IdLote))
            {
                var _result = await _iDAO_Genealogia.GetArbolHijos(IdLote, null, null);

                if (_result.Count() > 0)
                {
                    return _result.Where(t => !t.IdLote.Equals(IdLote)).ToList();
                }
            }
            return new List<MMPPDto>();
        }

        [Route("api/GetPaletsProducidos")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<PaletMMPPDto>> GetPaletsProducidos(string IdLote)
        {
            List<PaletMMPPDto> _list = new List<PaletMMPPDto>();
            if (!String.IsNullOrEmpty(IdLote))
            {
                _list = await _iDAO_Genealogia.GetPaletsPorLote(IdLote, null, null);

            }
            return _list;
        }


        [Route("api/GetOrdenPorLote")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<dynamic> GetOrdenPorLote(string IdLote)
        {
            List<OperationDto> _list = new List<OperationDto>();
            if (!String.IsNullOrEmpty(IdLote))
            {
                return await _iDAO_Genealogia.GetOrdenPorLote(IdLote);
            }
            return _list;
        }

        [Route("api/ObtenerTransferenciasFabricacionPorLote")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_VisualizacionGenealogia)]
        public async Task<List<TransferenciaLoteFabricacionDto>> ObtenerTransferenciasFabricacion([FromUri] string lote)
        {
            if (!string.IsNullOrEmpty(lote))
                return await _iDAO_MovimientosLotes.ObtenerTransferenciasPorLote(lote);

            return new List<TransferenciaLoteFabricacionDto>();
        }

        [Route("api/ObtenerLotePorLoteMES")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_2_VisualizacionTrazabilidadAscendente, Funciones.TRA_PROD_FAB_2_GestionTrazabilidadAscendente,
                      Funciones.CEL_7_GestionLanzarMuestraLIMSLlenadoraCELTerminal)]
        public async Task<List<LoteDto>> ObtenerLotePorLoteMES(string loteMES)
        {
            List<LoteDto> _list = new List<LoteDto>();
            
            _list = await _iDAO_Genealogia.ObtenerLotePorLoteMES(loteMES);
            
            return _list;
        }
    }
}