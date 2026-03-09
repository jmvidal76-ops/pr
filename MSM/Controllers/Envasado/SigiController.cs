using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Security;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class SigiController : ApiController
    {
        [Route("api/ObtenerLineas")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_VisualizacionControlSecuenciacion, Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public List<SIGI_Configuracion> ObtenerLineas()
        {
            try
            {
                DAO_Sigi daoSigi = new DAO_Sigi();
                var lista = daoSigi.ObtenerLineas();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "SIGI - " + ex.Message + " -> " + ex.StackTrace, "SigiController.ObtenerLineas", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/ObtenerDatosSecuenciacionMES")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_VisualizacionControlSecuenciacion, Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public List<SIGI_SecuenciacionMES> ObtenerDatosSecuenciacionMES(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.linea;

            try
            {
                DAO_Sigi daoSigi = new DAO_Sigi();
                var lista = daoSigi.ObtenerDatosSecuenciacionMES(idEtiquetaSIGI);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "SIGI - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + ex.Message + " -> " + ex.StackTrace, "SigiController.ObtenerDatosSecuenciacionMES", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/ObtenerDatosSecuenciacionSIGI")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_VisualizacionControlSecuenciacion, Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public List<SIGI_SecuenciacionSIGI> ObtenerDatosSecuenciacionSIGI(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.linea;

            try
            {
                DAO_Sigi daoSigi = new DAO_Sigi();
                var lista = daoSigi.ObtenerDatosSecuenciacionSIGI(idEtiquetaSIGI);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "SIGI - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + ex.Message + " -> " + ex.StackTrace, "SigiController.ObtenerDatosSecuenciacionSIGI", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/ObtenerProductosSecuenciacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_VisualizacionControlSecuenciacion, Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public IEnumerable ObtenerProductosSecuenciacion(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.linea;

            try
            {
                DAO_Sigi daoSigi = new DAO_Sigi();
                var lista = daoSigi.ObtenerProductosSecuenciacion(idEtiquetaSIGI);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "SIGI - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + ex.Message + " -> " + ex.StackTrace, "SigiController.ObtenerProductosSecuenciacion", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_PRODUCTOS"));
            }
        }

        [Route("api/ObtenerCajasSecuenciacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_VisualizacionControlSecuenciacion, Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public IEnumerable ObtenerCajasSecuenciacion(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.linea;

            try
            {
                DAO_Sigi daoSigi = new DAO_Sigi();
                var lista = daoSigi.ObtenerCajasSecuenciacion(idEtiquetaSIGI);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "SIGI - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + ex.Message + " -> " + ex.StackTrace, "SigiController.ObtenerCajasSecuenciacion", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CAJAS"));
            }
        }

        [Route("api/GuardarProductoCaja")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public bool GuardarProductoCaja(dynamic datos)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var correcto = daoSigi.GuardarProductoCaja(datos);

            return correcto;
        }

        [Route("api/CambiarOrdenSIGI")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public bool CambiarOrdenSIGI(dynamic datos)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var correcto = daoSigi.CambiarOrdenSIGI(datos);

            return correcto;
        }

        [Route("api/ActivarSecuenciaAutoSIGI")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public bool ActivarSecuenciaAutoSIGI(dynamic datos)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var correcto = daoSigi.ActivarSecuenciaAutoSIGI(datos);

            return correcto;
        }

        [Route("api/TransferirMES")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public bool TransferirMES(dynamic datos)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var correcto = daoSigi.TransferirMES(datos);

            return correcto;
        }

        [Route("api/EliminarProductoCaja")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public bool EliminarProductoCaja(SIGI_SecuenciacionSIGI datos)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var correcto = daoSigi.EliminarProductoCaja(datos);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "SigiController.EliminarProductoCaja", "SIGI - " + IdiomaController.GetResourceName("ELIMINACION_OK") + 
                    ". Producto: " + datos.ProductoCaja + " - " + datos.Descripcion + " de la línea " + datos.IdLinea, HttpContext.Current.User.Identity.Name);
            }
            else
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, "SIGI - " + IdiomaController.GetResourceName("ELIMINACION_NO_OK") + " de la línea " + datos.IdLinea + 
                    " para el ProductoCaja " + datos.ProductoCaja, "SigiController.EliminarProductoCaja", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }

        [Route("api/ObtenerConfiguracion")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_VisualizacionControlSecuenciacion, Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public SIGI_Configuracion ObtenerConfiguracion(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.idEtiquetaSIGI;

            try
            {
                DAO_Sigi daoSigi = new DAO_Sigi();
                var configuracion = daoSigi.ObtenerConfiguracion(idEtiquetaSIGI);

                return configuracion;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "SIGI - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + ex.Message + " -> " + ex.StackTrace, "SigiController.ObtenerConfiguracion", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/ObtenerSecuenciaActiva/{idEtiquetaSIGI}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_VisualizacionControlSecuenciacion, Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public bool ObtenerSecuenciaActiva(int idEtiquetaSIGI)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var activa = daoSigi.ObtenerSecuenciaActiva(idEtiquetaSIGI);

            return activa;
        }

        [Route("api/ObtenerInfoTrenes/{idEtiquetaSIGI}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_VisualizacionControlSecuenciacion, Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public List<string> ObtenerInfoTrenes(int idEtiquetaSIGI)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var info = daoSigi.ObtenerInfoTrenes(idEtiquetaSIGI);

            return info;
        }

        [Route("api/FijarValorProduccionSimultanea")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public bool FijarValorProduccionSimultanea(dynamic datos)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var correcto = daoSigi.FijarValorProduccionSimultanea(datos);

            return correcto;
        }

        [Route("api/TransferirSIGI")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_1_GestionControlSecuenciacion)]
        public bool TransferirSIGI(dynamic datos)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            var correcto = daoSigi.TransferirSIGI(datos);

            return correcto;
        }

        [Route("api/ObtenerConfiguracionBloqueoPalets")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_2_VisualizacionBloqueoPaletsParoLlenadora, Funciones.ENV_PROD_SIG_2_GestionBloqueoPaletsParoLlenadora)]
        public List<DTO_SIGIBloqueoPaletsParoLlenadora> ObtenerConfiguracionBloqueoPalets()
        {
            try
            {
                DAO_Sigi daoSigi = new DAO_Sigi();
                var lista = daoSigi.ObtenerConfiguracionBloqueoPalets();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "SIGI - " + ex.Message + " -> " + ex.StackTrace, "SigiController.ObtenerConfiguracionBloqueoPalets", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/EditarDatosBloqueoPalets")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_SIG_2_GestionBloqueoPaletsParoLlenadora)]
        public bool EditarDatosBloqueoPalets(DTO_SIGIBloqueoPaletsParoLlenadora datosBloqueoPalets)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            return daoSigi.EditarDatosBloqueoPalets(datosBloqueoPalets);
        }

        [Route("api/HacerBloqueoSIGI")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_15_GestionBloqueoPaletasTerminal)]
        public bool HacerBloqueoSIGI(DTO_SIGIBloqueo datos, string idLinea)
        {
            DAO_Sigi daoSigi = new DAO_Sigi();
            return daoSigi.HacerBloqueoSIGI(datos, idLinea);
        }
    }
}