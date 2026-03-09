using MSM.BBDD.Planta;
using System;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [AllowAnonymous]
    public class PantallaAlmacenController : ApiController
    {
        [Route("api/pantallaAlmacen/OEEFabrica")]
        [HttpGet]
        [AllowAnonymous]
        public IHttpActionResult ObtenerPantallaOEEFabrica(DateTime desde, DateTime hasta)
        {
            return Json(DAO_Planta.ObtenerOEEFabrica(desde, hasta));
        }
    }
}
