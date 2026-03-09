using MSM.BBDD.Alt;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Envasado;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Alt
{
    public class AnaliticasO2Controller : ApiController
    {
        private readonly IDAO_AnaliticasO2 _iDAOAnaliticas;

        public AnaliticasO2Controller(IDAO_AnaliticasO2 iDAOAnaliticas)
        {
            _iDAOAnaliticas = iDAOAnaliticas;
        }

        [Route("api/ObtenerAnaliticasO2")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_10_VisualizacionO2CO2LlenadorasPortal)]
        public List<O2_Llenadoras> ObtenerAnaliticasO2(dynamic datos)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                DateTime fechaI = ((DateTime)datos.fechaInicio.Value);
                DateTime fechaF = ((DateTime)datos.fechaFin.Value);
                int horasI = TimeZoneInfo.Local.GetUtcOffset(fechaI.Date).Hours;
                DateTime fechaInicio = fechaI.Date.AddHours(-horasI);
                int horasF = TimeZoneInfo.Local.GetUtcOffset(fechaF.Date).Hours;
                DateTime fechaFin = fechaF.Date.AddHours(-horasF).AddDays(1).AddTicks(-1);

                DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
                var lista = daoAnaliticas.ObtenerAnaliticasO2(fechaInicio, fechaFin);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AnaliticasO2Controller.ObtenerAnaliticasO2", "WEB-CALIDAD", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER_ANALITICAS"));
            }
        }

        [Route("api/ObtenerUnidadesAnalitica")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_9_GestionO2CO2Llenadoras)]
        public List<TiposUnidades> ObtenerUnidadesAnalitica()
        {
            try
            {
                DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
                var lista = daoAnaliticas.ObtenerUnidadesAnalitica();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AnaliticasO2Controller.ObtenerUnidadesAnalitica", "WEB-CALIDAD", "Sistema");
                throw ex;
            }
        }

        [Route("api/GuardarAnaliticaO2")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_9_GestionO2CO2Llenadoras)]
        public string GuardarAnaliticaO2(O2_Llenadoras datos)
        {
            DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
            var correcto = daoAnaliticas.GuardarAnaliticaO2(datos);

            return correcto;
        }

        [Route("api/GuardarAnaliticasO2Importar")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_9_GestionO2CO2Llenadoras)]
        public int GuardarAnaliticasO2Importar(dynamic datos)
        {
            DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
            return daoAnaliticas.GuardarAnaliticasO2Importar(datos);
        }

        [Route("api/EliminarAnaliticaO2")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_9_GestionO2CO2Llenadoras)]
        public bool EliminarAnaliticaO2(O2_Llenadoras datos)
        {
            DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
            var correcto = daoAnaliticas.EliminarAnaliticaO2(datos);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AnaliticasO2Controller.EliminarAnaliticaO2", IdiomaController.GetResourceName("SE_HA_ELIMINADO_ANALITICA") + datos.IdMuestra, HttpContext.Current.User.Identity.Name);
            }
            else
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_ELIMINAR_ANALITICA"), "AnaliticasO2Controller.EliminarAnaliticaO2", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }

        [Route("api/ObtenerAnaliticasO2Terminal/{linea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_11_VisualizacionO2CO2LlenadorasTerminal)]
        public List<O2_Llenadoras> ObtenerAnaliticasO2Terminal(string linea)
        {
            try
            {
                DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
                var lista = daoAnaliticas.ObtenerAnaliticasO2Terminal(linea);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AnaliticasO2Controller.ObtenerAnaliticasO2Terminal", "WEB-CALIDAD", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER_ANALITICAS"));
            }
        }

        [Route("api/ObtenerToleranciasO2")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_10_VisualizacionO2CO2LlenadorasPortal, Funciones.CEL_11_VisualizacionO2CO2LlenadorasTerminal)]
        public List<O2_Llenadoras_Tolerancias> ObtenerToleranciasO2()
        {
            try
            {
                DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
                var lista = daoAnaliticas.ObtenerToleranciasO2();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AnaliticasO2Controller.ObtenerToleranciasO2", "WEB-CALIDAD", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER_TOLERANCIAS_O2"));
            }
        }

        [Route("api/EditarToleranciasO2")]
        [HttpPut]
        [ApiAuthorize(Funciones.CEL_9_GestionO2CO2Llenadoras)]
        public bool EditarToleranciasO2(O2_Llenadoras_Tolerancias tolerancia)
        {
            DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
            return daoAnaliticas.EditarToleranciasO2(tolerancia);
        }

        [Route("api/ObtenerParametrosO2")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_10_VisualizacionO2CO2LlenadorasPortal, Funciones.CEL_11_VisualizacionO2CO2LlenadorasTerminal)]
        public List<O2_Llenadoras_Parametros> ObtenerParametrosO2()
        {
            try
            {
                DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
                var lista = daoAnaliticas.ObtenerParametrosO2();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AnaliticasO2Controller.ObtenerParametrosO2", "WEB-CALIDAD", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER_PARAMETROS_O2"));
            }
        }

        [Route("api/EditarParametrosO2")]
        [HttpPut]
        [ApiAuthorize(Funciones.CEL_9_GestionO2CO2Llenadoras)]
        public bool EditarParametrosO2(O2_Llenadoras_Parametros parametro)
        {
            DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
            return daoAnaliticas.EditarParametrosO2(parametro);
        }

        [Route("api/ObtenerToleranciasCO2")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_10_VisualizacionO2CO2LlenadorasPortal, Funciones.CEL_11_VisualizacionO2CO2LlenadorasTerminal)]
        public List<O2_Llenadoras_ToleranciasCO2> ObtenerToleranciasCO2()
        {
            try
            {
                DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
                var lista = daoAnaliticas.ObtenerToleranciasCO2();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AnaliticasO2Controller.ObtenerToleranciasCO2", "WEB-CALIDAD", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER_TOLERANCIAS_CO2"));
            }
        }

        [Route("api/EditarToleranciasCO2")]
        [HttpPut]
        [ApiAuthorize(Funciones.CEL_9_GestionO2CO2Llenadoras)]
        public bool EditarToleranciasCO2(O2_Llenadoras_ToleranciasCO2 tolerancia)
        {
            DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
            return daoAnaliticas.EditarToleranciasCO2(tolerancia);
        }

        [Route("api/EditarPresion")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_15_GestionO2CO2LlenadorasTerminal)]
        public bool EditarPresion(dynamic datos)
        {
            DAO_AnaliticasO2 daoAnaliticas = new DAO_AnaliticasO2();
            var correcto = daoAnaliticas.EditarPresion(datos);

            return correcto;
        }

        [Route("api/O2Llenadoras/TPO")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_10_VisualizacionO2CO2LlenadorasPortal,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerTPO_O2Llenadoras(string linea, DateTime desde, DateTime hasta)
        {
            try
            {
                decimal result = await _iDAOAnaliticas.ObtenerTPO_O2Llenadoras(linea, desde, hasta);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AnaliticasO2Controller.ObtenerTPO_O2Llenadoras", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_TPO_TURNO"));
                
            }
        }

        [Route("api/ObtenerVariacionGasesArranques")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_18_VisualizacionVariacionGasesArranques)]
        public async Task<IHttpActionResult> ObtenerVariacionGasesArranques([FromUri] DateTime fechaDesde, [FromUri] DateTime fechaHasta)
        {            
            try
            {
                var _result = await _iDAOAnaliticas.ObtenerVariacionGasesArranquesEnvasado(fechaDesde, fechaHasta);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AnaliticasO2Controller.ObtenerVariacionGasesArranques", "WEB-CALIDAD", "Sistema");
                return BadRequest();
            }
        }
    }
}