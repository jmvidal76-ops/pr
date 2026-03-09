using Common.Models.Transportes;
using MSM.BBDD.Trazabilidad.Transporte;
using MSM.Mappers.DTO;
using MSM.Models.Trazabilidad;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.Producto
{
    public enum TipoOrigenEnum
    {
        Producto
    }

    [Authorize]
    public class ProductoController : ApiController
    {
        private readonly IDAO_Producto _iDAO_Producto;

         public ProductoController(IDAO_Producto iDAO_Producto)
                    {
                        _iDAO_Producto = iDAO_Producto;
                    }

         /// <summary>
         /// Metodo que obtiene la lista de los Productoes
         /// </summary>
         /// <returns></returns>
         [Route("api/GetProducto")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<ProductoDto>> GetProducto()
         {
             List<ProductoDto> _result = new List<ProductoDto>();
             List<ProductoDto> listProducto = await _iDAO_Producto.Get();

             if (listProducto.Count > 0)
             {

                 _result = listProducto;
             }

             return _result;
         }

         [Route("api/AddProduct")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<ProductoDto> AddProduct(ProductoDto producto, [FromUri] int? operacion = null)
         {
            try { 
                producto.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
                ProductoDto _result = await _iDAO_Producto.Post(producto, operacion);
                 if (_result != null) {
                     _result.IdCombo = _result.IdProducto;
                 }
                 return _result;
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

         /// <summary>
         /// Metodo que obtiene la data para los combos de autocomplete según el tipo
         /// </summary>
         /// <param name="tipo">Tipo de autocomplete</param>
         /// <returns>List DataAutoComplete</returns>
         [Route("api/GetDataAutoCompleteProducto")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<IHttpActionResult> ObtenerDataAutoCompleteProducto(string nombre = null)
         {
            List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
            try
            {
                List<ProductoDto> productos = await _iDAO_Producto.Get();
                foreach (var item in productos)
                {
                    var claveValor = new DTO_ClaveValorInfo()
                    {
                        Id = item.IdProducto,
                        Valor = item.Nombre,
                        Info = new string[] { item.Codigo, item.IdMaestroOrigen.ToString() }
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
        
         [Route("api/GetDataAutoCompleteProducto/{operacion}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<IHttpActionResult> ObtenerDataAutoCompleteProductoOperacion(int operacion, string nombre = null)
         {
            List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
            try
            {
                List<ProductoDto> productos = await _iDAO_Producto.GetPorOperacion(operacion);
                foreach (var item in productos)
                {
                    var claveValor = new DTO_ClaveValorInfo()
                    {
                        Id = item.IdProducto,
                        Valor = item.Nombre,
                        Info = new string[] { item.Codigo, item.IdMaestroOrigen.ToString() }
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

    }
}