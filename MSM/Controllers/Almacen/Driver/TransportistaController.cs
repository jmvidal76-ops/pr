using Common.Models.Transportista;
using MSM.BBDD.Trazabilidad.Transportista;
using MSM.Mappers.DTO;
using MSM.Models.Trazabilidad;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.Driver
{
    public enum TipoOrigenEnum
    {
        Transportista
    }
    [Authorize]
    public class TransportistaController : ApiController
    {
        private readonly IDAO_Transportista _iDAO_Transportista;

        public TransportistaController(IDAO_Transportista iDAO_Transportista)
        {
            _iDAO_Transportista = iDAO_Transportista;
        }

         [Route("api/GetDataAutoCompleteTransportista")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<IHttpActionResult> GetValuesCombo(string nombre = null)
         {
             List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
             try
             {
                List<TransportistaDto> transportistas = await _iDAO_Transportista.GetWithName(nombre);

                if(transportistas != null)
                {
                    var transportistasNif = await _iDAO_Transportista.GetWithNIF(nombre);
                    if (transportistasNif != null)
                    {
                        transportistas.AddRange((IEnumerable<TransportistaDto>)transportistasNif);
                    }

                    foreach (var item in transportistas)
                    {
                        if (!String.IsNullOrEmpty(item.NIF))
                        {
                            var claveValor = new DTO_ClaveValorInfo()
                            {
                                Id = item.IdTransportista,
                                Valor = item.Nombre,
                                Info = new string[] { item.NIF, item.Direccion, item.Poblacion }
                            };
                            listaClaveValor.Add(claveValor);

                        }
                    }                         
                }
             }
             catch (Exception e)
             {
                 var mensaje = e.Message;
             }
             return Json(listaClaveValor.Distinct().ToList());
         }

        [Route("api/Transportista")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<IHttpActionResult> ObtenerTransportistas()
         {
            List<TransportistaDto> transportistas = new List<TransportistaDto>();
             try
             {
                transportistas = await _iDAO_Transportista.Get();

                transportistas = transportistas.FindAll(f => !String.IsNullOrEmpty(f.NIF)).Distinct().ToList();
             }
             catch (Exception e)
             {
                 var mensaje = e.Message;
             }
             return Json(transportistas);
         }

        [Route("api/AddDriver")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<TransportistaDto> AddDriver(TransportistaDto transportista)
        {
            if (ModelState.IsValid)
            {
                transportista.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
                try
                {
                    TransportistaDto _result = await _iDAO_Transportista.Post(transportista);
                    if (_result != null)
                    {
                        _result.IdCombo = _result.IdTransportista;
                    }
                    return _result;
                }
                catch (Exception ex) {
                    // Registro repetido
                    if (ex.Message.Contains("406"))
                    {
                        return null;
                    }

                    throw ex;
                }
            }
            return null;
        }
    }
}