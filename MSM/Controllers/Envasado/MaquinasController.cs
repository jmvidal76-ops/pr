using Common.Models.Envasado;
using MSM.BBDD.Envasado;
using MSM.Controllers.Planta;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    public class MaquinasController : ApiController
    {
        [Route("api/maquinas/{linea}")]
        [HttpGet]
        public IHttpActionResult ObtenerMaquinasPorLinea(string linea, [FromUri] string clases)
        {
            var daoMaquinas = new DAO_Maquinas();

            List<TipoEnumMaquinasClases> eClases = new List<TipoEnumMaquinasClases>();
            foreach (var c in clases.Split('_'))
            {
                eClases.Add(TipoEnumMaquinasClasesExtensions.GetEnumAbrev(c));
            }

            var lista = daoMaquinas.ObtenerMaquinasLineaCompleto(linea, eClases);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_MAQUINAS"));
        }
    }
}