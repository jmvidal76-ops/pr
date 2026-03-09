using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.OData;
using MSM.BBDD.Model;
using MSM.Security;

namespace MSM.Controllers
{
    [Authorize]
    public class AccionesMejoraParosPerdidasMaquinasController : ODataController
    {

        MESEntities db = new BBDD.Model.MESEntities();


        [Queryable]
        //[Route("odata/AccionesMejoraParosPerdidasMaquinas")]
        [ApiAuthorize(
            Funciones.ENV_PROD_EXE_20_SíntesisDelTurno,
            Funciones.ENV_PROD_ANA_4_InformeDeTurno)]
        public List<ParosPerdidasPPAMaquinas> Get()
        {
            try
            {
                db.Configuration.ProxyCreationEnabled = false;

                return db.ParosPerdidasPPAMaquinas.OrderBy(p => p.NumLinea).ToList();
            }
            catch (Exception ex)
            {
                return null;
            }


            //foreach (var paro in paros)
            //{
            //    if (paro.Tipo.Equals("Perdida"))
            //        paro.Tipo = "Pérdida de producción";
            //}
         
            //return paros;
        }

    }
}