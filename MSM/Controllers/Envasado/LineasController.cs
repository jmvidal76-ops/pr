using BreadMES.Envasado;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Models.Envasado;
using MSM.RealTime;
using MSM.Security;
using MSM.Utilidades;
using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class LineasController : ApiController
    {
        private static readonly ConcurrentDictionary<string, DateTime> _ultimoLogIncongruencia
        = new ConcurrentDictionary<string, DateTime>();

        [Route("api/lineas")]
        [HttpGet]
        //[ApiAuthorize(Funciones.ENV_PROD_EXE_8_SeguimientoEnTiempoRealDeLaWo)]
        public IEnumerable<Linea> Get()
        {
            try
            {
                List<Linea> lineas = PlantaRT.planta.lineas;
                //Recuperamos el turno actual de cada linea
                foreach (Linea linea in lineas)
                {
                    linea.turnoActual = PlantaRT.planta.turnoActual.Find(turno => turno.linea.id == linea.id);
                }
                return lineas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LineasController.Get", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.Get", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_LINEAS"));
            }
        }

        [Route("api/ObtenerParametrosLinea")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_RES_2_VisualizacionDeParametrosDelTren)]
        public List<ParametrosLinea> obtenerParametrosLinea()
        {
            try
            {
                List<ParametrosLinea> listaParametrosLinea = DAO_Linea.obtenerParametrosLinea();

                return listaParametrosLinea;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LineasController.obtenerParametrosLinea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.obtenerParametrosLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS"));
            }
        }

        [Route("api/obtenerParametrosDefecto")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_RES_16_VisualizacionParametrosDefecto)]
        public List<MSM.BBDD.Model.ParametrosDefecto> ObtenerParametrosDefecto()
        {
            try
            {
                DAO_Linea daoLinea = new DAO_Linea();
                return daoLinea.ObtenerParametrosDefecto();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.ObtenerParametrosDefecto", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PARAM_DEFECTO"));
            }
        }

        [Route("api/ObtenerProductosLinea/{idLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_2_GestionListadoDeWoPlanificadas, Funciones.ENV_PROD_EXE_1_GestionWoActivas)]
        public List<Producto> ObtenerProductosLinea(string idLinea)
        {
            try
            {
                List<Producto> listaProductosLinea = null;
                DAO_Linea daoLinea = new DAO_Linea();
                listaProductosLinea = daoLinea.ObtenerProductosLinea(idLinea);

                return listaProductosLinea.OrderBy(p => Convert.ToInt32(p.codigo)).ToList();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LineasController.obtenerProductosLinea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.obtenerProductosLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PRODUCTOS_DE"));
            }
        }

        [Route("api/modificarParametrosLinea")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_1_GestionDeParametrosDeTren)]
        public bool EditarParametrosLinea(dynamic datosParametrosLinea)
        {
            try
            {
                string idPPR = datosParametrosLinea.idPPR.Value.ToString();
                int velocidadNominal = int.Parse((datosParametrosLinea.velocidadNominal.Value == null ? "-1" : datosParametrosLinea.velocidadNominal.Value.ToString()));
                int velNomMaqLimitante = int.Parse((datosParametrosLinea.velNomMaqLimitante.Value == null ? "-1" : datosParametrosLinea.velNomMaqLimitante.Value.ToString()));
                double oeeObjetivo = double.Parse((datosParametrosLinea.OEE_objetivo.Value == null ? "-1" : datosParametrosLinea.OEE_objetivo.Value.ToString()));
                double oeeCritico = double.Parse((datosParametrosLinea.OEE_critico.Value == null ? "-1" : datosParametrosLinea.OEE_critico.Value.ToString()));
                //double oeeCalculado = double.Parse((datosParametrosLinea.OEE_calculado.Value == null ? "-1" : datosParametrosLinea.OEE_calculado.Value.ToString()));
                double oeePreactor = double.Parse((datosParametrosLinea.OEE_preactor.Value == null ? "-1" : datosParametrosLinea.OEE_preactor.Value.ToString()));
                bool inhabilitarCalculo = (bool)datosParametrosLinea.inhabilitarCalculo.Value;
                string linea = IdiomaController.GetResourceName("LINEA") + " " + datosParametrosLinea.linea.Value.ToString();
                string codigoProducto = IdiomaController.GetResourceName("PRODUCTO") + " " + datosParametrosLinea.codigoProducto.Value.ToString();

                ParametrosBread.ModificarParametrosRegistro(idPPR, velocidadNominal, velNomMaqLimitante, oeeObjetivo, oeeCritico, null, oeePreactor, inhabilitarCalculo);

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.EditarParametrosLinea",
                    "Se han modificado los parámetros del registro de la " + linea + " y " + codigoProducto + ". " +
                    IdiomaController.GetResourceName("VELOCIDAD_NOMINAL") + ": " + velocidadNominal + ", " +
                    IdiomaController.GetResourceName("VEL_NOM_MAQ_LIMITANTE") + ": " + velNomMaqLimitante + ", " +
                    IdiomaController.GetResourceName("OEE_OBJETIVO") + ": " + oeeObjetivo + ", " +
                    IdiomaController.GetResourceName("OEE_CRITICO") + ": " + oeeCritico + ", " +
                    IdiomaController.GetResourceName("OEE_PREACTOR") + ": " + oeePreactor + ", " +
                    IdiomaController.GetResourceName("INHABILITAR_CALCULO") + ": " + (inhabilitarCalculo ? IdiomaController.GetResourceName("SI") : IdiomaController.GetResourceName("NO")),
                    HttpContext.Current.User.Identity.Name);

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.editarParametroLinea", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/editarParametrosDefecto")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_15_GestionParametrosDefecto)]
        public bool EditarParametrosDefecto(dynamic datosParametrosDefecto)
        {
            try
            {
                var id = long.Parse(datosParametrosDefecto.id.Value);
                int velocidadNominal = int.Parse(datosParametrosDefecto.velocidadNominal.Value == null ? "-1" : datosParametrosDefecto.velocidadNominal.Value.ToString());
                int velNomMaqLimitante = int.Parse(datosParametrosDefecto.velNomMaqLimitante.Value == null ? "-1" : datosParametrosDefecto.velNomMaqLimitante.Value.ToString());
                double oeeObjetivo = double.Parse(datosParametrosDefecto.OEE_objetivo.Value == null ? "-1" : datosParametrosDefecto.OEE_objetivo.Value.ToString());
                double oeeCritico = double.Parse(datosParametrosDefecto.OEE_critico.Value == null ? "-1" : datosParametrosDefecto.OEE_critico.Value.ToString());
                double oeePreactor = double.Parse(datosParametrosDefecto.OEE_preactor.Value == null ? "-1" : datosParametrosDefecto.OEE_preactor.Value.ToString());
                string linea = IdiomaController.GetResourceName("LINEA") + " " + datosParametrosDefecto.linea.Value.ToString();
                string formatoComun = IdiomaController.GetResourceName("FORMATO_COMUN") + " " + datosParametrosDefecto.formatoComun.Value.ToString();

                ParametrosBread.ModificarParametrosDefecto(id, velocidadNominal, velNomMaqLimitante, oeeObjetivo, oeeCritico, oeePreactor);

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.EditarParametrosDefecto",
                    "Se han modificado los parámetros del registro de la " + linea + " y " + formatoComun + ". " +
                    IdiomaController.GetResourceName("VELOCIDAD_NOMINAL") + ": " + velocidadNominal + ", " +
                    IdiomaController.GetResourceName("VEL_NOM_MAQ_LIMITANTE") + ": " + velNomMaqLimitante + ", " +
                    IdiomaController.GetResourceName("OEE_OBJETIVO") + ": " + oeeObjetivo + ", " +
                    IdiomaController.GetResourceName("OEE_CRITICO") + ": " + oeeCritico + ", " +
                    IdiomaController.GetResourceName("OEE_PREACTOR") + ": " + oeePreactor, HttpContext.Current.User.Identity.Name);

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.EditarParametrosDefecto", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        [Route("api/asignarParametrosLinea")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_1_GestionDeParametrosDeTren)]
        public bool asignarParametrosLineas(dynamic datosParametrosLinea)
        {
            try
            {
                int velocidadNominal = int.Parse((datosParametrosLinea.velNom.Value == "" ? "-1" : datosParametrosLinea.velNom.Value.ToString().Replace(",", ".")));
                int velNomMaqLimitante = int.Parse((datosParametrosLinea.velNomMaqLimitante.Value == "" ? "-1" : datosParametrosLinea.velNomMaqLimitante.Value.ToString().Replace(",", ".")));
                double oeeObjetivo = double.Parse((datosParametrosLinea.oeeObj.Value == "" ? "-1" : datosParametrosLinea.oeeObj.Value.ToString()));
                double oeePre = double.Parse((datosParametrosLinea.oeePre.Value == "" ? "-1" : datosParametrosLinea.oeePre.Value.ToString()));
                double oeeCri = double.Parse((datosParametrosLinea.oeeCri.Value == "" ? "-1" : datosParametrosLinea.oeeCri.Value.ToString()));
                bool inhabilitarCalculo = (bool)datosParametrosLinea.inhabilitarCalculo.Value;

                List<string> listaLineasProductos = new List<string>();

                foreach (var item in datosParametrosLinea.cambios)
                {
                    string idPPR = item.idPPR.Value;
                    listaLineasProductos.Add(item.lineaProducto.Value);
                    ParametrosBread.ModificarParametrosRegistro(idPPR, velocidadNominal, velNomMaqLimitante, oeeObjetivo, oeeCri, null, oeePre, inhabilitarCalculo);
                }

                var textoVelocidadNominal = velocidadNominal == -1 ? string.Empty : IdiomaController.GetResourceName("VELOCIDAD_NOMINAL") + ": " + velocidadNominal + ", ";
                var textoVelNomMaqLimitante = velNomMaqLimitante == -1 ? string.Empty : IdiomaController.GetResourceName("VEL_NOM_MAQ_LIMITANTE") + ": " + velNomMaqLimitante + ", ";
                var textoOeeObjetivo = oeeObjetivo == -1 ? string.Empty : IdiomaController.GetResourceName("OEE_OBJETIVO") + ": " + oeeObjetivo + ", ";
                var textoOeeCritico = oeeCri == -1 ? string.Empty : IdiomaController.GetResourceName("OEE_CRITICO") + ": " + oeeCri + ", ";
                var textoOeePreactor = oeePre == -1 ? string.Empty : IdiomaController.GetResourceName("OEE_PREACTOR") + ": " + oeePre + ", ";

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.crearEditarParámetroLínea",
                    "Se han modificado los parámetros de los registros: " + string.Join(", ", listaLineasProductos) + ". " +
                    textoVelocidadNominal + textoVelNomMaqLimitante + textoOeeObjetivo + textoOeeCritico + textoOeePreactor +
                    IdiomaController.GetResourceName("INHABILITAR_CALCULO") + ": " + (inhabilitarCalculo ? IdiomaController.GetResourceName("SI") : IdiomaController.GetResourceName("NO")),
                    HttpContext.Current.User.Identity.Name);

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.asignarParametrosLineas", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/asignarParametrosDefecto")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_15_GestionParametrosDefecto)]
        public bool AsignarParametrosDefecto(dynamic datosParametrosDefecto)
        {
            try
            {
                int velocidadNominal = int.Parse((datosParametrosDefecto.velNom.Value == "" ? "-1" : datosParametrosDefecto.velNom.Value.ToString().Replace(",", ".")));
                int velNomMaqLimitante = int.Parse((datosParametrosDefecto.velNomMaqLimitante.Value == "" ? "-1" : datosParametrosDefecto.velNomMaqLimitante.Value.ToString().Replace(",", ".")));
                double oeeObjetivo = double.Parse((datosParametrosDefecto.oeeObj.Value == "" ? "-1" : datosParametrosDefecto.oeeObj.Value.ToString()));
                double oeePre = double.Parse((datosParametrosDefecto.oeePre.Value == "" ? "-1" : datosParametrosDefecto.oeePre.Value.ToString()));
                double oeeCri = double.Parse((datosParametrosDefecto.oeeCri.Value == "" ? "-1" : datosParametrosDefecto.oeeCri.Value.ToString()));

                List<string> listaLineasFormato = new List<string>();

                foreach (var item in datosParametrosDefecto.cambios)
                {
                    long id = (long)item.id.Value;
                    listaLineasFormato.Add(item.lineaFormato.Value);
                    ParametrosBread.ModificarParametrosDefecto(id, velocidadNominal, velNomMaqLimitante, oeeObjetivo, oeeCri, oeePre);
                }

                var textoVelocidadNominal = velocidadNominal == -1 ? string.Empty : IdiomaController.GetResourceName("VELOCIDAD_NOMINAL") + ": " + velocidadNominal + ", ";
                var textoVelNomMaqLimitante = velNomMaqLimitante == -1 ? string.Empty : IdiomaController.GetResourceName("VEL_NOM_MAQ_LIMITANTE") + ": " + velNomMaqLimitante + ", ";
                var textoOeeObjetivo = oeeObjetivo == -1 ? string.Empty : IdiomaController.GetResourceName("OEE_OBJETIVO") + ": " + oeeObjetivo + ", ";
                var textoOeeCritico = oeeCri == -1 ? string.Empty : IdiomaController.GetResourceName("OEE_CRITICO") + ": " + oeeCri + ", ";
                var textoOeePreactor = oeePre == -1 ? string.Empty : IdiomaController.GetResourceName("OEE_PREACTOR") + ": " + oeePre + ", ";

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.AsignarParametrosDefecto",
                    "Se han modificado los parámetros de los registros: " + string.Join(", ", listaLineasFormato) + ". " +
                    textoVelocidadNominal + textoVelNomMaqLimitante + textoOeeObjetivo + textoOeeCritico + textoOeePreactor, HttpContext.Current.User.Identity.Name);

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.AsignarParametrosDefecto", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        [Route("api/ObtenerMaquinasLinea/{numLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_7_VisualizacionSeguimientoLineaTerminal)]
        public List<Maquina> ObtenerMaquinasLinea(int numLinea)
        {
            try
            {
                List<Maquina> resultMaq = new List<Maquina>();
                DAO_Maquinas daoMaquinas = new DAO_Maquinas();

                Linea lin = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea);
                lin.zonas.ForEach(z =>
                {
                    z.revisarCambiosWOMaquinas();
                    resultMaq.AddRange(z.maquinas);
                });

                //foreach (Maquina maquina in resultMaq)
                //{
                //    maquina.CantidadWO = daoMaquinas.ObtenerContadorProduccionWO(maquina.id);
                //}

                return resultMaq;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.ObtenerMaquinasLinea", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_EN_LA_OBTENCION"));
            }
        }

        [Route("api/lineas/{idLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_7_VisualizacionSeguimientoLineaTerminal)]
        public Linea Get(string idLinea)
        {
            return Utils.GetLinea(idLinea);
        }

        [Route("api/lineasVideowall/{idLinea}")]
        [HttpGet]
        [AllowAnonymous]
        public Linea GetLinea(string idLinea)
        {
            return Utils.GetLinea(idLinea);
        }

        [Route("api/lineas/getSeguimientoWO/{idLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_8_SeguimientoTurnoEnCurso)]
        public DTO_SeguimientoWO GetSeguimientoWO(string idLinea)
        {
            try
            {
                const int MINUTOS_UMBRAL_INCONGR = 5;

                Hashtable htFechasTurnoTeorico = null;
                DTO_SeguimientoWO seguimientoWO = new DTO_SeguimientoWO();

                // Turno y línea
                Turno turnoActual = PlantaRT.planta.turnoActual.Find(t => t.linea.id == idLinea);
                Linea linea = PlantaRT.planta.lineas.Find(l => l.id == idLinea);

                // Cabecera: turno
                if (turnoActual != null && turnoActual.turnoProductivo)
                {
                    seguimientoWO.cabecera.inicio = turnoActual.inicioLocal.ToString("dd/MM/yyyy");
                    seguimientoWO.cabecera.tipo = turnoActual.tipo.id.ToString();
                }
                else
                {
                    seguimientoWO.cabecera.inicio = DateTime.Today.ToString("dd/MM/yyyy");
                    seguimientoWO.cabecera.tipo = "No planificado";
                    htFechasTurnoTeorico = DAO_Turnos.getInicioTurnoNuloPorHora(DateTime.Now);
                }

                // Cabecera: orden (en paletizadora)
                Orden ordenEnPaletizadora = null;
                linea.zonas.ForEach(z =>
                {
                    if (z.esPaletizadora)
                    {
                        ordenEnPaletizadora = z.ordenActual;
                        return;
                    }
                });

                if (ordenEnPaletizadora != null)
                {
                    seguimientoWO.cabecera.idOrden = ordenEnPaletizadora.id;
                    seguimientoWO.cabecera.tipoCerveza = ordenEnPaletizadora.producto.tipoProducto.nombre;
                    seguimientoWO.cabecera.codigoProducto = ordenEnPaletizadora.producto.codigo;
                    seguimientoWO.cabecera.descripcionProduct = ordenEnPaletizadora.producto.nombre;
                    seguimientoWO.cabecera.cantidadPlanificada = ordenEnPaletizadora.cantPlanificada;
                    seguimientoWO.cabecera.inicioOrden = ordenEnPaletizadora.fecInicio;
                    seguimientoWO.cabecera.finOrden = Utils.getDateTurno(PlantaRT.planta.turnoActual.Find(x => x.linea.numLinea == linea.numLinea), ordenEnPaletizadora);

                    DateTime dtfinOrden;
                    if (DateTime.TryParse(seguimientoWO.cabecera.finOrden, out dtfinOrden))
                    {
                        TimeSpan diff = dtfinOrden - DateTime.Now;
                        string zeroHours = Convert.ToInt32(diff.Hours) < 10 ? "0" : "";
                        string zeroMinutes = Convert.ToInt32(diff.Minutes) < 10 ? "0" : "";
                        string zeroSeconds = Convert.ToInt32(diff.Seconds) < 10 ? "0" : "";
                        seguimientoWO.cabecera.duracionOrdenTurno =
                            zeroHours + Convert.ToInt32(diff.Hours) + ":" +
                            zeroMinutes + Convert.ToInt32(diff.Minutes) + ":" +
                            zeroSeconds + Convert.ToInt32(diff.Seconds);
                    }
                    else
                    {
                        seguimientoWO.cabecera.duracionOrdenTurno = "00:00:00";
                    }

                    seguimientoWO.cabecera.duracionOrden = ordenEnPaletizadora.duracionCalculada;
                    seguimientoWO.cabecera.velocidadNominal = ordenEnPaletizadora.velocidadNominal; // env/h
                }

                seguimientoWO.cabecera.oeeObjetivo = linea.oeeObjetivo;
                seguimientoWO.cabecera.oeeCritico = linea.oeeCritico;

                // Desde inicio turno (acumulados)
                seguimientoWO.valoresDesdeInicioTurno.envases = 0;
                seguimientoWO.valoresDesdeInicioTurno.velocidadNominal = 0;
                seguimientoWO.valoresDesdeInicioTurno.fecInicio = turnoActual == null ? (DateTime)htFechasTurnoTeorico["Inicio"] : turnoActual.inicioLocal;
                seguimientoWO.valoresDesdeInicioTurno.fecFin = DateTime.Now;

                // Rechazos por máquina
                List<Maquina> maquinas = linea.obtenerMaquinas;
                int rechazosClasificadores = 0;
                int rechazosInspectorVacios = 0;
                int rechazosLlenadora = 0;
                int rechazosProductoTerminado = 0;
                foreach (Maquina maquina in maquinas)
                {
                    switch (maquina.tipo.nombre)
                    {
                        case "CLASIFICADOR":
                            rechazosClasificadores += maquina.datosSeguimiento.datosProduccionHoras.Sum(p => p.rechazos);
                            break;
                        case "INSPECTOR_BOTELLAS_VACIAS":
                            rechazosInspectorVacios += maquina.datosSeguimiento.datosProduccionHoras.Sum(p => p.rechazos);
                            break;
                        case "INSPECTOR_SALIDA_LLENADORA":
                            rechazosLlenadora += maquina.datosSeguimiento.datosProduccionHoras.Sum(p => p.rechazos);
                            break;
                        case "INSPECTOR_BOTELLAS_LLENAS":
                        case "BASCULA":
                            rechazosProductoTerminado += maquina.datosSeguimiento.datosProduccionHoras.Sum(p => p.rechazos);
                            break;
                    }
                }

                // Rechazos manuales (nivel orden)
                seguimientoWO.valoresDesdeInicioTurno.rechazosClasificadores = rechazosClasificadores + (ordenEnPaletizadora != null ? ordenEnPaletizadora.rechazosClasificadorManual : 0);
                seguimientoWO.valoresDesdeInicioTurno.rechazosInspectorVacios = rechazosInspectorVacios + (ordenEnPaletizadora != null ? ordenEnPaletizadora.rechazosVaciosManual : 0);
                seguimientoWO.valoresDesdeInicioTurno.rechazosLlenadora = rechazosLlenadora + (ordenEnPaletizadora != null ? ordenEnPaletizadora.rechazosLlenadoraManual : 0);
                seguimientoWO.valoresDesdeInicioTurno.rechazosProductoTerminado = rechazosProductoTerminado + (ordenEnPaletizadora != null ? ordenEnPaletizadora.rechazosProductoTerminadoManual : 0);
                seguimientoWO.valoresDesdeInicioTurno.rechazos =
                    seguimientoWO.valoresDesdeInicioTurno.rechazosClasificadores +
                    seguimientoWO.valoresDesdeInicioTurno.rechazosInspectorVacios +
                    seguimientoWO.valoresDesdeInicioTurno.rechazosLlenadora +
                    seguimientoWO.valoresDesdeInicioTurno.rechazosProductoTerminado;

                // Acumulación de valores del turno
                #region valoresInicioTurno
                foreach (Maquina llenadora in linea.llenadoras)
                {
                    seguimientoWO.valoresDesdeInicioTurno.envases += llenadora.datosSeguimiento.CantidadProducidaTurno;
                    seguimientoWO.valoresDesdeInicioTurno.hectolitros += ordenEnPaletizadora != null ? llenadora.datosSeguimiento.CantidadProducidaTurno * ordenEnPaletizadora.producto.hectolitros.Value : 0;
                    seguimientoWO.valoresDesdeInicioTurno.tiempoPlanificado += llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.tiempoPlanificado);
                    seguimientoWO.valoresDesdeInicioTurno.tiempoOperativo += llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.tiempoOperativo);
                    seguimientoWO.valoresDesdeInicioTurno.tiempoBruto += llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.tiempoBruto);
                    seguimientoWO.valoresDesdeInicioTurno.tiempoNeto += llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.tiempoNeto);
                    seguimientoWO.valoresDesdeInicioTurno.velocidadNominal += ModelHelper.sanitize(llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.velocidadNominal));
                    seguimientoWO.valoresDesdeInicioTurno.velocidadRealMedia += ModelHelper.sanitize(llenadora.datosSeguimiento.VelocidadRealTurno);
                }

                seguimientoWO.valoresDesdeInicioTurno.produccionReal =
                    (turnoActual == null || turnoActual.idTurno == 0) ? 0 :
                    DAO_Turnos.ObtenerPaletsEtiquetadoraPorLineaFechas(turnoActual.linea.id, turnoActual.inicio, DateTime.UtcNow);

                foreach (Maquina encajonadora in linea.encajonadoras)
                {
                    seguimientoWO.valoresDesdeInicioTurno.cajas += encajonadora.datosSeguimiento.CantidadProducidaTurno;
                }
                #endregion

                // Desde inicio de orden
                #region valoresInicioOrden
                if (ordenEnPaletizadora != null)
                {
                    seguimientoWO.valoresDesdeInicioOrden.fecInicio = ordenEnPaletizadora.dFecInicio;
                    seguimientoWO.valoresDesdeInicioOrden.fecFin = ordenEnPaletizadora.dFecFin > DateTime.Now.ToUniversalTime() ? ordenEnPaletizadora.dFecFin : DateTime.Now.ToUniversalTime();
                    seguimientoWO.valoresDesdeInicioOrden.envases = ordenEnPaletizadora.produccion.envases;
                    seguimientoWO.valoresDesdeInicioOrden.palets = ordenEnPaletizadora.produccion.paletsEtiquetadoraProducidos;
                    seguimientoWO.valoresDesdeInicioOrden.cajas = ordenEnPaletizadora.produccion.cajas;
                    seguimientoWO.valoresDesdeInicioOrden.oee = ordenEnPaletizadora.produccion.oee;
                    seguimientoWO.valoresDesdeInicioOrden.rendimiento = ordenEnPaletizadora.produccion.rendimiento;
                    seguimientoWO.valoresDesdeInicioOrden.rechazosClasificadores = ordenEnPaletizadora.produccion.rechazosClasificadores;
                    seguimientoWO.valoresDesdeInicioOrden.rechazosInspectorVacios = ordenEnPaletizadora.produccion.rechazosInspectorVacios;
                    seguimientoWO.valoresDesdeInicioOrden.rechazosLlenadora = ordenEnPaletizadora.produccion.rechazosLlenadora;
                    seguimientoWO.valoresDesdeInicioOrden.rechazosProductoTerminado = ordenEnPaletizadora.produccion.rechazosProductoTerminado;
                    seguimientoWO.valoresDesdeInicioOrden.rechazos =
                        ordenEnPaletizadora.produccion.rechazosClasificadores +
                        ordenEnPaletizadora.produccion.rechazosInspectorVacios +
                        ordenEnPaletizadora.produccion.rechazosLlenadora +
                        ordenEnPaletizadora.produccion.rechazosProductoTerminado;
                    seguimientoWO.valoresDesdeInicioOrden.hectolitros =
                        ordenEnPaletizadora.produccion.envases * ordenEnPaletizadora.producto.hectolitros.Value;
                    seguimientoWO.valoresDesdeInicioOrden.velocidadRealMedia = ModelHelper.sanitize(ordenEnPaletizadora.produccion.velocidadRealMedia);
                    seguimientoWO.valoresDesdeInicioOrden.velocidadNominal = ModelHelper.sanitize(ordenEnPaletizadora.produccion.velocidadNominal);
                }
                #endregion

                // Asignación de máquinas
                seguimientoWO.llenadoras = linea.llenadoras;
                seguimientoWO.paleteras = linea.paleteras;
                seguimientoWO.encajonadoras = linea.encajonadoras;

                // Franjas horarias base (8h)
                #region datosFranjasHorarias
                if (htFechasTurnoTeorico == null) htFechasTurnoTeorico = DAO_Turnos.getInicioTurnoNuloPorHora(DateTime.Now);
                for (int i = 0; i < 8; i++)
                {
                    seguimientoWO.franjas.Add(new DTO_DatosProduccionTurno());
                    seguimientoWO.franjasTitles.Add(String.Format("{0}", ((DateTime)htFechasTurnoTeorico["Inicio"]).AddHours(i).Hour));
                }

                // Llenadoras → franjas
                foreach (Maquina llenadora in seguimientoWO.llenadoras)
                {
                    //DAO_Log.RegistrarLogBook("DEBUG", 0, 0,
                    //  "CHK_LINK LL='" + llenadora.nombre + "' zona=" + (llenadora._refZona?.descripcion ?? "NULL") +
                    //  " ordenZona=" + (llenadora._refZona?.ordenActual?.id ?? "NULL") +
                    //  " ordenIdMaquina=" + (llenadora.ordenIdMaquina ?? "NULL") +
                    //  " EsLLenadora=" + llenadora.datosSeguimiento.EsLLenadora +
                    //  " FechaAct=" + llenadora.FechaActualizacion.ToString("o"),
                    //  "LineasController.GetSeguimientoWO", "WEB-ENVASADO", "Sistema");
                    foreach (DatosProduccion datosProduccion in llenadora.datosSeguimiento.datosProduccionHoras)
                    {
                        int index = seguimientoWO.franjasTitles.IndexOf(datosProduccion.fecInicio.ToLocalTime().Hour.ToString());
                        if (index > -1)
                        {
                            DTO_DatosProduccionTurno franjaOld = seguimientoWO.franjas[index];
                            franjaOld.envases += datosProduccion.cantidadProducida;
                            franjaOld.tiempoPlanificado += datosProduccion.tiempoPlanificado;
                            franjaOld.tiempoOperativo += datosProduccion.tiempoOperativo;
                            franjaOld.tiempoBruto += datosProduccion.tiempoBruto;
                            franjaOld.tiempoNeto += datosProduccion.tiempoNeto;
                            franjaOld.velocidadNominal += datosProduccion.velocidadNominal;
                        }
                    }

                    //DAO_Log.RegistrarLogBook("DEBUG", 0, 0,
                    //  "CHK_BUCKETS LL='" + llenadora.nombre + "' horasCount=" + (llenadora.datosSeguimiento.datosProduccionHoras?.Count ?? 0) +
                    //  " vNomTurno=" + llenadora.datosSeguimiento.VelocidadNominalTurno.ToString("F2") +
                    //  " vRealTurno=" + llenadora.datosSeguimiento.VelocidadRealTurno.ToString("F2"),
                    //  "LineasController.GetSeguimientoWO", "WEB-ENVASADO", "Sistema");

                }

                // Etiquetadoras → franjas (consulta UTC)
                for (int i = 0; i < seguimientoWO.franjasTitles.Count; i++)
                {
                    int hora = Convert.ToInt32(seguimientoWO.franjasTitles[i]);
                    DateTime fechaInicio = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, hora, 0, 0).ToUniversalTime();
                    seguimientoWO.franjas[i].palets = DAO_Turnos.ObtenerPaletsEtiquetadoraPorLineaFechas(linea.id, fechaInicio, fechaInicio.AddHours(1).AddSeconds(-1));
                }

                // Encajonadoras → franjas
                foreach (Maquina encajonadora in seguimientoWO.encajonadoras)
                {
                    for (int i = 0; i < encajonadora.datosSeguimiento.datosProduccionHoras.Count(); i++)
                    {
                        int index = seguimientoWO.franjasTitles.IndexOf(encajonadora.datosSeguimiento.datosProduccionHoras[i].fecInicio.ToLocalTime().Hour.ToString());
                        if (index > -1)
                        {
                            seguimientoWO.franjas[index].cajas += encajonadora.datosSeguimiento.datosProduccionHoras[i].cantidadProducida;
                        }
                    }
                }
                #endregion

                // Categorías (horas locales del turno)
                DateTime fecha = (DateTime)htFechasTurnoTeorico["Inicio"];
                DateTime fechaFinLocal = (DateTime)htFechasTurnoTeorico["Fin"];
                while (fecha < fechaFinLocal)
                {
                    seguimientoWO.categoryLabels.Add(String.Format("{0} - {1}", fecha.Hour, fecha.AddHours(1).Hour));
                    fecha = fecha.AddHours(1);
                }

                // Gráfico: rendimiento por llenadora
                #region graficaRendimientoTurno
                string[] colores = new string[] { "#f3ac32", "#b8b8b8", "#bb6e36", "#f3ac32", "#b8b8b8", "#bb6e36" };

                int indexColor = 0;
                seguimientoWO.totalTiempoOperativo = turnoActual?.tNeto ?? 0;

                // Suma de paros (una vez)
                foreach (var m in linea.llenadoras)
                {
                    seguimientoWO.totalParosMayores += m.datosSeguimiento.TiempoParosMayoresTurno;
                    seguimientoWO.totalParosMenores += m.datosSeguimiento.TiempoBajaVelocidadTurno + m.datosSeguimiento.TiempoParosMenoresTurno;
                }

                // Nominal base de orden para estimaciones (env/h)
                double velNomOrdenBase = ordenEnPaletizadora != null ? ordenEnPaletizadora.velocidadNominal : 0;

                foreach (Maquina llenadora in linea.llenadoras)
                {
                    var serie = new DTO_SeguimientoWO.Serie()
                    {
                        name = llenadora.nombre,
                        color = colores[indexColor % colores.Length],
                        data = new List<double?>()
                    };

                    int horaLocalActual = DateTime.Now.Hour;
                    string etiquetaHoraActual = horaLocalActual.ToString();
                    bool existeBucketHoraActual = llenadora.datosSeguimiento.datosProduccionHoras.Any(h => h.fecInicio.ToLocalTime().Hour.ToString() == etiquetaHoraActual);

                    if (!existeBucketHoraActual)
                    {
                        // ¿han pasado al menos X minutos desde el inicio teórico de la franja?
                        DateTime inicioFranjaLocal = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, horaLocalActual, 0, 0);
                        double minutosTranscurridos = (DateTime.Now - inicioFranjaLocal).TotalMinutes;

                        // hay "base" si tenemos producción o nominal del turno/orden
                        bool hayBase =
                            llenadora.datosSeguimiento.CantidadProducidaTurno > 0 ||
                            llenadora.datosSeguimiento.VelocidadNominalTurno > 0 ||
                            velNomOrdenBase > 0;

                        if (minutosTranscurridos >= MINUTOS_UMBRAL_INCONGR && hayBase)
                        {
                            string claveLog = $"INCONGR_NO_BUCKET|{llenadora.id}|{DateTime.Now:yyyyMMddHH}";
                            if (ShouldLogIncongruencia(claveLog, TimeSpan.FromMinutes(5))) // <- 1 log cada 5 min por máquina/hora
                            {
                                DAO_Log.RegistrarLogBook(
                                    "DEBUG", 0, 0,
                                    "INCONGR_NO_BUCKET: LL='" + llenadora.nombre + "'" +
                                    " hora=" + horaLocalActual +
                                    " minTrans=" + minutosTranscurridos.ToString("F1") +
                                    " cantTurno=" + llenadora.datosSeguimiento.CantidadProducidaTurno.ToString("F0") +
                                    " vNomTurno=" + llenadora.datosSeguimiento.VelocidadNominalTurno.ToString("F2") +
                                    " vNomOrden=" + velNomOrdenBase.ToString("F2"),
                                    "LineasController.GetSeguimientoWO", "WEB-ENVASADO", "Sistema"
                                );
                            }
                        }
                    }

                    // Construcción de serie desde buckets horarios
                    foreach (var dp in llenadora.datosSeguimiento.datosProduccionHoras.OrderBy(x => x.fecInicio))
                    {
                        var horaLocal = dp.fecInicio.ToLocalTime().Hour.ToString();
                        int idx = seguimientoWO.franjasTitles.IndexOf(horaLocal);

                        int huecos = idx - serie.data.Count;
                        for (int i = 0; i < huecos; i++)
                            serie.data.Add((double?)null);

                        double? valor = dp.rendimiento;
                        if (!valor.HasValue || double.IsNaN(valor.Value) || double.IsInfinity(valor.Value) || valor.Value <= 0)
                            valor = null;

                        if (valor.HasValue) valor = Math.Max(0, Math.Min(110, valor.Value));
                        serie.data.Add(valor);
                    }

                    // --- Parche en vivo: si no hay bucket para la hora actual, pinta un punto estimado en esa hora ---
                    int idxHoraActual = seguimientoWO.franjasTitles.IndexOf(DateTime.Now.Hour.ToString());
                    if (idxHoraActual >= 0 && !existeBucketHoraActual)
                    {
                        bool yaHayPuntoHoraActual = idxHoraActual < serie.data.Count && serie.data[idxHoraActual].HasValue;
                        if (!yaHayPuntoHoraActual)
                        {
                            double velNomTurno = llenadora.datosSeguimiento.VelocidadNominalTurno; // env/h
                            double velRealTurno = llenadora.datosSeguimiento.VelocidadRealTurno;   // env/h
                            double? rendLive = null;

                            if (velNomTurno > 0 && velRealTurno >= 0)
                            {
                                rendLive = (velRealTurno / velNomTurno) * 100.0;
                                rendLive = Math.Max(0, Math.Min(110, rendLive.Value));
                            }

                            while (serie.data.Count < idxHoraActual)
                                serie.data.Add((double?)null);

                            if (serie.data.Count == idxHoraActual)
                                serie.data.Add(rendLive);
                            else
                                serie.data[idxHoraActual] = rendLive;
                        }
                    }

                    // Padding final con nulls hasta categorías
                    while (serie.data.Count < seguimientoWO.categoryLabels.Count)
                        serie.data.Add((double?)null);

                    seguimientoWO.seriesData.Add(serie);
                    indexColor++;
                }
                #endregion

                return seguimientoWO;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.GetSeguimientoWO", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_INFORMACIÓN"));
            }
        }


        [Route("api/lineas/getSeguimiento/{idLinea}")]
        [HttpGet]
        [AllowAnonymous]
        public DTO_SeguimientoWO GetSeguimiento(string idLinea)
        {
            try
            {
                //Creamos el objeto contenedor de toda la información
                DTO_SeguimientoWO seguimientoWO = new DTO_SeguimientoWO();

                //Cargamos la información del turno actual
                Turno turnoActual = PlantaRT.planta.turnoActual.Find(t => t.linea.id == idLinea);
                //Cargamos la información de la linea solicitada
                Linea linea = PlantaRT.planta.lineas.Find(l => l.id == idLinea);
                
                //Obtención de informacion de cabecera:
                seguimientoWO.cabecera.inicio = turnoActual.inicioLocal.ToString("dd/MM/yyyy");
                seguimientoWO.cabecera.tipo = turnoActual.tipo.id.ToString();

                if (linea.ordenEnCurso != null)
                {
                    seguimientoWO.cabecera.idOrden = linea.ordenEnCurso.id;
                    seguimientoWO.cabecera.tipoCerveza = linea.ordenEnCurso.producto.tipoProducto.nombre;
                    seguimientoWO.cabecera.codigoProducto = linea.ordenEnCurso.producto.codigo;
                    seguimientoWO.cabecera.descripcionProduct = linea.ordenEnCurso.producto.nombre;
                    seguimientoWO.cabecera.cantidadPlanificada = linea.ordenEnCurso.cantPlanificada;
                    seguimientoWO.cabecera.inicioOrden = linea.ordenEnCurso.fecInicio;
                    seguimientoWO.cabecera.finOrden = linea.ordenEnCurso.fecFin;
                    seguimientoWO.cabecera.duracionOrden = linea.ordenEnCurso.duracion;
                    seguimientoWO.cabecera.velocidadNominal = linea.ordenEnCurso.velocidadNominal;
                }

                seguimientoWO.cabecera.oeeObjetivo = linea.oeeObjetivo;
                seguimientoWO.cabecera.oeeCritico = linea.oeeCritico;
                //Obtención de datos desde el inicio del turno:

                seguimientoWO.valoresDesdeInicioTurno.envases = 0;
                //seguimientoWO.valoresDesdeInicioTurno.datosProduccionAvanceTurno.velocidadReal = 0;
                seguimientoWO.valoresDesdeInicioTurno.velocidadNominal = 0;

                //Acumulación de valores del turno
                foreach (Maquina llenadora in linea.llenadoras)
                {
                    seguimientoWO.valoresDesdeInicioTurno.envases += llenadora.datosSeguimiento.CantidadProducidaTurno;
                    seguimientoWO.valoresDesdeInicioTurno.rechazos += llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.rechazos);
                    seguimientoWO.valoresDesdeInicioTurno.hectolitros += llenadora.datosSeguimiento.hectolitros;
                    seguimientoWO.valoresDesdeInicioTurno.tiempoPlanificado += llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.tiempoPlanificado);
                    seguimientoWO.valoresDesdeInicioTurno.tiempoOperativo += llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.tiempoOperativo);
                    seguimientoWO.valoresDesdeInicioTurno.tiempoBruto += llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.tiempoBruto);
                    seguimientoWO.valoresDesdeInicioTurno.tiempoNeto += llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.tiempoNeto);
                    seguimientoWO.valoresDesdeInicioTurno.velocidadNominal += ModelHelper.sanitize(llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.velocidadNominal));
                    seguimientoWO.valoresDesdeInicioTurno.velocidadRealMedia += ModelHelper.sanitize(llenadora.datosSeguimiento.VelocidadRealTurno);
                }

                foreach (Maquina paletera in linea.paleteras)
                {
                    seguimientoWO.valoresDesdeInicioTurno.palets += paletera.datosSeguimiento.CantidadProducidaTurno;
                }

                return seguimientoWO;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, ex.Message, "OrdenesController.GetSeguimiento", "I-MES-ENV", "System");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_INFORMACIÓN"));
            }
        }

        [Route("api/obtenerTiposArranque/{numLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_45_GestionListadoDeWo, Funciones.ENV_PROD_EXE_32_GestionOrdenesArranque,
                      Funciones.ENV_PROD_DIS_3_VisualizacionAnalisisSPI, Funciones.ENV_PROD_INF_VisualizacionInformes)]
        public List<Arranque> ObtenerTiposArranque(int numLinea)
        {
            try
            {
                List<Arranque> lstArranques = DAO_Linea.ObtenerTiposArranqueLinea(numLinea);
                return lstArranques;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LineasController.obtenerTiposArranque", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.obtenerTiposArranque", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TIPOS_ARRANQUES"));
            }
        }

        [Route("api/calcularOEEPreactor")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_1_GestionDeParametrosDeTren)]
        public bool calcularOEEPreactor(dynamic datosLinea)
        {
            try
            {
                foreach (var item in datosLinea)
                {
                    int numeroLinea = (int)item.numeroLinea.Value;
                    string codProducto = item.codProducto.Value;
                    string idPPR = item.idPPR.Value;
                    bool inhabilitarCalculo = (bool)item.inhabilitarCalculo.Value;

                    if (!inhabilitarCalculo)
                    {
                        double? oeePre = DAO_Materiales.ObtenerOeeMedioPreactor(numeroLinea, codProducto);
                        if (oeePre > 0)
                        {
                            ParametrosBread.ModificarParametrosRegistro(idPPR, -1, -1, -1, null, null, oeePre.Value, null);
                        }
                    }
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.calcularOEEPreactor", "Modificados oee preactor varios parametros", HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.calcularOEEPreactor", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/calcularTiempoCambioPreactor")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_3_GestionDeTiemposDeCambio)]
        public bool calcularTiempoCambioPreactor(dynamic datosLinea)
        {
            try
            {
                foreach (var item in datosLinea)
                {
                    int numeroLinea = (int)item.numeroLinea.Value;
                    string idProductoEntrante = item.idProductoEntrante.Value.ToString();
                    string idProductoSaliente = item.idProductoSaliente.Value.ToString();
                    long id = (long)item.id.Value;
                    bool inhabilitarCalculo = (bool)item.inhabilitarCalculo.Value;

                    if (!inhabilitarCalculo)
                    {
                        int? tiempoPre = DAO_Materiales.ObtenerTiempoCambioPreactor(numeroLinea, idProductoEntrante, idProductoSaliente);
                        if (tiempoPre > 0)
                        {
                            TiemposBread.ModificarTiempoCambio(id, -1, -1, tiempoPre.Value, -1, -1, null);
                        }
                    }
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.calcularOEEPreactor", "Modificados tiempo cambio preactor varios parametros", HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.calcularTiempoCambioPreactor", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/calcularTiempoArranquePreactor")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_12_GestionDeTiemposDeArranque)]
        public bool calcularTiempoArranquePreactor(dynamic datosLinea)
        {
            try
            {
                foreach (var item in datosLinea)
                {
                    int numeroLinea = (int)item.numeroLinea.Value;
                    string idProductoEntrante = item.idProductoEntrante.Value.ToString();
                    int TipoArranque = int.Parse(item.tipoArranque.Value);
                    long id = (long)item.id.Value;
                    bool inhabilitarCalculo = (bool)item.inhabilitarCalculo.Value;

                    if (!inhabilitarCalculo)
                    {
                        int? tiempoPre = DAO_Materiales.ObtenerTiempoArranquePreactor(numeroLinea, idProductoEntrante, TipoArranque);
                        if (tiempoPre > 0)
                        {
                            TiemposBread.ModificarTiempoArranque(id, -1, -1, tiempoPre.Value, -1, -1, null);
                        }
                    }
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.calcularOEEPreactor", "Modificados tiempo arranque preactor varios parametros", HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.calcularTiempoArranquePreactor", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/calcularOEEWOMedio")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_1_GestionDeParametrosDeTren)]
        public bool calcularOEEWOMedio(dynamic datosLinea)
        {
            try
            {
                foreach (var item in datosLinea)
                {
                    int numeroLinea = (int)item.numeroLinea.Value;
                    string codProducto = item.codProducto.Value;
                    string idPPR = item.idPPR.Value;

                    double OEEWOMedio = DAO_Materiales.ObtenerOEEWOMedio(numeroLinea, codProducto);
                    ParametrosBread.ModificarParametrosRegistro(idPPR, -1, -1, -1, null, OEEWOMedio, -1, null);
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.calcularOEEWOMedio", "Modificados OEE WO Medio", HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.calcularOEEWOMedio", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/calcularTiempoCambioMedio")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_3_GestionDeTiemposDeCambio)]
        public bool calcularTiempoCambioMedio(dynamic datosLinea)
        {
            try
            {
                foreach (var item in datosLinea)
                {
                    int numeroLinea = (int)item.numeroLinea.Value;
                    string idProductoEntrante = item.idProductoEntrante.Value.ToString();
                    string idProductoSaliente = item.idProductoSaliente.Value.ToString();
                    long id = (long)item.id.Value;

                    List<int> tiemposMedios = DAO_Materiales.ObtenerTiempoCambioMedio(numeroLinea, idProductoEntrante, idProductoSaliente);
                    TiemposBread.ModificarTiempoCambio(id, -1, -1, -1, tiemposMedios[0], tiemposMedios[1], null);
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.calcularTiempoCambioMedio", "Modificados Tiempo Cambio Medio", HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.calcularTiempoCambioMedio", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/calcularTiempoArranqueMedio")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_12_GestionDeTiemposDeArranque)]
        public bool calcularTiempoArranqueMedio(dynamic datosLinea)
        {
            try
            {
                foreach (var item in datosLinea)
                {
                    int numeroLinea = (int)item.numeroLinea.Value;
                    string idProductoEntrante = item.idProductoEntrante.Value.ToString();
                    int tipoArranque = Convert.ToInt32(item.tipoArranque.Value.ToString());
                    long id = (long)item.id.Value;

                    List<int> tiemposMedios = DAO_Materiales.ObtenerTiempoArranqueMedio(numeroLinea, idProductoEntrante, tipoArranque);
                    TiemposBread.ModificarTiempoArranque(id, -1, -1, -1, tiemposMedios[0], tiemposMedios[1], null);
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "LineasController.calcularTiempoArranqueMedio", "Modificados Tiempo Arranque Medio", HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "LineasController.calcularTiempoArranqueMedio", "WEB-ENVASADO", "Sistema");
                return false;
            }
        }

        [Route("api/obtenerMaquinasLineas/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_7_VisualizacionSeguimientoLineaPortal)]
        public List<Maquina> obtenerMaquinasLineas(dynamic datos)
        {
            try
            {
                int numLinea = (int)datos.linea.Value;
                Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea);
                linea.zonas.ForEach(z =>
                {
                    z.revisarCambiosWOMaquinas();
                });

                List<Maquina> maquinas = linea.obtenerMaquinas;
                DAO_Maquinas daoMaquinas = new DAO_Maquinas();

                //foreach (Maquina maquina in maquinas)
                //{
                //    maquina.CantidadWO = daoMaquinas.ObtenerContadorProduccionWO(maquina.id);
                //}

                return maquinas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LineasController.crearEditarParámetroLínea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.obtenerMaquinasLineas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_MODIFICAR_TIEMPO_ARRANQUE"));
            }
        }

        [Route("api/obtenerProductoSaliente/")]
        [HttpPost]
        public List<Producto> ObtenerProductoSaliente(dynamic datos)
        {
            try
            {
                DAO_Linea daoLinea = new DAO_Linea();
                List<Producto> listaProductosLinea = daoLinea.ObtenerProductosSalientesLinea(datos);

                return listaProductosLinea;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LineasController.obtenerProductosSalientesLinea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.obtenerProductosSalientesLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PRODUCTOS_DE_UN"));
            }
        }

        [Route("api/obtenerTiemposObjetivosPreactor/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_32_GestionOrdenesArranque, Funciones.ENV_PROD_EXE_44_GestionOrdenesCambio)]
        public List<string> ObtenerTiemposObjetivosPreactor(dynamic datos)
        {
            try
            {
                DAO_Linea daoLinea = new DAO_Linea();
                return daoLinea.ObtenerTiemposObjetivosPreactor(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LineasController.obtenerTiemposObjetivos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.obtenerTiemposObjetivos", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_TIEMPOS"));
            }
        }

        [Route("api/obtenerLlenadoras/{idLinea}")]
        [HttpGet]
        public List<Maquina> obtenerLlenadoras(int idLinea)
        {
            try
            {
                if (idLinea != 0)
                {
                    Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea == idLinea);
                    return linea.obtenerMaquinas.Where(m => m.tipo.nombre.ToUpper().Equals("LLENADORA")).ToList();
                }

                return new List<Maquina>();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "LineasController.crearEditarParámetroLínea", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.obtenerLlenadoras", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_MODIFICAR_TIEMPO_ARRANQUE"));
            }
        }

        private static bool ShouldLogIncongruencia(string clave, TimeSpan intervaloMin)
        {
            var ahora = DateTime.UtcNow;
            var ultimo = _ultimoLogIncongruencia.GetOrAdd(clave, DateTime.MinValue);

            if ((ahora - ultimo) >= intervaloMin)
            {
                _ultimoLogIncongruencia[clave] = ahora;
                return true;
            }
            return false;
        }
    }
}
