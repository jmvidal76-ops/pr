//using ApplicationCore.DTOs;
using Common.Models;
using Common.Models.Destinatario;
using Common.Models.Material;
using Common.Models.Ubicacion;
using Common.Models.Ubicaciones;
using MSM.BBDD.Almacen.ColasCamiones;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad;
using MSM.BBDD.Trazabilidad.Transporte;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Models.Planta;
using MSM.Models.Trazabilidad;
using MSM.RealTime;
using MSM.Security;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Http;

namespace MSM.Controllers.Almacen.Ubicacion
{
    public enum TipoOrigenEnum
    {
        Interna,
        Externa

    }



    [Authorize]
    public class UbicacionController : ApiController
    {
        private readonly IDAO_Ubicacion _IDAO_Ubicacion;
        private readonly IDAO_Destinatario _iDAO_Destinatario;
        private readonly IDAO_ColasCamiones _iDAO_ColasCamiones;

        public UbicacionController(IDAO_Ubicacion DAOUbicacion, IDAO_Destinatario iDAO_Destinatario, IDAO_ColasCamiones iDAO_ColasCamiones)
        {
            _IDAO_Ubicacion = DAOUbicacion;
            _iDAO_Destinatario = iDAO_Destinatario;
            _iDAO_ColasCamiones = iDAO_ColasCamiones;
        }

        [Route("api/Ubicacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public IEnumerable Ubicacion()
        {
            IEnumerable lstUbicacion = null;

            return lstUbicacion;
        }

        [Route("api/ObtenerAlmacenesUbicacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<AlmacenDto>> obtenerAlmacenes()
        {
            List<AlmacenDto> listaAlmacenes = new List<AlmacenDto>();
            try
            {
                listaAlmacenes = await _IDAO_Ubicacion.ObtenerAlmacenes();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaAlmacenes;
        }

        [Route("api/ObtenerZonasDesdeAlmacen/{IdAlmacen}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<ZonaDto>> ObtenerZonasDesdeAlmacen(int IdAlmacen)
        {
            List<ZonaDto> listaZonas = new List<ZonaDto>();
            try
            {
                listaZonas = await _IDAO_Ubicacion.ObtenerZonasDesdeAlmacen(IdAlmacen);
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaZonas;
        }


        [Route("api/ObtenerUbicacionesDesdezona/{IdZona}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones,
            Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_67_VisualizacionDevolucionesMMPPSmile,
            Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_68_VisualizacionDevolucionesMMPPSmileTerminal)
            ]
        public async Task<List<UbicacionDto>> ObtenerUbicacionesDesdezona(int idZona)
        {
            List<UbicacionDto> listaUbicaciones = new List<UbicacionDto>();
            try
            {
                listaUbicaciones = await _IDAO_Ubicacion.ObtenerUbicacionesDesdezona(idZona);
                if (listaUbicaciones == null)
                {
                    listaUbicaciones = new List<UbicacionDto>();
                }
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaUbicaciones;
        }

        [Route("api/ObtenerUbicacionesPorIdLinea")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<UbicacionDto>> ObtenerUbicacionesPorIdLinea(UbicacionDto ubicacion)
        {
            List<UbicacionDto> listaUbicaciones = new List<UbicacionDto>();
            try
            {

                listaUbicaciones = await _IDAO_Ubicacion.ObtenerUbicacionesPorIdLinea(new UbicacionDto { IdLinea = ubicacion.IdLinea });
                if (listaUbicaciones == null)
                {
                    listaUbicaciones = new List<UbicacionDto>();
                }
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaUbicaciones;
        }

        [Route("api/ObtenerUbicacionesPorLinea")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_7_GestionLanzarMuestraLIMSLlenadoraCELTerminal, Funciones.CEL_8_VisualizacionLanzarMuestraLIMSLlenadoraCELTerminal,
                      Funciones.ENV_PROD_EXE_66_GestionVerQRsMMPPZonaTerminal, Funciones.ENV_PROD_EXE_66_VisualizacionVerQRsMMPPZonaTerminal,
                      Funciones.CEL_15_GestionBloqueoPaletasTerminal, Funciones.CEL_15_VisualizacionBloqueoPaletasTerminal,
             Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_67_VisualizacionDevolucionesMMPPSmile,
            Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_68_VisualizacionDevolucionesMMPPSmileTerminal)]
        public async Task<List<UbicacionDto>> ObtenerUbicacionesPorLinea(int Linea)
        {
            List<UbicacionDto> listaUbicaciones = new List<UbicacionDto>();
            try
            {
                listaUbicaciones = await _IDAO_Ubicacion.ObtenerUbicacionesPorLinea(Linea);
                if (listaUbicaciones == null)
                {
                    listaUbicaciones = new List<UbicacionDto>();
                }
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaUbicaciones;
        }


        [Route("api/ObtenerTiposUbicacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<TipoUbicacionDto>> ObtenerTiposUbicacion()
        {
            List<TipoUbicacionDto> listaTiposUbicacion = new List<TipoUbicacionDto>();
            try
            {
                listaTiposUbicacion = await _IDAO_Ubicacion.ObtenerTiposUbicacion();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaTiposUbicacion;
        }

        [Route("api/ObtenerEstadosUbicacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<EstadoUbicacionDto>> ObtenerEstadosUbicacion()
        {
            List<EstadoUbicacionDto> listaEstadosUbicacion = new List<EstadoUbicacionDto>();
            try
            {
                listaEstadosUbicacion = await _IDAO_Ubicacion.ObtenerEstadosUbicacion();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaEstadosUbicacion;
        }

        [Route("api/ObtenerPoliticasAlmacenamiento")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<PoliticaAlmacenamientoDto>> ObtenerPoliticasAlmacenamiento()
        {
            List<PoliticaAlmacenamientoDto> listaPoliticasAlmacenamiento = new List<PoliticaAlmacenamientoDto>();
            try
            {
                listaPoliticasAlmacenamiento = await _IDAO_Ubicacion.ObtenerPoliticasAlmacenamiento();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaPoliticasAlmacenamiento;
        }

        [Route("api/ObtenerPoliticasLlenado")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<PoliticaLlenadoDto>> ObtenerPoliticasLlenado()
        {
            List<PoliticaLlenadoDto> listaPoliticasLlenado = new List<PoliticaLlenadoDto>();
            try
            {
                listaPoliticasLlenado = await _IDAO_Ubicacion.ObtenerPoliticasLlenado();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaPoliticasLlenado;
        }

        [Route("api/ObtenerPoliticasVaciado")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<PoliticaVaciadoDto>> ObtenerPoliticasVaciado()
        {
            List<PoliticaVaciadoDto> listaPoliticasVaciado = new List<PoliticaVaciadoDto>();
            try
            {
                listaPoliticasVaciado = await _IDAO_Ubicacion.ObtenerPoliticasVaciado();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaPoliticasVaciado;
        }

        [Route("api/ObtenerMaterialesUbicacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<MaterialDto>> ObtenerMaterialesUbicacion()
        {
            List<MaterialDto> listaMateriales = new List<MaterialDto>();
            try
            {
                listaMateriales = await _IDAO_Ubicacion.ObtenerMaterialesUbicacion();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaMateriales;
        }

        [Route("api/ObtenerClasesMaterialUbicacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<ClaseMaterialDto>> ObtenerClasesMaterialUbicacion()
        {
            List<ClaseMaterialDto> listaClasesMateriales = new List<ClaseMaterialDto>();
            try
            {
                listaClasesMateriales = await _IDAO_Ubicacion.ObtenerClasesMaterialUbicacion();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaClasesMateriales;
        }

        [Route("api/ObtenerTiposMaterial")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<TipoMaterialDto>> ObtenerTiposMaterial()
        {
            List<TipoMaterialDto> listaTiposMateriales = new List<TipoMaterialDto>();
            try
            {
                listaTiposMateriales = await _IDAO_Ubicacion.ObtenerTiposMaterial();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaTiposMateriales;
        }

        [Route("api/crearUbicacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<DTO_RespuestaAPI<object>> crearUbicacion(UbicacionDto datos)
        {
            var result = await _IDAO_Ubicacion.crearUbicacion(datos);

            return result;
        }


        [Route("api/ReactivarUbicacion/{idUb}")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<ReturnValue> ReactivarUbicacion(int idUb)
        {
            var ret = await _IDAO_Ubicacion.ReactivarUbicacion(idUb);

            return ret;
        }

        [Route("api/editarUbicacion")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<DetalleAlmacen> editarUbicacion(DetalleAlmacen datos)
        {
            DetalleAlmacen ret = await _IDAO_Ubicacion.editarUbicacion(datos);

            return ret;
        }


        [Route("api/eliminarUbicacion")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<ReturnValue> eliminarUbicacion(UbicacionDto datos)
        {
            ReturnValue ret = new ReturnValue(true);

            ret = await _IDAO_Ubicacion.eliminarUbicacion(datos);

            return ret;
        }


        [Route("api/comprobarDeleteUbicacion/{IdUbicacion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<bool> comprobarDeleteUbicacion(int idUbicacion)
        {
            var ret = await _IDAO_Ubicacion.comprobarDeleteUbicacion(idUbicacion);

            return ret;
        }

        [Route("api/resumenestadoordenes/{IdUbicacion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<List<UbicacionConResumenOrdenesDto>> ObtenerUbicacionConResumenOrdenes(int idUbicacion)
        {
            var ret = await _IDAO_Ubicacion.ObtenerUbicacionConResumenOrdenes(idUbicacion);

            return ret;
        }


        //[Route("api/detalleAlmacen/Update")]
        //[HttpPut]
        //[ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        //public async Task<ReturnValue> almacenUpd(DetalleAlmacen models)
        //{
        //    ReturnValue ret = new ReturnValue(true);

        //    ret = await _IDAO_Ubicacion.editarAlmacen(models);

        //    return ret;
        //}


        [Route("api/almacen/Destroy")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<ReturnValue> almacenDestroy(AlmacenDto models)
        {
            ReturnValue ret = new ReturnValue(true);

            ret = await _IDAO_Ubicacion.eliminarAlmacen(models);

            return ret;
        }

        [Route("api/zona/Destroy")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<ReturnValue> ZonaDestroy(ZonaDto models)
        {
            ReturnValue ret = new ReturnValue(true);

            ret = await _IDAO_Ubicacion.eliminarZona(models);

            return ret;
        }

        [Route("api/almacen/Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<AlmacenDto> almacenCreate(AlmacenDto models)
        {
            AlmacenDto ret = models;

            ret = await _IDAO_Ubicacion.crearAlmacen(models);

            return ret;
        }

        [Route("api/zona/Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<ZonaDto> zonaCreate(ZonaDto models)
        {

            ZonaDto ret = models;

            ret = await _IDAO_Ubicacion.crearZona(models);

            return ret;
        }

        [Route("api/ObtenerDetalleAlmacen/{IdAlmacen}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<DetalleAlmacen>> ObtenerDetalleAlmacen(int IdAlmacen)
        {
            List<DetalleAlmacen> listaDetalles = new List<DetalleAlmacen>();

            AlmacenDto almacenSeleccionado = await _IDAO_Ubicacion.seleccionaAlmacenPorId(IdAlmacen);

            PropertyInfo[] properties = typeof(AlmacenDto).GetProperties();
            foreach (PropertyInfo property in properties)
            {
                string _propiedad = property.ToString().Split(' ')[1].ToString();
                if (!_propiedad.StartsWith("Id"))
                {
                    DetalleAlmacen da1 = new DetalleAlmacen();
                    da1.idProp = property.ToString().Split(' ')[1];
                    da1.prop = IdiomaController.GetResourceName(property.ToString().Split(' ')[1].ToUpper());
                    da1.valor = almacenSeleccionado.GetType().GetProperty(property.ToString().Split(' ')[1]).GetValue(almacenSeleccionado, null).ToString();
                    da1.idSup = IdAlmacen;

                    listaDetalles.Add(da1);
                }
            }

            return listaDetalles;

        }

        [Route("api/ObtenerDetalleZona/{IdZona}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<DetalleAlmacen>> ObtenerDetalleZona(int IdZona)
        {
            List<DetalleAlmacen> listaDetalles = new List<DetalleAlmacen>();

            ZonaDto zonaSeleccionado = await _IDAO_Ubicacion.seleccionaZonaPorId(IdZona);

            PropertyInfo[] properties = typeof(ZonaDto).GetProperties();
            foreach (PropertyInfo property in properties)
            {
                string _propiedad = property.ToString().Split(' ')[1].ToString();
                if (!_propiedad.StartsWith("Id"))
                {
                    DetalleAlmacen da1 = new DetalleAlmacen();
                    da1.idProp = property.ToString().Split(' ')[1];
                    da1.prop = IdiomaController.GetResourceName(property.ToString().Split(' ')[1].ToUpper());
                    da1.valor = zonaSeleccionado.GetType().GetProperty(property.ToString().Split(' ')[1]).GetValue(zonaSeleccionado, null).ToString();
                    da1.idSup = IdZona;

                    listaDetalles.Add(da1);
                }
            }

            return listaDetalles;

        }

        [Route("api/GetUnLoadLocationName/{id}")]
        [HttpGet]
        [AllowAnonymous]
        public async Task<string> GetUnLoadLocationName(int id)
        {
            UbicacionDto ret = await _IDAO_Ubicacion.seleccionaUbicacionPorId(id);
            return ret.Nombre;
        }

        [Route("api/GetDatosUbicacion/{IdUbicacion}")]
        [HttpGet]
        [AllowAnonymous]
        public async Task<UbicacionDto> GetDatosUbicacion(int IdUbicacion)
        {
            UbicacionDto ret = await _IDAO_Ubicacion.seleccionaUbicacionPorId(IdUbicacion);
            return ret;
        }

        [Route("api/ObtenerDetalleUbicacion/{IdUbicacion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<DetalleAlmacen>> ObtenerDetalleUbicacion(int IdUbicacion)
        {
            List<DetalleAlmacen> listaDetalles = new List<DetalleAlmacen>();

            UbicacionDto ubicacionSel = await _IDAO_Ubicacion.seleccionaUbicacionPorId(IdUbicacion);

            PropertyInfo[] properties = typeof(UbicacionDto).GetProperties();
            var _idLinea = "";
            var _descZonaAsociada = "";
            var _idZonaAsociada = "";
            var _idPDV = "";
            var _idPDVSEO = "";
            var _idClaseMaterial = "";

            List<Models.Envasado.Zona> _zonas = new List<Models.Envasado.Zona>();
            object obj;
            try
            {
                foreach (PropertyInfo property in properties)
                {
                    string _propiedad = property.ToString().Split(' ')[1].ToString();
                    switch (_propiedad)
                    {
                        case "IdLinea":
                        case "IdZonaAsociada":
                        case "IdPDV":
                        case "IdPDVSEO":
                            obj = ubicacionSel.GetType().GetProperty(property.ToString().Split(' ')[1]).GetValue(ubicacionSel, null);

                            if (_propiedad.Equals("IdLinea"))
                                _idLinea = obj != null ? obj.ToString() : String.Empty;

                            if (_propiedad.Equals("IdZonaAsociada"))
                                _idZonaAsociada = obj != null ? obj.ToString() : String.Empty;

                            if (_propiedad.Equals("IdPDV"))
                                _idPDV = obj != null ? obj.ToString() : String.Empty;

                            if (_propiedad.Equals("IdPDVSEO"))
                                _idPDVSEO = obj != null ? obj.ToString() : String.Empty;

                            break;
                        default:
                            break;
                    }


                    if (!_propiedad.StartsWith("Id") && !_propiedad.EndsWith("Planta")
                        && !_propiedad.EndsWith("Almacen") && !_propiedad.Equals("Version")
                        && !_propiedad.EndsWith("Activo") && !_propiedad.StartsWith("Ref")
                        && !_propiedad.StartsWith("CanBe") && !_propiedad.Equals("Zona") || _propiedad.Equals("IdUbicacion"))
                    {
                        DetalleAlmacen da1 = new DetalleAlmacen();
                        da1.idProp = property.ToString().Split(' ')[1];
                        da1.prop = IdiomaController.GetResourceName(property.ToString().Split(' ')[1].ToUpper());
                        //AA 13-11-2017
                        if (_propiedad.Equals("DescLinea"))
                        {

                            foreach (var item in PlantaRT.planta.lineas)
                            {
                                if (item.id == _idLinea)
                                {
                                    da1.valor = "Linea " + item.numLineaDescripcion + " - " + item.descripcion;
                                    _zonas = item.zonas;
                                }
                            }
                        }
                        //AA 13-11-2017
                        else if (_propiedad.Equals("DescZonaAsociada"))
                        {
                            da1.valor = _zonas.Count > 0 && _idZonaAsociada != string.Empty ? _zonas.Where(z => z.id == _idZonaAsociada).FirstOrDefault()?.descripcion : "";
                        }
                        else if (_propiedad.Equals("DescPDV") || _propiedad.Equals("DescPDVSEO"))
                        {
                            MSM.Controllers.Alt.locationsController _loc = new MSM.Controllers.Alt.locationsController();
                            var _pdv = _loc.getAllTemplatesLocations();
                            foreach (var item in _pdv)
                            {
                                if ((!string.IsNullOrEmpty(_idPDV) && _idPDV != "0") || (!string.IsNullOrEmpty(_idPDVSEO) && _idPDVSEO != "0"))
                                {
                                    System.Reflection.PropertyInfo pi = item.GetType().GetProperty("ID");
                                    String _ID = (pi.GetValue(item, null).ToString());
                                    if ((_ID == _idPDV) || (_ID == _idPDVSEO))
                                    {
                                        System.Reflection.PropertyInfo _desc = item.GetType().GetProperty("descript");
                                        String _descript = (_desc.GetValue(item, null).ToString());
                                        if (da1.idProp == "DescPDV" && _idPDV == "0") da1.valor = string.Empty;
                                        else if (da1.idProp == "DescPDVSEO" && _idPDVSEO == "0") da1.valor = string.Empty;
                                        else da1.valor = _descript;
                                    }
                                }
                                else
                                {
                                    da1.valor = "";
                                }
                            }
                        }
                        else
                        {
                            obj = ubicacionSel.GetType().GetProperty(property.ToString().Split(' ')[1]).GetValue(ubicacionSel, null);
                            da1.valor = obj != null ? obj.ToString() : String.Empty;
                        }


                        da1.idSup = IdUbicacion;
                        listaDetalles.Add(da1);
                    }

                    if (_propiedad.Equals("IdUbicacionLinkMes"))
                    {
                        DetalleAlmacen da1 = new DetalleAlmacen();
                        da1.idProp = property.ToString().Split(' ')[1];
                        da1.prop = IdiomaController.GetResourceName(property.ToString().Split(' ')[1].ToUpper());
                        da1.valor = ubicacionSel.GetType().GetProperty(property.ToString().Split(' ')[1]).GetValue(ubicacionSel, null).ToString();
                        da1.idSup = IdUbicacion;

                        listaDetalles.Add(da1);
                    }

                }

                string almac = listaDetalles.Find(e => e.idProp.Equals("DescripcionPoliticaAlmacenamiento")).valor;

                switch (almac)
                {
                    case "":
                    case "Caótica":
                        listaDetalles.Remove(listaDetalles.Find(a => a.idProp.Equals("DescripcionMaterial")));
                        listaDetalles.Remove(listaDetalles.Find(a => a.idProp.Equals("DescripcionTipoMaterial")));
                        break;
                    case "Referencia":
                        listaDetalles.Remove(listaDetalles.Find(a => a.idProp.Equals("DescripcionTipoMaterial")));
                        break;
                    case "Tipo":
                        listaDetalles.Remove(listaDetalles.Find(a => a.idProp.Equals("DescripcionMaterial")));
                        break;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "UbicacionController.ObtenerDetalleUbicacion", "WEB-TRAZABILIDAD", "Sistema");
                throw new Exception("Error al obtener detalle de la ubicación: " + ex.Message);
            }


            return listaDetalles.Where(l => !String.IsNullOrEmpty(l.prop)).ToList();

        }


        [Route("api/detalleAlmacen/Update")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<bool> actualizaDetallle(DetalleAlmacen det1)
        {
            var ret = await _IDAO_Ubicacion.editarAlmacen(det1);

            return true;

        }

        [Route("api/detalleZona/Update")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<bool> detalleZona(DetalleAlmacen det1)
        {
            var ret = await _IDAO_Ubicacion.editarZona(det1);

            return true;

        }

        [Route("api/ObtenerTipoAlmacen")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<TipoAlmacenDto>> ObtenerTipoAlmacen()
        {
            List<TipoAlmacenDto> listaTiposAlmacen = new List<TipoAlmacenDto>();
            try
            {
                listaTiposAlmacen = await _IDAO_Ubicacion.ObtenerTiposAlmacen();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaTiposAlmacen;

        }


        [Route("api/ObtenerTipoZona")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<TipoZonaDto>> ObtenerTipoZona()
        {
            List<TipoZonaDto> listaTiposZona = new List<TipoZonaDto>();
            try
            {
                listaTiposZona = await _IDAO_Ubicacion.ObtenerTiposZona();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaTiposZona;

        }


        [Route("api/ObtenerEquiposSIT")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<EquipoDto>> ObtenerEquiposSIT()
        {
            List<EquipoDto> listaEquipos = new List<EquipoDto>();
            try
            {
                listaEquipos = await _IDAO_Ubicacion.ObtenerEquiposSIT();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaEquipos;

        }

        [Route("api/ObtenerEquiposMES")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<UbicacionDto>> ObtenerEquiposMES()
        {
            List<UbicacionDto> listaEquipos = new List<UbicacionDto>();
            try
            {
                listaEquipos = await _IDAO_Ubicacion.ObtenerEquiposMES();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaEquipos;

        }

        [Route("api/ObtenerUbicacionesLogicas")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<UbicacionDto>> ObtenerUbicacionesLogicas()
        {
            List<UbicacionDto> listaEquipos = new List<UbicacionDto>();
            try
            {
                listaEquipos = await _IDAO_Ubicacion.ObtenerUbicacionesLogicas();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaEquipos;

        }


        [Route("api/ActualizarZonaUbicaciones")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<bool> ActualizarZonaUbicaciones(ZonaUbicacionDto zonaUbicacion)
        {
            ZonaUbicacionDto zonaUbicacionResult = new ZonaUbicacionDto();
            try
            {
                zonaUbicacionResult = await _IDAO_Ubicacion.ActualizarZonaUbicaciones(zonaUbicacion);
                return zonaUbicacionResult != null ? true : false;
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return false;

        }


        [Route("api/ObtenerUnidadAlmacenamiento")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<List<UnidadAlmacenamientoDto>> ObtenerUnidadAlmacenamiento()
        {
            List<UnidadAlmacenamientoDto> listaUOM = new List<UnidadAlmacenamientoDto>();
            try
            {
                listaUOM = await _IDAO_Ubicacion.ObtenerUnidadAlmacenamiento();
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return listaUOM;

        }

        [Route("api/ObtenerBarcode/{title}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
        public async Task<BarcodeDto> ObtenerBarcode(string title)
        {
            BarcodeDto _barcode = new BarcodeDto();
            try
            {
                _barcode = await _IDAO_Ubicacion.ObtenerBarcode(title);
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return _barcode;

        }

        /// <summary>
        /// Metodo que obtiene los Almacenes
        /// </summary>
        /// <returns></returns>
        [Route("api/GetDepot")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_4_HistoricoCamiones,Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<List<AlmacenDto>> GetDepot()
        {

            List<AlmacenDto> listAlmacen = new List<AlmacenDto>();
            List<AlmacenDto> depot = await _IDAO_Ubicacion.ObtenerAlmacenes();
            if (depot != null)
            {
                if (depot.Count > 0)
                {
                    listAlmacen = depot;
                }
            }
            return listAlmacen;
        }




        /// <summary>
        /// Metodo que obtiene las Zonas segun el Id de Almacen
        /// </summary>
        /// <returns></returns>
        [Route("api/GetZone/{idAlmacen}")]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_4_HistoricoCamiones, Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<List<ZonaDto>> GetZone(int idAlmacen)
        {

            List<ZonaDto> listZone = new List<ZonaDto>();
            List<ZonaDto> zones = await _IDAO_Ubicacion.ObtenerZonasDesdeAlmacen(idAlmacen);
            if (zones != null)
            {
                if (zones.Count > 0)
                {
                    listZone = zones;
                }
            }

            return listZone;
        }


        /// <summary>
        /// Metodo que obtiene las Ubicaciones segun el Id de Almacen e Id de Zona
        /// </summary>
        /// <returns></returns>
        [Route("api/GetLocation/{idAlmacen}/{idZona}")]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_4_HistoricoCamiones, Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<List<UbicacionDto>> GetLocation(int idAlmacen, int idZona)
        {
            List<UbicacionDto> listLocation = new List<UbicacionDto>();


            List<UbicacionDto> locations = await _IDAO_Ubicacion.ObtenerUbicacionesDesdeZonaAlmacen(idAlmacen, idZona);
            if (locations != null)
            {
                if (locations.Count > 0)
                {
                    listLocation = locations;
                }
            }

            return listLocation;
        }


        /// <summary>
        /// Metodo que obtiene las Ubicaciones segun el Id de Almacen e Id de Zona filtradas para crear lote
        /// </summary>
        /// <returns></returns>
        [Route("api/GetUbicacionesCrearLote/{idAlmacen}/{idZona}")]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_4_HistoricoCamiones, Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<List<UbicacionDto>> GetUbicacionesCrearLote(int idAlmacen, int idZona)
        {
            List<UbicacionDto> listLocation = new List<UbicacionDto>();


            List<UbicacionDto> locations = await _IDAO_Ubicacion.ObtenerUbicacionesCrearLote(idAlmacen, idZona);
            if (locations != null)
            {
                if (locations.Count > 0)
                {
                    listLocation = locations;
                }
            }

            return listLocation;
        }

        [Route("api/GetDataAutoCompleteUbicacion/{tipo}/{operacion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_4_HistoricoCamiones, Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
        public async Task<IHttpActionResult> ObtenerDataAutoComplete(string tipo, int? operacion, string nombre = null/*, int isGranel = 2*/)
        {
            List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
            try
            {
                TipoOrigenEnum tipoEnum = (TipoOrigenEnum)Enum.Parse(typeof(TipoOrigenEnum), tipo);
                switch (tipoEnum)
                {
                    case TipoOrigenEnum.Interna:
                        var _ubicacion = await _IDAO_Ubicacion.GetByTipoOperacion(operacion ?? 0);
                        foreach (var item in _ubicacion)
                        {
                            var claveValor = new DTO_ClaveValorInfo()
                            {
                                Id = item.IdUbicacion,
                                Valor = item.DescripcionAlmacen + " \\ " + item.Zona.FirstOrDefault().Descripcion + " \\ " + item.Nombre,
                                Info = new string[] { item.IdUbicacionLinkMes }
                            };

                            listaClaveValor.Add(claveValor);
                        }
                        break;
                    case TipoOrigenEnum.Externa:
                        List<DestinatarioDto> ubicacionExterna = await _iDAO_Destinatario.Get();
                        foreach (var item in ubicacionExterna)
                        {
                            var claveValor = new DTO_ClaveValorInfo()
                            {
                                Id = item.IdDestinatario,
                                Valor = item.Nombre,
                                Info = new string[] { item.Poblacion, item.NIF }
                                
                            };

                            listaClaveValor.Add(claveValor);
                        }
                        break;
                }

            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }
            return Json(listaClaveValor);
        }

        [Route("api/UbicacionMaterial")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_4_HistoricoCamiones, Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
        public async Task<IHttpActionResult> GetUbicacionMaterial(int idMaterial)
        {
            var result = await _IDAO_Ubicacion.GetUbicacionMaterial(idMaterial);

            return Ok(result);
        }


        #region COLAS DE CAMIONES
        /// <summary>
        /// Metodo que obtiene las Ubicaciones de Descarga
        /// </summary>
        /// <returns></returns>
        [Route("api/GetUbicacionesDescarga")]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_ColasCamiones)]
        public async Task<List<UbicacionDescargaDto>> GetUbicacionesDescarga()
        {

            //List<object> locations = await _IDAO_Ubicacion.GetUbicacionesDescarga();
            List<UbicacionDescargaDto> _ubicacionDescarga = await _iDAO_ColasCamiones.Get();
            if (_ubicacionDescarga == null) _ubicacionDescarga = new List<UbicacionDescargaDto>();
            return _ubicacionDescarga;
        }

        #endregion

        /// <summary>
        /// Método que devuelve las plantillas de ordenes de preparación
        /// </summary>
        /// <returns>Lista con las plantillas de ordnes de preparacion</returns>
        [Route("api/ObtenerUbicacionesPreparacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_11_VisualizacionPlantillasPrep)]
        public async Task<List<UbicacionDto>> ObtenerUbicacionesPreparacion()
        {
            try
            {
                List<UbicacionDto> lstUbicaciones = new List<UbicacionDto>();
                lstUbicaciones = await _IDAO_Ubicacion.ObtenerUbicaciones();
                return lstUbicaciones.Where(u => u.IdTipoUbicacion.Equals((int)TipoUbicacion.Preparacion)).ToList();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "UbicacionController.ObtenerUbicacionesPreparacion", "WEB-TRAZABILIDAD", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_UBICACIONES_PREP"));
            }
        }

        [Route("api/GetUbicacionesPuntosVerificacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_VisualizacionUbicacionesGrid)]
        public async Task<List<UbicacionPuntosVerificacionDto>> GetUbicacionesPuntosVerificacion()
        {
            try
            {

                List<UbicacionPuntosVerificacionDto> lstUbicaciones = await _IDAO_Ubicacion.GetUbicacionesPuntosVerificacion();
                foreach (UbicacionPuntosVerificacionDto location in lstUbicaciones)
                {
                    if (!string.IsNullOrEmpty(location.IdZonaAsociada))
                        location.DescripcionZonaAsociada = PlantaRT.planta.lineas.Find(o => o.id == location?.IdLinea)?.zonas?.Find(o => o.id == location?.IdZonaAsociada)?.descripcion;
                    else 
                        location.DescripcionZonaAsociada = "";
                }
                
                return lstUbicaciones;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "UbicacionController.GetUbicacionesPuntosVerificacion", "WEB-TRAZABILIDAD", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_UBICACIONES_PREP"));
            }
        }


        [Route("api/ObtenerGruposUbicaciones")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones, Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<List<GrupoUbicacionDto>> ObtenerGruposUbicaciones()
        {
            try
            {
                List<GrupoUbicacionDto> lstUbicaciones = new List<GrupoUbicacionDto>();
                return await _IDAO_Ubicacion.ObtenerGruposUbicaciones();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UbicacionController.ObtenerUbicacionesPreparacion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "UbicacionController.ObtenerUbicacionesPreparacion", "WEB-TRAZABILIDAD", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_UBICACIONES_PREP"));
            }
        }

        [Route("api/ObtenerUbicaciones/{idTipoUbicacion}/{idTipoZona}")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion, Funciones.TRA_PROD_FAB_1_VisualizacionMovimientoLotesFabricacion,
                      Funciones.FAB_PROD_STK_1_GestionAvisosStockMMPPFabricacion, Funciones.FAB_PROD_STK_1_VisualizacionAvisosStockMMPPFabricacion,
                      Funciones.ALM_PROD_DAT_9_GestionAvisosStockMMPPFabricacion, Funciones.ALM_PROD_DAT_9_VisualizacionAvisosStockMMPPFabricacion,
            Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
        public async Task<List<UbicacionDto>> ObtenerUbicaciones(int idTipoUbicacion, int idTipoZona)
        {
            List<UbicacionDto> listLocation = new List<UbicacionDto>();

            List<UbicacionDto> locations = await _IDAO_Ubicacion.ObtenerUbicacionesByTipoZonaAndTipoUbicacion(idTipoUbicacion, idTipoZona);
            if (locations != null)
            {
                if (locations.Count > 0)
                {
                    listLocation = locations;
                }
            }

            return listLocation;

        }

        [Route("api/UbicacionesConsumo")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_67_VisualizacionDevolucionesMMPPSmile,
                      Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_68_VisualizacionDevolucionesMMPPSmileTerminal)]
        public async Task<IHttpActionResult> UbicacionesConsumo([FromUri] string linea)
        {
            var result = await _IDAO_Ubicacion.UbicacionesConsumo(linea);

            return Ok(result);
        }
    }
}