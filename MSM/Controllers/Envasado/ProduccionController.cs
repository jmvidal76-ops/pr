using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Models.Envasado;
using MSM.RealTime;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;


namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class ProduccionController : ApiController
    {
        private readonly IDAO_Produccion _iDAOProduccion;

        public ProduccionController(IDAO_Produccion iDAOProduccion)
        {
            _iDAOProduccion = iDAOProduccion;
        }

        [Route("api/produccion/obtenerOeeLlenadorasLinea/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public Dictionary<string, List<double>> obtenerOeeLlenadorasLinea(dynamic datos)
        {
            int numLinea = (int)datos.numLinea.Value;
            int idTurno = (int)datos.idTurno.Value;
            //Desde Javascript vienen las fechas en UTC
            DateTime fInicioTurno = ((DateTime)datos.inicio.Value);
            DateTime fFinTurno = ((DateTime)datos.fin.Value);

            Dictionary<string, List<double>> lstOeeLlenadoras = new Dictionary<string, List<double>>();
            List<Turno> listTurnos = PlantaRT.planta.turnoActual;

            Turno turnoActual = listTurnos.Where(p => p.linea.numLinea == numLinea).FirstOrDefault();
            try
            {
                DAO_Produccion daoProduccion = new DAO_Produccion();
                List<Dictionary<int, DatosProduccion>> lstConsolidados = daoProduccion.obtenerConsolidadosLlenadoraHora(idTurno);
                Dictionary<int, List<double>> ht = new Dictionary<int, List<double>>();
                foreach (Dictionary<int, DatosProduccion> dConsolidado in lstConsolidados)
                {
                    List<double> lstMediaMaquina = new List<double>();
                    List<double> lstOeeMaquina = new List<double>();
                    DateTime fechaInicio = fInicioTurno;
                    string idMaquina = dConsolidado.First().Value.nombreMaquina;
                    while (fechaInicio < fFinTurno)
                    {
                        int hora = fechaInicio.Hour;
                        if (dConsolidado.ContainsKey(hora))
                        {
                            DatosProduccion dtProd = (DatosProduccion)dConsolidado[hora];
                            lstOeeMaquina.Add(dtProd.rendimiento);
                            addValueToMedia(ht, hora, dtProd.rendimiento);
                        }
                        else
                        {
                            DateTime FecActual = DateTime.Now.ToUniversalTime();
                            //Si es el turno y hora actual obtenemos los datos de la regla
                            if (idTurno.Equals(turnoActual.idTurno) && hora.Equals(FecActual.Hour))
                            {
                                //DatosProduccion dtProd = daoProduccion.obtenerDatosProduccionMaquina((FecActual - new DateTime(1970, 1, 1)).TotalSeconds, (fechaInicio - new DateTime(1970, 1, 1)).TotalSeconds, idMaquina);
                                DatosProduccion dtProd = daoProduccion.ObtenerDatosProduccionMaquina(fechaInicio, FecActual, idMaquina);
                                if (dtProd != null)
                                {
                                    lstOeeMaquina.Add(dtProd.rendimiento);
                                    addValueToMedia(ht, hora, dtProd.rendimiento);
                                }
                                else
                                {
                                    lstOeeMaquina.Add(0);
                                    addValueToMedia(ht, hora, 0);

                                }
                            }
                            else
                            {
                                lstOeeMaquina.Add(0);
                                addValueToMedia(ht, hora, 0);
                            }
                        }
                        fechaInicio = fechaInicio.AddHours(1);
                    }
                    lstOeeLlenadoras.Add(idMaquina, lstOeeMaquina);

                }
                List<double> lstOEEMedia = new List<double>();
                foreach (KeyValuePair<int, List<double>> item in ht)
                {
                    List<double> lst = item.Value;
                    double avgOEE = 0;
                    foreach (double oee in lst)
                    {
                        avgOEE += oee;
                    }
                    avgOEE = avgOEE / lst.Count();
                    lstOEEMedia.Add(avgOEE);
                }
                lstOeeLlenadoras.Add("AVG", lstOEEMedia);
                return lstOeeLlenadoras;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "OrdenesController.crearWoManual", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProduccionController.obtenerOeeLlenadorasLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CREANDO_WO"));
            }

        }

        private static void addValueToMedia(Dictionary<int, List<double>> ht, int hora, double oee)
        {
            if (ht.ContainsKey(hora))
            {
                ht[hora].Add(oee);
            }
            else
            {
                List<double> lst = new List<double>();
                lst.Add(oee);
                ht.Add(hora, lst);
            }
        }
        [Route("api/produccion/obtenerProduccionLlenadorasLinea/{numLinea}/{idTurno}")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public List<DatosProduccion> obtenerProduccionLlenadorasLinea(List<DatosProduccion> datos, int numLinea, int idTurno)
        {
            List<Turno> listTurnos = PlantaRT.planta.turnoActual;

            Turno turnoActual = listTurnos.Where(p => p.linea.numLinea == numLinea).FirstOrDefault();
            try
            {
                DAO_Produccion daoProduccion = new DAO_Produccion();
                List<DatosProduccion> lConsolidados = daoProduccion.obtenerConsolidadosLlenadoraMaquina(idTurno);

                foreach (DatosProduccion prod in datos)
                {
                    DatosProduccion prodConsolidado = lConsolidados.Where(p => p.idMaquina == prod.idMaquina).FirstOrDefault();
                    if (prodConsolidado != null)
                    {
                        prod.tiempoPlanificado = prodConsolidado.tiempoPlanificado;
                        prod.tiempoOperativo = prodConsolidado.tiempoOperativo;
                        prod.tiempoNeto = prodConsolidado.tiempoBruto;
                        prod.tiempoNeto = prodConsolidado.tiempoNeto;
                        prod.hectolitros = prodConsolidado.hectolitros;
                        prod.envases = prodConsolidado.envases;
                        prod.rechazos = prodConsolidado.rechazos;
                        //prod.palets = prodConsolidado.palets;
                        prod.cajas = prodConsolidado.cajas;
                        prod.velocidadNominal = prodConsolidado.velocidadNominal;
                        prod.CalidadSinPorcentaje = prodConsolidado.CalidadSinPorcentaje;
                    }
                }


                if (turnoActual != null && turnoActual.idTurno == idTurno) // Si es el turno actual
                {
                    DateTime fecActual = DateTime.Now;
                    DateTime fecInicio = fecActual.Date.AddHours(fecActual.Hour);
                    foreach (DatosProduccion prod in datos)
                    {
                        //DatosProduccion dtProd = daoProduccion.obtenerDatosProduccionMaquina((fecActual.ToUniversalTime() - new DateTime(1970, 1, 1)).TotalSeconds, (fecInicio.ToUniversalTime() - new DateTime(1970, 1, 1)).TotalSeconds, prod.idMaquina);
                        DatosProduccion dtProd = daoProduccion.ObtenerDatosProduccionMaquina(fecInicio.ToUniversalTime(), fecActual.ToUniversalTime(), prod.idMaquina);
                        if (dtProd != null)
                        {
                            prod.tiempoPlanificado += dtProd.tiempoPlanificado;
                            prod.tiempoOperativo += dtProd.tiempoOperativo;
                            prod.tiempoNeto += dtProd.tiempoBruto;
                            prod.tiempoNeto += dtProd.tiempoNeto;
                            prod.envases += dtProd.cantidadProducida;
                            prod.rechazos += dtProd.rechazos;
                            prod.velocidadNominal += dtProd.velocidadNominal;
                        }
                    }
                }

                return datos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProduccionController.obtenerProduccionLlenadorasLinea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProduccionController.obtenerProduccionLlenadorasLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_PRODUCCION"));
            }

        }

        [Route("api/produccion/obtenerProduccionEmpaquetadoraEncajonadoraLinea/{numLinea}/{idTurno}")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno)]
        public List<DatosProduccion> obtenerProduccionEmpaquetadoraEncajonadoraLinea(List<DatosProduccion> datos, int numLinea, int idTurno)
        {
            try
            {
                List<Turno> listTurnos = PlantaRT.planta.turnoActual;
                Turno turnoActual = listTurnos.Where(p => p.linea.numLinea == numLinea).FirstOrDefault();

                DAO_Produccion daoProduccion = new DAO_Produccion();
                List<DatosProduccion> lConsolidados = daoProduccion.obtenerConsolidadosEmpaquetadoraEncajonadoraMaquina(idTurno);

                foreach (DatosProduccion prod in datos)
                {
                    DatosProduccion prodConsolidado = lConsolidados.Where(p => p.idMaquina == prod.idMaquina).FirstOrDefault();
                    if (prodConsolidado != null)
                    {
                        prod.cantidadProducida = prodConsolidado.cantidadProducida;
                    }
                    DAO_ParosPerdidas daoParos = new DAO_ParosPerdidas();
                    daoParos.ObtenerResumenParosPerdidas(prod);
                }

                if (turnoActual != null && turnoActual.idTurno == idTurno) // Si es el turno actual
                {
                    DateTime fecActual = DateTime.Now;
                    DateTime fecInicio = fecActual.Date.AddHours(fecActual.Hour);
                    foreach (DatosProduccion prod in datos)
                    {
                        //DatosProduccion dtProd = daoProduccion.obtenerDatosProduccionMaquina((fecActual.ToUniversalTime() - new DateTime(1970, 1, 1)).TotalSeconds, (fecInicio.ToUniversalTime() - new DateTime(1970, 1, 1)).TotalSeconds, prod.idMaquina);
                        DatosProduccion dtProd = daoProduccion.ObtenerDatosProduccionMaquina(fecInicio, fecActual, prod.idMaquina);
                        if (dtProd != null)
                        {
                            prod.cantidadProducida += dtProd.cantidadProducida;
                        }
                    }
                }
                return datos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProduccionController.obtenerProduccionEmpaquetadoraEncajonadoraLinea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProduccionController.obtenerProduccionEmpaquetadoraEncajonadoraLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_PRODUCCION_ENCAJONADORA"));
            }

        }

        [Route("api/produccion/obtenerProduccionPaletizadoraLinea/{numLinea}/{idTurno}")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno)]
        public List<DatosProduccion> obtenerProduccionPaletizadoraLinea(List<DatosProduccion> datos, int numLinea, int idTurno)
        {
            try
            {
                List<Turno> listTurnos = PlantaRT.planta.turnoActual;
                Turno turnoActual = listTurnos.Where(p => p.linea.numLinea == numLinea).FirstOrDefault();

                DAO_Produccion daoProduccion = new DAO_Produccion();
                List<DatosProduccion> lConsolidados = daoProduccion.obtenerConsolidadosPaletizadoraMaquina(idTurno);
                lConsolidados.AddRange(daoProduccion.obtenerConsolidadosEtiquetadolaPaletsMaquina(idTurno));
                foreach (DatosProduccion prod in datos)
                {
                    DatosProduccion prodConsolidado = lConsolidados.Where(p => p.idMaquina == prod.idMaquina).FirstOrDefault();
                    if (prodConsolidado != null)
                    {
                        prod.cantidadProducida = prodConsolidado.cantidadProducida;
                    }
                    DAO_ParosPerdidas daoParos = new DAO_ParosPerdidas();
                    daoParos.ObtenerResumenParosPerdidas(prod);
                }

                if (turnoActual != null && turnoActual.idTurno == idTurno) // Si es el turno actual
                {
                    DateTime fecActual = DateTime.Now;
                    DateTime fecInicio = fecActual.Date.AddHours(fecActual.Hour);
                    foreach (DatosProduccion prod in datos)
                    {
                        //DatosProduccion dtProd = daoProduccion.obtenerDatosProduccionMaquina((fecActual.ToUniversalTime() - new DateTime(1970, 1, 1)).TotalSeconds, (fecInicio.ToUniversalTime() - new DateTime(1970, 1, 1)).TotalSeconds, prod.idMaquina);
                        DatosProduccion dtProd = daoProduccion.ObtenerDatosProduccionMaquina(fecInicio.ToUniversalTime(), fecActual.ToUniversalTime(), prod.idMaquina);
                        if (dtProd != null)
                        {
                            prod.cantidadProducida += dtProd.cantidadProducida; 
                        }
                    }
                }

                return datos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProduccionController.obtenerProduccionPaletizadoraLinea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProduccionController.obtenerProduccionPaletizadoraLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_PRODUCCION_PALETIZADORA"));
            }

        }

        [Route("api/ObtenerRechazosTurno/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno)]
        public DatosRechazosTurno ObtenerRechazosTurno(int idTurno)
        {
            try
            {
                DAO_Produccion daoProduccion = new DAO_Produccion();
                DatosRechazosTurno lConsolidados = daoProduccion.ObtenerRechazosTurno(idTurno);
                return lConsolidados;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProduccionController.ObtenerRechazosTurno", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_RECHAZOS"));
            }

        }

        [Route("api/DatosConsolidadosTurnoAnterior/{numLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_7_VisualizacionSeguimientoLineaPortal, Funciones.ENV_PROD_EXE_7_VisualizacionSeguimientoLineaTerminal)]
        public DatosProduccion GetDatosConsolidadosTurnoAnterior(int numLinea)
        {
            try
            {
                List<Turno> listTurnos = PlantaRT.planta.turnoActual;

                Turno turnoActual = listTurnos.Where(p => p.linea.numLinea == numLinea).FirstOrDefault();

                DAO_Turnos daoTurnos = new DAO_Turnos();
                DatosProduccion dtProd = new DatosProduccion();
                int idTurno = 0;

                if (turnoActual != null && turnoActual.inicio > DateTime.MinValue)
                {
                    Turno turnoAnterior = daoTurnos.ObtenerTurnoAnterior(turnoActual.linea.id, turnoActual.inicio);
                    idTurno = turnoAnterior.idTurno;
                }
                else
                {
                    using (MESEntities context = new MESEntities())
                    {
                        DateTime ahora = DateTime.Now;
                        string idLinea = context.Lineas.AsNoTracking().Where(l => l.NumeroLinea == numLinea).FirstOrDefault().Id;
                        idTurno = context.Turnos.AsNoTracking().Where(m => m.FinTurno.Value <= ahora && m.Linea.Equals(idLinea)).OrderByDescending(m => m.FinTurno).FirstOrDefault().Id;
                    }
                }

                DAO_Produccion daoProd = new DAO_Produccion();
                dtProd = daoProd.ObtenerDatosConsolidadosTurno(idTurno);

                //DAO_Orden daoOrden = new DAO_Orden();
                //List<Orden> listOrd = daoOrden.ObtenerPaletsConsolidadosOrdenTurno(idTurno, "PALETIZADORA");

                //dtProd.palets = listOrd.Sum(o => o.produccion.paletsProducidos);
                //dtProd.envases = listOrd.Sum(o => o.produccion.paletsProducidos * o.EnvasesPorPalet);
                //dtProd.cajas = listOrd.Sum(o => o.produccion.paletsProducidos * o.CajasPorPalet);

                return dtProd;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProduccionController.GetDatosConsolidadosTurnoAnterior", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_CONSOLIDADOS"));
            }
        }

        [Route("api/DatosConsolidadosTurnoActual/{numLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_7_VisualizacionSeguimientoLineaPortal, Funciones.ENV_PROD_EXE_7_VisualizacionSeguimientoLineaTerminal)]
        public Turno GetDatosConsolidadosTurnoActual(int numLinea)
        {
            try
            {
                List<Turno> listTurnos = PlantaRT.planta.turnoActual;

                Turno turnoActual = listTurnos.Find(p => p.linea.numLinea == numLinea);

                if (turnoActual == null) return new Turno();

                turnoActual.palets = turnoActual.idTurno == 0 ? 0 : DAO_Turnos.ObtenerPaletsEtiquetadoraPorLineaFechas(turnoActual.linea.id, turnoActual.inicio, DateTime.UtcNow);

                return turnoActual;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProduccionController.GetDatosConsolidadosTurnoActual", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_CONSOLIDADOS_TURNO"));
            }
        }

        [Route("api/produccion/obtenerValoresSPI")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_DIS_3_VisualizacionAnalisisSPI)]
        public QueryResultGrafico obtenerValoresSPI(dynamic datos)
        {
            try
            {
                return DAO_Produccion.obtenerDatosSemanasGrafico(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ProduccionController.obtenerValoresSPI", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProduccionController.obtenerValoresSPI", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_DEL"));
            }
        }

        [Route("api/env/produccion/obtenerProduccionMaquinasTurno/{numLinea}/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerProduccionMaquinasTurno(int numLinea, int idTurno)
        {
            try
            {
                var result = await _iDAOProduccion.ObtenerProduccionMaquinasTurno(idTurno, numLinea);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ProduccionController.ObtenerProduccionMaquinasTurno", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_PRODUCCION_MAQUINAS"));

            }
        }
    }
}
