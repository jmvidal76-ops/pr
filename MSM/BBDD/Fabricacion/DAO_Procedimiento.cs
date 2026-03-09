using Clients.ApiClient.Contracts;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Fabricacion.Api.Entry;
using MSM.Mappers.DTO.Fabricacion.Api.Order;
using MSM.Models.Fabricacion;
using MSM.Utilidades;
using Siemens.Brewing.Shared;
using Siemens.SimaticIT.PDefM.Breads.Types;
using Siemens.SimaticIT.POM.Breads;
using Siemens.SimaticIT.POM.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public class DAO_Procedimiento: IDAO_ProcesoSAI
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiSiemensBrewingData"].ToString();
        private string _urlEntry;
        private string _urlOrder;
        
        private string UriFabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();
        private readonly IApiClient _api;

        public DAO_Procedimiento()
        {
            _urlEntry = string.Concat(UriBase, "entry/");
            _urlOrder = string.Concat(UriBase, "order/");
        }
        public DAO_Procedimiento(IApiClient api)
        {
            _api = api;
        }

        public static void SetItemsInActiveFiltration(dynamic datas, String guFinalMaterialID)
        {
            using (MESEntities context = new MESEntities())
            {
                int index = context.ItemsInActiveFiltration.ToList().Count;
                context.Set<ItemsInActiveFiltration>().Add(new ItemsInActiveFiltration { Id = index + 1, FiltrationId = datas.BatchID, ItemId = guFinalMaterialID });
            }
        }

        /// <summary>
        /// Método para obtener todos los procedimientos
        /// </summary>
        /// <returns>Lista de procedimientos</returns>
        public static List<Procedimiento> GetProcedimientos()
        {
            List<Procedimiento> listaProcedimientos = new List<Procedimiento>();
            List<Procedimiento_FAB> listaProcedimientosEntity = new List<Procedimiento_FAB>();

            using (MESEntities context = new MESEntities())
            {
                listaProcedimientosEntity = context.Procedimiento_FAB.AsNoTracking().ToList();

                for (int i = 0; i < listaProcedimientosEntity.Count; i++)
                {
                    listaProcedimientos.Add(new Procedimiento(listaProcedimientosEntity[i]));
                }
            }

            return listaProcedimientos;
        }

        /// <summary>
        /// Método que obtiene una lista de procedimientos segun una orden
        /// </summary>
        /// <param name="idOrden">Id de la orden de la que se quieren obtener los procedimientos
        /// <returns>Material</returns>
        public static List<Procedimiento> GetProcedimientosOrden(int idOrden)
        {
            List<Procedimiento> listaProcedimientos = new List<Procedimiento>();
            List<Procedimiento_FAB> listaProcedimientosEntity = new List<Procedimiento_FAB>();

            using (MESEntities context = new MESEntities())
            {
                listaProcedimientosEntity = context.Procedimiento_FAB.AsNoTracking().Where(m => m.Cod_Orden.Equals(idOrden) && m.Des_Procedimiento != null).OrderBy(m => m.Tiempo_Inicio).ToList();

                for (int i = 0; i < listaProcedimientosEntity.Count; i++)
                {

                    if (listaProcedimientosEntity[i].Tiempo_Inicio == null)
                    {
                        String[] datas = listaProcedimientosEntity[i].ID_Orden.Split('-');

                        string anyo = "20" + datas[datas.Length - 2];
                        using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                        {
                            using (SqlCommand command = new SqlCommand("[MES_ObtenerMensajesDeltaV_Fab]", connection))
                            {
                                command.CommandType = CommandType.StoredProcedure;
                                command.Parameters.AddWithValue("@area", System.Text.Encoding.UTF8.GetString(System.Text.Encoding.GetEncoding("ISO-8859-8").GetBytes("Coccion")));
                                command.Parameters.AddWithValue("@anyo", anyo);
                                command.Parameters.AddWithValue("@numcoc", datas[5]);
                                command.Parameters.AddWithValue("@proc", listaProcedimientosEntity[i].Des_Procedimiento);

                                using (SqlDataAdapter da = new SqlDataAdapter(command))
                                {

                                    connection.Open();
                                    DataTable dt = new DataTable();
                                    da.Fill(dt);
                                    foreach (DataRow row in dt.Rows)
                                    {
                                        if (row["Dato_Valor"].ToString().Contains("INICIO PROCEDIMIENT"))
                                        {
                                            listaProcedimientosEntity[i].Tiempo_Inicio = DateTime.Parse(row["Fecha"].ToString());
                                            listaProcedimientosEntity[i].Tiempo_InicioUTC = DateTime.Parse(row["Fecha"].ToString());
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    listaProcedimientos.Add(new Procedimiento(listaProcedimientosEntity[i]));
                }
            }

            //DAO_Procedimiento.ProbarArrancarOrden();

            return listaProcedimientos;
        }

        public static List<ProcesoWO> GetProcedimientosOrdenDetalle(int idorden)
        {
            List<ProcesoWO> listaProcedimientos = new List<ProcesoWO>();

            using (MESFabEntities context = new MESFabEntities())
            {
                var data = context.Subprocesos.AsNoTracking().Where(x => x.IdWO == idorden).OrderByDescending(o => o.FechaInicio);

                foreach (var x in data)
                {
                    DateTime? fechaIniLocal = null;
                    if (x.FechaInicio != null)
                        fechaIniLocal = x.FechaInicio.Value.ToLocalTime();

                    DateTime? fechaFinLocal = null;
                    if (x.FechaFin != null)
                        fechaFinLocal = x.FechaFin.Value.ToLocalTime();

                    var res = new ProcesoWO()
                    {
                        Id = x.IdSubproceso,
                        LoteSAI = x.LoteSAI,
                        DescSubProceso = x.TiposSubprocesos.DescSubProceso,
                        IdWO = x.IdWO,
                        FechaInicio = fechaIniLocal,
                        FechaFin = fechaFinLocal
                    };
                    listaProcedimientos.Add(res);
                }

                return listaProcedimientos;
            }
        }

        public static List<Procedimiento> GetProcedimientosOrdenByPO(int idOrden)
        {
            List<Procedimiento> listaProcedimientos = new List<Procedimiento>();
            List<Procedimiento_FAB> listaProcedimientosEntity = new List<Procedimiento_FAB>();

            using (MESEntities context = new MESEntities())
            {
                listaProcedimientosEntity = context.Procedimiento_FAB.AsNoTracking().Where(m => m.Cod_Orden.Equals(idOrden) && m.Des_Procedimiento != null && !m.Des_Procedimiento.Contains("Aux") && m.ID_Procedimiento.Contains("Entry")).OrderBy(m => m.Des_Procedimiento).ToList();

                for (int i = 0; i < listaProcedimientosEntity.Count; i++)
                {
                    listaProcedimientos.Add(new Procedimiento(listaProcedimientosEntity[i]));
                }
            }

            //DAO_Procedimiento.ProbarArrancarOrden();

            return listaProcedimientos;
        }

        public async Task<bool> CrearProceso(dynamic datos)
        {
            String order = datos.OrderID.ToString();
            String job = datos.JobID.ToString();
            String entry = datos.EntryName.ToString();

            string url = string.Concat(_urlEntry, "ProccessByTransfer?orderID=", order, "&jobID=", job, "&entryName=", entry);
            var _ret = await ApiClient.GetAsync(url);
            return await _ret.Content.ReadAsAsync<bool>();
        }

        public async Task<bool> UpdateProcessDateTime(string entryPK, DateTime? startDate, DateTime? endDate)
        {
            ReturnValue returnValue = default(ReturnValue);
            ReturnValue returnValue2 = default(ReturnValue);
            SitDateTime start, end;

            start = startDate.HasValue ? SitDateTime.Create(new DateTime?(startDate.Value.ToUniversalTime()), true) : SitDateTime.Create(new DateTime?(DateTime.Now.ToUniversalTime()), true);
            end = startDate.HasValue ? SitDateTime.Create(new DateTime?(endDate.Value.ToUniversalTime()), true) : SitDateTime.Create(new DateTime?(DateTime.Now.ToUniversalTime()), true);

            Entry_BREAD entryBread = new Entry_BREAD();
            Entry entry = entryBread.SelectByPK(entryPK).FirstOrDefault();
            if (entry != null)
            {
                string urlEntryUpdateStartTime = string.Concat(_urlEntry, "EntryUpdateStartTime");
                string urlEntryUpdateEndTime = string.Concat(_urlEntry, "EntryUpdateEndTime");
                DTO_EntryUpdate _dtoStart = new DTO_EntryUpdate()
                {
                    IdEntry = entry.ID,
                    Time = start
                };
                DTO_EntryUpdate _dtoEnd = new DTO_EntryUpdate()
                {
                    IdEntry = entry.ID,
                    Time = end
                };
                var _resultStart = await ApiClient.PutAsJsonAsync(urlEntryUpdateStartTime, _dtoStart);
                var _resultEnd = await ApiClient.PutAsJsonAsync(urlEntryUpdateEndTime, _dtoEnd);
                returnValue = await _resultStart.Content.ReadAsAsync<ReturnValue>();
                returnValue2 = await _resultEnd.Content.ReadAsAsync<ReturnValue>();

                if (returnValue.succeeded != returnValue2.succeeded)
                    return false;
                else
                    return returnValue.succeeded;
            }
            else
                return false;
        }
        public async Task<bool> cambiaEstadoProcedimiento(dynamic datos)
        {
            try
            {
                string fecha = datos.fecha.ToString();
                string tipo = datos.estado.ToString();
                string equipo = datos.equipo.ToString();
                string idProc = datos.ID_Proc.ToString();
                string idOrden = datos.ID_Orden.ToString();
                //string fechaInicio = datos.fechaini.ToString();
                string Des_Proc = datos.des_proc.ToString();
                string planta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];

                DateTime fechaDT = DateTime.Now;
                DateTime test = new DateTime();
                if (DateTime.TryParse(fecha, out test))
                {
                    fechaDT = DateTime.Parse(fecha);
                }

                ReturnValue ret = new ReturnValue();

                string urlUpdateStatus = string.Concat(_urlOrder, "UpdateStatusProcedure");
                if (tipo == "Inicio" || tipo == "Fin")
                {
                    UpdateProcess_DTO _data = new UpdateProcess_DTO()
                    {
                        Date = fechaDT,
                        IdOrder = idOrden,
                        Entry = equipo,
                        Type = tipo
                    };
                    var result = await ApiClient.PutAsJsonAsync(urlUpdateStatus, _data);
                    ret = await result.Content.ReadAsAsync<ReturnValue>();
                    if (ret.succeeded)
                        return true;
                    else
                    {
                        //DAO_Log.registrarLog(DateTime.Now, "DAO_Equipos.cambiaEstadoProcedimiento", "Error cambiando el estado del procedimiento :" + ret.message, HttpContext.Current.User.Identity.Name);
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "DAO_Procedimiento.cambiaEstadoProcedimiento", "WEB-FABRICACION", "Sistema");
                        throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_EL") + ret.message);
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Equipos.cambiaEstadoProcedimiento", "Error cambiando el estado del procedimiento :" + e.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Procedimiento.cambiaEstadoProcedimiento", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_EL") + ex.Message);
            }

        }

        public async Task<bool> DuplicarEntry(dynamic datos)
        {
            try
            {
                string idOrden = datos.orden.Value;
                string proc = datos.proc.Value;
                //long fechaEnt = datos.fecha.Value;

                //var dt = new DateTime(1970, 1, 1).AddSeconds(fechaEnt / 1000).ToLocalTime();

                //ReturnValue ret = SitOrder_BREAD.duplicarEntry(proc, dt);
                string urlDuplicar = string.Concat(_urlEntry, "DuplicateEntry");
                DTO_DuplicateEntry _data = new DTO_DuplicateEntry()
                {
                    IdEntry = proc,
                    Date = DateTime.Now.ToUniversalTime()
                };
                var result = await ApiClient.PutAsJsonAsync(urlDuplicar, _data);
                ReturnValue ret = await result.Content.ReadAsAsync<ReturnValue>();

                if (!ret.succeeded)
                    throw new Exception(IdiomaController.GetResourceName("ERROR_AL_HACER"));
                else
                    return ret.succeeded;
            }
            catch (Exception ex)
            {
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_HACER"));
            }
        }

        internal static List<Procedimiento_FAB> obtenerEquiposOrden(int idOrden)
        {
            List<Procedimiento_FAB> listaProcedimientos = new List<Procedimiento_FAB>();
            List<Procedimiento_FAB> finalProcedures = new List<Procedimiento_FAB>();
            List<String> equipments = new List<String>();

            using (MESEntities context = new MESEntities())
            {
                String aux = context.Procedimiento_FAB.AsNoTracking().Where(m => m.Cod_Orden.Equals(idOrden)).Select(item => item.ID_Orden).Distinct().ToList()[0];
                
                if (aux.Contains("-TR"))
                    listaProcedimientos = context.Procedimiento_FAB.AsNoTracking().Where(m => (m.ID_Orden.Contains("-FE") || m.ID_Orden.Contains("-GU")) && !m.Des_Procedimiento.Contains("-") && m.Des_Procedimiento != null && !m.Des_Procedimiento.Equals("AuxEntry") && m.Estado_Procedimiento.Equals("Running")).OrderBy(m => m.Orden_Procedimiento).ThenBy(p => p.Des_Procedimiento).ToList();
                else
                    listaProcedimientos = context.Procedimiento_FAB.AsNoTracking().Where(m => m.Cod_Orden.Equals(idOrden) && !m.Des_Procedimiento.Contains("-") && m.Des_Procedimiento != null && !m.Des_Procedimiento.Equals("AuxEntry")).OrderBy(m => m.Orden_Procedimiento).ThenBy(p => p.Des_Procedimiento).ToList();

                listaProcedimientos.ForEach(c => { if (equipments.IndexOf(c.ID_Equipo) == -1) { equipments.Add(c.ID_Equipo); c.Des_Equipo = c.Des_Equipo + " - " + c.ID_Equipo; finalProcedures.Add(c); } });
            }

            return finalProcedures;
        }

        public async Task<List<Procedimiento>> GetProcedimientosOrdenConWP(int idOrden)
        {
            string url = string.Concat(_urlEntry, "PomEntriesByOrderPk/", idOrden, "/");
            var ret = await ApiClient.GetAsync(url);
            List<Entry> listaEntries = await ret.Content.ReadAsAsync<List<Entry>>();
            listaEntries.All(c => { if (c.Label.Equals("D_WP")) c.Label = "Orden cocción"; if (c.Label.Equals("D_FE")) c.Label = "Orden fermentación"; if (c.Label.Equals("D_GU")) c.Label = "Orden guarda"; if (c.Label.Equals("D_FL")) c.Label = "Orden filtración"; if (c.Label.Equals("D_PR")) c.Label = "Orden prellenado"; return true; });
            List<Procedimiento> listProcs = listaEntries.Where(m => (!m.Label.Equals("AuxEntry")) && (!m.Label.Contains("Transferencia")) && (!m.Label.Contains("Siembra"))).OrderBy(m => m.Sequence).Select(c => new Procedimiento() { Cod_Procedimiento = c.PK, Des_Procedimiento = c.Label }).ToList();

            return listProcs;
        }

        public async Task<List<Procedimiento>> GetProcedimientosOrdenConWo(String type)
        {
            string url = string.Concat(_urlOrder, "ProductSegmentsByType/", type, "/");
            var ret = await ApiClient.GetAsync(url);

            List<ProductSegment> listaEntries = await ret.Content.ReadAsAsync<List<ProductSegment>>();
            List<String> valores = new List<String>();
            listaEntries.All(c => { if (c.LabelName.Equals("D_WP")) c.LabelName = "Orden Cocción"; if (c.LabelName.Equals("D_FE")) c.LabelName = "Orden Fermentación"; if (c.LabelName.Equals("D_GU")) c.LabelName = "Orden Guarda"; if (c.LabelName.Equals("D_FL")) c.LabelName = "Orden Filtración"; if (c.LabelName.Equals("D_PR")) c.LabelName = "Orden Prellenado"; return true; });
            List<Procedimiento> listProcs = listaEntries.Where(m => !m.LabelName.Equals("AuxEntry")).OrderBy(m => m.Sequence).Select(c => new Procedimiento() { ID_Procedimiento = c.PPRName.Substring(0, c.PPRName.Length - 4), Des_Procedimiento = c.LabelName }).ToList().FindAll(delegate (Procedimiento item) { if (valores.IndexOf(item.Des_Procedimiento) == -1) { valores.Add(item.Des_Procedimiento); return true; } else return false; });

            return listProcs;
        }

        internal static List<string> ObtenerFechasProcHistorian(int order, int proc, int check)
        {
            List<string> fechas = new List<string>();

            if (check == 0)
            {
                Entry_BREAD eBread = new Entry_BREAD();
                Entry ent = eBread.SelectByPK(proc).FirstOrDefault();

                fechas.Add(ent.ActualStartTime.HasValue ? ent.ActualStartTime.Value.ToLocalTime().ToString() : "-");
                fechas.Add(ent.ActualEndTime.HasValue ? ent.ActualEndTime.Value.ToLocalTime().ToString() : "-");
            }
            else
            {
                Ordenes_FAB orden = new Ordenes_FAB();
                using (MESEntities context = new MESEntities())
                {
                    orden = context.Ordenes_FAB.AsNoTracking().Where(m => m.Cod_Orden == order).FirstOrDefault();
                }

                fechas.Add(orden.Tiempo_Inicio_Real.HasValue ? orden.Tiempo_Inicio_Real.Value.ToLocalTime().ToString() : "-");
                fechas.Add(orden.Tiempo_Fin_Real.HasValue ? orden.Tiempo_Fin_Real.Value.ToLocalTime().ToString() : "-");
            }

            return fechas;
        }

        public async Task<ReturnValue> editarProcedimiento(dynamic datos)
        {
            string url = string.Concat(_urlEntry);
            DTO_EntryUpdate _data = new DTO_EntryUpdate()
            {
                Start = datos.inicio,
                End = datos.fin,
                Order = datos.order,
                CodProcess = datos.proc
            };
            var ret = await ApiClient.PutAsJsonAsync(url, _data);
            return await ret.Content.ReadAsAsync<ReturnValue>();
        }
        public async Task<List<msgDeltaV>> ObtenerListadoSubProcesoSAI(string idOrden,string idSubProcesoSAI)
        {
            var ret = await _api.GetPostsAsync<List<msgDeltaV>>(UriFabricacion + "api/ProcesoSAI/ObtenerListadoSubProcesoSAI?idOrden=" + idOrden + "&idSubProcesoSAI=" + idSubProcesoSAI);
            return ret;
        }
    }
}