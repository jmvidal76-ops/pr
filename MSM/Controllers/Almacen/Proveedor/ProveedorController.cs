using Common.Models.Almacen.DTO_MaestroEAN;
using Common.Models.Transportes;
using Common.Models.Almacen.Proveedor;
using MSM.BBDD.Trazabilidad.Transporte;
using MSM.Models.Trazabilidad;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using MSM.BBDD.Almacen.Proveedor;
using MSM.BBDD.Planta;
using MSM.Mappers.DTO;
using Common.Models.Transporte;

namespace MSM.Controllers.Almacen.Proveedor
{
    public enum TipoOrigenEnum
    {
        ClienteProveedor
    }

    [Authorize]
    public class ProveedorController : ApiController
    {
        private readonly BBDD.Trazabilidad.Transporte.IDAO_Proveedor _iDAO_Proveedor;
        private readonly BBDD.Almacen.Proveedor.IDAO_Proveedor _IDAO_ProveedorEAN;

        public ProveedorController(BBDD.Trazabilidad.Transporte.IDAO_Proveedor iDAO_Proveedor, BBDD.Almacen.Proveedor.IDAO_Proveedor IDAO_ProveedorEAN)
                    {
                        _iDAO_Proveedor = iDAO_Proveedor;
                        _IDAO_ProveedorEAN = IDAO_ProveedorEAN;
                    }

        /// <summary>
        /// Metodo que obtiene la lista Maestro de Proveedores
        /// </summary>
        /// <returns></returns>
        [Route("api/GetMaestroProveedor")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
        public async Task<List<ProveedorDto>> GetMaestroProveedor()
        {
            List<ProveedorDto> _result = new List<ProveedorDto>();
            List<ProveedorDto> listProveedor = await _iDAO_Proveedor.GetMaestroProveedores();

            if (listProveedor.Count > 0)
            {
                _result = listProveedor;
            }

            return _result;
        }

        /// <summary>
        /// Metodo que obtiene la lista de los Proveedores
        /// </summary>
        /// <returns></returns>
        [Route("api/GetProveedor")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
        public async Task<List<ProveedorDto>> GetProveedor()
        {
            List<ProveedorDto> _result = new List<ProveedorDto>();
            List<ProveedorDto> listProveedor = await _iDAO_Proveedor.Get();

            if (listProveedor.Count > 0)
            {

                _result = listProveedor;
            }

            return _result;
        }

        [Route("api/GetProveedorEAN")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_5_GestionLotesSinCodigoJDE)]
         public async Task<List<Common.Models.Almacen.Proveedor.ProveedorEANDto>> GetProveedorEAN()
         {
             List<Common.Models.Almacen.Proveedor.ProveedorEANDto> _result = new List<Common.Models.Almacen.Proveedor.ProveedorEANDto>();
             try
             {
                 List<Common.Models.Almacen.Proveedor.ProveedorEANDto> listProveedor = await _IDAO_ProveedorEAN.Get();

                 if (listProveedor.Count > 0)
                 {

                     _result = listProveedor;
                 }

                 
             }
             catch (Exception e) { 
             
             }
             return _result;
         }

        [Route("api/GetMaestroProveedorLoteMMPP")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.ALM_PROD_DAT_3_VisualizacionControlStockFabricacion,
            Funciones.ALM_PROD_DAT_2_VisualizacionCodigoJDE, Funciones.ALM_PROD_DAT_1_GestionCodigoJDE, Funciones.FAB_PROD_EXE_13_VisualizacionControlStockMMPP, 
            Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<List<ProveedorDto>> GetMaestroProveedorLoteMMPP()
        {
            List<ProveedorDto> _result = new List<ProveedorDto>();
            try
            {
                List<ProveedorDto> listProveedor = await _iDAO_Proveedor.GetMaestroProveedoresLoteMMPP();

                if (listProveedor.Count > 0)
                {
                    _result = listProveedor;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, "Error al obtener el maestro de proveedor de lotes de MMPP: " + ex.Message + " -> " + ex.StackTrace,
                    "ProveedorController.GetMaestroProveedorLoteMMPP", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
            }
            return _result;
        }


        /// <summary>
        /// Metodo que obtiene la data para los combos de autocomplete según el tipo
        /// </summary>
        /// <param name="tipo">Tipo de autocomplete</param>
        /// <returns>List DataAutoComplete</returns>
        [Route("api/GetDataAutoCompleteProveedor")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
        public async Task<IHttpActionResult> ObtenerDataAutoCompleteProveedor(string nombre = null)
        {
        List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
        try
        {                
            List<ProveedorDto> proveedores = await _iDAO_Proveedor.Get();
            foreach (var item in proveedores)
            {
                var claveValor = new DTO_ClaveValorInfo()
                {
                    Id = item.IdProveedor,
                    Valor = item.Nombre,
                    Info = new string[] { item.Codigo, item.IdMaestroOrigen.ToString(), item.NIF, item.Direccion, item.CodigoPostal, item.Poblacion}                    
                };

                listaClaveValor.Add(claveValor);
            }      

        }
        catch (Exception e)
        {
            var mensaje = e.Message;
        }

        return Json(listaClaveValor);
        }

         [Route("api/AddProvider")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<ProveedorDto> AddProvider(ProveedorDto proveedor)
         {
            try
            {
                proveedor.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";

                if (!String.IsNullOrEmpty(proveedor.Nombre))
                {
                    ProveedorDto _result = await _iDAO_Proveedor.Post(proveedor);
                    if (_result != null)
                    {
                        _result.IdCombo = _result.IdProveedor;
                        return _result;
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                // Registro repetido
                if (ex.Message.Contains("406"))
                {
                    return null;
                }

                throw ex;
            }
        }

         [Route("api/AddProveedorEAN")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCodigoJDE, Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, 
            Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP, 
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
         public async Task<Common.Models.Almacen.Proveedor.ProveedorEANDto> AddProveedorEAN(Common.Models.Transportes.ProveedorEANDto proveedor)
         {
             if (!String.IsNullOrEmpty(proveedor.Nombre) && proveedor.IdProveedor != 0)
             {
                 List<Common.Models.Almacen.Proveedor.ProveedorEANDto> _listProveedores = await _IDAO_ProveedorEAN.Get();
                 string _nombreProveedor = proveedor.Nombre.Trim();

                 var _result = _listProveedores.Where(p => p.IdProveedor == proveedor.IdProveedor).FirstOrDefault();
                Common.Models.Almacen.Proveedor.ProveedorEANDto _proveedorDto = new Common.Models.Almacen.Proveedor.ProveedorEANDto()
                {
                    IdProveedor = proveedor.IdProveedor,
                    Nombre = proveedor.Nombre,
                    IdOrigen = proveedor.IdOrigen,
                    Creado = proveedor.Creado
                 };

                 //Si el proveedor no se encuentra se agrega
                 if (_result == null)
                 {
                     Common.Models.Almacen.Proveedor.ProveedorEANDto _proveedorCreated = await _IDAO_ProveedorEAN.Post(_proveedorDto);
                     return _proveedorCreated;
                 }
             }
             return null;
         }

         [Route("api/UpdateProveedorEAN")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCodigoJDE, Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, 
            Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
         public async Task<Common.Models.Almacen.Proveedor.ProveedorEANDto> UpdateProveedorEAN(Common.Models.Transportes.ProveedorEANDto proveedor)
         {
             if (!String.IsNullOrEmpty(proveedor.Nombre) && proveedor.IdProveedor != 0)
             {
                 List<Common.Models.Almacen.Proveedor.ProveedorEANDto> _listProveedores = await _IDAO_ProveedorEAN.Get();
                 var _result = _listProveedores.Where(p => p.IdProveedor == proveedor.IdProveedor).FirstOrDefault();
                 Common.Models.Almacen.Proveedor.ProveedorEANDto _proveedorDto = new Common.Models.Almacen.Proveedor.ProveedorEANDto()
                 {
                     IdProveedor = proveedor.IdProveedor,
                     Nombre = proveedor.Nombre,
                     IdOrigen = proveedor.IdOrigen,
                     Creado = proveedor.Creado
                 };

                 Common.Models.Almacen.Proveedor.ProveedorEANDto _proveedorUpdated = await _IDAO_ProveedorEAN.Put(_proveedorDto);
                 return _proveedorUpdated;
             }
             return null;

         }

    }
}