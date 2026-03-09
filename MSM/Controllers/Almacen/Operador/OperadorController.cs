using Common.Models.Operador;
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

namespace MSM.Controllers.Almacen.Operador
{
    

    [Authorize]
    public class OperadorController : ApiController
    {
        private readonly IDAO_Operador _iDAO_Operador;

         public OperadorController(IDAO_Operador iDAO_Operador)
                    {
                        _iDAO_Operador = iDAO_Operador;
                    }

         /// <summary>
         /// Metodo que obtiene la lista de los Operadores
         /// </summary>
         /// <returns></returns>
         [Route("api/GetOperador")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<OperadorDto>> GetOperador()
         {
             List<OperadorDto> _result = new List<OperadorDto>();
             List<OperadorDto> listOperador = await _iDAO_Operador.Get();

             if (listOperador.Count > 0)
             {
                 _result = listOperador;
             }

             return _result;
         }

         [Route("api/AddOperator")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<OperadorDto> AddOperator(OperadorDto operador)
         {
            operador.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
            try { 
                 if (!String.IsNullOrEmpty(operador.Nombre))
                 {
                     OperadorDto _result = await _iDAO_Operador.Post(operador);
                     if (_result != null)
                     {
                         _result.IdCombo = _result.IdOperador;
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



         /// <summary>
         /// Metodo que obtiene la data para los combos de autocomplete según el tipo
         /// </summary>
         /// <param name="tipo">Tipo de autocomplete</param>
         /// <returns>List DataAutoComplete</returns>
         [Route("api/GetDataAutoCompleteOperador")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<IHttpActionResult> ObtenerDataAutoComplete(string nombre = null)
         {
            List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
            try
             {
                 List<OperadorDto> operadores = nombre != null ? await _iDAO_Operador.GetWithName(nombre) : new List<OperadorDto>();
                 foreach (var item in operadores)
                 {
                    var claveValor = new DTO_ClaveValorInfo()
                    {
                        Id = item.IdOperador,
                        Valor = item.Nombre,
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