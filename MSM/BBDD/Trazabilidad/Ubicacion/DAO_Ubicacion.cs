using Clients.ApiClient.Contracts;
using Common.Models;
using Common.Models.Material;
using Common.Models.Ubicacion;
using Common.Models.Ubicaciones;
using MSM.Mappers.DTO;
using MSM.Models.Trazabilidad;
using MSM.Utilidades;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad
{
    public class DAO_Ubicacion : IDAO_Ubicacion
    {
        private IApiClient _apiTrazabilidad;

        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriUbicacion;
        private string UriUbiResumenEstadoOrdenes;
        private string UriRecepcion;
        private string UriTipoUbicacion;
        private string UriEstadoUbicacion;
        private string UriPoliticaAlmacenamiento;
        private string UriPoliticaLlenado;
        private string UriPoliticaVaciado;
        private string UriAlmacen;
        private string UriZona;
        private string UriZonaDesdeAlmacen;
        private string UriUbicacionDesdeZona;
        private string UriUbicacionPorIdLinea;
        private string UriUbicacionPorLinea;
        private string UriUbicacionDesdeZonaAlmacen;
        private string UriMateriales;
        private string UriTiposMaterial;
        private string UriClasesMaterial;
        private string UriComprobarDelete;
        private string UriTipoZona;
        private string UriTipoAlmacen;
        private string UriUnidadAlmacenamiento;
        private string UriEquipo;
        private string UriEquipoMES;
        private string UriUbicacionesLogicas;
        private string UriBarcode;
        private string UriUbicacionDescarga;
        private string UriUbicacionesByTipoZonaAndTipoUbicacion;
        private string UriUbicacionTipoOperacion;

        public DAO_Ubicacion(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriUbicacion = UriBase + "api/ubicacion";
            UriUbicacionesLogicas = UriBase + "api/ubicacionLogica";
            UriUbiResumenEstadoOrdenes = UriBase + "api/ubicacion/resumenestadoordenes/";
            UriRecepcion = UriUbicacion + "/recepcion";
            UriTipoUbicacion = UriBase + "api/tipoubicacion";
            UriEstadoUbicacion = UriBase + "api/estadoUbicacion";
            UriPoliticaAlmacenamiento = UriBase + "api/politicaAlmacenamiento";
            UriPoliticaLlenado = UriBase + "api/politicaLlenado";
            UriPoliticaVaciado = UriBase + "api/politicaVaciado";
            UriAlmacen = UriBase + "api/almacen";
            UriZona = UriBase + "api/zona/";
            UriZonaDesdeAlmacen = UriBase + "api/zonaDesdeAlmacen/";
            UriUbicacionDesdeZona = UriUbicacion + "/ubicacionZona/";
            UriUbicacionPorIdLinea = UriUbicacion + "/ubicacion/UbicacionesPorIdLinea";
            UriUbicacionPorLinea = UriUbicacion + "/UbicacionesLinea/";
            UriUbicacionDesdeZonaAlmacen = UriUbicacion + "/ubicacionZonaAlmacen/";
            UriMateriales = UriBase + "api/material";
            UriTiposMaterial = UriBase + "api/tipoMaterial";
            UriClasesMaterial = UriBase + "api/claseMaterial";
            UriComprobarDelete = UriUbicacion + "/puedeSerBorrado";
            UriTipoZona = UriBase + "api/tipoZona";
            UriTipoAlmacen = UriBase + "api/tipoAlmacen";
            UriUnidadAlmacenamiento = UriBase + "api/udMedidaUbicacion";
            UriEquipo = UriBase + "api/equipos";
            UriEquipoMES = UriBase + "api/equiposMES";
            UriBarcode = UriBase + "api/barcode/";
            UriUbicacionDescarga = UriUbicacion + "/ubicacionesDescarga";
            UriUbicacionTipoOperacion = UriUbicacion + "/UbicacionesOperacion";

            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();

        }

        public async Task<List<UbicacionDto>> ObtenerUbicaciones()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(UriUbicacion + "/GetAll");
            return ret;
        }

        public async Task<List<UbicacionPuntosVerificacionDto>> GetUbicacionesPuntosVerificacion()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionPuntosVerificacionDto>>(UriUbicacion + "/GetUbicacionesPuntosVerificacion");
            return ret;
        }

        public async Task<List<UbicacionConResumenOrdenesDto>> ObtenerUbicacionConResumenOrdenes(int IdUbicacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionConResumenOrdenesDto>>(UriUbiResumenEstadoOrdenes + "/" + IdUbicacion.ToString());
            return ret;
        }

        public async Task<List<AlmacenDto>> ObtenerAlmacenes()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<AlmacenDto>>(UriAlmacen);
            return ret;
        }

        public async Task<List<ZonaDto>> ObtenerZonasDesdeAlmacen(int IdAlmacen)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ZonaDto>>(UriZonaDesdeAlmacen + IdAlmacen);

            return ret;
        }

        public async Task<List<UbicacionDto>> ObtenerUbicacionesDesdezona(int IdZona)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(UriUbicacionDesdeZona + IdZona);

            return ret;
        }
        public async Task<List<UbicacionDto>> ObtenerUbicacionesPorIdLinea(UbicacionDto ubicacion)
        {
            var ret = await _apiTrazabilidad.PostAsJsonAsync(ubicacion, UriUbicacionPorIdLinea);

            return ret;
        }

        public async Task<List<UbicacionDto>> ObtenerUbicacionesPorLinea(int linea)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(UriUbicacionPorLinea + linea);

            return ret;
        }

        public async Task<List<UbicacionDto>> ObtenerUbicacionesDesdeZonaAlmacen(int IdAlmacen, int IdZona)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(UriUbicacionDesdeZonaAlmacen + IdAlmacen + "/" + IdZona);

            return ret;
        }

        public async Task<List<UbicacionDto>> ObtenerUbicacionesCrearLote(int IdAlmacen, int IdZona)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(UriUbicacionDesdeZonaAlmacen + IdAlmacen + "/" + IdZona);
            ret.RemoveAll(x => x.IdTipoUbicacion == (int)Constants.TipoUbicacionEnum.Preparacion ||
                               x.IdTipoUbicacion == (int)Constants.TipoUbicacionEnum.ProduccionConsumo ||
                               x.IdTipoUbicacion == (int)Constants.TipoUbicacionEnum.Produccion);
            return ret;
        }

        public async Task<List<UbicacionDto>> ObtenerUbicacionesRecepcion()
        {

            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(UriRecepcion);
            return ret;
        }

        public async Task<List<TipoUbicacionDto>> ObtenerTiposUbicacion()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TipoUbicacionDto>>(UriTipoUbicacion);
            return ret;
        }

        public async Task<List<EstadoUbicacionDto>> ObtenerEstadosUbicacion()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<EstadoUbicacionDto>>(UriEstadoUbicacion);
            return ret;
        }

        public async Task<List<PoliticaAlmacenamientoDto>> ObtenerPoliticasAlmacenamiento()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<PoliticaAlmacenamientoDto>>(UriPoliticaAlmacenamiento);
            return ret;
        }

        public async Task<List<PoliticaLlenadoDto>> ObtenerPoliticasLlenado()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<PoliticaLlenadoDto>>(UriPoliticaLlenado);
            return ret;
        }

        public async Task<List<PoliticaVaciadoDto>> ObtenerPoliticasVaciado()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<PoliticaVaciadoDto>>(UriPoliticaVaciado);
            return ret;
        }

        public async Task<List<MaterialDto>> ObtenerMaterialesUbicacion()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MaterialDto>>(UriMateriales);
            return ret;
        }

        public async Task<List<TipoMaterialDto>> ObtenerTiposMaterial()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TipoMaterialDto>>(UriTiposMaterial);
            return ret;
        }

        public async Task<List<ClaseMaterialDto>> ObtenerClasesMaterialUbicacion()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ClaseMaterialDto>>(UriClasesMaterial);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<object>> crearUbicacion(UbicacionDto datos)
        {
            try
            {
                //UbicacionDto ret = await _apiTrazabilidad.PostPostsAsync(datos, UriUbicacion);
                var ret = await _apiTrazabilidad.PostPostsAsymmetricAsync<DTO_RespuestaAPI<object>>(datos, UriUbicacion);
                return ret;
            }
            catch (Exception ex)
            {
                return null;
            }
        }


        public async Task<DetalleAlmacen> editarUbicacion(DetalleAlmacen dto)
        {
            try
            {
                UbicacionDto ubicacion = await _apiTrazabilidad.GetPostsAsync<UbicacionDto>(UriUbicacion + "/" + dto.idSup);


                switch (dto.idProp)
                {
                    //case "DescripcionZona":
                    //    ubicacion.DescripcionZona = dto.valor;
                    //    ubicacion.IdZona = int.Parse(dto.aux.ToString());
                    //    break;
                    case "DescripcionTipoUbicacion":
                        ubicacion.DescripcionTipoUbicacion = dto.valor;
                        ubicacion.IdTipoUbicacion = int.Parse(dto.aux.ToString());
                        break;
                    case "DescripcionPoliticaAlmacenamiento":
                        ubicacion.DescripcionPoliticaAlmacenamiento = dto.valor;
                        ubicacion.IdPoliticaAlmacenamiento = dto.aux != null ? (int?)int.Parse(dto.aux.ToString()) : null;
                        break;
                    case "DescripcionPoliticaVaciado":
                        ubicacion.DescripcionPoliticaVaciado = dto.valor;
                        ubicacion.IdPoliticaVaciado = dto.aux != null ? (int?)int.Parse(dto.aux.ToString()) : null;
                        break;
                    case "DescripcionPoliticaLlenado":
                        ubicacion.DescripcionPoliticaLlenado = dto.valor;
                        ubicacion.IdPoliticaLlenado = dto.aux != null ? (int?)int.Parse(dto.aux.ToString()) : null;
                        break;
                    case "DescripcionClaseMaterial":
                        ubicacion.IdClaseMaterial = dto.aux;
                        ubicacion.DescripcionClaseMaterial = dto.valor;
                        break;
                    case "DescripcionMaterial":
                        ubicacion.RefMaterial = dto.aux;
                        ubicacion.DescripcionMaterial = dto.valor;
                        break;
                    case "DescripcionTipoMaterial":
                        ubicacion.IdTipoMaterial = dto.aux;
                        ubicacion.DescripcionTipoMaterial = dto.valor;
                        break;
                    case "DescripcionUnidadAlmacenamiento":
                        ubicacion.DescripcionUnidadAlmacenamiento = dto.valor;
                        break;
                    case "DescripcionEstado":
                        ubicacion.DescripcionEstado = dto.valor;
                        ubicacion.IdEstado = int.Parse(dto.aux.ToString());
                        break;
                    case "CooRelativas":
                        ubicacion.CooRelativas = dto.valor;
                        break;
                    case "CooAlbsolutas":
                        ubicacion.CooAlbsolutas = dto.valor;
                        break;
                    case "UmbralStockCero":
                        ubicacion.UmbralStockCero = int.Parse(dto.valor);
                        break;
                    case "Nombre":
                        ubicacion.Nombre = dto.valor;
                        break;
                    case "Descripcion":
                        ubicacion.Descripcion = dto.valor;
                        break;
                    case "IdUbicacionLinkMes":
                        ubicacion.IdUbicacionLinkMes = dto.valor;
                        break;
                    //AA 13-11-2017
                    case "DescLinea":
                        ubicacion.IdLinea = dto.valor;
                        ubicacion.IdZonaAsociada = string.Empty;
                        break;
                    case "DescZonaAsociada":
                        ubicacion.IdZonaAsociada = dto.valor;
                        break;
                    case "DescPDV":
                        ubicacion.IdPDV = !String.IsNullOrEmpty(dto.valor) ?(int?) int.Parse(dto.valor):null;
                        break;
                    case "DescPDVSEO":
                        ubicacion.IdPDVSEO = !String.IsNullOrEmpty(dto.valor) ? (int?)int.Parse(dto.valor) : null;
                        break;
                    case "Offset":
                        ubicacion.Offset = int.Parse(dto.valor);
                        break;
                    case "VelocidadNominalReferencia":
                        ubicacion.VelocidadNominalReferencia = int.Parse(dto.valor);
                        break;
                    case "Buffer":
                        ubicacion.Buffer = !String.IsNullOrEmpty(dto.valor) ? (bool?)bool.Parse(dto.valor) : null;
                        break;
                    case "Tag":
                        ubicacion.Tag = !String.IsNullOrEmpty(dto.valor) ? dto.valor : null;
                        break;
                    case "Cantidad_Lote_Buffer":
                        ubicacion.Cantidad_Lote_Buffer = !String.IsNullOrEmpty(dto.valor) ? (decimal?)decimal.Parse(dto.valor) : null;
                        break;
                    case "NombreGrupo":
                        ubicacion.IdGrupo = !String.IsNullOrEmpty(dto.valor) ? (int?)decimal.Parse(dto.valor) : null;
                        break;
                    case "CantidadLotesVaciadoAutomatico":
                        ubicacion.CantidadLotesVaciadoAutomatico = int.Parse(dto.valor);
                        break;
                }

                var ret = await _apiTrazabilidad.PutPostsAsync(UriUbicacion + "/" + ubicacion.IdUbicacion, ubicacion);

                //return new ReturnValue(true);

                return dto;
            }
            catch
            {
                return null;
            }
        }


        public async Task<ReturnValue> eliminarUbicacion(UbicacionDto datos)
        {
            try
            {

                int idUb = int.Parse(datos.IdUbicacion.ToString());

                var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriUbicacion + "/" + idUb.ToString());

                return new ReturnValue(true);
            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }
        }

        public async Task<ReturnValue> ReactivarUbicacion(int idUb)
        {
            try
            {
                var ret = await _apiTrazabilidad.PutPostsAsync<int>(UriUbicacion + "/" + "reactivarUbicacion" + "/" + idUb, idUb);

                return new ReturnValue(true);
            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }
        }

        public async Task<bool> comprobarDeleteUbicacion(int idUbicacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<bool>(UriComprobarDelete + "/" + idUbicacion);
            return ret;
        }

        public async Task<List<TipoZonaDto>> ObtenerTiposZona()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TipoZonaDto>>(UriTipoZona);
            return ret;
        }

        public async Task<List<TipoAlmacenDto>> ObtenerTiposAlmacen()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TipoAlmacenDto>>(UriTipoAlmacen);
            return ret;
        }

        public async Task<AlmacenDto> crearAlmacen(AlmacenDto dto)
        {
            try
            {
                AlmacenDto ret = await _apiTrazabilidad.PostPostsAsync(dto, UriAlmacen);

                return ret;
            }
            catch
            {
                return null;
            }
        }

        public async Task<ZonaDto> crearZona(ZonaDto dto)
        {
            try
            {
                ZonaDto ret = await _apiTrazabilidad.PostPostsAsync(dto, UriZona);

                return ret;
            }
            catch
            {
                return null;
            }
        }


        public async Task<DetalleAlmacen> editarAlmacen(DetalleAlmacen dto)
        {
            try
            {
                var almacen = await _apiTrazabilidad.GetPostsAsync<AlmacenDto>(UriAlmacen + "/" + dto.idSup);

                switch (dto.idProp)
                {
                    case "DescripcionTipoAlmacen":
                        //almacen.DescripcionTipoAlmacen = dto.valor;
                        //List<TipoAlmacenDto> idTipoAlmacen = await _apiTrazabilidad.GetPostsAsync<List<TipoAlmacenDto>>(UriTipoAlmacen + "/" + dto.valor);
                        //almacen.IdTipoAlmacen = idTipoAlmacen[0].IdTipoAlmacen;
                        break;
                    default:
                        almacen.Descripcion = dto.valor;
                        break;
                }

                var ret = await _apiTrazabilidad.PutPostsAsync(UriAlmacen + "/" + almacen.IdAlmacen, almacen);

                return dto;
            }
            catch
            {
                return null;
            }
        }

        public async Task<DetalleAlmacen> editarZona(DetalleAlmacen dto)
        {
            try
            {
                var zona = await _apiTrazabilidad.GetPostsAsync<ZonaDto>(UriZona + "/" + dto.idSup);

                switch (dto.idProp)
                {
                    case "DescripcionTipoZona":
                        zona.DescripcionTipoZona = dto.valor;
                        zona.IdTipoZona = int.Parse(dto.aux);
                        break;
                    case "DescripcionAlmacen":
                        zona.DescripcionAlmacen = dto.valor;
                        zona.IdAlmacen = int.Parse(dto.aux);
                        break;
                    default:
                        zona.Descripcion = dto.valor;
                        break;
                }

                var ret = await _apiTrazabilidad.PutPostsAsync(UriZona + "/" + zona.IdZona, zona);

                return dto;
            }
            catch
            {
                return null;
            }
        }

        public async Task<ReturnValue> eliminarAlmacen(AlmacenDto dto)
        {
            try
            {

                int id = dto.IdAlmacen;

                var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriAlmacen + "/" + id.ToString());

                return new ReturnValue(true);
            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }
        }

        public async Task<ReturnValue> eliminarZona(ZonaDto dto)
        {
            try
            {

                int id = dto.IdZona;

                var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriZona + "/" + id.ToString());

                return new ReturnValue(true);
            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }
        }


        public async Task<ZonaDto> seleccionaZonaPorId(int IdZona)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<ZonaDto>(UriZona + "/" + IdZona.ToString());

            return ret;

        }

        public async Task<AlmacenDto> seleccionaAlmacenPorId(int IdAlmacen)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<AlmacenDto>(UriAlmacen + "/" + IdAlmacen.ToString());

            return ret;

        }

        public async Task<UbicacionDto> seleccionaUbicacionPorId(int IdUbicacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<UbicacionDto>(UriUbicacion + "/" + IdUbicacion.ToString());

            return ret;
        }

        public async Task<List<UnidadAlmacenamientoDto>> ObtenerUnidadAlmacenamiento()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UnidadAlmacenamientoDto>>(UriUnidadAlmacenamiento);

            return ret;
        }

        public async Task<List<EquipoDto>> ObtenerEquiposSIT()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<EquipoDto>>(UriEquipo);

            return ret;
        }

        public async Task<List<UbicacionDto>> ObtenerEquiposMES()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(UriEquipoMES);

            return ret;
        }

        public async Task<List<UbicacionDto>> ObtenerUbicacionesLogicas()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(UriUbicacionesLogicas);

            return ret;
        }

        public async Task<BarcodeDto> ObtenerBarcode(string title) {
            var ret = await _apiTrazabilidad.GetPostsAsync<BarcodeDto>(UriBarcode + title);
            return ret;
        }


        public async Task<List<object>> GetUbicacionesDescarga() 
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<object>>(UriUbicacionDescarga);
            return ret;
        
        }

        //public async Task<List<UbicacionDescargaDto>> GetByIdGranel(int isGranel)
        //{
        //    var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDescargaDto>>(UriUbicacionDescarga + "/" + isGranel);
        //    return ret;
        //}

        public async Task<List<UbicacionDto>> GetByTipoOperacion(int tipoOperacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(UriUbicacionTipoOperacion + "/" + tipoOperacion.ToString());
            return ret;
        }

        public async Task<int?> GetUbicacionMaterial(int idMaterial)
        {            
            var ret = await _apiTrazabilidad.GetPostsAsync<int?>(String.Concat(UriUbicacion, "/UbicacionMaterial", "?idMaterial=", idMaterial.ToString()));
            return ret;
        }

        public async Task<UbicacionDto> GetUbicacionPorNombre(string nombre)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<UbicacionDto>(UriUbicacion + "/nombre/" + nombre);
            return ret;
        }

        internal static List<UbicacionDto> GetUbicacionesPreparacion()
        {
            throw new NotImplementedException();
        }

        public async Task<List<dynamic>> GetLotesPorMaterial(string IdMaterial) {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriUbicacion + "/Lote/" + IdMaterial);
            return ret;
        }

        public async Task<ZonaUbicacionDto> ActualizarZonaUbicaciones(ZonaUbicacionDto zonaUbicaciones)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync(UriUbicacion + "/ActualizarUbicacionesZonas", zonaUbicaciones);
            return ret;
        }

        public async Task<List<GrupoUbicacionDto>> ObtenerGruposUbicaciones()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<GrupoUbicacionDto>>(UriUbicacion + "/GruposUbicaciones");
            return ret;
        }

        public async Task<List<UbicacionDto>> ObtenerUbicacionesByTipoZonaAndTipoUbicacion(int idTipoUbicacion, int idTipoZona)
        {
            try
            {
                var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(string.Concat(UriUbicacion, "/", idTipoUbicacion, "/", idTipoZona));
                return ret;
            }
            catch (Exception ex)
            {
                return new List<UbicacionDto>();
            }
        }

        public async Task<bool> ActualizarRepartoProduccionLineasDobles(List<DTO_ClaveValor> listaDatos)
        {
            bool ret = await _apiTrazabilidad.PutPostsAsymmetricAsync<bool>(UriUbicacion + "/UpdateRepartoProduccionLineasDobles", listaDatos);
            return ret;
        }

        public async Task<List<UbicacionDto>> UbicacionesConsumo(string linea)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDto>>(String.Concat(UriUbicacion, "/UbicacionesConsumo?slinea=", linea));
            return ret;
        }
    }
}