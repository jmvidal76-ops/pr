using Clients.ApiClient.Contracts;
using Common.Models;
using Common.Models.Almacen;
using Common.Models.Lote;
using Common.Models.Trazabilidad.Genealogia;
using Common.Models.Operation;
using MSM.DTO;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;
using MSM.Utilidades;
using MSM.Models.Fabricacion.Tipos;
using MSM.BBDD.Trazabilidad;
using Autofac;

namespace MSM.BBDD.Almacen.ControlStock
{
    public class DAO_ControlStock : IDAO_ControlStock
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriControlStock ;
        private string UriUbicacion;
        private string UriLote;
        private string UriLoteMateriaPrima;
        private string UriAlbaran;
        private static readonly IDAO_Ubicacion _daoUbicacion = AutofacContainerConfig.Container.Resolve<IDAO_Ubicacion>();

        private IApiClient _apiTrazabilidad;

        public DAO_ControlStock(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriControlStock = UriBase + "api/controlStock";
            UriUbicacion = UriBase + "api/ubicacion";
            UriLote = UriBase + "api/lote";
            UriLoteMateriaPrima = UriLote + "/materiaPrima";
            UriAlbaran = UriLote + "/albaran";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<List<DTO_Stock>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DTO_Stock>>(UriControlStock);
            return ret;

        }

        public async Task<List<DTO_Stock>> GetConsumidos(DTO_Stock _filters)
        {
            string _filtersString = "FECHA_INICIO_CONSUMO=" + _filters.FECHA_INICIO_CONSUMO.Value.ToString("yyyy-MM-ddTHH:mm:ss") + "&FECHA_FIN_CONSUMO=" +
                _filters.FECHA_FIN_CONSUMO.Value.ToString("yyyy-MM-ddTHH:mm:ss");
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DTO_Stock>>(UriControlStock + "Consumidos" + "?" + _filtersString);
            return ret;
        }

        public async Task<List<DTO_Stock>> GetConsumidosAgrupado(DTO_Stock _filters)
        {
            string _filtersString = GetUriFilters(_filters);
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DTO_Stock>>(UriControlStock + "ConsumidosAgrupados" + "?" + _filtersString);
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

        public async Task<List<LoteDto>> ObtenerLotesPorIdUbicacion(int idUbicacion, DateTime fechaInicio, DateTime fechaFin, bool soloLotesNoConsumidos = false)
        {
            //var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteDto>>($"{UriLote}/obtenerLotesPorIdUbicacion/{idUbicacion}/{fechaInicio.ToUniversalTime():u}/{fechaFin.ToUniversalTime():u}/{soloLotesNoConsumidos}");

            var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteDto>>(string.Concat(UriLote, "/obtenerLotesPorIdUbicacion?idUbicacion=", idUbicacion,
                "&fechaInicio=", fechaInicio.ToUniversalTime().ToString("u"), "&fechaFin=", fechaFin.ToUniversalTime().ToString("u"), "&soloLotesNoConsumidos=", soloLotesNoConsumidos));

            return ret;
        }

        public async Task<List<DTO_LoteMMPP>> ObtenerLotesMateriaPrimaPorIdUbicacion(int idUbicacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DTO_LoteMMPP>>($"{UriLote}/obtenerLotesMateriaPrimaPorIdUbicacion/{idUbicacion}");
            return ret;
        }

        public async Task<bool> ActualizarLoteMateriaPrimaEnvasado(DTO_LoteMMPP LoteMMPP)
        {
            var ret = await _apiTrazabilidad.PutPostsAsymmetricAsync<bool>($"{UriLote}/ActualizarLoteMateriaPrima", LoteMMPP);
            return ret;
        }

        public async Task<bool> AjustarCantidadLote(OperationDto datos)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<dynamic>(datos, UriLoteMateriaPrima + "/AjustarCantidadLote");

            if (ret != null && ret.ResultadoError == null)
            {
                return true; 
            }

            return false; // Hubo un error
        }

        public async Task<DTO_LoteMateriaPrima> ObtenerLoteMateriaPrima(string idLote)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<DTO_LoteMateriaPrima>($"{UriLote}/ObtenerLoteMateriaPrima/{idLote}");
            return ret;
        }

        public async Task<bool> CrearLoteMateriaPrima(DTO_LoteMateriaPrima Lote)
        {
            var ret = await _apiTrazabilidad.PostPostsAsymmetricAsync<bool>(Lote, $"{UriLote}/InsertLoteMateriaPrima");
            return ret;
        }
        
        public async Task<List<PropiedadLoteDto>> ObtenerPropiedadesLote(int IdLote, int IdTipo)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<PropiedadLoteDto>>(UriLote + "/obtenerPropiedadesLote/" + IdLote+"/"+ IdTipo);
            return ret;
        }

        public async Task<PropiedadLoteDto> ActualizarPropiedadesLote(PropiedadLoteDto propiedades)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<PropiedadLoteDto>(UriLote + "/actualizarPropiedadesLote", propiedades);
            return ret;
        }

        public async Task<List<LoteDto>> ObtenerLotesAsociadosAlbaran(int idAlbaran)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteDto>>(UriAlbaran+"/" + idAlbaran);
            return ret;
        }

        public async Task DesasociarLoteAlbaran(LoteDto lote)
        {
            await _apiTrazabilidad.PostAsJsonAsync(lote, UriAlbaran + "/desasociar");
        }

        public async Task<LoteDto> AgregarLoteAlbaran(LoteDto lote)
        {
           return await _apiTrazabilidad.PostPostsAsync(lote, UriAlbaran + "/agregar");
        }

        public async Task<LoteDto> ActualizarLoteAlbaran(LoteDto lote)
        {
            return await _apiTrazabilidad.PutPostsAsync(UriAlbaran + "/actualizar",lote);
        }

        //public async Task<string> GetEstadoLIMs(string id)
        //{
        //    return await _apiTrazabilidad.GetPostsAsync<string>(UriBase + "api/EstadoLIMs/" + id);
        //}

        public async Task<bool> GetEstadoFicherosAdjuntos(int id, int tipoLote)
        {
            return await _apiTrazabilidad.GetPostsAsync<bool>(UriBase + "api/EstadoFicherosAdjuntos/" + id + "?tipoLote=" + tipoLote.ToString());
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarFicherosAdjuntosLote(DTO_FicherosAdjuntosLote datos)
        {
            return await _apiTrazabilidad.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(UriBase + "api/ControlStock/FicherosAdjuntos", datos);
        }

        public async Task<DTO_RespuestaAPI<DTO_FicherosAdjuntosLote>> ObtenerFicherosAdjuntosLote(DTO_FicherosAdjuntosLote datos)
        {
            return await _apiTrazabilidad.GetPostsAsync<DTO_RespuestaAPI<DTO_FicherosAdjuntosLote>>(UriBase + "api/ControlStock/FicherosAdjuntos?idLote=" + datos.IdLote.ToString() + "&tipoLote=" + datos.TipoLote.ToString());
        }

        public async Task<DTO_RespuestaAPI<bool>> EditarNotasLote(int idLote, string notas, int tipoLote)
        {
            return await _apiTrazabilidad.PutPostsAsync<DTO_RespuestaAPI<bool>>(UriBase + "api/ControlStock/NotasLote?idLote=" + idLote.ToString() + (String.IsNullOrEmpty(notas) ? "" : "&notas=" + notas)  + "&tipoLote=" + tipoLote.ToString(), null);
        }

        public async Task<string> ObtenerTCPOrigen(string ubicacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<string>(UriControlStock + "/TCPOrigen?ubicacion=" + ubicacion);
            return ret;
        }

        public async Task<bool> CrearLoteCervezaLlenadora(dynamic datos)
        {
            string centro = ConfigurationManager.AppSettings["PlantaID"].ToString().Split(new char[] { '.' })[1].Substring(0, 3);
            string idClase = datos.tipoCerveza;
            string idMaterial = datos.codigoCerveza;
            string ubicacion = datos.ubicacion;
            DateTime fechaInicioConsumo = Convert.ToDateTime(datos.fechaInicioConsumo);

            string loteMES = Utils.CrearLoteMES(centro, TipoMaterial.Semielaborados.GetStringValue(), idClase, idMaterial, 
                ProcesoLoteEnum.ENV.ToString(), ubicacion, fechaInicioConsumo.ToString("yyyyMMddTHHmmss"), string.Empty);
            
            UbicacionDto ubicacionDto = await _daoUbicacion.GetUbicacionPorNombre(ubicacion);

            DTO_LoteMateriaPrima lote = new DTO_LoteMateriaPrima();
            lote.IdLoteMES = loteMES;
            lote.IdProceso = (int)ProcesoLoteEnum.ENV;
            lote.IdMaterial = idMaterial;
            lote.IdUbicacion = ubicacionDto.IdUbicacion;
            lote.CantidadInicial = 1;
            lote.CantidadActual = 1;
            lote.FechaEntradaPlanta = fechaInicioConsumo;
            lote.FechaEntradaUbicacion = fechaInicioConsumo;
            lote.FechaInicioConsumo = fechaInicioConsumo;
            lote.IdEstadoLIMS = 1;
            lote.CreadoPor = "Manual desde el Portal";

            var ret = await _apiTrazabilidad.PostPostsAsymmetricAsync<bool>(lote, $"{UriLote}/InsertLoteMateriaPrima");
            return ret;
        }
    }
}