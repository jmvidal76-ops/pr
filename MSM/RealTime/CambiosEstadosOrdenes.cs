using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Quartz;
using MSM.RealTime;
using System.Collections;
using MSM.Utilidades;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.BBDD.Envasado;
using Common.Models.Planta;
using System.Diagnostics;
using Autofac;
using System.Threading.Tasks;

namespace MSM
{
    [DisallowConcurrentExecution]
    public class CambiosEstadosOrdenes : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();
        private IDAO_Orden _iDAO_Orden;

        public CambiosEstadosOrdenes()
        {
            _iDAO_Orden = AutofacContainerConfig.Container.Resolve<IDAO_Orden>();
        }

        public async void Execute(IJobExecutionContext context)
        {
            string logMSG = "";
            try
            {
                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMBIOS DE ESTADO DE ORDENES", "INICIO", "Info");
                }

                Stopwatch tim = Stopwatch.StartNew();
                await DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian((int)TipoEnumProcesoPerroGuardian.CambioEstadoOrden);

                List<Orden> lstOrdenes = PlantaRT.obtenerOrdenesActivasPendientes();
                DateTime? lastUpdate = lstOrdenes.Count > 0 ? lstOrdenes.Max(m => m.FechaActualizacion) : (DateTime?)null;

                logMSG += $"lastUpdate orden: { (lastUpdate.HasValue ? lastUpdate.Value.ToUniversalTime().ToString("u") : "") }. ";

                using (DataSet ds = DAO_Orden.ObtenerEstadosOrden(lastUpdate))
                {
                    if (ds != null && ds.Tables.Count > 0)
                    {
                        List<Hashtable> lineasNotificacion = new List<Hashtable>();

                        // Procesar cambios de estado en órdenes existentes
                        ProcessExistingOrders(lstOrdenes, ds.Tables[0], ref logMSG, lineasNotificacion);

                        // Procesar nuevas órdenes
                        await ProcessNewOrders(lstOrdenes, ds.Tables[0], logMSG, lineasNotificacion);

                        // Procesar cambios en planificación de órdenes
                        ProcessPlanningChanges(lstOrdenes, ds.Tables[0]);

                        // Procesar cambios en zonas de órdenes
                        ProcessZoneChanges(ds.Tables[1], lineasNotificacion);

                        // Mandar notificaciones
                        SendNotifications(lineasNotificacion);
                    }
                }

                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMB_EST_ORD-DURACIÓN", tim.Elapsed.ToString(), "Info");
                    DAO_Log.EscribeLog("CAMBIOS DE ESTADO DE ORDENES", "FIN", "Info");
                }

                tim.Stop();
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMB_EST_ORD-Estados de órdenes", "Error: " + ex.Message, "Error");
                }
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "NOT_CambiosOrdenes, (err: " + ex.HResult + "): " + ex.Message, "NOT_CambiosOrdenes.general", "I-MES-REALTIME", "system");
            }
        }

        private void ProcessExistingOrders(List<Orden> lstOrdenes, DataTable dtActivasPendientes, ref string logMSG, List<Hashtable> lineasNotificacion)
        {
            var query = from orden in lstOrdenes
                        join ordAP in dtActivasPendientes.AsEnumerable() on orden.id equals ordAP.Field<string>("Orden")
                        where orden.estadoActual.Estado.GetValue() != ordAP.Field<int>("IdEstado")
                        select new
                        {
                            orden,
                            nuevoEstado = ordAP.Field<int>("IdEstado"),
                            FechaAct = ordAP.Field<DateTime>("RowUpdated"),
                            FechaInicioReal = ordAP.Field<DateTime?>("FecIniReal"),
                            FechaFinReal = ordAP.Field<DateTime?>("FecFinReal")
                        };

            if (query.Any())
            {
                logMSG += $"Ordenes existentes: {string.Join(", ", query.Select(s => s.orden.id))}. ";
            }

            foreach (var item in query)
            {
                try
                {
                    item.orden.estadoActual = new EstadoOrden(item.nuevoEstado);
                    if (item.orden.estadoActual.Estado.Equals(Tipos.EstadosOrden.Finalizada) || item.orden.estadoActual.Estado.Equals(Tipos.EstadosOrden.Pausada))
                    {
                        double envases_pal = (item.orden.produccion.paletsProducidos - item.orden.produccion.cantidadPicosPalets) * item.orden.EnvasesPorPalet;
                        double envases_picos = item.orden.CajasPorPalet == 0 ? 0 : (item.orden.produccion.cantidadPicosCajas * item.orden.EnvasesPorPalet) / item.orden.CajasPorPalet;
                        item.orden.calidad = item.orden.produccion.envases == 0 ? 0 : Math.Truncate(((envases_pal + envases_picos - item.orden.produccion.cantidadEnvasesNoConformidad) / item.orden.produccion.envases) * 1000) / 1000;
                    }
                    item.orden.FechaActualizacion = item.FechaAct;
                    if (item.FechaInicioReal != null) item.orden.dFecInicio = item.FechaInicioReal.Value;
                    if (item.FechaFinReal != null) item.orden.dFecFin = item.FechaFinReal.Value;

                    setActivaPendiente(item.orden, false);

                    string msg = $"{item.orden.id} -> {item.orden.estadoActual.nombre}";
                    hub.Clients.All.notEstOrden(msg, item.orden.idLinea, item.orden._refLinea.numLinea);
                }
                catch (Exception ex)
                {
                    LogError("setActivaPendiente", ex);
                }
            }
        }

        private async Task ProcessNewOrders(List<Orden> lstOrdenes, DataTable dtActivasPendientes, string logMSG, List<Hashtable> lineasNotificacion)
        {
            var rows = dtActivasPendientes.AsEnumerable()
                        .Where(ordAP => !lstOrdenes.Select(o => o.id).Contains(ordAP.Field<string>("Orden"))
                                        && (ordAP.Field<int>("IdEstado") == Tipos.EstadosOrden.Creada.GetValue()
                                            || ordAP.Field<int>("IdEstado") == Tipos.EstadosOrden.Planificada.GetValue()
                                            || ordAP.Field<int>("IdEstado") == Tipos.EstadosOrden.Finalizada.GetValue()));

            DataTable dtNuevasOrdenes = rows.Any() ? rows.CopyToDataTable() : null;

            if (dtNuevasOrdenes != null)
            {
                logMSG += $"Ordenes nuevas: {string.Join(", ", dtNuevasOrdenes.Rows.OfType<DataRow>().Select(s => (string)s["Orden"]))}. ";

                foreach (DataRow row in dtNuevasOrdenes.Rows)
                {
                    try
                    {
                        string orderId = (string)row["Orden"];
                        int estadoId = (int)row["IdEstado"];

                        if (estadoId != Tipos.EstadosOrden.Finalizada.GetValue() || !lstOrdenes.Exists(o => o.id == orderId))
                        {
                            DAO_Orden dao = new DAO_Orden();
                            Orden nuevaOrden = dao.ObtenerOrden(orderId);

                            if (nuevaOrden != null)
                            {
                                Linea linea = PlantaRT.planta.lineas.FirstOrDefault(l => l.id == (string)row["Linea"]);
                                if (linea != null)
                                {
                                    await CheckParametersWO(nuevaOrden);
                                    linea.ordenesPendientes.Add(nuevaOrden);
                                    linea.ordenesPendientes.Sort((ox, oy) => ox.dFecInicioEstimado.CompareTo(oy.dFecFinEstimado));

                                    string msg = $"{nuevaOrden.id} -> {nuevaOrden.estadoActual.nombre}";
                                    hub.Clients.All.notEstOrden(msg, linea.id, linea.numLinea);
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        LogError("Obtener orden y comprobar parámetros", ex);
                    }
                }
            }
        }

        private void ProcessPlanningChanges(List<Orden> lstOrdenes, DataTable dtActivasPendientes)
        {
            var queryPlanificacion = from orden in lstOrdenes
                                     join ordAP in dtActivasPendientes.AsEnumerable() on orden.id equals ordAP.Field<string>("Orden")
                                     where orden.dFecInicioEstimado != (ordAP.Field<DateTime?>("FecIniEstimada") ?? DateTime.MinValue)
                                        || orden.dFecFinEstimado != (ordAP.Field<DateTime?>("FecFinEstimada") ?? DateTime.MinValue)
                                        || orden.cantPlanificada != Convert.ToInt32(ordAP.Field<double>("CantidadPlanificada"))
                                        || orden.descripcion != ordAP.Field<string>("note")
                                     select new
                                     {
                                         orden,
                                         nuevodFecInicioEstimado = ordAP.Field<DateTime>("FecIniEstimada"),
                                         nuevodFecFinEstimado = ordAP.Field<DateTime>("FecFinEstimada"),
                                         nuevaCantidadPlanificada = Convert.ToInt32(ordAP.Field<double>("CantidadPlanificada")),
                                         nuevaDescripcion = ordAP.Field<string>("note")
                                     };

            foreach (var item in queryPlanificacion)
            {
                try
                {
                    if (item.orden.descripcion != item.nuevaDescripcion || item.orden.cantPlanificada != item.nuevaCantidadPlanificada || item.orden.dFecInicioEstimado != item.nuevodFecInicioEstimado || item.orden.dFecFinEstimado != item.nuevodFecFinEstimado)
                    {
                        hub.Clients.All.notOrdenEditada();
                    }

                    item.orden.dFecInicioEstimado = item.nuevodFecInicioEstimado;
                    item.orden.dFecFinEstimado = item.nuevodFecFinEstimado;
                    item.orden.cantPlanificada = item.nuevaCantidadPlanificada;
                    item.orden.descripcion = item.nuevaDescripcion;

                    Linea linea = PlantaRT.planta.lineas.FirstOrDefault(l => l.numLinea == item.orden.numLinea);
                    linea.ordenesPendientes.Sort((ox, oy) => ox.dFecInicioEstimado.CompareTo(oy.dFecFinEstimado));

                    hub.Clients.All.notPlanificacionOrden(linea.numLinea, item.orden.id);
                }
                catch (Exception ex)
                {
                    LogError("Planificación ordenes", ex);
                }
            }
        }

        private void ProcessZoneChanges(DataTable dtOrdenesZona, List<Hashtable> lineasNotificacion)
        {
            foreach (DataRow row in dtOrdenesZona.Rows)
            {
                try
                {
                    string idZona = (string)row["Zona"];
                    string idOrden = (string)row["Orden"];
                    object[] datosZona = (object[])PlantaRT.zonasOrden[idZona];

                    if (datosZona != null)
                    {
                        string ordenAct = (string)datosZona[0];
                        string idLinea = (string)datosZona[1];
                        if (ordenAct != idOrden) // Cambio en la zona
                        {
                            Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                            Zona zon = lin.zonas.Find(zona => zona.id == idZona);
                            Orden ord = lin.obtenerOrdenes().Find(orden => orden.id == idOrden);

                            string msg = ordenAct == "" ? $"{idOrden} pasa a Zona {zon.descripcion}" : $"{ordenAct} abandona Zona {zon.descripcion}";
                            zon.ordenActual = ord;

                            Hashtable ht = new Hashtable
                    {
                        { "linea", idLinea },
                        { "msg", msg },
                        { "numLinea", lin.numLinea }
                    };
                            lineasNotificacion.Add(ht);

                            datosZona[0] = idOrden;
                        }
                    }
                }
                catch (Exception ex)
                {
                    LogError("Cambio en Zonas", ex);
                }
            }
        }

        private void SendNotifications(List<Hashtable> lineasNotificacion)
        {
            foreach (Hashtable item in lineasNotificacion)
            {
                hub.Clients.All.notEstOrden(item["msg"], item["linea"], item["numLinea"]);
            }
        }

        private void LogError(string context, Exception ex)
        {
            if (PlantaRT.activarLogCambioEstadoOrdenes)
            {
                DAO_Log.EscribeLog($"CAMB_EST_ORD-{context}", $"Error: {ex.Message}", "Error");
            }
            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, $"NOT_CambiosOrdenes - {context}, (err: {ex.HResult}): {ex.Message}", $"NOT_CambiosOrdenes.{context}", "I-MES-REALTIME", "system");
        }



        private async Task CheckParametersWO(Orden orden)
        {
            Stopwatch timer = Stopwatch.StartNew();
            timer.Start();

            if (orden.velocidadNominal.Equals(0.0))
            {
                orden.velocidadNominal = DAO_Orden.GetVelocidadNominal(orden);
                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMB_EST_ORD-Duración Función MES_ObtenerVelocidadNominalOrden. Orden " + orden.id, timer.Elapsed.ToString(), "Info");
                }
                timer.Restart();
            }

            if (orden.CajasPorPalet.Equals(0) || orden.EnvasesPorPalet.Equals(0))
            {
                var dtoEnvasesCajasPalet = await _iDAO_Orden.GetConversionesProducto(orden.producto.codigo);

                orden.EnvasesPorPalet = dtoEnvasesCajasPalet.EnvasesPorPalet;
                orden.CajasPorPalet = dtoEnvasesCajasPalet.CajasPorPalet;

                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMB_EST_ORD-Duración proc. almacenado MES_ObtenerConversionesPorProducto. Orden " + orden.id + ", Producto " + orden.producto.codigo, timer.Elapsed.ToString(), "Info");
                }
                timer.Restart();
            }

            if (orden.producto.hectolitros.Equals(0.0))
            {
                orden.producto.hectolitros = await _iDAO_Orden.GetHectolitrosProducto(orden.producto.codigo);
                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMB_EST_ORD-Duración Función GetHectolitrosProducto. Orden " + orden.id + ", Producto " + orden.producto.codigo, timer.Elapsed.ToString(), "Info");
                }
                timer.Restart();
            }

            if (orden.oeeObjetivo.Equals(0.0))
            {
                orden.oeeObjetivo = DAO_Orden.GetOEEObjetivoOrden(orden);
                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMB_EST_ORD-Duración Función MES_ObtenerOEEObjetivoOrden. Orden " + orden.id + ", Producto " + orden.producto.codigo, timer.Elapsed.ToString(), "Info");
                }
                timer.Restart();
            }

            if (orden.oeeCritico.Equals(0.0))
            {
                orden.oeeCritico = DAO_Orden.GetOEECriticoOrden(orden);
                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMB_EST_ORD-Duración Función MES_ObtenerOEECriticoOrden. Orden " + orden.id + ", Producto " + orden.producto.codigo, timer.Elapsed.ToString(), "Info");
                }
                timer.Restart();
            }

            timer.Stop();
        }

        /// <summary>
        /// Establece si con el nuevo cambio la orden es activa o pendiente
        /// </summary>
        /// <param name="orden">Orden que ha sufrido un cambio de estado</param>
        /// <param name="cacularConsolidados">Indica si hay que actualizar consolidados o no</param>
        public void setActivaPendiente(Orden orden, Boolean cacularConsolidados)
        {
            Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea == orden.numLinea);
            if (linea.ordenesActivas.Contains(orden)) //pertenece a las ordenes activas
            {
                if (!orden.estadoActual.esActiva)
                {
                    linea.ordenesActivas.Remove(orden);
                }

                if (orden.estadoActual.esPendiente)
                {
                    if (cacularConsolidados)
                    {
                        //Actualizamos los datos de las ordenes para tenerlos actualizados unicamente de los consolidados
                        DAO_Produccion daoProduccion = new DAO_Produccion();
                        if (DAO_Orden.obtenerSiWOEstaHaciendoConsolidados(orden.id) == 0)
                        {
                            //Utilizamos sólo la obtencion de datos de producción de particiones, las ordenes padre son sólo para el histórico, no se tienen que mantener en memoria
                            daoProduccion.obtenerDatosProduccionParticion(orden, DateTime.UtcNow, new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day).AddHours(DateTime.UtcNow.Hour));
                        }
                    }
                    //Obtenemos las duracion real de la orden
                    //orden.duracionReal = DAO_Orden.ObtenerDuracion(orden.idLinea, orden.dFecInicio, orden.dFecFin);
                    
                    Stopwatch tim = Stopwatch.StartNew();
                    tim.Start();

                    orden.duracionReal = DAO_Orden.ObtenerDuracionReal(orden.id);

                    if (PlantaRT.activarLogCambioEstadoOrdenes)
                    {
                        DAO_Log.EscribeLog("CAMB_EST_ORD-Duración Función MES_GetTiempoPaletera", tim.Elapsed.ToString(), "Info");
                    }
                    tim.Stop();

                    linea.ordenesPendientes.Add(orden);
                    linea.ordenesPendientes.Sort((ox, oy) => ox.dFecInicioEstimado.CompareTo(oy.dFecInicioEstimado));
                }
            }
            else //pertenece a las ordenes pendientes
            {
                if (!orden.estadoActual.esPendiente)
                {
                    linea.ordenesPendientes.Remove(orden);
                }
                if (orden.estadoActual.esActiva)
                {
                    linea.ordenesActivas.Add(orden);
                    linea.ordenesActivas.Sort((ox, oy) => ox.dFecInicioEstimado.CompareTo(oy.dFecInicioEstimado));
                }
            }
        }
    }
}
