using Common.Models.Destinatario;
using Common.Models.Transportes;
using MSM.BBDD.Trazabilidad.Transporte;
using MSM.Models.Trazabilidad;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.Destinatario
{
    

    [Authorize]
    public class DestinatarioController : ApiController
    {
        private readonly IDAO_Destinatario _iDAO_Destinatario;

         public DestinatarioController(IDAO_Destinatario iDAO_Destinatario)
                    {
                        _iDAO_Destinatario = iDAO_Destinatario;
                    }

         /// <summary>
         /// Metodo que obtiene la lista de los Destinatarioes
         /// </summary>
         /// <returns></returns>
         [Route("api/GetDestinatario")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<DestinatarioDto>> GetDestinatario()
         {
             List<DestinatarioDto> _result = new List<DestinatarioDto>();
             List<DestinatarioDto> listDestinatario = await _iDAO_Destinatario.Get();

             if (listDestinatario.Count > 0)
             {
                 
                 _result = listDestinatario;
             }

             return _result;
         }

     

         [Route("api/AddAdressee")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<DestinatarioDto> AddRegistration(DestinatarioDto destinatario)
         {
            try { 
                destinatario.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
                DestinatarioDto _result = await _iDAO_Destinatario.Post(destinatario);

                 if (_result != null)
                     _result.IdCombo = _result.IdDestinatario;
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

    }
}