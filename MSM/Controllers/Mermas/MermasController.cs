using Common.Models.Envasado;
using MSM.BBDD.Envasado;
using MSM.BBDD.Mermas;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Mappers.DTO.Mermas;
using MSM.Models.Envasado;
//using MSM.Models.Mermas;
using MSM.RealTime;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Mermas
{
    public class MermasController : ApiController
    {
        private readonly IDAO_Mermas _iDAOMermas;

        public MermasController(IDAO_Mermas iDAOMermas)
        {
            _iDAOMermas = iDAOMermas;
        }

        #region ENVASADO

            #region TERMINAL

        [Route("api/MermasTerminal/{linea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_2_VisualizacionMermasTerminal)]
        public IHttpActionResult ObtenerMermasTerminal(string linea, [FromUri] long idTurno, [FromUri] string claseMaquina)
        {
            List<DTO_MermasRegistro> lista = new List<DTO_MermasRegistro>();
            DAO_Mermas daoMermas = new DAO_Mermas();
            lista = daoMermas.ObtenerMermasTerminal(idTurno, claseMaquina);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_MERMAS"));
        }

        [Route("api/MermasTerminal/Registros")]
        [HttpPut]
        [ApiAuthorize(Funciones.MER_PROD_GES_2_GestionMermasTerminal)]
        public bool EditarObservacionesRegistroMermas([FromBody] DTO_MermasRegistro registro)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            bool correcto = daoMermas.EditarObservacionesRegistroMermas(registro);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.EditarObservacionesRegistroMermas", IdiomaController.GetResourceName("SE_HA_EDITADO_REGISTRO_MERMAS"), HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }

        #endregion

            #region PORTAL
        [Route("api/Mermas/turnos")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult ObtenerTurnosMermas([FromUri] string linea, [FromUri] string fDesde=null, [FromUri] string fHasta=null)
        {
            if (fDesde == null || fHasta == null)
            {
                return StatusCode(System.Net.HttpStatusCode.MethodNotAllowed);
            }

            var daoTurnos = new DAO_Turnos();

            try
            {
                DateTime desde = DateTime.Parse(fDesde).Date.ToUniversalTime();
                DateTime hasta = DateTime.Parse(fHasta).AddDays(1).Date.ToUniversalTime();

                if (desde >= hasta)
                {
                    return StatusCode(System.Net.HttpStatusCode.NotAcceptable);
                }

                var turnos = daoTurnos.ObtenerTurnos(linea, desde, hasta);

                return Json(turnos);
            }
            catch (Exception)
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }

        [Route("api/Mermas/ContadoresGlobales")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_VisualizacionMermasPortal)]
        public IHttpActionResult ObtenerContadoresGlobalesMermas()
        {
            var daoMermas = new DAO_Mermas();

            var lista = daoMermas.ObtenerContadoresGlobalesMermas();

            if (lista != null)
            {
                return Json(lista);
            }
            else
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CONTADORES_ACUMULADOS_MERMAS"));
            }
        }

        [Route("api/Mermas/ContadoresGlobales")]
        [HttpPost]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public bool CrearContadorGlobalMermas([FromBody] string nombre)
        {
            var daoMermas = new DAO_Mermas();

            bool correcto = daoMermas.CrearContadorGlobalMermas(nombre);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.CrearContadorGlobalMermas", IdiomaController.GetResourceName("SE_HA_CREADO_TIPO_ACUMULADO_MERMA"), HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }

        [Route("api/Mermas/proveedores")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult ObtenerProveedoresMermas()
        {
            var daoMermas = new DAO_Mermas();

            var lista = daoMermas.ObtenerProveedoresMermas();

            if (lista != null)
            {
                return Json(lista);
            }
            else
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_PROVEEDORES_MERMAS"));
            }
        }

        [Route("api/Mermas/maquinas")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult ObtenerMaquinasMermas(string IdLinea = null)
        {
            var daoMermas = new DAO_Mermas();

            var lista = daoMermas.ObtenerMaquinasMermas(IdLinea);

            if (lista != null)
            {
                return Json(lista);
            }
            else
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_MAQUINAS"));
            }
        }

        [Route("api/Mermas/maquinasSinUsar")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult ObtenerMaquinasSinUsarMermas(string IdLinea = null)
        {
            var daoMermas = new DAO_Mermas();

            var lista = daoMermas.ObtenerMaquinasSinUsarMermas(IdLinea);

            if (lista != null)
            {
                return Json(lista);
            }
            else
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_MAQUINAS"));
            }
        }

        [Route("api/Mermas")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_VisualizacionMermasPortal)]
        public IHttpActionResult ObtenerMermas([FromUri] int linea, [FromUri] string fDesde = null, [FromUri] string fHasta = null)
        {
            if (fDesde == null || fHasta == null)
            {
                return StatusCode(System.Net.HttpStatusCode.MethodNotAllowed);
            }

            DAO_Mermas daoMermas = new DAO_Mermas();
            DateTime desde = DateTime.Parse(fDesde).Date.ToUniversalTime();
            // Añadimos un día para que el rango llegue hasta las 00:00 del día siguiente
            DateTime hasta = DateTime.Parse(fHasta).AddDays(1).Date.ToUniversalTime();

            if (desde >= hasta)
            {
                return StatusCode(System.Net.HttpStatusCode.NotAcceptable);
            }

            var lineaObj = PlantaRT.planta.lineas.Find(l => l.numLinea == linea);
            var lista = daoMermas.ObtenerMermas(lineaObj != null ? lineaObj.id : "", desde, hasta);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_MERMAS"));
        }

        [Route("api/Mermas")]
        [HttpPost]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public async Task<IHttpActionResult> CrearMerma([FromBody] MermaModel merma)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            string resultado = await daoMermas.CrearMerma(merma);

            if (resultado == null)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.CrearMerma", IdiomaController.GetResourceName("SE_HA_CREADO_MERMA"), HttpContext.Current.User.Identity.Name);
                return Json(true);
            }
            else
            {
                return BadRequest(resultado);
            }
        }

        [Route("api/Mermas/Registros/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_VisualizacionMermasPortal)]
        public IHttpActionResult ObtenerRegistrosMermas(int id)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            var lista = daoMermas.ObtenerRegistrosMermas(id);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_REGISTROS_MERMAS"));
        }

        [Route("api/Mermas/Registros")]
        [HttpPut]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult EditarRegistroMermas([FromBody] DTO_MermasRegistro registro)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            Exception ex;

            bool correcto = daoMermas.EditarRegistroMermas(registro, out ex);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.EditarRegistroMermas", IdiomaController.GetResourceName("SE_HA_EDITADO_REGISTRO_MERMAS"), HttpContext.Current.User.Identity.Name);
                return Json(true);
            }
            else
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("api/Mermas/Registros/{id}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public bool EliminarRegistroMermas(int id)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            bool correcto = daoMermas.EliminarRegistroMermas(id);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.EliminarRegistroMermas", IdiomaController.GetResourceName("SE_HA_ELIMINADO_REGISTRO_MERMAS"), HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }

        [Route("api/Mermas/Contadores/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_VisualizacionMermasPortal)]
        public IHttpActionResult ObtenerContadoresMermas(int id)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            var lista = daoMermas.ObtenerContadoresMermas(id);

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONTADORES_MERMAS"));
        }

        [Route("api/Mermas/Contadores/{id}")]
        [HttpPut]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal, Funciones.MER_PROD_GES_2_GestionMermasTerminal)]
        public bool EditarContadorMermas(int id, [FromBody] DTO_MermasContador contador)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            bool correcto = daoMermas.EditarContadorMermas(id, contador);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.EditarContadorMermas", IdiomaController.GetResourceName("SE_HA_EDITADO_CONTADOR_MERMAS"), HttpContext.Current.User.Identity.Name);
            }

            return correcto;
        }
        
        [Route("api/Mermas/MaquinasContadores")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_VisualizacionMermasPortal)]
        public IHttpActionResult ObtenerMaquinasContadoresMermas([FromUri] int linea)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            var lineaObj = PlantaRT.planta.lineas.Find(l => l.numLinea == linea);

            if (lineaObj != null)
            {
                var lista = daoMermas.ObtenerMaquinasContadoresMermas(lineaObj.id);
                if (lista != null)
                {
                    return Json(lista);
                }
            }
            else
            {
                return Json(new List<Object>());
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_MAQUINAS_CONTADORES_MERMAS"));
        }

        [Route("api/Mermas/MaquinasContadores")]
        [HttpPost]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult CrearMaquinaContadorMermas([FromBody] DTO_MermasMaquinaContador maquinaContador)
        {

            var result =_iDAOMermas.CrearMaquinasContadorMermas(maquinaContador);

            if (result)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.CrearMaquinaContadorMermas", IdiomaController.GetResourceName("SE_HA_CREADO_MAQUINAS_CONTADOR_MERMAS"), HttpContext.Current.User.Identity.Name);
            }
            else
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_CREANDO_MAQUINAS_CONTADOR_MERMAS"));
            }

            return Json(result);
        }

        [Route("api/Mermas/MaquinasContadores")]
        [HttpPut]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult EditarMaquinaContadorMermas([FromBody] DTO_MermasConfiguracionContador maquinaContador)
        {

            var result = _iDAOMermas.EditarMaquinasContadorMermas(maquinaContador);

            if (result)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.EditarMaquinaContadorMermas", IdiomaController.GetResourceName("SE_HA_EDITADO_MAQUINAS_CONTADOR_MERMAS"), HttpContext.Current.User.Identity.Name);
            }
            else
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_EDITANDO_MAQUINAS_CONTADOR_MERMAS"));
            }

            return Json(result);
        }
        
        [Route("api/Mermas/MaquinasContadores")]
        [HttpDelete]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult EliminarMaquinaContadorMermas([FromBody] DTO_MermasMaquinaContador maquinaContador)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            var result = daoMermas.EliminarMaquinasContadorMermas(maquinaContador);

            if (result)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.EliminarMaquinaContadorMermas", IdiomaController.GetResourceName("SE_HA_ELIMINADO_MAQUINAS_CONTADOR_MERMAS"), HttpContext.Current.User.Identity.Name);
            }
            else
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_ELIMINANDO_MAQUINAS_CONTADOR_MERMAS"));
            }

            return Json(result);
        }

        [Route("api/mermas/ConfiguracionContadoresMermas/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_VisualizacionMermasPortal)]
        public IHttpActionResult ObtenerConfiguracionContadoresMermas()
        {
            DAO_Mermas daoMermas = new DAO_Mermas();

            var lista = daoMermas.ObtenerConfiguracionContadoresMermas();

            if (lista != null)
            {
                return Json(lista);
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONFIGURACION_CONTADORES_MERMAS"));
        }

        [Route("api/mermas/ContadoresClase/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_VisualizacionMermasPortal)]
        public IHttpActionResult ObtenerContadoresClaseMermas(string clase)
        {
            try
            {
                var enumClase = TipoEnumMaquinasClasesExtensions.GetEnumAbrev(clase);
                var lista = _iDAOMermas.ObtenerContadoresClaseMaquina(enumClase);

                if (lista != null)
                {
                    return Json(lista);
                }
            }
            catch (Exception)
            {
            }

            return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_CONTADORES_MERMAS"));
        }

        [Route("api/mermas/ConfiguracionContadoresMermas/")]
        [HttpPost]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult CrearConfiguracionContadorMermas([FromBody] DTO_MermasConfiguracionContador contador)
        {
            DAO_Mermas daoMermas = new DAO_Mermas();
            
            // Comprobamos que no se vaya a crear un contador de producción a una máquina que ya lo tenga configurado
            if (contador.EsContadorProduccion)
            {
                try
                {
                    if (!daoMermas.ComprobarContadorProduccion(contador))
                    {
                        return BadRequest(IdiomaController.GetResourceName("YA_EXISTE_CONTADOR_PRODUCCION"));
                    }
                }
                catch (Exception)
                {
                    return BadRequest(IdiomaController.GetResourceName("ERROR_COMPROBANDO_CONTADOR_PRODUCCION"));
                }
            }

            // Comprobamos que no se vaya a crear un contador de rechazo a una máquina que ya lo tenga configurado
            if (contador.RechazoTotal)
            {
                try
                {
                    if (!daoMermas.ComprobarContadorRechazo(contador))
                    {
                        return BadRequest(IdiomaController.GetResourceName("YA_EXISTE_CONTADOR_RECHAZO"));
                    }
                }
                catch (Exception)
                {
                    return BadRequest(IdiomaController.GetResourceName("ERROR_COMPROBANDO_CONTADOR_RECHAZO"));
                }
            }

            bool correcto = daoMermas.CrearConfiguracionContadorMermas(contador);

            if (correcto)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.CrearConfiguracionContadorMermas", IdiomaController.GetResourceName("SE_HA_CREADO_CONFIGURACION_CONTADOR_MERMAS"), HttpContext.Current.User.Identity.Name);
            }
            else
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_CREANDO_CONFIGURACION_CONTADOR_MERMAS"));
            }

            return Json(correcto);
        }

        [Route("api/mermas/ConfiguracionContadoresMermas/")]
        [HttpPut]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public IHttpActionResult EditarConfiguracionContadorMermas([FromBody] List<DTO_MermasConfiguracionContador> contadores)
        {
            try
            {
                Exception outEx;
                _iDAOMermas.EditarConfiguracionContadorMermas(contadores, out outEx);
                if (outEx != null)
                {
                    return BadRequest(outEx.Message);
                }

                return Ok();
            }
            catch(Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.EditarConfiguracionContadorMermas", "WEB-ENVASADO", "Sistema");
                return BadRequest(IdiomaController.GetResourceName("ERROR_EDITANDO_CONFIGURACION_CONTADOR_MERMAS"));
            }
        }
        
        [Route("api/mermas/ConfiguracionContadoresMermas/{maquinaClase}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal)]
        public bool EliminarConfiguracionContadorMermas(string maquinaClase)
        {
            var result = _iDAOMermas.EliminarConfiguracionContadorMermas(maquinaClase);

            if (result)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MermasController.EliminarConfiguracionContadorMermas", IdiomaController.GetResourceName("SE_HA_ELIMINADO_CONFIGURACION_CONTADOR_MERMAS").Replace("#CLASE#", maquinaClase), HttpContext.Current.User.Identity.Name);
            }

            return result;
        }

        [Route("api/mermas/Excel")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_VisualizacionMermasPortal)]
        public async Task<IHttpActionResult> ExportarExcel(int? idLinea, DateTime fechaInicio, DateTime fechaFin)
        {
            try
            {
                var lineaObj = PlantaRT.planta.lineas.Find(l => l.numLinea == idLinea);

                var result = await _iDAOMermas.ObtenerMermasExcel(lineaObj != null ? lineaObj.id : null, fechaInicio, fechaFin);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ExportarExcel", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_EXCEL_MERMAS"));
            }
        }

        #endregion

            #region ANALISIS

        [Route("api/mermas/analisis")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_69_VisualizacionAnalisisMermas)]
        public List<DTO_MermasAnalisis> ObtenerMermasAnalisis(int anioIni, int semanaIni, int anioFin, int semanaFin)
        {
            try
            {
                var lista = DAO_Mermas.ObtenerMermasAnalisis(anioIni, semanaIni, anioFin, semanaFin);
                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerMermasAnalisis", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/mermas/analisisConfig")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_69_VisualizacionAnalisisMermas)]
        public List<MermasAnalisisConfig> ObtenerMermasAnalisisConfiguracion()
        {
            try
            {
                return DAO_Mermas.ObtenerMermasAnalisisConfiguracion();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerMermasAnalisisConfiguracion", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/editarIMEObjetivo")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_69_GestionAnalisisMermas)]
        public bool EditarMermaAnalisisConfiguracion(MermasAnalisisConfig mermaAnalisisConfig)
        {
            return DAO_Mermas.EditarMermaAnalisisConfiguracion(mermaAnalisisConfig);
        }

        #endregion

        #endregion

        #region CALCULO_MERMAS

        [Route("api/CalculoMermas/ObtenerDatosCalculoMermas/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_EXE_01_VisualizacionDatosSilos, Funciones.MER_PROD_EXE_02_VisualizacionDatosCoccion, Funciones.MER_PROD_EXE_03_VisualizacionDatosFermentacion,
            Funciones.MER_PROD_EXE_04_VisualizacionDatosGuarda, Funciones.MER_PROD_EXE_05_VisualizacionDatosFiltracion, Funciones.MER_PROD_EXE_06_VisualizacionDatosTCPs,
            Funciones.MER_PROD_EXE_08_VisualizacionCalculoMermaSilos)]
        public async Task<IHttpActionResult> ObtenerDatosCalculoMermas([FromUri] DateTime fechaDesde, [FromUri] DateTime fechaHasta, [FromUri] string zona = "", [FromUri] string tipo = "")
        {
            try
            {
                var _result = await _iDAOMermas.ObtenerDatosCalculoMermas(fechaDesde, fechaHasta, zona, tipo);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerDatosCalculoMermas", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/ActualizarDatosCalculoMermas/")]
        [HttpPut]
        [ApiAuthorize(Funciones.MER_PROD_EXE_01_GestionDatosSilos, Funciones.MER_PROD_EXE_02_GestionDatosCoccion, Funciones.MER_PROD_EXE_03_GestionDatosFermentacion,
            Funciones.MER_PROD_EXE_04_GestionDatosGuarda, Funciones.MER_PROD_EXE_05_GestionDatosFiltracion, Funciones.MER_PROD_EXE_06_GestionDatosTCPs)]
        public async Task<IHttpActionResult> ActualizarDatosCalculoMermas([FromUri] string zona, [FromBody] DTO_DatosMermas dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;
                dto.ActualizadoPor = usuario;

                var _result = await _iDAOMermas.ActualizarDatosCalculoMermas(zona, dto);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ActualizarDatosCalculoMermas", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/BorradoLogicoDatosCalculoMermas/")]
        [HttpDelete]
        [ApiAuthorize(Funciones.MER_PROD_EXE_01_GestionDatosSilos, Funciones.MER_PROD_EXE_02_GestionDatosCoccion, Funciones.MER_PROD_EXE_03_GestionDatosFermentacion,
            Funciones.MER_PROD_EXE_04_GestionDatosGuarda, Funciones.MER_PROD_EXE_05_GestionDatosFiltracion, Funciones.MER_PROD_EXE_06_GestionDatosTCPs)]
        public async Task<IHttpActionResult> BorradoLogicoDatosCalculoMermas(string zona, int id)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;

                var _result = await _iDAOMermas.BorradoLogicoDatosCalculoMermas(zona, id, usuario);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                if (_result.Data)
                {
                    var mensaje = $"Se ha borrado de la tabla {zona} el registro con id: {id}";
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/BorradoLogicoDatosCalculoMermas", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.BorradoLogicoDatosCalculoMermas", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/ObtenerConfiguracionExtraccionDatosMermas/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_EXE_11_VisualizacionCapturaMovimientos)]
        public async Task<IHttpActionResult> ObtenerConfiguracionExtraccionDatosMermas(int? zona = null, string tipo = "")
        {
            try
            {
                var zonaParam = zona.GetValueOrDefault(0);

                var _result = await _iDAOMermas.ObtenerConfiguracionExtraccionDatosMermas(zonaParam, tipo);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerConfiguracionExtraccionDatosMermas", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/CrearConfiguracionExtraccionDatosMermas/")]
        [HttpPost]
        [ApiAuthorize(Funciones.MER_PROD_EXE_11_GestionCapturaMovimientos)]
        public async Task<IHttpActionResult> CrearConfiguracionExtraccionDatosMermas([FromBody] DTO_ConfExtrDatosMermas dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;
                dto.CreadoPor = usuario;

                var _result = await _iDAOMermas.CrearConfiguracionExtraccionDatosMermas(dto);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                if (_result.Data)
                {
                    var mensaje = "Registro Creado-> "
                                + "Zona: " + dto.Zona
                                + "; Tipo: " + dto.Tipo
                                + "; CodigoJDE: " + dto.CodigoJDE
                                + "; IdClaseMaterialOrigen: " + dto.IdClaseMaterialOrigen
                                + "; ProcesoOrigen: " + dto.ProcesoOrigen
                                + "; UbicacionOrigen: " + dto.UbicacionOrigen
                                + "; IdClaseMaterialDestino: " + dto.IdClaseMaterialDestino
                                + "; ProcesoDestino: " + dto.ProcesoDestino
                                + "; UbicacionDestino: " + dto.UbicacionDestino
                                + "; FormulaCalculoExtracto: " + (dto.FormulaCalculoExtracto.HasValue ? dto.FormulaCalculoExtracto.Value.ToString() : "NULL");

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/CrearConfiguracionExtraccionDatosMermas", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.CrearConfiguracionExtraccionDatosMermas", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/ActualizarConfiguracionExtraccionDatosMermas/")]
        [HttpPut]
        [ApiAuthorize(Funciones.MER_PROD_EXE_11_GestionCapturaMovimientos)]
        public async Task<IHttpActionResult> ActualizarConfiguracionExtraccionDatosMermas([FromBody] DTO_ConfExtrDatosMermas dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;
                dto.ActualizadoPor = usuario;
                
                var _result = await _iDAOMermas.ActualizarConfiguracionExtraccionDatosMermas(dto);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                if (_result.Data)
                {
                    var mensaje = "Registro actualizado-> "
                                + "Zona: " + dto.Zona
                                + "; Tipo: " + dto.Tipo
                                + "; CodigoJDE: " + dto.CodigoJDE
                                + "; IdClaseMaterialOrigen: " + dto.IdClaseMaterialOrigen
                                + "; ProcesoOrigen: " + dto.ProcesoOrigen
                                + "; UbicacionOrigen: " + dto.UbicacionOrigen
                                + "; IdClaseMaterialDestino: " + dto.IdClaseMaterialDestino
                                + "; ProcesoDestino: " + dto.ProcesoDestino
                                + "; UbicacionDestino: " + dto.UbicacionDestino
                                + "; FormulaCalculoExtracto: " + (dto.FormulaCalculoExtracto.HasValue ? dto.FormulaCalculoExtracto.Value.ToString() : "NULL");

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/ActualizarConfiguracionExtraccionDatosMermas", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ActualizarConfiguracionExtraccionDatosMermas", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/EliminarConfiguracionExtraccionDatosMermas/")]
        [HttpDelete]
        [ApiAuthorize(Funciones.MER_PROD_EXE_11_GestionCapturaMovimientos)]
        public async Task<IHttpActionResult> EliminarConfiguracionExtraccionDatosMermas([FromBody] DTO_ConfExtrDatosMermas dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;

                var _result = await _iDAOMermas.EliminarConfiguracionExtraccionDatosMermas(dto.IdMermasConfigExtraccionDatosMermas);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                if (_result.Data)
                {
                    var mensaje = "Registro eliminado-> "
                                + "Zona: " + dto.Zona
                                + "; Tipo: " + dto.Tipo
                                + "; CodigoJDE: " + dto.CodigoJDE
                                + "; IdClaseMaterialOrigen: " + dto.IdClaseMaterialOrigen
                                + "; ProcesoOrigen: " + dto.ProcesoOrigen
                                + "; UbicacionOrigen: " + dto.UbicacionOrigen
                                + "; IdClaseMaterialDestino: " + dto.IdClaseMaterialDestino
                                + "; ProcesoDestino: " + dto.ProcesoDestino
                                + "; UbicacionDestino: " + dto.UbicacionDestino
                                + "; FormulaCalculoExtracto: " + (dto.FormulaCalculoExtracto.HasValue ? dto.FormulaCalculoExtracto.Value.ToString() : "NULL");

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/EliminarConfiguracionExtraccionDatosMermas", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.EliminarConfiguracionExtraccionDatosMermas", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/ObtenerFormulasCalculo/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_EXE_11_VisualizacionCapturaMovimientos, Funciones.MER_PROD_EXE_12_VisualizacionCapturaExistencias)]
        public async Task<IHttpActionResult> ObtenerFormulasCalculo(int id)
        {
            try
            {
                var _result = await _iDAOMermas.ObtenerFormulasCalculo(id);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerFormulasCalculo", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }


        [Route("api/CalculoMermas/ObtenerZonasCalculoExtracto/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_EXE_11_VisualizacionCapturaMovimientos)]
        public async Task<IHttpActionResult> ObtenerZonasCalculoExtracto(int id)
        {
            try
            {
                var _result = await _iDAOMermas.ObtenerZonasCalculoExtracto(id);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerZonasCalculoExtracto", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/ObtenerZonasCalculoExistencias/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_EXE_12_VisualizacionCapturaExistencias)]
        public async Task<IHttpActionResult> ObtenerZonasCalculoExistencias(int id)
        {
            try
            {
                var _result = await _iDAOMermas.ObtenerZonasCalculoExistencias(id);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerZonasCalculoExistencias", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }


        [Route("api/CalculoMermas/ObtenerExistenciasCalculoMermas/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_EXE_10_VisualizacionExistencias, Funciones.MER_PROD_EXE_08_VisualizacionCalculoMermaSilos)]
        public async Task<IHttpActionResult> ObtenerExistenciasCalculoMermas([FromUri] DateTime fechaDesde, [FromUri] DateTime fechaHasta, [FromUri] int zona)
        {
            try
            {
                var _result = await _iDAOMermas.ObtenerExistenciasCalculoMermas(fechaDesde, fechaHasta, zona);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerExistenciasCalculoMermas", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/ObtenerConfiguracionCalculoExistencias/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_EXE_12_VisualizacionCapturaExistencias)] 
        public async Task<IHttpActionResult> ObtenerConfiguracionCalculoExistencias(int? zona = null)
        {
            try
            {
                var zonaParam = zona.GetValueOrDefault(0);

                var _result = await _iDAOMermas.ObtenerConfiguracionCalculoExistencias(zonaParam);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerConfiguracionCalculoExistencias", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/CrearConfiguracionCalculoExistencias/")]
        [HttpPost]
        [ApiAuthorize(Funciones.MER_PROD_EXE_12_GestionCapturaExistencias)] 
        public async Task<IHttpActionResult> CrearConfiguracionCalculoExistencias([FromBody] DTO_ConfExistenciasMermas dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;
                dto.CreadoPor = usuario;

                var _result = await _iDAOMermas.CrearConfiguracionCalculoExistencias(dto);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                if (_result.Data)
                {
                    var mensaje = "Registro Creado-> "
                                + "; Zona: " + dto.Zona
                                + "; Ubicacion: " + dto.Ubicacion
                                + "; MetodoCalculo: " + (dto.MetodoCalculo.HasValue ? dto.MetodoCalculo.Value.ToString() : "NULL");

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/CrearConfiguracionCalculoExistencias", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.CrearConfiguracionCalculoExistencias", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/ActualizarConfiguracionCalculoExistencias/")]
        [HttpPut]
        [ApiAuthorize(Funciones.MER_PROD_EXE_12_GestionCapturaExistencias)] 
        public async Task<IHttpActionResult> ActualizarConfiguracionCalculoExistencias([FromBody] DTO_ConfExistenciasMermas dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;
                dto.ActualizadoPor = usuario;

                var _result = await _iDAOMermas.ActualizarConfiguracionCalculoExistencias(dto);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                if (_result.Data)
                {
                    var mensaje = "Registro actualizado-> "
                                + "Id: " + dto.IdMermasConfigCalcExistencias
                                + "; Zona: " + dto.Zona
                                + "; Ubicacion: " + dto.Ubicacion
                                + "; MetodoCalculo: " + (dto.MetodoCalculo.HasValue ? dto.MetodoCalculo.Value.ToString() : "NULL");

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/ActualizarConfiguracionCalculoExistencias", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ActualizarConfiguracionCalculoExistencias", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/EliminarConfiguracionCalculoExistencias/")]
        [HttpDelete]
        [ApiAuthorize(Funciones.MER_PROD_EXE_12_GestionCapturaExistencias)] 
        public async Task<IHttpActionResult> EliminarConfiguracionCalculoExistencias([FromBody] DTO_ConfExistenciasMermas dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;

                var _result = await _iDAOMermas.EliminarConfiguracionCalculoExistencias(dto.IdMermasConfigCalcExistencias);
                if (_result.Exception != null)
                {
                    throw _result.Exception;
                }

                if (_result.Data)
                {
                    var mensaje = "Registro eliminado-> "
                                + "Id: " + dto.IdMermasConfigCalcExistencias
                                + "; Zona: " + dto.Zona
                                + "; Ubicacion: " + dto.Ubicacion
                                + "; MetodoCalculo: " + (dto.MetodoCalculo.HasValue ? dto.MetodoCalculo.Value.ToString() : "NULL");

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/EliminarConfiguracionCalculoExistencias", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.EliminarConfiguracionCalculoExistencias", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/ObtenerParametrosGenerales/")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_EXE_13_VisualizacionParametrosGenerales)]
        public async Task<IHttpActionResult> ObtenerParametrosGenerales()
        {
            try
            {
                var _result = await _iDAOMermas.ObtenerParametrosGenerales();
                if (_result.Exception != null)
                    throw _result.Exception;

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ObtenerParametrosGenerales", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/CrearParametroGeneral/")]
        [HttpPost]
        [ApiAuthorize(Funciones.MER_PROD_EXE_13_GestionParametrosGenerales)]
        public async Task<IHttpActionResult> CrearParametroGeneral([FromBody] DTO_MermasConfigVariable dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;
                dto.CreadoPor = usuario;

                var _result = await _iDAOMermas.CrearParametroGeneral(dto);
                if (_result.Exception != null)
                    throw _result.Exception;

                if (_result.Data)
                {
                    var mensaje = "Nuevo parámetro creado -> "
                                + "Nombre: " + dto.Nombre
                                + "; Descripcion: " + dto.Descripcion
                                + "; Valor: " + dto.Valor;
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/CrearParametroGeneral", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.CrearParametroGeneral", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/ActualizarParametroGeneral/")]
        [HttpPut]
        [ApiAuthorize(Funciones.MER_PROD_EXE_13_GestionParametrosGenerales)]
        public async Task<IHttpActionResult> ActualizarParametroGeneral([FromBody] DTO_MermasConfigVariable dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;
                dto.ActualizadoPor = usuario;

                var _result = await _iDAOMermas.ActualizarParametroGeneral(dto);
                if (_result.Exception != null)
                    throw _result.Exception;

                if (_result.Data)
                {
                    var mensaje = "Parámetro actualizado -> "
                                + "Id: " + dto.IdMermasConfigVarias
                                + "; Nombre: " + dto.Nombre
                                + "; Descripcion: " + dto.Descripcion
                                + "; Valor: " + dto.Valor;
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/ActualizarParametroGeneral", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.ActualizarParametroGeneral", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        [Route("api/CalculoMermas/EliminarParametroGeneral/")]
        [HttpDelete]
        [ApiAuthorize(Funciones.MER_PROD_EXE_13_GestionParametrosGenerales)]
        public async Task<IHttpActionResult> EliminarParametroGeneral([FromBody] DTO_MermasConfigVariable dto)
        {
            try
            {
                var usuario = HttpContext.Current.User.Identity.Name;

                var _result = await _iDAOMermas.EliminarParametroGeneral(dto.IdMermasConfigVarias);
                if (_result.Exception != null)
                    throw _result.Exception;

                if (_result.Data)
                {
                    var mensaje = "Parámetro eliminado -> "
                                + "Id: " + dto.IdMermasConfigVarias
                                + "; Nombre: " + dto.Nombre;
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CalculoMermas/EliminarParametroGeneral", mensaje, usuario);
                }

                return Ok(_result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MermasController.EliminarParametroGeneral", "WEB-MERMAS", "Sistema");
                return BadRequest();
            }
        }

        #endregion
    }
}