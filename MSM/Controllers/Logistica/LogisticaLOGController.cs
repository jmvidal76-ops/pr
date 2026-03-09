using MSM.BBDD.Logistica;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Logistica;
using MSM.Models.Fabricacion;
using MSM.Models.Logistica;
using MSM.Security;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Logistica
{
    public class LogisticaLOGController : ApiController
    {

        #region PANTALLA DESLIZANTE

        [Route("api/GetDiasSemana")]
        [HttpGet]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public List<DiasSemanaDeslizante> GetDiasSemana()
        {
            try
            {
                return DAO_Logistica.GetDiasSemana();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.GetDiasSemana", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GetParamGeneral")]
        [HttpGet]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public List<DeslizanteGeneral> GetParamGeneral()
        {
            try
            {
                return DAO_Logistica.GetParamGeneral();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.GetParamGeneral", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/AddParamGeneral")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_1_GestionDeslizante)]
        public string AddParamGeneral(dynamic item)
        {
            return DAO_Logistica.AddParamGeneral(item);
        }

        [Route("api/UpdateParamGeneral")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_1_GestionDeslizante)]
        public string UpdateParamGeneral(dynamic item)
        {
            return DAO_Logistica.UpdateParamGeneral(item);
        }

        [Route("api/DeleteParamGeneral")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_1_GestionDeslizante)]
        public string DeleteParamGeneral(dynamic item)
        {
            return DAO_Logistica.DeleteParamGeneral(item);
        }

        [Route("api/GetParamFormatos")]
        [HttpGet]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public List<DeslizanteFormatos> GetParamFormatos()
        {
            try
            {
                return DAO_Logistica.GetParamFormatos();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.GetParamFormatos", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/AddParamFormato")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_1_GestionDeslizante)]
        public string AddParamFormato(dynamic item)
        {
            return DAO_Logistica.AddParamFormato(item);
        }

        [Route("api/UpdateParamFormato")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_1_GestionDeslizante)]
        public string UpdateParamFormato(dynamic item)
        {
            return DAO_Logistica.UpdateParamFormato(item);
        }

        [Route("api/DeleteParamFormato")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_1_GestionDeslizante)]
        public string DeleteParamFormato(dynamic item)
        {
            return DAO_Logistica.DeleteParamFormato(item);
        }

        [Route("api/GetProductos")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public List<ProductoDeslizante> GetProductos()
        {
            try
            {
                return DAO_Logistica.GetProductos();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LogisticaLOGController.GetProductos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.GetProductos", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GetParamProductos")]
        [HttpGet]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public List<DeslizanteProductos> GetParamProductos()
        {
            try
            {
                return DAO_Logistica.GetParamProductos();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.GetParamProductos", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/AddParamProducto")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_1_GestionDeslizante)]
        public string AddParamProducto(dynamic item)
        {
            return DAO_Logistica.AddParamProducto(item);
        }

        [Route("api/DeleteParamProducto")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_1_GestionDeslizante)]
        public string DeleteParamProducto(dynamic item)
        {
            return DAO_Logistica.DeleteParamProducto(item);
        }

        [Route("api/GetInstantaneas")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public List<InstantaneaDeslizante> GetInstantaneas(dynamic item)
        {
            try
            {
                return DAO_Logistica.GetInstantaneas(item);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LogisticaLOGController.GetInstantaneas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.GetInstantaneas", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/SetInstantanea")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_1_GestionDeslizante)]
        public bool SetInstantanea(dynamic item)
        {
            try
            {
                return DAO_Logistica.SetInstantanea(item);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LogisticaLOGController.SetInstantanea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.SetInstantanea", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GetDeslizanteCerveza")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public List<DeslizanteCerveza> GetDeslizanteCerveza(dynamic semanas)
        {
            try
            {
                List<int> listaSemanas = new List<int>();

                foreach (var semana in semanas)
                {
                    listaSemanas.Add(Convert.ToInt32(semana.Value));
                }

                return DAO_Logistica.GetDeslizanteCerveza(listaSemanas);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.GetDeslizanteCerveza", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GetDeslizanteEnvasado")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public List<DeslizanteEnvasado> GetDeslizanteEnvasado(dynamic semanas)
        {
            try
            {
                List<int> listaSemanas = new List<int>();

                foreach (var semana in semanas)
                {
                    listaSemanas.Add(Convert.ToInt32(semana.Value));
                }

                return DAO_Logistica.GetDeslizanteEnvasado(listaSemanas);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "LogisticaLOGController.GetDeslizanteEnvasado", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/GetDeslizanteEnvasadoHl")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public List<DeslizanteEnvasadoHl> GetDeslizanteEnvasadoHl(dynamic semanas)
        {
            try
            {
                List<int> listaSemanas = new List<int>();

                foreach (var semana in semanas)
                {
                    listaSemanas.Add(Convert.ToInt32(semana.Value));
                }

                return DAO_Logistica.GetDeslizanteEnvasadoHl(listaSemanas);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "LogisticaLOGController.GetDeslizanteEnvasadoHl", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/ShowInstantanea")]
        [HttpPost]
        [ApiAuthorize(Funciones.GEN_PROD_SCH_2_VisualizacionDeslizante)]
        public DatosInstantaneaDeslizante ShowInstantanea(dynamic item)
        {
            try
            {
                return DAO_Logistica.ShowInstantanea(item);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LogisticaFABController.GetParamVolumen", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "LogisticaLOGController.ShowInstantanea", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        #endregion PANTALLA DESLIZANTE
        
        #region PANTALLA ADHERENCIA

        #region VISTA ADHERENCIA VOLUMEN

        [Route("api/GetDesvVolumen")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_2_VisualizacionAdherenciaVolumen)]
        public List<AdherenciaDesvVolumen> GetDesviacionVolumen(dynamic item)
        {
            try
            {
                return DAO_Logistica.GetDesviacionVolumen(item);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LogisticaFABController.GetDesvTmp", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.GetDesviacionVolumen", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/SetDesvVol")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_2_GestionAdherenciaVolumen)]
        public string SetDesvVolumen(dynamic item)
        {
            try
            {
                return DAO_Logistica.SetDesvVolumen(item);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LogisticaFABController.SetDesvTmp", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.SetDesvVolumen", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GetParametrosAdherenciaVolumen")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_2_VisualizacionAdherenciaVolumen)]
        public List<AdherenciaParametros> ObtenerParametrosAdherenciaVolumen()
        {
            try
            {
                var lista = DAO_Logistica.ObtenerParametrosAdherenciaVolumen();
                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerParametrosAdherenciaVolumen", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        #endregion VISTA ADHERENCIA VOLUMEN

        #region VISTA ADHERENCIA SECUENCIA

        [Route("api/GetDesviacionSecuencia")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_6_VisualizacionAdherenciaSecuencia)]
        public List<DTO_AdherenciaDesviacionSecuencia> ObtenerDesviacionSecuencia(dynamic item)
        {
            try
            {
                var lista = DAO_Logistica.ObtenerDesviacionSecuencia(item);
                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerDesviacionSecuencia", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/SetDesviacionSecuencia")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_6_GestionAdherenciaSecuencia)]
        public string SetDesviacionSecuencia(dynamic item)
        {
            try
            {
                return DAO_Logistica.SetDesviacionSecuencia(item);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.SetDesviacionSecuencia", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GetParametrosAdherenciaSecuencia")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_6_VisualizacionAdherenciaSecuencia)]
        public List<AdherenciaParametros> ObtenerParametrosAdherenciaSecuencia()
        {
            try
            {
                var lista = DAO_Logistica.ObtenerParametrosAdherenciaSecuencia();
                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerParametrosAdherenciaSecuencia", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        #endregion VISTA ADHERENCIA SECUENCIA

        #region VISTA ADHERENCIA CONGELADO

        [Route("api/GetDesviacionCongelado")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_8_VisualizacionAdherenciaCongelado)]
        public List<DTO_AdherenciaDesviacionCongelado> ObtenerDesviacionCongelado(dynamic item)
        {
            try
            {
                var lista = DAO_Logistica.ObtenerDesviacionCongelado(item);
                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerDesviacionCongelado", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/SetDesviacionCongelado")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_8_GestionAdherenciaCongelado)]
        public string SetDesviacionCongelado(dynamic item)
        {
            try
            {
                return DAO_Logistica.SetDesviacionCongelado(item);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.SetDesviacionCongelado", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GetParametrosAdherenciaCongelado")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_8_VisualizacionAdherenciaCongelado)]
        public List<AdherenciaParametros> ObtenerParametrosAdherenciaCongelado()
        {
            try
            {
                var lista = DAO_Logistica.ObtenerParametrosAdherenciaCongelado();
                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerParametrosAdherenciaCongelado", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        #endregion VISTA ADHERENCIA CONGELADO

        #region CONFIGURACION MOTIVOS

        [Route("api/GetMotivosAdherencia")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_2_VisualizacionAdherenciaVolumen, Funciones.LOG_PROD_SCH_6_VisualizacionAdherenciaSecuencia, Funciones.LOG_PROD_SCH_7_VisualizacionAdherenciaConfigMotivos)]
        public List<AdherenciaMotivos> GetMotivosAdherencia([FromUri] bool verInactivos = false)
        {
            try
            {
                return DAO_Logistica.GetMotivosAdherencia(verInactivos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LogisticaFABController.GetMotivosAdherencia", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.GetMotivosAdherencia", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/SetMotivosAdherencia")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_7_GestionAdherenciaConfigMotivos)]
        public string SetMotivosAdherencia(dynamic item)
        {
            try
            {
                return DAO_Logistica.SetMotivosAdherencia(item);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LogisticaFABController.SetMotivosAdherencia", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.SetMotivosAdherencia", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }
        #endregion CONFIGURACION MOTIVOS

        #region PARAMETROS

        [Route("api/EditarParametrosAdherencia")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_2_GestionAdherenciaVolumen)]
        public string EditarParametrosAdherencia(dynamic item)
        {
            try
            {
                return DAO_Logistica.EditarParametrosAdherencia(item);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.EditarParametrosAdherencia", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }
        #endregion PARAMETROS

        #endregion PANTALLA ADHERENCIA

        #region PANTALLA CONTROL STOCK MERMAS

        [Route("api/ObtenerMermasStockVacio")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_VisualizacionControlStockVacio)]
        public List<DTO_MermasStockVacio> ObtenerMermasStockVacio()
        {
            try
            {
                DAO_Logistica daoLogistica = new DAO_Logistica();
                List<DTO_MermasStockVacio> lista = daoLogistica.ObtenerMermasStockVacio();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerMermasStockVacio", "WEB-LOGISTICA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MERMAS_STOCK_VACIO"));
            }
        }

        [Route("api/EditarMerma")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio)]
        public bool EditarMerma(MermasStockVacio merma)
        {
            DAO_Logistica daoLogistica = new DAO_Logistica();
            return daoLogistica.GuardarMerma(merma);
        }

        [Route("api/AsignarMermas")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio)]
        public bool AsignarMermas(dynamic datos)
        {
            try
            {
                DAO_Logistica daoLogistica = new DAO_Logistica();

                foreach (var item in datos.Cambios)
                {
                    MermasStockVacio merma = new MermasStockVacio();
                    merma.Linea = item.Linea;
                    merma.Producto = item.Producto;
                    merma.Merma = datos.Merma.Value == string.Empty ? 0 : decimal.Parse(datos.Merma.Value.ToString());

                    daoLogistica.GuardarMerma(merma);
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.AsignarMermas", "WEB-LOGISTICA", "Sistema");
                return false;
            }
        }

        [Route("api/ObtenerMovimientosVacio")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_VisualizacionControlStockVacio)]
        public List<DTO_MovimientosVacio> ObtenerMovimientosVacio(dynamic datos)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                DateTime fechaInicio = ((DateTime)datos.fechaInicio.Value).ToLocalTime();
                DateTime fechaFin = ((DateTime)datos.fechaFin.Value).ToLocalTime();

                DAO_Logistica daoLogistica = new DAO_Logistica();
                List<DTO_MovimientosVacio> lista = daoLogistica.ObtenerMovimientosVacio(fechaInicio.Date, fechaFin.Date);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerMovimientosVacio", "WEB-LOGISTICA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MOVIMIENTOS_VACIO"));
            }
        }

        [Route("api/ObtenerCajas")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_VisualizacionControlStockVacio)]
        public IEnumerable ObtenerCajas()
        {
            try
            {
                DAO_Logistica daoLogistica = new DAO_Logistica();
                IEnumerable lista = daoLogistica.ObtenerCajas();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerCajas", "WEB-LOGISTICA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CAJAS"));
            }
        }

        [Route("api/ObtenerWOConsumoCajaVacia")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_VisualizacionControlStockVacio)]
        public IEnumerable ObtenerWOConsumoCajaVacia()
        {
            try
            {
                DAO_Logistica daoLogistica = new DAO_Logistica();
                IEnumerable lista = daoLogistica.ObtenerWOConsumoCajaVacia();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerWOConsumoCajaVacia", "WEB-LOGISTICA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }
        }

        [Route("api/GuardarAjusteManual")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio)]
        public bool GuardarAjusteManual(dynamic datos)
        {
            DAO_Logistica daoLogistica = new DAO_Logistica();
            return daoLogistica.GuardarAjusteManual(datos.idCaja.Value.ToString(), (int)datos.cantidad.Value);
        }

        [Route("api/GuardarConsumoCajaVacia")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio)]
        public bool GuardarConsumoCajaVacia(dynamic datos)
        {
            DAO_Logistica daoLogistica = new DAO_Logistica();
            return daoLogistica.GuardarConsumoCajaVacia(datos.wo.Value.ToString(), datos.idCaja.Value.ToString(), (int)datos.cantidad.Value);
        }

        [Route("api/RecalcularStock")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio)]
        public bool RecalcularStock()
        {
            DAO_Logistica daoLogistica = new DAO_Logistica();
            return daoLogistica.RecalcularStock();
        }

        [Route("api/GetParametrosStockVacio")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio, Funciones.LOG_PROD_SCH_3_VisualizacionControlStockVacio,
            Funciones.LOG_PROD_SCH_4_GestionPrevisionStockVacio, Funciones.LOG_PROD_SCH_4_VisualizacionPrevisionStockVacio)]
        public List<StockVacioParametros> ObtenerParametrosStockVacio()
        {
            try
            {
                var lista = DAO_Logistica.ObtenerParametrosStockVacio();
                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerParametrosStockVacio", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/EditarParametrosStockVacio")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio)]
        public string EditarParametrosStockVacio(dynamic item)
        {
            try
            {
                return DAO_Logistica.EditarParametrosStockVacio(item);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.EditarParametrosStockVacio", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GetStockFinal")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio)]
        public int ObtenerStockFinal(dynamic item)
        {
            try
            {
                var stockFinal = DAO_Logistica.ObtenerStockFinal(item.idCaja.Value.ToString());
                return stockFinal;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerStockFinal", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GetPrevisionStock")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_4_VisualizacionPrevisionStockVacio)]
        public List<PrevisionStockVacio> ObtenerPrevisionStock(dynamic datos)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                DateTime fechaInicio = ((DateTime)datos.fechaInicio.Value).ToLocalTime().Date;
                DateTime fechaFin = ((DateTime)datos.fechaFin.Value).ToLocalTime().Date;

                var lista = DAO_Logistica.ObtenerPrevisionStock(fechaInicio, fechaFin);
                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerPrevisionStock", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/RecalcularPrevisionStock")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_4_GestionPrevisionStockVacio)]
        public bool RecalcularPrevisionStock()
        {
            DAO_Logistica daoLogistica = new DAO_Logistica();
            return daoLogistica.RecalcularPrevisionStock();
        }

        [Route("api/ObtenerMinimosMaximosStock")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_VisualizacionControlStockVacio)]
        public List<StockVacioMinimosMaximos> ObtenerMinimosMaximosStock()
        {
            try
            {
                DAO_Logistica daoLogistica = new DAO_Logistica();
                List<StockVacioMinimosMaximos> lista = daoLogistica.ObtenerMinimosMaximosStock();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerMinimosMaximosStock", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/GuardarMinimosMaximosStock")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio)]
        public int GuardarMinimosMaximosStock(dynamic datos)
        {
            DAO_Logistica daoLogistica = new DAO_Logistica();
            return daoLogistica.GuardarMinimosMaximosStock(datos);
        }

        [Route("api/GuardarImportarStock")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_3_GestionControlStockVacio)]
        public int GuardarImportarStock(dynamic datos)
        {
            DAO_Logistica daoLogistica = new DAO_Logistica();
            return daoLogistica.GuardarImportarStock(datos);
        }

        #endregion

        #region PANTALLA DUOTANK

        [Route("api/ObtenerDuotankMatriculas")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_5_VisualizacionDuotank)]
        public List<DuotankMatriculas> ObtenerDuotankMatriculas()
        {
            try
            {
                return DAO_Logistica.ObtenerDuotankMatriculas();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerDuotankMatriculas", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/ObtenerDuotankDatos")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_5_VisualizacionDuotank)]
        public Task<List<DuotankInfo>> ObtenerDuotankDatos()
        {
            try
            {
                return DAO_Logistica.ObtenerDuotankDatos();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerDuotankDatos", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/ObtenerDuotankHistorico")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_SCH_9_VisualizacionDuotankHistorico)]
        public List<DTO_DuotankHistorico> ObtenerDuotankHistorico(DateTime fechaDesde, DateTime fechaHasta)
        {
            try
            {
                return DAO_Logistica.ObtenerDuotankHistorico(fechaDesde, fechaHasta);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerDuotankHistorico", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        #endregion

        #region PANTALLA OEE PLANIFICACION
        [Route("api/ObtenerDatosOEEPlanificaciones")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_GES_1_VisualizacionOEEPlanificacion)]
        public IHttpActionResult ObtenerDatosOEEPlanificaciones()
        {
            try
            {
                return Ok(DAO_Logistica.ObtenerDatosOEEPlanificaciones());
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_OEE_PLANIFICACIONES"));
            }
        }

        [Route("api/EjecutarJobActualizarOEEPlanificaciones")]
        [HttpPost]
        [ApiAuthorize(Funciones.LOG_PROD_GES_1_GestionOEEPlanificacion)]
        public IHttpActionResult EjecutarJobActualizarOEEPlanificaciones()
        {
            try
            {
                return Ok(DAO_Logistica.EjecutarJobActualizarOEEPlanificaciones());
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_EJECUTANDO_JOB_OEE_PLANIFICACIONES"));
            }
        }

        [Route("api/EditarOEEPlanificaciones")]
        [HttpPut]
        [ApiAuthorize(Funciones.LOG_PROD_GES_1_GestionOEEPlanificacion)]
        public IHttpActionResult EditarOEEPlanificaciones(List<DTO_OEEPlanificaciones> data)
        {
            try
            {
                return Ok(DAO_Logistica.EditarOEEPlanificaciones(data));
            }
            catch (Exception ex)
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_AL_MODIFICAR_OEE_PLANIFICADO"));
            }
        }

        [Route("api/ObtenerConfiguracionOEEPlanificacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.LOG_PROD_GES_1_VisualizacionOEEPlanificacion)]
        public List<DTO_OEEPlanificacionConfig> ObtenerConfiguracionOEEPlanificacion()
        {
            try
            {
                return DAO_Logistica.ObtenerConfiguracionOEEPlanificacion();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LogisticaLOGController.ObtenerConfiguracionOEEPlanificacion", "WEB-LOGISTICA", "Sistema");
                throw ex;
            }
        }

        [Route("api/EditarValorDesviacion")]
        [HttpPut]
        [ApiAuthorize(Funciones.LOG_PROD_GES_1_GestionOEEPlanificacion)]
        public bool EditarValorDesviacion(DTO_OEEPlanificacionConfig datosOEEConfig)
        {
            return DAO_Logistica.EditarValorDesviacion(datosOEEConfig);
        }
        #endregion
    }
}