using BreadMES.Envasado;
using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using MSM.Security;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{

    [Authorize]
    public class ParosPerdidasController : ApiController
    {
        private readonly IDAO_ParosPerdidas _iDAOParosPerdidas;
        private readonly IDAO_AccionesCorrectivasTurno _iDAOAccionesCorrectivas;

        public ParosPerdidasController(IDAO_ParosPerdidas iDAOParosPerdidas, IDAO_AccionesCorrectivasTurno iDAOAccionesCorrectivas)
        {
            _iDAOParosPerdidas = iDAOParosPerdidas;
            _iDAOAccionesCorrectivas = iDAOAccionesCorrectivas;
        }

        [Route("api/paros/{idLinea}/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_13_VisualizacionParosPerdidasTerminal)]
        public IEnumerable<ParoPerdida> GetParos(int idLinea, int idTurno)
        {
            try
            {
                List<ParoPerdida> listaParos = new List<ParoPerdida>();
                DAO_ParosPerdidas daoParoPerdidas = new DAO_ParosPerdidas();
                listaParos = daoParoPerdidas.ObtenerParos(idLinea, idTurno);

                return listaParos;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.GetParos", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_PAROS"));
            }
        }

        [Route("api/perdidas/{idLinea}/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_13_VisualizacionParosPerdidasTerminal)]
        public IEnumerable<ParoPerdida> GetPerdidas(int idLinea, int idTurno)
        {
            try
            {
                List<ParoPerdida> listaParos = new List<ParoPerdida>();
                DAO_ParosPerdidas daoParoPerdidas = new DAO_ParosPerdidas();
                listaParos = daoParoPerdidas.ObtenerPerdidas(idLinea, idTurno);

                return listaParos;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.GetPerdidas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PERDIDAS"));
            }
        }

        [Route("api/parosPerdidas")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_20_VisualizacionParosPerdidasLlenadora)]
        public IEnumerable<ParoPerdida> GetParosPerdidas([FromUri] int numLinea,[FromUri] int idTurno)
        {
            try
            {
                List<ParoPerdida> listaParos = new List<ParoPerdida>();
                DAO_ParosPerdidas daoParoPerdidas = new DAO_ParosPerdidas();
                listaParos = daoParoPerdidas.ObtenerParos(numLinea, idTurno);
                listaParos.AddRange(daoParoPerdidas.ObtenerPerdidas(numLinea, idTurno));

                return listaParos;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.GetParosPerdidas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS_PERDIDAS_TURNO"));
            }
        }

        [Route("api/obtenerParosPerdidasPPAMaquinas/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_30_VisualizacionParosMaquinas)]
        public IEnumerable obtenerParosPerdidasPPAMaquinas(dynamic datos)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                DateTime fInicio = ((DateTime)datos.fInicio.Value).ToLocalTime();
                DateTime fFin = ((DateTime)datos.fFin.Value).ToLocalTime();
                int idLinea = datos.linea.Value != null ?(int) datos.linea.Value : 0;
                List<ParoPerdidaPPAMaquinas> listaParos = new List<ParoPerdidaPPAMaquinas>();

                DAO_ParosPerdidas daoParoPerdidas = new DAO_ParosPerdidas();
                DateTime refDate = new DateTime(1970, 1, 1);

                fInicio = DateTime.Parse(fInicio.ToString("yyyy-MM-dd") + "  00:00");
                fFin = DateTime.Parse(fFin.ToString("yyyy-MM-dd") + " 23:59");

                if (idLinea != 0) {
                    listaParos = daoParoPerdidas.ObtenerParosPerdidasPPAMaquinas(fInicio.ToUniversalTime(), fFin.ToUniversalTime(), idLinea);
                    
                    return listaParos.OrderByDescending(p => p.Inicio).Select(p => new
                    {
                        NumLinea = p.NumLinea,
                        Linea = p.Linea,
                        CodMaquina = p.CodMaquina,
                        IdMaquina = p.IdMaquina,
                        DescripcionMaquina = p.DescripcionMaquina,
                        ParoMayorMenor = p.ParoMayorMenor,
                        Inicio = p.Inicio.AddMilliseconds(-p.Inicio.Millisecond),
                        Fin = p.Fin.AddMilliseconds(-p.Fin.Millisecond),
                        Duracion = TimeSpan.FromSeconds(p.Duracion).ToString(@"hh\:mm\:ss"),
                        InicioTurno = p.InicioTurno,
                        FinTurno = p.FinTurno,
                        IdTurno = p.IdTurno,
                        IdTipoTurno = p.IdTipoTurno,
                        NumLineaDescripcion = p.NumLineaDescripcion
                    });
                }

                return listaParos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ParosPerdidasController.obtenerParosPerdidasPPAMaquinas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.obtenerParosPerdidasPPAMaquinas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PERDIDAS"));
            }
        }

        [Route("api/paros/reasonTree")]
        [Route("api/perdidas/reasonTree")]
        [HttpGet]
        [AllowAnonymous]
        public ReasonTree GetReasonTree()
        {
            try
            {
                return RealTime.PlantaRT.reasonTree;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ParosPerdidasController.GetReasonTree", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.GetReasonTree", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ÁRGOL"));
            }
        }

        [Route("api/JustificaParoMayor")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_14_GestionParosPerdidasTerminal)]
        public object[] JustificaParoMayor(ParoPerdida paroPerdida)
        {
            return JustificarParoPerdida(paroPerdida);
        }

        [Route("api/JustificaPerdida")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_14_GestionParosPerdidasTerminal)]
        public object[] JustificaPerdida(ParoPerdida paroPerdida)
        {
            return JustificarParoPerdida(paroPerdida);
        }

        public static void JustificarParosMayoresCierreOT(List<ParoPerdida> paros)
        {
            foreach(var p in paros)
            {
                try
                {

                    COB_MSM_PAROS_PERDIDAS cobParoPerdida = ParosPerdidasBread.ObtenerPorId(p.id);

                    // Damos valores a los campos que no estén ya rellenos
                    // Si ya tiene motivo dejamos el motivo y causa que tenga el paro
                    if (cobParoPerdida.MOTIVO != 0)
                    {
                        p.motivoId = cobParoPerdida.MOTIVO;
                        p.causaId = cobParoPerdida.CAUSA;
                    }

                    if (!String.IsNullOrEmpty(cobParoPerdida.MAQUINA_RESPONSABLE))
                    {
                        p.idMaquinaResponsable = cobParoPerdida.MAQUINA_RESPONSABLE;
                    }

                    if (!String.IsNullOrEmpty(cobParoPerdida.EQUIPO_CONSTRUCTIVO)) {
                        p.idEquipoConstructivo = cobParoPerdida.EQUIPO_CONSTRUCTIVO;
                    }

                    p.justificacionMultiple = true;

                    JustificarParoPerdida(p);

                }
                catch(Exception)
                {
                    // Ya se loguea el error en el método JustificarParoPerdida, no cancelamos la ejecución para que se intente justificar el siguiente paro
                }
            }
        }

        private static object[] JustificarParoPerdida(ParoPerdida paroPerdida)
        {
            COB_MSM_PAROS_PERDIDAS cobParoPerdida = ParosPerdidasBread.ObtenerPorId(paroPerdida.id);
            bool justificado = cobParoPerdida.JUSTIFICADO == 0;

            cobParoPerdida.MOTIVO = paroPerdida.motivoId;
            cobParoPerdida.CAUSA = paroPerdida.causaId;
            cobParoPerdida.MAQUINA = paroPerdida.maquina;
            cobParoPerdida.MAQUINA_RESPONSABLE = paroPerdida.idMaquinaResponsable;
            cobParoPerdida.EQUIPO_CONSTRUCTIVO = paroPerdida.idEquipoConstructivo;
            cobParoPerdida.DESCRIPCION = paroPerdida.descripcion == IdiomaController.GetResourceName("SELECCIONE") ? string.Empty : paroPerdida.descripcion;
            cobParoPerdida.OBSERVACIONES = paroPerdida.observaciones;
            cobParoPerdida.JUSTIFICADO = 1;
            cobParoPerdida.FECHA_ULTIMA_ACTUALIZACION = DateTime.UtcNow;

            try
            {
                DAO_ParosPerdidas daoParosPerdidas = new DAO_ParosPerdidas();

                if (paroPerdida.justificacionMultiple)
                {
                    if (paroPerdida.idMaquinaResponsable != string.Empty)
                    {
                        daoParosPerdidas.ModificarNumeroJustificacionesMaquina(paroPerdida.linea, paroPerdida.idMaquinaResponsable);
                    }

                    if (paroPerdida.idEquipoConstructivo != string.Empty)
                    {
                        daoParosPerdidas.ModificarNumeroJustificacionesEquipo(paroPerdida.idEquipoConstructivo);
                    }

                    if (paroPerdida.idAveria != 0) 
                    { 
                        daoParosPerdidas.ModificarNumeroJustificacionesAveria(paroPerdida.idAveria);
                    }
                }
                else 
                {
                    if (paroPerdida.idMaquinaResponsable != string.Empty && paroPerdida.aplicarJustificacionMaquina)
                    {
                        daoParosPerdidas.ModificarNumeroJustificacionesMaquina(paroPerdida.linea, paroPerdida.idMaquinaResponsable);
                    }

                    if (paroPerdida.idEquipoConstructivo != string.Empty && paroPerdida.aplicarJustificacionEquipo)
                    {
                        daoParosPerdidas.ModificarNumeroJustificacionesEquipo(paroPerdida.idEquipoConstructivo);
                    }

                    if (paroPerdida.idAveria != 0 && paroPerdida.aplicarJustificacionAveria)
                    {
                        daoParosPerdidas.ModificarNumeroJustificacionesAveria(paroPerdida.idAveria);
                    }
                }

                ParosPerdidasBread.Actualizar(cobParoPerdida);
                RegistrarLogParoPerdida(paroPerdida.id, 1, false, justificado);

                return new object[] { true, "" };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.JustificarParoPerdida", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/AnularParoTerminal")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_14_GestionParosPerdidasTerminal)]
        public object[] AnularJustificacionParoTerminal(ParoPerdida paroPerdida)
        {
            return AnularJustificacionParoPerdida(paroPerdida, 1);
        }

        [Route("api/AnularPerdidaTerminal")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_14_GestionParosPerdidasTerminal)]
        public object[] AnularJustificacionPerdidaTerminal(ParoPerdida paroPerdida)
        {
            return AnularJustificacionParoPerdida(paroPerdida, 1);
        }

        [Route("api/AnularParoPerdidaPortal")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_40_GestionParosPerdidasLlenadora)]
        public object[] AnularJustificacionParoPerdidaPortal(ParoPerdida paroPerdida)
        {
            return AnularJustificacionParoPerdida(paroPerdida, 0);
        }

        private static object[] AnularJustificacionParoPerdida(ParoPerdida paroPerdida, int aplicativo)
        {
            COB_MSM_PAROS_PERDIDAS cobParoPerdida = ParosPerdidasBread.ObtenerPorId(paroPerdida.id);

            cobParoPerdida.MAQUINA = paroPerdida.maquina;
            cobParoPerdida.MOTIVO = 0;
            cobParoPerdida.CAUSA = 0;
            cobParoPerdida.JUSTIFICADO = 0;
            cobParoPerdida.MAQUINA_RESPONSABLE = string.Empty;
            cobParoPerdida.EQUIPO_CONSTRUCTIVO = string.Empty;
            cobParoPerdida.DESCRIPCION = string.Empty;
            cobParoPerdida.OBSERVACIONES = string.Empty;
            cobParoPerdida.FECHA_ULTIMA_ACTUALIZACION = DateTime.UtcNow;

            try
            {
                ParosPerdidasBread.Actualizar(cobParoPerdida);

                ParosPerdidas parosPerdidas = paroPerdida.id != 0 ? DAO_ParosPerdidas.ObtenerParoPerdidasLlenadoraPorId(paroPerdida.id) : new ParosPerdidas();
                var tipoParoPerdida = string.IsNullOrEmpty(parosPerdidas.IdTipoTurno) ? string.Empty : IdiomaController.GetResourceName(string.Format("TURNO{0}", parosPerdidas.IdTipoTurno));
                var mensajeAnulacion = aplicativo == 0 ? IdiomaController.GetResourceName("JUSTIFICACION_ANULADA_WEB") : IdiomaController.GetResourceName("JUSTIFICACION_ANULADA_TERMINAL");

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ParosPerdidasController.AnularJustificacionParoPerdida",
                    string.Format(mensajeAnulacion + " =>  " + IdiomaController.GetResourceName("LINEA") + ": {0}; " +
                        IdiomaController.GetResourceName("FECHA_INICIO") + ": {1}; " +
                        IdiomaController.GetResourceName("TURNO") + ": {2}; " +
                        IdiomaController.GetResourceName("TIPO") + ": {3}; " +
                        IdiomaController.GetResourceName("DURACION") + ": {4}; " +
                        IdiomaController.GetResourceName("LLENADORA") + ": {5}",
                        parosPerdidas.IdLinea,
                        parosPerdidas.InicioLocal,
                        tipoParoPerdida,
                        parosPerdidas.TipoParoPerdida,
                        TimeSpan.FromSeconds(parosPerdidas.Duracion).ToString(@"hh\:mm\:ss"),
                        parosPerdidas.EquipoDescripcion), HttpContext.Current.User.Identity.Name);

                return new object[] { true, "" };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.AnularJustificacionParoPerdida", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        private static void RegistrarLogParoPerdida(long IdparoPerdida, int aplicativo, bool eliminar, bool justificado)
        {
            try
            {
                ParosPerdidas paroPerdida = IdparoPerdida != 0 ? DAO_ParosPerdidas.ObtenerParoPerdidasLlenadoraPorId(IdparoPerdida) : new ParosPerdidas();
                string tipoParoPerdida = string.IsNullOrEmpty(paroPerdida.IdTipoTurno) ? string.Empty : IdiomaController.GetResourceName(string.Format("TURNO{0}", paroPerdida.IdTipoTurno));
                var mensajeJustificadoEditado = "";
                
                if (!eliminar)
                {
                    mensajeJustificadoEditado = justificado ? aplicativo == 0 ? IdiomaController.GetResourceName("PARO_JUSTIFICADO_WEB") :
                        IdiomaController.GetResourceName("PARO_JUSTIFICADO_TERMINAL") : aplicativo == 0 ?
                        IdiomaController.GetResourceName("PARO_EDITADO_WEB") : IdiomaController.GetResourceName("PARO_EDITADO_TERMINAL");
                }
                else
                {
                    mensajeJustificadoEditado = IdiomaController.GetResourceName("PARO_ELIMINADO_WEB");
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ParosPerdidasController.RegistrarLogParoPerdida",
                    string.Format("{0} " + mensajeJustificadoEditado + " =>  " + IdiomaController.GetResourceName("LINEA") + ": {1}; " +
                        IdiomaController.GetResourceName("FECHA_INICIO") + ": {2}; " +
                        IdiomaController.GetResourceName("TURNO") + ": {3}; " +
                        IdiomaController.GetResourceName("TIPO") + ": {4}; " +
                        IdiomaController.GetResourceName("DURACION") + ": {5}; " +
                        IdiomaController.GetResourceName("LLENADORA") + ": {6}; " +
                        IdiomaController.GetResourceName("MAQUINA_RESPONSABLE") + ": {7}; " +
                        IdiomaController.GetResourceName("EQUIPO_CONSTRUCTIVO") + ": {8}; " +
                        IdiomaController.GetResourceName("MOTIVO") + ": {9}; " +
                        IdiomaController.GetResourceName("CAUSA") + ": {10}",
                        paroPerdida.TipoParoPerdida,
                        paroPerdida.IdLinea,
                        paroPerdida.InicioLocal,
                        tipoParoPerdida,
                        paroPerdida.TipoParoPerdida,
                        TimeSpan.FromSeconds(paroPerdida.Duracion).ToString(@"hh\:mm\:ss"),
                        paroPerdida.EquipoDescripcion,
                        paroPerdida.MaquinaCausaNombre,
                        paroPerdida.EquipoConstructivoNombre,
                        paroPerdida.MotivoNombre,
                        paroPerdida.CausaNombre), HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ParosPerdidasController.RegistrarLogParoPerdida", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.RegistrarLogParoPerdida", "WEB-ENVASADO", "Sistema");
            }
        }

        [Route("api/FraccionarParo/{idParo}/{duracion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_14_GestionParosPerdidasTerminal)]
        public object[] FraccionarParo(int idParo, int duracion)
        {
            try
            {
                COB_MSM_PAROS_PERDIDAS paroMayorOriginal = ParosPerdidasBread.ObtenerPorId(idParo);
                COB_MSM_PAROS_PERDIDAS paroMayorNuevo = new COB_MSM_PAROS_PERDIDAS();

                //Copiamos todos los campos que se deben mantener igual
                paroMayorNuevo.CAUSA = paroMayorOriginal.CAUSA;
                paroMayorNuevo.DESCRIPCION = paroMayorOriginal.DESCRIPCION;
                paroMayorNuevo.DURACION_BAJA_VELOCIDAD = paroMayorOriginal.DURACION_BAJA_VELOCIDAD;
                paroMayorNuevo.DURACION_PAROS_MENORES = paroMayorOriginal.DURACION_PAROS_MENORES;
                paroMayorNuevo.EQUIPO_CONSTRUCTIVO = paroMayorOriginal.EQUIPO_CONSTRUCTIVO;
                paroMayorNuevo.FK_PAROS_ID = paroMayorOriginal.FK_PAROS_ID;
                paroMayorNuevo.JUSTIFICADO = paroMayorOriginal.JUSTIFICADO;
                paroMayorNuevo.MAQUINA = paroMayorOriginal.MAQUINA;
                paroMayorNuevo.MAQUINA_RESPONSABLE = paroMayorOriginal.MAQUINA_RESPONSABLE;
                paroMayorNuevo.MOTIVO = paroMayorOriginal.MOTIVO;
                paroMayorNuevo.NUMERO_PAROS_MENORES = paroMayorOriginal.NUMERO_PAROS_MENORES;
                paroMayorNuevo.OBSERVACIONES = paroMayorOriginal.OBSERVACIONES;
                paroMayorNuevo.SHC_WORK_SCHED_DAY_PK = paroMayorOriginal.SHC_WORK_SCHED_DAY_PK;
                paroMayorNuevo.FECHA_ULTIMA_ACTUALIZACION = DateTime.UtcNow;

                //duracion, inicio Y fin del nuevo paro (AL FINAL DEL TIEMPO DE FRACCION)
                paroMayorNuevo.DURACION = paroMayorOriginal.DURACION - duracion;
                paroMayorNuevo.INICIO = paroMayorOriginal.INICIO.AddSeconds(duracion);
                paroMayorNuevo.FIN = paroMayorOriginal.FIN;

                //Actualizamos la duracion y fin del original (TIEMPO DE FRACCION)
                paroMayorOriginal.DURACION = duracion;
                paroMayorOriginal.FIN = paroMayorOriginal.INICIO.AddSeconds(duracion);
                paroMayorOriginal.FECHA_ULTIMA_ACTUALIZACION = DateTime.UtcNow;

                //actualizamos el original e insertamos el nuevo
                ParosPerdidasBread.Actualizar(paroMayorOriginal);
                ParosPerdidasBread.Insertar(paroMayorNuevo);

                //ParosPerdidasBread.Actualizar(paroMayor);
                ParosPerdidas paroPerdida = idParo != 0 ? DAO_ParosPerdidas.ObtenerParoPerdidasLlenadoraPorId(idParo) : new ParosPerdidas();
                string tipoTurno = string.IsNullOrEmpty(paroPerdida.IdTipoTurno) ? string.Empty : IdiomaController.GetResourceName(string.Format("TURNO{0}", paroPerdida.IdTipoTurno));

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ParosPerdidasController.FraccionarParo",
                        string.Format(IdiomaController.GetResourceName("PARO_FRACCIONADO_TERMINAL") + " =>  " + IdiomaController.GetResourceName("LINEA") + ": {0}; " +
                            IdiomaController.GetResourceName("FECHA_INICIO") + ": {1}; " +
                            IdiomaController.GetResourceName("TURNO") + ": {2}; " +
                            IdiomaController.GetResourceName("DURACION") + ": {3}; " +
                            IdiomaController.GetResourceName("LLENADORA") + ": {4}; " +
                            IdiomaController.GetResourceName("MAQUINA_RESPONSABLE") + ": {5}; " +
                            IdiomaController.GetResourceName("EQUIPO_CONSTRUCTIVO") + ": {6}; " +
                            IdiomaController.GetResourceName("MOTIVO") + ": {7}; " +
                            IdiomaController.GetResourceName("CAUSA") + ": {8}",
                            paroPerdida.IdLinea,
                            paroPerdida.InicioLocal,
                            tipoTurno,
                            TimeSpan.FromSeconds(duracion).ToString(@"hh\:mm\:ss"),
                            paroPerdida.EquipoDescripcion,
                            paroPerdida.MaquinaCausaNombre,
                            paroPerdida.EquipoConstructivoNombre,
                            paroPerdida.MotivoNombre,
                            paroPerdida.CausaNombre), HttpContext.Current.User.Identity.Name);

                return new object[] { true, "" };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.FraccionarParo", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_JUSTIFICANDO_PARO") + ex.Message);
            }
        }

        [Route("api/MaquinasLinea/{linea}/")]
        [HttpGet]
        public List<MaquinasEnvasado> ObtenerMaquinasLinea(string linea)
        {
            try
            {
                DAO_Maquinas daoMaquinas = new DAO_Maquinas();
                var maquinas = daoMaquinas.ObtenerMaquinasLinea(linea);

                foreach (var maquina in maquinas)
                {
                    maquina.Descripcion = char.ToUpper(maquina.Descripcion[0]) + maquina.Descripcion.Substring(1).ToLower();
                }

                return maquinas;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.ObtenerMaquinasLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_MAQUINAS"));
            }
        }

        [Route("api/EquiposConstructivosMaquina/{codigoMaquina}/")]
        [HttpGet]
        public List<EquiposConstructivosEnvasado> ObtenerEquiposConstructivosMaquina(string codigoMaquina)
        {
            try
            {
                DAO_Maquinas daoMaquinas = new DAO_Maquinas();
                var equipos = daoMaquinas.ObtenerEquiposConstructivosMaquina(codigoMaquina);

                foreach (var equipo in equipos)
                {
                    equipo.Descripcion = char.ToUpper(equipo.Descripcion[0]) + equipo.Descripcion.Substring(1).ToLower();
                }

                return equipos;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.ObtenerEquiposConstructivosMaquina", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EQUIPOS_CONSTRUCTIVOS"));
            }
        }

        [Route("api/AveriasEquipoConstructivo/{codigoEquipo}/")]
        [HttpGet]
        public List<DescripcionAverias> ObtenerAveriasEquipoConstructivo(string codigoEquipo)
        {
            try
            {
                DAO_Maquinas daoMaquinas = new DAO_Maquinas();
                var averias = daoMaquinas.ObtenerAveriasEquipoConstructivo(codigoEquipo);

                foreach (var averia in averias)
                {
                    averia.Descripcion = char.ToUpper(averia.Descripcion[0]) + averia.Descripcion.Substring(1).ToLower();
                }

                return averias;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.ObtenerAveriasEquipoConstructivo", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_POSIBLES"));
            }
        }

        [Route("api/obtenerParosPerdidasTurno/{idTurno}/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno)]
        public IEnumerable GetParosPerdidasTurno(int idTurno)
        {
            try
            {
                IEnumerable lstParosPerdidas = DAO_ParosPerdidas.ObtenerParosPerdidasTurno(idTurno);

                return lstParosPerdidas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ParosPerdidasController.GetParosPerdidasTurno", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.GetParosPerdidasTurno", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS_PERDIDAS_TURNO"));
            }
        }

        [Route("api/obtenerParosPerdidasTotalesLLenadoraTurno/{idTurno}/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno)]
        public IEnumerable GetParosPerdidasTotalesLLenadoraTurno(int idTurno)
        {
            try
            {
                IEnumerable lstParosPerdidas = DAO_ParosPerdidas.ObtenerParosPerdidasTotalesLLenadoraTurno(idTurno);

                return lstParosPerdidas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ParosPerdidasController.GetParosPerdidasTotalesLLenadoraTurno", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.GetParosPerdidasTotalesLLenadoraTurno", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS_PERDIDAS_TOTALES"));
            }
        }

        [Route("api/GetParosPerdidasLlenadoraInterval/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_20_VisualizacionParosPerdidasLlenadora)]
        public IEnumerable GetParosPerdidasLLenadoraInterval(dynamic parameters)
        {
            try
            {
                //Desde Javascript vienen las fechas en UTC
                DateTime fInicio = ((DateTime)parameters["fInicio"]).ToLocalTime();
                DateTime fFin = ((DateTime)parameters["fFin"]).ToLocalTime();
                bool filtros = (bool)parameters["filtros"];
                int idLinea = (int)parameters["linea"];

                return DAO_ParosPerdidas.ObtenerParosPerdidasLlenadora(fInicio, fFin, idLinea, filtros);
            }
            catch (Exception ex)
            {
                string mensajeError = ex.InnerException == null ? ex.Message : ex.InnerException.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, mensajeError + " -> " + ex.StackTrace, "ParosPerdidasController.GetParosPerdidasLLenadoraInterval", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS_PERDIDAS_LLENADORA"));
            }
        }

        [Route("api/GetParosPerdidasLLenadoraLinea")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_23_GestionSintesisDeParos)]
        public IEnumerable GetParosPerdidasLLenadoraLinea(dynamic datos)
        {
            try
            {
                return DAO_ParosPerdidas.ObtenerParosPerdidasLlenadora(datos);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ParosPerdidasController.GetParosPerdidasLLenadora", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.GetParosPerdidasLLenadoraLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS_PERDIDAS_LLENADORA"));
            }
        }

        [Route("api/eliminarParoPerdida/{idParo}/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_40_GestionParosPerdidasLlenadora)]
        public bool EliminarParoPerdida(int idParo)
        {
            try
            {
                DAO_ParosPerdidas pp = new DAO_ParosPerdidas();
                RegistrarLogParoPerdida(idParo, 0, true, false);
                ReturnValue ret = pp.EliminarParoPerdida(idParo);

                if (!ret.succeeded)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "ParosPerdidasController.EliminarParoPerdida", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                }
                else 
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ParosPerdidasController.EliminarParoPerdida",
                        IdiomaController.GetResourceName("SE_HA_ELIMINADO_PARO") + " " + idParo, HttpContext.Current.User.Identity.Name);
                }

                return ret.succeeded;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ParosPerdidasController.GetParosPerdidasLLenadora", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.eliminarParoPerdida", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS_PERDIDAS_LLENADORA"));
            }
        }

        [Route("api/ParosPerdidas/{idParo}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_20_VisualizacionParosPerdidasLlenadora)]
        public IHttpActionResult ObtenerParoPerdidaPorId(int idParo)
        {
            try
            {
                var result = DAO_ParosPerdidas.ObtenerParoPerdidasLlenadoraPorId(idParo);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasTurnoController.ObtenerParoPerdidaPorId", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_PAROS"));
            }
        }

        [Route("api/obtenerMinimoParoMayor/{idLinea}/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_13_VisualizacionParosPerdidasTerminal)]
        public int ObtenerMinimoParoMayor(int idLinea)
        {
            try
            {
                DAO_ParosPerdidas pp = new DAO_ParosPerdidas();

                return pp.ObtenerMinimoParoMayor(idLinea);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ParosPerdidasController.obtenerMinimoParoMayor", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.obtenerMinimoParoMayor", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_TIEMPO"));
            }
        }

        [Route("api/editarParo")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_40_GestionParosPerdidasLlenadora)]
        public ReturnValue EditarParo(dynamic datos)
        {
            try
            {
                COB_MSM_PAROS_PERDIDAS paroMayor = ParosPerdidasBread.ObtenerPorId(int.Parse(datos.Id.ToString()));
                bool justificado = paroMayor.JUSTIFICADO == 0;

                DAO_ParosPerdidas pp = new DAO_ParosPerdidas();
                ReturnValue ret = new ReturnValue();
                ret = pp.EditarParo(datos);

                int id = int.Parse(datos.Id.ToString());
                RegistrarLogParoPerdida(id, 0, false, justificado);

                //DAJ: Al editar un paro o perdida puede que haya que editar también la accion correctiva asociada
                try
                {
                    _iDAOAccionesCorrectivas.EditarAccionCorrectivaTurnoPorParo(id);
                }
                catch (Exception ex2)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_EDITAR_ACCIONES_CORRECTIVAS") + " - " + ex2.Message, "ParosPerdidasController.editarParo", "WEB-WO", HttpContext.Current.User.Identity.Name);
                }

                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_EDITANDO_UN_PARO") + " - " + ex.Message, "ParosPerdidasController.editarParo", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_UN_PARO"));
            }
        }

        [Route("api/crearParo")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_40_GestionParosPerdidasLlenadora)]
        public ReturnValue CrearParo(dynamic datos)
        {
            try
            {
                DAO_ParosPerdidas pp = new DAO_ParosPerdidas();
                ReturnValue ret = new ReturnValue();
                ret = pp.CrearParo(datos, out double duracion);

                if (!ret.succeeded)
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "ParosPerdidasController.crearParo", "WEB-ENVASADO", "Sistema");
                else 
                {
                    string linea = datos.numLinea.ToString();
                    string maquinaDescripcion = datos.maquina.ToString() != string.Empty ? datos.maquinaDescripcion.ToString() : string.Empty;
                    string equipoConstructivoDescripcion = datos.equipo.ToString() != string.Empty ? datos.equipoConstructivoDescripcion.ToString() : string.Empty;
                    string motivoDescripcion = datos.motivo.ToString() != string.Empty ? datos.motivoDescripcion.ToString() : string.Empty;
                    string causaDescripcion = datos.causa.ToString() != string.Empty ? datos.causaDescripcion.ToString() : string.Empty;
                    
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ParosPerdidasController.RegistrarLogParoPerdida",
                        string.Format(IdiomaController.GetResourceName("PARO_CREADO_WEB") + " =>  " + IdiomaController.GetResourceName("LINEA") + ": {0}; " +
                            IdiomaController.GetResourceName("FECHA_INICIO") + ": {1}; " +
                            IdiomaController.GetResourceName("TURNO") + ": {2}; " +
                            IdiomaController.GetResourceName("DURACION") + ": {3}; " +
                            IdiomaController.GetResourceName("LLENADORA") + ": {4}; " +
                            IdiomaController.GetResourceName("MAQUINA_RESPONSABLE") + ": {5}; " +
                            IdiomaController.GetResourceName("EQUIPO_CONSTRUCTIVO") + ": {6}; " +
                            IdiomaController.GetResourceName("MOTIVO") + ": {7}; " +
                            IdiomaController.GetResourceName("CAUSA") + ": {8}",
                            linea,
                            datos.fecha.ToString(),
                            datos.turno,
                            TimeSpan.FromSeconds(duracion).ToString(@"hh\:mm\:ss"),
                            datos.llenadoraDescripcion.ToString(),
                            maquinaDescripcion,
                            equipoConstructivoDescripcion,
                            motivoDescripcion,
                            causaDescripcion), HttpContext.Current.User.Identity.Name);
                }

                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.crearParo", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_UN_PARO"));
            }
        }

        [Route("api/checkeaParo")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_40_GestionParosPerdidasLlenadora)]
        public ReturnValue CheckeaParo(dynamic datos)
        {
            try
            {
                ReturnValue ret = new ReturnValue();
                DAO_ParosPerdidas pp = new DAO_ParosPerdidas();
                ret = pp.CheckeaParo(datos);
                    
                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.checkeaParo", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_CHECKEANDO_UN"));
            }
        }

        [Route("api/EsMaquinaObligatoriaParo/{idMotivo}/")]
        [HttpGet]
        public bool EsMaquinaObligatoriaParo(int idMotivo)
        {
            try
            {
                DAO_ParosPerdidas daoParosPerdidas = new DAO_ParosPerdidas();
                var esMaquinaObligatoria = daoParosPerdidas.EsMaquinaObligatoriaParo(idMotivo);
                return esMaquinaObligatoria;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.EsMaquinaObligatoriaParo", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ES_MAQUINA_OBLIGATORIA"));
            }
        }

        [Route("api/ParosPerdidas/PorcentajeSinJustificar")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_20_VisualizacionParosPerdidasLlenadora,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> GetPorcentajeParosSinJustificar(int idTurno)
        {
            try
            {
                decimal result = await _iDAOParosPerdidas.ObtenerPorcentajeSinJustificar(idTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.GetPorcentajeParosSinJustificar", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_PORCENTAJE_PAROS_SIN_JUSTIFICAR"));
            }
        }

        [Route("api/ParosPerdidas/RelevoTurno")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_20_VisualizacionParosPerdidasLlenadora)]
        public async Task<IHttpActionResult> GetParosPerdidasRelevoTurno(int idTurno, bool porDuracion)
        {
            try
            {
                var result = await _iDAOParosPerdidas.ObtenerParosPerdidasRelevoTurno(idTurno, porDuracion);

                if (result.Exception != null)
                {
                    throw result.Exception;
                }
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParosPerdidasController.GetParosPerdidasRelevoTurno", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS_PERDIDAS"));
            }
        }

    }
}
