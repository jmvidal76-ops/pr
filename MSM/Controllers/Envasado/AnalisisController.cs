using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Security;
using System;
using System.Linq;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{

    [Authorize]
    public class AnalisisController : ApiController
    {

        [Route("api/analisisSPI/obtenerComentario")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_DIS_3_VisualizacionAnalisisSPI)]
        public string ObtenerComentario(dynamic datos)
        {
            try
            {
                DAO_AnalisisSPI daoAnalisisSPI = new DAO_AnalisisSPI();
                return daoAnalisisSPI.ObtenerComentario(datos);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [Route("api/analisisSPI/insertarComentario")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_DIS_1_GestionAnalisisSPI)]
        public bool InsertarComentario(AnalisisSPI analisis)
        {
            try
            {
                DAO_AnalisisSPI daoAnalisisSPI = new DAO_AnalisisSPI();
                return daoAnalisisSPI.InsertarComentario(analisis);
            }
            catch (Exception ex)
            {
                throw ex;
            }   
        }

        [Route("api/analisisSPI/eliminarComentario")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_DIS_1_GestionAnalisisSPI)]
        public bool EliminarComentario(AnalisisSPI analisis)
        {
            try
            {
                DAO_AnalisisSPI daoAnalisisSPI = new DAO_AnalisisSPI();
                return daoAnalisisSPI.EliminarComentario(analisis);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
