//using ApplicationCore.DTOs;
using Common.Models;
using Common.Models.Material;
using Common.Models.Ubicacion;
using Common.Models.Ubicaciones;
using MSM.Mappers.DTO;
using MSM.Models.Trazabilidad;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad
{
    public interface IDAO_Ubicacion
    {

        Task<List<AlmacenDto>> ObtenerAlmacenes();

        Task<List<UbicacionDto>> ObtenerUbicaciones();

        Task<List<UbicacionPuntosVerificacionDto>> GetUbicacionesPuntosVerificacion();

        Task<List<UbicacionConResumenOrdenesDto>> ObtenerUbicacionConResumenOrdenes(int IdUbicacion);

        Task<List<ZonaDto>> ObtenerZonasDesdeAlmacen(int IdAlmacen);

        Task<List<UbicacionDto>> ObtenerUbicacionesPorIdLinea(UbicacionDto ubicacion);
        Task<List<UbicacionDto>> ObtenerUbicacionesPorLinea(int Linea);        

        Task<List<UbicacionDto>> ObtenerUbicacionesDesdeZonaAlmacen(int IdAlmacen, int IdZona);

        Task<List<UbicacionDto>> ObtenerUbicacionesCrearLote(int IdAlmacen, int IdZona);

        Task<List<UbicacionDto>> ObtenerUbicacionesDesdezona(int IdZona);

        Task<List<UbicacionDto>> ObtenerUbicacionesRecepcion();

        Task<List<TipoUbicacionDto>> ObtenerTiposUbicacion();

        Task<List<EstadoUbicacionDto>> ObtenerEstadosUbicacion();

        Task<List<PoliticaAlmacenamientoDto>> ObtenerPoliticasAlmacenamiento();

        Task<List<PoliticaLlenadoDto>> ObtenerPoliticasLlenado();

        Task<List<PoliticaVaciadoDto>> ObtenerPoliticasVaciado();

        Task<List<MaterialDto>> ObtenerMaterialesUbicacion();

        Task<List<ClaseMaterialDto>> ObtenerClasesMaterialUbicacion();

        Task<List<TipoMaterialDto>> ObtenerTiposMaterial();

        Task<DTO_RespuestaAPI<object>> crearUbicacion(UbicacionDto datos);

        Task<ReturnValue> ReactivarUbicacion(int idUb);

        Task<DetalleAlmacen> editarUbicacion(DetalleAlmacen datos);

        Task<ReturnValue> eliminarUbicacion(UbicacionDto datos);

        Task<bool> comprobarDeleteUbicacion(int idUbicacion);

        Task<AlmacenDto> crearAlmacen(AlmacenDto dto);

        Task<DetalleAlmacen> editarAlmacen(DetalleAlmacen dto);

        Task<ReturnValue> eliminarAlmacen(AlmacenDto dto);

        Task<ZonaDto> crearZona(ZonaDto dto);

        Task<DetalleAlmacen> editarZona(DetalleAlmacen dto);

        Task<ReturnValue> eliminarZona(ZonaDto dto);

        Task<List<TipoAlmacenDto>> ObtenerTiposAlmacen();

        Task<List<TipoZonaDto>> ObtenerTiposZona();

        Task<ZonaDto> seleccionaZonaPorId(int IdZona);

        Task<AlmacenDto> seleccionaAlmacenPorId(int IdAlmacen);

        Task<UbicacionDto> seleccionaUbicacionPorId(int IdUbicacion);

        Task<List<UnidadAlmacenamientoDto>> ObtenerUnidadAlmacenamiento();

        Task<List<EquipoDto>> ObtenerEquiposSIT();

        Task<List<UbicacionDto>> ObtenerEquiposMES();

        Task<List<UbicacionDto>> ObtenerUbicacionesLogicas();

        Task<BarcodeDto> ObtenerBarcode(string title);

        Task<List<object>> GetUbicacionesDescarga();

        //Task<List<UbicacionDescargaDto>> GetByIdGranel(int isGranel);

        Task<List<UbicacionDto>> GetByTipoOperacion(int tipoOperacion);

        Task<int?> GetUbicacionMaterial(int idMaterial);

        Task<UbicacionDto> GetUbicacionPorNombre(string nombre);

        Task<List<dynamic>> GetLotesPorMaterial(string IdMaterial);

        Task<ZonaUbicacionDto> ActualizarZonaUbicaciones(ZonaUbicacionDto zonaUbicaciones);

        Task<List<GrupoUbicacionDto>> ObtenerGruposUbicaciones();

        Task<List<UbicacionDto>> ObtenerUbicacionesByTipoZonaAndTipoUbicacion(int idTipoUbicacion, int idTipoZona);

        Task<bool> ActualizarRepartoProduccionLineasDobles(List<DTO_ClaveValor> listaDatos);

        Task<List<UbicacionDto>> UbicacionesConsumo(string linea);
    }
}
