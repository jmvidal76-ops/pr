using Common.Models.RTDS;
using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Envasado;
using MSM.RealTime;
using MSM.Security;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class TagsController : ApiController
    {
        
        [Route("api/getMaquinasAsignacionLineaZona")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo)]
        public async Task<IEnumerable> getMaquinasAsignacionLineaZona(dynamic datos)
        {
            try
            {
                int numLinea = Convert.ToInt32(datos.numLinea);

                Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea.Equals(numLinea));
                if (linea != null)
                {
                    List<Linea> lstLineasAsignacionCompartida = PlantaRT.planta.lineas.Where(l => l.Grupo.Equals(linea.Grupo)).ToList();

                    List<dynamic> lstTagsValue = new List<dynamic>();
                    foreach (Linea l in lstLineasAsignacionCompartida)
                    {
                        dynamic tagValueLinea = new ExpandoObject();
                        tagValueLinea.numLinea = l.numLinea;
                        lstTagsValue.Add(tagValueLinea);
                    }

                    DAO_Tags daoTags = new DAO_Tags();
                    RTDSValuesDto tagValues = daoTags.GetTagAsignacionProduccion(lstTagsValue);
                    var values = await daoTags.readRTDS(tagValues);

                    foreach (var tag in values as IEnumerable)
                    {
                        double val = Convert.ToDouble(((dynamic)tag).value);
                        string nameTag = (string)(((dynamic)tag).name);
                        dynamic tagValueLinea = lstTagsValue.Find(d => ((string)d.tag_name).ToLower().Equals(nameTag));
                        tagValueLinea.value = val;
                    }

                    var m = lstLineasAsignacionCompartida.Join(lstTagsValue, l => l.numLinea, t => t.numLinea, (l, t) => new
                    {
                        idLinea = l.id,
                        descLinea = l.descripcion,
                        numLinea = l.numLinea,
                        numLineaDescripcion = l.numLineaDescripcion,
                        tagValue = Convert.ToDecimal(t.value) * 100
                    });

                    return m;
                }

                return null;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TagController.getMaquinasAsignacionLineaZona", "WEB-ENVASADO", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/HayOrdenLineaOpuesta")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo)]
        public bool HayOrdenLineaOpuesta(dynamic datos)
        {
            try
            {
                if (datos != null)
                {
                    string idLinea = datos.idLinea.ToString();
                    string idZona = datos.idZona.ToString();
                    Linea linea = PlantaRT.planta.lineas.Find(l => l.id == idLinea);

                    if (linea != null)
                    {
                        Zona zona = linea.zonas.Find(z => z.id.Equals(idZona));

                        //si la zona compartida no tiene ninguna orden entonces le dejamos
                        if (zona.ZonasCompartidasEntreLineas.Count() > 0)
                        {
                            ZonaCompartida datosZonaC = zona.ZonasCompartidasEntreLineas.First();
                            Linea lineaCompartida = PlantaRT.planta.lineas.Find(l => l.numLinea.Equals(datosZonaC.NumLinea));
                            Zona zonaCompartidaLineaOpuesta = lineaCompartida.zonas.Find(z => z.id.Equals(datosZonaC.Id));

                            if (zonaCompartidaLineaOpuesta != null)
                            {
                                if (zonaCompartidaLineaOpuesta.ordenActual != null)
                                {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TagController.CheckSiEsPosibleCambio", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(ex.Message);
            }

            return false;
        }

        [Route("api/modificarConfiguracionMaquinas")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo)]
        public async Task ModificarConfiguracionMaquinas(dynamic datos)
        {
            try
            {
                DAO_Tags daoTags = new DAO_Tags();
                await daoTags.ModificarConfiguracionMaquinas(datos);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TagController.ModificarConfiguracionMaquinas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(ex.Message);
            }
        }

        [Route("api/modificarAsignacionLlenadoras")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo)]
        public async Task<bool> ModificarAsignacionLlenadoras(dynamic datos)
        {
            try
            {
                bool result = false;
                if (datos != null)
                {
                    DAO_Tags daoTags = new DAO_Tags();
                    result = await daoTags.ModificarAsignacionLlenadoras(datos);

                    string mensaje = IdiomaController.GetResourceName("ASIGNAR_PRODUCCION") + "; ";

                    foreach (dynamic item in datos as IEnumerable)
                    {
                        using (MESEntities context = new MESEntities())
                        {
                            int numLinea = Convert.ToInt32(item.numLinea);
                            var linea = context.Lineas.AsNoTracking().Where(l => l.NumeroLinea.Value == numLinea).First();
                            mensaje += IdiomaController.GetResourceName("LINEA") + " " + linea.NumeroLineaDescripcion + " - " + linea.Descripcion + ": " + item.value + "%, ";
                        }
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TagsController.ModificarAsignacionLlenadoras", mensaje.Substring(0, mensaje.Length - 2), HttpContext.Current.User.Identity.Name);
                }

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TagsController.ModificarAsignacionLlenadoras", "WEB-ENVASADO", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/ObtenerDescripcionMaquinasCompartidas")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo)]
        public List<string> ObtenerDescripcionMaquinasCompartidas()
        {
            try
            {
                DAO_Tags daoTags = new DAO_Tags();
                var maquinas = daoTags.ObtenerDescripcionMaquinasCompartidas();

                return maquinas;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TagsController.ObtenerDescripcionMaquinasCompartidas", "WEB-ENVASADO", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/ObtenerConfiguracionMaquinasCompartidas")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo)]
        public List<ConfiguracionMaquinasCompartidas> ObtenerConfiguracionMaquinasCompartidas()
        {
            try
            {
                DAO_Tags daoTags = new DAO_Tags();
                var maquinas = daoTags.ObtenerConfiguracionMaquinasCompartidas();

                return maquinas;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TagsController.ObtenerConfiguracionMaquinasCompartidas", "WEB-ENVASADO", "Sistema");
                throw new Exception(ex.Message);
            }
        }
    }
}