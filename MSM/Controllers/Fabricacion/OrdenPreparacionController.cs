using MSM.BBDD.Fabricacion;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{

    [Authorize]
    public class OrdenPreparacionController : ApiController
    {
        [Route("api/crearOrdenPrep")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_12_GestionPlantillasPrep)]
        public bool crearOrdenPreparacion(dynamic idPlantilla)
        {
            try
            {
                var daoOrdenPreparacion = new DAO_OrdenPreparacion();
                return daoOrdenPreparacion.CrearOrdenPreparacion(idPlantilla, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "OrdenPreparacionController.crearOrdenPreparacion", "I-MES-WO-PREP", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_ORDEN_PREP"));
            }
        }

        [Route("api/GetOrdenesPreparacion/{finalizadas}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_8_GestionOrdenesPreparacion, Funciones.FAB_PROD_RES_8_VisualizacionOrdenesPreparacion)]
        public List<dynamic> obtenerOrdenPreparacion(int finalizadas)
        {
            try
            {
                return DAO_OrdenPreparacion.ObtenerOrdenesPreparacion(finalizadas);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "OrdenPreparacionController.obtenerOrdenPreparacion", "I-MES-WO-PREP", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_ORDEN_PREP"));
            }
        }

        [Route("api/creaEstadoOrdenPreparacion/{id}/{nombre}")]
        [HttpGet]
        public bool creaEstadoOrdenPreparacion(int id, string nombre)
        {
            try
            {
                return DAO_OrdenPreparacion.creaEstadosOrdenes(id,nombre);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "OrdenPreparacionController.creaEstadoOrdenPreparacion", "I-MES-WO-PREP", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_BORRADO_MATERIA_PRIMA"));
            }
        }

        [Route("api/creaTipoOrdenPreparacion/{id}/{nombre}")]
        [HttpGet]
        public bool creaTipoOrdenPreparacion(int id, string nombre)
        {
            try
            {
                return DAO_OrdenPreparacion.creaTipoOrden(id, nombre);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "OrdenPreparacionController.creaTipoOrdenPreparacion", "I-MES-WO-PREP", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_BORRADO_MATERIA_PRIMA"));
            }
        }

        [Route("api/creaTransicionOrdenPreparacion/{idActual}/{idSiguiente}")]
        [HttpGet]
        public bool creaTipoOrden(int idActual, int idSiguiente)
        {
            try
            {
                return DAO_OrdenPreparacion.creaTransicionOrdenPreparacion(idActual, idSiguiente);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "OrdenPreparacionController.creaTransicionOrdenPreparacion", "I-MES-WO-PREP", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_BORRADO_MATERIA_PRIMA"));
            }
        }

        [Route("api/cambiarEstadoOrdenPreparacion")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_8_GestionOrdenesPreparacion, Funciones.FAB_PROD_RES_8_VisualizacionOrdenesPreparacion)]
        public bool cambiarEstadoOrdenPreparacion(dynamic cambio)
        {
            try
            {
                return DAO_OrdenPreparacion.EditarOrdenPreparacion(cambio);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "OrdenPreparacionController.EditarOrdenPreparacion", "I-MES-WO-PREP", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_ORDEN_PREP"));
            }
        }
        
        
        
    }
}