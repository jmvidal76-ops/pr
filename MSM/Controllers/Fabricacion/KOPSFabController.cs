using Common.Models.Fabricacion.Coccion;
using MSM.BBDD.Fabricacion;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Models.Fabricacion;
using MSM.Security;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using MSM.Servicios.Fabricacion;
using Common.Models.Fabricacion.Orden;
using Common.Models.Fabricacion.KOPs;
using MSM_FabricacionAPI.Models.Mostos.KOPs;
using System.Web;

namespace MSM.Controllers.Fabricacion
{
    [Authorize]
    public class KOPSFabController : ApiController
    {
        private readonly IDAO_KOP _kop;

        public KOPSFabController(IDAO_KOP kop)
        {

            _kop = kop;
        }
        /// <summary>
        /// Funcion que devuelve la lista de KOPS
        /// </summary>
        /// returns Lista de KOPS
        //[Route("api/OrdenesFab/GetTodosKOP")]
        //[HttpGet]
        //[ApiAuthorize(Funciones.FAB_PROD_RES_2_KOPsManuales)]
        //public List<KOPS_Maestro_FAB> GetTodosKOPS()
        //{
        //    try
        //    {
        //        List<KOPS_Maestro_FAB> listaKOPS = new List<KOPS_Maestro_FAB>();
        //        listaKOPS = DAO_KOP.GetKOPS();
        //        return listaKOPS;
        //    }
        //    catch (Exception ex)
        //    {
        //        DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetTodosKOPS", ex, HttpContext.Current.User.Identity.Name);
        //        throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS"));
        //    }
        //}

        [Route("api/OrdenesFab/RecalcularKOPs/{idOrden}/{idTipoWO}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos, Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public IHttpActionResult RecalcularKOPs(int idOrden, int idTipoWO)
        {
            try
            {
                return Ok(new DAO_KOP().RecalcularKOPs(idOrden, idTipoWO));
            }
            catch
            {
                return BadRequest();
            }
        }

        /// <summary>
        /// Funcion que devuelve la lista de KOPS
        /// </summary>
        /// param name="idOrden" recibe el id (PK) de la orden
        /// returns Lista de KOPS
        [Route("api/OrdenesFab/GetKOPSOrdenMaestro/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico)]
        public List<KOPs_FAB_MultiValor> GetKOPSOrdenMaestro(int idOrden)
        {
            try
            {
                return DAO_KOP.GetKOPSOrdenMaestro(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKOPSOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.GetKOPSOrdenMaestro", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UNA"));
            }
        }

        [Route("api/KOPsFab/EditarValoresTrafficLightKOP")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas)]
        public async Task<ReturnValue> EditarValoresTrafficLightKOP(dynamic kop)
        {
            try
            {
                String orderId = kop.orderId.ToString();
                String valor = kop.value.ToString();
                DAO_KOP daoKop = new DAO_KOP();
                return await daoKop.UpdateWoTrafficLightKop(orderId, valor);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.EditarValoresTrafficLightKOP", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.EditarValoresTrafficLightKOP", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
                //throw new Exception("Error editando los KOPS de una orden");
            }
        }
        /// <summary>
        /// Metodo que dado unos valores actualiza el KOP
        /// </summary>
        /// <param name="kop"></param>
        /// <returns></returns>
        [Route("api/KOPsFab/editarValoresKOP")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos, Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos, Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_21_GestionRevisionKOPsWO)]
        public async Task<ReturnValue> editarValoresKOP(dynamic kop)
        {
            try
            {
                DAO_KOP daoKOP = new DAO_KOP();
                var resultado = await daoKOP.editarValoresKOP(kop);

                if (resultado.succeeded)
                {
                    // Extrae datos relevantes de 'kop'
                    string idOrden = kop.IDOrden != null ? kop.IDOrden.ToString() : "";
                    string codProcedimiento = kop.Cod_Procedimiento != null ? kop.Cod_Procedimiento.ToString() : "";
                    string nombreKop = kop.nombreKop != null ? kop.nombreKop.ToString() : "";
                    string uom = kop.UOM != null ? kop.UOM.ToString() : "";
                    string pkActVal = kop.PkActVal != null ? kop.PkActVal.ToString() : "";
                    string tipoKop = kop.Tipo_KOP != null ? kop.Tipo_KOP.ToString() : "";
                    string valorKop = kop.ValorKOP != null ? kop.ValorKOP.ToString() : "";

                    string mensajeLog = $"Se ha modificado KOP - IDOrden: {idOrden}, PkActVal: {pkActVal}, nombreKop: {nombreKop}, Cod_Procedimiento: {codProcedimiento}, UOM: {uom}, Tipo_KOP: {tipoKop}, ValorKOP: {valorKop}";
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "KOPSFabController.editarValoresKOP", mensajeLog, HttpContext.Current.User.Identity.Name);
                }

                return resultado;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.editarValoresKOP", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

            //Devuelve un listado con los KOPs de una planta
            //agomezn 27/06/16
            //[Route("api/KOPsFab/GetKopsPlanta/{area}")]
            //[HttpGet]
            //[ApiAuthorize(Funciones.FAB_PROD_RES_2_KOPsManuales)]
            //public List<KOPS_Maestro_FAB> GetKopsPlanta(string area)
            //{
            //    try
            //    {
            //        var listadoKopsPlanta = DAO_KOP.ObtenerKopsPlanta(area);
            //        return listadoKopsPlanta;
            //    }
            //    catch (Exception ex)
            //    {
            //        DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKopsPlanta", ex, HttpContext.Current.User.Identity.Name);
            //        throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_PLANTA"));
            //    }
            //}

            /// <summary>
            /// Metodo que recibe un objeto con la informacion del KOP del COB de KOPS manuales para editarlo o añadir el valor
            /// </summary>
            /// <param name="kop"></param>
            //[Route("api/KOPsFab/editarValoresKOPPlanta")]
            //[HttpPost]
            //[ApiAuthorize(Funciones.FAB_PROD_RES_2_KOPsManuales)]
            //public void editarValoresKOPPlanta(dynamic kop)
            //{
            //    try
            //    {
            //        DAO_KOP.editarValoresKOPPlanta(kop);
            //    }
            //    catch (Exception ex)
            //    {
            //        DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.editarValoresKOPPlanta", ex.Message, HttpContext.Current.User.Identity.Name);
            //        throw new Exception("Error editando los KOPS de una orden");
            //    }
            //}

            /// <summary>
            /// Metodo que recibe un objeto con la informacion del KOP del COB de KOPS manuales para editarlo o añadir el valor
            /// </summary>
            /// <param name="kop"></param>
            [Route("api/KOPsFab/editarValoresKOPProceso")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public void editarValoresKOPProceso(dynamic kop)
        {
            try
            {
                DAO_KOP.editarValoresKOPProceso(kop);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.editarValoresKOPProceso", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.editarValoresKOPProceso", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_LOS"));
            }
        }

        /// <summary>
        /// Metodo devuelve la lista de valores para los KOPS globales
        /// </summary>
        /// <param name="kop"></param>
        //[Route("api/GetValoresKopsPlanta/{CodKOP}/{salaCoccion}")]
        //[HttpGet]
        //[ApiAuthorize(Funciones.FAB_PROD_RES_2_KOPsManuales)]
        //public List<KOPs_Man_Planta_FAB> GetValoresKopsPlanta(int codKop, string salaCoccion)
        //{
        //    try
        //    {
        //        return DAO_KOP.GetValoresKopsPlanta(codKop, salaCoccion);
        //    }
        //    catch (Exception ex)
        //    {
        //        DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetValoresKopsPlanta", ex.Message, HttpContext.Current.User.Identity.Name);
        //        throw new Exception(IdiomaController.GetResourceName("ERROR_AÑADIENDO_LOS"));
        //    }
        //}

        /// <summary>
        /// Metodo que dado una orden te devuelve el numero de coccion asignado
        /// </summary>
        /// <param name="numero de coccion"></param>
        [Route("api/getNumeroCoccionOrden/{numCoccion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_Coccion)]
        public async Task<int> GetNumeroCoccionOrden(string numCoccion)
        {
            try
            {
                DAO_KOP daoKop = new DAO_KOP();
                return await daoKop.GetNumeroCoccionOrden(numCoccion);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetNumeroCoccionOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.GetNumeroCoccionOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_NUMERO_DE"));
            }
        }

        [Route("api/ImportDefaultPPRKOPS/{idMaterial}/{salaCoccion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public void ImportDefaultPPRKOPS(string idMaterial, string salaCoccion)
        {
            DTO_KOP auxKop = null;
            List<DTO_KOP> defaultPPRKOPS = new List<DTO_KOP>();
            List<DTO_KOP> pprKOPS = new List<DTO_KOP>();
            string descripcionKOP = string.Empty;
            try
            {
                defaultPPRKOPS = GetKOPSPPR("DummyMaterial", salaCoccion);
                pprKOPS = GetKOPSPPR(idMaterial, salaCoccion);
                foreach (var item in defaultPPRKOPS)
                {
                    descripcionKOP = item.descKOP;
                    auxKop = pprKOPS.Find(delegate (DTO_KOP element) { return element.descKOP == item.descKOP; });
                    dynamic kop = new { valor = item.valor, maximo = item.maximo, minimo = item.minimo, idValor = auxKop.idValor, Fecha = DateTime.Now.ToLocalTime().ToString("MM/dd/yyyy HH:mm:ss") };
                    DAO_KOP.editarValoresKOPProceso(kop);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, "Error al importar KOP por defecto del KOP: " + descripcionKOP + " ERROR: " + ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ImportDefaultPPRKOPS", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UN_MOSTO"));
            }


        }
        /// <summary>
        /// Metodo que dado un material y una sala de coccion te devuelve sus kops
        /// </summary>
        /// <param name="id del material"></param>
        /// <param name="sala de coccion"></param>
        [Route("api/GetKOPSPPR/{idMaterial}/{salaCoccion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public List<DTO_KOP> GetKOPSPPR(string idMaterial, string salaCoccion)
        {
            try
            {
                string area = "";
                if (salaCoccion.Contains("SC"))
                {
                    area = "COCCION";
                    if (idMaterial.Contains("DummyMaterial"))
                        idMaterial = "DummyMaterial_WP";
                }
                else
                    if (salaCoccion.Contains("GU"))
                {
                    area = "GUARDA";
                    if (idMaterial.Contains("DummyMaterial"))
                        idMaterial = "DummyMaterial_GU";
                }
                else
                        if (salaCoccion.Contains("FE"))
                {
                    area = "FERMENTACION";
                    if (idMaterial.Contains("DummyMaterial"))
                        idMaterial = "DummyMaterial_FE";
                }
                else
                            if (salaCoccion.Contains("PR"))
                {
                    area = "PRELLENADO";
                    if (idMaterial.Contains("DummyMaterial"))
                        idMaterial = "DummyMaterial_PR";
                }
                else
                                if (salaCoccion.Contains("FL"))
                {
                    area = "FILTRACION";
                    if (idMaterial.Contains("DummyMaterial"))
                        idMaterial = "DummyMaterial_FL";
                }
                else
                                    if (salaCoccion.Contains("TR"))
                {
                    area = "TRASIEGO";
                    if (idMaterial.Contains("DummyMaterial"))
                        idMaterial = "DummyMaterial_TR";
                }

                return DAO_KOP.GetKOPSPPR(idMaterial, salaCoccion, area).FindAll(kop => !kop.tipo.ToString().ToLower().Equals("string"));
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKOPSPPR", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.GetKOPSPPR", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UN_MOSTO"));
            }
        }

        /// <summary>
        /// Metodo que devuelve la lista de KOPS de las curvas
        /// </summary>
        [Route("api/GetKOPSCurva")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public List<CURVAS_KOP_DEF> GetKOPSCurva(dynamic data)
        {
            try
            {

                return new DAO_KOP().GetKOPCurvasBBDD(data);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.GetKOPSCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_CURVAS"));
            }
        }


        [Route("api/GetKOPSCurvaByPhase/{condition}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public List<Object> GetKOPSCurvaByPhase(string condition)
        {
            try
            {
                return DAO_KOP.GetKOPSCurvaByPhase(condition);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.GetKOPSCurvaByPhase", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_CURVAS"));
            }
        }

        [Route("api/ImportKopsMultivalorByDefault")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public void ImportKopsMultivalorByDefault(dynamic datas)
        {
            try
            {
                DAO_KOP.ImportKopsMultivalorByDefault(datas);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ImportKopsMultivalorByDefault", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ImportKopsMultivalorByDefault", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_IMPORTANDO_LOS_KOPS"));
            }
        }

        [Route("api/DeleteCurva")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public void DeleteCurva(dynamic datas)
        {
            try
            {
                DAO_KOP.DeleteCurva(datas);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.DeleteCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_CURVAS"));
            }
        }


        /// <summary>
        /// Metodo que recibe la informacion para crear un KOP curva
        /// </summary>
        [Route("api/crearCurva")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public bool crearCurva(dynamic datos)
        {
            try
            {
                ReturnValue ret = DAO_KOP.crearCurva(datos);

                if (ret.succeeded)
                    return true;
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "KOPSFabController.crearCurva", "WEB-FABRICACION", "Sistema");
                    return false;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.crearCurva", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.crearCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CREANDO_LOS"));
            }
        }


        /// <summary>
        /// Metodo que recibe el ID de un KOP y devuelve la CFG asociada
        /// </summary>
        [Route("api/GetCFGCurva")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public List<CURVAS_KOP_CFG> GetCFGCurva(dynamic datos)
        {
            int pkKop = Convert.ToInt32(datos.pkKop.ToString());
            String material = datos.material;
            String area = datos.area;
            try
            {
                return new DAO_KOP().GetCFGCurvaBBDD(pkKop, material, area);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetCFGCurva", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.GetCFGCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CARGANDO_LAS"));
            }
        }


        [Route("api/GetNextKopID")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public int GetNextKopID()
        {
            try
            {
                return DAO_KOP.GetNextKopID();

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetCFGCurva", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.GetNextKopID", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CARGANDO_LAS"));
            }
        }

        [Route("api/ActualizarCFGCurva")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public bool ActualizarCFGCurva(dynamic datos)
        {
            try
            {
                ReturnValue ret = DAO_KOP.ActualizarCFGCurva(datos);

                if (ret.succeeded)
                    return true;
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "KOPSFabController.ActualizarCFGCurva", "WEB-FABRICACION", "Sistema");
                    return false;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ActualizarCFGCurva", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ActualizarCFGCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ACTUALIZANDO_LA_CFG"));
            }
        }
        /// <summary>
        /// Metodo que recibe la informacion para crear un KOP curva
        /// </summary>
        [Route("api/crearCFGCurva")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public bool crearCFGCurva(dynamic datos)
        {
            try
            {
                ReturnValue ret = DAO_KOP.crearCFGCurva(datos);

                if (ret.succeeded)
                    return true;
                else
                {
                    //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.crearCFGCurva", "Error creando la cfg de la curva: " + ret.message, HttpContext.Current.User.Identity.Name);
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "KOPSFabController.crearCFGCurva", "WEB-FABRICACION", "Sistema");
                    return false;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.crearCFGCurva", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.crearCFGCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CREANDO_LA"));
            }
        }

        /// <summary>
        /// Metodo que activa o desactiva una curva
        /// </summary>
        [Route("api/ActivaCurva")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public bool ActivaCurva(dynamic datas)
        {
            try
            {
                ReturnValue ret = DAO_KOP.ActivaCurva(datas);

                if (ret.succeeded)
                    return true;
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "KOPSFabController.ActivaCurva", "WEB-FABRICACION", "Sistema");
                    return false;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ActivaCurva", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ActivaCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ACTIVANDO_LA"));
            }
        }


        /// <summary>
        /// Metodo que borra una configuracion de una curva
        /// </summary>
        [Route("api/borrarCFG")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public bool borrarCFG(dynamic datas)
        {
            try
            {
                ReturnValue ret = DAO_KOP.borrarCFG(datas);

                if (ret.succeeded)
                    return true;
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "KOPSFabController.borrarCFG", "WEB-FABRICACION", "Sistema");
                    return false;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.borrarCFG", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.borrarCFG", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_LA"));
            }
        }


        /// <summary>
        /// Metodo que devuelve la lista de KOPS de las curvas
        /// </summary>
        [Route("api/ObtenerKOPSCurvas/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<CURVAS_KOP_DEF> GetKOPSCurvaOrden(int idOrden)
        {
            try
            {
                return DAO_KOP.GetKOPCurvasOrden(idOrden);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKOPSCurvaOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.GetKOPSCurvaOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_CURVAS_DE"));
            }
        }



        /// <summary>
        /// Metodo que devuelve la lista de KOPS multivalor de la orden seleccionada
        /// </summary>
        [Route("api/ObtenerListadoKOPsMultivalorDetalleOrden/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPsMultivalorActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorActivos, Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorHistorico,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPsMultivalorHistorico)]
        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorDetalleOrden(string idOrden)
        {
            try
            {
                List<KOP_GLOBAL> result = await _kop.ObtenerListadoKOPsMultivalorDetalleOrden(idOrden);
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.getValCurvaOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerListadoKOPsMultivalorDetalleOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_VALORES"));
            }
        }

        /// <summary>
        /// Metodo que devuelve la lista del kop multivalor seleccionado
        /// </summary>
        [Route("api/ObtenerListadoKOPsMultivalorExpandidoDetalleOrden/{idOrden}/{idKOP}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPsMultivalorActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorActivos, Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorHistorico,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPsMultivalorHistorico)]
        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorExpandidoDetalleOrden(string idOrden, string idKOP)
        {
            try
            {
                List<KOP_GLOBAL> result = await _kop.ObtenerListadoKOPsMultivalorExpandidoDetalleOrden(idOrden, idKOP);
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.getValCurvaOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerListadoKOPsMultivalorDetalleOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_VALORES"));
            }
        }

        [Route("api/actualizarGridCurvas")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorActivos)]
        public ReturnValue actualizarGridCurvas(dynamic datos)
        {
            try
            {
                ReturnValue ret = DAO_KOP.actualizarGridCurvas(datos);

                if (ret.succeeded)
                    return ret;
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ret.message, "KOPSFabController.actualizarGridCurvas", "WEB-FABRICACION", "Sistema");
                    return new ReturnValue(false);
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.actualizarGridCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.actualizarGridCurvas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ACTUALIZANDO_LOS"));
            }
        }


        [Route("api/ObtenerValorCurvaGrafico/{idKOP}/{idOrden}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPsMultivalorActivos, Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPsMultivalorHistorico, Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorHistorico)]
        public QueryResultGraficoFabUnEje ObtenerValorCurvaGrafico(int idKOP, int idOrden)
        {
            try
            {
                return DAO_KOP.ObtenerValorCurvaGrafico(idKOP, idOrden);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerValorCurvaGrafico", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerValorCurvaGrafico", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_DATOS_DEL"));
            }
        }

        [Route("api/ActualizaNombreCurva")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public bool ActualizaNombreCurva(dynamic datos)
        {
            try
            {
                return DAO_KOP.ActualizaNombreCurva(datos);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.consultaNombreCurva", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ActualizaNombreCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CONSULTANDO_EL"));
            }
        }

        [Route("api/consultaNombreCurva")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public bool consultaNombreCurva(dynamic datos)
        {
            try
            {
                return DAO_KOP.consultaNombreCurva(datos);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.consultaNombreCurva", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.consultaNombreCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CONSULTANDO_EL"));
            }
        }


        [Route("api/GetMultiValor/{codKOP}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPsMultivalorActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<KOPs_FAB_MultiValor> GetMultiValor(int codKOP)
        {
            try
            {
                return DAO_KOP.GetMultiValor(codKOP);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetMultiValor", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.GetMultiValor", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CONSULTANDO_EL_MUILTIVALOR"));
            }
        }


        [Route("api/crearMultiValorKOP")]
        [HttpPost]
        [ApiAuthorize(
            Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorActivos,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO)]
        public async Task<bool> crearMultiValorKOP(dynamic datos)
        {
            try
            {
                DAO_KOP daoKop = new DAO_KOP();
                return await daoKop.crearMultiValorKOP(datos);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetMultiValor", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.crearMultiValorKOP", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CONSULTANDO_EL_MUILTIVALOR"));
            }
        }


        [Route("api/borrarMultiValorKOP/{pkKOP}")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorActivos,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO)]
        public async Task<bool> borrarMultiValorKOP(int pkKOP)
        {
            try
            {
                DAO_KOP _daoKop = new DAO_KOP();
                var result = await _daoKop.borrarMultiValorKOP(pkKOP); 

                if (result.succeeded)
                    return true;
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, result.message, "KOPSFabController.borrarMultiValorKOP", "WEB-FABRICACION", "Sistema");
                    return false;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.borrarMultiValorKOP", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.borrarMultiValorKOP", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_BORRANDO_EL"));
            }
        }


        [Route("api/editaMultiValorKOP")]
        [HttpPost]
        [ApiAuthorize(
            Funciones.FAB_PROD_EXE_9_GestionKOPsMultivalorActivos,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO)]
        public async Task<bool> editaMultiValorKOP(dynamic datos)
        {
            try
            {
                var daoKOP = new DAO_KOP();
                return await daoKOP.editaMultiValorKOP(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.editaMultiValorKOP", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.editaMultiValorKOP", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_EL"));
            }
        }

        [Route("api/ObtenerKOPSHistorian/{idOrden}/{idProc}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<KOPs_FAB_Historian> getKOPSHistorian(int idOrden, int idProc)
        {
            try
            {
                return DAO_KOP.getKOPSHistorian(idOrden, idProc);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.getKOPSHistorian", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.getKOPSHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_HISTORIAN"));
            }
        }


        //Petición sobrecargada para aceptar una List de Cod_KOP
        [Route("api/ObtenerGridHistorianByList")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<Object> ObtenerGridHistorian(dynamic parameters)
        {
            try
            {
                return DAO_KOP.ObtenerGridHistorian(parameters);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerGridHistorian", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerGridHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRID_DE"));
            }
        }

        [Route("api/ObtenerGridHistorian/{idKOP}/{idOrden}/{checkOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<DTO_GridHistorian> ObtenerGridHistorian(int idKOP, int idOrden, int checkOrden)
        {
            try
            {
                return DAO_KOP.ObtenerGridHistorian(idKOP, idOrden, checkOrden);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerGridHistorian", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerGridHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRID_DE"));
            }
        }

        [Route("api/ObtenerGraficoHistorianByList")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public QueryResultGraficoFab ObtenerGraficoHistorianByList(dynamic parametros)
        {
            try
            {
                return DAO_KOP.ObtenerGraficoHistorian(parametros);

            }
            catch (Exception ex)
            {
                ///DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerGraficoHistorian", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerGraficoHistorianByList", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRAFICO_DE_LOS"));
            }
        }

        [Route("api/ObtenerGraficoHistorian/{idKOP}/{idOrden}/{checkOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public QueryResultGraficoFab ObtenerGraficoHistorian(int idKOP, int idOrden, int checkOrden)
        {
            try
            {
                return DAO_KOP.ObtenerGraficoHistorian(idKOP, idOrden, checkOrden);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerGraficoHistorian", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerGraficoHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRAFICO_DE_LOS"));
            }
        }

        [Route("api/ObtenerProcedimientosHistorian/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public List<Procedimiento> ObtenerProcedimientosHistorian(int idOrden)
        {
            try
            {
                return DAO_KOP.ObtenerProcedimientosHistorian(idOrden);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerProcedimientosHistorian", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerProcedimientosHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PROCEDIMIENTOS"));
            }
        }


        [Route("api/ObtenerSemaforoMultivalor/{pkKop}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPsMultivalorHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public string ObtenerSemaforoMultivalor(int pkKop)
        {
            try
            {
                return DAO_KOP.ObtenerSemaforoMultivalor(pkKop);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerSemaforoMultivalor", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerSemaforoMultivalor", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_MULTIVALOR"));
            }
        }

        [Route("api/ObtenerMultiValorGrafico/{pkKop}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPsMultivalorHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public QueryResultGraficoFabUnEje ObtenerMultiValorGrafico(int pkKop)
        {
            try
            {
                return DAO_KOP.ObtenerMultiValorGrafico(pkKop);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMultiValorGrafico", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMultiValorGrafico", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRAFICO_DE_LOS_KOPS"));
            }
        }

        /// <summary>
        /// Metodo un listado de zonas por tipo de orden
        /// </summary>

        [Route("api/ObtenerZonasKOPsPorTipoOrden/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_VisualizacionKOPs, Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<List<DTO_ZonaKOPs>> ObtenerZonasKOPsPorTipoOrden(int IdTipoOrden)
        {
            try
            {

                List<DTO_ZonaKOPs> result = await _kop.ObtenerZonasKOPsPorTipoOrden(IdTipoOrden);

                if (result == null || result.Count == 0)
                {
                    result = null;
                }

                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKOPSPPR", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerZonasKOPsPorTipoOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UN_MOSTO"));
            }
        }

        /// <summary>
        /// Funcion que devuelve la lista de mostos para el formulario de crear una nueva WO
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ObtenerMostosPorZonaTipo/{IdZona}/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_VisualizacionKOPs, Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<List<DTO_MostosCoccion>> ObtenerMostosPorZonaTipo(string IdZona, string IdTipoOrden)
        {
            try
            {
                List<DTO_MostosCoccion> result = await _kop.ObtenerMostosPorZonaTipo(IdZona, IdTipoOrden);

                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMostos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        /// <summary>
        /// Funcion que devuelve la lista de mostos para el formulario de crear una nueva WO
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ObtenerKOPsPorZonaTipo/{IdZona}/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_VisualizacionKOPs, Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<List<DTO_KOPs_Config>> ObtenerKOPsPorZonaTipo(string IdZona, string IdTipoOrden)
        {
            try
            {
                List<DTO_KOPs_Config> result = await _kop.ObtenerKOPsPorZonaTipo(IdZona, IdTipoOrden);

                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMostos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        [Route("api/ObtenerKOPsPorZonaTipoIdMaterial/{IdZona}/{IdTipoOrden}/{IdMaterial}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_VisualizacionKOPs, Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<List<DTO_KOPs_Config>> ObtenerKOPsPorZonaTipoIdMaterial(string IdZona, string IdTipoOrden, string IdMaterial)
        {
            try
            {
                List<DTO_KOPs_Config> result = await _kop.ObtenerKopsPorZonaTipoIdMaterial(IdZona, IdTipoOrden, IdMaterial);

                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMostos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        /// <summary>
        /// Funcion que devuelve la lista de mostos para el formulario de crear una nueva WO
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ObtenerKOPSMostosPorZonaMostoTipoOrden/{IdZona}/{IdMosto}/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_VisualizacionKOPs, Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<List<DTO_KOPs_Config>> ObtenerKOPSMostosPorZonaMostoTipoOrden(string IdZona, string IdMosto, string IdTipoOrden)
        {
            try
            {
                List<DTO_KOPs_Config> result = await _kop.ObtenerKOPSMostosPorZonaMostoTipoOrden(IdZona, IdMosto, IdTipoOrden);

                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMostos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        [Route("api/ObtenerKOPSMostosPorZonaMostoTipoOrdenImportarPorMaterial/{IdZona}/{IdMosto}/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_VisualizacionKOPs, Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<List<DTO_KOPs_Config>> ObtenerKOPSMostosPorZonaMostoTipoOrdenImportarPorMaterial(string IdZona, string IdMosto, string IdTipoOrden)
        {
            try
            {
                List<DTO_KOPs_Config> result = await _kop.ObtenerKOPSMostosPorZonaMostoTipoOrdenImportarPorMaterial(IdZona, IdMosto, IdTipoOrden);

                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMostos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }


        /// <summary>
        /// Funcion que devuelve la lista de mostos para el formulario de crear una nueva WO
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ActualizarKopsPorDefecto")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<Object> ActualizarKopsPorDefecto(DTO_KOPs_Config datos)
        {
            Object result;
            try
            {
                if (KOPs_Servicios.ValidacionValoresKOPs(datos))
                {
                    result = await _kop.ActualizarKopsPorDefecto(datos);
                    if (result != null)
                    {
                        result = new Object[] { true, Resources.idioma.ACTUALIZANDO_OK };
                    }
                    else
                    {
                        result = new Object[] { false, Resources.idioma.ERROR_API_FABRICACION };
                    }
                }
                else
                {
                    result = new object[] { false, Resources.idioma.VALOR_NO_DECIMAL };
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMostos", "WEB-FABRICACION", "Sistema");
                result = new Object[] { false, ex.Message };
            }
            return result;
        }

        /// <summary>
        /// Funcion que devuelve la lista de mostos para el formulario de crear una nueva WO
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ActualizarKopsPorMostos")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<Object> ActualizarKopsPorMostos(DTO_KOPs_Config datos)
        {
            Object result;
            try
            {
                if (KOPs_Servicios.ValidacionValoresKOPs(datos))
                {
                    result = await _kop.ActualizarKopsPorMostos(datos);
                    if (result != null)
                    {
                        result = new Object[] { true, Resources.idioma.ACTUALIZANDO_OK };
                    }
                    else
                    {
                        result = new Object[] { false, Resources.idioma.ERROR_API_FABRICACION };
                    }
                }
                else
                {
                    result = new object[] { false, Resources.idioma.VALOR_NO_DECIMAL };
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMostos", "WEB-FABRICACION", "Sistema");
                result = new Object[] { false, ex.Message };
            }
            return result;
        }

        /// <summary>
        /// Función que importa los KOPs seleccionados de una zona origen a un destino
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ImportarKOPSPorDefectoPorZona")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<bool> ImportarKOPSPorDefectoPorZona([FromBody] DTO_ImportarKOPs Datos)
        {
            try
            {
                return await _kop.ImportarKOPSPorDefectoPorZona(Datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ImportarKOPSPorDefectoPorZona", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        [Route("api/ImportarKOPSPorMaterial")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<bool> ImportarKOPSPorMaterial([FromBody] DTO_ImportarKOPs Datos)
        {
            try
            {
                return await _kop.ImportarKOPSPorMaterial(Datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ImportarKOPSPorDefectoPorZona", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        /// <summary>
        /// Función que importa los KOPs seleccionados en los mostos seleccionados según su zona
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ImportarKOPSMostosPorZonaListaMostos")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs)]
        public async Task<bool> ImportarKOPSMostosPorZonaListaMostos([FromBody] DTO_ImportarKOPs Datos)
        {
            try
            {
                return await _kop.ImportarKOPSMostosPorZonaListaMostos(Datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMostos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        /// <summary>
        /// Metodo que se obtiene el color del estado kop del detalle
        /// </summary>
        /// <param name="kop"></param>
        /// <returns></returns>
        [Route("api/KOPsFab/ObtenerEstadoKOPDetalleOrden/{idOrden}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas,
            Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public Task<string> ObtenerEstadoKOPDetalleOrden(int idOrden)
        {
            try
            {
                return _kop.ObtenerEstadoKOPDetalleOrden(idOrden.ToString());
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKOPSOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerColorKOPConstantes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UNA"));
            }
        }

        /// <summary>
        /// Metodo que se obtiene el color del estado multivalor del detalle
        /// </summary>
        /// <param name="kop"></param>
        /// <returns></returns>
        [Route("api/KOPsFab/ObtenerEstadoKOPMultivalorDetalleOrden/{idOrden}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_VisualizacionKOPActivos,
            Funciones.FAB_PROD_EXE_9_GestionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionKOPActivos,
            Funciones.FAB_PROD_EXE_9_VisualizacionKOPHistorico,
            Funciones.FAB_PROD_EXE_9_GestionWoActivas,
            Funciones.FAB_PROD_EXE_9_GestionHistoricoWO,
            Funciones.FAB_PROD_EXE_9_VisualizacionWoActivas, Funciones.FAB_PROD_EXE_9_VisualizacionHistoricoWO)]
        public Task<string> ObtenerEstadoKOPMultivalorDetalleOrden(int idOrden)
        {
            try
            {
                return _kop.ObtenerEstadoKOPMultivalorDetalleOrden(idOrden.ToString());
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.GetKOPSOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerColorKOPConstantes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UNA"));
            }
        }

        /// <summary>
        /// Metodo que devuelve la lista de KOPS multivalor por la zona 
        /// </summary>
        [Route("api/ObtenerListadoMaestroKOPsMultivalorPorZonaTipo/{idZona}/{idTipo}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_VisualizacionKOPsMultivalor,Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<List<KOP_GLOBAL>> ObtenerListadoMaestroKOPsMultivalorPorZonaTipo(string idZona, string idTipo)
        {
            try
            {
                List<KOP_GLOBAL> result = await _kop.ObtenerListadoMaestroKOPsMultivalorPorZonaTipo(idZona, idTipo);
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.getValCurvaOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerListadoMaestroKOPsMultivalor", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_VALORES"));
            }
        }

        /// <summary>
        /// Metodo que devuelve la lista de KOPS multivalor por la zona 
        /// </summary>
        [Route("api/ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipo/{idZona}/{idKOP}/{IdTipoSubProceso}/{idTipo}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_VisualizacionKOPsMultivalor, Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipo(string idZona, string idKOP, string IdTipoSubProceso, string idTipo)
        {
            try
            {
                List<KOP_GLOBAL> result = await _kop.ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipo(idZona, idKOP, IdTipoSubProceso, idTipo);
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.getValCurvaOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerListadoMaestroKOPsMultivalor", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_VALORES"));
            }
        }

        /// <summary>
        /// Metodo que devuelve la lista de KOPS multivalor por la zona 
        /// </summary>
        [Route("api/ObtenerListadoKOPsMultivalorPorZonaTipoMosto/{idZona}/{idTipo}/{idMosto}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_VisualizacionKOPsMultivalor, Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorPorZonaTipoMosto(string idZona, string idTipo, string idMosto)
        {
            try
            {
                List<KOP_GLOBAL> result = await _kop.ObtenerListadoKOPsMultivalorPorZonaTipoMosto(idZona, idTipo, idMosto);
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.getValCurvaOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerListadoKOPsMultivalorPorZonaTipoMosto", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_VALORES"));
            }
        }

        /// <summary>
        /// Metodo que devuelve la lista de KOPS multivalor por la zona 
        /// </summary>
        [Route("api/ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipoMosto/{idZona}/{idKOP}/{IdTipoSubProceso}/{idTipo}/{idMosto}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_VisualizacionKOPsMultivalor, Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipoMosto(string idZona, string idKOP, string IdTipoSubProceso, string idTipo, string idMosto)
        {
            try
            {
                List<KOP_GLOBAL> result = await _kop.ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipoMosto(idZona, idKOP, IdTipoSubProceso, idTipo, idMosto);
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.getValCurvaOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipoMosto", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_VALORES"));
            }
        }

        /// <summary>
        /// Metodo que devuelve la lista de KOPS multivalor por la zona 
        /// </summary>
        [Route("api/ObtenerListadoTiposKOPsMultivalor")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_VisualizacionKOPsMultivalor, Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<List<DTO_TiposKOPsMultivalor>> ObtenerListadoTiposKOPsMultivalor()
        {
            try
            {
                List<DTO_TiposKOPsMultivalor> result = await _kop.ObtenerListadoTiposKOPsMultivalor();
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.getValCurvaOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipoMosto", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_VALORES"));
            }
        }

        /// <summary>
        /// Metodo que se obtiene el color del estado multivalor del detalle
        /// </summary>
        /// <returns></returns>
        [Route("api/KOPsFab/ValidarNumeroKOPMultivalorSubProceso/{NKOPMultivalor}/{IdTipoSubProceso}/{TipoKOP}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public Task<bool> ValidarNumeroKOPMultivalorSubProceso(int NKOPMultivalor, int IdTipoSubProceso, int  TipoKOP)
        {
            try
            {
                return _kop.ValidarNumeroKOPMultivalorSubProceso(NKOPMultivalor, IdTipoSubProceso, TipoKOP);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ValidarNumeroKOPMultivalorSubProceso", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UNA"));
            }
        }

        /// <summary>
        /// Metodo que se obtiene el color del estado multivalor del detalle
        /// </summary>
        /// <returns></returns>
        [Route("api/KOPsFab/ActualizarNumeroKOPTipoKOPMultivalor")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public Task<bool> ActualizarNumeroKOPTipoKOPMultivalor(dynamic datos)
        {
            try
            {
                return _kop.ActualizarNumeroKOPTipoKOPMultivalor(datos);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ActualizarNumeroKOPTipoKOPMultivalor", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UNA"));
            }
        }

        /// <summary>
        /// Metodo que borra lógicamente el kop multivalor elegido
        /// </summary>
        /// <returns></returns>
        [Route("api/KOPsFab/BorradoLogicoKOPMultivalor")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public Task<bool> BorradoLogicoKOPMultivalor(dynamic datos)
        {
            try
            {
                return _kop.BorradoLogicoKOPMultivalor(datos);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.BorradoLogicoKOPMultivalor", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UNA"));
            }
        }


        /// <summary>
        /// Metodo que borra lógicamente el kop multivalor elegido
        /// </summary>
        /// <returns></returns>
        [Route("api/KOPsFab/BorradoLogicoKOPMultivalorPosicion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public Task<bool> BorradoLogicoKOPMultivalorPosicion(dynamic datos)
        {
            try
            {
                return _kop.BorradoLogicoKOPMultivalorPosicion(datos);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.BorradoLogicoKOPMultivalorPosicion", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UNA"));
            }
        }

        /// <summary>
        /// Metodo que devuelve la lista de KOPS multivalor por la zona 
        /// </summary>
        [Route("api/KOPsFab/ObtenerMaximoNumeroPosicionSegunMosto/{IdKOPMultivalor}/{IdSubProceso}/{IdMosto}/{IdZona}/{IdTipo}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<int> ObtenerMaximoNumeroPosicionSegunMosto(int IdKOPMultivalor, int IdSubProceso, string IdMosto, int IdZona,int IdTipo)
        {
            try
            {
                int result = await _kop.ObtenerMaximoNumeroPosicionSegunMosto(IdKOPMultivalor, IdSubProceso, IdMosto, IdZona, IdTipo);
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.getValCurvaOrden", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerMaximoNumeroPosicionSegunMosto", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_VALORES"));
            }
        }

        /// <summary>
        /// Funcion que devuelve la lista de mostos para el formulario de crear una posicion en el KOPMultivalor
        /// </summary>
        /// returns Lista de mostos
        [Route("api/KOPsFab/CrearPosicionKopMultivalor")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<Object> CrearPosicionKopMultivalor(DTO_KOPs_Config datos)
        {
            Object result;
            try
            {
                if (KOPs_Servicios.ValidacionValoresKOPs(datos))
                {
                    result = await _kop.CrearPosicionKopMultivalor(datos);
                    if (result != null)
                    {
                        result = new Object[] { true, Resources.idioma.ACTUALIZANDO_OK };
                    }
                    else
                    {
                        result = new Object[] { false, Resources.idioma.ERROR_API_FABRICACION };
                    }
                }
                else
                {
                    result = new object[] { false, Resources.idioma.VALOR_NO_DECIMAL };
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.CrearPosicionKopMultivalor", "WEB-FABRICACION", "Sistema");
                result = new Object[] { false, ex.Message };
            }
            return result;
        }

        /// <summary>
        /// Funcion actualiza la posicion seleccionada de un KOPMultivalor
        /// </summary>
        /// returns Lista de mostos
        [Route("api/KOPsFab/ActualizarPosicionKOPMultivalor")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<Object> ActualizarPosicionKOPMultivalor(DTO_KOPs_Config datos)
        {
            Object result;
            try
            {
                if (KOPs_Servicios.ValidacionValoresKOPs(datos))
                {
                    result = await _kop.ActualizarPosicionKOPMultivalor(datos);
                    if (result != null)
                    {
                        result = new Object[] { true, Resources.idioma.ACTUALIZANDO_OK };
                    }
                    else
                    {
                        result = new Object[] { false, Resources.idioma.ERROR_API_FABRICACION };
                    }
                }
                else
                {
                    result = new object[] { false, Resources.idioma.VALOR_NO_DECIMAL };
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ActualizarPosicionKOPMultivalor", "WEB-FABRICACION", "Sistema");
                result = new Object[] { false, ex.Message };
            }
            return result;
        }

        /// <summary>
        /// Función que importa los KOPs Museleccionados en los mostos seleccionados según su zona
        /// </summary>
        /// returns Lista de mostos
        [Route("api/ImportarKOPSMultivalorPorDefectoAMostos")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<bool> ImportarKOPSMultivalorPorDefectoAMostos([FromBody] DTO_ImportarKOPs Datos)
        {
            try
            {
                return await _kop.ImportarKOPSMultivalorPorDefectoAMostos(Datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "KOPSFabController.ObtenerMostos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ImportarKOPSMultivalorPorDefectoAMostos", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MOSTOS"));
            }

        }

        /// <summary>
        /// Método que devuelve los códigos de KOP y su descripción por tipo de WO
        /// </summary>
        /// <param name="idTipoWO"></param>
        /// <returns>Lista de códigos de KOP</returns>
        [Route("api/KOPS/ObtenerKOPSPorTipoWO/{idTipoWO}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_14_GestionCapturaKOPsLIMs, Funciones.FAB_PROD_RES_14_VisualizacionCapturaKOPsLIMs)]
        public async Task<IHttpActionResult> ObtenerKOPSPorTipoWO(int idTipoWO)
        {
            try
            {
                var result = await _kop.ObtenerKOPSPorTipoWO(idTipoWO);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerKOPSPorTipoWO", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_KOPS"));
            }
        }

        /// <summary>
        /// Método que devuelve la configuración en relación a la captura de KOPs en LIMs
        /// </summary>
        /// <returns>Lista con los datos solicitados</returns>
        [Route("api/KOPS/ObtenerConfiguracionCapturaKOPSLIMS")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_14_VisualizacionCapturaKOPsLIMs)]
        public async Task<IHttpActionResult> ObtenerConfiguracionCapturaKOPSLIMS()
        {
            try
            {
                var result = await _kop.ObtenerConfiguracionCapturaKOPSLIMS();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "KOPSFabController.ObtenerConfiguracionCapturaKOPSLIMS", "WEB-FABRICACION", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONFIGURACION"));
            }
        }

        /// <summary>
        /// Método que inserta una captura de KOP
        /// </summary>
        /// <param name="datos"></param>
        /// <returns>Verdadero si ha ido bien, falso si ha habido error</returns>
        [Route("api/KOPS/InsertarCapturaKOPSLIMS")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_14_GestionCapturaKOPsLIMs)]
        public async Task<IHttpActionResult> InsertarCapturaKOPSLIMS([FromBody] DTO_ConfiguracionCapturaKOPSLIMS datos)
        {
            var result = await _kop.InsertarCapturaKOPSLIMS(datos);

            if (!result)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_GUARDAR"),
                    "KOPSFabController.InsertarCapturaKOPSLIMS", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
            }

            return Json(result);
        }

        /// <summary>
        /// Método que actualiza una captura de KOP
        /// </summary>
        /// <param name="datos">Datos de la captura de KOP a actualizar</param>
        /// <returns>Verdadero si ha ido bien, falso si ha habido error</returns>
        [Route("api/KOPS/ActualizarCapturaKOPSLIMS")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_14_GestionCapturaKOPsLIMs)]
        public async Task<IHttpActionResult> ActualizarCapturaKOPSLIMS([FromBody] DTO_ConfiguracionCapturaKOPSLIMS datos)
        {
            var result = await _kop.ActualizarCapturaKOPSLIMS(datos);

            if (!result)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_AL_MODIFICAR_LOS"),
                    "KOPSFabController.ActualizarCapturaKOPSLIMS", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
            }

            return Json(result);
        }

        /// <summary>
        /// Método que elimina una captura de KOP
        /// </summary>
        /// <param name="idConfig"></param>
        /// <returns>Verdadero si ha ido bien, falso si ha habido error</returns>
        [Route("api/KOPS/EliminarCapturaKOPSLIMS/{idConfig}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_RES_14_GestionCapturaKOPsLIMs)]
        public async Task<IHttpActionResult> EliminarCapturaKOPSLIMS([FromUri] int idConfig)
        {
            var result = await _kop.EliminarCapturaKOPSLIMS(idConfig);
            
            if (result)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "KOPSFabController.EliminarCapturaKOPSLIMS",
                    IdiomaController.GetResourceName("ELIMINACION_OK"), HttpContext.Current.User.Identity.Name);
            }
            else
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ELIMINACION_NO_OK"),
                    "KOPSFabController.EliminarCapturaKOPSLIMS", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
            }

            return Json(result);
        }

        /// <summary>
        /// Metodo crea plantillas KOPs de un material
        /// </summary>
        /// <returns>Lista con los datos solicitados</returns>
        [Route("api/CrearPlantillasKOPsMaterial/{idMosto}/{idZona}/{idTipoWO}/{tipoKOPs}")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_2_GestionKOPs, Funciones.FAB_PROD_RES_10_GestionKOPsMultivalor)]
        public async Task<IHttpActionResult> CrearPlantillasKOPsMaterial(string idMosto, string idZona, int idTipoWO, string tipoKOPs)
        {
            try
            {
                var result = await _kop.CrearPlantillasKOPsMaterial(idMosto, idZona, idTipoWO, tipoKOPs);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR") + " " + IdiomaController.GetResourceName("INSERTAR"),
                "KOPSFabController.CrearPlantillasKOPsMaterial", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                return BadRequest();
            }
        }
    }
}