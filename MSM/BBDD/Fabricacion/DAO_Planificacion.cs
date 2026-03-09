using Clients.ApiClient.Contracts;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Models.Envasado;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.RealTime;
using MSM.Utilidades;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using Siemens.SimaticIT.MM.Breads;
using Siemens.SimaticIT.MM.Breads.Types;
using Siemens.SimaticIT.PDefM.Breads;
using Siemens.SimaticIT.POM.Breads;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;


namespace MSM.BBDD.Fabricacion
{
    public class DAO_Planificacion : IDAO_Planificacion
    {
        private readonly IDAO_Orden _iOrden;
        private IApiClient _api;
        private string _urlAyudaPlanificacionFiltracion;
        private string _urlAyudaPlanificacionCoccion;
        private string uriFabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();

        public DAO_Planificacion()
        {

        }

        public DAO_Planificacion(IApiClient api)
        {
            _api = api;
            _urlAyudaPlanificacionFiltracion = string.Concat(uriFabricacion, "api/ayudaPlanificacion/filtracion/");
            _urlAyudaPlanificacionCoccion = string.Concat(uriFabricacion, "api/ayudaPlanificacion/coccion/");
        }

        public static DataTable ToDataTable<TSource>(IList<TSource> data)
        {
            DataTable dataTable = new DataTable(typeof(TSource).Name);
            PropertyInfo[] props = typeof(TSource).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in props)
            {
                dataTable.Columns.Add(prop.Name, Nullable.GetUnderlyingType(prop.PropertyType) ??
                    prop.PropertyType);
            }

            foreach (TSource item in data)
            {
                var values = new object[props.Length];
                for (int i = 0; i < props.Length; i++)
                {
                    values[i] = props[i].GetValue(item, null);
                }
                dataTable.Rows.Add(values);
            }
            return dataTable;
        }

        public static async Task<List<PlanificacionCoccionStr>> SetCompletePlanning(string currentWeek, string startWeek, string endWeek)
        {
            var tasks = new List<Task<DataTable>> {
                                                        Task.Run(() => GetPackingArticleTotalQuantityFromCurrentWeek(currentWeek, startWeek)),
                                                        Task.Run(() => GetPackingWO(startWeek, endWeek))
                                                    };

            using (var context = new MESEntities())
            {
                try
                {
                    // Esperar a que terminen las tareas de obtención de datos sin bloquear el hilo
                    var results = await Task.WhenAll(tasks);
                    var wo = results[0];
                    var pwo = results[1];

                    // Validar antes de truncar datos
                    if (wo.Rows.Count == 0 || pwo.Rows.Count == 0)
                    {
                        throw new Exception("No hay datos para procesar.");
                    }

                    await context.Database.ExecuteSqlCommandAsync(@" DELETE FROM [PackingPO];
                                                                     DELETE FROM [PackingArticleFromJDE];
                                                                     DELETE FROM [CocPlanning];");

                    var planning = new List<PlanificacionCoccion>();
                    GetPlanningDatas(wo, planning, currentWeek, startWeek, pwo);

                    var auxPlanning = planning.Select(item => new PlanificacionCoccionStr
                    {
                        CodArticle = $"{item.CodArticle} ",
                        Article = $"{item.Article} ",
                        ExistenciasTCP = $"{item.ExistenciasTCP:0.##} ",
                        Necesidad = $"{item.Necesidad:0.##} ",
                        Cocciones = $"{item.Cocciones:0.##} "
                    }).ToList();

                    var brewingList = auxPlanning.Select(item => new CocPlanning
                    {
                        CodArticle = item.CodArticle,
                        Article = item.Article,
                        ExistenciasTCP = item.ExistenciasTCP,
                        Necesidad = item.Necesidad,
                        Cocciones = item.Cocciones
                    }).ToList();

                    context.CocPlanning.AddRange(brewingList);
                    await context.SaveChangesAsync();

                    return auxPlanning;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace,
                        "DAO_Planificacion.SetCompletePlanning", "WEB-FABRICACION", "Sistema");
                    throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER"));
                }
            }
        }



        public static List<PlanificacionCoccionStr> SetPlanning(String currentWeek, String startWeek, String endWeek)
        {
            DataTable wo = new DataTable();
            DataTable pwo = new DataTable();

            List<PlanificacionCoccion> planning = new List<PlanificacionCoccion>();
            List<PlanificacionCoccionStr> auxPlanning = new List<PlanificacionCoccionStr>();
            List<CocPlanning> oldPlanning = new List<CocPlanning>();

            using (MESEntities context = new MESEntities())
            {
                wo = ToDataTable(context.PackingPO.ToList());
                pwo = ToDataTable(context.PackingArticleFromJDE.ToList());

                oldPlanning = context.CocPlanning.ToList();

                if (oldPlanning.Count == 0)
                {
                    GetPlanningDatas(wo, planning, currentWeek, startWeek, pwo);
                    planning.ForEach(item => { auxPlanning.Add(new PlanificacionCoccionStr { CodArticle = item.CodArticle.ToString() + " ", Article = item.Article.ToString() + " ", ExistenciasTCP = item.ExistenciasTCP.ToString("0.##") + " ", Necesidad = item.Necesidad.ToString("0.##") + " ", Cocciones = item.Cocciones.ToString("0.##") + " " }); });
                    CocPlanning brewing;
                    auxPlanning.ForEach(item =>
                    {
                        brewing = new CocPlanning();
                        brewing.CodArticle = item.CodArticle;
                        brewing.Article = item.Article;
                        brewing.ExistenciasTCP = item.ExistenciasTCP;
                        brewing.Necesidad = item.Necesidad;
                        brewing.Cocciones = item.Cocciones;
                        context.CocPlanning.Add(brewing);
                    });
                    context.SaveChanges();
                }
                else
                    oldPlanning.ForEach(item => { auxPlanning.Add(new PlanificacionCoccionStr { CodArticle = item.CodArticle.ToString() + " ", Article = item.Article.ToString() + " ", ExistenciasTCP = Convert.ToDouble(item.ExistenciasTCP).ToString("0.##") + " ", Necesidad = Convert.ToDouble(item.Necesidad).ToString("0.##") + " ", Cocciones = Convert.ToDouble(item.Cocciones).ToString("0.##") + " " }); });
            }

            return auxPlanning;
        }

        public static void GetPlanningDatas(DataTable wo, List<PlanificacionCoccion> planning, String currentWeek, String startWeek, DataTable pwo)
        {
            String mosto = String.Empty, cza = String.Empty, auxMaterial, auxMosto;
            List<UbicacionLoteByOrden_FAB> lot;
            PlanificacionCoccion aux;
            Double coccion = 0, fermentacion = 0, guarda = 0, filtracionWithoutTransf = 0, filtracionWithTransf = 0, tcpQuantity, totalFiltracion;
            CONVERSIONES_DURACIONES_MOSTO_BREAD datos = new CONVERSIONES_DURACIONES_MOSTO_BREAD();
            CONVERSIONES_DURACIONES_MOSTO datoItem = new CONVERSIONES_DURACIONES_MOSTO();
            Definition_BREAD mm = new Definition_BREAD();
            UbicacionLoteByOrden_FAB tcp;

            using (MESEntities context = new MESEntities())
            {
                foreach (DataRow item in wo.Rows)
                {
                    auxMaterial = item["ENVASADO"].ToString();
                    aux = planning.Where(element => element.CodArticle.Equals(auxMaterial)).FirstOrDefault();
                    datoItem = datos.Select("", 0, 0, "{CodigoArticulo}='" + auxMaterial + "'").FirstOrDefault();

                    if (aux == null)
                    {
                        aux = new PlanificacionCoccion();
                        aux.CodArticle = auxMaterial;
                        aux.Article = mm.Select("", 0, 0, "{ID} = '" + item["ENVASADO"].ToString() + "'").FirstOrDefault<Definition>().Description +
                                      " (Contiene " + item["MOSTO"].ToString().Split('-')[1] + ")";

                        auxMosto = item["MOSTO"].ToString().Split('-')[0];
                        lot = context.UbicacionLoteByOrden_FAB.AsNoTracking().Where(element => element.Cod_Material.Equals(auxMosto)).ToList();

                        if (lot.Count != 0)
                        {
                            //Se obtiene la cantidad actual de la cerveza envasada lista para envasar
                            tcp = context.UbicacionLoteByOrden_FAB.AsNoTracking().Where(element => element.Descripcion.Equals("TANQUE-PRELLENADO") && element.Cod_Material.Equals(aux.CodArticle)).FirstOrDefault();
                            tcpQuantity = tcp != null ? Double.Parse(tcp.Quantity.ToString()) : 0;

                            //Se obtienen las cocciones que están en producción y planificadas
                            coccion = lot.Where(element => element.ID_Orden.Contains("SC") && element.Cod_Material.Equals(auxMosto)).ToList().FindAll(delegate(UbicacionLoteByOrden_FAB element)
                            {
                                DateTime auxTime = element.Tiempo_Inicio_Real.Value.AddHours((datoItem != null ? datoItem.DuracionCoc : 0));
                                auxTime = auxTime.AddHours((datoItem != null ? datoItem.DuracionGua : 0));
                                auxTime = auxTime.AddHours((datoItem != null ? datoItem.DuracionFer : 0));
                                auxTime = auxTime.AddHours(Double.Parse(element.Quantity.Value.ToString()) / (datoItem != null ? datoItem.DuracionFil : 1));

                                int endJulianoDate = (Convert.ToInt32(string.Format("{0:yy}{1:D3}", auxTime, auxTime.DayOfYear)) + 100000);
                                return (endJulianoDate >= int.Parse(currentWeek) && endJulianoDate <= int.Parse(startWeek));

                            }).AsQueryable<UbicacionLoteByOrden_FAB>().Sum(element => element.Quantity).Value;

                            fermentacion = lot.Where(element => (element.ID_Orden.Contains("FE")) && element.Cod_Material.Equals(auxMosto)).ToList().FindAll(delegate(UbicacionLoteByOrden_FAB element)
                            {
                                DateTime auxTime = DateTime.Parse(element.Tiempo_Inicio_Real.ToString()).AddHours((datoItem != null ? datoItem.DuracionFer : 0));
                                auxTime = auxTime.AddHours((datoItem != null ? datoItem.DuracionGua : 0));
                                auxTime = auxTime.AddHours(Double.Parse(element.Quantity.Value.ToString()) / (datoItem != null ? datoItem.DuracionFil : 1));

                                int endJulianoDate = (Convert.ToInt32(string.Format("{0:yy}{1:D3}", auxTime, auxTime.DayOfYear)) + 100000);
                                return (endJulianoDate >= int.Parse(currentWeek) && endJulianoDate <= int.Parse(startWeek));

                            }).AsQueryable<UbicacionLoteByOrden_FAB>().Sum(element => element.Quantity).Value;

                            guarda = lot.Where(element => (element.ID_Orden.Contains("GU")) && element.Cod_Material.Equals(auxMosto)).ToList().FindAll(delegate(UbicacionLoteByOrden_FAB element)
                            {
                                DateTime auxTime = DateTime.Parse(element.Tiempo_Inicio_Real.ToString()).AddHours((datoItem != null ? datoItem.DuracionGua : 0));
                                auxTime = auxTime.AddHours(Double.Parse(element.Quantity.Value.ToString()) / (datoItem != null ? datoItem.DuracionFil : 1));

                                int endJulianoDate = (Convert.ToInt32(string.Format("{0:yy}{1:D3}", auxTime, auxTime.DayOfYear)) + 100000);
                                return (endJulianoDate >= int.Parse(currentWeek) && endJulianoDate <= int.Parse(startWeek));

                            }).AsQueryable<UbicacionLoteByOrden_FAB>().Sum(element => element.Quantity).Value;

                            //Se obtienen las filtraciones que están planificadas y arrancadas sin transferencias
                            filtracionWithoutTransf = lot.Where(element => element.ID_Orden.Contains("FL") && element.Cod_Material.Equals(auxMosto) && (element.LoteMes.Contains("Dummy") || String.IsNullOrEmpty(element.LoteMes))).ToList().FindAll(delegate(UbicacionLoteByOrden_FAB element)
                            {
                                DateTime auxTime = DateTime.Parse(element.Tiempo_Inicio_Real.ToString()).AddHours(Double.Parse(element.Quantity.Value.ToString()) / (datoItem != null ? datoItem.DuracionFil : 1));

                                int endJulianoDate = (Convert.ToInt32(string.Format("{0:yy}{1:D3}", auxTime, auxTime.DayOfYear)) + 100000);
                                return (endJulianoDate >= int.Parse(currentWeek) && endJulianoDate <= int.Parse(startWeek));

                            }).AsQueryable<UbicacionLoteByOrden_FAB>().Sum(element => element.Quantity).Value;

                            filtracionWithTransf = lot.Where(element => element.ID_Orden.Contains("FL") && element.Cod_Material.Equals(auxMosto) && (element.LoteMes.Contains("CZA") && element.LoteMes.Contains("FIL"))).ToList().FindAll(delegate(UbicacionLoteByOrden_FAB element)
                            {
                                DateTime auxTime = DateTime.Parse(element.Tiempo_Inicio_Real.ToString()).AddHours(Double.Parse(element.Quantity.Value.ToString()) / (datoItem != null ? datoItem.DuracionFil : 1));

                                int endJulianoDate = (Convert.ToInt32(string.Format("{0:yy}{1:D3}", auxTime, auxTime.DayOfYear)) + 100000);
                                return (endJulianoDate >= int.Parse(currentWeek) && endJulianoDate <= int.Parse(startWeek));

                            }).AsQueryable<UbicacionLoteByOrden_FAB>().Sum(element => element.Quantity).Value;

                            aux.ExistenciasTCP = (coccion + fermentacion + guarda + (filtracionWithoutTransf - filtracionWithTransf) + tcpQuantity);
                        }
                        else
                            aux.ExistenciasTCP = 0;

                        DataRow[] row = pwo.Select("ENVASADO = '" + item["ENVASADO"].ToString() + "'");
                        aux.ExistenciasTCP -= (row.Length != 0 ? Double.Parse(row[0]["total"].ToString().Substring(0, row[0]["TOTAL"].ToString().Length - 2)) : 0);

                        aux.Necesidad = Double.Parse(item["TOTAL"].ToString().Substring(0, item["TOTAL"].ToString().Length - 2));
                        aux.Cocciones = (aux.Necesidad - aux.ExistenciasTCP) * (datoItem != null ? datoItem.Conversion : 1);
                        planning.Add(aux);
                    }
                    else
                    {
                        aux.Necesidad += Double.Parse(item["TOTAL"].ToString().Substring(0, item["TOTAL"].ToString().Length - 2));
                        aux.Cocciones = (aux.Necesidad - aux.ExistenciasTCP) * (datoItem != null ? datoItem.Conversion : 1);
                    }
                }//fin foreach
            }
        }

        public static double GetHLCoccionByMaterial(String materialID)
        {
            COB_MSM_HDBeerParametersForDecantingWP_BREAD beerBread = new COB_MSM_HDBeerParametersForDecantingWP_BREAD();
            COB_MSM_HDBeerParametersForDecantingWP obj = new COB_MSM_HDBeerParametersForDecantingWP();
            String czhMaterial = DAO_Material.GetMasterMaterial(materialID,"CZH");
            obj = beerBread.Select("", 0, 0, "{DefID} = '" + czhMaterial + "'").FirstOrDefault();
            if (obj != null)
                return obj.HlPorCoccion;
            else
                return 0;
        }

        public static DataTable GetPackingArticleTotalQuantityFromCurrentWeek(String currentWeek, String startWeek)
        {
            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMESsa"].ConnectionString))
            {
                connection.Open();
                using (SqlCommand command = new SqlCommand("[GetPackingArticleTotalQuantityFromCurrentWeek]", connection))
                {
                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            command.CommandType = CommandType.StoredProcedure;
                            command.CommandTimeout = 90;
                            command.Parameters.AddWithValue("@currentWeek", currentWeek);
                            command.Parameters.AddWithValue("@startWeek", startWeek);
                            da.Fill(dt);
                        }
                        catch (Exception ex)
                        {
                            //DAO_Log.registrarLog(DateTime.Now, "DAO_Planificacion.GetPackingArticleTotalQuantityFromCurrentWeek", ex, "BBDD");
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planificacion.GetPackingArticleTotalQuantityFromCurrentWeek", "WEB-FABRICACION", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER"));
                        }
                    }
                }
            }
            return dt;
        }

        public static DataTable GetPackingWO(String startWeek, String endWeek)
        {
            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMESsa"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[GetPackingsPO]", connection))
                {
                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            command.CommandType = CommandType.StoredProcedure;
                            command.CommandTimeout = 90;
                            command.Parameters.AddWithValue("@startWeek", startWeek);
                            command.Parameters.AddWithValue("@endWeek", endWeek);
                            connection.Open();
                            da.Fill(dt);
                        }
                        catch (Exception ex)
                        {
                            //DAO_Log.registrarLog(DateTime.Now, "DAO_Planificacion.GetPackingWO", ex, "BBDD");
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planificacion.GetPackingWO", "WEB-FABRICACION", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER"));
                        }
                    }
                }
            }
            return dt;
        }

        public static List<COB_MSM_ArticlesParametersForDecanting> GetArticlesParametersForDecanting()
        {
            List<COB_MSM_ArticlesParametersForDecanting> items = new List<COB_MSM_ArticlesParametersForDecanting>();
            COB_MSM_ArticlesParametersForDecanting_BREAD adBread = new COB_MSM_ArticlesParametersForDecanting_BREAD();
            COB_MSM_ArticlesParametersForDecanting aux = new COB_MSM_ArticlesParametersForDecanting();
            List<RelPackingWO_COB_ArticlesParameters> MostoTypes = new List<RelPackingWO_COB_ArticlesParameters>();
            using (MESEntities context = new MESEntities())
            {
                MostoTypes = context.RelPackingWO_COB_ArticlesParameters.AsNoTracking().ToList();
            }
            items = adBread.Select("{ID} asc", 0, 0, "").ToList();

            foreach (var element in items)
                adBread.Delete(element);

            foreach (var element in MostoTypes)
            {
                aux = new COB_MSM_ArticlesParametersForDecanting();
                aux.ID = element.ID.Value;

                aux.ID = int.Parse(element.ID.ToString());
                aux.DefID = element.PackingArticleID;
                aux.Beer = element.CZAEnv;//element.Description;
                aux.DecreasePacking = element.DecreasePacking.Value;
                aux.DecreaseFiltration = element.DecreaseFiltration.Value;
                aux.RecoveredBeerInFiltration = element.RecoveredBeerInFiltration.Value;
                aux.Dilution = element.Dilution.Value;
                aux.HDBeerInSelectedPeriod = element.Czh;
                aux.CZAEnv = element.CZAEnv;
                adBread.Create(aux);
            }

            items = adBread.Select("{ID} asc", 0, 0, "").ToList();
            return items;
        }

        public static List<COB_MSM_HDBeerParametersForDecanting> GetHDBeerParametersForDecanting()
        {
            List<COB_MSM_HDBeerParametersForDecanting> items = new List<COB_MSM_HDBeerParametersForDecanting>();
            COB_MSM_HDBeerParametersForDecanting_BREAD hdBread = new COB_MSM_HDBeerParametersForDecanting_BREAD();
            COB_MSM_HDBeerParametersForDecanting aux = new COB_MSM_HDBeerParametersForDecanting();
            List<RelHDBeer_HDBeerParameters_FAB> beerTypes = new List<RelHDBeer_HDBeerParameters_FAB>();
            using (MESEntities context = new MESEntities())
            {
                beerTypes = context.RelHDBeer_HDBeerParameters_FAB.AsNoTracking().ToList();
            }
            //Si no tienen el mismo número de registros se añadirán los registros nuevos
            items = hdBread.Select("{ID} asc", 0, 0, "").ToList();
            foreach (var element in items)
                hdBread.Delete(element);

            foreach (var element in beerTypes)
            {
                aux = new COB_MSM_HDBeerParametersForDecanting();
                aux.ID = element.ID;
                aux.DefID = element.DefID;
                aux.BeerType = element.Beer;
                aux.AVVolumeForDecantingTanqs = element.AVVolumeForDecantingTanqs.Value;
                hdBread.Create(aux);
            }

            items = hdBread.Select("{ID} asc", 0, 0, "").ToList();
            return items;
        }

        public static ReturnValue SetArticlesParametersForDecanting(dynamic item)
        {
            COB_MSM_ArticlesParametersForDecanting_BREAD adBread = new COB_MSM_ArticlesParametersForDecanting_BREAD();
            COB_MSM_ArticlesParametersForDecanting element = new COB_MSM_ArticlesParametersForDecanting();
            String mosto = String.Empty;
            ReturnValue res = new ReturnValue();
            double decreasePacking, decreaseFiltration, beerInFiltration, dilution;

            foreach (var mostoParameters in item)
            {
                mosto = mostoParameters.mosto.ToString();
                decreasePacking = double.Parse(String.IsNullOrEmpty(mostoParameters.parameters.decreasePacking.ToString()) ? "0" : mostoParameters.parameters.decreasePacking.ToString());
                decreaseFiltration = double.Parse(String.IsNullOrEmpty(mostoParameters.parameters.decreaseFiltration.ToString()) ? "0" : mostoParameters.parameters.decreaseFiltration.ToString());
                beerInFiltration = double.Parse(String.IsNullOrEmpty(mostoParameters.parameters.beerInFiltration.ToString()) ? "0" : mostoParameters.parameters.beerInFiltration.ToString());
                dilution = double.Parse(String.IsNullOrEmpty(mostoParameters.parameters.dilution.ToString()) ? "0" : mostoParameters.parameters.dilution.ToString());
                element = adBread.Select("", 0, 0, "{Beer} = '" + mosto + "'").FirstOrDefault();

                element.DecreasePacking = decreasePacking;
                element.DecreaseFiltration = decreaseFiltration;
                element.RecoveredBeerInFiltration = beerInFiltration;
                element.Dilution = dilution;

                res = adBread.Edit(element);
                if (!res.succeeded)
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Error al editar los valores del COB ArticlesParametersForDecanting. Code = " + res.numcode.ToString() + ", message = " + res.message
                    , "DAO_Planificacion.SetArticlesParametersForDecanting", "", "");
            }

            return res;
        }

        public static ReturnValue SetBeersParametersForDecanting(dynamic item)
        {
            COB_MSM_HDBeerParametersForDecanting_BREAD adBread = new COB_MSM_HDBeerParametersForDecanting_BREAD();
            COB_MSM_HDBeerParametersForDecanting element = new COB_MSM_HDBeerParametersForDecanting();
            String mosto = String.Empty;
            ReturnValue res = new ReturnValue();
            double avVolumeDecantingTanqs;

            foreach (var mostoParameters in item)
            {
                mosto = mostoParameters.mosto.ToString();
                avVolumeDecantingTanqs = double.Parse(String.IsNullOrEmpty(mostoParameters.parameters.avVolumeDecantingTanqs.ToString()) ? "0" : mostoParameters.parameters.avVolumeDecantingTanqs.ToString());

                element = adBread.Select("", 0, 0, "{BeerType} = '" + mosto + "'").FirstOrDefault();
                element.AVVolumeForDecantingTanqs = avVolumeDecantingTanqs;
                res = adBread.Edit(element);

                if (!res.succeeded)
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Error al editar los valores del COB HDBeerParametersForDecanting. Code = " + res.numcode.ToString() + ", message = " + res.message
                                        , "DAO_Planificacion.SetBeersParametersForDecanting", "", "");

            }

            return res;
        }

        public static List<HDBeerForDecantingPlanning> GetHDBeerDatasForDecantingPlanning(List<COB_MSM_HDBeerParametersForDecanting> hdBeer)
        {
            Definition_BREAD dBread = new Definition_BREAD();
            ExecutionEquipment_BREAD eBread = new ExecutionEquipment_BREAD();
            Definition def = new Definition();
            List<LoteUbicacionMaterial_FAB> batches = new List<LoteUbicacionMaterial_FAB>();
            List<LoteUbicacionMaterial_FAB> auxBatches = new List<LoteUbicacionMaterial_FAB>();
            List<HDBeerForDecantingPlanning> hdBeers = new List<HDBeerForDecantingPlanning>();
            COB_MSM_HDBeerParametersForDecanting_BREAD beerBread = new COB_MSM_HDBeerParametersForDecanting_BREAD();
            COB_MSM_HDBeerParametersForDecanting obj = new COB_MSM_HDBeerParametersForDecanting();
            HDBeerForDecantingPlanning beer;
            BomItemPropertyValue_BREAD mostoBread = new BomItemPropertyValue_BREAD();
            BomItemPropertyValue mop;
            List<PlanningDecanting_FAB> fabOrders = new List<PlanningDecanting_FAB>();

            using (MESEntities context = new MESEntities())
            {
                auxBatches = context.LoteUbicacionMaterial_FAB.AsNoTracking().ToList();
                fabOrders = context.PlanningDecanting_FAB.AsNoTracking().ToList();
            }

            batches = auxBatches.Where(x => x.Parent.Contains(".FERMENTACION-GUARDA.GU")).ToList();

            var hdBeerDatas = from item in batches
                              group item by item.DefID into l
                              select new
                              {
                                  HDBeer = l.Key,
                                  Quantity = l.Sum(x => x.Quantity),
                                  TanqsNumber = auxBatches.Where(x => x.Parent.Contains(".FERMENTACION-GUARDA.GU") && x.DefID.Equals(l.Key)).ToList().Count
                              };


            var woByArticle = from item in fabOrders
                              group item by item.Cod_Material into l
                              select new
                              {
                                  Article = l.Key,
                                  Quantity = l.Sum(x => x.Cantidad_Material).Value
                              };

            COB_MSM_HDBeerParametersForDecanting auxItem;
            foreach (var element in hdBeerDatas)
            {
                obj = beerBread.Select("", 0, 0, "{DefID} ='" + element.HDBeer.ToString() + "'").FirstOrDefault();
                if (obj != null)
                {
                    beer = new HDBeerForDecantingPlanning();
                    beer.HDBeer = obj.BeerType;
                    auxItem = hdBeer.Find(x => x.DefID.Equals(element.HDBeer.ToString()));
                    beer.TotalHDBeerInPeriod = auxItem != null ? auxItem.NecessaryTotalHDBeer : 0;
                    beer.HDBeerInCellar = Double.Parse(element.Quantity.ToString());
                    beer.RealTanqsNumberToEmpty = Double.Parse(element.TanqsNumber.ToString());
                    beer.NecesaryTotalHDBeer = Math.Max(0, beer.TotalHDBeerInPeriod - beer.HDBeerInCellar);
                    beer.EstimatedTanqsNumberToEmpty = Math.Ceiling(beer.NecesaryTotalHDBeer / (obj.AVVolumeForDecantingTanqs == 0 ? 1 : obj.AVVolumeForDecantingTanqs));
                    //Se Obtiene el mosto que contiene la HDBeer en su BOM
                    mop = mostoBread.Select("", 0, 0, "{BomAlternativeDefinitionID} = '" + element.HDBeer.ToString() + "' AND {MaterialPropertyID} = 'Subclase_codigo' AND ({Value} = 'MOP' OR {Value} = 'MDH')").FirstOrDefault();
                    if (mop != null)
                    {
                        var aux = woByArticle.Where(x => x.Article.Equals(mop.DefinitionID)).FirstOrDefault();
                        beer.TotalBeerInPlanning = (aux != null ? Double.Parse(aux.Quantity.ToString()) : 0);
                        beer.EstimatedTanqsNumberToFill = fabOrders.Where(x => x.Cod_Material.Equals(mop.DefinitionID)).GroupBy(x => x.equip_long_name).Count();
                        beer.TanqsDifference = (beer.RealTanqsNumberToEmpty + beer.EstimatedTanqsNumberToEmpty) - beer.EstimatedTanqsNumberToFill;
                        hdBeers.Add(beer);
                    }
                    else
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "La HDBeer " + element.HDBeer.ToString() + " no contiene ningún MOP/MDH en su BOM", "DAO_Planificacion.GetHDBeerDatasForDecantingPlanning", "I-ERP-MES-BOM", "");
                }
            }

            return hdBeers;
        }


        public static Dictionary<String, Object> GetDatasForDecantingPlanning(String dateTime)
        {
            try
            {
                Dictionary<String, Object> datas = new Dictionary<String, Object>();
                List<COB_MSM_HDBeerParametersForDecanting> hdBeer = new List<COB_MSM_HDBeerParametersForDecanting>();
                datas.Add("WoPlanning", GetPackingArticlesDatasForDecantingPlanning(dateTime, hdBeer));
                datas.Add("HDBeerPlanning", GetHDBeerDatasForDecantingPlanning(hdBeer));

                return datas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Planificacion.GetDatasForDecantingPlanning", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planificacion.GetDatasForDecantingPlanning", "WEB-FABRICACION", "Sistema");
                throw new Exception("Error obteniendo la planificación de trasiegos");
            }
        }
        /// <summary>
        /// Metodo que obtiene la informacion  para la pantalla de planificacion de trasiegos.
        /// </summary>
        /// <param name="dateTime">FEcha</param>
        /// <param name="HDBeerTotal">Total</param>
        /// <returns></returns>
        public static List<PackingArticleByDecatingPlanning> GetPackingArticlesDatasForDecantingPlanning(String dateTime, List<COB_MSM_HDBeerParametersForDecanting> HDBeerTotal)
        {

            #region Variables

            COB_MSM_ArticlesParametersForDecanting_BREAD adBread = new COB_MSM_ArticlesParametersForDecanting_BREAD();
            COB_MSM_ArticlesParametersForDecanting articleParameters = new COB_MSM_ArticlesParametersForDecanting();
            PackingArticleByDecatingPlanning wo;
            List<LoteUbicacionMaterial_FAB> batchs = new List<LoteUbicacionMaterial_FAB>();
            List<PackingArticleByDecatingPlanning> result = new List<PackingArticleByDecatingPlanning>();
            List<MSM.Models.Envasado.Orden> packingWO = new List<Models.Envasado.Orden>();
            Dictionary<String, Double> totalQuantityByTypeofHDBeer = new Dictionary<String, Double>();
            DateTime current = DateTime.UtcNow;
            DateTime currentDate = new DateTime(current.Year, current.Month, current.Day, 00,00, 00);
            DateTime aux = DateTime.Parse(dateTime);
            dateTime = new DateTime(aux.Year, aux.Month, aux.Day, 23, 59, 59).ToString();
            DateTime EnddateTime = new DateTime(aux.Year, aux.Month, aux.Day, 23, 59, 59);
            
            //Primero se agrupa por artículo de envasado
            List<REL_PackingWo_HighBeer> packing = new List<REL_PackingWo_HighBeer>();
            COB_MSM_HDBeerParametersForDecanting auxItem;
            String auxHdBeer = String.Empty;
            

            #endregion 

            #region Ordenes de Envasado
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    packing = context.REL_PackingWo_HighBeer.AsNoTracking().ToList();
                }
                GetArticlesParametersForDecanting();
                GetHDBeerParametersForDecanting();
                // Obtemenos la información de las ordenes de envasado
                var ordenesENV = getOrdenesEnvasado(currentDate, EnddateTime).
                    Select(o => new Orden
                    {
                        codigo = o.codigo,
                        estado = o.estado,
                        idLinea = o.idLinea,
                        cantidadHl = o.cantidadHl
                    }).ToList();

                // Agrupamos por cerveza a envasar
                var packingArticleQuantity = from item in ordenesENV
                                             group item by item.codigo into l
                                             select new PackingCZAMaterial
                                             {
                                                 Code = l.Key,
                                                 PackingQuantity = l.Sum(x => double.Parse(x.cantidadHl.ToString())),
                                                 CZAEnv = packing.Find(z => z.PackingArticleID.Equals(l.Key)) != null ? packing.Find(z => z.PackingArticleID.Equals(l.Key)).CZAEnv : "---",
                                             };



                #endregion

            #region Manugistic
                //Se obtienen la planificación de Manugistic
                var currentDateStr = DateTime.ParseExact(currentDate.ToShortDateString(), "dd/mm/yyyy", CultureInfo.InvariantCulture).ToString("yyyy-mm-dd");
                var toDateStr = DateTime.ParseExact(DateTime.Parse(dateTime.ToString()).ToShortDateString(), "dd/mm/yyyy", CultureInfo.InvariantCulture).ToString("yyyy-mm-dd");

                List<PlanificacionCocciones> coc = SetPlanningWP(currentDateStr, currentDateStr, toDateStr);

                var manugisticPackingArticleQuantity = from item in coc
                                                       group item by item.CodArticle into l
                                                       select new PackingCZAMaterial
                                                       {
                                                           Code = l.Key,
                                                           PackingQuantity = l.Sum(x => x.CZAEnv),
                                                           CZAEnv = packing.Find(z => z.PackingArticleID.Equals(l.Key)) != null ? packing.Find(z => z.PackingArticleID.Equals(l.Key)).CZAEnv : "---",
                 
                                                       };

                 #endregion 

            #region  Actualizacion de la información
                
                //luego sumamos las dos cantidades, las ordenes de envasado y manugistoc
                var articleQuantity = from item in packingArticleQuantity.Union(manugisticPackingArticleQuantity)
                                      group item by item.CZAEnv into l
                                      select new
                                      {
                                          Code = l.Key,
                                          PackingQuantity = l.Sum(x => x.PackingQuantity)
                                      };
                using (MESEntities context = new MESEntities())
                {
                    batchs = context.LoteUbicacionMaterial_FAB.AsNoTracking().ToList();
                }

                foreach (var item in articleQuantity.Where(x => x.Code != null))
                {
                    articleParameters = adBread.Select("", 0, 0, "{CZAEnv} ='" + item.Code.ToString() + "'").FirstOrDefault();
                    if (articleParameters != null)
                    {
                        wo = new PackingArticleByDecatingPlanning();
                        wo.Article = articleParameters.CZAEnv;
                        wo.Code = articleParameters.CZAEnv.Contains('-') ? articleParameters.CZAEnv.Split('-')[0] : articleParameters.CZAEnv;
                        wo.Quantity = Double.Parse(item.PackingQuantity.ToString());
                        wo.StockInTCP = double.Parse(batchs.Where(x => x.Parent.Contains(".PRELLENADO.PR") && x.DefID.Equals(wo.Code)).Sum(x => x.Quantity).ToString());
                        wo.TotalNecessity = (wo.Quantity + (wo.Quantity * (articleParameters.DecreasePacking / 100))) - wo.StockInTCP;
                        wo.TotalBeerToFilter = wo.TotalNecessity + (wo.TotalNecessity * (articleParameters.DecreaseFiltration / 100));
                        wo.TotalHDBeerToSendToFiltration = Math.Max(0, wo.TotalNecessity - (wo.TotalNecessity * ((articleParameters.RecoveredBeerInFiltration / 100) + (articleParameters.Dilution / 100))));
                        wo.HDBeer = articleParameters.HDBeerInSelectedPeriod;
                        result.Add(wo);
                        //Se guarda el valor para utilizarlo luego y no tener que recalcular el parámetro   
                        auxHdBeer = wo.HDBeer.Contains("-") ? wo.HDBeer.Split('-')[0] : wo.HDBeer;
                        auxItem = HDBeerTotal.Find(x => x.DefID.Equals(auxHdBeer));
                        if (auxItem == null)
                            HDBeerTotal.Add(new COB_MSM_HDBeerParametersForDecanting { DefID = auxHdBeer, NecessaryTotalHDBeer = wo.TotalHDBeerToSendToFiltration });
                        else
                            auxItem.NecessaryTotalHDBeer += wo.TotalHDBeerToSendToFiltration;
                    }
                }

                #endregion 

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planificacion.GetPackingArticlesDatasForDecantingPlanning", "WEB-FABRICACION", "Sistema");
                throw new Exception("Error obteniendo planificación de trasiegos");
            }
            // Devolvemos el listao.
            return result.Distinct().ToList();
        }


        #region FUNCIONES COMUNES
        private class Orden
        {
            public string codigo { get; set; }
            public string estado { get; set; }
            public string idLinea { get; set; }
            public decimal cantidadHl { get; set; }
        }

        private class Lote
        {
            public string DefID { get; set; }
            public string LocPath { get; set; }
            public string idLinea { get; set; }
            public decimal Quantity { get; set; }
        }

        private class ProductoEnvasesCajasPaletsHl
        {
            public string CodigoProducto { get; set; }
            public string CodigoCzaEnv { get; set; }
            public int CajasPorPalet { get; set; }
            public int EnvasesPorPalet { get; set; }
            public double HectolitrosEnvases { get; set; }
        }

        private static decimal redondeaCantidad(decimal valor)
        {
            return decimal.Round(valor, 2);
        }

        private static IEnumerable<ProductoEnvasesCajasPaletsHl> getRelacionProdEnvCajasPaletsHl(IEnumerable<string> listaCodigosProductos)
        {
            var result = new List<ProductoEnvasesCajasPaletsHl>();
            string listaCodigosProductosStr = "";

            // Filtrar codigos no validor y rodear el codigo de producto con comillas
            listaCodigosProductos = listaCodigosProductos.Where(p => !string.IsNullOrWhiteSpace(p)).Select(p => String.Format("'{0}'", p));
            // Crear un string con todos los codigos separados por comas
            listaCodigosProductosStr = String.Join(",", listaCodigosProductos);

            using (var conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                conexion.Open();
                using (var comando = new SqlCommand("[INTERSPEC_ObtenerRelacionEnvasesCajasPaletsHl]", conexion))
                {
                    comando.CommandType = CommandType.StoredProcedure;
                    comando.Parameters.AddWithValue("@listaCodigosProductos", listaCodigosProductosStr);

                    var dr = comando.ExecuteReader();
                    while (dr.Read())
                    {
                        result.Add(new ProductoEnvasesCajasPaletsHl()
                        {
                            CodigoProducto = DataHelper.GetString(dr, "codigoProducto"),
                            CodigoCzaEnv = DataHelper.GetString(dr, "codigoCzaEnv"),
                            CajasPorPalet = DataHelper.GetInt(dr, "CajasPorPalet"),
                            EnvasesPorPalet = DataHelper.GetInt(dr, "EnvasesPorPalet"),
                            HectolitrosEnvases = DataHelper.GetDouble(dr, "HectolitrosEnvases")
                        });
                    }
                }

                conexion.Close();
            }


            return result;
        }

        private static IEnumerable<Orden> getOrdenesEnvasado(DateTime fechaInicioUTC, DateTime fechaFinUTC)
        {
            //Este método devuelve todos los registros que estén en los siguientes estados: Planificada, Iniciando, Producción y Pausada.
            var estadosIniciada = new Tipos.EstadosOrden[] { Tipos.EstadosOrden.Iniciando, Tipos.EstadosOrden.Producción, Tipos.EstadosOrden.Pausada };
            var auxPackingWO = PlantaRT.obtenerOrdenesActivasPendientes().
                Where(o =>
                    o.estadoActual.Estado == Tipos.EstadosOrden.Planificada || estadosIniciada.Contains(o.estadoActual.Estado)
                ).ToArray();
            int  cantidadRestante = 0;
            // Obtener las ordenes planificadas con ajuste de cantidad dentro del periodo
            IEnumerable<Orden> listaOrdenes = auxPackingWO.
                Where(o =>
                {
                    if (o.estadoActual.Estado == Tipos.EstadosOrden.Planificada)
                        return (fechaInicioUTC <= o.dFecInicioEstimado && o.dFecInicioEstimado <= fechaFinUTC) || (fechaInicioUTC <= o.dFecFinEstimado && o.dFecFinEstimado <= fechaFinUTC) || (o.dFecInicioEstimado <= fechaInicioUTC && o.dFecFinEstimado >= fechaFinUTC);

                    //return o.dFecFinEstimado >= fechaInicioUTC && o.dFecFinEstimado <= fechaFinUTC;
                    else if (estadosIniciada.Contains(o.estadoActual.Estado))
                    {
                        var fecFinEstimadoCalculado = o.fecFinEstimadoCalculado;
                        return !(fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("NO_DISPONIBLE")) ||
                                 fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE")) ||
                                 fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("SIN_ORDEN_ACTIVA")) ||
                                 fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("SIN_TURNO_ACTIVO"))) &&
                           ((DateTime.Parse(fecFinEstimadoCalculado) >= fechaInicioUTC && DateTime.Parse(fecFinEstimadoCalculado) <= fechaFinUTC) || (DateTime.Parse(fecFinEstimadoCalculado) <= fechaInicioUTC && DateTime.Parse(fecFinEstimadoCalculado) >= fechaFinUTC));
                    }
                    else
                        return false;
                }).
                Select(o =>
                {
                    // Calcular inicios y fin
                    DateTime oIni, oFin;

                    switch (o.estadoActual.Estado)
                    {
                        case Tipos.EstadosOrden.Iniciando:
                        case Tipos.EstadosOrden.Pausada:
                            
                            oIni = o.dFecInicioEstimado;
                            oFin = o.dFecFinEstimado;
                            cantidadRestante = o.produccion.paletsProducidos;
                            break;
                        case Tipos.EstadosOrden.Planificada:
                            oIni = o.dFecInicioEstimado;
                            oFin = o.dFecFinEstimado;
                            cantidadRestante = o.cantPlanificada;
                            break;

                        case Tipos.EstadosOrden.Producción:

                               var duracionCalculada = new TimeSpan(0, 0, (int)o.duracionCalculada);
                                oIni = fechaInicioUTC;
                                oFin = (fechaInicioUTC + duracionCalculada);
                                cantidadRestante = o.produccion.paletsProducidos;
                                break;

                        default:


                        
                                // Contamos solo la parte desde el principio
                                // Utilizar la duracion estimada si está disponible, sino, el tiempo de finalizacion es de inicio (no se ajusta la cantidad)
                                var duracionCalculada2 = new TimeSpan(0, 0, (int)o.duracionCalculada);
                                oIni = fechaInicioUTC;
                                oFin = (fechaInicioUTC + duracionCalculada2);
                                cantidadRestante = o.produccion.paletsProducidos;


                            //oIni = o.dFecInicioEstimado;
                            //oFin = (o.dFecInicioEstimado + duracionCalculada);

                            break;
                    }


                    // Calcular duraciones
                    TimeSpan duracionOrden = oFin - oIni;
                    TimeSpan duracionDentroPeriodo = ( (fechaFinUTC < oFin ? fechaFinUTC : oFin) - (fechaInicioUTC > oIni ? fechaInicioUTC : oIni) );
                    //TimeSpan duracionDentroPeriodo = (fechaFinUTC) - (fechaInicioUTC);
                    
                    // Si la cantidad y duraciones no son 0, ajustar la cantidad a la que se hará dentro del periodo
                    if (cantidadRestante > 0 && duracionOrden.TotalSeconds > 0 && duracionDentroPeriodo.TotalSeconds > 0 && duracionOrden != duracionDentroPeriodo)
                    {
                        double porcentaje = duracionDentroPeriodo.TotalSeconds / duracionOrden.TotalSeconds;
                        //double porcentaje = duracionOrden.TotalSeconds / duracionDentroPeriodo.TotalSeconds;
                        cantidadRestante = int.Parse(Math.Round(Math.Abs(double.Parse(cantidadRestante.ToString()) * porcentaje), 0).ToString());
                    }

                    return new Orden()
                    {
                        codigo = o.producto.codigo,
                        idLinea = o.idLinea, // paramsLinea.Where(l => l.PPR == g.Key.equipoOrden).Select(l => l.idLinea).SingleOrDefault(),
                        estado = o.estadoActual.Estado.ToString(),
                        cantidadHl = Convert.ToDecimal(cantidadRestante)
                    };
                }).ToList();

            

            // Obtener la conversion a hectolitros solo para los productos que tengan orden
            
            var listaProductos = listaOrdenes.Select(o => o.codigo).Distinct();
            IEnumerable<ProductoEnvasesCajasPaletsHl> relProd = (listaProductos.Count() > 0 ? getRelacionProdEnvCajasPaletsHl(listaProductos) : new List<ProductoEnvasesCajasPaletsHl>());
            
            // Convertir cantidades de palets a hectolitros
            listaOrdenes = listaOrdenes.
                Join(relProd, o => o.codigo, r => r.CodigoProducto,
                    (o, r) => new Orden
                    {
                        codigo = o.codigo,
                        estado = o.estado,
                        idLinea = o.idLinea,
                       // cantidadHl = (((decimal)r.EnvasesPorPalet * (decimal)r.HectolitrosEnvases) * (Math.Abs(o.cantidadHl/r.CajasPorPalet)))
                        cantidadHl = ((   (decimal)r.EnvasesPorPalet * (decimal)r.HectolitrosEnvases) * o.cantidadHl)
                    }
                );

            return listaOrdenes;
        }
#endregion FUNCIONES COMUNES

        #region PANTALLA COCCIONES

        #region Parametros Cocciones Cerveza Envasado
        public static List<PlanificacionCocciones> SetPlanningWP(String currentDay, String startDay, String endDay)
        {
            List<PlanificacionCocciones> coc = new List<PlanificacionCocciones>();

            var planta = System.Configuration.ConfigurationManager.AppSettings["PlantaCod"];    //código de planta incluido en web.config

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerPlanificacionCocciones]", conexion);
            comando.Parameters.AddWithValue("@fIni", startDay);
            comando.Parameters.AddWithValue("@fFin", endDay);
            comando.Parameters.AddWithValue("@planta", planta);

            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    coc.Add(new PlanificacionCocciones()
                    {
                        CodArticle = DataHelper.GetString(dr, "codigo"),
                        Article = DataHelper.GetString(dr, "descript"),
                        CZAEnv = DataHelper.GetDouble(dr, "total")
                    });
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Fabricacion.SetPlanningWP", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planificacion.SetPlanningWP", "WEB-FABRICACION", "Sistema");
                throw new Exception("Error obteniendo planificación de cocciones");
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return coc;
        }

        #endregion Parametros Cocciones Cerveza Envasado

        #endregion PANTALLA COCCIONES

        #region AYUDA FILTRACION
        public async Task<DTO_RespuestaAPI<dynamic>> ObtenerConexionesTCPsLineas()
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<dynamic>>(string.Concat(_urlAyudaPlanificacionFiltracion, "ConexionesTCPsLineas"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarConexionTCPLinea(DTO_ConexionTCPLinea dto)
        {
            var result = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionFiltracion, "ConexionTCPLinea"), dto);

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_AyudaPlanificacionConfiguracion>>> ObtenerConfiguracionAyudaFiltracion()
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_AyudaPlanificacionConfiguracion>>>(string.Concat(_urlAyudaPlanificacionFiltracion, "Configuracion"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarValorConfiguracionAyudaFiltracion(DTO_AyudaPlanificacionConfiguracion dto)
        {
            var result = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionFiltracion, "ValorConfiguracion"), dto);

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_FiltracionDatosLineas>>> ObtenerFiltracionDatosLineas()
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_FiltracionDatosLineas>>>(string.Concat(_urlAyudaPlanificacionFiltracion, "DatosLineas"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarMermaFiltracion(dynamic datos)
        {
            DTO_RespuestaAPI<bool> result = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionFiltracion, "Merma"), datos);

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_FiltracionDatosTotales>>> ObtenerFiltracionDatosTotales()
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_FiltracionDatosTotales>>>(string.Concat(_urlAyudaPlanificacionFiltracion, "DatosTotales"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarFiltracionCalculoPrevision()
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionFiltracion, "CalculoPrevision"));
            return ret;
        }

        #endregion AYUDA FILTRACION

        #region AYUDA PLANIFICACIÓN COCCIÓN

        public async Task<DTO_RespuestaAPI<bool>> ActualizarMermaEnvasadoCoccion(dynamic datos)
        {
            DTO_RespuestaAPI<bool> result = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionCoccion, "MermaEnvasado"), datos);

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarMermaFiltracionCoccion(dynamic datos)
        {
            DTO_RespuestaAPI<bool> result = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionCoccion, "MermaFiltracion"), datos);

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarMermaFermGuardaCoccion(dynamic datos)
        {
            DTO_RespuestaAPI<bool> result = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionCoccion, "MermaFermGuarda"), datos);

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarCoefAumentoVolumenCoccion(dynamic datos)
        {
            DTO_RespuestaAPI<bool> result = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionCoccion, "CoefAumentoVolumen"), datos);

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_AyudaPlanificacionConfiguracion>>> ObtenerConfiguracionAyudaCoccion()
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_AyudaPlanificacionConfiguracion>>>(string.Concat(_urlAyudaPlanificacionCoccion, "Configuracion"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarValorConfiguracionAyudaCoccion(DTO_AyudaPlanificacionConfiguracion dto)
        {
            var result = await _api.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionCoccion, "ValorConfiguracion"), dto);

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_CoccionCervEnvasarCervAltaDensidad>>> ObtenerCoccionCervEnvasarCervAltaDensidad()
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_CoccionCervEnvasarCervAltaDensidad>>>(string.Concat(_urlAyudaPlanificacionCoccion, "CervEnvasarCervAltaDensidad"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_CoccionCervAltaDensidadMostoFrio>>> ObtenerCoccionCervAltaDensidadMostoFrio()
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_CoccionCervAltaDensidadMostoFrio>>>(string.Concat(_urlAyudaPlanificacionCoccion, "CervAltaDensidadMostoFrio"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_CoccionMostoFrio>>> ObtenerCoccionMostoFrio()
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_CoccionMostoFrio>>>(string.Concat(_urlAyudaPlanificacionCoccion, "MostoFrio"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<string>> ObtenerValorConfiguracionAyudaCoccion()
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<string>>(string.Concat(_urlAyudaPlanificacionCoccion, "ValorConfiguracion"));

            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarCoccionCalculoPrevision(int numSemanas)
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionCoccion, "CalculoPrevision?numSemanas=" + numSemanas));
            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> ComprobarFinFiltracionCalculoPrevision()
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<bool>>(string.Concat(_urlAyudaPlanificacionFiltracion, "FinCalculoPrevision"));
            return ret;
        }

        #endregion

    }
}