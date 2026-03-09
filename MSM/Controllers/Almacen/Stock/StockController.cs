using Common.Models.Almacen.ControlStock;
using Common.Models.Lote;
using Common.Models.Operation;
using Common.Models.Sample;
using Common.Models.Trazabilidad.Genealogia;
using MSM.BBDD.Almacen.ControlStock;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad.Operations;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Security;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen
{
    [Authorize]
    public class StockController : ApiController
    {
        private readonly IDAO_ControlStock _IDAO_ControlStock;
        private readonly IDAO_Operations _IDAO_Operacion;
        CultureInfo _culture = new CultureInfo("fr-CA");

        public StockController(IDAO_ControlStock IDAO_ControlStock, IDAO_Operations IDAO_Operacion)
        {
            _IDAO_ControlStock = IDAO_ControlStock;
            _IDAO_Operacion = IDAO_Operacion;
        }


        [Route("api/ObtenerStock")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_3_VisualizacionControlStock,
            Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP,
            Funciones.ENV_PROD_EXE_67_GestionDevolucionesMMPPSmile, Funciones.ENV_PROD_EXE_67_VisualizacionDevolucionesMMPPSmile,
            Funciones.ENV_PROD_EXE_68_GestionDevolucionesMMPPSmileTerminal, Funciones.ENV_PROD_EXE_68_VisualizacionDevolucionesMMPPSmileTerminal)]
        public async Task<List<DTO_Stock>> ObtenerStock()
        {
            List<DTO_Stock> _listStock = new List<DTO_Stock>();
            //if (_filters.FECHA_INICIO_CONSUMO != null)
            //    _filters.FECHA_INICIO_CONSUMO = DateTime.ParseExact(_filters.FECHA_INICIO_CONSUMO.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);
            //if (_filters.FECHA_FIN_CONSUMO != null)
            //    _filters.FECHA_FIN_CONSUMO = DateTime.ParseExact(_filters.FECHA_FIN_CONSUMO.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);
            //if (_filters.FECHA_INICIO_CADUCIDAD != null)
            //    _filters.FECHA_INICIO_CADUCIDAD = DateTime.ParseExact(_filters.FECHA_INICIO_CADUCIDAD.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);
            //if (_filters.FECHA_FIN_CADUCIDAD != null)
            //    _filters.FECHA_FIN_CADUCIDAD = DateTime.ParseExact(_filters.FECHA_FIN_CADUCIDAD.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);

            var _result = await _IDAO_ControlStock.Get();
            if (_result != null) _listStock = _result;
            return _listStock;
        }


        [Route("api/ObtenerStockConsumidos")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_7_VisualizacionControlStockConsumidos, Funciones.ALM_PROD_DAT_7_GestionControlStockConsumidos,
            Funciones.ENV_PROD_EXE_55_VisualizacionLotesConsumidosMMPP, Funciones.ENV_PROD_EXE_55_GestionLotesConsumidosMMPP)]
        public async Task<List<DTO_Stock>> ObtenerStockConsumidos(DTO_Stock _filters)
        {
            List<DTO_Stock> _listStock = new List<DTO_Stock>();

            var _result = await _IDAO_ControlStock.GetConsumidos(_filters);
            if (_result != null) _listStock = _result;

            return _listStock;
        }

        [Route("api/ObtenerStockConsumidosAgrupado")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_MMPP_PA_1_VisualizacionEnvasadoTrazabilidadDescendente, Funciones.TRA_MMPP_PA_1_GestionEnvasadoTrazabilidadDescendente,
            Funciones.TRA_PROD_FAB_1_VisualizacionTrazabilidadDescendente, Funciones.TRA_PROD_FAB_1_GestionTrazabilidadDescendente)]
        public async Task<List<DTO_Stock>> ObtenerStockConsumidosAgrupado(DTO_Stock _filters)
        {
            List<DTO_Stock> _listStock = new List<DTO_Stock>();
            if (_filters.FECHA_INICIO_CONSUMO != null)
                _filters.FECHA_INICIO_CONSUMO = DateTime.ParseExact(_filters.FECHA_INICIO_CONSUMO.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);
            if (_filters.FECHA_FIN_CONSUMO != null)
                _filters.FECHA_FIN_CONSUMO = DateTime.ParseExact(_filters.FECHA_FIN_CONSUMO.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);
            //if (_filters.FECHA_INICIO_CADUCIDAD != null)
            //    _filters.FECHA_INICIO_CADUCIDAD = DateTime.ParseExact(_filters.FECHA_INICIO_CADUCIDAD.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);
            //if (_filters.FECHA_FIN_CADUCIDAD != null)
            //    _filters.FECHA_FIN_CADUCIDAD = DateTime.ParseExact(_filters.FECHA_FIN_CADUCIDAD.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);

            var _result = await _IDAO_ControlStock.GetConsumidosAgrupado(_filters);
            if (_result != null) _listStock = _result;
            return _listStock;
        }

        [Route("api/AplicarOperacion")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_7_GestionControlStockConsumidos, Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,
            Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion, Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP,
            Funciones.ENV_PROD_EXE_55_GestionLotesConsumidosMMPP)]
        public async Task<string> AplicarOperacion(dynamic datos)
        {
            string result = string.Empty;
            try
            {
                string lotesString = datos.lotes.Value;

                List<OperacionLoteDto> lotes = JsonConvert.DeserializeObject<List<OperacionLoteDto>>(lotesString);
                string operacion = datos.operacion.Value;
                string valor = !string.IsNullOrEmpty(datos.valor.Value) ? datos.valor.Value.ToString() : null;

                string motivo = datos.motivo.Value;
                if (lotes != null)
                {
                    OperationDto _operation = new OperationDto();
                    _operation.LoteFabricacion = datos.LoteFabricacion;
                    foreach (var item in lotes)
                    {
                        switch (Convert.ToInt32(operacion))
                        {
                            case (int)OperacionesControlStockEnum.EditarLote:
                                _operation.IdLoteMateriaPrima = item.IdLoteMateriaPrima;
                                _operation.IdUbicacionDestino = datos.Ubicacion.IdUbicacion;
                                _operation.Cantidad = datos.CantidadActual * datos.UnidadesMedidaDto.Factor;
                                _operation.UnidadesMedida = datos.UnidadesMedidaDto.TargetUoMID;
                                _operation.IdTipoOperacion = (int)Common.Models.Sample.TipoOperacionEnum.EditarLote;
                                _operation.Location = datos.Ubicacion.IdUbicacionLinkMes;
                                _operation.SSCC = datos.SSCC;
                                _operation.FechaCaducidad = datos.FechaCaducidad != null ? Convert.ToDateTime(datos.FechaCaducidad) : null;
                                _operation.Proceso = datos.Proceso;
                                _operation.IdLote = item.IdLote;
                                _operation.IdMaterial = datos.IdMaterial;
                                _operation.FechaEntradaUbicacion = datos.FechaEntradaUbicacion != null ? Convert.ToDateTime(datos.FechaEntradaUbicacion) : null;
                                _operation.FechaEntrada = datos.FechaEntradaPlanta != null ? Convert.ToDateTime(datos.FechaEntradaPlanta) : null;
                                _operation.CantidadInicial = datos.CantidadInicial;
                                _operation.CantidadActual = datos.CantidadActual;
                                _operation.Proveedor = datos.Proveedor;
                                _operation.LoteProveedor = datos.LoteProveedor;
                                _operation.FechaInicioConsumo = datos.FechaInicioConsumo != null ? Convert.ToDateTime(datos.FechaInicioConsumo) : null;
                                _operation.FechaFinConsumo = datos.FechaFinConsumo != null ? Convert.ToDateTime(datos.FechaFinConsumo) : null;
                                _operation.FechaBloqueo = datos.FechaBloqueo != null ? Convert.ToDateTime(datos.FechaBloqueo) : null;
                                _operation.FechaCuarentena = datos.FechaCuarentena != null ? Convert.ToDateTime(datos.FechaCuarentena) : null;
                                _operation.Defectuoso = datos.Defectuoso != null ? Convert.ToDateTime(datos.Defectuoso) : null;
                                _operation.MotivoBloqueo = datos.MotivoBloqueo;
                                _operation.MotivoCuarentena = datos.MotivoCuarentena;

                                var _resEdicion = await _IDAO_Operacion.PostOperation(_operation);
                                result = _resEdicion != null ? "true" : null;
                                break;
                            case (int)OperacionesControlStockEnum.CambiarEstadoUbicacion:
                                var _result = await _IDAO_ControlStock.PutState(item.IdLote, valor);
                                if (valor != "1")
                                {
                                    _operation.MotivoBloqueo = valor;
                                    _operation.IdTipoOperacion = (int)Common.Models.Sample.TipoOperacionEnum.BloquearUbicacion;
                                    _operation.IdUbicacionOrigen = Convert.ToInt32(item.UbicacionOrigen);
                                    _operation.OperadorSistema = "WEB";
                                    var _resblock = await _IDAO_Operacion.PostOperation(_operation);
                                    result = _resblock != null ? "true" : null;
                                }
                                break;
                            case (int)OperacionesControlStockEnum.MoverLote:
                                if (item.UbicacionMES != null)
                                {
                                    _operation.IdLote = item.IdLote;
                                    _operation.IdTipoOperacion = (int)Common.Models.Sample.TipoOperacionEnum.MoverLote;
                                    _operation.Location = item.UbicacionMES;
                                    _operation.SSCC = item.IdLote.Split('-').Last();
                                    _operation.Factor = 1;
                                    _operation.IdUbicacionDestino = Convert.ToInt32(valor);
                                    _operation.OperadorSistema = "WEB";
                                    var _resMov = await _IDAO_Operacion.PostOperation(_operation);
                                    result = _resMov != null && (result == "true" || String.IsNullOrEmpty(result))
                                                    ? _resMov.ControlGestion01 == null ? "true" //SE MODIFICÓ CORRECTAMENTE
                                                    : _resMov.ControlGestion01 // SE OBTIENE UN ERROR AL MOVER EL LOTE
                                                : result;
                                }
                                break;
                            case (int)OperacionesControlStockEnum.EliminarLote:
                                _operation.IdLote = item.IdLote;
                                _operation.IdTipoOperacion = (int)Common.Models.Sample.TipoOperacionEnum.EliminarLote;
                                _operation.IdUbicacionOrigen = Convert.ToInt32(item.UbicacionOrigen);
                                
                                var _resEliminar = await _IDAO_Operacion.PostOperation(_operation);
                                if (_resEliminar != null) 
                                { 
                                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "StockController.AplicarOperacion", 
                                        IdiomaController.GetResourceName("LOTE_ELIMINADO_CORRECTAMENTE") + ": " + item.IdLote, HttpContext.Current.User.Identity.Name); 
                                }

                                result = _resEliminar != null ? "true" : null;
                                break;
                            case (int)OperacionesControlStockEnum.EditarPropiedadLote:
                                _operation.IdTipoOperacion = (int)Common.Models.Sample.TipoOperacionEnum.EditarPropiedadesLote;
                                _operation.PropiedadesLotes.ForEach(p => p.IdTipoMaterialMovimiento = _operation.LoteFabricacion ? (int)TipoMaterialMovimientoEnum.Fabricacion : (int)TipoMaterialMovimientoEnum.Envasado);
                                var _res = await _IDAO_Operacion.PostActualizarLotesConsumidos(_operation);
                                result = _res != null ? "true" : null;
                                break;
                            default:
                                _operation.IdLote = item.IdLote;
                                _operation.IdTipoOperacion = Convert.ToInt32(operacion) == (int)OperacionesControlStockEnum.AjustarCantidad ? (int)Common.Models.Sample.TipoOperacionEnum.AjustarLote : (int)Common.Models.Sample.TipoOperacionEnum.EditarLote;
                                _operation.Location = item.UbicacionMES;
                                _operation.SSCC = item.IdLote.Split('-').Last();
                                _operation.Factor = 1;
                                _operation.Proceso = datos.IdProceso;
                                //_operation.Defectuoso = _operation.PropiedadesExtendidasOriginal.Keys.ToArray()[0].ToLower().Contains("defectuoso") ? _operation.PropiedadesExtendidasOriginal.Values.ToArray()[0] : null;
                                _operation.Cantidad = Convert.ToInt32(operacion) == (int)OperacionesControlStockEnum.CrearLote ? Convert.ToInt32(valor) : (int?)null;
                                var _resOp = await _IDAO_Operacion.PostOperation(_operation);
                                result = _resOp != null ? "true" : null;
                                break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockController.AplicarOperacion", "WEB-ALMACEN", "Sistema");
                throw new Exception(ex.Message);
            }

            return result;
        }

        public async Task<bool> AjustarCantidadLote(OperationDto _operation)
        {
            var _resOp = await _IDAO_Operacion.PostOperation(_operation);
            return _resOp != null ? true : false;

        }

        [Route("api/ObtenerPropiedadesLote")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,
            Funciones.FAB_PROD_EXE_10_GestionLoteSemielaborado, Funciones.FAB_PROD_EXE_11_GestionLoteSemielaboradoConsumido,
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStock, Funciones.ALM_PROD_DAT_3_VisualizacionControlStockFabricacion,
            Funciones.FAB_PROD_EXE_10_VisualizacionLoteSemielaborado, Funciones.FAB_PROD_EXE_11_VisualizacionLoteSemielaboradoConsumido,
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStockProductoAcabadoFabricacion, Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion,
            Funciones.FAB_PROD_EXE_13_VisualizacionControlStockMMPP, Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_14_VisualizacionLotesConsumidosMMPP, Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP,
            Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
        public async Task<List<PropiedadLoteDto>> ObtenerPropiedadesLote([FromUri] int IdLote, [FromUri] int IdTipo)
        {
            List<PropiedadLoteDto> _result = await _IDAO_ControlStock.ObtenerPropiedadesLote(IdLote, IdTipo);

            return _result.Count() == 0 ? new List<PropiedadLoteDto>() : _result;

        }

        [Route("api/ActualizarPropiedadesLote")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_7_GestionControlStockConsumidos,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion,
            Funciones.FAB_PROD_EXE_10_GestionLoteSemielaborado, Funciones.FAB_PROD_EXE_11_GestionLoteSemielaboradoConsumido,
            Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.ENV_PROD_EXE_55_GestionLotesConsumidosMMPP)]
        public async Task<PropiedadLoteDto> ActualizarPropiedadesLote(PropiedadLoteDto propiedades)
        {
            PropiedadLoteDto _result = new PropiedadLoteDto();
            foreach (var item in propiedades.IdLoteSeleccionado)
            {
                propiedades.IdLote = item;
                _result = await _IDAO_ControlStock.ActualizarPropiedadesLote(propiedades);
            }

            return _result;
        }

        [Route("api/ObtenerProcesosLotes/{isFabricacion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,
            Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
        public async Task<List<ProcesoLoteDto>> ObtenerProcesosLotes(bool isFabricacion)
        {
            return await _IDAO_Operacion.ObtenerProcesosLotes(isFabricacion);

        }

        [Route("api/ObtenerProcesosLotes")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,
            Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
        public async Task<List<ProcesoLoteDto>> ObtenerProcesosLotes()
        {
            return await _IDAO_Operacion.ObtenerProcesosLotes();

        }

        [Route("api/ObtenerLotePorIdUbicacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion, Funciones.ENV_PROD_EXE_66_GestionVerQRsMMPPZonaTerminal,
                      Funciones.ENV_PROD_EXE_66_VisualizacionVerQRsMMPPZonaTerminal)]
        public async Task<List<LoteDto>> ObtenerLotePorIdUbicacion([FromUri] int idUbicacion, [FromUri] DateTime fechaInicio, [FromUri] DateTime fechaFin, [FromUri] bool soloLotesNoConsumidos = false)
        {
            return await _IDAO_ControlStock.ObtenerLotesPorIdUbicacion(idUbicacion, fechaInicio, fechaFin, soloLotesNoConsumidos);
        }

        [Route("api/ObtenerLotesMateriaPrimaPorIdUbicacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_ENV_PA_2_GestionContingenciaMMPPEnvasado, Funciones.CEL_7_GestionLanzarMuestraLIMSLlenadoraCELTerminal,
                      Funciones.CEL_8_VisualizacionLanzarMuestraLIMSLlenadoraCELTerminal)]
        public async Task<List<DTO_LoteMMPP>> ObtenerLotesMateriaPrimaPorIdUbicacion([FromUri] int idUbicacion)
        {
            return await _IDAO_ControlStock.ObtenerLotesMateriaPrimaPorIdUbicacion(idUbicacion);

        }

        [Route("api/ActualizarLoteMateriaPrimaEnvasado")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_ENV_PA_2_GestionContingenciaMMPPEnvasado)]
        public async Task<IHttpActionResult> ActualizarLoteMateriaPrimaEnvasado([FromBody] DTO_LoteMMPP LoteMMPP)
        {
            try
            {
                var _result = await _IDAO_ControlStock.ActualizarLoteMateriaPrimaEnvasado(LoteMMPP);
                if (!_result)
                {
                    return BadRequest("Error al actualizar lote MMPP: " + LoteMMPP.ID_LOTE_MMPP);
                }

                return Ok(_result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockController.ActualizarLoteMateriaPrimaEnvasado", "WEB-TRAZABILIDAD", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/ObtenerLoteMateriaPrima")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_7_GestionLanzarMuestraLIMSLlenadoraCELTerminal, Funciones.CEL_8_VisualizacionLanzarMuestraLIMSLlenadoraCELTerminal)]
        public async Task<IHttpActionResult> ObtenerLoteMateriaPrima(string idLote)
        {
            try
            {
                var _result = await _IDAO_ControlStock.ObtenerLoteMateriaPrima(idLote);
                if (_result == null)
                {
                    return BadRequest("Error al obtener lote materia prima: ");
                }

                return Ok(_result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockController.ObtenerLoteMateriaPrima", "WEB-TRAZABILIDAD", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CrearLoteMateriaPrima")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_7_GestionLanzarMuestraLIMSLlenadoraCELTerminal)]
        public async Task<IHttpActionResult> CrearLoteMateriaPrima([FromBody] DTO_LoteMateriaPrima Lote)
        {
            try
            {
                var _result = await _IDAO_ControlStock.CrearLoteMateriaPrima(Lote);
                if (!_result)
                {
                    return BadRequest("Error al crear lote MMPP: ");
                }

                return Ok(_result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockController.CrearLoteMateriaPrima", "WEB-TRAZABILIDAD", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/ObtenerLotesAsociadosAlbaran")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
        public async Task<List<LoteDto>> ObtenerLotesAsociadosAlbaran([FromUri] int idAlbaran)
        {
            return await _IDAO_ControlStock.ObtenerLotesAsociadosAlbaran(idAlbaran);

        }

        [Route("api/AgregarLotesAsociadosAlbaran")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
        public async Task<LoteDto> AgregarLotesAsociadosAlbaran(LoteDto lote)
        {
            lote.IdTipoMaterialMovimiento = (int)TipoMaterialMovimientoEnum.Envasado;
            lote.FechaCreacion = DateTime.UtcNow;
            return await _IDAO_ControlStock.AgregarLoteAlbaran(lote);
        }

        [Route("api/ActualizarLotesAsociadosAlbaran")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
        public async Task<LoteDto> ActualizarLotesAsociadosAlbaran(LoteDto lote)
        {
            lote.IdTipoMaterialMovimiento = (int)TipoMaterialMovimientoEnum.Envasado;
            return await _IDAO_ControlStock.ActualizarLoteAlbaran(lote);
        }

        [Route("api/EliminarLotesAsociadosAlbaran")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
        public async Task<bool> EliminarLotesAsociadosAlbaran(LoteDto lote)
        {
            await _IDAO_ControlStock.DesasociarLoteAlbaran(lote);
            return true;
        }

        [Route("api/EstadoFicherosAdjuntos/{id}", Name = "GetEstadoFicherosAdjuntos")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_3_VisualizacionControlStock,
            Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP,
            Funciones.ALM_PROD_DAT_7_VisualizacionControlStockConsumidos, Funciones.ALM_PROD_DAT_7_GestionControlStockConsumidos,
            Funciones.ENV_PROD_EXE_55_VisualizacionLotesConsumidosMMPP, Funciones.ENV_PROD_EXE_55_GestionLotesConsumidosMMPP,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ALM_PROD_DAT_3_VisualizacionControlStockFabricacion,
            Funciones.FAB_PROD_EXE_13_VisualizacionControlStockMMPP, Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_10_VisualizacionLoteSemielaborado, Funciones.FAB_PROD_EXE_10_GestionLoteSemielaborado,
            Funciones.FAB_PROD_EXE_11_VisualizacionLoteSemielaboradoConsumido, Funciones.FAB_PROD_EXE_11_GestionLoteSemielaboradoConsumido,
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStockProductoAcabadoFabricacion, Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion,
            Funciones.FAB_PROD_EXE_14_VisualizacionLotesConsumidosMMPP, Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP)]
        public async Task<bool> GetEstadoFicherosAdjuntos([FromUri] int id, int tipoLote)
        {
            var result = await _IDAO_ControlStock.GetEstadoFicherosAdjuntos(id, tipoLote);
            return result;
        }

        [Route("api/ControlStock/FicherosAdjuntos")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP,
            Funciones.ALM_PROD_DAT_7_GestionControlStockConsumidos,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,
            Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP,
            Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion)]
        public async Task<IHttpActionResult> ActualizarFicherosAdjuntosLote([FromBody] DTO_FicherosAdjuntosLote datos)
        {
            try
            {
                datos.User = HttpContext.Current?.User?.Identity?.Name;
                var _result = await _IDAO_ControlStock.ActualizarFicherosAdjuntosLote(datos);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockController.ActualizarFicherosAdjuntosLote", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/ControlStock/FicherosAdjuntos")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_VisualizacionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP,
            Funciones.ALM_PROD_DAT_7_VisualizacionControlStockConsumidos,
            Funciones.ALM_PROD_DAT_7_GestionControlStockConsumidos,
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStockFabricacion,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,
            Funciones.FAB_PROD_EXE_13_VisualizacionControlStockMMPP,
            Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_14_VisualizacionLotesConsumidosMMPP,
            Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP,
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStockProductoAcabadoFabricacion,
            Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion)]
        public async Task<IHttpActionResult> ObtenerFicherosAdjuntosLote([FromUri] int idLote, int tipoLote)
        {
            try
            {
                var datos = new DTO_FicherosAdjuntosLote
                {
                    IdLote = idLote,
                    TipoLote = tipoLote
                };
                var _result = await _IDAO_ControlStock.ObtenerFicherosAdjuntosLote(datos);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockController.ObtenerFicherosAdjuntosLote", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/ControlStock/NotasLote")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_VisualizacionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP,
            Funciones.ALM_PROD_DAT_7_VisualizacionControlStockConsumidos,
            Funciones.ALM_PROD_DAT_7_GestionControlStockConsumidos,
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStockFabricacion,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,
            Funciones.FAB_PROD_EXE_13_VisualizacionControlStockMMPP,
            Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_14_VisualizacionLotesConsumidosMMPP,
            Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP,
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStockProductoAcabadoFabricacion,
            Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion)]
        public async Task<IHttpActionResult> EditarNotasLote([FromUri] int idLote, [FromUri] string notas, [FromUri] int tipoLote)
        {
            try
            {

                var _result = await _IDAO_ControlStock.EditarNotasLote(idLote, notas, tipoLote);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                if (!_result.Data)
                {
                    return BadRequest();
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockController.ObtenerFicherosAdjuntosLote", "WEB-FABRICACION", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/controlStock/obtenerTCPOrigen/{ubicacion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_VisualizacionControlStock,
            Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
        public async Task<IHttpActionResult> ObtenerTCPOrigen(string ubicacion)
        {
            try
            {
                var _result = await _IDAO_ControlStock.ObtenerTCPOrigen(ubicacion);
                return Ok(_result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockController.ObtenerTCPOrigen", "WEB-TRAZABILIDAD", HttpContext.Current?.User?.Identity?.Name);
                return BadRequest();
            }
        }

        [Route("api/LoteCervezaLlenadora")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
        public async Task<IHttpActionResult> CrearLoteCervezaLlenadora(dynamic datos)
        {
            try
            {
                var _result = await _IDAO_ControlStock.CrearLoteCervezaLlenadora(datos);
                return Ok(_result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockController.CrearLoteCervezaLlenadora", "WEB-TRAZABILIDAD", HttpContext.Current?.User?.Identity?.Name);
                return BadRequest();
            }
        }

    }
}