using BreadMES.Envasado;
using Clients.ApiClient.Contracts;
using Common.Models.Operation;
using G2Base;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using MSM.RealTime;
using MSM.Utilidades;
using ReglasMES;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using P = MSM.Models.Planta;


namespace MSM.BBDD.Envasado
{
    public class DAO_Produccion : IDAO_Produccion
    {
        private IApiClient _api;
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();
        private string _urlProduccion;
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();

        public DAO_Produccion()
        {

        }

        public DAO_Produccion(IApiClient api)
        {
            _api = api;
            _urlProduccion = string.Concat(UriEnvasado, "api/Produccion/");
        }

        /// <summary>
        /// Rellena unos datos de producción que tengan rellenos los campos de equipo,fec inicio y fec fin
        /// </summary>
        /// <param name="produccion">Una referencia a un objeto de datos de producción</param>
        public void SetDatosProduccionMaquina(DatosProduccion produccion, DateTime dtHoraActualUtc)
        {
            //DAO_Log.registrarLogTraza("", "", String.Format("{0}; {1}; {2};", produccion.idMaquina, produccion.fecInicio.ToString(), produccion.fecActual.ToString()));

            try
            {
                Stopwatch timer = Stopwatch.StartNew();
                timer.Start();

                DateTime horaActual = dtHoraActualUtc;// new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, DateTime.Now.Hour, 0, 0).ToUniversalTime();
                DatosProduccion datosProduccionMaquina = null;
                //Comprobamos si hora actual esta comprendida en el rango de fechas que queremos consultar
                if (horaActual.CompareTo(produccion.fecInicio) >= 0 && horaActual.CompareTo(produccion.fecActual) < 0)
                {
                    //Si la fecha de inicio es menor a la fecha hora actual obtenemos los datos de los consolidados
                    if (produccion.fecInicio.CompareTo(horaActual) < 0)
                    {
                        int numHoras = 0;
                        DatosProduccion datosProdMaqConsolidados = ObtenerDatosProduccionMaquinaConsolidados(produccion.idMaquina, produccion.claseMaquina, produccion.fecInicio, horaActual, out numHoras);
                        //DAO_Log.registrarLogTraza("", "", String.Format("NumHoras {0};", numHoras));

                        if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                        {
                            DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración proc. almacenado MES_ObtenerDatosProduccionMaquina. Máquina " + produccion.idMaquina, timer.Elapsed.ToString(), "Info");
                        }
                        timer.Restart();

                        if (datosProdMaqConsolidados != null)
                        {
                            if (numHoras != (horaActual - produccion.fecInicio).Hours)
                            {
                                //obtenemos los datos de la regla
                                //DAO_Log.registrarLogTraza("", "", String.Format("obtenemos los datos de la regla if"));
                                datosProduccionMaquina = this.ObtenerDatosProduccionMaquina(produccion.fecInicio, horaActual, produccion.idMaquina);

                                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                                {
                                    DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración llamada componente OEECli. Máquina " + produccion.idMaquina, timer.Elapsed.ToString(), "Info");
                                }
                                timer.Restart();

                                if (datosProdMaqConsolidados != null)
                                {
                                    datosProduccionMaquina = datosProdMaqConsolidados;
                                }
                            }
                            else
                            {
                                datosProduccionMaquina = datosProdMaqConsolidados;
                            }

                        }
                    }
                    //Desde la fecha hora actual en adelante obtenemos los datos de la regla
                    //DAO_Log.registrarLogTraza("", "", String.Format("Desde la fecha hora actual en adelante obtenemos los datos de la regla"));
                    double horaActualUTC = (horaActual - new DateTime(1970, 1, 1)).TotalSeconds;
                    DatosProduccion datosProduccionMaqRegla = this.ObtenerDatosProduccionMaquina(horaActual, produccion.fecActual, produccion.idMaquina);

                    if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                    {
                        DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración llamada componente OEECli. Máquina " + produccion.idMaquina, timer.Elapsed.ToString(), "Info");
                    }
                    timer.Restart();

                    //DatosProduccion datosProduccionMaqReglaS = this.obtenerDatosProduccionMaquina(produccion.fecActualUTC, horaActualUTC, produccion.idMaquina);
                    // DAO_Log.registrarLogTraza("", "", String.Format("Unificamos datos"));
                    //Unificamos datos

                    if (datosProduccionMaqRegla != null)
                    {
                        if (datosProduccionMaquina == null) datosProduccionMaquina = new DatosProduccion();

                        datosProduccionMaquina.tiempoPlanificado += datosProduccionMaqRegla.tiempoPlanificado;
                        datosProduccionMaquina.tiempoOperativo += datosProduccionMaqRegla.tiempoOperativo;
                        datosProduccionMaquina.tiempoBruto += datosProduccionMaqRegla.tiempoBruto;
                        datosProduccionMaquina.tiempoNeto += datosProduccionMaqRegla.tiempoNeto;
                        //La velocidad nominal nos interesa par el calculo de rendimiento que nos llegue respecto al intervalo de tiempo que le pasamos, no por hora ya que si no el rendimiento sale mal
                        datosProduccionMaquina.velocidadNominal += datosProduccionMaqRegla.velocidadNominal;
                        datosProduccionMaquina.cantidadProducida += datosProduccionMaqRegla.cantidadProducida;
                        datosProduccionMaquina.rechazos += datosProduccionMaqRegla.rechazos;

                    }
                }
                //Si la fecha de fin es menor o igual que la fecha hora actual obtenemos los datos sólo de los consolidados
                else if (produccion.fecActual <= horaActual)
                {

                    //DAO_Log.registrarLogTraza("", "", String.Format("Si la fecha de fin es menor o igual que la fecha hora actual obtenemos los datos sólo de los consolidados"));
                    int numHoras = 0;
                    datosProduccionMaquina = ObtenerDatosProduccionMaquinaConsolidados(produccion.idMaquina, produccion.claseMaquina, produccion.fecInicio, produccion.fecActual, out numHoras);

                    if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                    {
                        DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración proc. almacenado MES_ObtenerDatosProduccionMaquina. Máquina " + produccion.idMaquina, timer.Elapsed.ToString(), "Info");
                    }
                    timer.Restart();

                    if (datosProduccionMaquina != null && (numHoras != (produccion.fecActual - produccion.fecInicio).Hours))
                    {
                        //obtenemos los datos de la regla
                        datosProduccionMaquina = this.ObtenerDatosProduccionMaquina(produccion.fecInicio, produccion.fecActual, produccion.idMaquina);

                        if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                        {
                            DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración llamada componente OEECli. Máquina " + produccion.idMaquina, timer.Elapsed.ToString(), "Info");
                        }
                        timer.Restart();
                    }
                }
                //obtenemos los datos de la regla
                else
                {
                    //DAO_Log.registrarLogTraza("", "", String.Format("//obtenemos los datos de la regla"));
                    //datosProduccionMaquina = this.obtenerDatosProduccionMaquina(produccion.fecActualUTC, produccion.fecInicioUTC, produccion.idMaquina);
                    datosProduccionMaquina = this.ObtenerDatosProduccionMaquina(produccion.fecInicio, produccion.fecActual, produccion.idMaquina);

                    if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                    {
                        DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración llamada componente OEECli. Máquina " + produccion.idMaquina, timer.Elapsed.ToString(), "Info");
                    }
                    timer.Restart();
                }

                if (datosProduccionMaquina != null)
                {
                    produccion.tiempoPlanificado = datosProduccionMaquina.tiempoPlanificado;
                    produccion.tiempoOperativo = datosProduccionMaquina.tiempoOperativo;
                    produccion.tiempoBruto = datosProduccionMaquina.tiempoBruto;
                    produccion.tiempoNeto = datosProduccionMaquina.tiempoNeto;
                    //La velocidad nominal nos interesa par el calculo de rendimiento que nos llegue respecto al intervalo de tiempo que le pasamos, no por hora ya que si no el rendimiento sale mal
                    produccion.velocidadNominal = datosProduccionMaquina.velocidadNominal;
                    produccion.cantidadProducida = datosProduccionMaquina.cantidadProducida;
                    produccion.rechazos = datosProduccionMaquina.rechazos;
                    produccion.Consolidado = datosProduccionMaquina.Consolidado;
                }

                timer.Stop();
                //DAO_Log.registrarLogTraza("", "", String.Format("FIN {0}; {1}; {2};", produccion.idMaquina, produccion.fecInicio.ToString(), produccion.fecActual.ToString()));
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-Método SetDatosProduccionMaquina", "Error: " + ex.Message, "Error");
                }

                string usuario = HttpContext.Current == null ? "Sistema" : HttpContext.Current.User.Identity.Name;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.SetDatosProduccionMaquina", "WEB-ENVASADO", usuario);
            }
        }

        public static DatosSeguimiento ObtenerResumenParosPerdidas(string nombreMaquina, DateTime fecInicio, DateTime fecFin)
        {
            Stopwatch tim = Stopwatch.StartNew();
            tim.Start();

            DatosSeguimiento produccion = new DatosSeguimiento();

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand comando = new SqlCommand("[MES_ObtenerResumenParosPerdidas]", connection))
                {
                    comando.Parameters.AddWithValue("@idMaquina", nombreMaquina);
                    comando.Parameters.AddWithValue("@desde", fecInicio);
                    comando.Parameters.AddWithValue("@hasta", fecFin);
                    comando.CommandType = CommandType.StoredProcedure;

                    connection.Open();
                    using (SqlDataReader dr = comando.ExecuteReader())
                    {
                        if (dr.Read())
                        {
                            produccion.NumParosMayoresTurno = DataHelper.GetInt(dr, "NumParosMayores");
                            produccion.TiempoParosMayoresTurno = DataHelper.GetLong(dr, "TiempoParosMayores");
                            produccion.NumParosMenoresTurno = DataHelper.GetInt(dr, "NumParosMenores");
                            produccion.TiempoParosMenoresTurno = DataHelper.GetLong(dr, "TiempoParosMenores");
                            produccion.TiempoBajaVelocidadTurno = DataHelper.GetLong(dr, "TiempoBajaVelocidad");

                            produccion.NumParosMayoresJTurno = DataHelper.GetInt(dr, "NumParosMayoresJ");
                            produccion.TiempoParosMayoresJTurno = DataHelper.GetLong(dr, "TiempoParosMayoresJ");
                            produccion.NumParosMenoresJTurno = DataHelper.GetInt(dr, "NumParosMenoresJ");
                            produccion.TiempoParosMenoresJTurno = DataHelper.GetLong(dr, "TiempoParosMenoresJ");
                            produccion.TiempoBajaVelocidadJTurno = DataHelper.GetLong(dr, "TiempoBajaVelocidadJ");
                        }
                    }
                }
            }

            if (PlantaRT.activarLogDatosProduccionCambiosTurno)
            {
                DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración proc. almacenado MES_ObtenerResumenParosPerdidas. Máquina " + nombreMaquina, tim.Elapsed.ToString(), "Info");
            }
            tim.Stop();

            return produccion;
        }

        public DatosProduccion ObtenerDatosProduccionMaquinaConsolidados(string idMaquina, string claseMaquina, DateTime fecInicio, DateTime fecFin, out int numHoras)
        {
            DataTable dt = new DataTable();
            DatosProduccion datosProdMaquina = null;
            numHoras = 0;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerDatosProduccionMaquina]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@IdMaquina ", idMaquina);
                    command.Parameters.AddWithValue("@Clase  ", claseMaquina);
                    command.Parameters.AddWithValue("@FecInicio ", fecInicio);
                    command.Parameters.AddWithValue("@FecFin ", fecFin);

                    using (SqlDataAdapter da = new SqlDataAdapter())
                    {
                        connection.Open();
                        da.SelectCommand = command;

                        DataSet ds = new DataSet();
                        da.Fill(ds);
                        dt = ds != null ? ds.Tables.Count > 0 ? ds.Tables[0] : null : null;
                    }
                }
            }

            if (dt != null && dt.Rows.Count > 0)
            {
                datosProdMaquina = new DatosProduccion();
                datosProdMaquina.Consolidado = true;
                foreach (DataRow row in dt.Rows)
                {
                    datosProdMaquina.tiempoPlanificado = (double)row["TiempoPlanificado"];
                    datosProdMaquina.tiempoOperativo = (double)row["TiempoOperativo"];
                    datosProdMaquina.tiempoBruto = (double)row["TiempoBruto"];
                    datosProdMaquina.tiempoNeto = (double)row["TiempoNeto"];
                    datosProdMaquina.velocidadNominal = (double)row["VelocidadNominal"];
                    datosProdMaquina.cantidadProducida = (int)row["EnvasesProducidos"];
                    datosProdMaquina.rechazos = (int)row["ContadorRechazos"];
                    numHoras = (int)row["NumHoras"];
                }
            }
            else
            {
                //Registrar en Logbook -> Posible fallo en consolidados.
                //DAO_Log.registrarLog
            }

            return datosProdMaquina;
        }

        /// <summary>
        /// Método que otiene los datos de producción de una máquina en un rango de fechas
        /// </summary>
        /// <param name="fechaFin">Fecha Fin</param>
        /// <param name="fechaInicio">Fecha Inicio</param>
        /// <param name="maquina">Nombre de la máquina</param>
        /// <returns>Datos de producción de la máquina en el rango de fechas solicitado</returns>
        public DatosProduccion ObtenerDatosProduccionMaquina(DateTime fechaInicio, DateTime fechaFin, string maquina)
        {
            fechaInicio = new DateTime(fechaInicio.Year, fechaInicio.Month, fechaInicio.Day, fechaInicio.Hour, fechaInicio.Minute, fechaInicio.Second);
            fechaFin = new DateTime(fechaFin.Year, fechaFin.Month, fechaFin.Day, fechaFin.Hour, fechaFin.Minute, fechaFin.Second);
            DatosProduccion datosProduccion = null;

            if (fechaInicio < fechaFin)
            {
                if (ConfigurationManager.AppSettings["DATOS_PROD_SIT"] == "true")
                {
                    double fechaInicioUTC = (fechaInicio - new DateTime(1970, 1, 1)).TotalSeconds;
                    double fechaFinUTC = (fechaFin - new DateTime(1970, 1, 1)).TotalSeconds;
                    datosProduccion = this.ObtenerDatosProduccionMaquinaReglaModeler(fechaFinUTC, fechaInicioUTC, maquina);
                }
                else
                {
                    try
                    {
                        Dictionary<string, object> result = MaquinaBread.obtenerDatosProduccionMaquina(fechaFin, fechaInicio, maquina);

                        if (result != null)
                        {
                            DTO_DatosProduccionMaquinaSIT prodMaqSit = MSM.Utilidades.Utils.DictionaryToObject<DTO_DatosProduccionMaquinaSIT>(result);

                            //El tiempo Neto por definición no puedes ser mayor que el tiempo Bruto, si esto ocurre podría falsearnos los datos de paros menores incluso paros mayores
                            if (prodMaqSit.TIEMPO_NETO > prodMaqSit.TIEMPO_BRUTO)
                            {
                                //DAO_Log.registrarLogProcesos(DateTime.Now, "ObtenerDatosProduccionMaquina", new Exception(string.Format("Tiempo Neto({0}) mayor que Tiempo Bruto({1}), posible errores en contadores o velocidad nominal, maquina: {2}", prodMaqSit.TIEMPO_NETO, prodMaqSit.TIEMPO_BRUTO, maquina)), "System");
                                prodMaqSit.TIEMPO_NETO = prodMaqSit.TIEMPO_BRUTO;
                            }

                            datosProduccion = new DatosProduccion();
                            datosProduccion.tiempoNeto = prodMaqSit.TIEMPO_NETO;
                            datosProduccion.tiempoBruto = prodMaqSit.TIEMPO_BRUTO;
                            datosProduccion.tiempoOperativo = prodMaqSit.TIEMPO_OPERATIVO;
                            datosProduccion.tiempoPlanificado = prodMaqSit.TIEMPO_PLANIFICADO;
                            datosProduccion.velocidadNominal = (maquina.Contains("PAL") || maquina.Contains("EQP")) ? prodMaqSit.VELOCIDAD_NOMINAL_PALETIZADORA : prodMaqSit.VELOCIDAD_NOMINAL_LLENADORA;
                            datosProduccion.cantidadProducida = prodMaqSit.CONTADOR_PRODUCCION;
                            datosProduccion.rechazos = prodMaqSit.CONTADOR_RECHAZOS;

                            result = null;
                            prodMaqSit = null;
                        }
                    }
                    catch (Exception ex)
                    {
                        if (PlantaRT.activarLogDatosProduccionCambiosTurno || PlantaRT.activarLogOrdenesPausadasFinalizadas)
                        {
                            DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Producción componente OEECli. Máquina " + maquina, "Error: " + ex.Message, "Error");
                        }

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.ObtenerDatosProduccionMaquina", "WEB-ENVASADO", HttpContext.Current?.User?.Identity.Name ?? "SISTEMA");
                        throw ex;
                    }
                }
            }

            return datosProduccion;
        }

        public DatosProduccion ObtenerDatosProduccionMaquinaReglaModeler(double fechaFinUTC, double fechaInicioUTC, string idMaquina)
        {
            DatosProduccion datosProduccion = null;
            ReglasMES.ObtenerProduccionMaquina regla = null;

            try
            {
                PMConnectorBase.Connect();
                regla = new ReglasMES.ObtenerProduccionMaquina(PMConnectorBase.PmConexion);

                double errCode = 0.0;
                string errDesc = "";
                string errSource = "";
                double tPlanificado = 0.0;
                double tOperativo = 0.0;
                double tBruto = 0.0;
                double tNeto = 0.0;
                double vNominal = 0.0;
                int contadorProduccion = 0;
                int contadorRechazos = 0;

                CallResult res = new CallResult();
                res = regla.Call(fechaFinUTC, fechaInicioUTC, idMaquina, ref errCode, ref errDesc, ref errSource, ref tBruto,
                                 ref tNeto, ref tOperativo, ref tPlanificado, ref vNominal, ref contadorProduccion, ref contadorRechazos);

                if (res == CallResult.CR_Ok)
                {
                    datosProduccion = new DatosProduccion();
                    datosProduccion.tiempoPlanificado = tPlanificado;
                    datosProduccion.tiempoOperativo = tOperativo;
                    datosProduccion.tiempoBruto = tBruto;
                    datosProduccion.tiempoNeto = tNeto;
                    datosProduccion.velocidadNominal = vNominal;
                    datosProduccion.cantidadProducida = contadorProduccion;
                    datosProduccion.rechazos = contadorRechazos;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.ObtenerDatosProduccionMaquinaReglaModeler", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }
            finally
            {
                regla.Dispose();
            }

            return datosProduccion;
        }

        /// <summary>
        /// Obtiene los datos de producción de una orden
        /// </summary>
        /// <param name="orden">orden de la que se quiere obtener sus datos</param>
        public void obtenerDatosProduccionParticion(Orden ord, DateTime fireDateTimeUtc, DateTime dtHoraActualUtc, bool logTriggers = false)
        {
            try
            {
                Stopwatch timer = Stopwatch.StartNew();
                timer.Start();

                DateTime dtNow = fireDateTimeUtc;
                DateTime dtHoraActual = dtHoraActualUtc;// new DateTime(dtNow.Year, dtNow.Month, dtNow.Day).AddHours(dtNow.Hour);

                //Comprobamos si estan los consolidados de la hora actual
                bool consolidadoLlenadora = true;
                bool consolidadoPaletizadora = true;
                bool consolidadoEncajonadora = true;
                bool ordenActivaEnTurnoActual = true;
                double tiempoPlanificadoPalAcumuladoMaq = 0;
                double tiempoPlanificadoLleAcumuladoMaq = 0;

                if (PlantaRT.planta != null && PlantaRT.planta.lineas != null)
                {
                    Linea lin = PlantaRT.planta.lineas.Find(l => l.numLinea == ord._refLinea.numLinea);
                    Turno turno = PlantaRT.planta.turnoActual.Find(x => x.linea.id == lin.id);

                    if (turno != null && turno.turnoProductivo && turno.inicio < fireDateTimeUtc)
                    {
                        foreach (Maquina maq in lin.llenadoras)
                        {
                            int index = maq.datosSeguimiento.datosProduccionHoras.Count - 2; //Penultima posición
                            if (index >= 0)
                            {
                                consolidadoLlenadora = maq.datosSeguimiento.datosProduccionHoras[index].Consolidado == true ? (consolidadoLlenadora == true ? true : false) : false;
                            }

                            if (maq.datosSeguimiento.datosProduccionHoras.Count > 0)
                            {
                                tiempoPlanificadoLleAcumuladoMaq += maq.datosSeguimiento.datosProduccionHoras.Last().tiempoPlanificado;
                            }
                        }

                        foreach (Maquina maq in lin.paleteras)
                        {
                            int index = maq.datosSeguimiento.datosProduccionHoras.Count - 2; //Penultima posición
                            if (index >= 0)
                            {
                                consolidadoPaletizadora = maq.datosSeguimiento.datosProduccionHoras[index].Consolidado == true ? (consolidadoLlenadora == true ? true : false) : false;
                            }

                            if (maq.datosSeguimiento.datosProduccionHoras.Count > 0)
                            {
                                tiempoPlanificadoPalAcumuladoMaq += maq.datosSeguimiento.datosProduccionHoras.Last().tiempoPlanificado;
                            }
                        }

                        foreach (Maquina maq in lin.encajonadoras)
                        {
                            int index = maq.datosSeguimiento.datosProduccionHoras.Count - 2; //Penultima posición
                            if (index >= 0)
                            {

                                consolidadoEncajonadora = maq.datosSeguimiento.datosProduccionHoras[index].Consolidado == true ? (consolidadoLlenadora == true ? true : false) : false;
                            }
                        }

                        timer.Restart();

                        ordenActivaEnTurnoActual = DAO_Turnos.GetParticionActivaEnTurnoActual(ord, ordenActivaEnTurnoActual, turno, logTriggers);

                        if (logTriggers)
                        {
                            DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración Función MES_ParticionActivaEnTurno", timer.Elapsed.ToString(), "Info");
                        }
                        timer.Restart();
                    }
                }

                DataTable dt = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerDatosProduccionParticion]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        //command.Parameters.AddWithValue("@listEstados", EstadosExcepcion);
                        command.Parameters.AddWithValue("@ordenId", ord.id);
                        //command.Parameters.AddWithValue("@ordenIdPadre", ord.idOrdenPadre);
                        //command.Parameters.AddWithValue("@subordenId", ord.idSuborden);
                        command.CommandTimeout = 180;
                        using (SqlDataAdapter da = new SqlDataAdapter())
                        {
                            connection.Open();
                            da.SelectCommand = command;

                            DataSet ds = new DataSet();
                            da.Fill(ds);
                            dt = ds.Tables.Count > 0 ? ds.Tables[0] : null;
                        }
                    }
                }

                if (logTriggers)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración proc. almacenado MES_ObtenerDatosProduccionParticion. Orden " + ord.id, timer.Elapsed.ToString(), "Info");
                }
                timer.Restart();

                double tiempoPlanificadoPal = 0;
                double tiempoPlanificadoLle = 0;
                //DateTime? HoraFinEnvases = null;
                //DateTime? HoraFinPalets = null;
                //DateTime? HoraFinCajas = null;
                //Creamos objeto DatosProduccionOrden para almacenar los datos y copiarlos a los de la orden cuando esten todos los cálculos realizados, de esta forma
                //evitamos que se visualizen datos a medias en las recargas de la vista seguimiento de turno.
                DatosProduccionOrden dtProd = new DatosProduccionOrden();
                dtProd = (DatosProduccionOrden)ord.produccion.Clone();

                if (dt != null && dt.Rows.Count > 0)
                {
                    if (dtProd == null)
                    {
                        dtProd = new DatosProduccionOrden();
                    }

                    foreach (DataRow row in dt.Rows)
                    {
                        //dtProd.paletsEtiquetadoraProducidos = Convert.ToInt32(row["PaletsETQProducidos"]);

                        //--Datos Paletizadora--
                        tiempoPlanificadoPal = Convert.ToDouble(row["TiempoPlanificadoPaletera"]);
                        if (consolidadoPaletizadora || !ordenActivaEnTurnoActual)
                        {
                            dtProd.paletsProducidos = Convert.ToInt32(row["PaletsProducidos"]);
                            dtProd.oee = Convert.ToDouble(row["OEE"]);
                            dtProd.rendimiento = Convert.ToDouble(row["Rendimiento"]);
                            ord.calidad = Convert.ToDouble(row["IC"]);
                        }
                        else
                        {
                            tiempoPlanificadoPal += tiempoPlanificadoPalAcumuladoMaq;
                        }
                        //----------------------
                        //--Datos Llenadora-----
                        tiempoPlanificadoLle = Convert.ToDouble(row["TiempoPlanificadoLlenadora"]);
                        if (consolidadoLlenadora || !ordenActivaEnTurnoActual)
                        {
                            dtProd.envases = Convert.ToInt32(row["EnvasesProducidos"]);// Convert.ToInt32(row["TotalPalets"]) * ord.EnvasesPorPalet;
                        }
                        else
                        {
                            tiempoPlanificadoLle += tiempoPlanificadoLleAcumuladoMaq;
                        }
                        dtProd.velocidadRealMedia = tiempoPlanificadoLle == 0 ? 0 : dtProd.envases / ((tiempoPlanificadoLle / ord._refLinea.llenadoras.Count) / 3600);
                        //----------------------
                        //--Datos Encajonadora--
                        if (consolidadoEncajonadora || !ordenActivaEnTurnoActual)
                        {

                            dtProd.cajas = Convert.ToInt32(row["CajasProducidas"]);
                            //if (dtProd.cajas > 0) {
                            //    DAO_Log.registrarLogProcesos(DateTime.Now, "obtenerDatosProduccionParticion -> CajasProducidas", "Cantidad de cajas producidas: "+dtProd.cajas.ToString(),"TEST");
                            //}
                        }
                        //----------------------
                        //Cambio inigo. 11/8/2016- Sumo los manuales porque no se estan mostrando en el seguimiento del turno en curso
                        dtProd.rechazosLlenadora = Convert.ToInt32(row["RechazosLlenadora"]);
                        dtProd.rechazosClasificadores = Convert.ToInt32(row["RechazosClasificadores"]);
                        dtProd.rechazosProductoTerminado = Convert.ToInt32(row["RechazosProductoTerminado"]);
                        dtProd.rechazosInspectorVacios = Convert.ToInt32(row["RechazosInspectorBotellasVacias"]);
                        dtProd.velocidadNominal = Convert.ToDouble(row["velocidadNominal"]);
                        dtProd.cantidadPicosCajas = Convert.ToInt32(row["PicosCajas"]);
                        dtProd.cantidadPicosPalets = Convert.ToInt32(row["PicosPalets"]);
                        dtProd.cantidadEnvasesNoConformidad = Convert.ToInt32(row["EnvNoConformidad"]);
                        dtProd.cantidadPaletsNoConformidad = Convert.ToInt32(row["EnvNoConformidadPalets"]);

                        ord.fecFin = Convert.ToString(row["FechaFin"]);
                        ord.rechazosLlenadoraAutomatico = Convert.ToInt32(row["RechazosLlenadora"]);
                        ord.rechazosClasificadorAutomatico = Convert.ToInt32(row["RechazosClasificadores"]);
                        ord.rechazosProductoTerminadoAutomatico = Convert.ToInt32(row["RechazosProductoTerminado"]);
                        ord.rechazosVaciosAutomatico = Convert.ToInt32(row["RechazosInspectorBotellasVacias"]);
                        string causaPausa = Convert.ToString(row["CausaPausa"]);
                        ord.TipoPausa = causaPausa.Equals(Tipos.Pausa.Fin.GetProperty("value")) ? Tipos.Pausa.Fin : (causaPausa.Equals(Tipos.Pausa.Cambio.GetProperty("value")) ? Tipos.Pausa.Cambio : Tipos.Pausa.SinPausa);
                    }
                }

                //Añadimos datos de hora en curso -> las ordenes que pueden estar en curso son las que esten en Producción o Iniciando
                if (ord.estadoActual.Estado == Tipos.EstadosOrden.Producción || ord.estadoActual.Estado == Tipos.EstadosOrden.Iniciando)
                {
                    //Comprobamos si la orden se arranco despues de la hora actual ya que en ese caso lo datos hay que obtenerlos desde fecInicio hasta dtNow en lugar de horaActual - dtNow
                    dtHoraActualUtc = ord.dfecInicio() > dtHoraActualUtc ? ord.dfecInicio() : dtHoraActualUtc;

                    double tiempo = 0;
                    Zona zonaLlenadora = ord._refLinea.zonas.Find(z => z.esLlenadora);
                    if (zonaLlenadora != null && zonaLlenadora.ordenActual != null && zonaLlenadora.ordenActual.id.Equals(ord.id))
                    {
                        timer.Restart();

                        foreach (Maquina maquina in ord._refLinea.llenadoras)
                        {
                            DatosProduccion datosProdMaquina = this.ObtenerDatosProduccionMaquina(dtHoraActualUtc, dtNow, maquina.id);

                            if (logTriggers)
                            {
                                DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración llenadora llamada componente OEECli. Máquina " + maquina.id, timer.Elapsed.ToString(), "Info");
                            }
                            timer.Restart();

                            if (datosProdMaquina != null)
                            {
                                dtProd.envases += datosProdMaquina.cantidadProducida;
                                dtProd.envasesHoraActual = datosProdMaquina.cantidadProducida;
                                ord.rechazosLlenadoraAutomatico += maquina.datosSeguimiento.rechazos;
                                tiempo += datosProdMaquina.tiempoPlanificado;
                            }
                        }

                        // Gestion de cuando la llenadora llega a su numero de envases estimado
                        if (!ord.avisoLlenadora)
                        {
                            int envasesProducidos = dtProd.envases;
                            int envasesPlanificados = ord.cantPlanificada * ord.EnvasesPorPalet;

                            if (envasesProducidos >= envasesPlanificados)
                            {
                                hub.Clients.All.llenadoraTermina("La llenadora ha llegado a su producción estimada", ord._refLinea.numLinea, ord.id);
                            }
                        }

                        dtProd.velocidadRealMedia = (tiempoPlanificadoLle + tiempo) == 0 ? 0 : dtProd.envases / (((tiempoPlanificadoLle + tiempo) / ord._refLinea.llenadoras.Count) / 3600);
                    }

                    //Obtenemos los rechazos para las maquinas que no son "llenadoras"
                    timer.Restart();
                    DatosProduccion datosProdMaquinas = null;

                    foreach (Maquina maquina in ord._refLinea.obtenerMaquinas)
                    {
                        switch (maquina.tipo.nombre)
                        {
                            case "CLASIFICADOR": //id 49
                                datosProdMaquinas = this.ObtenerDatosProduccionMaquina(dtHoraActualUtc, dtNow, maquina.id);

                                if (logTriggers)
                                {
                                    DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración llamada componente OEECli. Máquina " + maquina.tipo.nombre + ": " + maquina.id, timer.Elapsed.ToString(), "Info");
                                }
                                timer.Restart();

                                if (datosProdMaquinas != null)
                                {
                                    dtProd.rechazosClasificadores += datosProdMaquinas.rechazos;
                                    dtProd.rechazosClasificadoresHoraActual = datosProdMaquinas.rechazos;
                                    ord.rechazosClasificadorAutomatico += datosProdMaquinas.rechazos;
                                }
                                break;
                            case "INSPECTOR_BOTELLAS_VACIAS": //id 88
                                datosProdMaquinas = this.ObtenerDatosProduccionMaquina(dtHoraActualUtc, dtNow, maquina.id);

                                if (logTriggers)
                                {
                                    DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración llamada componente OEECli. Máquina " + maquina.tipo.nombre + ": " + maquina.id, timer.Elapsed.ToString(), "Info");
                                }
                                timer.Restart();

                                if (datosProdMaquinas != null)
                                {
                                    dtProd.rechazosInspectorVacios += datosProdMaquinas.rechazos;
                                    dtProd.rechazosInspectorVaciosHoraActual = datosProdMaquinas.rechazos;
                                    ord.rechazosVaciosAutomatico += datosProdMaquinas.rechazos;
                                }
                                break;
                            case "INSPECTOR_SALIDA_LLENADORA": //id 21
                                datosProdMaquinas = this.ObtenerDatosProduccionMaquina(dtHoraActualUtc, dtNow, maquina.id);

                                if (logTriggers)
                                {
                                    DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración llamada componente OEECli. Máquina " + maquina.tipo.nombre + ": " + maquina.id, timer.Elapsed.ToString(), "Info");
                                }
                                timer.Restart();

                                if (datosProdMaquinas != null)
                                {
                                    dtProd.rechazosLlenadora += datosProdMaquinas.rechazos;
                                    dtProd.rechazosLlenadoraHoraActual = datosProdMaquinas.rechazos;
                                    ord.rechazosLlenadoraAutomatico += datosProdMaquinas.rechazos;

                                }
                                break;
                            case "INSPECTOR_BOTELLAS_LLENAS"://id 87
                            case "BASCULA": //id 78
                                datosProdMaquinas = this.ObtenerDatosProduccionMaquina(dtHoraActualUtc, dtNow, maquina.id);

                                if (logTriggers)
                                {
                                    DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración llamada componente OEECli. Máquina " + maquina.tipo.nombre + ": " + maquina.id, timer.Elapsed.ToString(), "Info");
                                }
                                timer.Restart();

                                if (datosProdMaquinas != null)
                                {
                                    dtProd.rechazosProductoTerminado += datosProdMaquinas.rechazos;
                                    dtProd.rechazosProductoTerminadoHoraActual = datosProdMaquinas.rechazos;
                                    ord.rechazosProductoTerminadoAutomatico += datosProdMaquinas.rechazos;
                                }
                                break;
                        }
                    }

                    Zona zonaPaletera = ord._refLinea.zonas.Find(z => z.esPaletizadora);
                    double envasesTeoricos = 0;
                    if (zonaPaletera != null && zonaPaletera.ordenActual != null && zonaPaletera.ordenActual.id.Equals(ord.id))
                    {
                        //envasesTeoricos = DAO_Orden.ObtenerEnvasesTeoricosPaletera(ord.id, logTriggers);
                        envasesTeoricos = DAO_Orden.ObtenerEnvasesTeoricosEtiquetadoraPalets(ord.idOrdenPadre, logTriggers);

                        if (logTriggers)
                        {
                            DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración función MES_GetEnvasesTeoricosPaleteraOrden. Orden " + ord.id, timer.Elapsed.ToString(), "Info");
                        }
                        timer.Restart();

                        DatosProduccion resultPaletera = null;
                        DatosProduccion resultEtiquetadora = null;
                        using (MESEntities contexto = new MESEntities())
                        {
                            foreach (Maquina maquina in ord._refLinea.paleteras)
                            {
                                // La tabla ConfiguracionMaquinasCompartidas sólo contiene información para las líneas compartidas de Alovera (11A y 11B)
                                var data = contexto.ConfiguracionMaquinasCompartidas.AsNoTracking().Where(c => c.Maquina == maquina.nombre && c.Activa).FirstOrDefault();
                                // La propiedad Grupo de las Líneas sólo contiene data para las líneas compartidas (11A y 11B de Alovera y 2 y 5 de Solan)
                                // Las líneas 2 y 5 de Solan no tienen configuración de máquinas compartidas por lo que para que se tengan en cuenta hay
                                // que preguntar por si estamos en ese centro
                                if (string.IsNullOrEmpty(ord._refLinea.Grupo) || (PlantaRT.planta != null && PlantaRT.planta.nombre.ToUpper().Contains("SOLAN")) || data != null)
                                {
                                    resultPaletera = this.ObtenerDatosProduccionMaquina(dtHoraActualUtc, dtNow, maquina.id);

                                    if (logTriggers)
                                    {
                                        DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración paletera llamada componente OEECli. Máquina " + maquina.id, timer.Elapsed.ToString(), "Info");
                                    }
                                    timer.Restart();

                                    if (resultPaletera != null)
                                    {
                                        resultPaletera.cantidadProducida = (dtNow.Minute >= 0 && dtNow.Minute <= 3) ? 0 : resultPaletera.cantidadProducida;
                                        dtProd.paletsProducidos += resultPaletera.cantidadProducida;
                                        dtProd.paletsProducidosHoraActual = resultPaletera.cantidadProducida;
                                        //envasesTeoricos += resultPaletera.velocidadNominal;
                                    }
                                }
                            }

                            foreach (Maquina maquina in ord._refLinea.etiquetadoras)
                            {
                                // La tabla ConfiguracionMaquinasCompartidas sólo contiene información para las líneas compartidas de Alovera (11A y 11B)
                                var data = contexto.ConfiguracionMaquinasCompartidas.AsNoTracking().Where(c => c.Maquina == maquina.nombre && c.Activa).FirstOrDefault();
                                // La propiedad Grupo de las Líneas sólo contiene data para las líneas compartidas (11A y 11B de Alovera y 2 y 5 de Solan)
                                // Las líneas 2 y 5 de Solan no tienen configuración de máquinas compartidas por lo que para que se tengan en cuenta hay
                                // que preguntar por si estamos en ese centro
                                if (string.IsNullOrEmpty(ord._refLinea.Grupo) || (PlantaRT.planta != null && PlantaRT.planta.nombre.ToUpper().Contains("SOLAN")) || data != null)
                                {
                                    dtProd.paletsEtiquetadoraProducidos = DAO_Orden.ObtenerPaletsEtiquetadoraWO(ord.id);

                                    resultEtiquetadora = this.ObtenerDatosProduccionMaquina(dtHoraActualUtc, dtNow, maquina.id);

                                    if (logTriggers)
                                    {
                                        DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración etiquetadora palets llamada componente OEECli. Máquina " + maquina.id
                                            + (resultEtiquetadora == null ? " Sin datos " : " VN: " + resultEtiquetadora.velocidadNominal + " Cont: " +
                                            resultEtiquetadora.cantidadProducida), timer.Elapsed.ToString(), "Info");
                                    }
                                    timer.Restart();

                                    if (resultEtiquetadora != null)
                                    {
                                        envasesTeoricos += resultEtiquetadora.velocidadNominal;
                                    }
                                }
                            }
                        }
                    }

                    Zona zonaEncajonadoraEmpaquetadora = ord._refLinea.zonas.Find(z => z.esEncajonadora || z.esEmpaquetadora);
                    if (zonaEncajonadoraEmpaquetadora != null && zonaEncajonadoraEmpaquetadora.ordenActual != null && zonaEncajonadoraEmpaquetadora.ordenActual.id.Equals(ord.id))
                    {
                        foreach (Maquina maquina in ord._refLinea.encajonadoras)
                        {
                            DatosProduccion resultEmpaquetadora = this.ObtenerDatosProduccionMaquina(dtHoraActualUtc, dtNow, maquina.id);

                            if (logTriggers)
                            {
                                DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración encajonadora llamada componente OEECli. Máquina " + maquina.id, timer.Elapsed.ToString(), "Info");
                            }
                            timer.Restart();

                            if (resultEmpaquetadora != null)
                            {
                                dtProd.cajas += resultEmpaquetadora.cantidadProducida;
                                dtProd.cajasHoraActual = resultEmpaquetadora.cantidadProducida;
                            }
                        }
                    }

                    if (dtNow > ord.FechaActualizacion)
                    {
                        double secondsPlanifHoraAct = (dtNow - dtHoraActualUtc).TotalSeconds;
                        tiempoPlanificadoPal += secondsPlanifHoraAct;
                        double envasesReales = dtProd.paletsEtiquetadoraProducidos * ord.EnvasesPorPalet;
                        double velocidadNominal = 0;

                        if (string.IsNullOrEmpty(ord._refLinea.Grupo))
                        {
                            velocidadNominal = ord.velocidadNominal;
                        }
                        else
                        {
                            //Líneas Especiales
                            ord.dFecArranqueEnLLenadora = ord.dFecArranqueEnLLenadora == null ? DAO_Orden.ObtenerFechaArranqueLlenadora(ord.id, logTriggers) : ord.dFecArranqueEnLLenadora;
                            if (ord.dFecArranqueEnLLenadora.HasValue)
                            {
                                foreach (Maquina maquina in ord._refLinea.llenadoras)
                                {
                                    DatosProduccion resultLlenadora = this.ObtenerDatosProduccionMaquina(ord.dFecArranqueEnLLenadora.Value, dtNow, maquina.id);

                                    if (logTriggers)
                                    {
                                        DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Duración llenadora llamada componente OEECli línea especial. Máquina " + maquina.id, timer.Elapsed.ToString(), "Info");
                                    }
                                    timer.Restart();

                                    if (resultLlenadora != null)
                                    {
                                        velocidadNominal += resultLlenadora.velocidadNominal;
                                    }
                                }
                            }
                            velocidadNominal = (dtNow - ord.dFecInicio).TotalHours > 0 ? velocidadNominal / ((dtNow - ord.dFecInicio).TotalHours) : 0;
                        }

                        //double envasesTeoricos = (tiempoPlanificadoPal / 3600) * ord.velocidadNominal;
                        //double envasesPicos = ord.CajasPorPalet > 0 ? (dtProd.cantidadPicosCajas * ord.EnvasesPorPalet) / ord.CajasPorPalet : 0;
                        //dtProd.oee = envasesTeoricos > 0 ? ((envasesReales + envasesPicos) / envasesTeoricos) * 100 : ord.OEE;
                        //dtProd.oee = envasesTeoricos > 0 ? ((envasesReales + envasesPicos) / envasesTeoricos) * 100 : 0;
                        dtProd.oee = envasesTeoricos > 0 ? (envasesReales / envasesTeoricos) * 100 : 0;
                        dtProd.rendimiento = envasesTeoricos > 0 ? (dtProd.envases / envasesTeoricos) * 100 : 0;
                    }
                }

                //Copiamos los datos de prod de la orden
                ord.produccion = dtProd;

                timer.Stop();
            }
            catch (Exception ex)
            {
                if (logTriggers)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Datos de producción partición", "Error: " + ex.Message, "Error");
                }
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_PROD") + " - " + ex.Message, "DAO_Produccion.obtenerDatosProduccionParticion", "WEB-WO", HttpContext.Current?.User?.Identity.Name ?? "SISTEMA");
                //throw new Exception("Error al obtener los datos de producción");
            }
        }

        /// <summary>
        /// Obtiene conversiones de aquellas ordenes que no tengan dicho dato
        /// </summary>
        public static void GetConversionesOrden(bool logTriggers = false)
        {
            try
            {
                List<Orden> listOrdenes = PlantaRT.obtenerOrdenesActivasPendientes();

                DAO_Orden.ObtenerConversionesProducto(listOrdenes.Where(o => o.CajasPorPalet == 0 || o.EnvasesPorPalet == 0).ToList());
            }
            catch (Exception ex)
            {
                if (logTriggers)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-Proc. almacenado MES_ObtenerConversionesOrdenes", "Error: " + ex.Message, "Error");
                }

                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.getConversionesOrden", "WEB-WO", "Sistema");
            }
        }

        /// <summary>
        /// Obtiene hectolitros de aquellas ordenes que no tengan dicho dato en sus productos
        /// </summary>
        public static void GetHectolitrosOrden()
        {
            try
            {
                List<Orden> listOrdenes = PlantaRT.obtenerOrdenesActivasPendientes();

                DAO_Orden.ObtenerHectolitrosProducto(listOrdenes.Where(o => o.producto.hectolitros == null || o.producto.hectolitros == 0).ToList());
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-Proc. almacenado MES_ObtenerHectolitrosProductoOrdenes", "Error: " + ex.Message, "Error");
                }

                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.getHectolitrosOrden", "WEB-WO", "Sistema");
            }
        }

        public void obtenerDatosProduccionPlanta(ref P.Planta planta)
        {
            try
            {
                // Para cada Linea    
                //DAO_Log.registrarLogTraza("DAO_Produccion" ,"obtenerDatosProduccion", "obtenerDatosProduccionPlanta");
                foreach (Linea linea in planta.lineas)
                {
                    //DAO_Log.registrarLogTraza("DAO_Produccion", "obtenerDatosProduccion", "obtenerDatosProduccionPlanta, linea" + linea.numLinea);
                    this.obtenerDatosProduccionLinea(linea);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_PROD") + " - " + ex.Message, "DAO_Produccion.obtenerDatosProduccionPlanta", "WEB-WO", "Sistema");

                //throw new Exception("Error al obtener los datos de producción");
            }
        }

        public void obtenerDatosProduccionLinea(Linea linea)
        {
            try
            {
                foreach (Orden ord in linea.ordenesActivas)
                {
                    DAO_Produccion daoProduccion = new DAO_Produccion();

                    //Utilizamos sólo la obtencion de datos de producción de particiones las ordenes padre son sólo para el histórico, no se tienen que mantener en memoria
                    //DAO_Log.registrarLogTraza("DAO_Produccion", "obtenerDatosProduccionLinea", "obtenerDatosProduccionLinea activas, ord:" + ord.id);
                    DateTime dtHoraActual = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day).AddHours(DateTime.UtcNow.Hour);
                    daoProduccion.obtenerDatosProduccionParticion(ord, DateTime.UtcNow, dtHoraActual);
                }
                ///TODO Cuando este lista la regla de calculo de produccion para ordenes mirar a ver que hacer, no tenemos un testigo de cuando se pausó la orden se sigue incrementando la producción
                foreach (Orden ord in linea.ordenesPendientes)
                {
                    //if (ord.estadoActual.nombre == "Pausada")
                    if (ord.estadoActual.Estado.Equals(Tipos.EstadosOrden.Pausada) || ord.estadoActual.Estado.Equals(Tipos.EstadosOrden.Finalizada))
                    {
                        DAO_Produccion daoProduccion = new DAO_Produccion();
                        DateTime dtHoraActual = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day).AddHours(DateTime.UtcNow.Hour);
                        daoProduccion.obtenerDatosProduccionParticion(ord, DateTime.UtcNow, dtHoraActual);

                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_PROD") + " - " + ex.Message, "DAO_Produccion.obtenerDatosProduccion", "WEB-WO", HttpContext.Current.User.Identity.Name);
                //throw new Exception("Error al obtener los datos de producción");
            }
        }

        public DatosProduccion ObtenerDatosConsolidadosTurno(int idTurno)
        {
            DatosProduccion dtProd = null;
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerConsolidadosTurno]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idTurno", idTurno);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                dtProd = new DatosProduccion();
                                dtProd.palets = (int)row["TotalPalets"];
                                dtProd.envases = (int)row["TotalEnvases"];
                                dtProd.cajas = (int)row["TotalCajas"];
                                dtProd.tiempoOperativo = (double)row["TIEMPO_OPERATIVO"];
                                dtProd.tiempoPlanificado = (double)row["TIEMPO_PLANIFICADO"];
                                dtProd.tiempoNeto = (double)row["TIEMPO_NETO"];
                                dtProd.velocidadNominal = (double)row["VELOCIDAD_NOMINAL"];
                                dtProd.CalidadSinPorcentaje = Convert.ToDouble(row["IC_TURNO"]);
                            }
                        }
                    }
                }

                return dtProd;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.ObtenerDatosConsolidadosTurnoAnterior", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.ObtenerDatosConsolidadosTurno", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_LOS_DATOS_DE"));
            }

        }

        public List<DatosProduccion> obtenerConsolidadosLlenadoraMaquina(int idTurno)
        {
            List<DatosProduccion> lstProd = new List<DatosProduccion>();
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerConsolidadoTurnoLlenadoraPorOrden]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idTurno", idTurno);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                DatosProduccion dtProd = new DatosProduccion();
                                Maquina m = new Maquina();
                                m.id = (string)row["ID_MAQUINA"];
                                dtProd = new DatosProduccion();
                                dtProd.cajas = Convert.ToInt32(row["TotalCajas"]);
                                dtProd.maquina = m;
                                dtProd.envases = (int)row["TotalEnvases"];
                                dtProd.hectolitros = (double)row["HL"];
                                dtProd.tiempoOperativo = (double)row["TIEMPO_OPERATIVO"];
                                dtProd.tiempoPlanificado = (double)row["TIEMPO_PLANIFICADO"];
                                dtProd.tiempoNeto = (double)row["TIEMPO_NETO"];
                                dtProd.tiempoBruto = (double)row["TIEMPO_BRUTO"];
                                dtProd.rechazos = (int)row["CONTADOR_RECHAZOS"];
                                dtProd.velocidadNominal = (double)row["VELOCIDAD_NOMINAL"];
                                dtProd.CalidadSinPorcentaje = (double)row["ICT"];
                                lstProd.Add(dtProd);
                            }
                        }
                    }
                }

                return lstProd;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.obtenerConsolidadosLlenadoraMaquina", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerConsolidadosLlenadoraMaquina", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_LOS_DATOS_DE"));
            }
        }

        public List<DatosProduccion> obtenerConsolidadosEmpaquetadoraEncajonadoraMaquina(int idTurno)
        {
            List<DatosProduccion> lstProd = new List<DatosProduccion>();
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerConsolidadoTurnoEmpaquetadoraEncajonadora]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idTurno", idTurno);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                DatosProduccion dtProd = new DatosProduccion();
                                Maquina m = new Maquina();
                                m.id = (string)row["ID_MAQUINA"];
                                dtProd = new DatosProduccion();
                                dtProd.cantidadProducida = Convert.ToInt32(row["TotalCajas"]);
                                dtProd.maquina = m;
                                lstProd.Add(dtProd);
                            }
                        }
                    }
                }

                return lstProd;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.obtenerConsolidadosLlenadoraMaquina", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerConsolidadosEmpaquetadoraEncajonadoraMaquina", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_LOS_DATOS_DE"));
            }
        }

        public List<DatosProduccion> obtenerConsolidadosPaletizadoraMaquina(int idTurno)
        {
            List<DatosProduccion> lstProd = new List<DatosProduccion>();
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerConsolidadoTurnoPaletera]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idTurno", idTurno);
                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                DatosProduccion dtProd = new DatosProduccion();
                                Maquina m = new Maquina();
                                m.id = (string)row["ID_MAQUINA"];
                                dtProd = new DatosProduccion();
                                dtProd.cantidadProducida = Convert.ToInt32(row["TotalPalets"]);
                                dtProd.maquina = m;
                                lstProd.Add(dtProd);
                            }
                        }
                    }
                }

                return lstProd;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.obtenerConsolidadosLlenadoraMaquina", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerConsolidadosPaletizadoraMaquina", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_LOS_DATOS_DE"));
            }
        }

        public List<Dictionary<int, DatosProduccion>> obtenerConsolidadosLlenadoraHora(int idTurno)
        {
            List<Dictionary<int, DatosProduccion>> lstProd = new List<Dictionary<int, DatosProduccion>>();
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerDatosProduccionLlenadoraHora]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idTurno", idTurno);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);

                            if (dt != null && dt.Rows.Count > 0)
                            {

                                List<string> lstMaquinas = dt.AsEnumerable().Select(d => d.Field<string>("Nombre")).Distinct().ToList<string>();

                                foreach (string item in lstMaquinas)
                                {

                                    Dictionary<int, DatosProduccion> dProd = new Dictionary<int, DatosProduccion>();
                                    EnumerableRowCollection<DataRow> rows = dt.AsEnumerable().Where(d => d.Field<string>("Nombre").Equals(item));
                                    foreach (DataRow row in rows)
                                    {
                                        int hora = Convert.ToInt32(row["HORA"]);
                                        Maquina m = new Maquina();
                                        m.nombre = (string)row["Nombre"];
                                        DatosProduccion dtProd = new DatosProduccion(m, DateTime.MinValue, DateTime.MinValue);
                                        dtProd.tiempoNeto = (double)row["TiempoNeto"];
                                        dtProd.tiempoOperativo = (double)row["TiempoOperativo"];
                                        dtProd.tiempoBruto = (double)row["TiempoBruto"];
                                        dtProd.tiempoPlanificado = (double)row["TiempoPlanificado"];
                                        dtProd.velocidadNominal = (double)row["VelocidadNominal"];
                                        dtProd.cantidadProducida = (int)row["EnvasesProducidos"];
                                        dProd.Add(hora, dtProd);
                                    }
                                    lstProd.Add(dProd);
                                }
                            }
                        }
                    }
                }

                return lstProd;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.obtenerConsolidadosLlenadoraHora", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerConsolidadosLlenadoraHora", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CONSOLIDADOS"));
            }
        }

        internal static QueryResultGrafico obtenerDatosSemanasGraficoOEE(dynamic datos)
        {
            QueryResultGrafico result = new QueryResultGrafico();
            result.Fields = new List<string>();
            result.Types = new List<string>();
            result.Records = new List<Hashtable>();
            result.valores = new List<float>();

            int rangS = int.Parse(datos.rangoSemanas.ToString()) - 1;
            int anyo = int.Parse(datos.anho.ToString());
            int semana = int.Parse(datos.semana.ToString());
            int linea = int.Parse(datos.linea.ToString());
            string lineaStr = "";

            using (MESEntities context = new MESEntities())
            {
                lineaStr = context.Lineas.AsNoTracking().Where(p => p.NumeroLinea == linea).FirstOrDefault().Id;
            }

            DateTime fin = DateTime.Parse(datos.inicio.ToString());
            fin = fin.ToLocalTime();
            DateTime inicio = fin.ToLocalTime().AddDays(-7 * rangS);

            //DateTime origen = new DateTime(1970, 1, 1);

            //double iniciosec = (inicio - origen).TotalSeconds;
            //double finsec = (fin - origen).TotalSeconds;

            using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand comando = new SqlCommand())
                {
                    comando.Connection = conexion;
                    comando.CommandTimeout = 180;
                    comando.CommandType = CommandType.StoredProcedure;
                    comando.CommandText = "[dbo].[Informe_ANA_5_ObtenerProduccionTurnosConsolidada]";
                    comando.Parameters.AddWithValue("@linea", lineaStr);
                    comando.Parameters.AddWithValue("@fini", inicio.ToString("dd/MM/yyyy HH:mm:ss"));
                    comando.Parameters.AddWithValue("@ffin", fin.ToString("dd/MM/yyyy HH:mm:ss"));

                    try
                    {
                        conexion.Open();
                        SqlDataReader dr = comando.ExecuteReader();

                        String serienombre = "";
                        List<float> valores = new List<float>();
                        List<Series> serie = new List<Series>();
                        List<String> nombres = new List<String>();

                        while (dr.Read())
                        {
                            if (!nombres.Exists(element => element.Equals(dr["Fecha"].ToString())))
                            {
                                nombres.Add(dr["Fecha"].ToString());
                            }

                            if (!serienombre.Equals("OEE"))
                            {
                                if (valores.Count > 0)
                                {
                                    serie.Add(new Series { name = serienombre, data = valores });
                                }

                                serienombre = "OEE";

                                valores = new List<float>();
                            }
                            valores.Add(float.Parse(dr["OEE"].ToString()));

                        }

                        serie.Add(new Series { name = serienombre, data = valores });

                        result.Fields = nombres;
                        result.series = serie;
                    }
                    catch (Exception ex)
                    {
                        //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.obtenerDatosSemanasGraficoOEE", e, "Sistema");
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerDatosSemanasGraficoOEE", "WEB-WO", "Sistema");
                        throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRAFICO"));
                    }
                }
            }

            //Añadir tendencia
            var resultTendencia = result.series[0].data.Select((d, i) => new { valor = d, index = i + 1 }).ToList();
            TendenciaLineal tendencia = new TendenciaLineal(resultTendencia.Select(r => Convert.ToSingle(r.index)).ToList(), resultTendencia.Select(r => r.valor).ToList());

            List<float> valTend = new List<float>();
            foreach (var item in resultTendencia)
            {
                float valTendencia = tendencia.GetYValue(item.index);
                valTend.Add(valTendencia);
            }

            Series tend = new Series();
            tend.name = "Tendencia OEE";
            tend.data = valTend;
            result.series.Add(tend);

            return result;
        }

        internal static QueryResultGrafico obtenerDatosSemanasGraficoCambios(dynamic datos)
        {
            QueryResultGrafico result = new QueryResultGrafico();
            result.Fields = new List<string>();
            result.Types = new List<string>();
            result.Records = new List<Hashtable>();
            result.valores = new List<float>();

            int rangS = int.Parse(datos.rangoSemanas.ToString()) - 1;
            int anyo = int.Parse(datos.anho.ToString());
            int semana = int.Parse(datos.semana.ToString());
            int linea = int.Parse(datos.linea.ToString());
            string lineaStr = "";

            using (MESEntities context = new MESEntities())
            {
                lineaStr = context.Lineas.AsNoTracking().Where(p => p.NumeroLinea == linea).FirstOrDefault().Id;
            }

            DateTime fin = DateTime.Parse(datos.inicio.ToString());
            fin = fin.ToLocalTime();
            DateTime inicio = fin.ToLocalTime().AddDays(-7 * rangS);

            using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand comando = new SqlCommand())
                {
                    comando.Connection = conexion;
                    comando.CommandTimeout = 180;
                    comando.CommandType = CommandType.StoredProcedure;
                    comando.CommandText = "[dbo].[MES_ObtenerCambiosAnalisisSPI]";
                    comando.Parameters.AddWithValue("@Linea", lineaStr);
                    comando.Parameters.AddWithValue("@Inicio", inicio.ToString("dd/MM/yyyy HH:mm:ss"));
                    comando.Parameters.AddWithValue("@Fin", fin.ToString("dd/MM/yyyy HH:mm:ss"));

                    try
                    {
                        conexion.Open();
                        SqlDataReader dr = comando.ExecuteReader();

                        String serienombre = "";
                        List<float> valores = new List<float>();
                        List<Series> serie = new List<Series>();
                        List<String> nombres = new List<String>();

                        while (dr.Read())
                        {
                            if (!nombres.Exists(element => element.Equals(dr["Fecha"].ToString())))
                            {
                                nombres.Add(dr["Fecha"].ToString());
                            }

                            if (!serienombre.Equals(dr["seriesname"].ToString()))
                            {
                                if (valores.Count > 0)
                                {
                                    serie.Add(new Series { name = serienombre, data = valores });
                                }

                                serienombre = dr["seriesname"].ToString();

                                valores = new List<float>();
                            }
                            valores.Add(float.Parse(dr["seriesdata"].ToString()));

                        }

                        serie.Add(new Series { name = serienombre, data = valores });

                        result.Fields = nombres;
                        result.series = serie;
                    }
                    catch (Exception ex)
                    {
                        //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.obtenerDatosSemanasGraficoCambios", e, "Sistema");
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerDatosSemanasGraficoCambios", "WEB-WO", "Sistema");
                        throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRAFICO_CAMBIOS"));
                    }
                }
            }

            return result;
        }

        internal static QueryResultGrafico obtenerDatosSemanasGraficoArr(dynamic datos)
        {
            QueryResultGrafico result = new QueryResultGrafico();
            result.Fields = new List<string>();
            result.Types = new List<string>();
            result.Records = new List<Hashtable>();
            result.valores = new List<float>();

            int rangS = int.Parse(datos.rangoSemanas.ToString()) - 1;
            int anyo = int.Parse(datos.anho.ToString());
            int semana = int.Parse(datos.semana.ToString());
            int linea = int.Parse(datos.linea.ToString());
            string lineaStr = "";
            string tipo = datos.tipo.ToString();

            using (MESEntities context = new MESEntities())
            {
                lineaStr = context.Lineas.AsNoTracking().Where(p => p.NumeroLinea == linea).FirstOrDefault().Id;
            }

            DateTime fin = DateTime.Parse(datos.inicio.ToString());
            fin = fin.ToLocalTime();
            DateTime inicio = fin.ToLocalTime().AddDays(-7 * rangS);

            using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand comando = new SqlCommand())
                {
                    comando.Connection = conexion;
                    comando.CommandTimeout = 180;
                    comando.CommandType = CommandType.StoredProcedure;
                    comando.CommandText = "[dbo].[MES_ObtenerTiemposAnalisisSPI]";
                    comando.Parameters.AddWithValue("@Linea", lineaStr);
                    comando.Parameters.AddWithValue("@Tipo", tipo);
                    comando.Parameters.AddWithValue("@Inicio", inicio.ToString("dd/MM/yyyy HH:mm:ss"));
                    comando.Parameters.AddWithValue("@Fin", fin.ToString("dd/MM/yyyy HH:mm:ss"));

                    try
                    {
                        conexion.Open();
                        SqlDataReader dr = comando.ExecuteReader();

                        String serienombre = "";
                        List<float> valores = new List<float>();
                        List<Series> serie = new List<Series>();
                        List<String> nombres = new List<String>();

                        while (dr.Read())
                        {
                            if (!nombres.Exists(element => element.Equals(dr["Fecha"].ToString())))
                            {
                                nombres.Add(dr["Fecha"].ToString());
                            }

                            if (!serienombre.Equals(dr["seriesname"].ToString()))
                            {
                                if (valores.Count > 0)
                                {
                                    serie.Add(new Series { name = serienombre, data = valores });
                                }

                                serienombre = dr["seriesname"].ToString();

                                valores = new List<float>();
                            }
                            valores.Add(float.Parse(dr["seriesdata"].ToString()));

                        }

                        serie.Add(new Series { name = serienombre, data = valores });

                        result.Fields = nombres;
                        result.series = serie;
                    }
                    catch (Exception ex)
                    {
                        //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.obtenerDatosSemanasGraficoOEE", e, "Sistema");
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerDatosSemanasGraficoArr", "WEB-WO", "Sistema");
                        throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRAFICO"));
                    }
                }
            }

            return result;
        }

        internal static QueryResultGrafico obtenerDatosSemanasGrafico(dynamic datos)
        {
            string tipo = datos.tipo.ToString();

            switch (tipo)
            {
                case "OEE": return obtenerDatosSemanasGraficoOEE(datos);
                case "Cambios": return obtenerDatosSemanasGraficoCambios(datos);
                default: return obtenerDatosSemanasGraficoArr(datos);
            }
        }

        internal void obtenerDatosGeneralesParticion(Orden ord)
        {
            DataTable dt = new DataTable();
            //DAO_Log.registrarLogTraza("DAO_Produccion", "obtenerDatosProduccionParticion", "Inicio MES_ObtenerDatosProduccionParticion ord:" + ord.id);
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerDatosGeneralesParticion]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    //command.Parameters.AddWithValue("@listEstados", EstadosExcepcion);
                    command.Parameters.AddWithValue("@ordenId", ord.id);
                    //command.Parameters.AddWithValue("@ordenIdPadre", ord.idOrdenPadre);
                    //command.Parameters.AddWithValue("@subordenId", ord.idSuborden);

                    using (SqlDataAdapter da = new SqlDataAdapter())
                    {
                        connection.Open();
                        da.SelectCommand = command;

                        DataSet ds = new DataSet();
                        da.Fill(ds);
                        dt = ds.Tables.Count > 0 ? ds.Tables[0] : null;
                    }
                }
            }

            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    ord.dFecFin = row["FecFinReal"] != System.DBNull.Value ? Convert.ToDateTime(row["FecFinReal"]) : ord.dFecFin;
                    ord.dFecInicio = row["FecIniReal"] != System.DBNull.Value ? Convert.ToDateTime(row["FecIniReal"]) : ord.dFecInicio;
                }
            }
        }

        internal Orden obtenerDatosProduccionParticion(string idParticion)
        {
            Orden orden = new Orden();
            try
            {
                DataTable dt = new DataTable();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerDatosProduccionParticion]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@ordenId", idParticion);
                        command.CommandTimeout = 0;
                        using (SqlDataAdapter da = new SqlDataAdapter())
                        {
                            connection.Open();
                            da.SelectCommand = command;

                            DataSet ds = new DataSet();
                            da.Fill(ds);
                            dt = ds.Tables.Count > 0 ? ds.Tables[0] : null;
                        }
                    }
                }

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        orden.produccion = new DatosProduccionOrden();
                        orden.produccion.paletsEtiquetadoraProducidos = Convert.ToInt32(row["PaletsETQProducidos"]);
                        orden.produccion.paletsProducidos = Convert.ToInt32(row["PaletsProducidos"]);
                        orden.produccion.envases = Convert.ToInt32(row["EnvasesProducidos"]);
                        orden.produccion.oee = Convert.ToDouble(row["OEE"]);
                        orden.calidad = Convert.ToDouble(row["IC"]);
                        orden.produccion.cajas = Convert.ToInt32(row["CajasProducidas"]);
                        orden.produccion.cantidadPicosCajas = Convert.ToInt32(row["PicosCajas"]);
                        orden.produccion.cantidadPicosPalets = Convert.ToInt32(row["PicosPalets"]);
                        orden.produccion.cantidadEnvasesNoConformidad = Convert.ToInt32(row["EnvNoConformidad"]);
                        orden.rechazosLlenadoraAutomatico = Convert.ToInt32(row["RechazosLlenadora"]);
                        orden.rechazosClasificadorAutomatico = Convert.ToInt32(row["RechazosClasificadores"]);
                        orden.rechazosProductoTerminadoAutomatico = Convert.ToInt32(row["RechazosProductoTerminado"]);
                        orden.rechazosVaciosAutomatico = Convert.ToInt32(row["RechazosInspectorBotellasVacias"]);
                        orden.id = idParticion;
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.obtenerDatosProduccionOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerDatosProduccionParticion", "WEB-WO", "Sistema");
            }
            return orden;
        }

        internal Orden obtenerDatosProduccionOrden(string idOrden)
        {
            Orden orden = new Orden();
            try
            {
                DataTable dt = new DataTable();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerDatosProduccionOrden]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@ordenId", idOrden);
                        command.CommandTimeout = 0;
                        using (SqlDataAdapter da = new SqlDataAdapter())
                        {
                            connection.Open();
                            da.SelectCommand = command;

                            DataSet ds = new DataSet();
                            da.Fill(ds);
                            dt = ds.Tables.Count > 0 ? ds.Tables[0] : null;
                        }
                    }
                }

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        orden.produccion = new DatosProduccionOrden();
                        orden.produccion.paletsEtiquetadoraProducidos = Convert.ToInt32(row["PaletsETQProducidos"]);
                        orden.produccion.paletsProducidos = Convert.ToInt32(row["PaletsProducidos"]);
                        orden.produccion.envases = Convert.ToInt32(row["EnvasesProducidos"]);
                        orden.produccion.oee = Convert.ToDouble(row["OEE"]);
                        orden.produccion.cajas = Convert.ToInt32(row["CajasProducidas"]);
                        orden.produccion.cantidadPicosCajas = Convert.ToInt32(row["PicosCajas"]);
                        orden.rechazosLlenadoraAutomatico = Convert.ToInt32(row["RechazosLlenadora"]);
                        orden.rechazosClasificadorAutomatico = Convert.ToInt32(row["RechazosClasificadores"]);
                        orden.rechazosProductoTerminadoAutomatico = Convert.ToInt32(row["RechazosProductoTerminado"]);
                        orden.rechazosVaciosAutomatico = Convert.ToInt32(row["RechazosInspectorBotellasVacias"]);
                        orden.id = (string)row["IdOrden"];
                        orden.calidad = Convert.ToDouble(row["IC"]);
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.obtenerDatosProduccionOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerDatosProduccionOrden", "WEB-WO", "Sistema");
            }
            return orden;
        }

        internal static List<DatosContingeciaOrden> ObtenerDatosGeneralesAntiguos(string idParticion)
        {
            List<DatosContingeciaOrden> dtProd = new List<DatosContingeciaOrden>();
            try
            {
                DataTable dt = new DataTable();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerValoresAntiguosFechas]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@ordenId", idParticion);

                        using (SqlDataAdapter da = new SqlDataAdapter())
                        {
                            connection.Open();
                            da.SelectCommand = command;

                            DataSet ds = new DataSet();
                            da.Fill(ds);
                            dt = ds.Tables.Count > 0 ? ds.Tables[0] : null;
                        }
                    }
                }

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        DatosContingeciaOrden dtFechasOrden = new DatosContingeciaOrden();
                        dtFechasOrden.fecInicio = row["FechaInicioReal"] == DBNull.Value || string.IsNullOrEmpty(row["FechaInicioReal"].ToString()) ? DateTime.MinValue : Convert.ToDateTime(row["FechaInicioReal"]);
                        dtFechasOrden.fecFin = row["FechaFinReal"] == DBNull.Value || string.IsNullOrEmpty(row["FechaFinReal"].ToString()) ? DateTime.MinValue : Convert.ToDateTime(row["FechaFinReal"]);
                        dtProd.Add(dtFechasOrden);
                        DatosContingeciaOrden dtFechasOrdenRespaldo = new DatosContingeciaOrden();
                        dtFechasOrdenRespaldo.fecInicio = row["FechaInicioRealOld"] == DBNull.Value || string.IsNullOrEmpty(row["FechaInicioRealOld"].ToString()) ? DateTime.MinValue : Convert.ToDateTime(row["FechaInicioRealOld"]);
                        dtFechasOrdenRespaldo.fecFin = row["FechaInicioRealOld"] == DBNull.Value || string.IsNullOrEmpty(row["FechaFinRealOld"].ToString()) ? DateTime.MinValue : Convert.ToDateTime(row["FechaFinRealOld"]);
                        dtProd.Add(dtFechasOrdenRespaldo);
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Produccion.ObtenerDatosGeneralesAntiguos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.ObtenerDatosGeneralesAntiguos", "WEB-WO", "Sistema");
            }
            return dtProd;
        }

        internal List<DatosProduccion> obtenerConsolidadosEtiquetadolaPaletsMaquina(int idTurno)
        {
            List<DatosProduccion> lstProd = new List<DatosProduccion>();
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerConsolidadoEtiquetadoraPalets]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idTurno", idTurno);
                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                DatosProduccion dtProd = new DatosProduccion();
                                Maquina m = new Maquina();
                                m.id = (string)row["ID_MAQUINA"];
                                dtProd = new DatosProduccion();
                                dtProd.cantidadProducida = Convert.ToInt32(row["TotalPalets"]);
                                dtProd.maquina = m;
                                lstProd.Add(dtProd);
                            }
                        }
                    }
                }

                return lstProd;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.obtenerConsolidadosEtiquetadolaPaletsMaquina", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_LOS_DATOS_DE"));
            }
        }

        public DatosRechazosTurno ObtenerRechazosTurno(int idTurno)
        {
            try
            {
                DatosRechazosTurno datosRechazoTurno = new DatosRechazosTurno();
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerRechazosTurno]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idTurno", idTurno);
                        command.CommandTimeout = 60;
                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();

                            DataTable dt = new DataTable();
                            da.Fill(dt);

                            if (dt != null && dt.Rows.Count > 0)
                            {
                                foreach (DataRow row in dt.Rows)
                                {
                                    datosRechazoTurno.rechazosClasificadorAutomatico = (int)row["rechazosClasificadorAutomatico"];
                                    datosRechazoTurno.rechazosProductoTerminadoAutomatico = (int)row["rechazosProductoTerminadoAutomatico"];
                                    datosRechazoTurno.rechazosSalidaLlenadoraAutomatico = (int)row["rechazosSalidaLlenadoraAutomatico"];
                                    datosRechazoTurno.rechazosVaciosAutomatico = (int)row["rechazosVaciosAutomatico"];
                                }
                            }
                        }
                    }
                }

                return datosRechazoTurno;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.ObtenerRechazosTurno", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_RECHAZOS"));
            }
        }

        public List<DateTime> ObtenerFechasFinProduccionReal(string linea, DateTime fechaInicioTurno, DateTime fechaActual)
        {
            using (MESEntities contexto = new MESEntities())
            {
                return contexto.GraficaProduccionTeoricaVSReal.AsNoTracking().Where(g => g.Linea == linea && g.Fecha > fechaInicioTurno && 
                    g.Fecha <= fechaActual && g.ProduccionReal == null).Select(g => g.Fecha).ToList();
            }
        }

        /// <summary>
        /// Método que obtiene la producción real de las máquinas llenadoras en un rango de fechas
        /// </summary>
        /// <param name="fechaFin">Fecha Fin</param>
        /// <param name="fechaInicio">Fecha Inicio</param>
        /// <param name="maquina">Nombre de la máquina</param>
        /// <returns></returns>
        public int ObtenerProduccionRealLlenadoras(DateTime fechaInicio, DateTime fechaFin, string maquina)
        {
            fechaInicio = new DateTime(fechaInicio.Year, fechaInicio.Month, fechaInicio.Day, fechaInicio.Hour, fechaInicio.Minute, fechaInicio.Second);
            fechaFin = new DateTime(fechaFin.Year, fechaFin.Month, fechaFin.Day, fechaFin.Hour, fechaFin.Minute, fechaFin.Second);

            if (fechaInicio >= fechaFin) return 0;
            if (ConfigurationManager.AppSettings["DATOS_PROD_SIT"] == "true") return 0;

            try
            {
                Dictionary<string, object> result = MaquinaBread.obtenerDatosProduccionMaquina(fechaFin, fechaInicio, maquina);

                if (result == null) return 0;

                DTO_DatosProduccionMaquinaSIT prodMaqSit = MSM.Utilidades.Utils.DictionaryToObject<DTO_DatosProduccionMaquinaSIT>(result);

                var datosProduccion = new DatosProduccion();
                datosProduccion.cantidadProducida = prodMaqSit.CONTADOR_PRODUCCION;

                result = null;
                prodMaqSit = null;

                return datosProduccion.cantidadProducida;
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogEnvasesLlenadora)
                {
                    DAO_Log.EscribeLog("PROD_ENV_LLE-Producción real llamada componente OEECli. Llenadora " + maquina, "Error: " + ex.Message, "Error");
                }

                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.ObtenerProduccionRealLlenadoras", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        public void GuardarProduccionRealLlenadoras(string linea, DateTime fecha, int? produccionReal)
        {
            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    var grafica = contexto.GraficaProduccionTeoricaVSReal.FirstOrDefault(g => g.Linea == linea && g.Fecha == fecha && g.ProduccionReal == null);

                    if (grafica != null)
                    {
                        grafica.ProduccionReal = produccionReal;
                        contexto.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.GuardarProduccionRealLlenadoras", "I-MES-REALTIME", "Sistema");
            }
        }

        public async Task<List<DTO_ProduccionMaquinas>> ObtenerProduccionMaquinasTurno(int idTurno, int numLinea)
        {
            var result = await _api.GetPostsAsync<List<DTO_ProduccionMaquinas>>(string.Concat(_urlProduccion, "ProduccionMaquinasTurno?idTurno=", idTurno));

            var daoOrden = new DAO_Orden();

            var ordenesActivas = daoOrden.ObtenerWOActivas();

            foreach (var e in result)
            {
                if (e.IdParticion != null)
                {
                    var orden = ordenesActivas.Find(f => f.id == e.IdParticion);
                    if (orden != null)
                    {
                        e.OEE = orden.OEE;
                    }
                }
            }

            if (result != null)
            {
                List<Turno> listTurnos = PlantaRT.planta.turnoActual;
                Turno turnoActual = listTurnos.Where(p => p.linea.numLinea == numLinea).FirstOrDefault();

                // Si el turno es el actual, añadimos los contadores de la producción actual
                if (turnoActual != null && turnoActual.idTurno == idTurno)
                {
                    DateTime fecActual = DateTime.Now;
                    DateTime fecInicio = fecActual.Date.AddHours(fecActual.Hour);

                    foreach (var d in result)
                    {
                        // El OEECli no trae datos de Etiquetadora de Palets. Nos ahorramos la llamada en ese caso
                        if (d.Maquina.id.ToUpper().Contains("EQP"))
                        {
                            continue;
                        }
                        DatosProduccion dtProd = ObtenerDatosProduccionMaquina(fecInicio.ToUniversalTime(), fecActual.ToUniversalTime(), d.Maquina.id);
                        if (dtProd != null)
                        {
                            d.CantidadProducida += dtProd.cantidadProducida;
                        }
                    }
                }
            }
            return result;
        }

        internal static void ActualizarEtiquetasPaletsConsolidado(DateTime fecha)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (var command = new SqlCommand("[MES_EtiquetasPalets_ActualizarContadorConsolidado]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@FechaInicio", fecha);
                    command.Parameters.AddWithValue("@FechaFin", fecha);
                    command.CommandTimeout = 180;

                    connection.Open();
                    command.ExecuteNonQuery();
                }
            }
        }

        public static bool ActualizarContadorConsolidado(List<ProduccionDto> producciones)
        {
            try
            {
                DateTime fechaUnDiaMenos = DateTime.Now.AddDays(-1);
                List<DateTime> listaFechas = producciones.Where(x => x.EtiquetaProducedAt.ToLocalTime() < fechaUnDiaMenos).Select(x => x.EtiquetaProducedAt.ToLocalTime().Date).Distinct().ToList();

                foreach (var fecha in listaFechas)
                {
                    ActualizarEtiquetasPaletsConsolidado(fecha);
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.ActualizarContadorConsolidado", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        internal static void ActualizarEtiquetasPaletsInfoMEStProduccion(DateTime fecha)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (var command = new SqlCommand("[MES_EtiquetasPalets_ActualizarInfoMEStProduccion]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@FechaInicio", fecha);
                    command.Parameters.AddWithValue("@FechaFin", fecha);
                    command.CommandTimeout = 180;

                    connection.Open();
                    command.ExecuteNonQuery();
                }
            }
        }

        public static bool ActualizarInfoMEStProduccion(List<ProduccionDto> producciones)
        {
            try
            {
                DateTime fechaUnDiaMenos = DateTime.Now.AddDays(-1);
                List<DateTime> listaFechas = producciones.Where(x => x.EtiquetaProducedAt.ToLocalTime() < fechaUnDiaMenos).Select(x => x.EtiquetaProducedAt.ToLocalTime().Date).Distinct().ToList();

                foreach (var fecha in listaFechas)
                {
                    ActualizarEtiquetasPaletsInfoMEStProduccion(fecha);
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Produccion.ActualizarInfoMEStProduccion", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }
    }
}
