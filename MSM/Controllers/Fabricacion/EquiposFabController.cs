using Common.Models.Fabricacion.Sala;
using MSM.BBDD.Fabricacion;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.Security;
using MSM.Utilidades;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    public class EquiposFabController : ApiController
    {

        private readonly IDAO_Orden _iOrden;

        public EquiposFabController(IDAO_Orden iOrden)
        {
            _iOrden = iOrden;

        }

        [Route("api/GetCellEquipment/{cell}")]
        [HttpPost]
        public List<Equipo> GetCellEquipment(string cell)
        {
            try
            {
                return DAO_Equipo.GetCellEquipment(cell);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.GetCellEquipment", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.GetCellEquipment", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EQUIPOS_POR"));
            }

        }

        [Route("api/ObtenerEquiposProcedimiento/{entryID}")]
        [HttpGet]
        public List<Equipo> ObtenerEquiposProcedimiento(string entryID)
        {
            try
            {
                return DAO_Equipo.ObtenerEquiposProcedimiento(entryID);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.ObtenerEquiposProcedimiento", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.ObtenerEquiposProcedimiento", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EQUIPO"));
            }

        }



        [Route("api/obtenerEquiposSinLote/{salaCoccion}")]
        [HttpGet]
        public List<Equipo> obtenerEquiposSinLote(int salaCoccion)
        {
            try
            {
                return DAO_Equipo.obtenerEquiposSinLote(salaCoccion);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerEquiposSinLote", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerEquiposSinLote", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EQUIPOS_SIN"));
            }

        }

        [Route("api/obtenerEquiposConLote/{material}")]
        [HttpGet]
        public List<LoteUbicacionMaterial_FAB> obtenerEquiposConLote(string material)
        {
            try
            {
                return DAO_Equipo.obtenerEquiposConLote(material);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerEquiposConLote", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerEquiposConLote", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EQUIPOS_CON"));
            }

        }


        [Route("api/obtenerCeldasMateriales")]
        [HttpGet]
        public List<Area_FAB> obtenerCeldasMateriales()
        {
            //Siemens.Brewing.Data.Bread.SitMaterialMovement_BREAD.gestionarMovimientoMaterial("OM-LLE-FAB-SC1-16-1249", "MSM.LLEIDA.COCCION.ADITIVOS.L115PRCTQ-01", "MSM.LLEIDA.COCCION.SC1.L111COM_MOL", "Consumed", "35", "21/10/2016 10:10:10");    

            try
            {
                return DAO_Equipo.obtenerCeldasModeloPlanta();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerCeldasMateriales", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerCeldasMateriales", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_CELDAS"));
            }

        }


        [Route("api/obtenerCeldasMaterialesFases")]
        [HttpGet]
        public List<Area_FAB> obtenerCeldasMaterialesFases()
        {
            try
            {
                return DAO_Equipo.obtenerCeldasModeloPlantaFases();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerCeldasModeloPlantaFases", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerCeldasMaterialesFases", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_CELDAS_PARA"));
            }

        }

        [Route("api/obtenerAreasFase/{idFase}")]
        [HttpGet]
        public List<Celda_FAB> obtenerAreasFase(int idFase)
        {
            try
            {
                return DAO_Equipo.obtenerAreasModeloPlantaFases(idFase);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerAreasFase", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerAreasFase", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_AREAS"));
            }

        }

        [Route("api/obtenerCeldaDesdeArea/{idArea}")]
        [HttpGet]
        public List<Celda_FAB> obtenerCeldaDesdeArea(int idArea)
        {
            try
            {
                return DAO_Equipo.obtenerCeldaDesdeArea(idArea);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerCeldaDesdeArea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerCeldaDesdeArea", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_EQUIPOS"));
            }

        }


        [Route("api/obtenerEquiposOrden/{idOrden}")]
        [HttpGet]
        public List<Procedimiento_FAB> obtenerEquiposOrden(int idOrden)
        {
            try
            {
                return DAO_Procedimiento.obtenerEquiposOrden(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerEquiposOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerEquiposOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_EQUIPOS_DE"));
            }

        }


        [Route("api/GetEquipos/{idEquipo}")]
        [HttpGet]
        public List<Object> GetEquipos(int idEquipo)
        {
            try
            {
                return DAO_Equipo.GetEquipos(idEquipo);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.GetEquipos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.GetEquipos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_EQUIPOS"));
            }

        }

        /// <summary>
        /// Obtiene la salas de cocción
        /// </summary>
        /// <returns></returns>
        [Route("api/GetAreasGenericoSalas/{Area}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs, Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<IEnumerable<object>> GetAreasGenerico(string Area)//string salaCoccion
        {
            try
            {
                IEnumerable<object> listSalasCoccion = null;

                string idPlanta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
                string idCoccion = "";

                switch (Area)
                {
                    case "COC":
                        idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Coccion.GetProperty("value"));
                        break;
                    case "REC":
                        idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Recepcion.GetProperty("value"));
                        break;
                    case "GU":
                    case "FER":
                        idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Fermentacion.GetProperty("value"));
                        break;
                    case "FIL":
                        idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Filtracion.GetProperty("value"));
                        break;
                    case "PRE":
                        idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Prellenado.GetProperty("value"));
                        break;
                    case "RECU":
                        idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Recuperados.GetProperty("value"));
                        break; 
                }

                Site site = await Site.CreateAsync(idPlanta);

                List<Area> areasCoccion = await site.GetAreas();
                if(areasCoccion.Count > 0)
                {
                    Area coccion = areasCoccion.Find(a => a.EquipoSit.ID.ToUpper().Equals(idCoccion.ToUpper()));
                    string salasFab = System.Configuration.ConfigurationManager.AppSettings["EquiposProduccionFAB"];

                    using (MESEntities context = new MESEntities())
                    {
                        listSalasCoccion = context.Celda_FAB.AsNoTracking().Where(m => m.AreaPK == coccion.EquipoSit.PK && salasFab.Contains(m.Name)).OrderBy(c => c.Posicion).ToList();
                    }
                }

                return listSalasCoccion;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "CoccionFabController.GetAreasGenerico", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.GetAreasGenerico", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        [Route("api/obtenerEquipmentClassesOfFerTanq")]
        [HttpPost]
        public List<String> ObtenerEquipmentClassesOfFerTanq()
        {
            try
            {
                return DAO_Equipo.ObtenerClassesPKTanquesFERGU();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerEquipmentClassesOfFerTanq", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerEquipmentClassesOfFerTanq", "WEB-FABRICACION", "Sistema");
                throw ex;
            } 
        }

        [Route("api/ChangeDecantingDestination")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public async Task<ReturnValue> ChangeDecantingDestination(dynamic newEquipment)
        {
            try
            {
                var daoEquipo = new DAO_Equipo();
                return await daoEquipo.ChangeDecantingDestination(newEquipment);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.ChangeDecantingDestination", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.ChangeDecantingDestination", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }
         /// <summary>
        /// Obtiene la salas de cocción
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerDestinoTransferencia/{idOrden}/{idMaterial}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<DTO.DTO_TransferenciaMostos> obtenerDestinoTransferencia(int idOrden, string idMaterial)
        {
            try
            {
                return DAO_Equipo.obtenerDestinoTransferencia(idOrden, idMaterial);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerDestinoTransferencia", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerDestinoTransferencia", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }


        /// <summary>
        /// Obtiene la salas de cocción
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerDestinoTransferenciaArea/{idOrden}/{idMaterial}/{idArea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<DTO.DTO_TransferenciaMostos> obtenerDestinoTransferenciaArea(int idOrden, string idMaterial, string area)
        {
            try
            {
                return DAO_Equipo.obtenerDestinoTransferenciaArea(idOrden, area);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerDestinoTransferencia", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerDestinoTransferenciaArea", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// <summary>
        /// Obtiene los tanques TCPs de Prellenado
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerTCPs")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<Equipo_FAB> obtenerTCPs()
        {
            try
            {
                return DAO_Equipo.obtenerTCPs();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerDestinoTransferencia", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerTCPs", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// <summary>
        /// Obtiene las lineas de filtracion
        /// </summary>
        /// <returns></returns>
        [Route("api/obtenerLineasFil")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<Celda_FAB> obtenerLineasFil()
        {
            try
            {
                return DAO_Equipo.obtenerLineasFil();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.obtenerLineasFil", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.obtenerLineasFil", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        /// <summary>
        /// Obtiene las lineas origen de las ordenes según su tipo
        /// </summary>
        /// <returns></returns>
        [Route("api/ObtenerSalasOrigenPorTipoOrden/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas, Funciones.FAB_PROD_SCH_15_GestionAyudaPlanificacionCocciones)]
        public async Task<List<DTO_SalaOrigenDTO>> ObtenerSalasOrigenPorTipoOrden(int IdTipoOrden)
        {
            try
            {
                var _result = await _iOrden.ObtenerSalasOrigenPorTipoOrden(IdTipoOrden);
                return _result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.ObtenerSalasOrigenPorTipoOrden", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

        [Route("api/ObtenerSalasDestinoCoccion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_SCH_17_GestionListadoDeWoPlanificadas)]
        public List<dynamic> ObtenerSalasDestinoCoccion()
        {
            try
            {
                return DAO_Equipo.ObtenerSalasDestinoCoccion();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "EquiposController.ObtenerSalasCoccion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "EquiposFabController.ObtenerSalasDestinoCoccion", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }

    }
}