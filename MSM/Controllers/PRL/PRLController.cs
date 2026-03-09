using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.PRL;
using MSM.Controllers.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.PRL
{
    [Authorize]
    public class PRLController: ApiController
    {
        [Route("api/FechaAccidente_Read/{linea}")]
        [HttpGet]
        [AllowAnonymous]
        public DateTime ObtenerFechaUltimoAccidente(string linea)
        {
            return DAO_PRL.ObtenerFechaUltimoAccidente(linea);
        }

        [Route("api/FechaAccidente_Update")]
        [HttpPost]
        [ApiAuthorize(Funciones.PRL_3_FechaUltimoAccidente)]
        public bool GuardarFechaUltimoAccidente(ParametrosPRL parametro)
        {
            var correcto = DAO_PRL.GuardarFechaUltimoAccidente(parametro);

            if (correcto) 
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "PRLController.GuardarFechaUltimoAccidente", "Guardar " + parametro.Parametro + ": " + parametro.Valor, HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }

        [Route("api/AvisoEvacuacion_Read")]
        [HttpGet]
        [AllowAnonymous]
        public bool HayAvisoEvacuacion()
        {
            return DAO_PRL.HayAvisoEvacuacion();
        }

        [Route("api/AvisoEvacuacion_Update")]
        [HttpPost]
        [ApiAuthorize(Funciones.PRL_4_AvisoEvacuacion)]
        public bool ActivarAvisoEvacuacion(ParametrosPRL parametro)
        {
            var correcto = DAO_PRL.ActivarAvisoEvacuacion(parametro);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "PRLController.ActivarAvisoEvacuacion", IdiomaController.GetResourceName("AVISO_EVACUACION") + ": " + parametro.Valor, HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }
    }
}