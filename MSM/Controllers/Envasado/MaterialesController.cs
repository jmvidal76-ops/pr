using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web;
using BreadMES.Envasado;
using MSM.Security;
using MSM.Models.Envasado;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.BBDD.Model;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class MaterialesController : ApiController
    {
        
        [Route("api/obtenerDatosMaestros")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DEF_3_VisualizacionDeDatosMaestros)]
        public List<Material> ObtenerDatosMaestros()
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                List<Material> listaDatosMaestros = daoMateriales.ObtenerDatosMaestros();

                return listaDatosMaestros;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerDatosMaestros", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_DATOS_MAESTROS"));
            }
        }

        [Route("api/obtenerListaMateriales")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DEF_4_VisualizacionListaMateriales)]
        public List<Material> ObtenerListaMateriales()
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                List<Material> listaMateriales = daoMateriales.ObtenerListaMateriales();

                return listaMateriales;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerListaMateriales", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
            }
        }

        [Route("api/obtenerDetalleMateriales/{codigoProducto}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DEF_4_VisualizacionListaMateriales, Funciones.ENV_PROD_EXE_2_VisualizacionListadoDeWo)]
        public List<MaterialDetalle> ObtenerDetalleMateriales(string codigoProducto)
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                List<MaterialDetalle> listaDetalleMateriales = daoMateriales.ObtenerDetalleMateriales(codigoProducto);

                return listaDetalleMateriales;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerDetalleMateriales", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_DETALLE_MATERIALES"));
            }
        }

        [Route("api/obtenerEansMaterial/{idMaterial}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DEF_4_VisualizacionListaMateriales, Funciones.ENV_PROD_EXE_2_VisualizacionListadoDeWo)]
        public List<MaterialEan> ObtenerEansMaterial(string idMaterial)
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                List<MaterialEan> listaEans = daoMateriales.ObtenerEansValidos(idMaterial);

                return listaEans;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerEansMaterial", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EAN"));
            }
        }

        [Route("api/obtenerProductos")]
        [HttpGet]
        [AllowAnonymous]        
        public List<Material> obtenerProductos()
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                List<Material> listaMateriales = daoMateriales.obtenerProductos();

                return listaMateriales;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.compruebaLogin", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerProductos", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
            }
        }

        [Route("api/obtenerTiemposCambio")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_RES_4_VisualizacionDeTiemposDeCambio)]
        public List<TiempoCambio> obtenerTiemposCambio()
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                List<TiempoCambio> cambios = daoMateriales.ObtenerTiemposCambio();

                return cambios.OrderBy(p => p.idLinea).ToList();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.obtenerTiemposCambio", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerTiemposCambio", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_TIEMPOS_DE"));
            }
        }

        [Route("api/obtenerTiemposArranque")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_RES_11_VisualizacionDeTiemposDeArranque)]
        public List<TiempoArranque> obtenerTiemposArranque()
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                List<TiempoArranque> arranques = daoMateriales.ObtenerTiemposArranque();

                return arranques.OrderBy(p => p.idLinea).ToList();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "MaterialesController.obtenerTiemposArranque", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.obtenerTiemposArranque", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_TIEMPOS_DE_ARRANQUE"));
            }
        }

        [Route("api/asignarTiemposCambio")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_3_GestionDeTiemposDeCambio)]
        public bool asignarTiemposCambio(dynamic datos)
        {
            try
            {
                int t1 = int.Parse((datos.tiempo1.Value == "" ? "-1" : datos.tiempo1.Value));
                int t2 = int.Parse((datos.tiempo2.Value == "" ? "-1" : datos.tiempo2.Value));
                int tpre = int.Parse((datos.tiempopreact.Value == "" ? "-1" : datos.tiempopreact.Value));
                bool inhabilitarCalculo = (bool)datos.inhabilitarCalculo.Value;

                List<string> listaLineasProductos = new List<string>();

                foreach (var item in datos.cambios)
                {
                    long idTiempoCambio = (long)item.id.Value;
                    listaLineasProductos.Add(item.lineaProducto.Value);
                    TiemposBread.ModificarTiempoCambio(idTiempoCambio, t1, t2, tpre, -1, -1, inhabilitarCalculo);
                }

                var textoTiempoLlenadora = t1 == -1 ? string.Empty : IdiomaController.GetResourceName("TIEMPO_OBJETIVO_LLENADORA") + ": " + t1 + ", ";
                var textoTiempoPaletera = t2 == -1 ? string.Empty : IdiomaController.GetResourceName("TIEMPO_OBJETIVO_PALETIZADORA") + ": " + t2 + ", ";
                var textoTiempoPreactor = tpre == -1 ? string.Empty : IdiomaController.GetResourceName("TIEMPO_SECUENCIADOR") + ": " + tpre + ", ";

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MaterialesController.asignarTiemposCambio",
                    "Se han modificado los tiempos de cambio de los registros: " + string.Join(", ", listaLineasProductos) + ". " +
                    textoTiempoLlenadora + textoTiempoPaletera + textoTiempoPreactor + 
                    IdiomaController.GetResourceName("INHABILITAR_CALCULO") + ": " + (inhabilitarCalculo ? IdiomaController.GetResourceName("SI") : IdiomaController.GetResourceName("NO")),
                    HttpContext.Current.User.Identity.Name);

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.asignarTiemposCambio", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/asignarTiemposArranque")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_12_GestionDeTiemposDeArranque)]
        public bool asignarTiemposArranque(dynamic datos)
        {
            try
            {
                int t1 = int.Parse((datos.tiempo1.Value == "" ? "-1" : datos.tiempo1.Value));
                int t2 = int.Parse((datos.tiempo2.Value == "" ? "-1" : datos.tiempo2.Value));
                int tpre = int.Parse((datos.tiempopreact.Value == "" ? "-1" : datos.tiempopreact.Value));
                bool inhabilitarCalculo = (bool)datos.inhabilitarCalculo.Value;

                List<string> listaLineasProductos = new List<string>();

                foreach (var item in datos.arranques)
                {
                    long idTiempoArranque = (long)item.id.Value;
                    listaLineasProductos.Add(item.lineaProducto.Value);
                    TiemposBread.ModificarTiempoArranque(idTiempoArranque, t1, t2, tpre, -1, -1, inhabilitarCalculo);
                }

                var textoTiempoLlenadora = t1 == -1 ? string.Empty : IdiomaController.GetResourceName("TIEMPO_OBJETIVO_LLENADORA") + ": " + t1 + ", ";
                var textoTiempoPaletera = t2 == -1 ? string.Empty : IdiomaController.GetResourceName("TIEMPO_OBJETIVO_PALETIZADORA") + ": " + t2 + ", ";
                var textoTiempoPreactor = tpre == -1 ? string.Empty : IdiomaController.GetResourceName("TIEMPO_SECUENCIADOR") + ": " + tpre + ", ";

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "MaterialesController.asignarTiemposArranque",
                    "Se han modificado los tiempos de arranque de los registros: " + string.Join(", ", listaLineasProductos) + ". " +
                    textoTiempoLlenadora + textoTiempoPaletera + textoTiempoPreactor +
                    IdiomaController.GetResourceName("INHABILITAR_CALCULO") + ": " + (inhabilitarCalculo ? IdiomaController.GetResourceName("SI") : IdiomaController.GetResourceName("NO")),
                    HttpContext.Current.User.Identity.Name);

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "MaterialesController.asignarTiemposArranque", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/validarMaterial/{codEan}/{codProd}/{idlinea}")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_VisualizacionListadoDeWo)]
        public Material validarMaterial(string codEan, string codProd, string idLinea)
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                Material material = daoMateriales.ObtenerMaterialCodEan(codEan);

                if (material != null)
                {
                    List<Material> listMaterialesProd = daoMateriales.ObtenerMaterialesProducto(idLinea, codProd);

                    if (listMaterialesProd.Exists(m => m.idMaterial == material.idMaterial))
                    {
                        material.codEan = codEan;
                    }
                }

                return material;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "SolicitudMaterialController.validarMaterial", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MATERIALES"));
            }
        }

        [Route("api/obtenerConfiguracionEmpaquetadoras")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DEF_6_VisualizacionConfiguracionEmpaquetadoras)]
        public List<DTO_ConfiguracionEmpaquetadoras> ObtenerConfiguracionEmpaquetadoras()
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                List<DTO_ConfiguracionEmpaquetadoras> lista = daoMateriales.ObtenerConfiguracionEmpaquetadoras();

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerConfiguracionEmpaquetadoras", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CONFIG_EMPAQ"));
            }
        }

        [Route("api/obtenerEmpaquetadorasLinea/{linea}/{producto}/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DEF_6_VisualizacionConfiguracionEmpaquetadoras)]
        public List<object> ObtenerEmpaquetadorasLineaProducto(string linea, string producto)
        {
            try
            {
                DAO_Materiales daoMateriales = new DAO_Materiales();
                List<object> lista = daoMateriales.ObtenerEmpaquetadorasLineaProducto(linea, producto);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "MaterialesController.ObtenerEmpaquetadorasLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CONFIG_EMPAQ"));
            }
        }

        [Route("api/guardarSumaEmpaquetadora")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_DEF_5_GestionConfiguracionEmpaquetadoras)]
        public bool GuardarSumaEmpaquetadora(ConfiguracionEmpaquetadoras config)
        {
            DAO_Materiales daoMateriales = new DAO_Materiales();
            return daoMateriales.GuardarSumaEmpaquetadora(config);
        }
    }
}
