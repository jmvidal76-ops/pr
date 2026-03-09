using Clients.ApiClient.Contracts;
using Common.Models;
using Common.Models.Almacen;
using Common.Models.Almacen.ControlStock;
using MSM.DTO;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Fabricacion.Api;
using MSM.Mappers.Fabricacion;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.ControlStockFabricacion
{
    public class DAO_ControlStockFabricacion : IDAO_ControlStockFabricacion
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriControlStock;
        private string UriUbicacion;
        private string UriControlStockLoteSemielaborado;
        private string UriControlStockLoteSemielaboradoConsumido;
        private string UriControlStockConsumidos;
        private string uriAvisosStockMMPPFabricacion;

        private IApiClient _apiTrazabilidad;

        public DAO_ControlStockFabricacion(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriControlStock = UriBase + "api/controlStockFabricacion";
            UriUbicacion = UriBase + "api/ubicacion";
            UriControlStockLoteSemielaborado = UriBase + "api/controlStockSemielaborado";
            UriControlStockLoteSemielaboradoConsumido = UriBase + "api/controlStockSemielaboradoConsumido";
            UriControlStockConsumidos = UriBase + "api/controlStockFabricacionConsumidos";
            uriAvisosStockMMPPFabricacion = UriBase + "api/avisosStockMMPPFabricacion";
        }

        public async Task<List<DTO_Stock>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DTO_Stock>>(UriControlStock);
            return ret;
        }

        public async Task<List<DTO_LoteSemielaborado>> GetLoteSemielaborado()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<dynamic>(UriControlStockLoteSemielaborado);
            return Mapper_LoteSemielaborado.MapperDynamicObjectToDTO(ret);
        }

        public async Task<DTO_LoteSemielaborado> ActualizarLoteSemielaborado(DTO_LoteSemielaborado lote)
        {
            return await _apiTrazabilidad.PutPostsAsync<DTO_LoteSemielaborado>(UriControlStockLoteSemielaborado, lote);
        }

        public async Task<DTO_LoteSemielaborado> AgregarLoteSemielaborado(DTO_LoteSemielaborado lote)
        {
            return await _apiTrazabilidad.PostPostsAsync<DTO_LoteSemielaborado>(lote, UriControlStockLoteSemielaborado);
        }

        public async Task<int> EliminarLoteSemielaborado(int idLote)
        {
            return await _apiTrazabilidad.DeletePostsAsync<int>(string.Concat(UriControlStockLoteSemielaborado, "/", idLote));
        }

        public async Task<int> EliminarLoteSemielaboradoConsumido(int idLote)
        {
            return await _apiTrazabilidad.DeletePostsAsync<int>(string.Concat(UriControlStockLoteSemielaboradoConsumido, "/", idLote));
        }

        public async Task<int> EliminarLoteMMPPConsumido(int idLote)
        {
            return await _apiTrazabilidad.DeletePostsAsync<int>(string.Concat(UriControlStockConsumidos, "/", idLote));
        }

        public async Task<DTO_LoteSemielaborado> ActualizarLoteSemielaboradoConsumido(DTO_LoteSemielaborado lote)
        {
            return await _apiTrazabilidad.PutPostsAsync<DTO_LoteSemielaborado>(UriControlStockLoteSemielaboradoConsumido, lote);
        }

        public async Task<List<DTO_LoteSemielaborado>> GetLoteSemielaboradoConsumido(DTO_Stock _filters)
        {
            string _filtersString = "FECHA_INICIO_CONSUMO=" + _filters.FECHA_INICIO_CONSUMO.Value.ToString("yyyy-MM-ddTHH:mm:ss") + "&FECHA_FIN_CONSUMO=" + 
                _filters.FECHA_FIN_CONSUMO.Value.ToString("yyyy-MM-ddTHH:mm:ss");
            var ret = await _apiTrazabilidad.GetPostsAsync<dynamic>(UriControlStockLoteSemielaboradoConsumido + "?" + _filtersString);
            return Mapper_LoteSemielaborado.MapperDynamicObjectToDTO(ret);
        }

        public async Task<List<DTO_Stock>> GetConsumidos(DTO_Stock _filters)
        {
            string _filtersString = "FECHA_INICIO_CONSUMO=" + _filters.FECHA_INICIO_CONSUMO.Value.ToString("yyyy-MM-ddTHH:mm:ss") + "&FECHA_FIN_CONSUMO=" +
                _filters.FECHA_FIN_CONSUMO.Value.ToString("yyyy-MM-ddTHH:mm:ss");
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DTO_Stock>>(UriControlStockConsumidos + "?" + _filtersString);
            return ret;
        }

        public async Task<List<DTO_Stock>> GetConsumidosAgrupado(DTO_Stock _filters)
        {
            string _filtersString = GetUriFilters(_filters);
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DTO_Stock>>(UriControlStockConsumidos + "Agrupados" + "?" + _filtersString);
            return ret;
        }

        private string GetUriFilters(DTO_Stock _filters)
        {
            string _fechaInicioConsumo = _filters.FECHA_INICIO_CONSUMO != null ? _filters.FECHA_INICIO_CONSUMO.Value.ToString("yyyy-MM-dd") : null;
            string _fechaFinConsumo = _filters.FECHA_FIN_CONSUMO != null ? _filters.FECHA_FIN_CONSUMO.Value.ToString("yyyy-MM-dd") : null;

            return "ID_TIPO_MATERIAL=" + _filters.ID_TIPO_MATERIAL + "&ID_CLASE_MATERIAL=" + _filters.ID_CLASE_MATERIAL +
                    "&ID_MATERIAL=" + _filters.ID_MATERIAL + "&ID_ALMACEN=" + _filters.ID_ALMACEN + "&ID_ZONA=" + _filters.ID_ZONA +
                    "&ID_UBICACION=" + _filters.ID_UBICACION + "&LOTE_MES=" + _filters.LOTE_MES + "&LOTE_CONSUMIDO=" + _filters.LOTE_CONSUMIDO +
                    "&PRIORIDAD=" + _filters.PRIORIDAD + "&FECHA_INICIO_CONSUMO=" + _fechaInicioConsumo + "&FECHA_FIN_CONSUMO=" + _fechaFinConsumo +
                    "&FECHA_INICIO_CADUCIDAD=" + null + "&FECHA_FIN_CADUCIDAD=" + null + "&CODIGO_JDE=" + _filters.CODIGO_JDE +
                    "&LOTE_PROVEEDOR=" + _filters.LOTE_PROVEEDOR + "&ID_PROVEEDOR=" + _filters.ID_PROVEEDOR;

            //return "FECHA_INICIO_CONSUMO=" + _fechaInicioConsumo + "&FECHA_FIN_CONSUMO=" + _fechaFinConsumo;
        }

        public async Task<UbicacionDto> PutState(string idLote, string idEstado)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<UbicacionDto>(UriUbicacion + "/updateStatusLocation/" + idLote + "/" + idEstado);
            return ret;
        }

        public async Task<DTO_Stock> ActualizarLotesFabricacionConsumidos(DTO_Stock lote)
        {
            try
            {
                return await _apiTrazabilidad.PutPostsAsync<DTO_Stock>(UriControlStockConsumidos, lote);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<AvisoStockMMPPFabricacionDto>> ObtenerAvisosStockMMPPFabricacion()
        {
            var result = await _apiTrazabilidad.GetPostsAsync<List<AvisoStockMMPPFabricacionDto>>(uriAvisosStockMMPPFabricacion);
            return result;
        }

        public async Task<AvisoStockMMPPFabricacionDto> AgregarAvisoStockMMPPFabricacion(AvisoStockMMPPFabricacionDto aviso)
        {
            var result = await _apiTrazabilidad.PostPostsAsync<AvisoStockMMPPFabricacionDto>(aviso, uriAvisosStockMMPPFabricacion);
            return result;
        }

        public async Task<AvisoStockMMPPFabricacionDto> ModificarAvisoStockMMPPFabricacion(AvisoStockMMPPFabricacionDto aviso)
        {
            var result = await _apiTrazabilidad.PutPostsAsync<AvisoStockMMPPFabricacionDto>(uriAvisosStockMMPPFabricacion, aviso);
            return result;
        }

        public async Task<int> EliminarAvisoStockMMPPFabricacion(int idAviso)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(uriAvisosStockMMPPFabricacion + "/" + idAviso);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarArchivosAdjuntosStockFabricacion(DTO_FicherosAdjuntosLote datos)
        {
            if (datos is null)
            {
                throw new ArgumentNullException(nameof(datos));
            }

            return await _apiTrazabilidad.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(UriControlStock + "/ArchivosAdjuntos", datos);
        }
    }
}