using BreadMES.Fabricacion;
using Common.Models.Operation;
using MSM.BBDD.Fabricacion;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad;
using MSM.BBDD.Trazabilidad.Operations;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Models.Fabricacion;
using MSM.Security;
using Siemens.Brewing.Shared;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using Siemens.SimaticIT.MM.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using MSM.Mappers.DTO.Fabricacion.Api.Materiales;
using MSM.Mappers.DTO;

namespace MSM.Controllers.Fabricacion
{
    public class MaterialesFabController : ApiController
    {
        private readonly IDAO_Ubicacion _iDAO_Ubicacion;
        private readonly IDAO_Operations _IDAO_Operacion;
        private readonly IDAO_Material _iDAOMaterial;

        public MaterialesFabController(IDAO_Ubicacion iDAO_Ubicacion, IDAO_Operations IDAO_Operacion, IDAO_Material iDAOMaterial)
        {
            _iDAO_Ubicacion = iDAO_Ubicacion;
            _IDAO_Operacion = IDAO_Operacion;
            _iDAOMaterial = iDAOMaterial;
        }

        [Route("api/GetConversionesDuracion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_10_PlanificacionCocciones)]
        public List<CONVERSIONES_DURACIONES_MOSTO> GetConversionesDuracion()
        {
            try
            {
                return DAO_Material.GetMostosCob();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.GetConversionesDuracion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.GetConversionesDuracion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
            }
        }
        /// <summary>
        /// Funcion que devuelve la lista de materiales para el grid de datos maestros
        /// </summary>
        /// returns Lista de materiales de fabricacion
        [Route("api/ObtenerMaterialesFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_DEF_4_VisualizacionDatosMaestros)]
        public List<Materiales_FAB> ObtenerMaterialesFabricacion()
        {
            try
            {
                return DAO_Material.GetMateriales();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.ObtenerMaterialesFabricacion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerMaterialesFabricacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
            }

        }

        /// <summary>
        /// Funcion que devuelve la lista de materiales aprobados
        /// </summary>
        /// returns Lista de materiales de fabricacion
        [Route("api/ObtenerMaterialesFabricacionAprobados/{equipo}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas)]
        public async Task<List<Materiales_FAB>> ObtenerMaterialesFabricacionAprobados(int equipo)
        {
            try
            {
                DAO_Material _daoMaterial = new DAO_Material();
                return await _daoMaterial.GetMaterialesAprobados(equipo);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.ObtenerMaterialesFabricacionAprobados", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerMaterialesFabricacionAprobados", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES_APROBADOS"));
            }

        }

        [Route("api/GetArticlesByArea/{area}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_7_VisualizacionListadoWOPlanificadas)]
        public async Task<List<Materiales_FAB>> GetArticlesByArea(string area)
        {
            try
            {
                //return DAO_Material.GetArticlesByArea(area);
                DAO_Material _daoMaterial = new DAO_Material();
                return _daoMaterial.GetArticlesByAreaBBDD(area);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.GetArticlesByArea", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }
        /// <summary>
        /// Funcion que devuelve la lista de mostos para el formulario de crear una nueva WO
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ObtenerMostos/{area}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_7_VisualizacionListadoWOPlanificadas)]
        public List<Materiales_FAB> ObtenerMostos(string area)
        {
            try
            {
                return new DAO_Material().GetMostosCoccionBBDD(area);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerMostos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        /// <summary>
        /// Funcion que devuelve la lista de mostos para el formulario de crear una nueva WO
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ObtenerMostosSinDummy/{area}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_7_VisualizacionListadoWOPlanificadas)]
        public List<Materiales_FAB> ObtenerMostosSinDummy(string area)
        {
            try
            {
                return DAO_Material.ObtenerMostosSinDummy(area);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.ObtenerMostosSinDummy", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerMostosSinDummy", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        /// <summary>
        /// Funcion que devuelve la lista de mostos para el formulario de crear una nueva WO
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ObtenerMaterialesCoccion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas, Funciones.FAB_PROD_SCH_7_VisualizacionListadoWOPlanificadas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas)]
        public List<dynamic> ObtenerMaterialesCoccion()
        {
            try
            {
                return DAO_Material.ObtenerMaterialesCoccion();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerMaterialesCoccion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }


        /// <summary>
        /// Funcion que devuelve la lista de materiales que van a ser consumidos por un WO
        /// </summary>
        /// returns Lista de especificacion de Materiales
        [Route("api/ObtenerConsumoMaterial/{idOrden}/")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<List<ConsumosMateriales_FAB>> ObtenerConsumoMaterial(string idOrden)
        {
            try
            {
                DAO_Material _daoMaterial = new DAO_Material();
                return await _daoMaterial.GetConsumoMaterial(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.ObtenerConsumoMaterial", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerConsumoMaterial", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_CONSUMO"));
            }

        }
        /// <summary>
        /// Funcion que devuelve la lista de materiales planificados
        /// </summary>
        /// returns Lista de especificacion de Materiales
        [Route("api/ObtenerPlanificadosMaterial/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public IEnumerable<object> ObtenerPlanificadoMaterial(string idOrden)
        {
            try
            {
                return DAO_Material.GetPlanificadoMaterial(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.ObtenerConsumoMaterial", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerPlanificadoMaterial", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_CONSUMO"));
            }

        }
        /// <summary>
        /// Funcion que devuelve la lista de materiales que van a ser consumidos por un WO
        /// </summary>
        /// returns Lista de especificacion de Materiales
        [Route("api/ObtenerProduccionMaterial/{codOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public List<DTO.DTO_ConsumoMateriales> ObtenerProduccionMaterial(string codOrden)
        {
            try
            {
                return DAO_Material.GetProduccionMaterial(codOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.ObtenerProduccionMaterial", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerProduccionMaterial", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PRODUCCION_DE_MATERIALES"));
            }

        }


        /// <summary>
        /// Funcion que devuelve la lista de materiales con sus ubicaciones
        /// </summary>
        /// returns Lista de Materiales
        [Route("api/Materiales/GetEquiposConLotes/{salaCoccion}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public List<LoteUbicacion_FAB> GetEquiposConLotes(int salaCoccion)
        {
            try
            {
                return DAO_Material.GetEquiposConLotes(salaCoccion);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.GetEquiposConLotes", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.GetEquiposConLotes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LA_LISTA"));
            }

        }

        /// <summary>
        /// Funcion que devuelve la lista de materiales con sus ubicaciones
        /// </summary>
        /// returns Lista de Materiales
        [Route("api/Materiales/GetMaterialesUbicacion/{equipo}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas)]
        public List<LoteUbicacionMaterial_FAB> GetMaterialesUbicacion(int equipo)
        {
            try
            {
                return DAO_Material.GetMaterialesUbicacion(equipo);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.GetMaterialesUbicacion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.GetMaterialesUbicacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LA_LISTA_DE"));
            }

        }


        /// <summary>
        /// Funcion que crea un lote y la pone en una ubicacion
        /// </summary>
        /// returns Lista de Materiales
        [Route("api/crearLoteEnUbicacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_RES_8_GestionMateriales)]
        public bool crearLoteEnUbicacion(dynamic datos)
        {
            try
            {
                var daoMaterial = new DAO_Material();
                ParamsReturnValue par = daoMaterial.crearLoteEnUbicacion(datos);

                if (par.succeeded)
                    return true;
                else
                    throw new Exception(par.message);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.crearLoteEnUbicacion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.crearLoteEnUbicacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CREANDO_EL") + ex.Message);
            }
        }

        /// <summary>
        /// Funcion que edita un lote con la informacion de parametros
        /// </summary>
        /// returns Lista de Materiales
        [Route("api/editarLote")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_RES_8_GestionMateriales)]
        public bool editarLote(dynamic datos)
        {
            try
            {
                var daoMaterial = new DAO_Material();
                return daoMaterial.editarLote(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.editarLote", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.EditarLote", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_EL_LOTE"));
            }
        }

        /// <summary>
        /// Funcion que mueve un lote de una ubicacion a otra
        /// </summary>
        /// returns 
        [Route("api/moverLote")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_RES_8_GestionMateriales)]
        public bool moverLote(dynamic datos)
        {
            try
            {
                var daoMaterial = new DAO_Material();
                return daoMaterial.moverLote(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.moverLote", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.moverLote", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MOVIENDO_EL"));
            }

        }

        [Route("api/DeclararProduccion")]
        [HttpPost]
        public async Task<object> DeclararProduccion(dynamic datosProd)
        {
            try
            {
                var daoMaterial = new DAO_Material();
                ReturnValue ret = await daoMaterial.declararProduccion(datosProd);

                if (!ret.succeeded)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "MaterialesController.DeclararProduccion", "WEB-FABRICACION", "Sistema");
                    throw new Exception(ret.message);
                }
                else
                {
                    return true;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.DeclararProduccion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.DeclararProduccion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_DECLARANDO_LA"));
            }
        }


        [Route("api/ConsumoMaterial")]
        [HttpPost]
        public async Task<object> DeclararConsumo(dynamic datosProd)
        {
            try
            {
                var daoMaterial = new DAO_Material();
                ReturnValue ret = await daoMaterial.DeclararConsumo(datosProd);

                if (!ret.succeeded)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "MaterialesController.DeclararConsumo", "WEB-FABRICACION", "Sistema");
                }

                return ret;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.DeclararConsumo", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.DeclararConsumo", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_DECLARANDO_EL"));
            }
        }

        [Route("api/GetConsumosMaterial/{idMaterial}/{idOrden}")]
        [HttpGet]
        public async Task<List<Transformacion>> GetConsumosMaterial(string idMaterial, string idOrden)
        {
            try
            {
                DAO_Material _daoMaterial = new DAO_Material();
                return await _daoMaterial.GetConsumosMaterial(idMaterial, idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.GetConsumosMaterial", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.GetConsumosMaterial", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_BUSCANDO_LOS"));
            }
        }

        [Route("api/GetResumenSilos/{tipo}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_3_Silos)]
        public List<LoteUbicacionMaterial_FAB> GetResumenSilos(string tipo)
        {
            try
            {
                return DAO_Material.GetResumenSilos(tipo);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.GetResumenSilos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.GetResumenSilos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_BUSCANDO_EL"));
            }
        }

        /// <summary>
        /// Obtiene las operaciones de transferencia
        /// </summary>
        /// <returns></returns>
        [Route("api/GetTransformacionesTransferencias/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<List<Transformacion>> GetTransformacionesTransferencias(string idOrden)
        {
            try
            {
                DAO_Material _daoMaterial = new DAO_Material();
                return await _daoMaterial.obtenerTransferenciasMosto(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.GetTransformacionesTransferencias", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.GetTransformacionesTransferencias", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }


        /// Obtiene las operaciones de transferencia
        /// </summary>
        /// <returns></returns>
        [Route("api/CrearTransferencia")]
        [HttpPost]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<bool> CrearTransferencia(dynamic datos)
        {
            try
            {
                DAO_Material _daoMaterial = new DAO_Material();
                ReturnValue ret = await _daoMaterial.CrearTransferencia(datos);

                if (!ret.succeeded)
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "MaterialesController.crearTransferencia", "WEB-FABRICACION", "Sistema");

                return ret.succeeded;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.crearTransferencia", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.crearTransferencia", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }





        /// Obtiene las operaciones de transferencia
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerMaximoLoteOrden/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<string> obtenerMaximoLoteOrden(int idOrden)
        {
            try
            {
                DAO_Material _daoMaterial = new DAO_Material();
                string maximoLote = await _daoMaterial.obtenerMaximoLoteOrden(idOrden);
                return maximoLote?.ToUpper();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerMaximoLoteOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerMaximoLoteOrden", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// Obtiene las operaciones de transferencia
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerMaximoLoteOrden/{idOrden}/{idMaterial}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<string> obtenerMaximoLoteOrden(int idOrden, string idMaterial)
        {
            try
            {
                DAO_Material _daoMaterial = new DAO_Material();
                string result = await _daoMaterial.obtenerMaximoLoteOrden(idOrden, idMaterial);
                return result?.ToUpper();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerMaximoLoteOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerMaximoLoteOrden", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// Obtiene los tipos de material de los que la orden puede consumir
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerTipoMaterial/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public List<MaterialClass> obtenerTipoMaterial(int idOrden)
        {
            try
            {
                return DAO_Material.obtenerTipoMaterial(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerTipoMaterial", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerTipoMaterial", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// Obtiene los tipos de material de los que la orden puede consumir
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerClasesMaterialConsumos/{tipoMaterial}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public List<Definition> obtenerClasesMaterialConsumos(string tipoMaterial)
        {
            try
            {
                return DAO_Material.obtenerClasesMaterialConsumos(tipoMaterial);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerTipoMaterial", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerClasesMaterialConsumos", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }


        /// Obtiene los tipos de material de los que la orden puede producir
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerProducciones/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public List<Definition> obtenerProducciones(int idOrden)
        {
            try
            {
                return DAO_Material.obtenerProducciones(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerProducciones", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerProducciones", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// Obtiene los tipos de material de los que la orden puede producir
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerMaterialesATransferir/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public List<Definition> obtenerMaterialesATransferir(int idOrden)
        {
            try
            {
                return DAO_Material.obtenerMaterialesATransferir(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerMaterialesATransferir", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerMaterialesATransferir", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }


        /// Obtiene los tipos de material de los que la orden puede cambiar la orden de fermentacion
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerMaterialCambio/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public List<Definition> obtenerMaterialCambio(int idOrden)
        {
            try
            {
                return DAO_Material.obtenerMaterialCambio(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerMaterialCambio", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerMaterialCambio", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// Obtiene los tipos de material de los que la orden puede cambiar la orden de fermentacion
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerMaterialCambioporTipo/{tipo}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public List<Definition> obtenerMaterialCambioporTipo(string tipo)
        {
            try
            {
                return DAO_Material.obtenerMaterialCambio(tipo);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerMaterialCambio", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerMaterialCambioporTipo", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }



        /// Devuelve una unidad de medida dado un material
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerUOM/{idMaterial}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public string obtenerUOM(string idMaterial)
        {
            try
            {
                return DAO_Material.obtenerUOM(idMaterial);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerMaterialCambio", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerUOM", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }


        /// Devuelve una unidad de medida dado un material
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerUOMconPKMaterial/{idMaterial}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public string obtenerUOMconPKMaterial(int idMaterial)
        {
            try
            {
                return DAO_Material.obtenerUOMconPKMaterial(idMaterial);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerUOMconPKMaterial", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerUOMconPKMaterial", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// Devuelve una unidad de medida dado un material
        /// </summary>
        /// <returns></returns>
        [Route("api/getDetalleProduccionOrden/{idMaterial}/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public List<DTO_DetallesProduccionesOrden> getDetalleProduccionOrden(string idMaterial, string idOrden)
        {
            try
            {
                return DAO_Material.getDetalleProduccionOrden(idMaterial, idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.getDetalleProduccionOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.getDetalleProduccionOrden", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// Devuelve la cantidad del lote
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerCantidadLote/{pkOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public decimal obtenerCantidadLote(int pkOrden)
        {
            try
            {
                return DAO_Material.obtenerCantidadLote(pkOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerCantidadLote", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerCantidadLote", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// Devuelve el ID del lote
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerNombreLote/{pkOrden}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOActivas,
            Funciones.FAB_PROD_RES_8_GestionMateriales,
            Funciones.FAB_PROD_RES_8_VisualizacionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_RES_8_GestionMaterialesWOFinalizadas,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public string obtenerNombreLote(int pkOrden)
        {
            try
            {
                return DAO_Material.obtenerNombreLote(pkOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerNombreLote", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerNombreLote", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        [Route("api/obtenerMateriasPrimasOrdenesPreparacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_11_VisualizacionPlantillasPrep)]
        public IEnumerable obtenerMateriasPrimasOrdenesPreparacion()
        {
            try
            {
                List<Materiales_FAB> lstMateriales = new List<Materiales_FAB>();
                lstMateriales = DAO_Material.GetMaterialesOrdenesPrep();
                return lstMateriales.Select(m => new {
                    IdMaterial = m.IdMaterial,
                    Clase = m.Clase,
                    Descripcion = m.Descripcion,
                    Cantidad = 0
                });
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialController.obtenerMateriasPrimasOrdenesPreparacion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerMateriasPrimasOrdenesPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MATERIALES"));
            }
        }


        [Route("api/crearMateriaPrimaOrden")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_8_GestionOrdenesPreparacion)]
        public bool crearMateriaPrimaPlantilla(dynamic datos)
        {
            try
            {
                datos.Usuario = HttpContext.Current.User.Identity.Name;
                return OrdenPreparacionBread.AñadirMateriaPrimaOrden(datos); ;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.crearMateriaPrimaPlantilla", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITAR_MATERIA_PRIMA"));
            }
        }

        [Route("api/eliminarMateriaPrimaOrden/{idMaterial}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_RES_8_GestionOrdenesPreparacion)]
        public bool eliminarMateriaPrimaPlantilla(string idMaterial)
        {
            try
            {
                return DAO_PlantillaPreparacion.BorrarMateria(idMaterial);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.eliminarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.eliminarMateriaPrimaPlantilla", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_BORRADO_MATERIA_PRIMA"));
            }
        }



        [Route("api/editarMateriaPrimaOrden")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_8_GestionOrdenesPreparacion)]
        public async Task<bool> editarMateriaPrimaPlantilla(dynamic datos)
        {
            try
            {
                datos.Usuario = HttpContext.Current.User.Identity.Name;
                bool _result = DAO_PlantillaPreparacion.EditarMaterialOrden(datos);
                if (_result)
                {
                    string _idLote = datos.IdLote;
                    if (_idLote != null)
                    {
                        var _lotInfo = await _IDAO_Operacion.GetLotInfo(_idLote);
                        var _cantidad = Convert.ToDecimal(datos.Cantidad);
                        if ((decimal)_lotInfo.Cantidad >= _cantidad)
                        {
                            _cantidad = _lotInfo.Cantidad - _cantidad;
                        }
                        else
                        {
                            _cantidad = _cantidad - _lotInfo.Cantidad;
                        }

                        OperationDto _operation = new OperationDto();
                        _operation.IdLote = datos.IdLote;
                        _operation.IdTipoOperacion = 8;
                        _operation.SSCC = _operation.IdLote != null ? _operation.IdLote.Split('-').Last() : null;
                        _operation.Factor = 1;
                        _operation.Cantidad = _cantidad;

                        var ret = await _IDAO_Operacion.PostOperation(_operation);
                        if (ret != null) return true;
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.editarMateriaPrimaPlantilla", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITAR_MATERIA_PRIMA"));
            }
        }

        [Route("api/obtenerLotesPorReferenciaMaterial/{idMaterial}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_8_GestionOrdenesPreparacion)]
        public async Task<List<dynamic>> editarMateriaPrimaPlantilla(string idMaterial)
        {
            try
            {
                return await _iDAO_Ubicacion.GetLotesPorMaterial(idMaterial);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.editarMateriaPrimaPlantilla", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITAR_MATERIA_PRIMA"));
            }
        }

        [Route("api/materiales/cervezasTipoSemielaborado")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas)]
        public async Task<IHttpActionResult> ObtenerCervezasTipoSemielaborado()
        {
            try
            {
                var result = await _iDAOMaterial.ObtenerCervezasTipoSemielaborado();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesFabController.ObtenerCervezasTipoSemielaborado", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CERVEZAS_SEMIELABORADO"));
            }
        }

        [Route("api/materiales/WOPrellenado")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<IHttpActionResult> ActualizarMaterialWOPrellenado(dynamic datos)
        {
            try
            {
                DTO_RespuestaAPI<bool> result = await _iDAOMaterial.ActualizarMaterialWOPrellenado(datos);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }

                if (result.Data)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MaterialesFabController.ActualizarMaterialWOPrellenado",
                        IdiomaController.GetResourceName("TIPO_CERVEZA_TCP_CORRECTA") + ". Código de material " + datos.idMaterial + " de la WO " +
                        datos.codWO, HttpContext.Current.User.Identity.Name);
                }
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("TIPO_CERVEZA_TCP_INCORRECTA") + ". Código de material " +
                        datos.idMaterial + " de la WO " + datos.codWO, "MaterialesFabController.ActualizarMaterialWOPrellenado", "WEB-FABRICACION",
                        HttpContext.Current.User.Identity.Name);
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_CAMBIAR_TIPO_CERVEZA_TCP") + ". Código de material " +
                    datos.idMaterial + " de la WO " + datos.codWO + ". - " + ex.Message + " -> " + ex.StackTrace,
                    "MaterialesFabController.ActualizarMaterialWOPrellenado", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_CAMBIAR_TIPO_CERVEZA_TCP"));
            }

        }

        [Route("api/materiales/mostosCoccionTipoSemielaborado")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas)]
        public async Task<IHttpActionResult> ObtenerMostosCoccionTipoSemielaborado()
        {
            try
            {
                var result = await _iDAOMaterial.ObtenerMostosCoccionTipoSemielaborado();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesFabController.ObtenerMostosCoccionTipoSemielaborado", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_MOSTOS_SEMIELABORADO"));
            }
        }

        [Route("api/materiales/mostosTipoSemielaborado")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas)]
        public async Task<IHttpActionResult> ObtenerMostosTipoSemielaborado()
        {
            try
            {
                var result = await _iDAOMaterial.ObtenerMostosTipoSemielaborado();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesFabController.ObtenerMostosTipoSemielaborado", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_MOSTOS_SEMIELABORADO"));
            }
        }

        [Route("api/materiales/TipoMosto")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<bool> ActualizarMaterialTipoMosto(dynamic datos)
        {
            try
            {
                bool correcto = await _iDAOMaterial.ActualizarMaterialTipoMosto(datos);

                if (correcto)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MaterialesFabController.ActualizarMaterialTipoMosto",
                        IdiomaController.GetResourceName("TIPO_MOSTO_CORRECTA") + ". Código de material " + datos.idMaterial + " de la WO " +
                        datos.codWO, HttpContext.Current.User.Identity.Name);
                }
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("TIPO_MOSTO_INCORRECTA") + ". Código de material " +
                        datos.idMaterial + " de la WO " + datos.codWO, "MaterialesFabController.ActualizarMaterialTipoMosto", "WEB-FABRICACION",
                        HttpContext.Current.User.Identity.Name);
                }

                return correcto;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_CAMBIAR_TIPO_MOSTO") + ". Código de material " +
                    datos.idMaterial + " de la WO " + datos.codWO + ". - " + ex.Message + " -> " + ex.StackTrace,
                    "MaterialesFabController.ActualizarMaterialTipoMosto", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);

                throw ex;
            }
        }

        [Route("api/materiales/MMPPSemielaborados")]
        [HttpGet]
        [ApiAuthorize(Funciones.CDG_FAB_CON_2_GestionConfiguracionMateriales, Funciones.CDG_FAB_CON_2_VisualizacionConfiguracionMateriales)]
        public async Task<IHttpActionResult> ObtenerMaterialesMMPPSemielaborados()
        {
            try
            {
                var result = await _iDAOMaterial.ObtenerMaterialesMMPPSemielaborados();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesFabController.ObtenerMostosTipoSemielaborado", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_MOSTOS_SEMIELABORADO"));
            }
        }

        [Route("api/ObtenerRelacionMostosCervezas")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_DEF_5_VisualizacionRelacionMostosCervezas, Funciones.FAB_PROD_DEF_5_GestionRelacionMostosCervezas)]
        public async Task<List<DTO_RelacionMostosCervezas>> ObtenerRelacionMostosCervezas()
        {
            try
            {
                return await _iDAOMaterial.ObtenerRelacionMostosCervezas();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "PlantillaPreparacionController.editarMateriaPrimaPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerRelacionMostosCervezas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER_RELACION_MOSTOS_CERVEZAS"));
            }
        }

        [Route("api/ActualizarRelacionMostosCervezas")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_DEF_5_GestionRelacionMostosCervezas)]
        public async Task<bool> ActualizarRelacionMostosCervezas(dynamic datos)
        {
            try
            {
                return await _iDAOMaterial.ActualizarRelacionMostosCervezas(datos);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_ACTUALIZAR") + ". Relación Cervezas Mostos " +
                    datos.IdMaterial + ". - " + ex.Message + " -> " + ex.StackTrace,
                    "MaterialesFabController.ActualizarRelacionMostosCervezas", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/materiales/CervezasAEnvasar")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
        public async Task<IHttpActionResult> ObtenerCervezasAEnvasar()
        {
            try
            {
                var result = await _iDAOMaterial.ObtenerCervezasAEnvasar();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesFabController.ObtenerCervezasAEnvasar", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_DATOS_CERVEZAS"));
            }
        }

    }
}