using Autofac;
using Common.Models.RTDS;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.RTDS;
using MSM.BBDD.Trazabilidad;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Models.Envasado;
using MSM.RealTime;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_Tags
    {
        private readonly ISitRTDS _sitRtds;
        private readonly IDAO_Ubicacion _daoUbicacion;

        public DAO_Tags()
        {
            _sitRtds = AutofacContainerConfig.Container.Resolve<ISitRTDS>();
            _daoUbicacion = AutofacContainerConfig.Container.Resolve<IDAO_Ubicacion>();
        }

        public RTDSValuesDto GetTagAsignacionProduccion(dynamic datos)
        {
            RTDSValuesDto tagValues = new RTDSValuesDto()
            {
                Tags = new List<string>(),
                TagsValues = new List<object>(),
                Unit = "RTDS"
            };

            foreach (dynamic item in datos as IEnumerable)
            {
                int numLinea = Convert.ToInt32(item.numLinea);
                Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea.Equals(numLinea));

                string tagName = string.Format("{0}_X100_ASIGNACION_PRODUCCION", linea.id.Split('.').Last<string>());
                item.tag_name = tagName;
                tagValues.Tags.Add(tagName);

                if (PropertyExist(item, "value"))
                {
                    tagValues.TagsValues.Add(Convert.ToDecimal(item.value));
                }
            }

            return tagValues;
        }

        private bool PropertyExist(dynamic settings, string name)
        {
            if (settings is ExpandoObject)
            {
                return ((IDictionary<string, object>)settings).ContainsKey(name);
            }
            else
            {
                return settings.GetType().GetProperty(name) != null;
            }
        }

        internal Task<object> readRTDS(RTDSValuesDto tagValues)
        {
            return _sitRtds.readRTDS(tagValues);
        }

        internal Task<object> writeRTDS(RTDSValuesDto tagValuesMaquinas)
        {
            return _sitRtds.writeRTDS(tagValuesMaquinas);
        }

        public async Task<bool> ModificarAsignacionLlenadoras(dynamic datos)
        {
            var result = false;
            List<dynamic> lstLineasValor = new List<dynamic>();
            List<DTO_ClaveValor> listaDatos = new List<DTO_ClaveValor>();

            foreach (dynamic item in datos as IEnumerable)
            {
                int percent = Convert.ToInt32(item.value);
                double value = Math.Round((double)percent / 100, 2);
                int numLinea = Convert.ToInt32(item.numLinea);

                dynamic lineaValor = new ExpandoObject();
                lineaValor.numLinea = numLinea;
                lineaValor.value = value.ToString();
                lstLineasValor.Add(lineaValor);

                using (MESEntities context = new MESEntities())
                {
                    var linea = context.Lineas.AsNoTracking().Where(l => l.NumeroLinea.Value == numLinea).First();
                    listaDatos.Add(new DTO_ClaveValor { Id = Convert.ToInt32(item.value), Valor = linea.Id });
                }
            }

            RTDSValuesDto tagValues = GetTagAsignacionProduccion(lstLineasValor);
            var values = (List<object>)await writeRTDS(tagValues);

            for (int i = 0; i < values.Count(); i++)
            {
                result = Convert.ToBoolean(values[i]);
                if (!result)
                {
                    var mensaje = IdiomaController.GetResourceName("ERROR_RTDS") + "Variable: " + tagValues.Tags[i] + ", valor: " + tagValues.TagsValues[i];
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, mensaje, "DAO_Tags.ModificarAsignacionLlenadoras", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                }
            }

            result = await _daoUbicacion.ActualizarRepartoProduccionLineasDobles(listaDatos);
            
            return result;
        }

        public async Task ModificarConfiguracionMaquinas(dynamic datos)
        {
            try
            {
                string idLinea = datos.idLinea.ToString();
                Linea linea = PlantaRT.planta.lineas.Find(l => l.id == idLinea);
                List<ConfiguracionMaquinasCompartidas> listaMaquinas = datos.maquinas.ToObject<List<ConfiguracionMaquinasCompartidas>>();

                var valuesOld = ObtenerConfiguracionMaquinasCompartidas();
                GuardarConfiguracionMaquinasCompartidas(listaMaquinas);

                DAO_Maquinas daoMaquinas = new DAO_Maquinas();
                daoMaquinas.RegistrarHistoricoMaquinas(valuesOld, listaMaquinas);

                DAO_Linea.ModificarMaquinasMultilinea();

                var paleterasLinea = listaMaquinas.Where(m => m.Linea == idLinea && m.Maquina.Contains("PAL")).ToList();
                List<MaquinasCompartidas> listaPaleteras = new List<MaquinasCompartidas>();

                foreach (var paletera in paleterasLinea)
                {
                    MaquinasCompartidas maquinaCompartida = new MaquinasCompartidas();
                    maquinaCompartida.Nombre = paletera.Maquina;
                    maquinaCompartida.value = paletera.Activa;
                    listaPaleteras.Add(maquinaCompartida);
                }

                await DAO_Linea.RevisarVelocidadNominalPaleteraZona(linea, listaPaleteras);

                //Tratamiento línea opuesta
                Linea lineaOpuesta = PlantaRT.planta.lineas.Find(l => l.Grupo == linea.Grupo && l.id != idLinea);
                var paleterasLineaOpuesta = listaMaquinas.Where(m => m.Linea == lineaOpuesta.id && m.Maquina.Contains("PAL")).ToList();
                List<MaquinasCompartidas> listaPaleterasOpuestas = new List<MaquinasCompartidas>();

                foreach (var paleteraOpuesta in paleterasLineaOpuesta)
                {
                    MaquinasCompartidas maquinaCompartidaOpuesta = new MaquinasCompartidas();
                    maquinaCompartidaOpuesta.Nombre = paleteraOpuesta.Maquina;
                    maquinaCompartidaOpuesta.value = paleteraOpuesta.Activa;
                    listaPaleterasOpuestas.Add(maquinaCompartidaOpuesta);
                }

                await DAO_Linea.RevisarVelocidadNominalPaleteraZona(lineaOpuesta, listaPaleterasOpuestas);

                string mensaje = IdiomaController.GetResourceName("CONFIG_EMPAQUETADORAS_PALETIZADORAS") + ": " + IdiomaController.GetResourceName("LINEA") + ": " + linea.numLineaDescripcion + ", ";

                var maquinasLinea = listaMaquinas.Where(m => m.Linea == idLinea).ToList();

                foreach (var maquina in maquinasLinea)
                {
                    mensaje += maquina.Maquina + ": " + (maquina.Activa ? "Sí" : "No") + ", ";
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Tags.ModificarAsignacionMaquinas", mensaje.Substring(0, mensaje.Length - 2), HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<string> ObtenerDescripcionMaquinasCompartidas()
        {
            var lista = new List<string>();

            using (MESEntities contexto = new MESEntities())
            {
                var listaNombres = contexto.ConfiguracionMaquinasCompartidas.AsNoTracking().Where(c => c.Ordenacion != null).OrderBy(x => x.Ordenacion).Select(c => c.Maquina).ToList();

                foreach (var maquina in listaNombres)
                {
                    var descripcion = contexto.Maquinas.AsNoTracking().Where(m => m.Nombre == maquina).Select(m => m.Descripcion).First();
                    if (!lista.Contains(descripcion))
                    {
                        lista.Add(descripcion);
                    }
                }
            }

            return lista;
        }

        public List<ConfiguracionMaquinasCompartidas> ObtenerConfiguracionMaquinasCompartidas()
        {
            using (MESEntities contexto = new MESEntities())
            {
                return contexto.ConfiguracionMaquinasCompartidas.AsNoTracking().Where(x => x.Ordenacion != null).OrderBy(x => x.Ordenacion).ToList();
            }
        }

        public void GuardarConfiguracionMaquinasCompartidas(List<ConfiguracionMaquinasCompartidas> listaMaquinas)
        {
            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    foreach (var maquina in listaMaquinas.Where(m => m.Maquina.Contains("EMP")).ToList())
                    {
                        var maquinaActual = contexto.ConfiguracionMaquinasCompartidas.Where(x => x.Id == maquina.Id).FirstOrDefault();
                        if (maquinaActual != null)
                        {
                            maquinaActual.Activa = maquina.Activa;
                        }
                    }

                    var paleteras = listaMaquinas.Where(m => m.Maquina.Contains("PAL")).ToList();
                    foreach (var paletera in paleteras)
                    {
                        var restoMaquinas = contexto.ConfiguracionMaquinasCompartidas.Where(x => x.Linea == paletera.Linea && x.Agrupacion == paletera.Agrupacion).ToList();
                        foreach (var otraMaquina in restoMaquinas)
                        {
                            otraMaquina.Activa = paletera.Activa;
                        }
                    }

                    contexto.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task ModificarPermisivoWO(string idLinea, string wo)
        {
            Linea lin = PlantaRT.planta.lineas.Where(l => l.id == idLinea).First();
            bool parametro;

            // Devolvemos el valor que tiene el parámetro "Bloqueo llenadora sin WO"
            using (MESEntities contexto = new MESEntities())
            {
                parametro = Convert.ToBoolean(contexto.ParametrosPlanta_Admin.AsNoTracking().Where(p => p.IdLinea == lin.numLinea && p.IdParametro == 16).Select(p => p.VALOR_INT).FirstOrDefault().Value);
            }

            RTDSValuesDto rtdsValues = new RTDSValuesDto()
            {
                Tags = new List<string>(),
                TagsValues = new List<object>(),
                Unit = "RTDS"
            };

            string lineaCorto = idLinea.Split('.').Last();
            rtdsValues.Tags.Add(lineaCorto + "_WO_ACTIVA");

            if (parametro)
            {
                // Al desasignar una WO
                if (wo == string.Empty)
                {
                    rtdsValues.TagsValues.Add(0);
                }
                // Al asignar una WO
                else
                {
                    rtdsValues.TagsValues.Add(1);
                }
            }
            // Si no está habilitado el parámetro siempre tendrá valor a 1
            else
            {
                rtdsValues.TagsValues.Add(1);
            }

            var values = await writeRTDS(rtdsValues);

            foreach (var item in values as IEnumerable)
            {
                if (!Convert.ToBoolean(item))
                {
                    var mensaje = IdiomaController.GetResourceName("ERROR_RTDS") + "Variable: " + lineaCorto + "_WO_ACTIVA" + ", valor: " + rtdsValues.TagsValues[0];
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, mensaje, "DAO_Tags.ModificarPermisivoWO", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                }
            }
        }

        public async Task ModificarPermisivoAdministracion(int numLinea)
        {
            Linea lin = PlantaRT.planta.lineas.Where(l => l.numLinea == numLinea).First();

            RTDSValuesDto rtdsValues = new RTDSValuesDto()
            {
                Tags = new List<string>(),
                TagsValues = new List<object>(),
                Unit = "RTDS"
            };

            string lineaCorto = lin.id.Split('.').Last();
            rtdsValues.Tags.Add(lineaCorto + "_WO_ACTIVA");
            rtdsValues.TagsValues.Add(1);

            var values = await writeRTDS(rtdsValues);

            foreach (var item in values as IEnumerable)
            {
                if (!Convert.ToBoolean(item))
                {
                    var mensaje = IdiomaController.GetResourceName("ERROR_RTDS") + "Variable: " + lineaCorto + "_WO_ACTIVA" + ", valor: " + 1;
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, mensaje, "DAO_Tags.ModificarPermisivoAdministracion", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                }
            }
        }
    }
}