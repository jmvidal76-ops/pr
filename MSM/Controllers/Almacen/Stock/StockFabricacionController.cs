using Common.Models.Almacen.ControlStock;
using MSM.BBDD.Almacen.ControlStockFabricacion;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad.Operations;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Fabricacion.Api;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen
{
    [Authorize]
    public class StockFabricacionController : ApiController
    {
        private readonly IDAO_ControlStockFabricacion _IDAO_ControlStock;
        private readonly IDAO_Operations _IDAO_Operacion;
        CultureInfo _culture = new CultureInfo("fr-CA");

        public StockFabricacionController(IDAO_ControlStockFabricacion IDAO_ControlStock, IDAO_Operations IDAO_Operacion)
        {
            _IDAO_ControlStock = IDAO_ControlStock;
            _IDAO_Operacion = IDAO_Operacion;
        }
       

        [Route("api/ObtenerStockFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ALM_PROD_DAT_3_VisualizacionControlStockFabricacion,
            Funciones.FAB_PROD_EXE_13_VisualizacionControlStockMMPP, Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP)]
        public async Task<List<DTO_Stock>> ObtenerStock()
        {
            List<DTO_Stock> _listStock = new List<DTO_Stock>();
            var _result = await _IDAO_ControlStock.Get();
            if (_result != null) _listStock = _result;
            return _listStock;
        }

        [Route("api/ObtenerStockLoteSemielaborado")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_10_VisualizacionLoteSemielaborado, Funciones.FAB_PROD_EXE_10_GestionLoteSemielaborado)]
        public async Task<List<DTO_LoteSemielaborado>> ObtenerStockLoteSemielaborado()
        {
            List<DTO_LoteSemielaborado> _listStock = new List<DTO_LoteSemielaborado>();
            var _result = await _IDAO_ControlStock.GetLoteSemielaborado();
            if (_result != null) _listStock = _result;
            return _listStock;
        }

        [Route("api/ActualizarLoteSemielaborado")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_10_GestionLoteSemielaborado)]
        public async Task<IHttpActionResult> ActualizarStockLoteSemielaborado(DTO_LoteSemielaborado lote)
        {
            DTO_LoteSemielaborado _listStock = new DTO_LoteSemielaborado();
            try
            {
                var _result = await _IDAO_ControlStock.ActualizarLoteSemielaborado(lote);
                if (_result != null) _listStock = _result;
            }
            catch(Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockFabricacionController.ActualizarStockLoteSemielaborado", "WEB-FABRICACION", "Sistema");
            }
            
            return Ok(_listStock);
        }

        [Route("api/AgregarLoteSemielaborado")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_10_GestionLoteSemielaborado)]
        public async Task<DTO_LoteSemielaborado> AgregarStockLoteSemielaborado(DTO_LoteSemielaborado lote)
        {
            DTO_LoteSemielaborado _listStock = new DTO_LoteSemielaborado();
            var _result = await _IDAO_ControlStock.AgregarLoteSemielaborado(lote);
            if (_result != null) _listStock = _result;
            return _listStock;
        }

        [Route("api/EliminarLoteSemielaborado/{idLote}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_10_GestionLoteSemielaborado)]
        public async Task<int> EliminarLoteSemielaborado([FromUri] int idLote)
        {
            idLote = await _IDAO_ControlStock.EliminarLoteSemielaborado(idLote);
            if(idLote != 0)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "StockFabricacionController.EliminarLoteSemielaborado","Se ha eliminado el lote de semielaborado "+idLote, HttpContext.Current.User.Identity.Name);
            }
            return idLote;
        }

        [Route("api/EliminarLoteSemielaboradoConsumido/{idLote}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_11_GestionLoteSemielaboradoConsumido)]
        public async Task<int> EliminarLoteSemielaboradoConsumido([FromUri] int idLote)
        {
            idLote = await _IDAO_ControlStock.EliminarLoteSemielaboradoConsumido(idLote);
            if (idLote != 0)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "StockFabricacionController.EliminarLoteSemielaboradoConsumido", "Se ha eliminado el lote semielaborado consumido " + idLote, HttpContext.Current.User.Identity.Name);
            }
            return idLote;
        }

        [Route("api/ObtenerStockLoteSemielaboradoConsumido")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_11_VisualizacionLoteSemielaboradoConsumido, Funciones.FAB_PROD_EXE_11_GestionLoteSemielaboradoConsumido)]
        public async Task<List<DTO_LoteSemielaborado>> ObtenerStockLoteSemielaboradoConsumido(DTO_Stock _filters)
        {
            List<DTO_LoteSemielaborado> _listStock = new List<DTO_LoteSemielaborado>();
            
            var _result = await _IDAO_ControlStock.GetLoteSemielaboradoConsumido(_filters);
            if (_result != null) _listStock = _result;
            
            return _listStock;
        }

        [Route("api/ActualizarLoteSemielaboradoConsumido")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_11_GestionLoteSemielaboradoConsumido)]
        public async Task<DTO_LoteSemielaborado> ActualizarLoteSemielaboradoConsumido(DTO_LoteSemielaborado lote)
        {
            DTO_LoteSemielaborado _listStock = new DTO_LoteSemielaborado();
            var _result = await _IDAO_ControlStock.ActualizarLoteSemielaboradoConsumido(lote);
            if (_result != null) _listStock = _result;
            return _listStock;
        }

        [Route("api/ObtenerStockFabricacionConsumidos")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_VisualizacionControlStockProductoAcabadoFabricacion, Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion, 
            Funciones.FAB_PROD_EXE_14_VisualizacionLotesConsumidosMMPP, Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP)]
        public async Task<List<DTO_Stock>> ObtenerStockConsumidos(DTO_Stock _filters)
        {
            List<DTO_Stock> _listStock = new List<DTO_Stock>();
            
            var _result = await _IDAO_ControlStock.GetConsumidos(_filters);
            if (_result != null) _listStock = _result;
            
            return _listStock;
        }

        [Route("api/ActualizarStockFabricacionConsumidos")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion, Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP)]
        public async Task<DTO_Stock> ActualizarStockFabricacionConsumidos(DTO_Stock lote)
        {
            var _result = await _IDAO_ControlStock.ActualizarLotesFabricacionConsumidos(lote);

            return _result;
        }

        [Route("api/EliminarLoteMMPPFabricacionConsumidos/{idLote}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion, Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP)]
        public async Task<int> EliminarLoteMMPPFabricacionConsumidos([FromUri] int idLote)
        {
            var _result = await _IDAO_ControlStock.EliminarLoteMMPPConsumido(idLote);
            if (_result != 0)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "StockFabricacionController.EliminarLoteMMPPFabricacionConsumidos", "Se ha eliminado el Lote MMPP Consumido " + idLote, HttpContext.Current.User.Identity.Name);
            }
            return _result;
        }

        [Route("api/ObtenerStockFabricacionConsumidosAgrupado")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_VisualizacionControlStockProductoAcabadoFabricacion, Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion,
            Funciones.FAB_PROD_EXE_14_VisualizacionLotesConsumidosMMPP, Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP)]
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

        [Route("api/ObtenerAvisosStockMMPPFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_STK_1_GestionAvisosStockMMPPFabricacion, Funciones.FAB_PROD_STK_1_VisualizacionAvisosStockMMPPFabricacion,
            Funciones.ALM_PROD_DAT_9_GestionAvisosStockMMPPFabricacion, Funciones.ALM_PROD_DAT_9_VisualizacionAvisosStockMMPPFabricacion)]
        public async Task<IHttpActionResult> ObtenerAvisosStockMMPPFabricacion()
        {
            try
            {
                var result = await _IDAO_ControlStock.ObtenerAvisosStockMMPPFabricacion();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockFabricacionController.ObtenerAvisosStockMMPPFabricacion", "WEB-STOCK-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_AVISOS_STOCK_MMPP"));
            }
        }

        [Route("api/AgregarAvisoStockMMPPFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_STK_1_GestionAvisosStockMMPPFabricacion, Funciones.ALM_PROD_DAT_9_GestionAvisosStockMMPPFabricacion)]
        public async Task<AvisoStockMMPPFabricacionDto> AgregarAvisoStockMMPPFabricacion(AvisoStockMMPPFabricacionDto aviso)
        {
            try
            {
                AvisoStockMMPPFabricacionDto avisoDto = new AvisoStockMMPPFabricacionDto();

                aviso.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
                aviso.ActualizadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
                var _result = await _IDAO_ControlStock.AgregarAvisoStockMMPPFabricacion(aviso);
                if (_result != null) avisoDto = _result;
                return avisoDto;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockFabricacionController.AgregarAvisoStockMMPPFabricacion", "WEB-STOCK-FABRICACION", HttpContext.Current.User.Identity.Name);
                
                // Registro repetido
                if (ex.Message.Contains("406"))
                {
                    return null;
                }

                throw ex;
            }
        }

        [Route("api/ModificarAvisoStockMMPPFabricacion")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_STK_1_GestionAvisosStockMMPPFabricacion, Funciones.ALM_PROD_DAT_9_GestionAvisosStockMMPPFabricacion)]
        public async Task<AvisoStockMMPPFabricacionDto> ModificarAvisoStockMMPPFabricacion(AvisoStockMMPPFabricacionDto aviso)
        {
            try
            {
                AvisoStockMMPPFabricacionDto avisoDto = new AvisoStockMMPPFabricacionDto();

                aviso.ActualizadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
                var _result = await _IDAO_ControlStock.ModificarAvisoStockMMPPFabricacion(aviso);
                if (_result != null) avisoDto = _result;
                return avisoDto;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "StockFabricacionController.ModificarAvisoStockMMPPFabricacion", "WEB-STOCK-FABRICACION", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/EliminarAvisoStockMMPPFabricacion/{idAviso}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_STK_1_GestionAvisosStockMMPPFabricacion, Funciones.ALM_PROD_DAT_9_GestionAvisosStockMMPPFabricacion)]
        public async Task<int> EliminarAvisoStockMMPPFabricacion([FromUri] int idAviso)
        {
            idAviso = await _IDAO_ControlStock.EliminarAvisoStockMMPPFabricacion(idAviso);
            if (idAviso == 0)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_ELIMINAR_AVISO_STOCK_MMPP"), 
                    "StockFabricacionController.EliminarAvisoStockMMPPFabricacion", "WEB-STOCK-FABRICACION", HttpContext.Current.User.Identity.Name);
            }
            else 
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "StockFabricacionController.EliminarAvisoStockMMPPFabricacion", 
                    IdiomaController.GetResourceName("SE_HA_ELIMINADO_AVISO_STOCK_MMPP") + idAviso, HttpContext.Current.User.Identity.Name);
            }

            return idAviso;
        }
    }
}