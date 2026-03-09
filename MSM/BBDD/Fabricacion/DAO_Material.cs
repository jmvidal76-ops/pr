using BreadMES.Fabricacion;
using Clients.ApiClient.Contracts;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.DTO.Fabricacion;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api;
using MSM.Mappers.DTO.Fabricacion.Api.Equipment;
using MSM.Mappers.DTO.Fabricacion.Api.Materiales;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.Utilidades;
using Siemens.Brewing.Domain.Entities;
using Siemens.Brewing.Shared;
using Siemens.SimaticIT.BPM.Breads;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using Siemens.SimaticIT.MM.Breads;
using Siemens.SimaticIT.MM.Breads.Types;
using Siemens.SimaticIT.PDefM.Breads;
using Siemens.SimaticIT.PDefM.Breads.Types;
using Siemens.SimaticIT.POM.Breads;
using Siemens.SimaticIT.POM.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json;


namespace MSM.BBDD.Fabricacion
{
    public class DAO_Material : IDAO_Material
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiSiemensBrewingData"].ToString();
        private string UriTrazabilidadBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string _urlEquipment;
        private string _urlLot;
        private string _urlMaterial;
        private string _urlProcessParameter;
        private string _urlEntry;
        private string _urlOperation;
        private readonly IDAO_Orden _iOrden;

        private IApiClient _api;
        private string _urlMateriales;
        private string uriFabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();

        public DAO_Material()
        {
            _urlEquipment = string.Concat(UriBase, "equipment/");
            _urlLot = string.Concat(UriBase, "lot/");
            _urlMaterial = string.Concat(UriBase, "material/");
            _urlProcessParameter = string.Concat(UriBase, "processParameter/");
            _urlEntry = string.Concat(UriBase, "entry/");
            _urlOperation = string.Concat(UriTrazabilidadBase, "api/operation/");
        }

        public DAO_Material(IApiClient api)
        {
            _api = api;
            _urlMateriales = string.Concat(uriFabricacion, "api/Materiales/");
        }

        public static List<Materiales_FAB> GetArticlesByArea(String area)
        {
            List<Materiales_FAB> articles = new List<Materiales_FAB>();
            ProductProductionRule_BREAD pprb = new ProductProductionRule_BREAD();
            Collection<ProductProductionRule> pprArticles = pprb.Select("", 0, 0, "{PK} like '%" + area + "%' AND {PK} not like 'Default%' AND {TargetOrderLifeCycle} = 'OM'");
            using (MESEntities context = new MESEntities())
            {
                pprArticles.ToList().ForEach(item => { articles.Add(context.Materiales_FAB.AsNoTracking().Where(element => element.IdMaterial.Equals(item.FinalMaterialID)).FirstOrDefault()); });
            }

            if (!area.Contains("FE"))
                return articles.FindAll(item => item != null);
            else
            {
                DefinitionVersionPropertyValue_BREAD definitionBread = new DefinitionVersionPropertyValue_BREAD();
                DefinitionVersionPropertyValue definition;
                return articles.FindAll(item =>
                {
                    if (item == null)
                        return false;
                    else
                    {
                        definition = definitionBread.Select("", 0, 0, "{DefinitionID} = '" + item.IdMaterial + "' AND {MaterialPropertyID} = 'Subclase_codigo'").FirstOrDefault();
                        if (definition != null && definition.Value != null && !definition.Value.ToString().Equals("MIX"))
                            return true;
                        else
                            return false;
                    }
                });
            }
        }

        public List<Materiales_FAB> GetArticlesByAreaBBDD(string area)
        {
            List<Materiales_FAB> material = new List<Materiales_FAB>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ProductProductionRule]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@area", area);

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                Materiales_FAB materiales = new Materiales_FAB();

                                materiales.IdMaterial = (string)row["IdMaterial"];
                                materiales.Nombre = (string)row["Nombre"];
                                materiales.Descripcion = (string)row["Descripcion"];
                                materiales.IdClase = (string)row["IdClase"];
                                materiales.Clase = (string)row["Clase"];
                                materiales.Version = (string)row["Version"];
                                materiales.Status = (string)row["Status"];
                                materiales.UdMedida = (string)row["UdMedida"];
                                materiales.F_EfectivoDesde = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["F_EfectivoDesde"]);
                                materiales.F_EfectivoDesdeUTC = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["F_EfectivoDesdeUTC"]);
                                materiales.F_EfectivoHasta = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["F_EfectivoHasta"]);
                                materiales.F_EfectivoHastaUTC = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["F_EfectivoHastaUTC"]);
                                materiales.EnUso = (bool?)row["EnUso"];
                                materiales.Autor = (string)row["Autor"];
                                materiales.FechaCreacion = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["FechaCreacion"]);
                                materiales.FechaCreacionUTC = (DateTime)row["FechaCreacionUTC"];
                                materiales.FechaUltCreacion = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["FechaUltCreacion"]);
                                materiales.FechaUltCreacionUTC = (DateTime)row["FechaUltCreacionUTC"];
                                materiales.ModificadoPor = (string)row["ModificadoPor"];
                                materiales.InfoAdicional = row["InfoAdicional"].ToString();
                                materiales.Tipo = (string)row["Tipo"];
                                materiales.DescTipo = (string)row["DescTipo"];
                                materiales.PK_Material = (int)row["PK_Material"];
                                materiales.BOM = (string)row["BOM"];
                                material.Add(materiales);
                            }
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.GetArticlesByAreaBBDD", "I-ERP-MES-MATERIAL", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL"));
                        }
                    }
                }
            }

            return material;
        }

        internal static List<dynamic> ObtenerMaterialesCoccion()
        {
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    var lista = context.MaestroKOPs_Mostos_Ubicacion.AsNoTracking().Where(x => x.MaestroKOPs.IdTipoSubproceso == (int)TipoWO.Coccion).Distinct().ToList();
                    return context.vMaestroMateriales.AsNoTracking().ToList().Join(lista, x => x.IdMaterial, y => y.IdMosto, (x, y) => (dynamic)new { y.IdMosto, x.Descripcion }).Distinct().ToList();
                }
            }
            catch
            {
                return null;
            }
        }

        public static List<CONVERSIONES_DURACIONES_MOSTO> GetMostosCob()
        {
            String mosto = String.Empty;
            List<CONVERSIONES_DURACIONES_MOSTO> lstMateriales = new List<CONVERSIONES_DURACIONES_MOSTO>();
            CONVERSIONES_DURACIONES_MOSTO_BREAD co = new CONVERSIONES_DURACIONES_MOSTO_BREAD();
            lstMateriales = co.Select("", 0, 0, "").ToList();
            List<DefinitionVersionPropertyValue> materiales2 = new List<DefinitionVersionPropertyValue>();
            DefinitionVersionPropertyValue_BREAD definitionBread = new DefinitionVersionPropertyValue_BREAD();
            materiales2 = definitionBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND {Value} = 'CZA'").ToList();

            Definition_BREAD def = new Definition_BREAD();
            List<Definition> materiales = new List<Definition>();
            materiales2.ForEach(x => { materiales.Add(def.Select("", 0, 0, "{ID} = '" + x.DefinitionID + "'").FirstOrDefault()); });

            //Si hay materiales nuevos se borran todos y luego se vuelven a añadir al custom object
            if (lstMateriales.Count != materiales.Count)
            {
                Dictionary<String, List<String>> oldArticles = new Dictionary<string, List<string>>();
                List<String> values;
                foreach (var item in lstMateriales)
                {
                    values = new List<String>();
                    values.Add(item.Conversion.ToString());
                    values.Add(item.DuracionCoc.ToString());
                    values.Add(item.DuracionFil.ToString());
                    values.Add(item.DuracionGua.ToString());
                    oldArticles.Add(item.CodigoArticulo, values);
                    co.Delete(item);
                }
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMESsa"].ConnectionString))
                {
                    connection.Open();
                    using (SqlCommand command2 = new SqlCommand("SELECT [dbo].[GetMostoFromEnvasado](@CodArticle,@Condition,@Condition2)", connection))
                    {
                        command2.CommandType = CommandType.Text;
                        foreach (var item in materiales)
                        {
                            command2.Parameters.AddWithValue("@CodArticle", item.ID);
                            command2.Parameters.AddWithValue("@Condition", "MOP");
                            command2.Parameters.AddWithValue("@Condition2", "MDH");
                            mosto = command2.ExecuteScalar().ToString();
                            command2.Parameters.RemoveAt("@CodArticle");
                            command2.Parameters.RemoveAt("@Condition");
                            command2.Parameters.RemoveAt("@Condition2");

                            CONVERSIONES_DURACIONES_MOSTO aux = new CONVERSIONES_DURACIONES_MOSTO();
                            aux.CodigoArticulo = item.ID;
                            aux.Articulo = item.Description + " (Contiene " + (mosto != String.Empty ? mosto.Split('-')[1].Replace('"', ' ') : String.Empty) + " )";
                            List<String> oldValues;
                            if (oldArticles.TryGetValue(item.ID, out oldValues))
                            {
                                aux.Conversion = float.Parse(oldValues.ElementAt<String>(0));
                                aux.DuracionCoc = Double.Parse(oldValues.ElementAt<String>(1));
                                aux.DuracionFil = float.Parse(oldValues.ElementAt<String>(2));
                                aux.DuracionGua = Double.Parse(oldValues.ElementAt<String>(3));
                            }
                            else
                            {
                                aux.Conversion = 0;
                                aux.DuracionCoc = 0;
                                aux.DuracionFil = 0;
                                aux.DuracionGua = 0;
                            }
                            co.Create(aux);
                        }
                        lstMateriales = co.Select("", 0, 0, "").ToList();
                    }
                }
            }
            return lstMateriales;
        }
        /// <summary>
        /// Método para obtener todos los materiales
        /// </summary>
        /// <returns>Lista de Materiales</returns>
        public static List<Materiales_FAB> GetMateriales()
        {
            List<Materiales_FAB> lstMateriales = new List<Materiales_FAB>();
            using (MESEntities context = new MESEntities())
            {
                lstMateriales = context.Materiales_FAB.AsNoTracking().Where(m => !m.Clase.Contains("DUMMY") && !m.Descripcion.Contains("DUMMY") && !m.Nombre.Contains("Default")).OrderByDescending(p => p.FechaUltCreacion).ToList();

                lstMateriales.All(m => { m.FechaUltCreacion = m.FechaUltCreacion.Value.AddMilliseconds(-m.FechaUltCreacion.Value.Millisecond); return true; });
            }

            return lstMateriales;
        }

        public static List<Materiales_FAB> GetMateriales(String Condition)
        {
            using (MESEntities context = new MESEntities())
            {
                return context.Materiales_FAB.AsNoTracking().Where((item => item.Descripcion.Contains(Condition))).OrderBy(item => item.Descripcion).ToList<Materiales_FAB>();
            }
        }
        /// <summary>
        /// Método para obtener todos los materiales
        /// </summary>
        /// <returns>Lista de Materiales</returns>
        public static List<Materiales_FAB> GetMaterialesCelda(string salaCoccion)
        {
            string tipo = "";
            switch (salaCoccion)
            {
                case "MALTA": tipo = "MAL"; break;
                case "ADITIVOS": tipo = "MPA"; break;
                case "ADJUNTOS": tipo = "ADJ"; break;
            }

            List<Materiales_FAB> lstMateriales = new List<Materiales_FAB>();
            using (MESEntities context = new MESEntities())
            {
                lstMateriales = context.Materiales_FAB.AsNoTracking().Where(m => !m.Clase.Contains("DUMMY") && !m.Descripcion.Contains("DUMMY") && m.IdClase.Equals(tipo)).ToList();

                lstMateriales.All(m => { m.FechaUltCreacion = m.FechaUltCreacion.Value.AddMilliseconds(-m.FechaUltCreacion.Value.Millisecond); return true; });
            }

            return lstMateriales;
        }

        public async Task<Dictionary<string, string>> GetAtributosEquipo(SitEquipment sitEquipment, string[] prop)
        {
            DTO_EquipmentPropertiesValue _data = new DTO_EquipmentPropertiesValue()
            {
                Equipment = sitEquipment,
                PropNames = prop
            };
            var _ret = await ApiClient.PostAsJsonAsync(_urlEquipment, _data);
            if (_ret.IsSuccessStatusCode)
            {
                var _readAsyncResult = await _ret.Content.ReadAsAsync<DTO_EquipmentPropertiesValue>();
                return _readAsyncResult.Result;
            }
            return null;
        }
        /// <summary>
        /// Método para obtener todos los materiales aprobados
        /// </summary>
        /// <returns>Lista de Materiales</returns>
        public async Task<List<Materiales_FAB>> GetMaterialesAprobados(int equipo)
        {
            List<Materiales_FAB> lstMateriales = new List<Materiales_FAB>();
            Location_BREAD locBread = new Location_BREAD();
            Location loc = locBread.SelectByPK(equipo).FirstOrDefault();

            //Primero tenemos que ver que politica de almacenamiento tiene                    
            string nombrePlanta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
            string uriEquipmentByPlantId = string.Concat(_urlEquipment, "EquipmentByPlantId");

            DAO_Equipo _daoEquipo = new DAO_Equipo();

            SitEquipment equipoSit = await _daoEquipo.EquipmentByPlantId(loc.Path, nombrePlanta);
            string[] arrayProp = new string[4] { "POLITICA_DE_ALMACENAMIENTO", "REFERENCIA_MATERIAL", "CLASE_MATERIAL", "TIPO_MATERIAL" };

            string uriEquipmentPropertiesValue = string.Concat(_urlEquipment, "EquipmentPropertiesValue");

            DTO_EquipmentPropertiesValue _dtoAttrEquipos = new DTO_EquipmentPropertiesValue()
            {
                Equipment = equipoSit,
                PropNames = arrayProp
            };

            var _propResult = await ApiClient.PostAsJsonAsync(uriEquipmentPropertiesValue, _dtoAttrEquipos);
            var res = await _propResult.Content.ReadAsAsync<DTO_EquipmentPropertiesValue>();
            Dictionary<string, string> propiedadesEq = res.Result;

            switch (propiedadesEq["POLITICA_DE_ALMACENAMIENTO"].ToString())
            {
                case "FIJA_POR_REFERENCIA":
                    string material = propiedadesEq["REFERENCIA_MATERIAL"];
                    using (MESEntities context = new MESEntities())
                    {
                        lstMateriales = context.Materiales_FAB.AsNoTracking().Where(m => !m.Clase.Contains("DUMMY") && m.IdMaterial.Equals(material) && !m.Descripcion.Contains("DUMMY") && m.Status.Equals("APPROVED")).ToList();
                    }
                    break;
                case "FIJA_POR_CLASE":
                    material = propiedadesEq["CLASE_MATERIAL"];
                    using (MESEntities context = new MESEntities())
                    {
                        lstMateriales = context.Materiales_FAB.AsNoTracking().Where(m => !m.IdClase.Contains("DUMMY") && m.IdClase.Equals(material) && !m.Descripcion.Contains("DUMMY") && m.Status.Equals("APPROVED")).ToList();
                    }
                    break;
                case "FIJA_POR_TIPO":
                    material = propiedadesEq["TIPO_MATERIAL"];
                    using (MESEntities context = new MESEntities())
                    {
                        lstMateriales = context.Materiales_FAB.AsNoTracking().Where(m => !m.Clase.Contains("DUMMY") && m.Tipo.Equals(material) && !m.Descripcion.Contains("DUMMY") && m.Status.Equals("APPROVED")).ToList();
                    }
                    break;
                case "CAOTICA":
                    using (MESEntities context = new MESEntities())
                    {
                        lstMateriales = context.Materiales_FAB.AsNoTracking().Where(m => !m.Clase.Contains("DUMMY") && !m.Descripcion.Contains("DUMMY") && m.Status.Equals("APPROVED")).ToList();
                    }
                    break;
                default:
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "La politica de almacenamiento no se reconoce y no se cargaran los materiales, eq:" + equipo, "MSM/DAO_MATERIAL/GETMATERIALES/APROBADOS", System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName, HttpContext.Current.User.Identity.Name);
                    break;
                    //throw new Exception("No se pueden cargar los materiales por un error del modelo de planta");
            }

            return lstMateriales.OrderBy(item => item.Descripcion).ToList();
        }

        /// <summary>
        /// Método que obtiene un material
        /// </summary>
        /// <param name="IdMaterial">Id del material que se quiere obtener</param>
        /// <returns>Material</returns>
        public static Materiales_FAB GetMaterial(string IdMaterial)
        {
            using (MESEntities context = new MESEntities())
            {
                return context.Materiales_FAB.AsNoTracking().ToList().Find(m => m.IdMaterial.Equals(IdMaterial));
            }
        }

        /// <summary>
        /// Método que obtiene todos los mostos
        /// </summary>
        /// <returns>Materiales de tipo Mosto</returns>
        public List<Materiales_FAB> GetMostosCoccionBBDD(string area)
        {
            List<Materiales_FAB> material = new List<Materiales_FAB>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetMaterialesKOPConstante]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@area", area);

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                Materiales_FAB materiales = new Materiales_FAB();

                                materiales.IdMaterial = (string)row["IdMaterial"];
                                materiales.Nombre = (string)row["Nombre"];
                                materiales.Descripcion = (string)row["Descripcion"];
                                materiales.IdClase = (string)row["IdClase"];
                                materiales.Clase = (string)row["Clase"];
                                materiales.Version = (string)row["Version"];
                                materiales.Status = (string)row["Status"];
                                materiales.UdMedida = (string)row["UdMedida"];
                                materiales.F_EfectivoDesde = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["F_EfectivoDesde"]);
                                materiales.F_EfectivoDesdeUTC = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["F_EfectivoDesdeUTC"]);
                                materiales.F_EfectivoHasta = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["F_EfectivoHasta"]);
                                materiales.F_EfectivoHastaUTC = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["F_EfectivoHastaUTC"]);
                                materiales.EnUso = (bool?)row["EnUso"];
                                materiales.Autor = (string)row["Autor"];
                                materiales.FechaCreacion = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["FechaCreacion"]);
                                materiales.FechaCreacionUTC = (DateTime)row["FechaCreacionUTC"];
                                materiales.FechaUltCreacion = (string.IsNullOrEmpty(row["F_EfectivoHasta"].ToString()) ? null : (DateTime?)row["FechaUltCreacion"]);
                                materiales.FechaUltCreacionUTC = (DateTime)row["FechaUltCreacionUTC"];
                                materiales.ModificadoPor = (string)row["ModificadoPor"];
                                materiales.InfoAdicional = row["InfoAdicional"].ToString();
                                materiales.Tipo = (string)row["Tipo"];
                                materiales.DescTipo = (string)row["DescTipo"];
                                materiales.PK_Material = (int)row["PK_Material"];
                                materiales.BOM = (string)row["BOM"];
                                material.Add(materiales);
                            }
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.GetMostosCoccionBBDD", "I-ERP-MES-MATERIAL", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL"));
                        }
                    }
                }
            }

            return material;
        }

        /// <summary>
        /// Método que obtiene los materiales que van a ser consumidos por una WO
        /// </summary>
        /// <param name="IdOrden">Id de la WO</param>
        /// <returns>Especificación de materiales que van a ser consumidos</returns>
        public async Task<List<ConsumosMateriales_FAB>> GetConsumoMaterial(string codOrden)
        {
            List<ConsumosMateriales_FAB> consumos = new List<ConsumosMateriales_FAB>();
            List<ConsumosMateriales_FAB> retorno = new List<ConsumosMateriales_FAB>();
            Collection<LotOperation> coleccionOperat = new Collection<LotOperation>();
            List<Transformacion> listaTransf = new List<Transformacion>();
            LotOperation_BREAD lotoBread = new LotOperation_BREAD();
            using (MESEntities context = new MESEntities())
            {
                consumos = context.ConsumosMateriales_FAB.AsNoTracking().Where(m => m.tipo == 1 && m.IdOrden.Equals(codOrden) && m.Cantidad != 0).ToList();
                consumos.All(c => { c.Cantidad_Estimada.ToString().Replace('.', ','); return true; });
                foreach (ConsumosMateriales_FAB material in consumos)
                {
                    if (material.Cantidad_Estimada < 0)
                    {
                        coleccionOperat = ObtenerConsumoMaterial(material.IdOrden, material.IdMaterial);
                        decimal cantidad = 0;
                        foreach (var operacion in coleccionOperat)
                        {
                            string[] associated = operacion.AssociateTo.Split(';');
                            string[] comment = operacion.Comments.Split(';');
                            Transformacion op = new Transformacion();
                            try
                            {
                                string _urlReadOperations = string.Concat(_urlLot, "ReadOperations");
                                DTO_ReadOperations _readOperations = new DTO_ReadOperations()
                                {
                                    LotOperation = operacion,
                                    Associated = associated,
                                    Comment = comment
                                };
                                var result = await ApiClient.PostAsJsonAsync(_urlReadOperations, _readOperations);
                                if (result.IsSuccessStatusCode)
                                {
                                    op = await result.Content.ReadAsAsync<Transformacion>();
                                    op.IdLoteOrden = operacion.TargetLotID;
                                    op.IdSubLote = operacion.LotID;
                                    GetSerialNumber(op.OrdenOrigen, material.IdOrden, op);
                                    if (op.LoteMES != null)
                                    {
                                        cantidad += Convert.ToDecimal(op.Cantidad);
                                    }

                                }
                            }
                            catch (Exception ex)
                            {
                                DAO_Log.RegistrarLogBook("SQLS-IS", 1, 2, "ERROR MESSAGE: " + ex.Message + "; ERROR Stack Trace: " + ex.StackTrace, "DAO_Material.GetConsumoMaterial", System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName, null);
                            }

                        }
                        material.Cantidad_Estimada = Convert.ToDouble(cantidad);
                        material.Cantidad = Convert.ToDouble(cantidad);
                    }
                    retorno.Add(material);
                }
                consumos.OrderByDescending(c => c.RowUpdated);
            }

            return retorno;
        }
        /// <summary>
        /// Método que obtiene los materiales que estan planificados para producir
        /// </summary>
        /// <param name="IdOrden">Id de la WO</param>
        /// <returns>Especificación de materiales planificados</returns>
        public static IEnumerable<object> GetPlanificadoMaterial(string codOrden)
        {
            IEnumerable<object> lstEspecificacionMat = new List<EspecificacionMateriales_FAB>();
            using (MESEntities context = new MESEntities())
            {
                lstEspecificacionMat = context.EspecificacionMateriales_FAB.AsNoTracking().Where(e => e.Id_ORDEN.Equals(codOrden) && e.NombreEM.Equals("PLANNED")).Select(e => new
                {
                    Id_Material = e.Id_Material,
                    NombreEm = e.NombreEM,
                    Descripcion_Material = e.Descripcion_Material,
                    Cod_Orden = e.Cod_Orden,
                    Id_ORDEN = e.Id_ORDEN,
                    Id_Localizacion = e.Id_Localizacion,
                    Nombre_Localizacion = e.Id_Localizacion != null ? context.Equipo_FAB.AsNoTracking().Where(eq => eq.ID == e.Id_Localizacion).FirstOrDefault().Name : "",
                    Cantidad_Actual = e.Cantidad_Actual,
                    Cantidad_Estimada = e.Cantidad_Estimada,
                    Unidad_Medida = e.Unidad_Medida
                }).ToList();
            }

            return lstEspecificacionMat;
        }
        /// <summary>
        /// Método que obtiene los materiales que van a ser producidos por una WO
        /// </summary>
        /// <param name="IdOrden">Id de la WO</param>
        /// <returns>Especificación de materiales que van a ser producidos</returns>
        public static IEnumerable<object> GetProduccionEsperada(int codOrden)
        {
            IEnumerable<object> lstEspecificacionMat = new List<EspecificacionMateriales_FAB>();
            using (MESEntities context = new MESEntities())
            {
                string TipoEspProducido = (string)NombreEspecificacionMaterial.Producido.GetProperty("value");
                string TipoEspReelaborado = (string)NombreEspecificacionMaterial.Reelaborado.GetProperty("value");

                lstEspecificacionMat = context.EspecificacionMateriales_FAB.AsNoTracking().Where(e => e.Cod_Orden.Equals(codOrden) && (e.NombreEM.Equals(TipoEspProducido) || e.NombreEM.Equals(TipoEspReelaborado))).GroupBy(e => e.Id_Material).Select(e => new EspecificacionMaterial()
                {
                    Id_Material = e.Where(esp => esp.Id_Material_Actual == null).Select(esp => esp.Id_Material).FirstOrDefault(),
                    NombreEm = e.Where(esp => esp.Id_Material_Actual == null).Select(esp => esp.NombreEM).FirstOrDefault(),
                    Descripcion_Material = e.Where(esp => esp.Id_Material_Actual == null).Select(esp => esp.Descripcion_Material).FirstOrDefault(),
                    Cod_Orden = e.FirstOrDefault().Cod_Orden,
                    Id_ORDEN = e.FirstOrDefault().Id_ORDEN,
                    Cantidad_Actual = e.Sum(c => c.Cantidad_Actual),
                    Cantidad_Estimada = e.Where(esp => esp.Id_Material_Actual == null).Select(esp => esp.Cantidad_Estimada).FirstOrDefault(),
                    Unidad_Medida = e.Where(esp => esp.Id_Material_Actual == null).Select(esp => esp.Unidad_Medida).FirstOrDefault(),
                    DetalleEspecificacion = e.Where(de => de.Id_Material_Actual != null).Select(de => new DetalleEspecificacionMaterial
                    {
                        Cantidad_Actual = de.Cantidad_Actual,
                        Equipo_Origen = de.Equipo_Origen,
                        FechaTransferencia = de.RowUpdated.Value,
                        Unidad_Medida = de.Unidad_Medida
                    }).ToList()
                }).ToList();
            }

            return lstEspecificacionMat;
        }


        internal static List<LoteUbicacion_FAB> GetEquiposConLotes(int salaCoccion)
        {
            List<LoteUbicacion_FAB> lstMateriales = new List<LoteUbicacion_FAB>();
            int idSalaCoccion = 0;
            using (MESEntities context = new MESEntities())
            {
                var pathSala = context.Celda_FAB.AsNoTracking().Where(m => m.CeldaPK == salaCoccion).Select(c => c.ID).FirstOrDefault();

                idSalaCoccion = context.MMLocations_FAB.AsNoTracking().Where(m => m.LocPath.Equals(pathSala)).Select(p => p.LocPK).FirstOrDefault();

                lstMateriales = context.LoteUbicacion_FAB.AsNoTracking().Where(m => m.ParentLocPK == idSalaCoccion && m.Quantity > 0).OrderBy(c => c.LOCID).ToList();
            }

            return lstMateriales;
        }

        /// <summary>
        /// Metodo para devolver la lista de materiales de una ubicacion
        /// </summary>
        /// <param name="salaCoccion"></param>
        /// <returns></returns>
        internal static List<LoteUbicacionMaterial_FAB> GetMaterialesUbicacion(string salaCoccion)
        {
            List<LoteUbicacionMaterial_FAB> lstMateriales = new List<LoteUbicacionMaterial_FAB>();
            int idSalaCoccion = 0;
            using (MESEntities context = new MESEntities())
            {
                idSalaCoccion = context.MMLocations_FAB.AsNoTracking().Where(m => m.LocID.Equals(salaCoccion)).Select(p => p.LocPK).Max();

                lstMateriales = context.LoteUbicacionMaterial_FAB.AsNoTracking().Where(m => m.ParentLocPK == idSalaCoccion).ToList();

                lstMateriales.All(m => { m.LastUpdate = m.LastUpdate.Value.AddMilliseconds(-m.LastUpdate.Value.Millisecond); return true; });
            }

            return lstMateriales;
        }

        internal static List<LoteUbicacionMaterial_FAB> GetMaterialesUbicacion(int equipo)
        {
            List<LoteUbicacionMaterial_FAB> lstMateriales = new List<LoteUbicacionMaterial_FAB>();
            using (MESEntities context = new MESEntities())
            {
                lstMateriales = context.LoteUbicacionMaterial_FAB.AsNoTracking().Where(m => m.LocPK == equipo).ToList();

                lstMateriales.All(m => { m.LastUpdate = m.LastUpdate.Value.AddMilliseconds(-m.LastUpdate.Value.Millisecond); return true; });

                switch (lstMateriales.Select(m => m.PoliticaVaciado).FirstOrDefault())
                {
                    case "FIFO":
                        lstMateriales = lstMateriales.OrderBy(m => m.CreatedOn).ToList();
                        break;
                    //case "FEFO": 
                    //    //PENDIENTE DE IMPLEMENTAR EN TRAZABILIDAD
                    //    break;
                    case "LIFO":
                        lstMateriales = lstMateriales.OrderByDescending(m => m.CreatedOn).ToList();
                        break;
                }
            }

            return lstMateriales.FindAll(item => item.Quantity != 0).ToList();
        }

        internal async Task<ParamsReturnValue> crearLoteEnUbicacion(dynamic datos)
        {
            string equipo = datos.equipo.ToString();
            int idEquipo = 0;
            if (!int.TryParse(equipo, out idEquipo))
            {
                return new ParamsReturnValue(false);
            }
            string material = datos.material.ToString();
            int idMaterial = 0;
            if (!int.TryParse(material, out idMaterial))
            {
                return new ParamsReturnValue(false);
            }
            decimal cant = decimal.Parse(datos.cantidad.ToString());
            string nserie = datos.serie.ToString();

            DTO_Lot _lotDto = new DTO_Lot()
            {
                IdMaterial = idMaterial,
                Destino = idEquipo,
                Cantidad = cant,
                Fecha = DateTime.Now,
                UoM = "",
                Lote = nserie
            };

            string uriCreateLot = string.Concat(_urlLot, "LotLocation");
            var _api = await ApiClient.PostAsJsonAsync(uriCreateLot, _lotDto);
            if (_api.IsSuccessStatusCode)
            {
                return await _api.Content.ReadAsAsync<ParamsReturnValue>();
            }
            return new ParamsReturnValue(false);
        }

        internal async Task<bool> editarLote(dynamic datos)
        {
            string equipo = datos.equipo.ToString();
            string material = datos.material.ToString();
            decimal cant = decimal.Parse(datos.cantidad.ToString());
            string nserie = datos.serie.ToString();

            string _urlUoM = string.Concat(_urlMaterial, "GetMMUoM", "?material=", material);
            var _apiUoM = await ApiClient.GetAsync(_urlUoM);
            string uom = await _apiUoM.Content.ReadAsAsync<string>();
            string pk = datos.lotpk.ToString();

            string resultado = "";
            string urlLoteConserie = string.Concat(_urlLot, "LotWithSeries");
            DTO_Lot _lotDTO = new DTO_Lot()
            {
                Location = equipo,
                Material = material,
                CantidadNullable = cant,
                UoM = uom,
                Serie = nserie,
                Pk = pk
            };
            var _apiLotConSerie = await ApiClient.PostAsJsonAsync(urlLoteConserie, _lotDTO);
            ParamsReturnValue prv = await _apiLotConSerie.Content.ReadAsAsync<ParamsReturnValue>();

            if (prv.succeeded)
            {
                return true;
            }
            else
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Material.editarLote", prv.message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, prv.message, "DAO_Material.editarLote", "WEB-FABRICACION", "Sistema");
                return false;
            }
        }

        internal async Task<bool> moverLote(dynamic datos)
        {
            string uriMoverLote = string.Concat(_urlLot, datos);
            var result = await ApiClient.PostAsJsonAsync(uriMoverLote, datos);
            return await result.Content.ReadAsAsync<bool>();
        }

        internal async Task<ReturnValue> declararProduccion(dynamic datosProd)
        {
            try
            {
                string batch = datosProd.batch.ToString();
                string cantidad = datosProd.cantidad.ToString();
                string material = datosProd.material.ToString();

                //Para declarar una produccion:
                //Creamos un lote en el equipo padre (WP) o en ese equipo (FE y GU)
                //Actualizamos o creamos el MatSpecItem

                DTO_MaterialProduction _materialProductionDTO = new DTO_MaterialProduction()
                {
                    Orden = batch,
                    Cantidad = cantidad,
                    Material = material
                };
                string urlProduccionMaterial = string.Concat(_urlMaterial, "MaterialProductionCreate");
                var materialPro = await ApiClient.PostAsJsonAsync(urlProduccionMaterial, _materialProductionDTO);
                return await materialPro.Content.ReadAsAsync<ReturnValue>();

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Material.declararProduccion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Material.DeclararProduccion", "WEB-FABRICACION", "Sistema");
                return new ReturnValue(false, -1, ex.Message);
            }
        }

        internal async Task<ReturnValue> DeclararConsumo(dynamic datosProd)
        {
            try
            {
                string nuevoMaterialNombre = "";
                string nuevoMaterialId = "";

                DTO_MaterialConsume _materialConsumeDTO = new DTO_MaterialConsume()
                {
                    Batch = datosProd.batch.ToString(),
                    Origen = datosProd.origen.ToString(),
                    Destino = datosProd.destino.ToString(),
                    Cantidad = datosProd.cantidad.ToString(),
                    Fecha = DateTime.Now.ToUniversalTime().ToString()
                };

                string urlDeclaraConsumo = string.Concat(_urlMaterial, "MaterialConsume");
                var _result = await ApiClient.PostAsJsonAsync(urlDeclaraConsumo, _materialConsumeDTO);
                ReturnValue _ret = new ReturnValue();
                if (_result.IsSuccessStatusCode)
                {
                    _ret = await _result.Content.ReadAsAsync<ReturnValue>();
                }

                //ReturnValue ret = SitMaterialMovement_BREAD.gestionarMovimientoMaterial(batch, origen, destino, "Consumed", cantidad, DateTime.Now.ToUniversalTime().ToString());

                return _ret;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Material.DeclararConsumo", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Material.DeclararConsumo", "WEB-FABRICACION", "Sistema");
                return new ReturnValue(false, -1, ex.Message);
            }
        }


        internal static List<DTO_ConsumoMateriales> GetProduccionMaterial(string codOrden)
        {
            List<ConsumosMateriales_FAB> produccion = new List<ConsumosMateriales_FAB>();
            List<DTO_ConsumoMateriales> listaDevolver = new List<DTO_ConsumoMateriales>();
            Order_BREAD oBread = new Order_BREAD();
            Lot_BREAD lotBread = new Lot_BREAD();
            Definition_BREAD defBread = new Definition_BREAD();
            LotOperation_BREAD lotoBread = new LotOperation_BREAD();
            Order orden = oBread.Select("", 0, 0, "{ID}='" + codOrden + "'").FirstOrDefault();
            Collection<LotOperation> coleccionOperat = lotoBread.Select("", 0, 0, "{AssociateTo} like '%" + codOrden + "%' AND {TargetLotID}<>'' AND {ID} = 'Transform'");

            using (MESEntities context = new MESEntities())
            {
                produccion = context.ConsumosMateriales_FAB.AsNoTracking().Where(m => m.tipo == 0 && m.IdOrden.Equals(codOrden)).ToList();

                foreach (var prod in produccion)
                {
                    DTO_ConsumoMateriales dto = new DTO_ConsumoMateriales();
                    dto.Descripcion_Material = prod.Descripcion_Material;
                    List<LotOperation> listOperation = coleccionOperat.Where(x => !x.AssociateTo.Split(';')[1].Contains(prod.IdOrden) && x.AssociateTo.Split(';')[0].Contains(prod.IdOrden) && x.Comments.Contains(prod.IdMaterial)).ToList();
                    dto.IdMaterial = prod.IdMaterial;
                    dto.IdOrden = prod.IdOrden;
                    dto.tipo = prod.tipo;
                    dto.Cantidad_Estimada = prod.Cantidad_Estimada;
                    dto.LoteMes = prod.loteMES;

                    //dto.Cantidad = context.EspecificacionMateriales_FAB.ToList().FindAll(x => (x.NombreEM.Equals("PRODUCED")) && (x.Id_Material.Equals(prod.IdMaterial)) && (x.Id_ORDEN.Equals(prod.IdOrden))).Sum(x => x.Cantidad_Actual);
                    dto.Cantidad = listOperation.Sum(z => float.Parse(z.Comments.Split(';')[1].Replace('.', ',')));
                    //dto.Cantidad = lotoBread.Select("", 0, 0, condition).ToList().Sum(x=> x.);
                    dto.UOM = prod.UOM;

                    Order o = oBread.Select("", 0, 0, "{ID}='" + codOrden + "'").FirstOrDefault();

                    if (!o.TypeID.Equals("FL") && !prod.Descripcion_Material.Contains("BAGAZO"))
                    {
                        Lot loteMosto = lotBread.Select("", 0, 0, "{ID}='" + prod.loteMES + "'").FirstOrDefault();

                        if (loteMosto != null)
                        {
                            //dto.Cantidad = double.Parse(loteMosto.Quantity.ToString().Replace('.', ','));
                            dto.LoteMes = loteMosto.ID;
                            dto.UOM = loteMosto.UoMID;
                        }
                    }
                    else
                        if (o.TypeID.Equals("FL"))
                        dto.Cantidad = dto.Cantidad_Estimada;

                    listaDevolver.Add(dto);
                }
            }

            return listaDevolver.OrderByDescending(c => c.Cantidad).ToList();
        }

        private static void GetSerialNumber(String OrigenOrder, String IdOrder, Transformacion op)
        {
            LotOperation lotOp = new LotOperation();
            Definition_BREAD article = new Definition_BREAD();
            Definition auxMaterial;
            Definition material = article.Select("", 0, 0, "{ID} = '" + op.IdMaterial + "'").FirstOrDefault();

            MaterialClass_BREAD matClass = new MaterialClass_BREAD();
            MaterialClass mat = matClass.SelectByPK(material.MaterialClassPK).FirstOrDefault();

            MaterialType_BREAD matType = new MaterialType_BREAD();
            MaterialType type = matType.SelectByPK(mat.MaterialTypePK).FirstOrDefault();

            LotOperation_BREAD lotOpBread = new LotOperation_BREAD();

            if ((!OrigenOrder.Contains("-TR") && !OrigenOrder.Contains("-GU") && !OrigenOrder.Contains("-FE")) || (OrigenOrder.Contains("-TR") && op.OrdenOrigen.Contains("-FE")))
            {
                lotOp = lotOpBread.Select("", 0, 0, "{AssociateTo} like '" + OrigenOrder + ";" + IdOrder + ";" + op.IdEquipoOrigen + "%'" +
                       " AND {ID}='Transform' AND {TargetLotID} IS NOT NULL AND {Comments} like '" + op.IdMaterial + "%' AND {OperationDate} = '" + op.Fecha.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") + "'").FirstOrDefault();

            }
            else
            {
                //Si es una orden de trasiego, se tomarán los aditivos añadidos en la orden de GU o FER, ya que es donde realizamos la transformación de los consumidos en trasiegos.
                lotOp = lotOpBread.Select("", 0, 0, "{AssociateTo} like '" + op.OrdenOrigen + ";" + op.OrdenDestino + "%" + op.IdEquipoDestino + "'" +
                       " AND {ID}='Transform' AND {TargetLotID} IS NOT NULL AND {Comments} like '" + op.IdMaterial + "%' AND {OperationDate} = '" + op.Fecha.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") + "'").FirstOrDefault();

                auxMaterial = article.Select("", 0, 0, "{ID} = '" + lotOp.Comments.Split(';')[0] + "'").FirstOrDefault();
                if (auxMaterial.MaterialClassID.Equals("MOS") && IdOrder.Contains("-TR"))//(!IdOrder.Contains("-GU") && !IdOrder.Contains("-FE"))
                {
                    lotOp = lotOpBread.Select("", 0, 0, "{AssociateTo} like '" + op.OrdenOrigen + ";" + op.OrdenOrigen + "%' AND {ID}='Transform' AND {TargetLotID} IS NOT NULL AND {Comments} like '" + op.IdMaterial + "%'").FirstOrDefault();
                    op.OrdenOrigen = lotOpBread.Select("", 0, 0, "{LotID} like '" + lotOp.LotID.Split(new String[] { "-SL" }, StringSplitOptions.RemoveEmptyEntries)[0] + "' AND {SourceLotID} IS NOT NULL").FirstOrDefault().AssociateTo.Split(';')[1];
                }
            }
            ////Para obtener el serialNumber en caso de que se trate de MP o MPA o SUB
            DefinitionVersionPropertyValue_BREAD propBread = new DefinitionVersionPropertyValue_BREAD();
            //Las CZA REcup tienen la propiedad Subclase_codigo a CRC
            DefinitionVersionPropertyValue CzaRecup = propBread.Select("", 0, 0, "{DefinitionID} = '" + material.ID + "' AND {MaterialPropertyID} = 'Subclase_codigo' AND {Value} = 'CRC'").FirstOrDefault();
            if (type.Name.Equals("Subproducto") || type.Name.Equals("Default") || type.Name.Equals("Materias Primas") || CzaRecup != null)
            {
                //LotOrSubLot_BREAD lotSubLotBread = new LotOrSubLot_BREAD();
                String finalBatch = String.Empty;

                int count = lotOp.LotID.Split('-').ToList().Count - 2;
                int index = 0;
                //Elimino el SLXXX
                if (lotOp.LotID.ToLower().Contains("sl"))
                {
                    lotOp.LotID.Split('-').ToList().ForEach(delegate (String item) { if (index <= count) { finalBatch += item + "-"; index++; } });
                    lotOp.TargetLotID = finalBatch.Substring(0, finalBatch.Length - 1);
                }
                else
                {
                    lotOp.TargetLotID = lotOp.LotID;
                }

                //Si se ha consumido más de lo que había, se elige la cantidad total consumida
                LotOperation lotOp2 = lotOpBread.Select("", 0, 0, "{LotID} = '" + lotOp.TargetLotID + "' AND {ID} = 'Supply' AND {Comments} like 'Supply%'").FirstOrDefault();
                if (lotOp2 != null)
                {
                    lotOp2 = lotOpBread.Select("", 0, 0, "{Comments} like '" + lotOp2.AssociateTo.Split(';')[0] + "%' AND {TargetLotPK} = " + lotOp.LotPK.ToString() + " AND {OldQuantity} =" + Decimal.Parse(lotOp2.AssociateTo.Split(';')[1]).ToString("0.##").Replace(',', '.')).FirstOrDefault();
                    if (lotOp2 != null)
                    {
                        op.Cantidad = lotOp2.OldQuantity.ToString().Replace('.', ',');
                    }
                }
            }

            Lot_BREAD lotConsumed = new Lot_BREAD();
            Lot consumed = lotConsumed.Select("", 0, 0, "{ID}='" + lotOp.TargetLotID + "'").FirstOrDefault();

            if (consumed != null)
            {
                Order_BREAD oBread = new Order_BREAD();
                Order order = oBread.Select("", 0, 0, "{ID}='" + IdOrder + "'").FirstOrDefault();

                if (order.TypeID.Equals("GU") || order.TypeID.Equals("PR") || order.TypeID.Equals("FE") || (order.TypeID.Equals("FL") && mat.ID.Equals("FER")) || order.TypeID.Equals("TR"))
                {
                    String finalBatch = String.Empty;
                    if (lotOp.LotID.Contains("SL"))
                    {
                        int count = lotOp.LotID.Split('-').ToList().Count - 2;
                        int index = 0;
                        lotOp.LotID.Split('-').ToList().ForEach(delegate (String item) { if (index <= count) { finalBatch += item + "-"; index++; } });
                    }
                    op.LoteMES = String.IsNullOrEmpty(finalBatch) ? lotOp.LotID : finalBatch.Substring(0, finalBatch.Length - 1);
                }
                else
                    op.LoteMES = !consumed.ID.Contains("Dummy") ? consumed.ID : !String.IsNullOrEmpty(lotOp.LotID) ? lotOp.LotID : "---";

                op.Lote = String.IsNullOrEmpty(consumed.SerialNumber) ? "N/A" : consumed.SerialNumber;
            }

            op.EquipoDestino = op.IdEquipoDestino + " - " + op.EquipoDestino;
            op.EquipoOrigen = op.IdEquipoOrigen + " - " + op.EquipoOrigen;
            op.Material = op.IdMaterial + " - " + op.Material;
        }

        internal Collection<LotOperation> ObtenerConsumoMaterial(string IdOrden, string IdMaterial)
        {
            Collection<LotOperation> coleccionOperat = new Collection<LotOperation>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerLoteMaterial]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@Id_ORDEN", IdOrden);
                    command.Parameters.AddWithValue("@Material", IdMaterial);


                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {

                        connection.Open();
                        DataTable dt = new DataTable();
                        da.Fill(dt);
                        foreach (DataRow row in dt.Rows)
                        {
                            LotOperation operacion = new LotOperation()
                            {
                                OldStatusID = "n/a",
                                AssociateTo = row["AssociateTo"].ToString(),
                                Comments = row["Comments"].ToString(),
                                LotID = row["NewName"].ToString(),
                                LotPK = Convert.ToInt32(row["LotPK"]),
                                NewHutID = null,
                                NewHutPK = null,
                                NewName = row["NewName"].ToString(),
                                NewQuantity = Convert.ToInt32(row["NewQuantity"]),
                                NewStatusID = "n/a",
                                NewStatusPK = Convert.ToInt32(row["NewStatusPK"]),
                                NewUoMID = row["Comments"].ToString().Split(';')[2],
                                OldHutID = null,
                                OldHutPK = null,
                                OldQuantity = Convert.ToInt32(row["OldQuantity"]),
                                OldUoMID = row["Comments"].ToString().Split(';')[2],
                                OperationDate = (DateTime)row["OperationDate"],
                                PK = Convert.ToInt32(row["LotPK"].ToString()),
                                SourceIsLot = true,
                                SourceLotID = null,
                                SourceLotPK = null,
                                TargetIsLot = true,
                            };
                            coleccionOperat.Add(operacion);
                        }
                    }
                }
            }
            return coleccionOperat;
        }
        internal async Task<List<Transformacion>> GetConsumosMaterial(string IdMaterial, string IdOrden)
        {

            string _urlTransfer = string.Concat(_urlOperation, "GetConsumosMaterial/", IdOrden, "/", IdMaterial);
            var _api = await ApiClient.GetAsync(_urlTransfer);
            return await _api.Content.ReadAsAsync<List<Transformacion>>();

        }

        public static List<LoteUbicacionMaterial_FAB> GetResumenSilos(string tipo)
        {
            List<Celda_FAB> listaCeldas = new List<Celda_FAB>();
            switch (tipo)
            {
                case "RECEPCION":
                case "RECUPERADOS":
                    listaCeldas = DAO_Equipo.obtenerCeldasMateriales().Where(m => m.ID.Contains(tipo)).ToList();
                    break;
                default:
                    listaCeldas = DAO_Equipo.obtenerCeldasMaterialesProduccion().Where(m => m.ID.Contains(tipo)).ToList();
                    break;
            }



            List<LoteUbicacionMaterial_FAB> listaResumen = new List<LoteUbicacionMaterial_FAB>();

            for (int i = 0; i < listaCeldas.Count; i++)
            {
                listaResumen.AddRange(DAO_Material.GetMaterialesUbicacion(listaCeldas[i].Name).GroupBy(m => m.DefID).Select(m => new LoteUbicacionMaterial_FAB()
                {
                    UomID = m.FirstOrDefault().UomID,
                    DefID = m.FirstOrDefault().DefID,
                    DefPK = m.FirstOrDefault().DefPK,
                    Descript = m.FirstOrDefault().Descript,
                    InitQuantity = m.Sum(e => e.InitQuantity),
                    Quantity = m.Sum(e => e.Quantity),
                    ClassDescript = m.FirstOrDefault().ClassDescript
                }).OrderBy(m => m.Quantity));
            }



            return listaResumen;
        }

        public async Task<List<Transformacion>> obtenerTransferenciasMosto(string idOrden)
        {

            //string _urlTransfer = string.Concat(_urlOperation, "GetTransferByOrderId", "?idOrden=", idOrden);
            //var _api = await ApiClient.GetAsync(_urlTransfer);
            //return await _api.Content.ReadAsAsync<List<Transformacion>>();


            List<Transformacion> listaTransf = new List<Transformacion>();
            LotOperation_BREAD lotoBread = new LotOperation_BREAD();
            Definition_BREAD defBread = new Definition_BREAD();
            Order_BREAD oBread = new Order_BREAD();
            Order orden = oBread.Select("", 0, 0, "{ID}='" + idOrden + "'").FirstOrDefault();
            List<LotOperation> lotesGuarda = new List<LotOperation>();
            Dictionary<String, List<String>> auxMaterial = new Dictionary<String, List<String>>();
            Transformacion loteGuarda = new Transformacion();
            List<String> order;
            String condition = String.Empty;
            if (orden.TypeID.Equals("PR"))
                condition = "{AssociateTo} like '%" + idOrden + "%' AND {TargetLotID} LIKE '%-SL%'";
            else
                condition = "{AssociateTo} like '%" + idOrden + "%' AND {TargetLotID}<>'' AND {ID} = 'Transform'";

            Collection<LotOperation> coleccionOperat = lotoBread.Select("", 0, 0, condition);

            foreach (var operacion in coleccionOperat)
            {
                string[] associated = operacion.AssociateTo.Split(';');

                if ((!associated[1].Equals(idOrden) && associated[0].Equals(idOrden)) || (orden.TypeID.Equals("PR") && associated[3].Contains("-EQ-LLE-")))
                {
                    if (idOrden.Contains("GU"))
                    {
                        if (!associated[0].Equals(associated[1]))
                        {
                            lotesGuarda = lotoBread.Select("", 0, 0, "{AssociateTo} LIKE '" + associated[1] + "%' AND {TargetLotID} <> '' AND {Comments} NOT like '" + orden.FinalMaterialID + "%'").ToList();
                            loteGuarda = new Transformacion();
                            if (lotesGuarda.Count != 0)
                            {
                                using (MESEntities context = new MESEntities())
                                {
                                    foreach (var item in lotesGuarda)
                                    {
                                        String material = item.Comments.Split(';')[0];
                                        String auxOrder = associated[1];
                                        loteGuarda = new Transformacion();
                                        auxMaterial.TryGetValue(material, out order);
                                        if (order == null)
                                        {
                                            List<EspecificacionMateriales_FAB> auxList = context.EspecificacionMateriales_FAB.AsNoTracking().Where(c => (c.NombreEM.Equals("PRODUCED")) && (c.Id_Material.Equals(material)) && (c.Id_ORDEN.Equals(auxOrder))).ToList();
                                            if (auxList.Count != 0)
                                            {
                                                loteGuarda.LoteMES = auxList[0].Id_Lote.Contains("Dummy") ? "---" : auxList[0].Id_Lote;
                                                order = new List<String>();
                                                order.Add(auxOrder);
                                                auxMaterial.Add(material, order);
                                                break;
                                            }
                                        }
                                        else
                                        {
                                            if (order.IndexOf(auxOrder) == -1)
                                            {
                                                List<EspecificacionMateriales_FAB> auxList = context.EspecificacionMateriales_FAB.AsNoTracking().Where(c => (c.NombreEM.Equals("PRODUCED")) && (c.Id_Material.Equals(material)) && (c.Id_ORDEN.Equals(auxOrder))).ToList();
                                                if (auxList.Count != 0)
                                                {
                                                    loteGuarda.LoteMES = auxList[0].Id_Lote.Contains("Dummy") ? "---" : auxList[0].Id_Lote;
                                                    order.Add(auxOrder);
                                                    auxMaterial.Remove(material);
                                                    auxMaterial.Add(material, order);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else
                            continue;
                    }

                    string[] comment = operacion.Comments.Split(';');
                    Transformacion op = new Transformacion();
                    op.Cantidad = float.Parse(comment[1].Replace('.', ',')).ToString();
                    op.IdEquipoDestino = associated[3];
                    switch (orden.TypeID)
                    {
                        case var _ when orden.TypeID.Equals("TR"):
                            LotOperation auxTransfer = lotoBread.Select("", 0, 0, "{AssociateTo} like '" + associated[0] + "%' AND {Description}='Lot Transformed' AND {SourceLotID} IS NOT NULL AND {LotID} LIKE '%-TRA%'").FirstOrDefault();
                            if (auxTransfer != null)
                            {
                                op.IdEquipoOrigen = auxTransfer.AssociateTo.Split(';')[2];
                                auxTransfer = lotoBread.Select("", 0, 0, "{LotID} like '" + auxTransfer.SourceLotID.Split(new String[] { "-SL" }, StringSplitOptions.RemoveEmptyEntries)[0] + "%' AND {Description}='Lot Transformed' AND {SourceLotID} is not null").FirstOrDefault();
                                op.OrdenOrigen = auxTransfer.AssociateTo.Split(';')[1];
                            }
                            break;
                        case var _ when orden.TypeID.Equals("WP"):
                            LotOperation auxWP = lotoBread.Select("", 0, 0, "{Comments} like '" + operacion.Comments + "%' AND {LotPK}='" + operacion.LotPK + "'").FirstOrDefault();
                            if (auxWP != null)
                            {
                                op.IdEquipoOrigen = auxWP.AssociateTo.Split(';')[2];
                                op.OrdenOrigen = associated[0];
                            }
                            break;
                        default:
                            op.IdEquipoOrigen = associated[2];
                            op.OrdenOrigen = associated[0];
                            break;
                    }
                    op.Fecha = operacion.OperationDate.ToLocalTime();
                    op.IdMaterial = comment[0];
                    op.IdLoteOrden = String.IsNullOrEmpty(loteGuarda.LoteMES) ? operacion.TargetLotID : loteGuarda.LoteMES;
                    op.IdSubLote = operacion.LotID;
                    op.OrdenDestino = associated[1];
                    op.UoM = comment[2];
                    op.LoteMES = String.IsNullOrEmpty(loteGuarda.LoteMES) ? operacion.TargetLotID : loteGuarda.LoteMES;
                    //op.loteMES = (loteGuarda == null || String.IsNullOrEmpty(loteGuarda.TargetLotID)) ? operacion.TargetLotID : loteGuarda.TargetLotID;
                    op.LoteMES = op.LoteMES.Contains("Dummy") ? "---" : op.LoteMES;
                    Definition def1 = defBread.Select("", 0, 0, "{ID}='" + op.IdMaterial + "'").FirstOrDefault();
                    op.Material = comment[0] + " - " + def1.Description;
                    op.IdMaterial = operacion.OldName;

                    DAO_Equipo _daoEquipo = new DAO_Equipo();
                    string valor = await _daoEquipo.GetIdEquipment(op.IdEquipoDestino);

                    op.EquipoDestino = associated[3] + " - " + valor;

                    valor = await _daoEquipo.GetIdEquipment(op.IdEquipoOrigen);

                    op.EquipoOrigen = op.IdEquipoOrigen + " - " + valor;

                    listaTransf.Add(op);

                }

            }

            //Busco en las ordenes de Trasiegos
            if (orden.TypeID.Equals("FE"))
            {
                Collection<LotOperation> trOrder = new Collection<LotOperation>();
                //Se obtienen todos los trasiegos realizados desde la fermentación
                LotOperation auxTransfer = lotoBread.Select("", 0, 0, "{AssociateTo} like '%" + idOrden + "%' AND {Description}='Lot Transformed' AND {TargetLotID} NOT like ' '").FirstOrDefault();
                //Se obtienen los lote de los Trasiegos
                if (auxTransfer != null)
                    trOrder = lotoBread.Select("", 0, 0, "{LotID} like '" + auxTransfer.TargetLotID + "%' AND {ID}='Transform' AND {TargetLotID} IS NOT NULL AND {TargetLotID} LIKE '%-TRA%'");
                Collection<LotOperation> decantingTransfer = new Collection<LotOperation>();
                List<String> searchedLots = new List<string>();

                foreach (LotOperation item in trOrder)
                {
                    //Se puede dar el caso de realizar varios trasiegos desde la misma fermentación, con diferente destino
                    if (!searchedLots.Contains(item.TargetLotID))
                    {
                        searchedLots.Add(item.TargetLotID);
                        foreach (LotOperation item2 in lotoBread.Select("", 0, 0, "{LotID} like '" + item.TargetLotID + "%' AND {ID}='Transform' AND {TargetLotID} IS NOT NULL"))
                            decantingTransfer.Add(item2);
                    }
                }

                Definition def = new Definition();

                Equipment_BREAD eBread = new Equipment_BREAD();

                foreach (LotOperation transfer in decantingTransfer)
                {
                    string[] asso = transfer.AssociateTo.Split(';');

                    Transformacion op = new Transformacion();
                    op.Cantidad = float.Parse(transfer.Comments.Split(';')[1].Replace('.', ',')).ToString();

                    op.Fecha = transfer.OperationDate.ToLocalTime();
                    op.IdMaterial = asso[1];
                    def = defBread.Select("", 0, 0, "{ID}='" + orden.FinalMaterialID + "'").FirstOrDefault();
                    op.Material = def.ID + " - " + def.Description;
                    op.IdMaterial = transfer.NewName;

                    auxTransfer = lotoBread.Select("", 0, 0, "{LotID} = '" + transfer.LotID + "' AND {SourceLotID} IS NOT NULL").FirstOrDefault();

                    op.IdEquipoOrigen = auxTransfer.AssociateTo.Split(';')[2];
                    op.OrdenOrigen = auxTransfer.AssociateTo.Split(';')[0];
                    op.EquipoOrigen = op.IdEquipoOrigen + " - " + eBread.Select("", 0, 0, "{Name}='" + op.IdEquipoOrigen + "'").FirstOrDefault().Label;

                    op.OrdenDestino = transfer.AssociateTo.Split(';')[1];
                    string equipoDestino = transfer.AssociateTo.Split(';')[3].ToString();

                    equipoDestino = eBread.Select("", 0, 0, "{Name}='" + equipoDestino + "'").FirstOrDefault().Label;

                    op.EquipoDestino = transfer.AssociateTo.Split(';')[3].ToString() + " - " + equipoDestino;
                    op.IdEquipoDestino = transfer.AssociateTo.Split(';')[3].ToString();

                    op.UoM = transfer.NewUoMID;

                    op.LoteMES = transfer.TargetLotID.Split(new String[1] { "-SL" }, StringSplitOptions.RemoveEmptyEntries)[0];

                    listaTransf.Add(op);
                }
            }

            if (orden.TypeID.Equals("WP") || orden.TypeID.Equals("FE") || orden.TypeID.Equals("TR"))
            {
                //Hay que buscar los movimientos de los subproductos tambien

                string[] listaPosiblesProducciones = System.Configuration.ConfigurationManager.AppSettings[orden.TypeID + "_Producciones"].Split(',');

                foreach (string subprod in listaPosiblesProducciones)
                {

                    Collection<LotOperation> coleccionMovSub = lotoBread.Select("", 0, 0, "{AssociateTo} like '" + idOrden + ";" + subprod + "%' AND {Comments}='Movimiento de Subproducto'");

                    foreach (LotOperation mov in coleccionMovSub)
                    {
                        string[] asso = mov.AssociateTo.Split(';');

                        Transformacion op = new Transformacion();
                        op.Cantidad = float.Parse(asso[4].Replace('.', ',')).ToString();

                        string equipoOrigen = asso[2].ToString();
                        Equipment_BREAD eBread = new Equipment_BREAD();
                        equipoOrigen = eBread.Select("", 0, 0, "{Name}='" + equipoOrigen + "'").FirstOrDefault().Label;

                        string equipoDestino = asso[3].ToString();
                        equipoDestino = eBread.Select("", 0, 0, "{Name}='" + equipoDestino + "'").FirstOrDefault().Label;



                        op.EquipoDestino = asso[3].ToString() + " - " + equipoDestino;
                        op.IdEquipoDestino = asso[3].ToString();
                        op.IdEquipoOrigen = asso[2].ToString();
                        op.EquipoOrigen = asso[2].ToString() + " - " + equipoOrigen; ;
                        op.Fecha = mov.OperationDate.ToLocalTime();
                        op.IdMaterial = asso[1];
                        op.Material = asso[1] + " - " + defBread.Select("", 0, 0, "{ID}='" + op.IdMaterial + "'").FirstOrDefault().Description;
                        op.IdMaterial = mov.NewName;
                        op.OrdenDestino = asso[0];
                        op.OrdenOrigen = asso[0];
                        op.UoM = mov.NewUoMID;
                        op.LoteMES = mov.LotID;

                        listaTransf.Add(op);
                    }

                }
            }


            if (orden.TypeID.Equals("FE"))
            {
                //Hay que buscar los movimientos de los subproductos realizados desde los trasiegos

                string[] listaPosiblesProducciones = System.Configuration.ConfigurationManager.AppSettings[orden.TypeID + "_Producciones"].Split(',');

                foreach (string subprod in listaPosiblesProducciones)
                {
                    LotOperation ferOrder = lotoBread.Select("", 0, 0, "{AssociateTo} like '%" + idOrden + "%' AND {ID}='Transform' AND {SourceLotID} IS NOT NULL").FirstOrDefault();

                    LotOperation TrOrder = lotoBread.Select("", 0, 0, "{LotID} ='" + ferOrder.LotID + "' AND {ID}='Move' AND {TargetLotID} IS NOT NULL AND {AssociateTo} like '%-TR%'").FirstOrDefault();

                    if (TrOrder != null)
                    {
                        Collection<LotOperation> coleccionMovSub = lotoBread.Select("", 0, 0, "{AssociateTo} like '" + TrOrder.AssociateTo.Split(';')[0] + ";" + subprod + "%' AND {Comments}='Movimiento de Subproducto'");
                        foreach (LotOperation mov in coleccionMovSub)
                        {
                            string[] asso = mov.AssociateTo.Split(';');

                            Transformacion op = new Transformacion();
                            op.Cantidad = float.Parse(asso[4].Replace('.', ',')).ToString();

                            string equipoOrigen = asso[2].ToString();
                            Equipment_BREAD eBread = new Equipment_BREAD();
                            equipoOrigen = eBread.Select("", 0, 0, "{Name}='" + equipoOrigen + "'").FirstOrDefault().Label;

                            string equipoDestino = asso[3].ToString();
                            equipoDestino = eBread.Select("", 0, 0, "{Name}='" + equipoDestino + "'").FirstOrDefault().Label;



                            op.EquipoDestino = asso[3].ToString() + " - " + equipoDestino;
                            op.IdEquipoDestino = asso[3].ToString();
                            op.IdEquipoOrigen = asso[2].ToString();
                            op.EquipoOrigen = asso[2].ToString() + " - " + equipoOrigen; ;
                            op.Fecha = mov.OperationDate.ToLocalTime();
                            op.IdMaterial = asso[1];
                            op.Material = asso[1] + " - " + defBread.Select("", 0, 0, "{ID}='" + op.IdMaterial + "'").FirstOrDefault().Description;
                            op.IdMaterial = mov.NewName;
                            op.OrdenDestino = asso[0];
                            op.OrdenOrigen = asso[0];
                            op.UoM = mov.NewUoMID;
                            op.LoteMES = mov.LotID;

                            listaTransf.Add(op);
                        }
                    }
                }
            }

            return listaTransf;
        }

        public async Task<ReturnValue> CrearTransferencia(dynamic datos)
        {
            string orderPK = datos.orden.ToString();
            string tanque = datos.destino.ToString();
            string cantidad = datos.cantidad.ToString();
            string material = datos.material.ToString();
            string opcion = datos.opcion.ToString();
            DateTime? fechaInicio = datos.fechaInicio != null ? DateTime.Parse(datos.fechaInicio.ToString()) : null;
            DateTime? fechaFin = datos.fechaFin != null ? DateTime.Parse(datos.fechaFin.ToString()) : null;

            DTO_MakeTransfer _makeTransferDTO = new DTO_MakeTransfer()
            {
                Order = orderPK,
                Quantity = cantidad,
                Destination = tanque,
                Article = material,
                Option = opcion,
                StartDate = fechaInicio,
                EndDate = fechaFin
            };

            string _urlMakeTransfer = string.Concat(_urlLot, "MakeTransfer");
            var _result = await ApiClient.PostAsJsonAsync(_urlMakeTransfer, _makeTransferDTO);
            return await _result.Content.ReadAsAsync<ReturnValue>();
        }

        internal async Task<string> obtenerMaximoLoteOrden(int idOrden)
        {
            Lot_BREAD lotBread = new Lot_BREAD();
            Order_BREAD oBread = new Order_BREAD();
            Order ordenSIT = oBread.SelectByPK(idOrden).FirstOrDefault();

            if (ordenSIT.TypeID.Equals("WP"))
            {
                SitOrder orden = await _iOrden.SelectOrderById(ordenSIT.ID);

                string nombreMosto = await _iOrden.LotNameByOrder(orden);

                Lot loteMosto = lotBread.Select("", 0, 0, "{ID} LIKE '%" + nombreMosto + "'").FirstOrDefault();

                return double.Parse(loteMosto.Quantity.ToString()) + " " + loteMosto.UoMID;

            }
            else
                if (ordenSIT.TypeID.Equals("FE") || ordenSIT.TypeID.Equals("GU"))
            {
                Entry_BREAD eBread = new Entry_BREAD();
                Entry entryFer = eBread.SelectByOrderPk(idOrden, "", 0, 0, "{Label} NOT LIKE 'D_%' AND {Label} NOT LIKE 'AuxEntry'").FirstOrDefault();

                Location_BREAD locBread = new Location_BREAD();
                Location equipoOrden = locBread.Select("", 0, 0, "{Path}='" + entryFer.ExecutionEquipmentID + "'").FirstOrDefault();

                Lot loteMosto = lotBread.SelectByLocationPK(equipoOrden.PK, "", 0, 0, "{DefinitionID}='" + ordenSIT.FinalMaterialID + "'").FirstOrDefault();

                return double.Parse(loteMosto.Quantity.ToString()) + " " + loteMosto.UoMID;
            }
            else
                return "";
        }

        internal async Task<string> obtenerMaximoLoteOrden(int idOrden, string idMaterial)
        {
            Lot_BREAD lotBread = new Lot_BREAD();
            Entry_BREAD eBread = new Entry_BREAD();
            Order_BREAD oBread = new Order_BREAD();
            Lot loteMosto = new Lot();

            Order ordenSIT = oBread.SelectByPK(idOrden).FirstOrDefault();

            if (ordenSIT.TypeID.Equals("WP"))
            {
                SitOrder orden = await _iOrden.SelectOrderById(ordenSIT.ID);

                string nombreMosto = await _iOrden.LotNameByOrder(orden);

                loteMosto = lotBread.Select("", 0, 0, "{ID} LIKE '%" + nombreMosto + "'").FirstOrDefault();
            }
            else
                if (ordenSIT.TypeID.Equals("FE") || ordenSIT.TypeID.Equals("PR") || ordenSIT.TypeID.Equals("GU") || ordenSIT.TypeID.Equals("TR"))
            {
                Entry entryFer = eBread.SelectByOrderPk(idOrden, "", 0, 0, "{Label} NOT LIKE 'D_%' AND {Label} NOT LIKE 'AuxEntry'").FirstOrDefault();

                Location_BREAD locBread = new Location_BREAD();
                Location equipoOrden = locBread.Select("", 0, 0, "{Path}='" + entryFer.ExecutionEquipmentID + "'").FirstOrDefault();

                var condition = "";
                if (ordenSIT.TypeID.Equals("GU"))
                    condition = "{DefinitionID}='" + ordenSIT.FinalMaterialID + "'";
                else
                    condition = "{DefinitionID}='" + idMaterial + "'";

                loteMosto = lotBread.SelectByLocationPK(equipoOrden.PK, "", 0, 0, condition).FirstOrDefault();
            }
            else
                    if (ordenSIT.TypeID.Equals("FL"))
            {
                Entry entryFil = eBread.SelectByOrderPk(idOrden, "", 0, 0, "{Label} LIKE 'D_%' AND {Label} NOT LIKE 'AuxEntry'").FirstOrDefault();

                loteMosto = lotBread.Select("PK DESC", 0, 1, "{ID} like '%" + ordenSIT.ID.Substring(ordenSIT.ID.Length - 4, 4) + "' AND {LocationPath} like '%" + entryFil.ExecutionEquipmentID + "%'").FirstOrDefault();
            }

            if (loteMosto != null)
                return double.Parse(loteMosto.Quantity.ToString()) + " " + loteMosto.UoMID;
            else
                return "";
        }

        internal static List<Definition> obtenerClasesMaterialConsumos(string claseMaterial)
        {
            try
            {
                Definition_BREAD defBread = new Definition_BREAD();
                List<Definition> tipos = new List<Definition>();
                DefinitionVersionPropertyValue_BREAD propBread = new DefinitionVersionPropertyValue_BREAD();

                if (claseMaterial.Equals("CZA"))
                {
                    //CZA Recuperada
                    propBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND {Value} = 'CRC'").ToList().ForEach(x =>
                    {
                        tipos.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                    });
                }
                else
                    if (claseMaterial.Equals("SUB"))
                {
                    //Levadura Colección
                    propBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND {Value} = 'LVC'").ToList().ForEach(x =>
                    {
                        tipos.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                    });
                }
                else
                    tipos = defBread.Select("", 0, 0, "{MaterialClassID}='" + claseMaterial + "'").ToList();

                return tipos.OrderBy(item => item.Description).ToList();


            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Material.obtenerClasesMaterialConsumos", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Material.obtenerClasesMaterialConsumos", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal static List<MaterialClass> obtenerTipoMaterial(int idOrden)
        {
            try
            {
                Definition_BREAD defBread = new Definition_BREAD();
                Order_BREAD oBread = new Order_BREAD();
                Order orden = oBread.SelectByPK(idOrden).FirstOrDefault();
                List<Definition> listaMateriales = new List<Definition>();
                string nombrePlanta = System.Configuration.ConfigurationManager.AppSettings[orden.TypeID + "_Consumos"];
                string[] valoresArray;
                if (string.IsNullOrEmpty(nombrePlanta))
                    valoresArray = new string[0];
                else
                    valoresArray = nombrePlanta.Replace("'", "").Split(',');

                List<MaterialClass> clases = new List<MaterialClass>();

                if (valoresArray.Length > 0)
                {
                    int outInt = 0;
                    if (int.TryParse(valoresArray[0], out outInt))
                    {
                        //Es entero por lo que son los Tipos de los materiales
                        foreach (var tipo in valoresArray)
                        {
                            MaterialClass_BREAD mClassBread = new MaterialClass_BREAD();
                            List<MaterialClass> mClass = mClassBread.Select("", 0, 0, "{MaterialTypeID}='" + tipo + "'").ToList();

                            foreach (var matClass in mClass)
                            {
                                List<Definition> tipos = defBread.Select("", 0, 0, "{MaterialClassID}='" + matClass.ID + "'").ToList();
                                if (tipos.Count > 0)
                                {
                                    clases.Add(matClass);
                                }

                            }
                        }

                    }
                    else
                    {
                        //Es string por lo que son las clases de los materiales
                        foreach (var tipo in valoresArray)
                        {
                            MaterialClass_BREAD mClassBread = new MaterialClass_BREAD();
                            List<MaterialClass> mClass = mClassBread.Select("", 0, 0, "{ID}='" + tipo + "'").ToList();

                            foreach (var matClass in mClass)
                            {
                                List<Definition> tipos = defBread.Select("", 0, 0, "{MaterialClassID}='" + matClass.ID + "'").ToList();
                                if (tipos.Count > 0)
                                {
                                    clases.Add(matClass);
                                }

                            }
                        }
                    }

                }
                return clases;


            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Material.obtenerTipoMaterial", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Material.obtenerTipoMaterial", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal static List<Definition> obtenerProducciones(int idOrden)
        {
            try
            {
                Definition_BREAD defBread = new Definition_BREAD();
                Order_BREAD oBread = new Order_BREAD();
                Order orden = oBread.SelectByPK(idOrden).FirstOrDefault();
                List<Definition> listaMateriales = new List<Definition>();

                listaMateriales = defBread.Select("", 0, 0, "{ID}='" + orden.FinalMaterialID + "'").ToList();

                //string nombreProd = System.Configuration.ConfigurationManager.AppSettings[orden.TypeID + "_Producciones"];

                //if (!string.IsNullOrEmpty(nombreProd))
                //{

                //    string[] valoresArray = nombreProd.Split(',');
                //    List<MaterialClass> clases = new List<MaterialClass>();

                //    if (valoresArray.Length > 0)
                //    {
                //        foreach (var mat in valoresArray)
                //        {
                //            Definition otrasProd = defBread.Select("", 0, 0, "{ID}='" + mat + "'").FirstOrDefault();

                //            listaMateriales.Add(otrasProd);
                //        }


                //    }
                //}
                return listaMateriales;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Material.obtenerProducciones", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Material.obtenerProducciones", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal static List<Definition> obtenerMaterialesATransferir(int idOrden)
        {
            Order_BREAD oBread = new Order_BREAD();
            Definition_BREAD defBread = new Definition_BREAD();
            Order orden = oBread.SelectByPK(idOrden).FirstOrDefault();
            List<Definition> listaMateriales = new List<Definition>();
            DefinitionVersionPropertyValue_BREAD propBread = new DefinitionVersionPropertyValue_BREAD();
            ProductProductionRule_BREAD pprBread = new ProductProductionRule_BREAD();
            ProductProductionRule pprObject = new ProductProductionRule();

            if (orden.TypeID.Equals("GU") || orden.TypeID.Equals("FL"))
            {
                propBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND {Value} = 'CZA'").ToList().ForEach(x =>
                {
                    if (orden.TypeID.Equals("FL"))
                    {
                        pprObject = pprBread.Select("", 0, 0, "{PPRLabel} like '" + x.DefinitionID + "_" + orden.TypeID + "[1-9]%'").FirstOrDefault();
                        if (pprObject != null && pprObject.Valid)
                            listaMateriales.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                    }
                    else
                        listaMateriales.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                });
            }
            else
                if (orden.TypeID.Equals("PR"))
            {
                Definition material = defBread.Select("", 0, 0, "{ID}='" + orden.FinalMaterialID + "'").FirstOrDefault();
                listaMateriales.Add(material);
            }
            else
            {
                Definition material = defBread.Select("", 0, 0, "{ID}='" + orden.FinalMaterialID + "'").FirstOrDefault();
                listaMateriales.Add(material);

                string nombreProd = System.Configuration.ConfigurationManager.AppSettings[orden.TypeID + "_Producciones"];

                if (!string.IsNullOrEmpty(nombreProd))
                {

                    string[] valoresArray = nombreProd.Split(',');
                    List<MaterialClass> clases = new List<MaterialClass>();

                    if (valoresArray.Length > 0)
                    {
                        foreach (var mat in valoresArray)
                        {
                            Definition otrasProd = defBread.Select("", 0, 0, "{ID}='" + mat + "'").FirstOrDefault();

                            listaMateriales.Add(otrasProd);
                        }
                    }
                }

            }
            return listaMateriales;
        }

        internal static List<Definition> obtenerMaterialCambio(int idOrden)
        {
            //Si es FE -> MOS menos MPA
            //Si es GUA -> FE
            //Si es FIL o PRL -> CZA menos MPA y menos recup

            Order_BREAD oBread = new Order_BREAD();
            Definition_BREAD defBread = new Definition_BREAD();
            Order orden = oBread.SelectByPK(idOrden).FirstOrDefault();
            DefinitionVersionPropertyValue_BREAD propBread = new DefinitionVersionPropertyValue_BREAD();
            List<Definition> listaDefinition = new List<Definition>();

            switch (orden.TypeID)
            {
                case "FE":
                    propBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND ({Value} = 'MOP' OR {Value} = 'MIX' OR {Value} = 'MDH')").ToList().ForEach(x =>
                    {
                        listaDefinition.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                    });

                    break;
                case "GU":
                    propBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND {Value} = 'CZH'").ToList().ForEach(x =>
                    {
                        listaDefinition.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                    });

                    break;
                case "FL":
                case "PR":
                    propBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND {Value} = 'CZA'").ToList().ForEach(x =>
                    {
                        listaDefinition.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                    });
                    break;
            }


            //string listaMateriales = System.Configuration.ConfigurationManager.AppSettings[orden.TypeID + "_Reclasifica"];
            //string[] arrayMat = listaMateriales.Split(',');

            //foreach (string mat in arrayMat)
            //{
            //    Definition def = defBread.Select("", 0, 0, "{ID}='"+ mat +"'").FirstOrDefault();
            //    listaDefinition.Add(def);
            //}

            return listaDefinition.Where(c => !c.Name.Contains("Default")).OrderBy(c => c.Name).ToList();

        }

        internal static string obtenerUOM(string idMaterial)
        {
            DefinitionVersion_BREAD defBread = new DefinitionVersion_BREAD();
            DefinitionVersion material = defBread.Select("", 0, 0, "{ID}='" + idMaterial + "'").FirstOrDefault();

            return material.UoMID;
        }

        internal static List<Definition> obtenerMaterialCambio(string tipo)
        {
            //Si es FE -> MOS menos MPA
            //Si es GUA -> FE
            //Si es FIL o PRL -> CZA menos MPA y menos recup

            Definition_BREAD defBread = new Definition_BREAD();
            List<Definition> listaDefinition = new List<Definition>();
            DefinitionVersionPropertyValue_BREAD propBread = new DefinitionVersionPropertyValue_BREAD();

            switch (tipo)
            {
                case "FE":
                    propBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND ({Value} = 'MOP' OR {Value} = 'MIX' OR {Value} = 'MDH')").ToList().ForEach(x =>
                    {
                        listaDefinition.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                    });

                    break;
                case "GU":
                    propBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND {Value} = 'CZH'").ToList().ForEach(x =>
                    {
                        listaDefinition.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                    });

                    break;
                case "FL":
                case "PR":
                    propBread.Select("", 0, 0, "{MaterialPropertyID} = 'Subclase_codigo' AND {Value} = 'CZA'").ToList().ForEach(x =>
                    {
                        listaDefinition.Add(defBread.Select("", 0, 0, "{ID}='" + x.DefinitionID + "'").FirstOrDefault());
                    });
                    break;
            }

            return listaDefinition.OrderBy(c => c.Name).ToList();
        }

        internal static List<DTO_DetallesProduccionesOrden> getDetalleProduccionOrden(string idMaterial, string idOrden)
        {
            List<DTO_DetallesProduccionesOrden> listaOperations = new List<DTO_DetallesProduccionesOrden>();

            LotOperation_BREAD lotopBread = new LotOperation_BREAD();

            List<LotOperation> listaOpTransform = lotopBread.Select("", 0, 0, "{SourceLotID}<>'' AND {Description}='Lot Transformed' AND {AssociateTo} like '%" + idOrden + "%' AND {OldName} like '%" + idMaterial + "%'").ToList();

            foreach (LotOperation opLote in listaOpTransform)
            {
                if ((opLote.AssociateTo.Split(';')[1].ToString().Equals(idOrden) && !idOrden.Contains("FL")) ||
                   (idOrden.Contains("FL") && opLote.AssociateTo.Split(';')[0].ToString().Equals(idOrden)))
                {
                    DTO_DetallesProduccionesOrden dto = new DTO_DetallesProduccionesOrden();

                    dto.loteGuarda = opLote.SourceLotID;
                    dto.loteFiltracion = opLote.OldName;
                    dto.fecha = opLote.OperationDate.ToString();
                    dto.cantidad = opLote.Comments.Split(';')[1].ToString();
                    dto.ordenOrigen = opLote.AssociateTo.Split(';')[0].ToString();

                    LotOperation supply = lotopBread.Select("OperationDate DESC", 0, 1, "{LotID}='" + dto.loteFiltracion + "' AND {Comments}='PROD-FIL'").FirstOrDefault();

                    if (supply != null)
                    {
                        dto.fecha = supply.OperationDate.ToString();
                        dto.cantidad = Double.Parse(supply.NewQuantity.ToString()).ToString();
                    }

                    Lot_BREAD lotBread = new Lot_BREAD();
                    Lot loteFinal = lotBread.Select("", 0, 0, "{ID}='" + dto.loteFiltracion + "'").FirstOrDefault();

                    dto.cantidad += " " + loteFinal.UoMID.ToUpper();

                    listaOperations.Add(dto);
                }
            }
            return listaOperations.OrderByDescending(c => c.cantidad).ToList();
        }

        internal static string obtenerUOMconPKMaterial(int idMaterial)
        {
            DefinitionVersion_BREAD defBread = new DefinitionVersion_BREAD();
            DefinitionVersion material = defBread.SelectByDefinitionPK(idMaterial, "", 0, 0, "").FirstOrDefault();

            return material.UoMID;
        }

        internal static List<Materiales_FAB> ObtenerMostosSinDummy(string area)
        {
            List<Materiales_FAB> lstMostos = new List<Materiales_FAB>();
            using (MESEntities context = new MESEntities())
            {
                String Dummy = String.Empty;
                DefinitionVersionPropertyValue_BREAD definitionBread = new DefinitionVersionPropertyValue_BREAD();
                ProductProductionRule_BREAD pprBread = new ProductProductionRule_BREAD();
                ProductProductionRule pprObject = new ProductProductionRule();

                switch (area)
                {
                    case "COC":
                        context.Materiales_FAB.AsNoTracking().Where(m => m.IdClase.Equals("MOS") && !m.IdMaterial.Contains("DummyMaterial_WP")).ToList().ForEach(x =>
                        {
                            DefinitionVersionPropertyValue cod = definitionBread.Select("", 0, 0, "{DefinitionID} = '" + x.IdMaterial + "' AND {MaterialPropertyID} = 'Subclase_codigo'").FirstOrDefault();
                            if (cod != null && cod.Value != null)
                                if (cod.Value.ToString().Equals("MOP") || cod.Value.ToString().Equals("MDH"))
                                {
                                    pprObject = pprBread.Select("", 0, 0, "{PPRLabel} like '" + x.IdMaterial + "_SC[1-9]%'").FirstOrDefault();
                                    if (pprObject != null && pprObject.Valid)
                                        lstMostos.Add(x);
                                }
                        });
                        break;
                    case "TR":
                    case "FER":
                        String auxType = area.Equals("TR") ? "TR" : "FE";
                        context.Materiales_FAB.AsNoTracking().Where(m => m.IdClase.Equals("MOS") && (!m.IdMaterial.Contains("DummyMaterial_FE") && !m.IdMaterial.Contains("DummyMaterial_TR")) && (!m.Nombre.Contains("Default"))).ToList().ForEach(x =>
                        {
                            DefinitionVersionPropertyValue cod = definitionBread.Select("", 0, 0, "{DefinitionID} = '" + x.IdMaterial + "' AND {MaterialPropertyID} = 'Subclase_codigo'").FirstOrDefault();
                            if (cod != null && cod.Value != null)
                                if (cod.Value.ToString().Equals("MOP") || cod.Value.ToString().Equals("MDH"))
                                {
                                    pprObject = pprBread.Select("", 0, 0, "{PPRLabel} like '" + x.IdMaterial + "_" + auxType + "[1-9]%'").FirstOrDefault();
                                    if (pprObject != null && pprObject.Valid)
                                        lstMostos.Add(x);
                                }
                        });
                        break;
                    case "GU":
                        context.Materiales_FAB.AsNoTracking().Where(m => (m.IdClase.Equals("CZH") && !m.IdMaterial.Contains("DummyMaterial_GU"))).ToList().ForEach(x =>
                        {
                            DefinitionVersionPropertyValue cod = definitionBread.Select("", 0, 0, "{DefinitionID} = '" + x.IdMaterial + "' AND {MaterialPropertyID} = 'Subclase_codigo'").FirstOrDefault();
                            if (cod != null && cod.Value != null)
                                if (cod.Value.ToString().Equals("CZH"))
                                {
                                    pprObject = pprBread.Select("", 0, 0, "{PPRLabel} like '" + x.IdMaterial + "_GU[1-9]%'").FirstOrDefault();
                                    if (pprObject != null && pprObject.Valid)
                                        lstMostos.Add(x);
                                }
                        });
                        break;
                    case "FIL":
                    case "PRE":
                        String auxType2 = area.Equals("FIL") ? "FL[1-9]" : "PR";
                        Dummy = area.Equals("FIL") ? "DummyMaterial_FL" : "DummyMaterial_PR";
                        context.Materiales_FAB.AsNoTracking().Where(m => m.IdClase.Equals("CZA") && !m.IdMaterial.Contains(Dummy)).ToList().ForEach(x =>
                        {
                            DefinitionVersionPropertyValue cod = definitionBread.Select("", 0, 0, "{DefinitionID} = '" + x.IdMaterial + "' AND {MaterialPropertyID} = 'Subclase_codigo'").FirstOrDefault();
                            if (cod != null && cod.Value != null)
                                if (cod.Value.ToString().Equals("CZA"))
                                {
                                    pprObject = pprBread.Select("", 0, 0, "{PPRLabel} like '" + x.IdMaterial + "_" + auxType2 + "%'").FirstOrDefault();
                                    if (pprObject != null && pprObject.Valid)
                                        lstMostos.Add(x);
                                }
                        });
                        break;
                }
            }

            return lstMostos;
        }

        internal static decimal obtenerCantidadLote(int pkOrden)
        {
            Order_BREAD oBread = new Order_BREAD();
            Order orden = oBread.SelectByPK(pkOrden).FirstOrDefault();

            Lot_BREAD lotBread = new Lot_BREAD();
            Lot loteOrden = lotBread.SelectByPK(orden.SourceID).FirstOrDefault();

            return loteOrden.Quantity;
        }

        internal static string obtenerNombreLote(int pkOrden)
        {
            Order_BREAD oBread = new Order_BREAD();
            Order orden = oBread.SelectByPK(pkOrden).FirstOrDefault();

            Lot_BREAD lotBread = new Lot_BREAD();
            Lot loteOrden = lotBread.SelectByPK(orden.SourceID).FirstOrDefault();

            return loteOrden.ID;
        }

        public static List<Materiales_FAB> GetMaterialesOrdenesPrep()
        {
            List<Materiales_FAB> lstMateriales = new List<Materiales_FAB>();

            List<string> lstTipoMateriasPrimas = new List<string>();
            lstTipoMateriasPrimas.Add(TipoMaterial.MateriasPrimas.GetStringValue());
            lstTipoMateriasPrimas.Add(TipoMaterial.Subproductos.GetStringValue());
            lstTipoMateriasPrimas.Add(TipoMaterial.Semielaborados.GetStringValue());

            using (MESEntities context = new MESEntities())
            {
                lstMateriales = context.Materiales_FAB.AsNoTracking().Where(m => lstTipoMateriasPrimas.Contains(m.Tipo)).ToList();
            }

            return lstMateriales;
        }

        internal static IEnumerable GetMaterialesOrdenesPrepPorPlantilla(long idPlantilla)
        {
            List<dynamic> lstDetalle = PlantillaPreparacionBread.ObtenerDetallePlantillaPorIdPlantilla(idPlantilla);
            List<DTO_MaterialOrdenPreparacion> lstDetalleDTO = new List<DTO_MaterialOrdenPreparacion>();
            foreach (dynamic item in lstDetalle)
            {
                DTO_MaterialOrdenPreparacion dto = new DTO_MaterialOrdenPreparacion()
                {
                    Id = item.Id,
                    IdMaterial = item.IdMaterial,
                    Cantidad = item.Cantidad
                };
                lstDetalleDTO.Add(dto);
            }
            List<Materiales_FAB> lstMaterialesOrdPrep = GetMaterialesOrdenesPrep();
            IEnumerable lstMatOrdenPrep;

            lstMatOrdenPrep = lstMaterialesOrdPrep.Join(lstDetalleDTO, matFab => matFab.IdMaterial, matDetalle => matDetalle.IdMaterial, (c, d) => new
            {
                Id = d.Id,
                IdMaterial = c.IdMaterial,
                Clase = c.Clase,
                Descripcion = c.Descripcion,
                Cantidad = d.Cantidad
            });

            return lstMatOrdenPrep;
        }

        internal static IEnumerable GetMaterialesOrdenesPrepPorIdOrden(string idOrden)
        {
            List<dynamic> lstDetalle = PlantillaPreparacionBread.ObtenerMaterialesPorIdOrden(idOrden);
            List<Materiales_FAB> lstMaterialesOrdPrep = GetMaterialesOrdenesPrep();
            List<DTO_MaterialOrdenPreparacion> lstDetalleDTO = new List<DTO_MaterialOrdenPreparacion>();
            foreach (dynamic item in lstDetalle)
            {
                DTO_MaterialOrdenPreparacion dto = new DTO_MaterialOrdenPreparacion()
                {
                    Id = item.Id,
                    IdMaterial = item.IdMaterial,
                    Cantidad = item.Cantidad,
                    IdLote = item.IdLote
                };
                lstDetalleDTO.Add(dto);
            }

            IEnumerable lstMatOrdenPrep;
            lstMatOrdenPrep = lstMaterialesOrdPrep.Join(lstDetalleDTO, matFab => matFab.IdMaterial, matDetalle => matDetalle.IdMaterial, (c, d) => new
            {
                Id = d.Id,
                IdMaterial = c.IdMaterial,
                Clase = c.Clase,
                Descripcion = c.Descripcion,
                IdLote = d.IdLote,
                Cantidad = d.Cantidad
            }).ToList();
            return lstMatOrdenPrep;
        }

        public static String GetMasterMaterial(String slave, String masterSubclass)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMESsa"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("GetFatherFromChild", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@childID", slave);
                    command.Parameters.AddWithValue("@condition", masterSubclass);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.VarChar);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        throw new Exception(ex.Message);
                    }

                    if (returnParam.Value == DBNull.Value)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "El material " + slave + " no pertenece a ninguna BOM con tipo material " + masterSubclass, "MSM.BBDD.Fabricacion.DAO_Material", "GetMasterMaterial", "");
                        return String.Empty;
                    }

                    return returnParam.Value.ToString();
                }
            }
        }

        public async Task<List<DTO_Materiales>> ObtenerCervezasTipoSemielaborado()
        {
            var result = await _api.GetPostsAsync<List<DTO_Materiales>>(string.Concat(_urlMateriales, "CervezasTipoSemielaborado"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarMaterialWOPrellenado(dynamic datos)
        {
            DTO_RespuestaAPI<bool> result = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(_urlMateriales + "WOPrellenado/Material", datos);

            return result;
        }

        public async Task<List<DTO_Materiales>> ObtenerMostosCoccionTipoSemielaborado()
        {
            var result = await _api.GetPostsAsync<List<DTO_Materiales>>(string.Concat(_urlMateriales, "MostosCoccionTipoSemielaborado"));

            return result;
        }

        public async Task<List<DTO_Materiales>> ObtenerMostosTipoSemielaborado()
        {
            var result = await _api.GetPostsAsync<List<DTO_Materiales>>(string.Concat(_urlMateriales, "MostosTipoSemielaborado"));

            return result;
        }

        public async Task<bool> ActualizarMaterialTipoMosto(dynamic datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(_urlMateriales + "TipoMosto", datos);
            return ret;
        }

        public async Task<List<DTO_Materiales>> ObtenerMaterialesMMPPSemielaborados()
        {
            var result = await _api.GetPostsAsync<List<DTO_Materiales>>(string.Concat(_urlMateriales, "MaterialesMMPPSemielaborados"));

            return result;
        }

        public async Task<List<DTO_RelacionMostosCervezas>> ObtenerRelacionMostosCervezas()
        {
            var result = await _api.GetPostsAsync<List<DTO_RelacionMostosCervezas>>(string.Concat(_urlMateriales, "ObtenerRelacionMostosCervezas"));

            return result;
        }

        public async Task<bool> ActualizarRelacionMostosCervezas(dynamic datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(_urlMateriales + "ActualizarRelacionMostosCervezas", datos);
            return ret;
        }

        public async Task<List<DTO_Materiales>> ObtenerCervezasAEnvasar()
        {
            var result = await _api.GetPostsAsync<List<DTO_Materiales>>(string.Concat(_urlMateriales, "CervezasAEnvasar"));

            return result;
        }
    }
}