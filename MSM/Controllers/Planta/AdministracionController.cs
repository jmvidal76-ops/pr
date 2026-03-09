using BreadMES.Envasado;
using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.Utilidades.Utils;
using MSM.Mappers.DTO.Administracion;
using MSM.Security;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Planta
{
    [Authorize]
    public class AdministracionController : ApiController
    {
        private readonly IDAO_Administracion _IDAO_Administracion;
        
        public AdministracionController(IDAO_Administracion IDAO_Administracion)
        {
            _IDAO_Administracion = IDAO_Administracion;
        }

        [Route("api/ObtenerParametrosPlantaAdmin")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_RES_09_VisualizacionParametrosPlanta)]
        public object ObtenerParametrosLinea()
        {
            try
            {
                IEnumerable<object> list = null;

                using (MESEntities context = new MESEntities())
                {
                    List<ParametrosPlanta_Admin> listaParametrosPlanta = context.ParametrosPlanta_Admin.AsNoTracking().ToList();
                    List<Lineas> listaLineas = context.Lineas.AsNoTracking().ToList();

                    listaParametrosPlanta.Join(listaLineas, p => new { numLinea = Convert.ToInt32(p.IdLinea.Value) }, l => new { numLinea = Convert.ToInt32(l.NumeroLinea.Value) }, (p, l) => new { p, l });
                    list = listaParametrosPlanta.Join(context.Lineas.AsNoTracking().ToList(), p => new { numLinea = Convert.ToInt32(p.IdLinea.Value) }, l => new { numLinea = Convert.ToInt32(l.NumeroLinea.Value) }, (p, l) => new { p, l }).Select(lp => new
                    {
                        lp.p.Id,
                        lp.p.IdLinea,
                        lp.p.IdParametro,
                        lp.p.NombreParametro,
                        lp.p.DescripcionParametro,
                        lp.p.Regla,
                        lp.p.TipoValor,
                        lp.p.VALOR_FLOAT,
                        lp.p.VALOR_INT,
                        lp.p.VALOR_STRING,
                        lp.l.Descripcion,
                        lp.l.NumeroLineaDescripcion
                    }).OrderBy(l => l.IdLinea);
                }

                return list;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AdministracionController.obtenerParametrosLinea", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS"));
            }
        }

        [Route("api/ObtenerFunciones")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_2_GestionRoles)]
        public object ObtenerFunciones()
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    return context.FUNCIONES.AsNoTracking().Include("AREAS_GESTION").Include("EstructuraPermisos").Where(p => p.AREAS_GESTION != null && p.EstructuraPermisos != null).ToList();
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AdministracionController.ObtenerFunciones", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_FUNCIONES"));
            }
        }

        [Route("api/ObtenerFuncionesRol/{idRol}")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_2_GestionRoles)]
        public object ObtenerFuncionesRol(string idRol)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    return context.PERMISOS.AsNoTracking().Include("FUNCIONES").Include("FUNCIONES.AREAS_GESTION").Include("FUNCIONES.EstructuraPermisos").Where(p => p.ID_ROL == idRol).Select(p => p.ID_FUNCION).ToList();
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AdministracionController.ObtenerFuncionesRol", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_FUNCIONES_DEL"));
            }
        }

        [Route("api/ModificarParametroLineaAdmin")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_10_GestionParametrosPlanta)]
        public async Task<bool> ModificarParametroLineaAdmin(ParametrosPlanta_Admin parametrosPlanta)
        {
            try
            {
                bool success = ParametrosBread.ModificarParametroLineaAdmin(parametrosPlanta);
                double value = 0.0;

                if (success)
                {
                    // Si es el parámetro es "Bloqueo llenadora sin WO" y se pone a 0
                    if (parametrosPlanta.IdParametro == 16 && parametrosPlanta.VALOR_INT == 0)
                    {
                        DAO_Tags daoTags = new DAO_Tags();
                        await daoTags.ModificarPermisivoAdministracion(parametrosPlanta.IdLinea.Value);
                    }

                    Type type = Type.GetType(string.Format("System.{0}", parametrosPlanta.TipoValor.ToLower()), false, true);
                    switch (Type.GetTypeCode(type))
                    {
                        case TypeCode.Single:
                            value = Convert.ToDouble(parametrosPlanta.VALOR_FLOAT);
                            break;
                        case TypeCode.Int32:
                            value = Convert.ToDouble(parametrosPlanta.VALOR_INT);
                            break;
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AdministracionController.ModificarParametroLineaAdmin",
                        string.Format(IdiomaController.GetResourceName("EDICION_PARAMETROS_LINEA") + ". " + IdiomaController.GetResourceName("LINEA") + 
                        ": {0}, " + IdiomaController.GetResourceName("PARAMETRO") + ": {1}, " + IdiomaController.GetResourceName("VALOR") + ": {2}", 
                        parametrosPlanta.IdLinea, parametrosPlanta.NombreParametro, value), HttpContext.Current.User.Identity.Name);

                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "AdministracionController.obtenerParametrosPlantaAdmin", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS"));
            }
        }

        [Route("api/CrearParametroLineaAdmin/{numLineas}/{rango}")]
        [HttpGet]
        [AllowAnonymous]
        public object CrearParametroLineaAdmin(int numLineas, bool rango)
        {
            try
            {
                bool success = ParametrosBread.CrearParametro(numLineas,rango);
                return new object[] { success, string.Empty };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "AdministracionController.CrearParametroLineaAdmin", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS"));
            }
        }

        [Route("api/mailConfiguration")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_TT_4_VisualizacionConfiguracionMail,Funciones.UC_GEN_TT_4_GestionConfiguracionMail)]
        public DTO_MailConfiguration MailConfiguration()
        {
            return _IDAO_Administracion.MailConfiguration_Read();
        }

        [Route("api/mailConfigurationUpdate")]
        [HttpPost]
        [ApiAuthorize(Funciones.UC_GEN_TT_4_GestionConfiguracionMail)]
        public bool MailConfigurationUpdate(DTO_MailConfiguration mailConfiguration)
        {
            return _IDAO_Administracion.MailConfiguration_Update(mailConfiguration);
        }

        [Route("api/mailTestConnection")]
        [HttpPost]
        [ApiAuthorize(Funciones.UC_GEN_TT_4_GestionConfiguracionMail)]
        public void MailTestConnection([FromBody] string user)
        {
            DAO_Utils.TestMail(user);
        }

        [Route("api/obtenerEnlaceExterno/{idEnlace}")]
        [HttpGet]
        [AllowAnonymous]
        public IHttpActionResult ObtenerEnlaceExterno(int idEnlace)
        {
            try
            {
                string result = DAO_Administracion.ObtenerEnlaceExterno(idEnlace);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [Route("api/ObtenerInformacionVideowall")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_TT_5_VisualizacionConfiguracionVideowall)]
        public IEnumerable ObtenerInformacionVideowall()
        {
            try
            {
                DAO_Administracion daoAdministracion = new DAO_Administracion();
                var lista = daoAdministracion.ObtenerInformacionVideowall();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AdministracionController.ObtenerInformacionVideowall", "WEB-PLANTA", "Sistema");
                throw ex;
            }
        }

        [Route("api/ActualizarPantallaVideowall")]
        [HttpPut]
        [ApiAuthorize(Funciones.UC_GEN_TT_5_GestionConfiguracionVideowall)]
        public bool ActualizarPantallaVideowall(VideowallConfiguracion dato)
        {
            try
            {
                DAO_Administracion daoAdministracion = new DAO_Administracion();
                var lista = daoAdministracion.ActualizarPantallaVideowall(dato);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AdministracionController.ActualizarPantallaVideowall", "WEB-PLANTA", "Sistema");
                throw ex;
            }
        }

        [Route("api/ObtenerDatosPerroGuardian")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_TT_6_VisualizacionPerroGuardian)]
        public List<PerroGuardian> ObtenerDatosPerroGuardian()
        {
            try
            {
                DAO_Administracion daoAdmin = new DAO_Administracion();
                var lista = daoAdmin.ObtenerDatosPerroGuardian();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, ex.Message + " -> " + ex.StackTrace, "AdministracionController.ObtenerDatosPerroGuardian", "WEB-PLANTA", "Sistema");
                throw ex;
            }
        }

        [Route("api/ActualizarMensajeAdministracion")]
        [HttpPost]
        [ApiAuthorize(Funciones.UC_GEN_PAR_1_GestionMensajeAdministracion)]
        public IHttpActionResult ActualizarMensajeAdministracion(DTO_MensajeAdministracion entity)
        {
            try
            {
                DAO_Administracion daoAdmin = new DAO_Administracion();
                bool result = daoAdmin.ActualizarMensajeAdministracion(entity);

                if (result)
                    return Ok(entity);
                else
                    return BadRequest();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, ex.Message + " -> " + ex.StackTrace, "AdministracionController.ActualizarMensajeAdministracion", "WEB", "Sistema");
                throw ex;
            }
        }

        [Route("api/TareasScheduler")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_TT_7_VisualizacionMonitorDeTareas)]
        public List<DTO_TareasScheduler> TareasScheduler()
        {
            try
            {
                DAO_Administracion daoAdmin = new DAO_Administracion();
                var lista = daoAdmin.TareasScheduler();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, ex.Message + " -> " + ex.StackTrace, "AdministracionController.TareasScheduler", "WEB", "Sistema");
                throw ex;
            }
        }
    }
}
