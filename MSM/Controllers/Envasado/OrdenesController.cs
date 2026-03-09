using Clients.ApiClient.Contracts;
using G2Base;
using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using MSM.Models.Planta;
using MSM.RealTime;
using MSM.Security;
using MSM.Utilidades;
using ReglasMES;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    class EstadoComparer : IComparer<Orden>
    {
        private string ordenAsignadaZona = "";
        public EstadoComparer(string ordenAsignadaZona): base()
        {
            this.ordenAsignadaZona = ordenAsignadaZona;
        }

        public int Compare(Orden x, Orden y)
        {
            int comparacion = 0;
            Tipos.EstadosOrden[] estados = 
            {
                Tipos.EstadosOrden.Producción,
                Tipos.EstadosOrden.Iniciando,
                Tipos.EstadosOrden.Iniciar,
                Tipos.EstadosOrden.Pausada,
                Tipos.EstadosOrden.Planificada, 
            };
            int indice1 = Array.IndexOf(estados, x.estadoActual.Estado);
            int indice2 = Array.IndexOf(estados, y.estadoActual.Estado);
            //si la orden esta asignada a la zona tiene que ser la primera, le pones indice -1
            if (this.ordenAsignadaZona == x.id)  indice1 = -1;            
            if (this.ordenAsignadaZona == y.id)  indice2 = -1;
       
            if (indice1 == indice2)
            {
                if (DateTime.Parse(x.fecInicioEstimado) == DateTime.Parse(y.fecInicioEstimado)) { comparacion = 0; }
                else if (DateTime.Parse(x.fecInicioEstimado) < DateTime.Parse(y.fecInicioEstimado)) { comparacion = -1; }
                else { comparacion = 1; }
            }
            else if (indice1 < indice2) { comparacion = -1; }
            else { comparacion = 1; }

            return comparacion;
        }
    }

    [Authorize]
    public class OrdenesController : ApiController
    {
        private readonly IDAO_Turnos _iDAOTurnos;
        private readonly IDAO_Orden _iDAO_Orden;

        public OrdenesController(IDAO_Turnos iDAOTurnos, IDAO_Orden iDAO_Orden)
        {
            _iDAOTurnos = iDAOTurnos;
            _iDAO_Orden = iDAO_Orden;
        }

        [Route("api/ordenesActivas/{idLinea}/{idZona}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_VisualizacionListadoDeWo)]
        public IEnumerable<Orden> Get(string idLinea, string idZona)
        {
            if (string.IsNullOrEmpty(idLinea) || string.IsNullOrEmpty(idZona))
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                    $"Se ha intentado obtener las ordenes activas con datos de linea y zona incorrectos: Linea {idLinea ?? ""}, Zona: {idZona ?? ""}",
                    "OrdenesController.Get", "WEB-PLANTA", HttpContext.Current.User.Identity.Name ?? "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES"));
            }

            try
            {
                if (PlantaRT.planta == null || PlantaRT.planta.lineas == null)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                        "Planta o líneas no disponibles", "OrdenesController.Get", "WEB-PLANTA", HttpContext.Current.User.Identity.Name ?? "Sistema");
                    throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES"));
                }

                Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                if (lin == null || lin.zonas == null)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                        $"No se encontró la línea con ID: {idLinea} o no tiene zonas", "OrdenesController.Get", "WEB-PLANTA", HttpContext.Current.User.Identity.Name ?? "Sistema");
                    throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES"));
                }

                Zona zon = lin.zonas.Find(z => z.id == idZona);
                if (zon == null)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 6, 2,
                        $"No se encontró la zona con ID: {idZona} en la línea {idLinea}", "OrdenesController.Get", "WEB-PLANTA", HttpContext.Current.User.Identity.Name ?? "Sistema");
                    throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES"));
                }

                List<Orden> ordenesZonaAux = new List<Orden>();
                if (zon.ordenActual != null) ordenesZonaAux.Add(zon.ordenActual);
                string orderIdZona = zon.ordenActual?.id ?? "";

                ordenesZonaAux.AddRange(lin.ordenesActivas.Where(o =>
                    (o.estadoActual.Estado == Tipos.EstadosOrden.Producción || o.estadoActual.Estado == Tipos.EstadosOrden.Iniciando)
                    && o.id != orderIdZona));

                if (lin.ordenesPendientes?.Count > 0)
                {
                    var lstOrdenesPlanif = lin.ordenesPendientes
                        .Where(o => o.estadoActual.Estado == Tipos.EstadosOrden.Planificada && o.id != orderIdZona).ToList();

                    var lstOrdenesPausadas = lin.ordenesPendientes
                        .Where(o => o.estadoActual.Estado == Tipos.EstadosOrden.Pausada && o.id != orderIdZona).ToList();

                    foreach (Orden ordenPausada in lstOrdenesPausadas)
                    {
                        if (ordenPausada.produccion != null)
                        {
                            ordenPausada.produccion.paletsEtiquetadoraProducidos = DAO_Orden.ObtenerPaletsEtiquetadoraWO(ordenPausada.id);
                        }
                    }

                    ordenesZonaAux.AddRange(lstOrdenesPlanif);
                    ordenesZonaAux.AddRange(lstOrdenesPausadas);
                }

                // Calcular particiones
                ordenesZonaAux = ordenesZonaAux.OrderBy(o => o.idOrdenPadre).ThenByDescending(o => o.idSuborden).ToList();
                string idOrdenPadre = "";
                int numParticiones = 0;

                foreach (Orden o in ordenesZonaAux)
                {
                    if (!o.idOrdenPadre.Equals(idOrdenPadre))
                    {
                        numParticiones = o.idSuborden;
                    }
                    o.numParticiones = numParticiones;
                    idOrdenPadre = o.idOrdenPadre;
                }

                // Filtrar orden hija de menor partición
                List<Orden> ordenesZona = new List<Orden>();
                ordenesZonaAux = ordenesZonaAux.OrderBy(o => o.idOrdenPadre).ThenBy(o => o.idSuborden).ToList();
                idOrdenPadre = "";

                foreach (Orden o in ordenesZonaAux)
                {
                    if (!o.idOrdenPadre.Equals(idOrdenPadre))
                    {
                        if (o.estadoActual.Estado == Tipos.EstadosOrden.Pausada)
                        {
                            o.duracionReal = DAO_Orden.ObtenerDuracionReal(o.id);
                        }
                        else if (o.estadoActual.Estado != Tipos.EstadosOrden.Producción && o.estadoActual.Estado != Tipos.EstadosOrden.Iniciando && o.estadoActual.Estado != Tipos.EstadosOrden.Iniciar)
                        {
                            o.duracion = DAO_Orden.ObtenerDuracion(o.idLinea, o.dFecInicioEstimado, o.dFecFinEstimado);
                        }
                        else if (o.estadoActual.Estado == Tipos.EstadosOrden.Producción || o.estadoActual.Estado == Tipos.EstadosOrden.Iniciando || o.estadoActual.Estado == Tipos.EstadosOrden.Iniciar)
                        {
                            o.fecFinEstimadoCalculadoTurno = Utils.getDateTurno(PlantaRT.planta.turnoActual.Find(x => x.linea.numLinea == lin.numLinea), o);
                            var fecFinEstimadoCalculado = o.fecFinEstimadoCalculado;
                            if (o.fecFinEstimadoCalculadoTurno != IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE") &&
                                !(o.fecFinEstimadoCalculadoTurno.Equals(IdiomaController.GetResourceName("NO_DISPONIBLE")) ||
                                 fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("NO_DISPONIBLE")) ||
                                 fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE")) ||
                                 fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("SIN_ORDEN_ACTIVA")) ||
                                 fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("SIN_TURNO_ACTIVO")) ||
                                 fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("SIN_OEE_WO")) ||
                                 fecFinEstimadoCalculado.Equals(IdiomaController.GetResourceName("SIN_OEE_PREACTOR"))))
                            {
                                TimeSpan diff = Convert.ToDateTime(o.fecFinEstimadoCalculadoTurno) - DateTime.Now;
                                string zeroHours, zeroMinutes, zeroSeconds = "";
                                zeroHours = Convert.ToInt32(diff.Hours) < 10 ? "0" : "";
                                zeroMinutes = Convert.ToInt32(diff.Minutes) < 10 ? "0" : "";
                                zeroSeconds = Convert.ToInt32(diff.Seconds) < 10 ? "0" : "";
                                o.duracionCalculadaTurno = zeroHours + Convert.ToInt32(diff.Hours) + ":" + zeroMinutes + Convert.ToInt32(diff.Minutes) + ":" + zeroSeconds + Convert.ToInt32(diff.Seconds);
                            }
                            else
                            {
                                o.duracionCalculadaTurno = "00:00:00";
                            }
                        }

                        ordenesZona.Add(o);
                    }

                    idOrdenPadre = o.idOrdenPadre;
                }

                DAO_Produccion.GetConversionesOrden();
                string woZona = zon.ordenActual?.id ?? "";
                EstadoComparer comparer = new EstadoComparer(woZona);
                return ordenesZona.OrderBy(n => n, comparer).ToList();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.Get", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES"));
            }
        }


        [Route("api/obtenerWOActivas/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas, Funciones.ENV_PROD_EXE_62_GestionCreacionPeticionesMMPPSmile,
                      Funciones.ENV_PROD_EXE_62_VisualizacionCreacionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_63_GestionCreacionPeticionesMMPPSmileTerminal, 
                      Funciones.ENV_PROD_EXE_63_VisualizacionCreacionPeticionesMMPPSmileTerminal)]
        public List<Orden> ObtenerWOActivas()
        {
            try 
            {
                DAO_Orden daoOrden = new DAO_Orden();
                var listado = daoOrden.ObtenerWOActivas();
                
                return listado;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES_ACTIVAS") + " - " + ex.Message, "OrdenesController.ObtenerWOActivas", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES_ACTIVAS"));
            }
        }

        [Route("api/ordenesPendientes/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionListadoDeWoPlanificadas, Funciones.ENV_PROD_EXE_62_GestionCreacionPeticionesMMPPSmile,
                      Funciones.ENV_PROD_EXE_62_VisualizacionCreacionPeticionesMMPPSmile, Funciones.ENV_PROD_EXE_63_GestionCreacionPeticionesMMPPSmileTerminal, 
                      Funciones.ENV_PROD_EXE_63_VisualizacionCreacionPeticionesMMPPSmileTerminal)]
        public IEnumerable<Orden> ordenesPendientes()
        {
            try
            {
                List<Orden> ordenes = new List<Orden>();
                //Obtenemos las ordenes pendiente de cada linea
                //unicamente deben mostrarse los estados planificado y creado
                foreach (Linea lin in PlantaRT.planta.lineas)
                {
                    List<Tipos.EstadosOrden> lstFiltroEstados = new List<Tipos.EstadosOrden>();
                    lstFiltroEstados.Add(Tipos.EstadosOrden.Creada);
                    lstFiltroEstados.Add(Tipos.EstadosOrden.Planificada);
                    foreach (Orden ord in lin.ordenesPendientes.Where(o => lstFiltroEstados.Contains(o.estadoActual.Estado)))
                    {
                        //if (!ordenes.Contains(ord) && ord.idSuborden != "0" && ord.idSuborden != null && (ord.estadoActual.Estado == Tipos.EstadosOrden.Planificada || ord.estadoActual.Estado == Tipos.EstadosOrden.Creada))
                        if (!ordenes.Contains(ord))
                        {
                            ordenes.Add(ord);
                        }
                    }
                }

                return ordenes;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.ordenesActivasSuper", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ordenesPendientes", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES_ACTIVAS"));
            }
        }

        [Route("api/ordenes/getOrden")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_VisualizacionListadoDeWo)]
        public Orden GetOrden(dynamic datosPeticion)
        {
            try
            {
                string idLinea = datosPeticion.idLinea.Value;
                string idOrden = datosPeticion.idOrden.Value;
                string idZonaSel = datosPeticion.idZonaSel.Value;
                string idLineaSel = datosPeticion.idLineaSel.Value;

                Linea linSel = PlantaRT.planta.lineas.Find(lin => lin.id == idLineaSel);
                Zona zonSel = linSel.zonas.Find(zon => zon.id == idZonaSel);
                //Orden ord = zonSel.ordenActual;

                List<Orden> ordenesLinea = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea).obtenerOrdenes();
                Orden ord = ordenesLinea.Find(orden => orden.id == idOrden);
                if (ord == null)
                {
                    if (zonSel.numZona - 1 >= 0) // Hay zona anterior o la zona es la llenadora y la orden esta en preparación o planificada
                    {
                        if (zonSel.esLlenadora)
                        {
                            Orden ordPlanificada = linSel.ordenesPendientes.Find(o => o.id == idOrden);
                            if (ordPlanificada != null && (ordPlanificada.estadoActual.Estado == Tipos.EstadosOrden.Planificada ))
                                return ordPlanificada;
                        }

                        Zona zonaAnterior = linSel.zonas.Find(zon => zon.numZona == (zonSel.numZona - 1));
                        if (zonaAnterior != null)
                        {
                            ord = zonaAnterior.ordenActual;
                            if (ord != null && ord.estadoActual.Estado == Tipos.EstadosOrden.Iniciando)
                            {
                                Orden ordenIniciar = new Orden(
                                    ord.id,
                                    ord.idOrdenPadre,
                                    ord.idSuborden,
                                    ord.descripcion,
                                    new EstadoOrden(Tipos.EstadosOrden.Iniciar),
                                    ord.producto,
                                    ord.dispMatPackaging,
                                    ord.cantPlanificada,
                                        //ord.cantReal,
                                    ord.dfecInicio(),
                                    ord.dfecFin(),
                                    ord.dFecInicioEstimado,
                                    ord.dFecFinEstimado,
                                    ord.produccion,
                                    ord.velocidadNominal,
                                    ord.oeeObjetivo,
                                    ord.oeeCritico,
                                    ord.OEE,
                                    ord.calidad,
                                    ord.rechazos,
                                    ord._refLinea
                                ){
                                    CajasPorPalet = ord.CajasPorPalet,
                                    EnvasesPorPalet = ord.EnvasesPorPalet,
                                    TipoPausa = ord.TipoPausa,
                                    numParticiones = DAO_Orden.ObtenerNumeroParticiones(ord.idOrdenPadre)
                                };

                                return ordenIniciar;
                            }
                            else
                            {
                                return new Orden();
                            }
                        }

                        return null;
                    }
                    else // NO hay zona anterior
                    {
                        return linSel.ordenesPendientes.Find(o => o.id == idOrden);
                    }
                }
                else
                {
                    // Añado las ordenes que podria poner En Curso por que estan en iniciando en la zona anterior
                    int numZonaAnt = zonSel.numZona - 1;
                    if (numZonaAnt >= 0)
                    {
                        Zona zonaAnt = linSel.zonas.Find(zona => zona.numZona == numZonaAnt);
                        if (zonaAnt.ordenActual != null && (zonaAnt.ordenActual.estadoActual.Estado == Tipos.EstadosOrden.Iniciando || zonaAnt.ordenActual.estadoActual.Estado == Tipos.EstadosOrden.Producción))
                        {
                            if ((zonSel.ordenActual == null || !zonSel.ordenActual.id.Equals(ord.id)) && 
                                (zonaAnt.ordenActual != null && ord.id.Equals(zonaAnt.ordenActual.id)))
                            {
                                Orden ordIni = new Orden(
                                    ord.id,
                                    ord.idOrdenPadre,
                                    ord.idSuborden,
                                    ord.descripcion,
                                    new EstadoOrden(Tipos.EstadosOrden.Iniciar),
                                    ord.producto,
                                    ord.dispMatPackaging,
                                    ord.cantPlanificada,
                                    //ord.cantReal,
                                    ord.dfecInicio(),
                                    ord.dfecFin(),
                                    ord.dFecInicioEstimado,
                                    ord.dFecFinEstimado,
                                    ord.produccion,
                                    ord.velocidadNominal,
                                    ord.oeeObjetivo,
                                    ord.oeeCritico,
                                    ord.OEE,
                                    ord.calidad,
                                    ord.rechazos,
                                    ord._refLinea
                                    //ord.prodLlenadora
                                ){
                                    EnvasesPorPalet = ord.EnvasesPorPalet,
                                    CajasPorPalet = ord.CajasPorPalet,
                                    TipoPausa = ord.TipoPausa,
                                    numParticiones = DAO_Orden.ObtenerNumeroParticiones(ord.idOrdenPadre)
                                };

                                return ordIni;
                            }
                        }
                    }

                    return ord;
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.GetOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetordenTerminal", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_DETALLE"));
            }
        }

        [Route("api/ordenes/ExistPPR_By_Line_MaterialId")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas)]
        public Boolean ExistPPR_By_Line_MaterialId(dynamic datosWO)
        {
            try
            {
                string linea = datosWO.linea.Value;
                string producto = datosWO.producto.codigo;
                DAO_Linea daoLinea = new DAO_Linea();
                string[] datosPPR = daoLinea.obtenerPPR(linea, producto);
                
                return (datosPPR.Length > 0);
            }
            catch(Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.crearWoManual", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetPPR_By_Line_MaterialId", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CREANDO_WO"));
            }
        }

        [Route("api/ordenes/crearWoContingencia")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas)]
        public object[] crearWoContingencia(dynamic datosWO)
        {
            CrearWOManual regla = null;
            try
            {
                string linea = datosWO.linea.Value;
                string producto = datosWO.producto.codigo;
                string udMedida = datosWO.producto.udMedida;
                string descripcion = datosWO.descripcion.Value;
                string estado = Tipos.EstadosOrden.Planificada.ToString().ToUpperInvariant();
                //Desde Javascript vienen las fechas en UTC
                DateTime fechaInicioPlanificado = (DateTime)datosWO.fechaInicio.Value;
                DateTime fechaFinPlanificado = (DateTime)datosWO.fechaFin.Value;

                DAO_Linea daoLinea = new DAO_Linea();
                string[] datosPPR = daoLinea.obtenerPPR(linea, producto);
                string ppr = datosPPR[0];

                double fechaInicio = Math.Round(((fechaInicioPlanificado) - new DateTime(1970, 1, 1)).TotalSeconds, 3);
                double fechaFin = Math.Round(((fechaFinPlanificado) - new DateTime(1970, 1, 1)).TotalSeconds, 3);

                double cantidad = 0.0;
                if (datosWO.cantidad.Value != null) cantidad = (double)datosWO.cantidad.Value;

                string codigoBase = ConfigurationManager.AppSettings["PrefWoManual"] + DateTime.Now.ToUniversalTime().ToString("yy") + "-";
                DAO_Orden ord = new DAO_Orden();
                string codigoWO = ord.obtenerCodigoNuevaWO(codigoBase);

                string codigo = codigoBase + codigoWO;

                PMConnectorBase.Connect();
                string errDesc = "";

                regla = new CrearWOManual(PMConnectorBase.PmConexion);
                CallResult res = regla.Call(codigo, ppr, cantidad, "Unit", fechaInicio, fechaFin, codigo, "0", "1", estado, fechaFin, 0.0, null, null, descripcion, ref errDesc);

                if (res == CallResult.CR_Ok)
                {
                    CallResult resHija = regla.Call(codigo, ppr, cantidad, "Unit", fechaInicio, fechaFin, codigo + ".1", "1", "", estado, fechaFin, 0.0, null, null, descripcion, ref errDesc);

                    //conexion.Disconnect();
                    if (resHija == CallResult.CR_Ok)
                    {
                        DAO_Orden.editarDatosGenerales(fechaInicioPlanificado, fechaFinPlanificado, codigo);
                        DAO_Orden.editarDatosGenerales(fechaInicioPlanificado, fechaFinPlanificado, codigo + ".1");
                        DAO_Orden.cambiarEstadoOrden(codigo, Tipos.EstadosOrden.Finalizada.ToString());
                        DAO_Orden.cambiarEstadoOrden(codigo + ".1", Tipos.EstadosOrden.Finalizada.ToString());

                        DAO_Orden.CrearHistoricoOrden(codigo + ".1", fechaInicioPlanificado, fechaFinPlanificado);
                        DAO_Orden.CrearHistoricoOrden(codigo, fechaInicioPlanificado, fechaFinPlanificado);

                        Linea lineaOrden = PlantaRT.planta.lineas.Find(l => l.id == linea);
                        Orden orden = lineaOrden.ordenesPendientes.Find(o => o.id == codigo + ".1");
                        if (orden != null)
                        {
                            DAO_Produccion daoProduccion = new DAO_Produccion();
                            DAO_Orden.ObtenerConversionesProducto(new List<Orden>() { orden });
                            daoProduccion.obtenerDatosGeneralesParticion(orden);
                            orden.duracion = DAO_Orden.ObtenerDuracion(orden.idLinea, orden.dFecInicioEstimado, orden.dFecFinEstimado);
                            //orden.duracionReal = DAO_Orden.ObtenerDuracion(orden.idLinea, orden.dFecInicio, orden.dFecFin);
                            orden.duracionReal = DAO_Orden.ObtenerDuracionReal(orden.id);
                        }

                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.crearWoManual", "Orden creada (contingencia) - " +
                                "Linea: " + linea +
                                "; WO: " + codigo +
                                ", Producto: " + producto +
                                ", Cantidad: " + cantidad +
                                ", Uom.: " + udMedida +
                                ", Fecha Inicio Est.: " + fechaInicioPlanificado.ToString("dd/MM/yyyy HH:mm:ss") +
                                ", Fecha Fin Est.: " + fechaFinPlanificado.ToString("dd/MM/yyyy HH:mm:ss") +
                                "; Notas: " + descripcion
                                , HttpContext.Current.User.Identity.Name);
                        return new object[] { true, codigo };
                    }
                    else
                    {
                        if (res == CallResult.CR_Timedout)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "The call timed out", "OrdenesController.crearWoManual", "I-MES-WO", "Sistema");
                        }
                        else
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, errDesc, "OrdenesController.crearWoManual", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                        }
                        return new object[] { false, "" };
                    }
                }
                else
                {
                    if (res == CallResult.CR_Timedout)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "The call timed out", "OrdenesController.crearWoManual", "I-MES-WO", "Sistema");
                    }
                    else
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, errDesc, "OrdenesController.crearWoManual", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                    }
                    return new object[] { false, "" };
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.crearWoManual", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.crearWoContingencia", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CREANDO_WO"));
            }
            finally
            {
                regla.Dispose();
            }
        }

        [Route("api/ordenes/crearWoManual")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_2_GestionListadoDeWoPlanificadas)]
        public object[] crearWoManual(dynamic datosWO)
        {
            CrearWOManual regla = null;
            try
            {
                string linea = datosWO.linea.Value;
                string producto = datosWO.producto.codigo;
                string udMedida = datosWO.producto.udMedida;
                string descripcion = datosWO.descripcion.Value;
                string estado = datosWO.estado.Value;

                DAO_Linea daoLinea = new DAO_Linea();
                string[] datosPPR = daoLinea.obtenerPPR(linea, producto);
                string ppr = datosPPR[0];
                double fechaInicio = Math.Round((((DateTime)datosWO.fechaInicio.Value) - new DateTime(1970, 1, 1)).TotalSeconds, 3);
                double fechaFin = Math.Round((((DateTime)datosWO.fechaFin.Value) - new DateTime(1970, 1, 1)).TotalSeconds, 3);

                double cantidad = 0.0;
                if (datosWO.cantidad.Value != null) cantidad = (double)datosWO.cantidad.Value;

                string codigoBase = ConfigurationManager.AppSettings["PrefWoManual"] + DateTime.Now.ToUniversalTime().ToString("yy") + "-";
                DAO_Orden ord = new DAO_Orden();
                string codigoWO = ord.obtenerCodigoNuevaWO(codigoBase);

                string codigo = codigoBase + codigoWO;

                PMConnectorBase.Connect();
                string errDesc = "";

                regla = new CrearWOManual(PMConnectorBase.PmConexion);
                CallResult res = regla.Call(codigo, ppr, cantidad, udMedida, fechaInicio, fechaFin, codigo, "0", "1", estado, fechaFin, 0.0, null, null, descripcion, ref errDesc); 

                if (res == CallResult.CR_Ok)
                {
                    CallResult resHija = regla.Call(codigo, ppr, cantidad, udMedida, fechaInicio, fechaFin, codigo + ".1", "1", "", estado, fechaFin, 0.0, null, null, descripcion, ref errDesc);

                    //conexion.Disconnect();
                    if (resHija == CallResult.CR_Ok)
                    {
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.crearWoManual", "Orden creada (manual) - " +
                                "Linea: " + linea +
                                "; WO: " + codigo +
                                ", Producto: " + producto +
                                ", Cantidad: " + cantidad +
                                ", Uom.: " + udMedida +
                                ", Fecha Inicio Est.: " + ((DateTime)datosWO.fechaInicio.Value).ToString("dd/MM/yyyy HH:mm:ss") +
                                ", Fecha Fin Est.: " + ((DateTime)datosWO.fechaFin.Value).ToString("dd/MM/yyyy HH:mm:ss") +
                                "; Notas: " + descripcion
                                , HttpContext.Current.User.Identity.Name);
                        return new object[] { true, codigo + ".1" };
                    }
                    else
                    {
                        return new object[] { false, "" };
                    }
                }
                else
                {
                    if (res == CallResult.CR_Timedout)
                    {
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.crearWoManual", "The call timed out", "Sistema");
                    }
                    else
                    {
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.crearWoManual", errDesc, HttpContext.Current.User.Identity.Name);
                    }
                    return new object[] { false, "" };
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.crearWoManual", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CREANDO_WO"));
            }
            finally
            {
                regla.Dispose();
            }
        }

        [Route("api/ordenes/planificadas")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_2_GestionListadoDeWoPlanificadas, Funciones.ENV_PROD_EXE_1_GestionWoActivas)]
        public IHttpActionResult EditarOrdenPlanificada([FromBody] Orden orden)
        {
            string errorMsg = "";
            try
            {
                var daoOrden = new DAO_Orden();
                daoOrden.EditarOrdenPlanificada(orden, out errorMsg);
                return Json(true);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.EditarOrden", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return BadRequest(errorMsg);
            }
        }

        [Route("api/asignarWO2Zona")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo)]
        public async Task<object> asignarWO2Zona(dynamic cambio)
        {
            List<Zona> arrayZonas = cambio.zonas.ToObject<List<Zona>>();
            string woId = cambio.woId;
            string linea = cambio.linea;
            int crearOrdenArranqCambio = cambio.crearOrdenArranqCambio;
            int tipoArranque = cambio.tipoArranque;
            //List<MaquinasCompartidas> listaMaquinas = cambio.seleccionMaquinasCompartidas.ToObject<List<MaquinasCompartidas>>();

            string zonasStr = "[";
            bool zonaConOrden = false;
            string zonaAs = "";
            arrayZonas.ForEach(z =>
            {
                zonasStr += z.descripcion + ",";
                if (!zonaConOrden)
                {
                    zonaConOrden = DAO_Orden.ValidarZonaConOrden(z.id);
                    zonaAs = z.descripcion;
                }
            });
            zonasStr += "]";

            //SI EXISTE UNA ZONA CON ORDEN ASIGNADA SE RETORNA  ERROR, LA ZONA QUE SE VA A ASIGNAR NO TIENE QUE TENER ORDEN ASIGNADA.
            if (zonaConOrden)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("EXISTE_ZONA_ASIGNADA") + ": " + zonaAs, "OrdenesController.asignarWO2Zona", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                return new { err = false, errDesc = IdiomaController.GetResourceName("EXISTE_ZONA_ASIGNADA") };
            }

            DAO_Log.logUsuario(IdiomaController.GetResourceName("ASIGNAR_WO") + " {0}. " + IdiomaController.GetResourceName("LINEA") + ": {1} - {2} ", woId, linea, zonasStr);
            //traza REALTIME. IMPORTANTE! Quitarla cuando el realtime funcione
            DAO_Orden.trazaRealTime(linea, woId, "Asignar");
            object result = await DAO_Orden.asignarWO2Zonas(crearOrdenArranqCambio, tipoArranque, linea, arrayZonas, woId, HttpContext.Current.User.Identity.Name, "OFICIAL");

            return result;
        }

        [Route("api/desasignarWO2Zona")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo)]
        public async Task<object> desasignarWO2Zona(dynamic cambio)
        {
            List<Zona> arrayZonas = cambio.zonas.ToObject<List<Zona>>();
            string woId = cambio.woId;
            string nuevoEstado = cambio.nuevoEstado;
            string linea = cambio.linea;
            //List<MaquinasCompartidas> listaMaquinas = cambio.seleccionMaquinasCompartidas.ToObject<List<MaquinasCompartidas>>();

            string zonasStr = "[";
            bool zonaConOrden = true;
            string zonaDes = "";
            arrayZonas.ForEach(z=>{
                zonasStr += z.descripcion + ",";
                if (zonaConOrden)
                {
                    zonaConOrden = DAO_Orden.ValidarZonaConOrden(z.id);
                    zonaDes = z.descripcion;
                }
            });
            zonasStr +="]";

            //SI EXISTE UNA ZONA SIN ORDEN ASIGNADA SE RETORNA  ERROR, LA ZONA QUE SE VA A DESASIGNAR TIENE QUE TENER ORDEN ASIGNADA.
            if (!zonaConOrden) {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("EXISTE_ZONA_DESASIGNADA") + ": " + zonaDes, "OrdenesController.desasignarWO2Zona", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                return new { err = false, errDesc = IdiomaController.GetResourceName("EXISTE_ZONA_DESASIGNADA") };
            }

            DAO_Log.logUsuario(IdiomaController.GetResourceName("DESASIGNAR_WO") + " {0}. " + IdiomaController.GetResourceName("LINEA") + ": {1} - {2} ", woId, linea, zonasStr);
            //traza REALTIME. IMPORTANTE! Quitarla cuando el realtime funcione
            DAO_Orden.trazaRealTime(linea, woId, "Desasignar");
            object result = await DAO_Orden.desasignarWO2Zonas(linea, arrayZonas, woId, nuevoEstado, HttpContext.Current.User.Identity.Name, "OFICIAL");

            return result;
        }
         
        [Route("api/checkOrdenArranqueOCambio")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo)]
        public int checkOrdenArranqueOCambio(dynamic cambio)
        {
            //-1 sino hay que hacer nada /  0 si arranque / 1 si cambio
            string woId = cambio.woId;
            string linea = cambio.linea;
            List<Zona> arrayZonas = cambio.zonas.ToObject<List<Zona>>(); //todas las zonas de la línea
            //primero comprobamos que la orden sea entrante, es decir, no este en ninguna de las zonas de la línea.
            int tipoArranque = 0;

            arrayZonas.ForEach(z =>
            {
                if (z.ordenActual != null && z.ordenActual.id == woId)
                {
                    ///REVISAR ESTO SI CUMPLE CON LA ORDEN ENTRANTE
                    tipoArranque = -1;
                }
            });
            if (tipoArranque >= 0)
            {
                //comprobar si es arranque o cambio
                tipoArranque = DAO_Orden.obtenerSiEsArranqueOCambio(linea);
            }

            return tipoArranque;
        } 
        [Route("api/cambiarEstadoPorOficial")]
        [HttpPost]
        public object[] cambiarEstadoPorOficial(dynamic cambio)
        {
            try
            {
                cambio.usuario = "OFICIAL";
                string errDesc = string.Empty;
                string errSource = string.Empty;
                
                //QUITAR ESTA RETURN
                return new object[] { true, "El cambio se ha realizado correctamente" };
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.cambiarEstado", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.cambiarEstadoPorOficial", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_ESTADO"));
            }
        }

        [Route("api/cambiarEstadoPorSupervisor")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_2_GestionListadoDeWoPlanificadas, Funciones.ENV_PROD_EXE_1_GestionWoActivas)]
        public async Task<object[]> CambiarEstadoPorSupervisor(dynamic cambio)
        {
            try
            {
                dynamic result;
                string usuario = "SUPERVISOR";
                string linea = cambio.linea;
                string wo = cambio.wo;
                string nuevoEstado = cambio.estado;

                //Si la orden esta cambiando los consolidados datos de máquina avisamos que no puede cambiar el estado CERRADA ya que tiene que esperar.  // 0 no bloqueada 1 bloqueada
                if (DAO_Orden.obtenerSiWOEstaHaciendoConsolidados(wo) == 0)
                {
                    //traza REALTIME. IMPORTANTE! Quitarla cuando el realtime funcione
                    DAO_Orden.trazaRealTime(linea, wo, "Supervisor");

                    //Nueva OP: este if se tiene que quitar cuando acabemos
                    if (nuevoEstado == "Pausada" || nuevoEstado == "Finalizada" || nuevoEstado == "Cancelada" || nuevoEstado == "Cerrada" || nuevoEstado == "Planificada")
                    {
                        //revisaremos si esta en alguna zona, si es así desasignamos y cambiamos de estado
                        List<Zona> zonas = DAO_Orden.obtenerZonasOrdenLinea(wo, linea);
                        if (zonas.Count() > 0)
                        {   
                            //si esta es una zona desasignamos
                            result = await DAO_Orden.desasignarWO2Zonas(linea, zonas, wo, nuevoEstado, HttpContext.Current.User.Identity.Name, usuario);

                            await DAO_Orden.AsignarProduccionLineasDobleSalida(linea, IdiomaController.GetResourceName("CAMBIO_ESTADO") + " " + usuario);
                        }
                        else
                        {
                            //si no esta en ninguna zona sólo cambiamos el estado.                           
                            //cambio estado orden
                            result = DAO_Orden.cambiarEstadoOrden(wo, nuevoEstado, HttpContext.Current.User.Identity.Name, usuario);
                            if (result.err)
                            {
                                string woIdPadre = wo.Split('.')[0];
                                string nuevoEstadoPadre = DAO_Orden.obtenerNuevoEstadoWOPadre(woIdPadre);
                                if (nuevoEstadoPadre != "")
                                {
                                    result = DAO_Orden.cambiarEstadoOrden(woIdPadre, nuevoEstadoPadre, HttpContext.Current.User.Identity.Name, usuario);
                                }
                            }
                        }
                    }
                    else
                    {
                        result = new { err = false, errDesc = IdiomaController.GetResourceName("NO_SE_PERMITE_CAMBIO_ESTADO") };
                    }
                }
                else
                {
                    result = new { err = false, errDesc = IdiomaController.GetResourceName("NO_SE_PERMITE_CAMBIO_ESTADO") + ". " +
                        IdiomaController.GetResourceName("LA_WO_ESTA_CONSOLIDANDO_MAQUINAS") };
                }

                // Operacion correcta
                if (result.err)
                {
                    DAO_Log.logUsuario(IdiomaController.GetResourceName("CAMBIO_ESTADO") + ". WO: {0}. " + IdiomaController.GetResourceName("ESTADO") + ": {1} ", wo, nuevoEstado);
                }

                return new object[] { result.err, result.errDesc };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.cambiarEstadoPorSupervisor", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_CAMBIANDO_ESTADO_SUPERVISOR"));
            }
        }

        [Route("api/comprobarOrdenEnZonas")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas)]
        public List<Zona> obtenerZonasOrden(dynamic cambio)
        {
            //devuelve el número de zonas donde esta asignada
            try
            {
                string linea = cambio.linea;
                string wo = cambio.wo;
                string nuevoEstado = cambio.estado;              
                List<Zona> zonas = DAO_Orden.obtenerZonasOrdenLinea(wo, linea);

                return zonas;
            }
            catch
            {
                throw new Exception();
            }
        }

        [Route("api/ordenes/obtenerOrdenesIntervalo/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno)]
        public List<Orden> obtenerOrdenesIntervalo(dynamic datos)
        {
            string idLinea = datos.idLinea.Value;
            DateTime fInicio = datos.fInicio.Value;
            DateTime fFin = datos.fFin.Value;

            try
            {
                List<Orden> ordenesAux = new List<Orden>();
                DAO_Orden daoOrden = new DAO_Orden();
                if (fInicio != DateTime.MinValue && fFin != DateTime.MinValue) // rmartinez 300516: en caso de que no haya turno planificado SQL Server no admite como fecha 01/01/0001 y falla la creación de nuevo rechazo
                {
                    ordenesAux = daoOrden.obtenerOrdenesIntervalo(idLinea, fInicio, fFin);

                    //Si es el turno actual añadimos la orden en curso
                    DAO_Turnos daoTurnos = new DAO_Turnos();
                    List<TurnoParo> lstTurnos = daoTurnos.ObtenerTurnos(idLinea, fInicio, fFin);
                    List<Turno> listTurnos = PlantaRT.planta.turnoActual;

                    Turno turnoActual = listTurnos.Where(p => p.linea.id == idLinea).FirstOrDefault();
                    if (turnoActual != null)
                    {
                        if (lstTurnos.Any(t => t.idTurno == turnoActual.idTurno))
                        {
                            Linea linea = PlantaRT.planta.lineas.Find(l => l.id == idLinea);
                            if (linea.ordenEnCurso != null && ordenesAux.Where(p => p.id == linea.ordenEnCurso.id).Count() == 0)
                            {
                                ordenesAux.Add(linea.ordenEnCurso);
                            }
                        }
                    }
                }

                return ordenesAux;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerOrdenesIntervalo", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerOrdenesIntervalo", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ORDENES_INTERVALO"));
            }
        }

        [Route("api/ordenes/obtenerOrdenesLineaTurno/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_42_GestionPicos)]
        public List<Orden> obtenerOrdenesLineaTurno(dynamic datos)
        {
            string idLinea = datos.idLinea.Value;
            DateTime fechaInicio = datos.fechaInicio.Value;
            DateTime fechaFin = datos.fechaFin.Value;

            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                return daoOrden.ObtenerOrdenesLineaTurno(idLinea, fechaInicio, fechaFin);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerOrdenesLineaTurno", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/ordenes/obtenerOrdenesTurno/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.MER_PROD_GES_1_GestionMermasPortal, Funciones.MER_PROD_GES_2_GestionMermasTerminal)]
        public IHttpActionResult obtenerOrdenesTurno(int id)
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                return Json(daoOrden.ObtenerOrdenesTurno(id));

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerOrdenesTurno", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return BadRequest(IdiomaController.GetResourceName("ERROR_ORDENES_INTERVALO"));
            }
        }

        [Route("api/ordenes/obtenerHistoricoOrdenes/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public List<Orden> obtenerHistoricoOrdenes(dynamic datos)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                DateTime fInicio = ((DateTime)datos.fInicio.Value).ToLocalTime();
                DateTime fFin = ((DateTime)datos.fFin.Value).ToLocalTime();

                DAO_Orden daoOrden = new DAO_Orden();
                List<Orden> ordenes = daoOrden.obtenerHistoricoOrdenes(fInicio.Date, fFin.Date);

                return ordenes;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerHistoricoOrdenes", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerHistoricoOrdenes", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_HISTORCIO"));
            }
        }

        [Route("api/ordenes/obtenerOrdenesPlanificadas")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_4_VisualizacionDelProgramaDeEnvasado)]
        public List<Orden> obtenerOrdenesPlanificadas(dynamic filtro)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                DateTime fInicio = ((DateTime)filtro.start.Value).ToLocalTime();
                DateTime fFin = ((DateTime)filtro.end.Value).ToLocalTime();
                string fIdLinea = (filtro.idLinea?.Value)?.ToString();

                List<Orden> ordenesAux = new List<Orden>();
                DAO_Orden daoOrden = new DAO_Orden();
                ordenesAux = daoOrden.obtenerOrdenesPlanificadasProgramaEnvasado(fInicio.Date, fFin.Date, fIdLinea);
                
                return ordenesAux;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerOrdenesPlanificadas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerOrdenesPlanificadas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDENES_PLANIFICADAS"));
            }
        }

        [Route("api/ordenes/comprobarOrdenActiva/")]
        [HttpGet]
        public bool comprobarOrdenActiva()
        {
            try
            {
                Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[User.Identity.Name];
                Zona zon = sesionUsuario.zona;
                Orden ord = zon.ordenActual;
                
                return (ord != null);
            }
            catch
            {
                return false;
            }
        }

        [Route("api/ordenes/historicoOrden/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas, Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public List<HistoricoOrden> ObtenerHistoricoOrden(string idOrden)
        {
            try
            {
                List<HistoricoOrden> historico = DAO_Orden.ObtenerHistoricoOrden(idOrden);
                return historico;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerHistoricoOrden", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_HISTORICO"));
            }
        }

        [Route("api/ordenes/produccionOrdenTurno")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public List<DTO.DTO_ProduccionTurnoOrdenes> obtenerProduccionOrdenTurno(dynamic datos)
        {
            try
            {
                int numLinea = Convert.ToInt32(datos.numLinea.Value);
                string idOrden = datos.idOrden.Value;

                DAO_Orden daoOrden = new DAO_Orden();
                return daoOrden.obtenerProduccionOrdenTurno(numLinea, idOrden);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerProduccionOrdenTurno", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PRODUCCIÓN"));
            }
        }

        [Route("api/ordenes/produccionParticionTurno")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas)]
        public List<DTO.DTO_ProduccionTurnoOrdenes> obtenerProduccionParticionTurno(dynamic datos)
        {
            try
            {
                int numLinea = Convert.ToInt32(datos.numLinea.Value);
                string idParticion = datos.idParticion.Value;
                
                DAO_Orden daoOrden = new DAO_Orden();
                return daoOrden.obtenerProduccionParticionTurno(numLinea, idParticion);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerProduccionParticionTurno", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PRODUCCIÓN_DE"));
            }
        }

        [Route("api/ordenes/obtenerDetalleHistoricoOrden/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public Orden obtenerDetalleHistoricoOrden(string idOrden)
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                Orden orden = daoOrden.obtenerDetalleHistoricoOrden(idOrden);

                return orden;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerHistoricoOrdenes", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerDetalleHistoricoOrden", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_HISTORCIO"));
            }
        }

        [Route("api/ordenes/obtenerTiposArranque")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_31_VisualizacionOrdenesArranque)]
        public List<dynamic> obtenerTiposArranque()
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                List<dynamic> lstTiposArranque = daoOrden.obtenerTiposArranque();

                return lstTiposArranque;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerTiposArranque", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerTiposArranque", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TIPOS_DE_ARRANQUE"));
            }
        }

        [Route("api/editarOrdenArranqueCambio")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_32_GestionOrdenesArranque, Funciones.ENV_PROD_EXE_44_GestionOrdenesCambio)]
        public ReturnValue editarOrdenArranqueCambio(dynamic datos)
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                ReturnValue ret = daoOrden.editarOrdenArranqueCambio(datos);

                if (!ret.succeeded)
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "OrdenesController.editarOrdenArranqueCambio", "WEB-ENVASADO", "Sistema");
                    
                return ret;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerTiposArranque", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.editarOrdenArranqueCambio", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_UNA"));
            }
        }

        [Route("api/crearOrdenArranqueCambio")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_32_GestionOrdenesArranque, Funciones.ENV_PROD_EXE_44_GestionOrdenesCambio)]
        public ReturnValue crearOrdenArranqueCambio(dynamic datos)
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                ReturnValue ret = daoOrden.crearOrdenArranqueCambioDatosSinFiltrar(datos);

                if (!ret.succeeded)
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "OrdenesController.crearOrdenArranqueCambio", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);                    

                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.crearOrdenArranqueCambio", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_CREANDO_UNA"));
            }
        }

        [Route("api/eliminarOrdenArranqueCambio")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_32_GestionOrdenesArranque, Funciones.ENV_PROD_EXE_44_GestionOrdenesCambio)]
        public ReturnValue eliminarOrdenArranqueCambio(dynamic datos)
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                ReturnValue ret = daoOrden.eliminarOrdenArranqueCambio(datos);

                if (!ret.succeeded)
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message , "OrdenesController.eliminarOrdenArranqueCambio", "WEB-ENVASADO", "Sistema");                    

                return ret;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.eliminarOrdenArranqueCambio", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.eliminarOrdenArranqueCambio", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_UNA"));
            }
        }

        [Route("api/obtenerOrdenesFinalizadas/{fechaIni}/{linea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_32_GestionOrdenesArranque, Funciones.ENV_PROD_EXE_44_GestionOrdenesCambio)]
        public List<DTO.DTO_OrdenesPlanificadas> obtenerOrdenesFinalizadas(int fechaIni, string linea)
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                return daoOrden.obtenerOrdenesFinalizadas(fechaIni, linea);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerOrdenesFinalizadas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerOrdenesFinalizadas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDENES_FINALIZADAS"));
            }
        }

        [Route("api/obtenerOrdenesRelacionadas")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_32_GestionOrdenesArranque, Funciones.ENV_PROD_EXE_44_GestionOrdenesCambio)]
        public string obtenerOrdenesRelacionadas(dynamic datos)
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                return daoOrden.obtenerOrdenesRelacionadas(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerOrdenesRelacionadas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerOrdenesRelacionadas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDENES_RELACIONADAS"));
            }
        }

        [Route("api/ordenes/editarDatosGenerales")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionWoActivas, Funciones.ENV_PROD_EXE_41_GestionHistoricoWO)]
        public object[] editarDatosGenerales(dynamic datosGenerales)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                string name = (string)datosGenerales.name.Value;
                DateTime? fInicio = null;
                DateTime? fFin = null;
                if (name.Equals(IdiomaController.GetResourceName("INICIO_REAL")))
                {
                    fInicio = ((DateTime)datosGenerales.value.Value).ToLocalTime();
                }
                else if (name.Equals(IdiomaController.GetResourceName("FIN_REAL")))
                {
                    fFin = ((DateTime)datosGenerales.value.Value).ToLocalTime();
                }
                string idOrden = (string)datosGenerales.idOrden.Value;
                string idParticion = (string)datosGenerales.idParticion.Value;
                int numLinea = (int)datosGenerales.numLinea.Value;

                DAO_Orden.GuardarFechasAntiguas(idParticion);

                bool returnValue = DAO_Orden.editarDatosGenerales(fInicio, fFin, idParticion);
                if (string.IsNullOrEmpty(idOrden))//Si es nulo venimos desde el historico de ordenes
                {
                    //Acualizamos sus particiones es la primera hay que cambiar la fecha inicio - si la particion es la úlitma hay que cambiar la fecha fin
                    idOrden = idParticion;
                    List<Orden> lstOrden = DAO_Orden.GetParticionesOrden(idOrden);
                    if (lstOrden != null)
                    {
                        if (lstOrden.Count == 1)
                        {
                            DAO_Orden.editarDatosGenerales(fInicio, fFin, lstOrden.First().id);
                        }
                        else
                        {
                            DAO_Orden.editarDatosGenerales(fInicio, lstOrden.First().dFecFin, lstOrden.First().id);
                            DAO_Orden.editarDatosGenerales(lstOrden.First().dFecInicio, fFin, lstOrden.Last().id);
                        }
                    }
                }
                else
                {
                    //Si la particion es la primera hay que cambiar en la padre la fecha inicio - si la particion es la úlitma hay que cambiar en la padre la fecha fin
                    List<Orden> lstOrden = DAO_Orden.GetParticionesOrden(idOrden);
                    if (lstOrden != null)
                    {
                        if (lstOrden.Count == 1)
                        {
                            DAO_Orden.editarDatosGenerales(fInicio, fFin, idOrden);
                        }
                        else
                        {
                            DateTime? fecInicio = lstOrden.First().dFecInicio.Equals(DateTime.MinValue) ? (DateTime?)null : lstOrden.First().dFecInicio;
                            DateTime? fecFin = lstOrden.Last().dFecFin.Equals(DateTime.MinValue) ? (DateTime?)null : lstOrden.Last().dFecFin;
                            DAO_Orden.editarDatosGenerales(fecInicio, fecFin, idOrden);
                        }
                    }

                    if (returnValue)
                    {
                        Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea);
                        Orden ord = linea.ordenesPendientes.Find(o => o.id == idParticion);
                        DAO_Produccion daoProduccion = new DAO_Produccion();
                        daoProduccion.obtenerDatosGeneralesParticion(ord);
                        //ord.duracionReal = DAO_Orden.ObtenerDuracion(ord.idLinea, ord.dFecInicio, ord.dFecFin);
                        ord.duracionReal = DAO_Orden.ObtenerDuracionReal(ord.id);
                    }
                }

                if (returnValue)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.editarDatosGenerales", "Se ha modificado los datos de la orden correctamente para la WO " + idParticion, HttpContext.Current.User.Identity.Name);
                }
                else
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.editarDatosGenerales", "Error al editar los datos de la WO " + idParticion, HttpContext.Current.User.Identity.Name);
                }

                return new object[] { returnValue, "Cambios realizados correctamente" };
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.editarDatosGenerales", e.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.editarDatosGenerales", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_DATOS"));
            }
        }

        [Route("api/ordenes/obtenerDatosOriginalesParticion/{idParticion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas)]
        public Orden obtenerDatosOriginalesParticion(string idParticion)
        {
            try
            {
                DAO_Orden daoProduccion = new DAO_Orden();
                Orden datosProdorden = daoProduccion.obtenerDetalleParticionOrden(idParticion);

                return datosProdorden;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerDatosOriginalesParticion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerDatosOriginalesParticion", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_DETALLES"));
            }
        }

        [Route("api/obtenerOrdenAnterior")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_32_GestionOrdenesArranque, Funciones.ENV_PROD_EXE_44_GestionOrdenesCambio)]
        public string obtenerOrdenAnterior(dynamic datos)
        {
            try
            {
                return DAO_Orden.obtenerOrdenAnterior(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerOrdenAnterior", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerOrdenAnterior", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDEN"));
            }
        }

        [Route("api/obtenerOrdenPosterior")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_44_GestionOrdenesCambio)]
        public string obtenerOrdenPosterior(dynamic datos)
        {
            try
            {
                return DAO_Orden.obtenerOrdenPosterior(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.obtenerOrdenPosterior", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerOrdenPosterior", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDEN_POSTERIOR"));
            }
        }

        [Route("api/getParticion/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas)]
        public List<dynamic> getParticion(dynamic datos)
        {
            try
            {
                string id = datos;
                Orden orden = PlantaRT.planta.obtenerOrdenes().Find(o => o.id == id);
                List<dynamic> lstdata = new List<dynamic>();
                bool activa = false;

                if (orden != null)
                {
                    if (orden.estadoActual.nombre == IdiomaController.GetResourceName("PRODUCCION") || 
                        orden.estadoActual.nombre == IdiomaController.GetResourceName("INICIANDO") || 
                        orden.estadoActual.nombre == IdiomaController.GetResourceName("INICIAR"))
                    {
                        activa = true;
                    }

                    dynamic data = new System.Dynamic.ExpandoObject();
                    data.name = IdiomaController.GetResourceName("INICIO_PLANIFICADO");
                    data.value = orden.fecInicioEstimado;
                    lstdata.Add(data);
                    data = new System.Dynamic.ExpandoObject();
                    data.name = IdiomaController.GetResourceName("FIN_PLANIFICADO");
                    data.value = orden.fecFinEstimado;
                    lstdata.Add(data);
                    data = new System.Dynamic.ExpandoObject();
                    data.name = IdiomaController.GetResourceName("INICIO_REAL");
                    data.value = orden.dFecIniLocal.ToUniversalTime() == DateTime.MinValue ? (DateTime?)null : orden.dFecIniLocal;
                    lstdata.Add(data);

                    if (activa)
                    {
                        data = new System.Dynamic.ExpandoObject();
                        data.name = IdiomaController.GetResourceName("FECHA_FIN_ESTIMADA");
                        data.value = Utils.getDateTurno(PlantaRT.planta.turnoActual?.FirstOrDefault(o => o.linea.id == orden?.idLinea), orden);
                        lstdata.Add(data);
                    }
                    else
                    {
                        data = new System.Dynamic.ExpandoObject();
                        data.name = IdiomaController.GetResourceName("FIN_REAL");
                        data.value = orden.dFecFinLocal.ToUniversalTime() == DateTime.MinValue ? (DateTime?)null : orden.dFecFinLocal;
                        lstdata.Add(data);
                    }

                    data = new System.Dynamic.ExpandoObject();
                    data.name = IdiomaController.GetResourceName("DURACION_PLANIFICADA");
                    data.value = orden.duracion;
                    lstdata.Add(data);

                    if (activa)
                    {
                        data = new System.Dynamic.ExpandoObject();
                        data.name = IdiomaController.GetResourceName("DURACION_ESTIMADA");
                        data.value = orden.duracionCalculadaTurno;
                        lstdata.Add(data);
                    }
                    else
                    {
                        data = new System.Dynamic.ExpandoObject();
                        data.name = IdiomaController.GetResourceName("DURACION_REAL");
                        data.value = orden.duracionReal;
                        lstdata.Add(data);
                    }

                    data = new System.Dynamic.ExpandoObject();
                    data.name = IdiomaController.GetResourceName("OEE_OBJETIVO");
                    data.value = orden.oeeObjetivo;
                    lstdata.Add(data);
                    data = new System.Dynamic.ExpandoObject();
                    data.name = IdiomaController.GetResourceName("OEE_CRITICO");
                    data.value = orden.oeeCritico;
                    lstdata.Add(data);
                    data = new System.Dynamic.ExpandoObject();
                    data.name = IdiomaController.GetResourceName("OEE_SECUENCIADOR");
                    data.value = orden.oeePreactor;
                    lstdata.Add(data);
                    data = new System.Dynamic.ExpandoObject();
                    data.name = IdiomaController.GetResourceName("RENDIMIENTO");
                    data.value = orden.produccion.rendimiento;
                    lstdata.Add(data);
                    //data = new System.Dynamic.ExpandoObject();
                    //data.name = IdiomaController.GetResourceName("INDICE_CALIDAD");
                    //data.value = orden.calidad;
                    //lstdata.Add(data);
                    data = new System.Dynamic.ExpandoObject();
                    data.name = IdiomaController.GetResourceName("OEE");
                    data.value = orden.produccion.oee;
                    lstdata.Add(data);
                }

                return lstdata;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES_ACTIVAS") + " - " + ex.Message, "MSM.Controller.Envasado.getParticion", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES_ACTIVAS"));
            }
        }

        [Route("api/getOrden/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public List<dynamic> getOrden(dynamic datos)
        {
            try
            {
                string id = datos != null ? Convert.ToString(datos.id) : null;
                DAO_Orden daoOrden = new DAO_Orden();
                Orden orden = new Orden();
                Orden _detalleOrden = datos.historico == 1 ? daoOrden.obtenerDetalleHistoricoOrden(id):  daoOrden.obtenerDetalleParticionOrden(id);
                orden = _detalleOrden != null ? _detalleOrden : orden;
                List<dynamic> lstdata = new List<dynamic>();
                dynamic data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("INICIO_PLANIFICADO");
                data.value = orden.fecInicioEstimado;
                lstdata.Add(data);
                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("FIN_PLANIFICADO");
                data.value = orden.fecFinEstimado;
                lstdata.Add(data);
                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("INICIO_REAL");
                data.value = orden.dFecIniLocal.ToUniversalTime() == DateTime.MinValue ? (DateTime?)null : orden.dFecIniLocal;
                lstdata.Add(data);
                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("FIN_REAL");
                data.value = orden.dFecFinLocal.ToUniversalTime() == DateTime.MinValue ? (DateTime?)null : orden.dFecFinLocal;
                lstdata.Add(data);

                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("DURACION_PLANIFICADA");
                data.value = orden.duracion;
                lstdata.Add(data);

                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("DURACION_REAL");
                data.value = orden.duracionReal;
                lstdata.Add(data);

                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("OEE_OBJETIVO");
                data.value = orden.oeeObjetivo;
                lstdata.Add(data);
                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("OEE_CRITICO");
                data.value = orden.oeeCritico;
                lstdata.Add(data);
                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("OEE_SECUENCIADOR");
                data.value = orden.oeePreactor;
                lstdata.Add(data);
                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("RENDIMIENTO");
                data.value = orden.produccion.rendimiento;
                lstdata.Add(data);
                //data = new System.Dynamic.ExpandoObject();
                //data.name = IdiomaController.GetResourceName("INDICE_CALIDAD");
                //data.value = orden.calidad;
                //lstdata.Add(data);
                data = new System.Dynamic.ExpandoObject();
                data.name = IdiomaController.GetResourceName("OEE");
                data.value = orden.OEE;
                lstdata.Add(data);

                return lstdata;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.getOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.getOrdenHistorico", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES_ACTIVAS"));
            }
        }

        [Route("api/ordenes/historicoMaquinas")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas, Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public List<HistoricoMaquina> ObtenerHistoricoMaquinas(dynamic datos)
        {
            try
            {
                var historico = DAO_Maquinas.ObtenerHistoricoMaquinas(datos);
                return historico;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerHistoricoMaquinas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_HISTORICO_MAQUINA"));
            }
        }

        [Route("api/ordenes/GetOrderNotes")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionListadoDeWoPlanificadas)]
        public string GetOrderNotes(dynamic orderID)
        {
            try
            {
                var daoOrden = new DAO_Orden();
                return daoOrden.GetOrderNotes(orderID);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.GetOrderNotes", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }



        [Route("api/ordenes/SetOrderNotes")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_2_GestionListadoDeWoPlanificadas, Funciones.ENV_PROD_EXE_1_GestionWoActivas)]
        public void SetOrderNotes(dynamic data)
        {
            try
            {
                string idOrden = data.orderID.ToString();
                string notas = data.text.ToString();
                DAO_Orden.SetOrderNotes(idOrden, notas);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "OrdenesController.SetOrderNotes", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/asignarProduccionLineasDobleSalida")]
        [HttpPost]
        public async Task<bool> AsignarProduccionLineasDobleSalida(dynamic datos)
        {
            string idLinea = datos.linea;
            string accion = datos.accion;

            try
            {
                await DAO_Orden.AsignarProduccionLineasDobleSalida(idLinea, accion);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, accion + ": " + ex.Message + " -> " + ex.StackTrace, "OrdenesController.AsignarProduccionLineasDobleSalida", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/ordenes/calcularFechaFin")]
        [HttpGet]
        public async Task<IHttpActionResult> CalcularFechaFinOrden([FromUri] string idLinea, [FromUri] string idProducto, [FromUri] int cantidad, [FromUri] DateTime fechaInicio)        
        {   
            DateTime? fechaFin = await _iDAO_Orden.CalcularFechaFinOrden(idLinea, idProducto, cantidad, fechaInicio);

            if (fechaFin != null)
            {
                return Json(((DateTime)fechaFin).ToUniversalTime());
            }
            else
            {
                return BadRequest();
            }
        }

        [Route("api/lotes/LotesMateriaPrima/{idWO}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas, Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public async Task<List<DTO_LoteMMPPOrden>> ObtenerLotesMateriaPrima(string idWO)
        {
            try
            {
                List<DTO_LoteMMPPOrden> lista = await _iDAO_Orden.ObtenerLotesMateriaPrima(idWO);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_LOTES_MATERIA_PRIMA") + " - " + ex.Message, "OrdenesController.ObtenerLotesMateriaPrima", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_LOTES_MATERIA_PRIMA"));
            }
        }

        [Route("api/productos/relacionesEnvases")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public async Task<IHttpActionResult> ObtenerRelacionesEnvasesProductos()
        {
            try
            {

                var result = await _iDAO_Orden.ObtenerRelacionesEnvasesProductos();

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.ObtenerRelacionesEnvasesProductos", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_RELACION_DE"));
            }
        }

        [Route("api/ObtenerRelacionEnvasesCajasPalets/{idProducto}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_2_GestionListadoDeWoPlanificadas, Funciones.ENV_PROD_EXE_1_GestionWoActivas)]
        public async Task<DTO_EnvasesCajasPaletProducto> ObtenerRelacionEnvasesCajasPalets(string idProducto)
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                DTO_EnvasesCajasPaletProducto relacion = await _iDAO_Orden.GetConversionesProducto(idProducto);

                return relacion;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OrdenesController.obtenerRelacionEnvasesCajasPalets", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_RELACION_DE"));
            }
        }
    }
}
