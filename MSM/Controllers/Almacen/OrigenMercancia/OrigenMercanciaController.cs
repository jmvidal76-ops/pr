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

namespace MSM.Controllers.Almacen.OrigenMercancia
{
    

    [Authorize]
    public class OrigenMercanciaController : ApiController
    {
        private readonly IDAO_OrigenMercancia _iDAO_OrigenMercancia;

         public OrigenMercanciaController(IDAO_OrigenMercancia iDAO_OrigenMercancia)
                    {
                        _iDAO_OrigenMercancia = iDAO_OrigenMercancia;
                    }

         /// <summary>
         /// Metodo que obtiene la lista de los OrigenMercanciaes
         /// </summary>
         /// <returns></returns>
         [Route("api/GetOrigenMercancia")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<OrigenMercanciaDto>> GetOrigenMercancia()
         {
             List<OrigenMercanciaDto> _result = new List<OrigenMercanciaDto>();
             List<OrigenMercanciaDto> listOrigenMercancia = await _iDAO_OrigenMercancia.Get();

             if (listOrigenMercancia.Count > 0)
             {

                 _result = listOrigenMercancia;
             }

             return _result;
         }


         [Route("api/AddOrigin")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<OrigenMercanciaDto> AddOrigin(OrigenMercanciaDto origenMercancia)
         {
            try { 
                origenMercancia.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
                OrigenMercanciaDto _result = await _iDAO_OrigenMercancia.Post(origenMercancia);
                 if (_result != null)
                 {
                     _result.IdCombo = _result.IdOrigenMercancia;
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
         [Route("api/GetDataAutoCompleteOrigenMercancia")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<IHttpActionResult> ObtenerDataAutoComplete(string nombre = null)
         {
            List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
            try
             {
                 List<OrigenMercanciaDto> origenMercancia = await _iDAO_OrigenMercancia.GetWithName(nombre);
                if (origenMercancia != null)
                {
                    foreach (var item in origenMercancia)
                    {
                        var claveValor = new DTO_ClaveValorInfo()
                        {
                            Id = item.IdOrigenMercancia,
                            Valor = item.Descripcion,
                        };

                        listaClaveValor.Add(claveValor);
                    }
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