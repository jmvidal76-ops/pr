using Clients.ApiClient.Contracts;
using Common.Models.Fabricacion.Orden;
using Common.Models.Fabricacion.Sala;
using Common.Models.RTDS;
using Common.Models.Trazabilidad.Fabricacion;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.RTDS;
using MSM.Controllers.Fabricacion;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api;
using MSM.Mappers.DTO.Fabricacion.Api.Lot;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.Utilidades;
using MSM_FabricacionAPI.Models.Orden;
using Siemens.Brewing.Domain.Entities;
using Siemens.SimaticIT.BPM.Breads;
using Siemens.SimaticIT.BPM.Breads.Types;
using Siemens.SimaticIT.MM.Breads;
using Siemens.SimaticIT.POM.Breads;
using Siemens.SimaticIT.POM.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;

namespace MSM.BBDD.Fabricacion
{
    public class DAO_Orden : IDAO_Orden
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiSiemensBrewingData"].ToString();
        private string UriFabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();
        private string _urlLot;
        private string _urlOrder;
        private string _urlEntry;
        private string _urlProcessParameter;
        private string _urlOrdenFab;
        private string _urlZonaFab;
        private string _urlLoteFab;
        private string _urlKOPFab;

        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();
        private IApiClient _api;

        public DAO_Orden(IApiClient api)
        {
            _api = api;
            _urlLot = string.Concat(UriBase, "lot/");
            _urlOrder = string.Concat(UriBase, "order/");
            _urlEntry = string.Concat(UriBase, "entry/");
            _urlProcessParameter = string.Concat(UriBase, "processParameter/");
            _urlOrdenFab = string.Concat(UriFabricacion, "api/orden/");
            _urlZonaFab = string.Concat(UriFabricacion, "api/zona/");
            _urlLoteFab = string.Concat(UriFabricacion, "api/lote/");
            _urlKOPFab = string.Concat(UriFabricacion, "api/kop/");
        }

        public static String GetOrderType(string tipoWO)
        {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMESFab"].ConnectionString);
            SqlDataReader dr = null;
            try
            {
                List<string> Info = new List<string>();
                string queryView = "Fab.spObtenerTipoWO";
                SqlCommand comando = new SqlCommand(queryView, conexion);
                comando.Parameters.Add(new SqlParameter("@IdTipo", tipoWO));
                comando.CommandType = CommandType.StoredProcedure;
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Info.Add(DataHelper.GetString(dr, "DescTipoWO"));
                };
                dr.Close();
                dr.Dispose();
                conexion.Close();

                return string.Join(",", Info);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.GetOrderType", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        public async Task<String> GetPlannedOrderNotes(String orderID)
        {
            using (MESFabEntities context = new MESFabEntities())
            {
                var valor = context.WOPlanificadas.AsNoTracking().Where(x => x.IdWOPlanificada.ToString() == orderID).FirstOrDefault().NotasWO;
                return valor;
            }
        }

        public async Task<String> GetOrderNotes(String orderID)
        {
            string _urlOrderNotes = string.Concat(_urlOrder, "OrderNote/", orderID, "/");
            var result = await ApiClient.GetAsync(_urlOrderNotes);
            return await result.Content.ReadAsAsync<string>();
        }

        public async Task<ReturnValue> SetPlannedOrderNotes(String orderID, String notes)
        {
            using (MESFabEntities context = new MESFabEntities())
            {
                var obj = context.WOPlanificadas.Where(x => x.IdWOPlanificada.ToString() == orderID).FirstOrDefault();
                obj.NotasWO = notes;
                await context.SaveChangesAsync();
                return new ReturnValue(true);
            }
        }

        public async Task<ReturnValue> SetOrderNotes(String orderID, String notes)
        {
            string urlSetOrderNote = string.Concat(_urlOrder, "SetOrderNote?orderID=", orderID, "&notes=", notes);
            var _result = await ApiClient.GetAsync(urlSetOrderNote);
            return await _result.Content.ReadAsAsync<ReturnValue>();
        }

        public List<Orden> GetListaOrdenesProgramaFabricacion(DateTime fFechaInicio, DateTime fFechaFin)
        {
            try
            {
                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_ObtenerProgramaOrdenes_FAB]", conexion))
                    {
                        List<Orden> todasOrdenes = new List<Orden>();

                        comando.Parameters.Add(new SqlParameter("@fIni", fFechaInicio));
                        comando.Parameters.Add(new SqlParameter("@fFin", fFechaFin));
                        comando.CommandType = CommandType.StoredProcedure;
                        conexion.Open();
                        SqlDataReader dr = comando.ExecuteReader();
                        while (dr.Read())
                        {
                            var idOrden = DataHelper.GetString(dr, "Id");
                            var estado = new EstadoOrden(Convert.ToInt32(dr["IdEstado"]));
                            var fechaInicioEstimadoUTC = DataHelper.GetDate(dr, "FechaInicioEstimadoUTC");
                            var fechaFinEstimadoUTC = DataHelper.GetDate(dr, "FechaFinEstimadoUTC");
                            var fechaInicioRealUTC = DataHelper.GetDate(dr, "FechaInicioRealUTC");
                            var fechaFinRealUTC = DataHelper.GetDate(dr, "FechaFinRealUTC");
                            var itemTipoOrden = DataHelper.GetString(dr, "TipoOrden");

                            todasOrdenes.Add(new Orden()
                            {
                                id = idOrden,
                                pk = Convert.ToInt32(dr["Pk"]),
                                descripcion = DataHelper.GetString(dr, "Descripcion"),
                                estadoActual = estado,
                                dFecInicioEstimado = fechaInicioEstimadoUTC.ToLocalTime(),
                                dFecFinEstimado = fechaFinEstimadoUTC.ToLocalTime(),
                                dFecInicio = fechaInicioRealUTC.ToLocalTime(),
                                dFecFin = fechaFinRealUTC.ToLocalTime(),
                                equipo = GetNombreEquipoPorTipo(DataHelper.GetString(dr, "Equipo"), itemTipoOrden),
                                tipoOrden = new TipoOrden(itemTipoOrden),
                                material = GetMaterialOrden(idOrden,
                                                                        itemTipoOrden,
                                                                        DataHelper.GetString(dr, "CodMaterial"),
                                                                        DataHelper.GetString(dr, "DesMaterial"),
                                                                        DataHelper.GetString(dr, "UoMMaterial")
                                                                        ),
                                semaforoWO = estado.descripcion.Equals("Producción") ? "Verde" : "Azul",
                                semaforo = DataHelper.GetString(dr, "ColorSemaforo"),
                                cantidad = itemTipoOrden.Equals("FL") ? GetCantidadOrden(idOrden) : float.Parse(DataHelper.GetString(dr, "CantidadMaterial"))
                            });
                        };

                        return todasOrdenes;
                    }
                }

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.GetListaOrdenesProgramaFabricacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Funcion que devuelve la lista de ordenes para el grid de ListaWO
        /// </summary>
        /// returns Lista de ordenes
        public List<Orden> GetListaOrdenes()
        {

            List<Orden> todasOrdenes = new List<Orden>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            try
            {
                Orden orden = new Orden();

                SqlCommand comando = new SqlCommand("[MES_ObtenerOrdenes_FAB]", conexion);
                comando.CommandType = CommandType.StoredProcedure;
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    var idOrden = DataHelper.GetString(dr, "Id");
                    var estado = new EstadoOrden(Convert.ToInt32(dr["IdEstado"]));
                    var fechaInicioEstimadoUTC = DataHelper.GetDate(dr, "FechaInicioEstimadoUTC");
                    var fechaFinEstimadoUTC = DataHelper.GetDate(dr, "FechaFinEstimadoUTC");
                    var fechaInicioRealUTC = DataHelper.GetDate(dr, "FechaInicioRealUTC");
                    var fechaFinRealUTC = DataHelper.GetDate(dr, "FechaFinRealUTC");
                    var itemTipoOrden = DataHelper.GetString(dr, "TipoOrden");
                    var codMaterial = DataHelper.GetString(dr, "CodMaterial");


                    Orden ordenNueva = new Orden()
                    {
                        id = idOrden,
                        pk = Convert.ToInt32(dr["Pk"]),
                        descripcion = DataHelper.GetString(dr, "Descripcion"),
                        estadoActual = estado,
                        dFecInicioEstimado = fechaInicioEstimadoUTC.ToLocalTime(),
                        dFecFinEstimado = fechaFinEstimadoUTC.ToLocalTime(),
                        dFecInicio = fechaInicioRealUTC.ToLocalTime(),
                        dFecFin = fechaFinRealUTC.ToLocalTime(),
                        equipo = GetNombreEquipoPorTipo(DataHelper.GetString(dr, "Equipo"), itemTipoOrden),
                        tipoOrden = new TipoOrden(itemTipoOrden),
                        material = GetMaterialOrden(idOrden,
                                                                itemTipoOrden,
                                                                codMaterial.Contains("Dummy") ? "" : codMaterial,
                                                                codMaterial.Contains("Dummy") ? "" : DataHelper.GetString(dr, "DesMaterial"),
                                                                DataHelper.GetString(dr, "UoMMaterial")
                                                                ),
                        semaforoWO = estado.descripcion.Equals("Producción") ? "Verde" : "Azul",
                        semaforo = DataHelper.GetString(dr, "ColorSemaforo"),
                        cantidad = itemTipoOrden.Equals("FL") ? GetCantidadOrden(idOrden) : float.Parse(DataHelper.GetString(dr, "CantidadMaterial"))
                    };

                    OrderType_BREAD otBread = new OrderType_BREAD();
                    OrderType ot = otBread.Select("", 0, 0, "{ID} ='" + itemTipoOrden + "'").ToList().FirstOrDefault();

                    if (!(ot != null ? !String.IsNullOrEmpty(ot.Description) ? ot.Description : "" : "").Equals("Source&DestinationEquipment"))
                    {
                        ordenNueva.SourceEquipment = new Equipo(-1);
                        ordenNueva.DestinationEquipment = new Equipo(-1);
                    }
                    else
                    {
                        ExecutionEquipment_BREAD executionEquipment = new ExecutionEquipment_BREAD();
                        List<ExecutionEquipment> equipments = executionEquipment.Select("", 0, 0, "{OrderID}='" + ordenNueva.id + "'").ToList();
                        var sourceEquipmentPK = equipments.Find(item => item.Sequence == 1);
                        ordenNueva.SourceEquipment = new Equipo(sourceEquipmentPK != null ? sourceEquipmentPK.BPMEquipmentPK : -1);
                        var destinationEquipmentPK = equipments.Find(item => item.Sequence == 2);
                        ordenNueva.DestinationEquipment = new Equipo(destinationEquipmentPK != null ? destinationEquipmentPK.BPMEquipmentPK : -1);
                    }
                    todasOrdenes.Add(ordenNueva);
                };
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.getListaOrdenes", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.GetListaOrdenes", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return todasOrdenes;
        }

        private float GetCantidadOrden(string ordenId)
        {
            double cantidadFL = 0;
            DAO_Material.GetProduccionMaterial(ordenId).ForEach(delegate (DTO_ConsumoMateriales item) { cantidadFL += item.Cantidad.Value; });
            return float.Parse(cantidadFL.ToString());
        }
        private Material GetMaterialOrden(string ordenId, string tipoOrden, string codMaterial, string descMaterial, string unidadMedida)
        {

            if (tipoOrden.Equals("FL") && descMaterial.ToLower().Contains("dummy"))
            {
                List<DTO_ConsumoMateriales> listProduccionMaterial = DAO_Material.GetProduccionMaterial(ordenId);
                DTO_ConsumoMateriales mainMaterial = listProduccionMaterial.Count > 0 ? listProduccionMaterial.First<DTO_ConsumoMateriales>() : new DTO_ConsumoMateriales();
                var material = new Material(mainMaterial.IdMaterial, mainMaterial.Descripcion_Material)
                {
                    udMedida = unidadMedida
                };
                return material;
            }
            else
            {
                var material = new Material(codMaterial, descMaterial)
                {
                    udMedida = unidadMedida
                };
                return material;
            }
        }

        private string GetNombreEquipoPorTipo(string nombre, string tipo)
        {
            if (!string.IsNullOrEmpty(nombre))
            {
                switch (tipo)
                {
                    case "PR"://PRELLENADO                  
                    case "FE"://FERMENTACION
                    case "WP"://COCCIÓN
                    case "FL"://FILTRACION
                    case "GU"://GUARDA
                        return nombre.Split('.')[3].Trim();
                    case "TR":
                        return nombre.Split('.')[nombre.Split('.').Length - 1];
                }
            }
            return string.Empty;
        }
        /// <summary>
        /// Funcion que devuelve la lista de ordenes para el grid de ListaWO
        /// </summary>
        /// param name="wo" objeto dinamico que incluye todos los parametros del formulario
        /// returns booleano indicando si el proceso ha terminado correctamente o no
        public async Task<ReturnValue> AddWONoPlanificada(dynamic wo)
        {
            try
            {
                string numCoccion = wo.codWo.ToString();
                string material = wo.material.ToString();
                string inicio = wo.inicioEstimado.ToString();
                string cantidad = wo.cantidad.ToString();
                int sourceEquipPK = int.Parse(wo.sourceEquipPK.ToString());
                int destinationEquipPK = int.Parse(wo.destinationEquipPK.ToString());
                string cell = wo.sc.ToString();
                string woType = wo.type.ToString();

                int numeroCoccion = int.Parse(numCoccion);
                DateTime fechaInicio = DateTime.Parse(inicio);
                Double cantidadDouble = double.Parse(cantidad);

                Equipment_BREAD eqBread = new Equipment_BREAD();
                //Equipment equipoCelda = eqBread.Select("", 0, 0, "{Level}='Cell' AND {IsInPlant}='True' AND {Label} like '%SALA%' AND {Label} like '%COCCION%'").FirstOrDefault();
                Equipment equipoCelda = eqBread.Select("", 0, 0, "{Level}='Cell' AND {IsInPlant}='True' AND {Name} = '" + cell + "'").FirstOrDefault();

                string planta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"].Split('.')[1].ToUpper();

                string nombreOrden = string.Format("OM-{0}-FAB-{1}-{2}-{3}", planta.Substring(0, 3), equipoCelda.Name, fechaInicio.Year.ToString().Substring(2, 2), numCoccion.PadLeft(4, '0'));


                Equipment molino = new Equipment();
                if (woType.Equals("WP"))
                    molino = eqBread.Select("", 0, 0, "{ParentPK}=" + equipoCelda.PK + " AND {Label} like 'ENFR%'").FirstOrDefault();
                else
                    molino = eqBread.Select("", 0, 0, "{ParentPK}=" + equipoCelda.PK + " AND {Label} like 'CENTRIFUGADORA%'").FirstOrDefault();

                ReturnValue opcion = await ValidarNumeroWOCoccion(nombreOrden);
                if (opcion.numcode != 0)
                    return opcion;
                else
                {
                    if (opcion.numcode == 0)
                    {
                        OrderConfirmed_DTO _orderConfirmed = new OrderConfirmed_DTO()
                        {
                            IdOrder = nombreOrden,
                            EquipId = molino != null ? molino.ID : string.Empty,
                            SourceEquipPK = sourceEquipPK,
                            DestinationEquipPK = destinationEquipPK,
                            IdMaterial = material,
                            Quantiy = cantidadDouble,
                            UoM = "hl",
                            Date = fechaInicio,
                            Type = woType,
                            Description = wo.description.ToString()
                        };
                        string _urlOrderConfirmed = string.Concat(_urlOrder, "OrderConfirmed");
                        var _ret = await ApiClient.PostAsJsonAsync(_urlOrderConfirmed, _orderConfirmed);
                        opcion = await _ret.Content.ReadAsAsync<ReturnValue>();

                    }
                    return opcion;
                }

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.AddWONoPlanificada", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Funcion que devuelve un boleano que indica si existe el numero de orden
        /// </summary>
        /// param name="wo" objeto dinamico que incluye todos los parametros del formulario
        /// returns booleano indicando si el numero de orden existe
        public async Task<ReturnValue> EvalueNumeroOrden(dynamic wo)
        {
            try
            {
                string numCoccion = wo.codWo.ToString();
                string inicio = wo.inicioEstimado.ToString();
                string cell = wo.sc.ToString();

                if (string.IsNullOrEmpty(inicio))
                    inicio = DateTime.Now.ToString();

                int numeroCoccion = int.Parse(numCoccion);
                DateTime fechaInicio = DateTime.Parse(inicio);

                Equipment_BREAD eqBread = new Equipment_BREAD();

                Equipment equipoCelda = eqBread.Select("", 0, 0, "{Level}='Cell' AND {IsInPlant}='True' AND {Name} = '" + cell + "'").FirstOrDefault();

                string planta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"].Split('.')[1].ToUpper();

                string nombreOrden = string.Format("OM-{0}-FAB-{1}-{2}-{3}", planta.Substring(0, 3), equipoCelda.Name, fechaInicio.Year.ToString().Substring(2, 2), numCoccion.PadLeft(4, '0'));

                ReturnValue opcion = await ValidarNumeroWOCoccion(nombreOrden);
                return opcion;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.AddWONoPlanificada", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        public async Task<ReturnValue> ValidarNumeroWOCoccion(string idWO)
        {
            var _urlExistOrder = string.Concat(_urlOrder, "OrderCreatedExist/", idWO, "/");
            var _ret = await ApiClient.GetAsync(_urlExistOrder);
            return await _ret.Content.ReadAsAsync<ReturnValue>();
        }

        /// <summary>
        /// Metodo que devuelve la informacion de una orden pasada por parametro
        /// </summary>
        /// <param name="idOrden"></param>
        /// <returns></returns>
        internal static Orden GetDetallesOrden(int idOrden)
        {
            try
            {
                Orden infoOrden = new Orden();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerOrden_Fab]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@orden", idOrden);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {

                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                if (row["TIPOORDEN"].ToString().Equals("FE") || row["TIPOORDEN"].ToString().Equals("GU") || row["TIPOORDEN"].ToString().Equals("PR"))
                                {
                                    infoOrden.executionEquipment = row["EQUIPO"].ToString().Split('.')[4].Trim();
                                }

                                infoOrden.pk = idOrden;
                                infoOrden.id = row["CODWO"].ToString();
                                TipoOrden tipoOrden = new TipoOrden(row["TIPOORDEN"].ToString());
                                infoOrden.tipoOrden = tipoOrden;
                                string ppr = row["PPR"].ToString();
                                string planta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
                                if (ppr.Contains(planta.Split('.')[1]))
                                {
                                    //MSM01.COCCION.SC1
                                    using (MESEntities context = new MESEntities())
                                    {
                                        infoOrden.equipo = context.Celda_FAB.AsNoTracking().Where(ma => ma.ID.Contains(ppr)).FirstOrDefault().C_External_IDSloc;
                                    }
                                }
                                else
                                {
                                    if (row["TIPOORDEN"].ToString().Equals("TR"))
                                    {
                                        ExecutionEquipment_BREAD eEqBread = new ExecutionEquipment_BREAD();
                                        infoOrden.equipo = eEqBread.Select("", 0, 0, "{OrderID} ='" + row["CODWO"].ToString() + "' AND {Sequence} = 1").FirstOrDefault().LongName.Split('.')[4];
                                        infoOrden.equipo += " - " + eEqBread.Select("", 0, 0, "{OrderID} ='" + row["CODWO"].ToString() + "' AND {Sequence} = 2").FirstOrDefault().LongName.Split('.')[4];
                                    }

                                    else
                                    {
                                        //F51601_SC1_000
                                        int primeraBarra = ppr.IndexOf('_') + 1;
                                        int ultimaBarra = ppr.LastIndexOf('_');

                                        string salaCoccion = ppr.Substring(primeraBarra, ultimaBarra - primeraBarra);
                                        using (MESEntities context = new MESEntities())
                                        {
                                            infoOrden.equipo = context.Celda_FAB.AsNoTracking().Where(ma => ma.Name.Equals(salaCoccion) && ma.ID.Contains(planta)).FirstOrDefault().C_External_IDSloc;
                                        }
                                    }
                                }
                                EstadoOrden estado = new EstadoOrden(int.Parse(row["idEstado"].ToString()));
                                estado.Recalcular = Convert.ToBoolean(row["Recalcular"].ToString());
                                if (Convert.ToBoolean(row["Recalcular"].ToString()))
                                    estado.color = "N";
                                //infoOrden.equipo = row["EQUIPO"].ToString();

                                Material material = new Material(row["IDMATERIAL"].ToString(), row["MATERIAL"].ToString());
                                material.udMedida = row["UOM"].ToString();
                                infoOrden.material = material;
                                infoOrden.estadoActual = estado;
                                infoOrden.cantidad = float.Parse(row["CANTIDAD"].ToString());
                                infoOrden.dFecInicioEstimado = row["Tiempo_Inicio_Estimado"].ToString().Equals(String.Empty) ? DateTime.MinValue : DateTime.Parse(row["Tiempo_Inicio_Estimado"].ToString());
                                infoOrden.dFecInicio = row["Tiempo_Inicio_Real"].ToString().Equals(String.Empty) ? DateTime.MinValue : DateTime.Parse(row["Tiempo_Inicio_Real"].ToString());
                                infoOrden.dFecFin = row["Tiempo_Fin_Real"].ToString().Equals(String.Empty) ? DateTime.MinValue : DateTime.Parse(row["Tiempo_Fin_Real"].ToString());
                                infoOrden.dFecFinEstimado = row["Tiempo_Fin_Estimado"].ToString().Equals(String.Empty) ? DateTime.MinValue : DateTime.Parse(row["Tiempo_Fin_Estimado"].ToString());
                                infoOrden.loteMES = row["loteMES"].ToString();
                                infoOrden.descripcion = row["Nota"].ToString();
                                infoOrden.cProducida = row["CantidadProducida"].ToString();
                                infoOrden.mSobrante = row["mostoSobrante"].ToString();
                                infoOrden.eficiencia = row["COC006"].ToString();
                                infoOrden.numeroDv = Convert.ToInt32(row["NumeroDv"].ToString());

                            }
                        }
                    }
                }

                return infoOrden;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.GetDetallesOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        private static int ObtenerEstado(List<int> kopMultiAllEstados)
        {
            int result;
            if (kopMultiAllEstados.Any(x => x == (int)TipoEstadosKOP.Inexistente))
                result = (int)TipoEstadosKOP.Inexistente;
            else if (kopMultiAllEstados.All(x => x == (int)TipoEstadosKOP.Bueno))
                result = (int)TipoEstadosKOP.Bueno;
            else
                result = (int)TipoEstadosKOP.Malo;
            return result;
        }

        public async Task<DTO_RespuestaAPI<bool>> CerrarOrden(int idOrden)
        {
            var jsonResult = await _api.GetPostsAsync<dynamic>(string.Concat(_urlOrdenFab, "CerrarOrden?idOrden=", idOrden));

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<bool> ConsolidarDatos(int idOrden)
        {
            var ret = await _api.GetPostsAsync<bool>(string.Concat(_urlOrdenFab, "ConsolidarDatos?idOrden=", idOrden));
            return ret;
        }

        public async Task<bool> ReclasificarOrden(dynamic datos)
        {
            string material = datos.material.ToString();
            string cantidad = datos.cantidad.ToString();
            int pkOrden = int.Parse(datos.orden.ToString());

            double cantidadDouble = double.Parse(cantidad);

            string _urlReclasificarOrden = string.Concat(_urlOrder, "ReclassifyOrder?pkOrden=", pkOrden, "&material=", material, "&cantidadDouble=", cantidadDouble);
            var _ret = await ApiClient.GetAsync(_urlReclasificarOrden);
            ReturnValue ret = await _ret.Content.ReadAsAsync<ReturnValue>();

            if (!ret.succeeded)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "DAO_Orden.ReclasificarOrden", "WEB-FABRICACION", "Sistema");
                return false;
            }
            return true;
        }
        public async Task<bool> CreaFiltracion(dynamic datos)
        {
            string lineaPK = datos.linea.ToString();
            string material = "";
            double cantidadMax = 0;
            double cantidad = 0;
            dynamic[] otrosMateriales = datos.otrosMateriales.ToObject<dynamic[]>();
            int pkLinea = int.Parse(lineaPK);
            List<Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem> otros = new List<Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem>();
            foreach (dynamic otro in otrosMateriales)
            {
                Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem element = new Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem();
                element.DefID = otro.Id_Material;
                element.Quantity = otro.Cantidad_Estimada;
                element.LocationID = otro.Id_Localizacion;
                otros.Add(element);
                cantidad = cantidad + (double)otro.Cantidad_Estimada;
                if (otro.Cantidad_Estimada > cantidadMax)
                {
                    material = otro.Id_Material;
                    cantidadMax = otro.Cantidad_Estimada;
                }
            }

            string urlCrearOrdenFiltracion = string.Concat(_urlOrder, "CreaOrdenFiltracion");
            CreaOrdenFiltracion_DTO _dto = new CreaOrdenFiltracion_DTO()
            {
                PkFilter = pkLinea,
                Quantity = cantidad,
                Material = material,
                OtherMaterials = otros
            };
            var _ret = await ApiClient.PostAsJsonAsync(urlCrearOrdenFiltracion, _dto);
            ReturnValue ret = await _ret.Content.ReadAsAsync<ReturnValue>();

            if (!ret.succeeded)
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "DAO_Orden.CreaFiltracion", "WEB-FABRICACION", "Sistema");

            return ret.succeeded;
        }

        public async Task<bool> UpdateDecanting(UpdateDecanting_DTO wo)
        {
            string url = string.Concat(_urlOrder, "UpdateDecanting");
            var _ret = await ApiClient.PutAsJsonAsync(url, wo);
            return await _ret.Content.ReadAsAsync<bool>();
        }

        public async Task<bool> EditaFiltracion(UpdateFilter_DTO datos)
        {
            string url = string.Concat(_urlOrder, "UpdateFilter");
            var _ret = await ApiClient.PutAsJsonAsync(url, datos);
            return await _ret.Content.ReadAsAsync<bool>();
        }

        public async Task<ReturnValue> EditaWOFab(dynamic datos)
        {
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    if (datos.CambiarFechas == null)
                    {
                        string material = datos.material;
                        int origen = datos.SalaCoccion;
                        var _ubicacion = context.vMaestroUbicaciones.Where(u => u.IdUbicacion == origen).FirstOrDefault();

                        var valoref = context.MaestroKOPs_Mostos_Ubicacion.Where(x => x.IdMosto == material && x.IdZona == _ubicacion.IdZona);

                        string valorhora = valoref.FirstOrDefault(x => x.MaestroKOPs.CodKOP == "COC003").ValorDefecto;
                        double horaduracion = float.Parse(valorhora, new CultureInfo("en-GB"));
                        string valorIni = valoref.FirstOrDefault(x => x.MaestroKOPs.CodKOP == "COC208").ValorDefecto;
                        double horaInintemp = float.Parse(valorIni, new CultureInfo("en-GB"));

                        var tempDestino = (string)datos.destinationEquipment;
                        int? destino;
                        if (tempDestino != "")
                            destino = int.Parse(tempDestino);
                        else
                            destino = null;

                        //int? _destino = int.Parse(String.IsNullOrEmpty(destino)? null : destino );

                        string idorden = datos.idOrden.ToString();
                        var item = context.WOPlanificadas.Where(x => x.IdWOPlanificada.ToString() == idorden).FirstOrDefault();
                        item.IdMaterial = datos.material;
                        item.CantidadPlan = decimal.Parse(datos.cantidad.ToString());
                        item.IdUbicacionDestino = destino;
                        item.FechaInicioPlan = DateTime.Parse(datos.fecha.ToString()).ToUniversalTime();
                        item.FechaFinPlan = ((DateTime)item.FechaInicioPlan).ToUniversalTime().AddHours(horaduracion);

                        var ConfirmacionActualizarHoras = datos.ConfirmacionActualizarHoras;
                        var EsDisponile = ValidarDisponibilidadHoras(item, horaInintemp);

                        if (!EsDisponile)
                        {
                            if (ConfirmacionActualizarHoras != null)
                                ReordenarHorasWO(item, context);
                            else
                                return new ReturnValue(false, null, "No_Horas_Disp");
                        }

                        await context.SaveChangesAsync();
                        return new ReturnValue(true);

                    }
                    else
                        return IntercambioHorasWO(datos, context);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.EditaWOFab", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        private ReturnValue IntercambioHorasWO(dynamic datos, MESFabEntities context)
        {
            string IdOri = datos.IdOri;
            string IdDes = datos.IdDes;
            int IdUbicacion = datos.IdZona;

            var itemOrig = context.WOPlanificadas.Where(x => x.IdWOPlanificada.ToString() == IdOri).FirstOrDefault();
            var itemDest = context.WOPlanificadas.Where(x => x.IdWOPlanificada.ToString() == IdDes).FirstOrDefault();

            itemOrig.FechaInicioPlan = itemDest.FechaInicioPlan;
            itemOrig.FechaFinPlan = itemDest.FechaFinPlan;

            itemDest.FechaInicioPlan = itemDest.FechaInicioPlan.Value.AddMinutes(1);
            itemDest.FechaFinPlan = itemDest.FechaFinPlan.Value.AddMinutes(1);

            context.SaveChanges();

            ActualizarHoras(IdUbicacion, Convert.ToBoolean(TipoEstadoProceso.NoProcesado), (int)TipoWO.Coccion);
            return new ReturnValue(true);
        }

        private ReturnValue ReordenarHorasWO(WOPlanificadas item, MESFabEntities context)
        {
            var DuplicadoHora = context.WOPlanificadas.Where(x => x.IdWOPlanificada != item.IdWOPlanificada).Where(x => x.IdUbicacionOrigen == item.IdUbicacionOrigen
                                                                                                  && x.IdTipoWO == item.IdTipoWO
                                                                                                  && x.FechaInicioPlan == item.FechaInicioPlan
                                                                                                  && x.Procesado != true).FirstOrDefault();
            if (DuplicadoHora != null)
                DuplicadoHora.FechaInicioPlan = DuplicadoHora.FechaInicioPlan.Value.AddMinutes(1);

            context.SaveChanges();

            ActualizarHoras(item.IdUbicacionOrigen, Convert.ToBoolean(TipoEstadoProceso.NoProcesado), (int)TipoWO.Coccion);
            return new ReturnValue(true);
        }

        public async Task<bool> EliminarFiltracion(dynamic datos)
        {
            try
            {
                string idOrden = datos.idOrden.ToString();

                using (MESFabEntities context = new MESFabEntities())
                {
                    var orden = context.WOPlanificadas.Where(x => x.IdWOPlanificada.ToString() == idOrden).FirstOrDefault();
                    if (orden == null) return false;
                    context.WOPlanificadas.Remove(orden);
                    await context.SaveChangesAsync();
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Orden.EliminarFiltracion", IdiomaController.GetResourceName("ORDEN_ELIMINADA_CORRECTAMENTE") + 
                    ". IdWOPlanificada: " + idOrden, HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.EliminarFiltracion", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                throw new Exception(ex.Message);
            }
        }

        public async Task<int> ObtenerSiguienteNumeroCoccion(int anyo, String text)
        {
            string url = string.Concat(_urlOrder, "ValidateBakeNumber?anio=", anyo, "&text=", text);
            var _ret = await ApiClient.GetAsync(url);
            var nombre = await _ret.Content.ReadAsAsync<string>();
            return int.Parse(nombre.Substring(nombre.Length - 4, 4));
        }

        public async Task<ReturnValue> ArrancarOrden(dynamic datos)
        {


            int pkOrden = datos.pk;
            DateTime fecha = datos.inicio;
            ReturnValue ret = new ReturnValue();
            Order_BREAD oBread = new Order_BREAD();
            Order orden = oBread.SelectByPK(pkOrden).FirstOrDefault();

            Entry_BREAD eBread = new Entry_BREAD();
            Entry mainEntry = eBread.SelectByOrderPk(pkOrden, "", 0, 0, "{Sequence}=1").FirstOrDefault();

            if (orden.TypeID.Equals("TR"))
            {
                ExecutionEquipment_BREAD eeBread = new ExecutionEquipment_BREAD();
                Lot_BREAD lotBread = new Lot_BREAD();
                ExecutionEquipment locEjecuccionOrden = new ExecutionEquipment();
                locEjecuccionOrden = eeBread.Select("", 0, 0, "{OrderID} = '" + orden.ID + "' AND {Sequence} = 1").FirstOrDefault();
                if (lotBread.Select("", 0, 0, "{LocationPath} = '" + locEjecuccionOrden.LongName + "'").FirstOrDefault() == null)
                {
                    ret.succeeded = false;
                    ret.numcode = -11111;
                    ret.message = "No se puede arrancar la WO de trasiego porque no existe un lote de fermentación en el origen seleccionado";
                    return ret;
                }
            }

            if (orden.TypeID.Equals("FL"))
            {
                Collection<Entry> entryEjecutandose = eBread.Select("", 0, 0, "{ExecutionEquipmentID}='" + mainEntry.ExecutionEquipmentID + "' AND {StatusID} IN ('Ready','Running')");

                foreach (Entry proc in entryEjecutandose)
                {
                    Order ordenFab = oBread.SelectByPK(proc.OrderPK).FirstOrDefault();

                    if (ordenFab.StatusID.Equals("In Progress"))
                    {
                        return new ReturnValue(false, -1, "Ese filtro ya esta actualmente en uso");
                    }
                }
            }

            //Se ajusta el numero de la secuencia al nombre 
            if (orden.TypeID.Equals("WP"))
                mainEntry = eBread.SelectByOrderPk(pkOrden, "", 0, 0, " {ProductSegmentID} = 'Remolino'").FirstOrDefault();

            string url = string.Concat(_urlOrder, "StartOrder");
            StartOrder_DTO _data = new StartOrder_DTO()
            {
                IdOrder = orden.ID,
                Date = fecha.ToLocalTime(),
                Equipment = mainEntry.ExecutionEquipmentID,
                Material = orden.FinalMaterialID
            };
            var _ret = await ApiClient.PostAsJsonAsync(url, _data);
            if (_ret.IsSuccessStatusCode)
            {
                ret = await _ret.Content.ReadAsAsync<ReturnValue>();
            }

            return ret;
        }

        internal static List<OrderType> ObtenerTiposOrdenCurvas()
        {
            OrderType_BREAD obread = new OrderType_BREAD();
            List<OrderType> listaSit = obread.Select("", 0, 0, "").ToList();

            return listaSit;
        }

        internal static async Task<object> CurrentBrewNumber(ISitRTDS _sitRTDS)
        {
            //String kop = DAO_KOP.GetKopName("{Name} like '%BREW_NUMBER' and {PPRName} like '%COCCION%' and {PSName}='Molienda'");
            List<string> filterList = new List<string>
            {
                "SC1_TOTAL_BREWS"
            };
            RTDSValuesDto filter = new RTDSValuesDto() { Tags = filterList, Unit = "RTDS" };
            var weight = new object();
            try
            {
                weight = await _sitRTDS.readRTDS(filter);
            }
            catch (Exception e)
            {
                return new List<object>();
            }
            return weight;
        }

        public async Task<String> GetOrderIDByDeltav(int anyo, String text, ISitRTDS _sitRTDS)
        {
            //Se actualiza el currentBrewNumber = 0 
            string url = string.Concat(_urlOrder, "ValidateBakeNumber?anio=", anyo, "&text=", text, "&currentBrewNumber=0");
            var _ret = await ApiClient.GetAsync(url);
            string OrderID = await _ret.Content.ReadAsAsync<string>();

            return int.Parse(OrderID.Split('-')[OrderID.Split('-').Length - 1]).ToString();
        }

        public async Task<SitOrder> SelectOrderById(string Id)
        {
            string _urlOrderById = string.Concat(_urlOrder, "OrderById/", Id, "/");
            var _ret = await ApiClient.GetAsync(_urlOrderById);
            if (_ret.IsSuccessStatusCode)
            {
                return await _ret.Content.ReadAsAsync<SitOrder>();
            }
            return null;
        }

        public async Task<string> LotNameByOrder(SitOrder Order)
        {

            string _urlLotName = string.Concat(_urlLot, "LotNameByOrder");
            var _ret = await ApiClient.PostAsJsonAsync(_urlLotName, Order);
            if (_ret.IsSuccessStatusCode)
            {
                return await _ret.Content.ReadAsAsync<string>();
            }
            return null;
        }

        public async Task<ReturnValue> CerrarLote(string LotId, string Equipment, string Date)
        {
            string _url = string.Concat(_urlLot, "CloseLot?LotId=", LotId, "&Equipment=", Equipment, "&Date=", Date);
            var _ret = await ApiClient.GetAsync(_url);
            return await _ret.Content.ReadAsAsync<ReturnValue>();
        }

        public async Task<ReturnValue> CrearOrdenPlanificado(dynamic item)
        {
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    string material = item.material;
                    int origen = item.sourceEquipPK;
                    var tempDestino = (string)item.destinationEquipPK.Value;
                    int? destino;
                    if (tempDestino != "")
                        destino = int.Parse(tempDestino);
                    else
                        destino = null;
                    var idZona = context.vMaestroUbicaciones.Where(x => x.IdUbicacion == origen).FirstOrDefault().IdZona;
                    var valoref = context.MaestroKOPs_Mostos_Ubicacion.Where(x => x.IdMosto == material && x.IdZona == idZona);
                    string valorhora = valoref.FirstOrDefault(x => x.MaestroKOPs.CodKOP == "COC003").ValorDefecto;
                    double horaduracion = float.Parse(valorhora, new CultureInfo("en-GB"));
                    string valorIni = valoref.FirstOrDefault(x => x.MaestroKOPs.CodKOP == "COC208").ValorDefecto;
                    double horaInintemp = float.Parse(valorIni, new CultureInfo("en-GB"));

                    var newItem = new WOPlanificadas()
                    {
                        IdMaterial = item.material,
                        CantidadPlan = item.cantidad,
                        IdUbicacionOrigen = item.sourceEquipPK,
                        IdUbicacionDestino = destino,
                        FechaInicioPlan = item.inicioEstimado != null ? Convert.ToDateTime(item.inicioEstimado.Value).ToUniversalTime() : null,
                        FechaFinPlan = item.inicioEstimado != null ? Convert.ToDateTime(item.inicioEstimado.Value).AddHours(horaduracion).ToUniversalTime() : null,
                        Procesado = Convert.ToBoolean(TipoEstadoProceso.NoProcesado),
                        IdTipoWO = Convert.ToInt32(TipoWO.Coccion)
                    };

                    var ConfirmacionActualizarHoras = item.ConfirmacionActualizarHoras;
                    var EsDisponile = ValidarDisponibilidadHoras(newItem, horaInintemp);
                    bool actualizar = false;
                    if (!EsDisponile)
                    {
                        if (ConfirmacionActualizarHoras != null)
                        {
                            var DuplicadoHora = context.WOPlanificadas.Where(x => x.IdUbicacionOrigen == newItem.IdUbicacionOrigen
                                                                                  && x.IdTipoWO == newItem.IdTipoWO
                                                                                  && x.FechaInicioPlan == newItem.FechaInicioPlan).FirstOrDefault();
                            if (DuplicadoHora != null)
                            {
                                DuplicadoHora.FechaInicioPlan = DuplicadoHora.FechaInicioPlan.Value.AddMinutes(1);
                            }
                            actualizar = true;
                        }
                        else
                        {
                            return new ReturnValue(false, null, "No_Horas_Disp");
                        }

                    }
                    context.WOPlanificadas.Add(newItem);
                    await context.SaveChangesAsync();

                    if (actualizar)
                    {
                        ActualizarHoras(origen, Convert.ToBoolean(TipoEstadoProceso.NoProcesado), Convert.ToInt32(TipoWO.Coccion));
                    }
                    return new ReturnValue(true);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.CrearOrdenPlanificado", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        public void ActualizarHoras(int IdUbicacion, bool Procesado, int IdTipoOrden)
        {
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    context.spReplanificarWOCoccion(IdUbicacion, Procesado, IdTipoOrden);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ActualizarHoras", "WEB-WO-FAB", "Sistema");
            }
        }

        public bool ValidarDisponibilidadHoras(WOPlanificadas obj, double horaInintemp)
        {
            using (MESFabEntities context = new MESFabEntities())
            {
                var result = true;
                List<WOPlanificadas> lstOrd = context.WOPlanificadas.AsNoTracking().Where(x => x.IdWOPlanificada != obj.IdWOPlanificada
                                                                                && x.IdUbicacionOrigen == obj.IdUbicacionOrigen
                                                                                && x.IdTipoWO == obj.IdTipoWO
                                                                                && x.Procesado != true).ToList();

                var bdObj = context.WOPlanificadas.AsNoTracking().Where(x => x.IdWOPlanificada == obj.IdWOPlanificada && x.IdUbicacionOrigen == obj.IdUbicacionOrigen).FirstOrDefault();

                if (bdObj != null && Convert.ToDateTime(bdObj.FechaInicioPlan) == Convert.ToDateTime(obj.FechaInicioPlan).ToUniversalTime())
                {
                    return true;
                }

                lstOrd.ForEach(x =>
                {
                    if ((x.FechaInicioPlan <= obj.FechaInicioPlan && obj.FechaInicioPlan <= x.FechaInicioPlan.Value.AddHours(horaInintemp)) ||
                        (x.FechaInicioPlan <= obj.FechaInicioPlan.Value.AddHours(horaInintemp) && obj.FechaInicioPlan.Value.AddHours(horaInintemp) <= x.FechaInicioPlan.Value.AddHours(horaInintemp)))
                    {
                        result = false;
                    }
                });

                return result;
            }
        }

        public List<dynamic> GetAllOrdenPlanificada(int idTipo)
        {
            List<vMaestroUbicaciones> listUbicaciones;
            List<WOPlanificadas> listEdited;
            List<MaestroKOPs_Mostos_Ubicacion> lista;
            List<dynamic> listComboMaterial;

            using (MESFabEntities context = new MESFabEntities())
            {
                listEdited = context.WOPlanificadas.AsNoTracking().Where(z => z.Procesado != true && z.IdTipoWO == (int)TipoWO.Coccion).ToList();
                listUbicaciones = context.vMaestroUbicaciones.AsNoTracking().ToList();
                lista = context.MaestroKOPs_Mostos_Ubicacion.AsNoTracking().Where(x => x.MaestroKOPs.IdTipoSubproceso == (int)TipoWO.Coccion).Distinct().ToList();
                listComboMaterial = context.vMaestroMateriales.AsNoTracking().ToList().Join(lista, x => x.IdMaterial, y => y.IdMosto, (x, y) => (dynamic)new { x.IdMaterial, x.Descripcion, x.UdMedida }).Distinct().ToList();
            }

            var listDestino = listUbicaciones.Where(x => x.IdTipoZona == (int)TipoZona.SalaFermentacionBodega);
            var listOrigen = listUbicaciones.Where(x => x.IdTipoZona == (int)TipoZona.SalaCoccion);

            var result = listEdited.GroupBy(x => x.IdUbicacionOrigen, (key, g) => g.OrderBy(e => e.FechaInicioPlan).First());

            var listaresult = listEdited.Select(y =>
            {
                var idMaterial = listComboMaterial.Where(w => w.IdMaterial == y.IdMaterial).FirstOrDefault()?.IdMaterial;
                var descMaterial = listComboMaterial.Where(w => w.IdMaterial == y.IdMaterial).FirstOrDefault()?.Descripcion;
                var iddUbicacionOrigen = listOrigen.Where(w => w.IdUbicacion == y.IdUbicacionOrigen).FirstOrDefault()?.IdUbicacion;
                var codUbicacionOrigen = listOrigen.Where(w => w.IdUbicacion == y.IdUbicacionOrigen).FirstOrDefault()?.CodUbicacion;
                var descUbicacionOrigen = listOrigen.Where(w => w.IdUbicacion == y.IdUbicacionOrigen).FirstOrDefault()?.DescZona;
                var idUbicacionDestino = listDestino.Where(w => w.IdUbicacion == y.IdUbicacionDestino).FirstOrDefault()?.CodUbicacion;
                var descDestino = listDestino.Where(w => w.IdUbicacion == y.IdUbicacionDestino).FirstOrDefault()?.DescUbicacion;
                var unidadMedida = listComboMaterial.Where(w => w.IdMaterial == y.IdMaterial).FirstOrDefault()?.UdMedida;
                
                return (dynamic)new
                {
                    CodMaterialDescripcion = !string.IsNullOrEmpty(idMaterial) ? idMaterial + " - " + descMaterial : "",
                    IdUbicacionDescripcionDestino = !string.IsNullOrEmpty(idUbicacionDestino) ? idUbicacionDestino + " - " + descDestino : "",
                    Id = y.IdWOPlanificada,
                    InicioPlanificado = Convert.ToDateTime(y.FechaInicioPlan).ToLocalTime(),
                    FinPlanificado = Convert.ToDateTime(y.FechaFinPlan).ToLocalTime(),
                    Cantidad = y.CantidadPlan,
                    NotasWO = y.NotasWO,
                    CodOrigen = codUbicacionOrigen,
                    IdOrigen = iddUbicacionOrigen,
                    Origen = descUbicacionOrigen,
                    CodDestino = idUbicacionDestino,
                    Destino = descDestino,
                    IdMaterial = idMaterial,
                    Descripcion = descMaterial,
                    UdMedida = unidadMedida,
                };

            }).ToList();

            return listaresult;
        }

        public OrdenPlanificado GetOrdenPlanificadadByID(int id)
        {
            using (MESEntities context = new MESEntities())
            {
                return context.OrdenPlanificado.AsNoTracking().Where(x => x.Id == id).FirstOrDefault();
            }
        }

        public async Task<bool> ActualizarOrdenPlanificadaArrancada(string id, string nroOrden)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    OrdenPlanificado item = context.OrdenPlanificado.Where(x => x.Id.ToString() == id).FirstOrDefault();
                    item.CodigoOrden = nroOrden;
                    item.Arrancado = true;

                    await context.SaveChangesAsync();
                    return true;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ActualizarOrdemPlanificada", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        public async Task<ReturnValue> ArrancarCrearOrden(dynamic item)
        {
            try
            {
                //crear la orden y genera el nro de orden
                var objResCreacion = await CrearOrdenFabricacionToAPI(item);
                var objArranca = new
                {
                    inicio = item.InicioPlanificado,
                    pk = objResCreacion.PK,
                };

                //Se ejecuta el arranque
                var resultArranque = await ArrancarOrden(objArranca);

                OrdenPlanificado objOrden = objResCreacion.objOrd;

                if (resultArranque.succeeded)
                {
                    var dataInput = new
                    {
                        orderID = objResCreacion.numCoccion,
                        material = objOrden.Material,
                        cantidad = objOrden.Cantidad,
                        unidCant = "HL",
                        fecha = objOrden.InicioPlanificado,
                        tipoOrden = objOrden.TipoOrden
                    };
                    //Se registra en el registro de eventos
                    InsertarRegistro(dataInput);

                    string BDORdenID = item.Id;

                    //Se actualiza la BD local
                    await ActualizarOrdenPlanificadaArrancada(BDORdenID, objResCreacion.nroOrden);

                    return new ReturnValue(true);
                }
                else
                {
                    return resultArranque;
                }

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ArrancarCrearOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        private void InsertarRegistro(dynamic item)
        {
            string fabrica = System.Configuration.ConfigurationManager.AppSettings["PlantaNombre"];
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand comando = new SqlCommand("[MES_Insertar_Registro_OLTP]", connection))
                {
                    comando.Parameters.Add(new SqlParameter("@orderID", item.orderID));
                    comando.Parameters.Add(new SqlParameter("@material", item.material));
                    comando.Parameters.Add(new SqlParameter("@cantidad", item.cantidad));
                    comando.Parameters.Add(new SqlParameter("@unidCant", item.unidCant));
                    comando.Parameters.Add(new SqlParameter("@fecha", item.fecha));
                    comando.Parameters.Add(new SqlParameter("@tipoOrden", item.tipoOrden));
                    comando.Parameters.Add(new SqlParameter("@fabrica", fabrica));
                    comando.CommandType = CommandType.StoredProcedure;
                    connection.Open();
                    comando.ExecuteNonQuery();
                }
            }

        }

        public async Task<dynamic> CrearOrdenFabricacionToAPI(dynamic item)
        {
            try
            {

                int anyoCoccion = DateTime.UtcNow.Year;

                int numCoccion = await ObtenerSiguienteNumeroCoccion(anyoCoccion, "FAB-" + item.Origen);

                OrdenPlanificado objBDORden = GetOrdenPlanificadadByID((int)item.Id);

                dynamic wo = new
                {
                    codWo = numCoccion,
                    material = objBDORden.Material,
                    inicioEstimado = item.InicioPlanificado,
                    cantidad = item.Cantidad,
                    sourceEquipPK = objBDORden.Origen,
                    destinationEquipPK = objBDORden.Destino,
                    sc = item.Origen,
                    type = objBDORden.TipoOrden,
                    description = item.Nota
                };
                ReturnValue ejecucionCorrect = await AddWONoPlanificada(wo);

                if (!ejecucionCorrect.succeeded)
                {
                    if (ejecucionCorrect.numcode != 11)
                        throw new Exception(IdiomaController.GetResourceName("ORDEN_COCCION_EXISTENTE"));
                    else
                        throw new Exception(IdiomaController.GetResourceName("HEALTHCHECK"));
                }
                else
                {
                    var nroOrden = RegistroLogCreacion(wo, numCoccion);
                    Order_BREAD oBread = new Order_BREAD();
                    Order orden = ((Collection<Order>)oBread.Select("", 0, 0, "{LifeCycleID} = 'OM' and {ID} = '" + nroOrden + "'")).FirstOrDefault();

                    return new
                    {
                        nroOrden = nroOrden,
                        PK = orden.PK,
                        numCoccion = numCoccion,
                        objOrd = objBDORden
                    };
                }

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.CrearOrdenFabricacionToAPI", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }


        }

        public string RegistroLogCreacion(dynamic item, int numCoccion)
        {
            string user = HttpContext.Current.User.Identity.Name;
            string inicio = item.inicioEstimado.ToString();
            string cell = item.sc.ToString();

            int numeroCoccion = numCoccion;
            DateTime fechaInicio = DateTime.Parse(inicio);
            Siemens.SimaticIT.BPM.Breads.Equipment_BREAD eqBread = new Siemens.SimaticIT.BPM.Breads.Equipment_BREAD();

            Siemens.SimaticIT.BPM.Breads.Types.Equipment equipoCelda = eqBread.Select("", 0, 0, "{Level}='Cell' AND {IsInPlant}='True' AND {Name} = '" + cell + "'").FirstOrDefault();
            string planta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"].Split('.')[1].ToUpper();
            string nombreOrden = string.Format("OM-{0}-FAB-{1}-{2}-{3}", planta.Substring(0, 3), equipoCelda.Name, fechaInicio.Year.ToString().Substring(2, 2), numCoccion.ToString().PadLeft(4, '0'));
            DAO_Log.RegistrarLogBook("WEB-BACKEND", 3, 2, IdiomaController.GetResourceName("ORDEN_PREP_CREADA_CORRECTAMENTE") + " " + nombreOrden, "OrdenesFabController.AddOrdenFabricacion", "WEB-FABRICACION", user);
            return nombreOrden;
        }

        public async Task<ReturnValue> CrearOrdenesPlanificadaMultiple(dynamic item)
        {
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    string material = item.material;
                    int origen = item.origen;
                    int tipo = item.tipo;
                    var _ubicacion = context.vMaestroUbicaciones.Where(u => u.IdUbicacion == origen).FirstOrDefault();
                    var idZona = context.vMaestroUbicaciones.Where(x => x.IdUbicacion == origen).FirstOrDefault().IdZona;
                    var valoref = context.MaestroKOPs_Mostos_Ubicacion.Where(x => x.IdMosto == material && x.IdZona == _ubicacion.IdZona);
                    string valorhora = valoref.FirstOrDefault(x => x.MaestroKOPs.CodKOP == "COC003").ValorDefecto;
                    double horaduracion = float.Parse(valorhora, new CultureInfo("en-GB"));
                    var finPlanificado = DateTime.Parse(item.inicioPlanificado.Value).AddHours(horaduracion);
                    double cantidadMaterial = item.cantidad == null ? ObtenerCantidadPorMaterialUbicacion(material, origen) : item.cantidad;
                    int? destino = !string.IsNullOrEmpty(item.destino.Value) ? item.destino : null;
                    var nroOrdCrear = item.cantOrdenes.Value;
                    bool procesado = Convert.ToBoolean(TipoEstadoProceso.NoProcesado);

                    for (int i = 0; i < nroOrdCrear; i++)
                    {
                        var item_param = new WOPlanificadas()
                        {
                            IdUbicacionOrigen = origen,
                            IdMaterial = material,
                            FechaInicioPlan = item.inicioPlanificado != null ? Convert.ToDateTime(item.inicioPlanificado.Value).ToUniversalTime() : null,
                            FechaFinPlan = item.inicioPlanificado != null ? Convert.ToDateTime(item.inicioPlanificado.Value).AddHours(horaduracion).ToUniversalTime() : null,
                            CantidadPlan = (decimal)cantidadMaterial,
                            IdTipoWO = tipo,
                            IdUbicacionDestino = destino,
                            Procesado = procesado

                        };
                        context.WOPlanificadas.Add(item_param);

                    }

                    await context.SaveChangesAsync();
                    ActualizarHoras(origen, procesado, tipo);
                    return new ReturnValue(true);
                }
            }
            catch (Exception ret)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.Message, "DAO_Orden.CrearOrdenesPlanificadaMultiple", "WEB-FABRICACION", "Sistema");
                throw new Exception(ret.Message);
            }
        }

        public async Task<DateTime?> ObtenerUltimaFechaOrden(int idUbicacion)
        {
            using (MESFabEntities context = new MESFabEntities())
            {
                bool procesado = Convert.ToBoolean(TipoEstadoProceso.NoProcesado);
                var _ubicaciones = context.vMaestroUbicaciones.AsNoTracking().Where(u => u.IdTipoZona == (int)TipoZona.SalaCoccion);
                var _fechaIniMax = context.WOPlanificadas.AsNoTracking().Where(f => f.IdTipoWO == (int)TipoWO.Coccion && f.Procesado == procesado && f.IdUbicacionOrigen == idUbicacion).Max(f => f.FechaInicioPlan);
                var _ordenPlanificada = context.WOPlanificadas.AsNoTracking().Where(z => z.Procesado == procesado && z.IdTipoWO == (int)TipoWO.Coccion && z.FechaInicioPlan == _fechaIniMax)
                                    .Join(_ubicaciones, woPlan => woPlan.IdUbicacionOrigen,
                                    Ubicacion => Ubicacion.IdUbicacion, (ubicacion, woPlan) => new { woPlan.IdZona, ubicacion.IdMaterial, ubicacion.FechaInicioPlan }).FirstOrDefault();

                if (_ordenPlanificada == null) return null;

                var listOrigen = DAO_Equipo.ObtenerSalasCoccion();

                string valorIni = context.MaestroKOPs_Mostos_Ubicacion.AsNoTracking().FirstOrDefault(x => x.IdMosto == _ordenPlanificada.IdMaterial
                                                                                           && x.IdZona == _ordenPlanificada.IdZona
                                                                                           && x.MaestroKOPs.CodKOP == "COC208")?.ValorDefecto;
                double horaInintemp = float.Parse(valorIni, new CultureInfo("en-GB"));

                return _ordenPlanificada.FechaInicioPlan.Value.AddHours(horaInintemp).ToLocalTime();
            }
        }

        public ReturnValue SetNoteWOFinalizadas(string _orderID, string _note)
        {
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    var order = context.WOs.First(x => x.IdWO.ToString() == _orderID);
                    if (_note.Length == 0)
                        order.NotasWO = null;
                    else
                        order.NotasWO = _note;

                    context.SaveChanges();
                    return new ReturnValue(true);
                }
            }
            catch (Exception ex)
            {
                string mensajeError = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, mensajeError + " -> " + ex.StackTrace, "DAO_Orden.SetNoteWOFinalizadas", "WEB-WO-FAB", "Sistema");
                return new ReturnValue(false, -1, ex.Message);
            }
        }

        internal static Double ObtenerCantidadPorMaterialUbicacion(string materialID, int idUbicacion)
        {
            using (MESFabEntities context = new MESFabEntities())
            {
                var _ubicaciones = context.vMaestroUbicaciones.AsNoTracking().Where(u => u.IdUbicacion == idUbicacion).FirstOrDefault();
                var valor = context.MaestroKOPs_Mostos_Ubicacion.AsNoTracking().FirstOrDefault(x => x.MaestroKOPs.CodKOP == "COC002"
                                                                                     && x.IdZona == _ubicaciones.IdZona
                                                                                     && x.IdMosto.ToString() == materialID)?.ValorDefecto;
                
                return string.IsNullOrEmpty(valor) ? 0 : Convert.ToDouble(valor, new CultureInfo("en-GB"));
            }
        }

        public async Task<DTO_Orden_Detalle> ObtenerDetalleOrden(int idOrden, int IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<DTO_Orden_Detalle>(string.Concat(_urlOrdenFab, "ObtenerDetalleOrden?idOrden=", idOrden, "&IdTipoOrden=", IdTipoOrden));
            return ret;
        }

        public async Task<List<DTO_KOPs>> ObtenerKOPsOrden(int idOrden, int IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<DTO_KOPs>>(string.Concat(_urlOrdenFab, "ObtenerKOPsOrden?idOrden=", idOrden, "&IdTipoOrden=", IdTipoOrden));
            return ret;
        }
        public async Task<DTO_RespuestaAPI<List<DTO_KOPs>>> ObtenerKOPsWORevision(DateTime fechaDesde, DateTime fechaHasta)
        {
            var url = string.Concat(
                _urlKOPFab,
                "ObtenerKOPsWORevision?fechaDesde=", Uri.EscapeDataString(fechaDesde.ToString("yyyy-MM-dd HH:mm:ss")),
                "&fechaHasta=", Uri.EscapeDataString(fechaHasta.ToString("yyyy-MM-dd HH:mm:ss"))
            );
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_KOPs>>>(url);
            return ret;
        }
        
        public async Task<List<DTO_Orden>> ObtenerListadoOrdenes(int IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<DTO_Orden>>(string.Concat(_urlOrdenFab, "ObtenerListadoOrdenes?IdTipoOrden=", IdTipoOrden));
            return ret;
        }

        public async Task<List<DTO_Orden>> ObtenerListadoOrdenesCerradas(string fechaDesde, string fechaHasta)
        {
            var ret = await _api.GetPostsAsync<List<DTO_Orden>>(string.Concat(_urlOrdenFab, "ObtenerListadoOrdenesCerradas?fechaDesde=", fechaDesde, "&fechaHasta=", fechaHasta));
            return ret;
        }

        public async Task<int> ValidarNumeroCreacionOrdenManual(int NumeroOrden, int Anio, int IdUbicacion, int idTipoOrden)
        {

            var ret = await _api.GetPostsAsync<int>(string.Concat(_urlOrdenFab, "ValidarNumeroCreacionOrdenManual?NumeroOrden=", NumeroOrden, "&Anio=", Anio, "&IdUbicacion=", IdUbicacion, "&idTipoOrden=", idTipoOrden));
            return ret;
        }

        public async Task<bool> CrearOrdenManual(dynamic Datos)
        {

            var ret = await _api.PostPostsAsync<dynamic>(Datos, string.Concat(_urlOrdenFab, "CrearOrdenManual"));
            return ret;
        }

        public async Task<List<DTO_Orden_Planificada>> ObtenerListadoOrdenPlanificada(int IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<DTO_Orden_Planificada>>(string.Concat(_urlOrdenFab, "ObtenerListadoOrdenPlanificada?IdTipoOrden=", IdTipoOrden));
            return ret;
        }

        public async Task<bool> CrearOrdenPlanificada(dynamic OrdenPlanificada)
        {
            var ret = await _api.PostPostsAsync<dynamic>(OrdenPlanificada, string.Concat(_urlOrdenFab, "CrearOrdenPlanificadaTrasiego"));
            return ret;
        }

        public async Task<bool> EditarOrdenPlanificada(dynamic OrdenPlanificada)
        {
            var ret = await _api.PutPostsAsync<dynamic>(string.Concat(_urlOrdenFab, "EditarOrdenPlanificadaTrasiego"), OrdenPlanificada);
            return ret;
        }

        public async Task<List<DTO_Orden_Planificada_Parametro>> ObtenerListadoParametrosOrden()
        {
            var ret = await _api.GetPostsAsync<List<DTO_Orden_Planificada_Parametro>>(string.Concat(_urlOrdenFab, "ObtenerListadoParametrosOrden"));
            return ret;
        }

        public async Task<bool> EditarParametroOrdenPlanificada(dynamic ParametroOrdenPlanificada)
        {
            var ret = await _api.PutPostsAsync<dynamic>(string.Concat(_urlOrdenFab, "EditarParametroOrdenPlanificada"), ParametroOrdenPlanificada);
            return ret;
        }

        public async Task<bool> ValidarFechaNuevaOrdenPlanificada(int IdTipoOrden, int IdSala, string FechaInicio)
        {
            var ret = await _api.GetPostsAsync<dynamic>(string.Concat(_urlOrdenFab, "ValidarFechaNuevaOrdenPlanificada?FechaInicio=", FechaInicio, "&IdSala=", IdSala, "&IdTipoOrden=", IdTipoOrden));
            return ret;
        }

        public async Task<bool> ValidarFechaNuevaOrdenPlanificadaPorIdOrden(int IdTipoOrden, int IdSala, string FechaInicio, int IdOrden)
        {
            var ret = await _api.GetPostsAsync<dynamic>(string.Concat(_urlOrdenFab, "ValidarFechaNuevaOrdenPlanificadaPorIdOrden?FechaInicio=", FechaInicio, "&IdSala=", IdSala, "&IdTipoOrden=", IdTipoOrden, "&IdOrden=", IdOrden));
            return ret;
        }

        public async Task<DateTime?> ObtenerUltimaFechaOrdenTrasiego(int IdSala, int IdTipoOrden)
        {

            var ret = await _api.GetPostsAsync<dynamic>(string.Concat(_urlLoteFab, "ObtenerUltimaFechaOrdenTrasiego?IdSala=", IdSala, "&IdTipoOrden=", IdTipoOrden));
            return ret;

        }
        public async Task<bool> IntercambioFechasOrdenOrigenDestino(dynamic Datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(string.Concat(_urlOrdenFab, "IntercambioFechasOrdenOrigenDestino"), Datos);
            return ret;
        }

        public async Task<bool> ReplanificarOrdenPlanificadaTrasiego(int idZona)
        {

            var ret = await _api.GetPostsAsync<dynamic>(string.Concat(_urlOrdenFab, "ReplanificarOrdenPlanificadaTrasiego?idZona=", idZona));
            return ret;

        }

        public async Task<List<DTO_SalaOrigenDTO>> ObtenerSalasOrigenPorTipoOrden(int IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<DTO_SalaOrigenDTO>>(string.Concat(_urlZonaFab, "ObtenerSalasOrigenPorTipoOrden?IdTipoOrden=", IdTipoOrden));
            return ret;
        }

        public async Task<List<DTO_LoteMMPPFabricacion>> ObtenerLotesConsumosPorLoteMES(string LoteMES)
        {
            var ret = await _api.GetPostsAsync<List<DTO_LoteMMPPFabricacion>>(string.Concat(_urlLoteFab, "ObtenerLotesConsumosPorLoteMES?LoteMES=", LoteMES));
            return ret;
        }

        public async Task<dynamic> ObtenerLotesConsumosPorIdLotes(List<DTO_LoteMMPPFabricacion> lotes)
        {
            var ret = await _api.PostPostsAsync<dynamic>(lotes, string.Concat(_urlLoteFab, "ObtenerLotesConsumosPorIdLotes"));
            return ret;
        }

        public async Task<dynamic> ObtenerLotesConsumosFiltracion(List<int> listaIdsLotes)
        {
            var ret = await _api.PostPostsAsync<dynamic>(listaIdsLotes, string.Concat(_urlLoteFab, "ObtenerLotesConsumosFiltracion"));

            return ret;
        }
        public async Task<dynamic> ObtenerLotesConsumosFiltracionFechas(string fechInicio, string fechaFin, string idUbicacion)
        {
            var ret = await _api.GetPostsAsync<dynamic>(string.Concat(_urlLoteFab, "ObtenerLotesConsumosFiltracionFechas?fechaInicio=", fechInicio.ToString(), "&fechaFin=", fechaFin.ToString(), "&idUbicacion=", idUbicacion));
            
            return ret.Count == 0 ? (dynamic)new List<object>() : ret;
        }

        public async Task<dynamic> ObtenerLotesTransferenciasFiltracion(DTO_ListadoIdsLotesFiltracion listIds)
        {
            var ret = await _api.PostPostsAsync<dynamic>(listIds, string.Concat(_urlLoteFab, "ObtenerLotesTransferenciasFiltracion"));

            return ret;
        }

        public async Task<dynamic> ObtenerLotesTransferenciasFiltracionFechas(string fechaDesde, string fechaHasta, string idUbicacion)
        {
            var ret = await _api.GetPostsAsync<dynamic>(string.Concat(_urlLoteFab, "ObtenerLotesTransferenciasFiltracionFechas?fechaInicio=", fechaDesde.ToString(), "&fechaFin=", fechaHasta.ToString(), "&idUbicacion=", idUbicacion));

            return ret.Count == 0 ? (dynamic)new List<object>() : ret;
        }

        public async Task<List<DTO_LoteMMPPFabricacion>> ObtenerLotesProducidosPorLoteMES(string LoteMES)
        {
            var ret = await _api.GetPostsAsync<List<DTO_LoteMMPPFabricacion>>(string.Concat(_urlLoteFab, "ObtenerLotesProducidosPorLoteMES?LoteMES=", LoteMES));
            return ret;
        }

        public async Task<List<DTO_LoteMMPPFabricacion>> ObtenerLotesProducidosFiltracion(string fechaDesde, string fechaHasta, string idUbicacion)
        {
            var ret = await _api.GetPostsAsync<List<DTO_LoteMMPPFabricacion>>(string.Concat(_urlLoteFab, "ObtenerLotesProducidosFiltracion?fechInicio=", fechaDesde.ToString(), "&fechaFin=", fechaHasta.ToString(), "&idUbicacion=", idUbicacion));
            return ret;
        }
        public async Task<List<TransferenciaLoteFabricacionDto>> ObtenerLotesTransferenciasPorLoteMES(string LoteMES)
        {
            var ret = await _api.GetPostsAsync<List<TransferenciaLoteFabricacionDto>>(string.Concat(_urlLoteFab, "ObtenerLotesTransferenciasPorLoteMES?LoteMES=", LoteMES));
            return ret;
        }

        public async Task<List<DTO_Orden_Gantt>> GetListaOrdenesProgramaFabricacion(string FechaDesde, string FechaHasta)
        {
            try
            {
                var ret = await _api.GetPostsAsync<List<DTO_Orden_Gantt>>(string.Concat(_urlOrdenFab, "ObtenerListadoOrdenesProgramadas?FechaDesde=", FechaDesde, "&FechaHasta=", FechaHasta));

                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.GetListaOrdenesProgramaFabricacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }

        }

        public async Task<dynamic> ObtenerLotesTransferenciasTrasiegoPorIdWO(int IdWO)
        {
            var ret = await _api.GetPostsAsync<dynamic>(string.Concat(_urlLoteFab, "ObtenerLotesTransferenciasTrasiegoPorIdWO?IdWO=", IdWO.ToString()));

            return ret.Count == 0 ? (dynamic)new List<object>() : ret;
        }

        public async Task<List<DTO_Transferencias>> ObtenerLotesProducidosTrasiegoPorIdWO(int IdWO)
        {
            var ret = await _api.GetPostsAsync<List<DTO_Transferencias>>(string.Concat(_urlLoteFab, "ObtenerLotesProducidosTrasiegoPorIdWO?IdWO=", IdWO.ToString()));
            return ret;
        }

        public async Task<List<DTO_Transferencias>> ObtenerLotesConsumoTrasiegoPorIdWO(int IdWO)
        {
            var ret = await _api.GetPostsAsync<List<DTO_Transferencias>>(string.Concat(_urlLoteFab, "ObtenerLotesConsumoTrasiegoPorIdWO?IdWO=", IdWO.ToString()));
            return ret;
        }

        public async Task<bool> EliminarMovimientosOrdenesFabricacion(List<int> idMovimientos)
        {
            var ret = await _api.PostPostsAsync<dynamic>(idMovimientos, string.Concat(_urlLoteFab, "EliminarMovimientosOrdenesFabricacion"));
            return ret;
        }

        public async Task<List<DTO_TiposOrden>> ObtenerTiposWO()
        {
            var ret = await _api.GetPostsAsync<List<DTO_TiposOrden>>(string.Concat(_urlOrdenFab, "TiposWO"));
            return ret;
        }
    }
}

