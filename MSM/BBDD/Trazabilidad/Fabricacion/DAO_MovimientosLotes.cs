using Clients.ApiClient.Contracts;
using Common.Models;
using Common.Models.Trazabilidad;
using Common.Models.Trazabilidad.Estado;
using Common.Models.Trazabilidad.Fabricacion;
using MSM.BBDD.Trazabilidad.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Fabricaicon
{
    public class DAO_MovimientosLotes : IDAO_MovimientosLotes
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriLotes;
        private string UriFabricacion;
        private string UriTransferenciasLotes;
        private string UriLoteMMPPFabricacion;
        private string UriLoteSemielaborado;
        private string UriLoteSemielaboradoControlStock;
        private string UriTransferenciaPorLote;
        private string UriTipoLote;
        private string UriAgregarTransferenciaTCP;

        private IApiClient _apiTrazabilidad;

        public DAO_MovimientosLotes(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriLotes = UriBase + "api/lote/";
            UriFabricacion = UriBase + "api/fabricacion";
            UriTransferenciasLotes = UriBase + "api/TransferenciasLotesFabricacion";
            UriTransferenciaPorLote = UriBase + "api/TransferenciasFabricacionPorLote";
            UriLoteMMPPFabricacion = UriBase + "api/lote/materiaPrimaFabricacion";
            UriLoteSemielaborado = UriBase + "api/lote/semielaborado";
            UriLoteSemielaboradoControlStock = UriBase + "api/controlStockSemielaborado";
            UriTipoLote = UriBase + "api/lote/obtenerMaestroTipoLoteManualSemielaborados";
            UriAgregarTransferenciaTCP = UriBase + "api/lote/transferenciaTCP/agregar";
        }

        public async Task<dynamic> ObtenerMovimientosLotes(dynamic fechas)
        {
            try
            {
                var ret = await _apiTrazabilidad.PostAsJsonAsync<dynamic>(fechas, UriFabricacion+ "/ObtenerMovimientosLotesFabricacion");
                return ret;
            }
            catch(Exception ex)
            {
                return new List<MovimientoLoteDto>();
            }
        }

        public async Task<MovimientoLoteDto> AgregarMovimientosLotes(MovimientoLoteDto movimientoDto)
        {
            try
            {
                var ret = await _apiTrazabilidad.PostPostsAsync<MovimientoLoteDto>(movimientoDto, UriFabricacion + "/AgregarMovimientoLoteFabricacion");
                return ret;
            }
            catch (Exception ex)
            {
                return new MovimientoLoteDto();
            }
        }

        public async Task<MovimientoLoteDto> EditarMovimientosLotes(MovimientoLoteDto movimientoDto)
        {
            try
            {
                var ret = await _apiTrazabilidad.PostPostsAsync<MovimientoLoteDto>(movimientoDto, UriFabricacion + "/EditarMovimientoLote");
                return ret;
            }
            catch (Exception ex)
            {
                return new MovimientoLoteDto();
            }
        }

        public async Task<List<TransferenciaLoteFabricacionDto>> ObtenerTransferenciasLotes(int id)
        {
            try
            {
                var ret = await _apiTrazabilidad.GetPostsAsync<List<TransferenciaLoteFabricacionDto>>(string.Concat(UriTransferenciasLotes,"/",id));
                return ret;
            }
            catch (Exception ex)
            {
                return new List<TransferenciaLoteFabricacionDto>();
            }
        }

        public async Task<TransferenciaLoteFabricacionDto> AgregarTransferenciaLotes(TransferenciaLoteFabricacionDto transferencia)
        {
            try
            {
                var ret = await _apiTrazabilidad.PostPostsAsync<TransferenciaLoteFabricacionDto>(transferencia,UriTransferenciasLotes);
                return ret;
            }
            catch (Exception ex)
            {
                return new TransferenciaLoteFabricacionDto();
            }
        }
        
        public async Task<List<TransferenciaTCPDto>> AgregarTransferenciaTCP(TransferenciaTCPDto transferencia)
        {
            try
            {
                var ret = await _apiTrazabilidad.PostAsJsonAsync(transferencia, UriAgregarTransferenciaTCP);
                return ret;
            }
            catch (Exception ex)
            {
                return new List<TransferenciaTCPDto>();
            }
        }

        public async Task<DTO_LoteMMPPFabricacion> ObtenerLoteMMPPFabricacion(int id)
        {
            try
            {
                var ret = await _apiTrazabilidad.GetPostsAsync<DTO_LoteMMPPFabricacion>(string.Concat(UriLoteMMPPFabricacion, "/", id));
                return ret;
            }
            catch (Exception ex)
            {
                return new DTO_LoteMMPPFabricacion();
            }
        }

        public async Task<DTO_LoteSemielaborado> ObtenerLoteSemielaborado(int id)
        {
            try
            {
                var ret = await _apiTrazabilidad.GetPostsAsync<DTO_LoteSemielaborado>(string.Concat(UriLoteSemielaborado, "/", id));
                return ret;
            }
            catch (Exception ex)
            {
                return new DTO_LoteSemielaborado();
            }
        }

        public async Task<List<TransferenciaLoteFabricacionDto>> ObtenerTransferenciasPorLote(string lote)
        {
            try
            {
                var ret = await _apiTrazabilidad.GetPostsAsync<List<TransferenciaLoteFabricacionDto>>(string.Concat(UriTransferenciaPorLote, "/", lote));
                return ret;
            }
            catch (Exception ex)
            {
                return new List<TransferenciaLoteFabricacionDto>();
            }
        }

        public async Task<DTO_LoteMMPPFabricacion> AgregarLoteMMPPFabricacion(DTO_LoteMMPPFabricacion entity)
        {
            try
            {
                var ret = await _apiTrazabilidad.PostPostsAsync(entity, string.Concat(UriLoteMMPPFabricacion, "/agregar"));
                return ret;
            }
            catch (Exception ex)
            {
                return new DTO_LoteMMPPFabricacion();
            }
        }
        
        public async Task<DTO_LoteSemielaborado> AgregarLoteSemielaborado(DTO_LoteSemielaborado entity)
        {
            try
            {
                var ret = await _apiTrazabilidad.PostPostsAsync(entity, string.Concat(UriLoteSemielaboradoControlStock));
                return ret;
            }
            catch (Exception ex)
            {
                return new DTO_LoteSemielaborado();
            }
        }

        public async Task<List<MaestroTipoLoteManualSemielaboradosDto>> ObtenerMaestroTipoLoteManualSemielaborados(string idTipoMaterial)
        {
            try
            {
                var ret = await _apiTrazabilidad.GetPostsAsync<List<MaestroTipoLoteManualSemielaboradosDto>>(string.Concat(UriTipoLote, "/", idTipoMaterial));
                return ret;
            }
            catch (Exception ex)
            {
                return new List<MaestroTipoLoteManualSemielaboradosDto>();
            }
        }

        public async Task<MovimientoLoteDto> AgregarMovimientoLoteFabricacion(MovimientoLoteDto movimientoDto)
        {
            try
            {
                var ret = await _apiTrazabilidad.PostPostsAsync<MovimientoLoteDto>(movimientoDto, UriFabricacion + "/AgregarMovimientoLoteFabricacion");
                return ret;
            }
            catch (Exception ex)
            {
                return new MovimientoLoteDto();
            }
        }

        public async Task<bool> ActualizarCantidadMovimientos(MovimientoLoteCantidadDto movimiento)
        {
            try{
                var ret = await _apiTrazabilidad.PostPostsAsync<MovimientoLoteCantidadDto>(movimiento, UriFabricacion + "/ActualizarCantidadMovimiento");
                return ret != null;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<string> ActualizarLoteMMPPFabricacion(DTO_LoteMMPPFabricacion lote)
        {
            var ret = await _apiTrazabilidad.PutPostsAsymmetricAsync<string>(UriLotes + "/ActualizarLoteFabricacion", lote);
            return ret;
        }

        public async Task<string> ActualizarLoteSemielaborado(DTO_LoteSemielaborado lote)
        {
            var ret = await _apiTrazabilidad.PutPostsAsymmetricAsync<string>(UriLotes + "/ActualizarLoteSemiElaboradoUniversal", lote);
            return ret;
        }
    }
}