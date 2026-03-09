using Common.Models;
using Common.Models.TAG;
using MSM.BBDD.TAG;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.TAG
{
    [Authorize]
    public class TagController : ApiController
    {
         private readonly IDAO_Tag _IDAO_Tag;
         
         public TagController(IDAO_Tag DAOTag)
         {
            _IDAO_Tag = DAOTag;           
         }

         [Route("api/GetEquipmentCounterTags/{idUbicacion}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones, Funciones.ALM_PROD_DAT_2_VisualizacionUbicaciones)]
         public async Task<List<TagDto>> GetEquipmentCounterTags(int idUbicacion)
         {
             List<TagDto> tagsList = new List<TagDto>();
             try
             {
                 tagsList = await _IDAO_Tag.GetEquipmentCounterTags(idUbicacion);
             }
             catch (Exception e)
             {
                 var mensaje = e.Message;
             }

             return tagsList;
         }
    }
}