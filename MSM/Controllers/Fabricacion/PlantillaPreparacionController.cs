using Common.Models;
using MSM.BBDD.Fabricacion;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.Security;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    [Authorize]
    public class PlantillaPreparacionController : ApiController
    {

        /// <summary>
        /// Método que devuelve las plantillas de ordenes de preparación
        /// </summary>
        /// <returns>Lista con las plantillas de ordnes de preparacion</returns>
        [Route("api/ObtenerTiposOrdenesPreparacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_11_VisualizacionPlantillasPrep)]
        public List<TipoOrdenPreparacion> ObtenerTiposOrdenesPreparacion()
        {
            try
            {
                List<TipoOrdenPreparacion> ordenes = new List<TipoOrdenPreparacion>();
                ordenes = DAO_PlantillaPreparacion.GetTipoPlantillasPreparacion();
                return ordenes;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.GetPlantillaOrdenesPreparacion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.ObtenerTiposOrdenesPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TIPOS_PLANTILLAS_PREP"));
            }
        }


        /// <summary>
        /// Método que devuelve las plantillas de ordenes de preparación
        /// </summary>
        /// <returns>Lista con las plantillas de ordnes de preparacion</returns>
        [Route("api/GetPlantillaOrdenesPreparacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_11_VisualizacionPlantillasPrep)]
        public List<PlantillaPreparacion> GetPlantillaOrdenesPreparacion()
        {
            try
            {
                List<PlantillaPreparacion> ordenes = new List<PlantillaPreparacion>();
                ordenes = DAO_PlantillaPreparacion.GetPlantillasPreparacion();
                return ordenes;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.GetPlantillaOrdenesPreparacion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.GetPlantillaOrdenesPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PLANTILLAS_PREP"));
            }
        }

        [Route("api/GetMateriasPrimasPlantillaOrdenesPrep")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_11_VisualizacionPlantillasPrep)]
        public IEnumerable GetMateriasPrimasPlantillaOrdenesPrep(dynamic datos)
        {
            try
            {
                long idPlantilla;
                IEnumerable lstMateriasPrimas = null;
                bool result = Int64.TryParse(datos.idPlantilla.Value.ToString(), out idPlantilla);
                if (result)
                {
                    lstMateriasPrimas = DAO_Material.GetMaterialesOrdenesPrepPorPlantilla(idPlantilla);
                }
                return lstMateriasPrimas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.GetMateriasPrimasPlantillaOrdenesPrep", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.GetMateriasPrimasPlantillaOrdenesPrep", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_MATERIAS_PRIMAS_PLANTILLAS_PREP"));
            }
        }

        [Route("api/GetMateriasPrimasOrdenesPrep/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_11_VisualizacionPlantillasPrep)]
        public IEnumerable GetMateriasPrimasPlantillaOrdenesPrep(string idOrden)
        {
            try
            {
                return DAO_Material.GetMaterialesOrdenesPrepPorIdOrden(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.GetMateriasPrimasPlantillaOrdenesPrep", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.GetMateriasPrimasPlantillaOrdenesPrep", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_MATERIAS_PRIMAS_PLANTILLAS_PREP"));
            }
        }

        [Route("api/eliminarMateriaPrimaPlantilla")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_12_GestionPlantillasPrep)]
        public bool eliminarMateriaPrimaPlantilla(dynamic datos)
        {
            try
            {
                long idDetallePlantilla = Int64.Parse(datos.idDetallePlantilla.Value.ToString());

                return DAO_PlantillaPreparacion.BorrarMaterialPlantilla(idDetallePlantilla);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.eliminarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.GetMateriasPrimasPlantillaOrdenesPrep", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_BORRADO_MATERIA_PRIMA"));
            }
        }

        [Route("api/editarMateriaPrimaPlantilla")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_12_GestionPlantillasPrep)]
        public bool editarMateriaPrimaPlantilla(dynamic datos)
        {
            try
            {
                datos.Usuario = HttpContext.Current.User.Identity.Name;
                return DAO_PlantillaPreparacion.EditarMaterialPlantilla(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITAR_MATERIA_PRIMA"));
            }
        }

        [Route("api/crearMateriaPrimaPlantilla")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_12_GestionPlantillasPrep)]
        public bool crearMateriaPrimaPlantilla(dynamic datos)
        {
            try
            {
                datos.Usuario = HttpContext.Current.User.Identity.Name;
                return DAO_PlantillaPreparacion.CrearMaterialPlantilla(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.crearMateriaPrimaPlantilla", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITAR_MATERIA_PRIMA"));
            }
        }

        

        [Route("api/CrearPlantillaPreparacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_12_GestionPlantillasPrep)]
        public bool CrearPlantillaPreparacion(dynamic datos)
        {
            try
            {
                datos.Usuario = HttpContext.Current.User.Identity.Name;
                long idPlantilla;
                bool result = DAO_PlantillaPreparacion.CrearPlantillaPreparacion(datos, out idPlantilla);

                if (result)
                {
                    foreach (dynamic item in (datos.materiasPrimas as IEnumerable<object>))
                    {
                        item.IdPlantilla = idPlantilla;
                        item.Usuario = HttpContext.Current.User.Identity.Name;
                        DAO_PlantillaPreparacion.CrearDetallePlantillaPreparacion(item);
                    }
                }
                return result;

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.CrearPlantillaPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITAR_MATERIA_PRIMA"));
            }
        }

        [Route("api/EditarPlantillaPreparacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_12_GestionPlantillasPrep)]
        public bool EditarPlantillaPreparacion(dynamic datos)
        {
            try
            {
                datos.Usuario = HttpContext.Current.User.Identity.Name;
                return DAO_PlantillaPreparacion.EditarPlantillaPreparacion(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.EditarPlantillaPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITAR_MATERIA_PRIMA"));
            }
        }

        [Route("api/BorrarPlantillaPreparacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_12_GestionPlantillasPrep)]
        public bool BorrarPlantillaPreparacion(dynamic idPlantilla)
        {
            try
            {
                return DAO_PlantillaPreparacion.BorrarPlantillaPreparacion(idPlantilla, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "PlantillaPreparacionController.BorrarPlantillaPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINAR_PLANTILLA"));
            }
        }
    }
}