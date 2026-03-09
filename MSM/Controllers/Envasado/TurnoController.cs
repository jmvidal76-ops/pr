using BreadMES.Envasado;
using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Alt;
using MSM.Mappers.DTO.Envasado;
using MSM.Mappers.Envasado;
using MSM.Models.Envasado;
using MSM.Models.Planta;
using MSM.RealTime;
using MSM.Security;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class TurnoController : ApiController
    {
        private readonly IDAO_Turnos _iDAOTurnos;

        public TurnoController(IDAO_Turnos iDAOTurnos)
        {
            _iDAOTurnos = iDAOTurnos;
        }

        //[Route("api/turnosLineas")]
        //[HttpGet]
        //public List<Turno> turnosLineas()
        //{
        //    return PlantaRT.planta.turnoActual;
        //}PlantaRT.planta.turnoActual 

        [Route("api/turnosLineas")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_10_CuadroDeMandoDePlanta)]
        public async Task<List<DTO_CuadroMandoPlanta>> ObtenerInfoCuadroMando()
        {
            try
            {
                return await _iDAOTurnos.ObtenerInfoCuadroMando();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerInfoCuadroMando", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LINEAS"));
            }
        }

        //Añadido plan Contingencia
        [Route("api/turnosProduccionOrdenes/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos)]
        public IEnumerable<DTO.DTO_ProduccionTurnoOrdenes> GetTurnosProduccionOrdenes(dynamic filterData)
        {
            try
            {
                List<DTO.DTO_ProduccionTurnoOrdenes> turnosOrdenes = new List<DTO.DTO_ProduccionTurnoOrdenes>();
                //DateTime refDate = new DateTime(1970, 1, 1);
                DAO_Turnos daoTurnos = new DAO_Turnos();

                int numLinea = (int)filterData.numLinea;
                int idTipoTurno = (int)filterData.idTipoTurno;
                DateTime fechaTurnoUTC = (DateTime)filterData.fechaTurnoUTC;
                //int workDateBias = (int)filterData.workDateBias;
                turnosOrdenes = daoTurnos.ObtenerProduccionTurnoOrdenes(numLinea, fechaTurnoUTC, idTipoTurno);
                return turnosOrdenes;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetTurnosProduccionOrdenes", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTurnosProduccionOrdenes", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }
        //Añadido plan Contingencia
        [Route("api/turnosProduccionMaquinas/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos)]
        public IEnumerable<object> GetTurnosProduccionMaquinas(dynamic filterData)
        {
            try
            {
                List<object> turnoMaquinas = new List<object>();
                //DateTime refDate = new DateTime(1970, 1, 1);
                DAO_Turnos daoTurnos = new DAO_Turnos();

                string maquinaID = (string)filterData.maquinaID;
                int idTipoTurno = (int)filterData.idTipoTurno;
                DateTime fechaTurnoUTC = (DateTime)filterData.fechaTurnoUTC;
                //int workDateBias = (int)filterData.workDateBias;
                turnoMaquinas = daoTurnos.ObtenerProduccionTurnoMaquina(maquinaID, fechaTurnoUTC, idTipoTurno);
                return turnoMaquinas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetTurnosProduccionMaquinas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTurnosProduccionMaquinas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNOS") + ex.Message);
            }
        }
        //Añadido plan Contingencia
        [Route("api/turnoParticiones/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos)]
        public IEnumerable<object> GetTurnoParticiones(dynamic filterData)
        {
            try
            {
                List<object> result = new List<object>();
                //DateTime refDate = new DateTime(1970, 1, 1);
                DAO_Turnos daoTurnos = new DAO_Turnos();

                int numLinea = (int)filterData.numLinea;
                DateTime inicio = (DateTime)filterData.inicio;
                DateTime fin = (DateTime)filterData.fin;

                result = daoTurnos.ObtenerParticionesTurno(numLinea, inicio, fin);
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetTurnoParticiones", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTurnosParticiones", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PARTICIONES_TURNO"));
            }
        }
        //Añadido plan Contingencia
        [Route("api/obtenerMaquinasLineaConsolidados/{numLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos)]
        public IEnumerable<object> obtenerMaquinasLineaConsolidados(int numLinea)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    MaquinasLineasPlanConti[] result = context.MaquinasLineasPlanConti.AsNoTracking().Where(l => l.NumLinea == numLinea).OrderBy(m => m.Posicion).ToArray();

                    return result;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.obtenerMaquinasLineaConsolidados", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_MAQUINAS"));
            }
        }
        //Añadido plan Contingencia
        [Route("api/fusionarRegistrosMaquina/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public object fusionarRegistrosMaquina(dynamic filterData)
        {
            try
            {
                List<string> ordenesActualizar = new List<string>();
                List<string> particionesActualizar = new List<string>();
                dynamic registroIni = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(filterData.registroIni.ToString());
                dynamic registroFin = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(filterData.registroFin.ToString());

                //comprobaciones de integridad de la fusion, no se pueden fusionar registro que no pertenezcan a la misma hora
                if (((DateTime)registroIni.fechaFinUTC) != ((DateTime)registroFin.fechaInicioUTC))
                    return new object[] { false, "No se pueden fusionar registros que no sean contiguos" };
                if (((DateTime)registroIni.fechaInicioUTC).Hour != ((DateTime)registroFin.fechaFinUTC).Hour && ((DateTime)registroFin.fechaFinUTC).Minute > 0)
                    return new object[] { false, "No se pueden fusionar registros de diferentes horas" };
                if ((registroIni.duracion + registroFin.duracion) > 1)
                    return new object[] { false, "Los registros fusionados no pueden durar más de una hora" };

                int newContador = (int)registroIni.contadorProd + (int)registroFin.contadorProd;
                int newRechazos = registroIni.contadorRech += registroFin.contadorRech;
                int newContadorAuto = (int)registroIni.contadorProdAuto + (int)registroFin.contadorProdAuto;
                int newRechazosAuto = registroIni.contadorRechAuto + registroFin.contadorRechAuto;
                int numLinea = (int)registroIni.numLinea;
                string maquinaID = registroIni.maquinaID;
                int idTipoTurno = (int)registroIni.idTipoTurno;

                MaquinasLineas maquina;
                string turno;
                Lineas linea;

                using (MESEntities context = new MESEntities())
                {
                    maquina = context.MaquinasLineas.AsNoTracking().Where(m => m.Id == maquinaID).First();
                    turno = context.TiposTurno.AsNoTracking().Where(t => t.Id == idTipoTurno.ToString()).Select(t => t.Nombre).First();
                    linea = context.Lineas.AsNoTracking().Where(l => ((int)l.NumeroLinea) == numLinea).First();
                }
                
                string clase = maquina.Clase;
                string maquinaDesc = maquina.Descripcion;
                bool esMultilinea = !string.IsNullOrEmpty(linea.Grupo);
                //velocidad nominal y tplanificado, solo si shcID > 0   
                float velNominalMax = 0;
                float newVelocidadNominal = 0;
                float newTiempoPlanificado = 0;

                if (registroIni.shcID > 0)
                {
                    TimeSpan diff = (DateTime)registroFin.fechaFinUTC - (DateTime)registroIni.fechaInicioUTC;
                    float duracion = (float)diff.TotalHours;

                    if (esMultilinea)
                    {
                        newVelocidadNominal = (float)((double)registroIni.velocidadNominal + (double)registroFin.velocidadNominal);
                    }
                    else
                    {
                        var particion = (string)registroIni.idParticion == string.Empty ? (string)registroFin.idParticion : (string)registroIni.idParticion;
                        if (clase == "PALETIZADORA")
                        {
                            velNominalMax = DAO_Turnos.GetVelocidadNominalPaleteraHoraLinea(linea, particion);
                        }
                        else if (clase == "ETIQUETADORA_PALETS")
                        {
                            velNominalMax = DAO_Turnos.GetVelocidadNominalEtiquetadoraHoraLinea(linea, particion);
                        }
                        else
                        {
                            velNominalMax = DAO_Turnos.GetVelocidadNominalHoraLinea(linea, particion);
                        }

                        newVelocidadNominal = (int)Math.Round(velNominalMax * duracion);
                    }

                    newTiempoPlanificado = (int)Math.Round(diff.TotalSeconds);
                }

                string newOrder = (string)registroIni.idOrden;
                string newPart = (string)registroIni.idParticion;

                if (newOrder == "")
                {
                    newOrder = registroFin.idOrden;
                    newPart = registroFin.idParticion;
                }

                //EDITAMOS REGISTRO A FUSIONAR editamos con fecha fin del registroFIN y sumando cantidades
                editarRegistroConsolidado(maquinaID, (DateTime)registroIni.fechaInicioUTC, (DateTime)registroIni.fechaFinUTC, clase, newOrder,
                   newPart, (DateTime)registroIni.fechaInicioUTC, (DateTime)registroFin.fechaFinUTC, newContador, newContadorAuto, newRechazos,
                   newRechazosAuto, newTiempoPlanificado, newVelocidadNominal, (int)registroIni.shcID, esMultilinea, false, true);

                //BORRAMOS EL SIGUIENTE
                //ContingenciaBread.EliminarConsolidadoHora(clase, maquinaID, (DateTime)registroFin.fechaInicioUTC, (DateTime)registroFin.fechaFinUTC);
                //ContingenciaBread.EliminarConsolidadoHoraByPK(clase, (string)registroFin.pk);
                DAO_Turnos.EliminarConsolidadoHorarioPorId((string)registroFin.pk, clase);

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "Registro fusionado ", "Día: " + registroIni.fechaTurnoUTC + ", Turno: " + turno +
                    ", Id turno: " + registroIni.shcID + ", Línea: " + registroIni.numLinea + ", Máquina: " + maquinaDesc + ", Hora inicio: " +
                    registroIni.fechaInicioLocal + ", Hora fin: " + registroFin.fechaFinLocal + ", Partición: " + registroIni.idPaticion, HttpContext.Current.User.Identity.Name);

                //ordenes a actualizar
                if (registroIni.idOrden != "") ordenesActualizar.Add((string)registroIni.idOrden);
                if (registroFin.idOrden != "" && registroFin.idOrden != registroIni.idOrden) ordenesActualizar.Add((string)registroFin.idOrden);
                if (registroIni.idParticion != "") particionesActualizar.Add((string)registroIni.idParticion);
                if (registroFin.idParticion != "" && registroFin.idParticion != registroIni.idParticion) particionesActualizar.Add((string)registroFin.idParticion);
                DAO_Produccion daoProduccion = new DAO_Produccion();

                //actualizamos particiones
                particionesActualizar.ForEach(p =>
                {
                    actualizarParticion(p, numLinea);
                });

                //actualizamos las ordenes relacionada con los registros;
                ordenesActualizar.ForEach(ordstr =>
                {
                    Orden ord = daoProduccion.obtenerDatosProduccionOrden(ordstr);
                    DAO_Orden.ActualizarPropiedadesOrden(ord);
                });

                return new object[] { true, "" };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoControler.fusionarRegistrosMaquina", "WEB-ENVASADO", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        //Añadido plan Contingencia
        [Route("api/partirRegistroMaquina/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public object partirRegistroMaquina(dynamic filterData)
        {
            try
            {
                Double timestampUTC = (Double)filterData.nuevaHora;
                System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
                dtDateTime = dtDateTime.AddSeconds(timestampUTC).ToLocalTime();
                DateTime nuevaHoraUTC = dtDateTime.ToUniversalTime();
                dynamic registroMaquina = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(filterData.registroMaquina.ToString());
                return dividirRegistro(nuevaHoraUTC, registroMaquina, (int)registroMaquina.shcID, (int)registroMaquina.shcID, true);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "TurnoController.partirRegistroMaquina", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw new Exception(ex.Message);
            }
        }

        public object dividirRegistro(DateTime nuevaHoraUTC, dynamic registroMaquina, int shcNuevo1, int shcNuevo2, bool conLog)
        {
            float duracionViejo = (float)registroMaquina.duracion;
            double duracionNuevo1 = (nuevaHoraUTC - (DateTime)registroMaquina.fechaInicioUTC).TotalHours;
            double duracionNuevo2 = ((DateTime)registroMaquina.fechaFinUTC - nuevaHoraUTC).TotalHours;

            if (duracionNuevo1 <= 0 || duracionNuevo2 <= 0)
                return new object[] { false, "Hora de particion no permitida" };

            //contador
            int contadorViejo = (int)registroMaquina.contadorProd;
            int contadorNuevo1 = (int)Math.Round(contadorViejo * duracionNuevo1 / duracionViejo);
            int contadorNuevo2 = contadorViejo - contadorNuevo1;

            int contadorViejoAuto = (int)registroMaquina.contadorProdAuto;
            int contadorNuevo1Auto = (int)Math.Round(contadorViejoAuto * duracionNuevo1 / duracionViejo);
            int contadorNuevo2Auto = contadorViejoAuto - contadorNuevo1Auto;

            //rechazos
            int rechViejo = (int)registroMaquina.contadorRech;
            int rechNuevo1 = (int)Math.Round(rechViejo * duracionNuevo1 / duracionViejo);
            int rechNuevo2 = rechViejo - rechNuevo1;

            int rechViejoAuto = (int)registroMaquina.contadorRechAuto;
            int rechNuevo1Auto = (int)Math.Round(rechViejoAuto * duracionNuevo1 / duracionViejo);
            int rechNuevo2Auto = rechViejoAuto - rechNuevo1Auto;

            int numLinea = (int)registroMaquina.numLinea;
            Lineas linea;
            using (MESEntities mesEnt = new MESEntities())
            {
                linea = mesEnt.Lineas.AsNoTracking().Where(l => ((int)l.NumeroLinea) == numLinea).First();
            }
            bool esMultilinea = !string.IsNullOrEmpty(linea.Grupo);

            //velocidad nominal
            float velNominalViejo = 0;
            if ((string)registroMaquina.clase == "PALETIZADORA")
            {
                velNominalViejo = DAO_Turnos.GetVelocidadNominalPaleteraHoraLinea(linea, (string)registroMaquina.idParticion);
            }
            else if ((string)registroMaquina.clase == "ETIQUETADORA_PALETS")
            {
                velNominalViejo = DAO_Turnos.GetVelocidadNominalEtiquetadoraHoraLinea(linea, (string)registroMaquina.idParticion);
            }
            else
            {
                velNominalViejo = DAO_Turnos.GetVelocidadNominalHoraLinea(linea, (string)registroMaquina.idParticion);
            }

            float velNominal1 = (int)Math.Round(velNominalViejo * duracionNuevo1); //Solo se multiplica por la duracion del nuevo por que ya es la particion de hora, aunque velocidadNominal sea float lo trucamos a entero ya que son envases
            float velNominal2 = (int)Math.Round(duracionViejo * velNominalViejo) - (int)velNominal1; //el resto para el segundo
            if (shcNuevo1 <= 0)
                velNominal1 = 0;
            if (shcNuevo2 <= 0)
                velNominal2 = 0;

            //tiempo planificado    
            float tPlanificadoNuevo1 = 0;
            if (shcNuevo1 > 0) tPlanificadoNuevo1 = (float)duracionNuevo1 * 3600;
            float tPlanificadoNuevo2 = 0;
            if (shcNuevo2 > 0) tPlanificadoNuevo2 = (float)duracionNuevo2 * 3600;

            //comprobamos si los registros caen dentro de un trabajo planificado y sino ponemos shcID = 0
            /*int shcNuevo1 = registroMaquina.shcID;
            int shcNuevo2 = registroMaquina.shcID;
            if (registroMaquina.shcID > 0)
            {
                MESEntities ent = new MESEntities();
                Turnos shc = ent.Turnos.Where(t => t.Id == shcNuevo1).First();
                if (shc.InicioTurno <= (DateTime)registroMaquina.fechaInicioUTC && nuevaHoraUTC <= shc.FinTurno)
                {
                    shcNuevo1 = registroMaquina.shcID;
                }
                else
                {
                    shcNuevo1 = 0;
                }
                if (shc.InicioTurno <= nuevaHoraUTC && (DateTime)registroMaquina.fechaFinUTC <= shc.FinTurno)
                {
                    shcNuevo2 = registroMaquina.shcID;
                }
                else
                {
                    shcNuevo2 = 0;
                }
            }
            */

            //editamos el primero
            editarRegistroConsolidado((string)registroMaquina.maquinaID, (DateTime)registroMaquina.fechaInicioUTC, (DateTime)registroMaquina.fechaFinUTC, (string)registroMaquina.clase, (string)registroMaquina.idOrden,
                (string)registroMaquina.idParticion, (DateTime)registroMaquina.fechaInicioUTC, nuevaHoraUTC, contadorNuevo1, contadorNuevo1Auto,
                rechNuevo1, rechNuevo1Auto, tPlanificadoNuevo1, velNominal1, shcNuevo1, esMultilinea, false, true);

            //creamos el segundo
            CrearRegistroConsolidadoHora((string)registroMaquina.maquinaID, (string)registroMaquina.clase, (string)registroMaquina.idOrden,
                (string)registroMaquina.idParticion, nuevaHoraUTC, (DateTime)registroMaquina.fechaFinUTC,
                contadorNuevo2, contadorNuevo2Auto, rechNuevo2, rechNuevo2Auto, tPlanificadoNuevo2, velNominal2, shcNuevo2, 0, 0, 0);

            //Registro dividido: Dia: <Día> Turno: <Turno> Id turno: <shc_work_sched_day_pk>  Línea: <Línea>, Hora Inicio: <Fecha/Hora Inicio registro a fusionar>, Hora Fin: <Fecha/Hora Fin registro a fusionar>, Hora División: <Hora:Minutos fusión>
            string maquinaID = registroMaquina.maquinaID;
            int idTipoTurno = (int)registroMaquina.idTipoTurno;
            MaquinasLineas maquina;
            string turno;

            using (MESEntities context = new MESEntities())
            {
                maquina = context.MaquinasLineas.AsNoTracking().Where(m => m.Id == maquinaID).First();
                turno = context.TiposTurno.AsNoTracking().Where(t => t.Id == idTipoTurno.ToString()).Select(t => t.Nombre).First();
            }
                
            string maquinaDesc = maquina.Descripcion;
            
            if (conLog)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "Registro dividido", "Día: " + registroMaquina.fechaTurnoUTC + ", Turno: " + turno + ", Id turno: " + registroMaquina.shcID +
                    ", Línea: " + registroMaquina.numLinea + ", Máquina: " + maquinaDesc + ", Hora Inicio: " + registroMaquina.fechaInicioLocal + ", Hora fin: " + registroMaquina.fechaFinLocal +
                    ", Hora división: " + nuevaHoraUTC.ToLocalTime(), HttpContext.Current.User.Identity.Name);
            }

            return new object[] { true, "" };
        }

        //Añadido plan Contingencia
        [Route("api/eliminarRegistrosMaquina/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public object EliminarRegistroMaquina(dynamic filterData)
        {
            try
            {
                //array de registros seleccionados
                dynamic[] arrSel = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic[]>(filterData.arrSel.ToString());
                //DateTime nuevaHoraLocal = nuevaHora.ToLocalTime();
                // dynamic registroMaquina = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(filterData.registroMaquina.ToString());

                for (int i = 0; i < arrSel.Length; i++)
                {
                    dynamic registroMaquina = arrSel[i];
                    //ContingenciaBread.EliminarConsolidadoHoraByPK((string)registroMaquina.clase, (string)registroMaquina.pk);
                    DAO_Turnos.EliminarConsolidadoHorarioPorId((string)registroMaquina.pk, (string)registroMaquina.clase);

                    string maquinaID = registroMaquina.maquinaID;
                    int idTipoTurno = (int)registroMaquina.idTipoTurno;

                    using (MESEntities context = new MESEntities())
                    {
                        MaquinasLineas maquina = context.MaquinasLineas.AsNoTracking().Where(m => m.Id == maquinaID).First();
                        string maquinaDesc = maquina.Descripcion;
                        string turno = context.TiposTurno.AsNoTracking().Where(t => t.Id == idTipoTurno.ToString()).Select(t => t.Nombre).First();

                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "Registro eliminado ", "Día: " + registroMaquina.fechaTurnoUTC + ", Turno: " +
                            registroMaquina.tipoTurno + ", Id turno: " + turno + ", Línea: " + registroMaquina.numLinea + ", Máquina: " + maquinaDesc +
                            ", Hora inicio: " + registroMaquina.fechaInicioLocal + ", Hora fin: " + registroMaquina.fechaFinLocal, HttpContext.Current.User.Identity.Name);
                    }

                    if (registroMaquina.idOrden != "")
                    {
                        DAO_Produccion daoProduccion = new DAO_Produccion();
                        Orden ord = daoProduccion.obtenerDatosProduccionOrden((string)registroMaquina.idOrden);
                        DAO_Orden.ActualizarPropiedadesOrden(ord);
                    }

                    string p = (string)registroMaquina.idParticion;
                    if (p != "")
                    {
                        actualizarParticion(p, (int)registroMaquina.numLinea);
                    }
                }

                return new object[] { true, "" };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoController.eliminarRegistroMaquina", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(ex.Message);
            }
        }

        //Añadido plan Contingencia
        [Route("api/rellenarRegistrosTurno/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public async Task<object> rellenarRegistrosTurno(dynamic filterData)
        {
            try
            {
                DTO_ConsolidadoTurnos turno = Newtonsoft.Json.JsonConvert.DeserializeObject<DTO_ConsolidadoTurnos>(filterData.turno.ToString());
                int numLinea;

                using (MESEntities context = new MESEntities())
                {
                    numLinea = context.Lineas.AsNoTracking().Where(l => l.Id == turno.IdLinea).Select(l => l.NumeroLinea).First().Value;
                }

                //TiposTurno tipoTurno = context.TiposTurno.Where(i => i.Id == turno.IdTipoTurno.ToString()).First();
                //DateTime inicioTurnoUTC = turno.FechaTurno.Add(tipoTurno.Inicio.TimeOfDay).AddMinutes((double)-tipoTurno.Bias).ToUniversalTime();
                //DateTime finTurnoUTC = turno.FechaTurno.Add(((DateTime)tipoTurno.Fin).TimeOfDay).AddMinutes((double)-tipoTurno.Bias).ToUniversalTime();

                //El turno de NOCHE tiene un fallo en la confiugracion del SHC, el fin del turno no termina al día siguiente, para corregirlo se añade un día en caso de turno NOCHE
                //if (tipoTurno.Id == "3")
                //{
                //    finTurnoUTC = finTurnoUTC.AddDays(1);
                //}

                //bool encontrado = ContingenciaBread.rePlanificarRegistroConsolidadoTurno(turno.fechaTurnoUTC, lineaPath, turno.idTipoTurno, turno.shcID);
                bool encontrado = await _iDAOTurnos.ActualizarIdTurno(turno);

                if (!encontrado)
                {
                    turno.TiempoVaciadoTren = DAO_Turnos.GetTiempoVaciadoLineaByTurno(0, numLinea);
                    //ContingenciaBread.crearConsolidadoTurno(turno.fechaTurnoUTC, lineaPath, turno.idTipoTurno, inicioTurnoUTC, finTurnoUTC, turno.shcID, (float)turno.oeeCritico, (float)turno.oeeObjetivo, tiempoVaciadoLinea);

                    await _iDAOTurnos.CrearConsolidadoTurno(turno);
                }

                await RellenarRegistrosTurno(turno, numLinea);

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "Turno regenerado", "Día: " + turno.FechaTurno.ToShortDateString() + ", Turno: " + turno.TipoTurno + ", Id turno: " + turno.IdTurno + ", Línea: " + numLinea, HttpContext.Current.User.Identity.Name);
                return new object[] { true, "" };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoControler.rellenarRegistrosTurno", "WEB-ENVASADO", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        public async Task borrarTurno(int idTipoTurno, int numLinea, DateTime fechaTurnoUTC, int shcID)
        {
            MaquinasLineasPlanConti[] arrMaquinas;

            using (MESEntities context = new MESEntities())
            {
                //replanificamos con PK = 0 aquellos consolidados TURNO que tenían este trabajo planificado relacionado
                //Sólo hacerlo con tipos de turno 1,2,3 -> si alguien no smanda un SHC con turno tipo 0 no hacemos nada
                if (idTipoTurno <= 0)
                    return;
                string lineaPath = context.Lineas.AsNoTracking().Where(l => l.NumeroLinea == numLinea).Select(l => l.Id).First();
                //obtenemos la fecha de Inicio y fin del turno porque los que vienen del DTO_ProduccionTurno son el Inicio y Fin del shc
                //bool encontrado = ContingenciaBread.rePlanificarRegistroConsolidadoTurno(fechaTurnoUTC, lineaPath, idTipoTurno, 0);
                DTO_ConsolidadoTurnos dto = Mapper_ConsolidadoTurnos.MapperDatosToReplanificarDTO(fechaTurnoUTC, lineaPath, idTipoTurno, 0);
                bool encontrado = await _iDAOTurnos.ActualizarIdTurno(dto);

                if (!encontrado)
                {
                    //Si no existía lo creamos con SHCID PK = 0
                    TiposTurno tipoTurno = context.TiposTurno.AsNoTracking().Where(i => i.Id == idTipoTurno.ToString()).First();
                    DateTime inicioTurnoUTC = fechaTurnoUTC.Add(tipoTurno.Inicio.TimeOfDay).AddMinutes((double)-tipoTurno.Bias).ToUniversalTime();
                    DateTime finTurnoUTC = fechaTurnoUTC.Add(((DateTime)tipoTurno.Fin).TimeOfDay).AddMinutes((double)-tipoTurno.Bias).ToUniversalTime();
                    //El turno de NOCHE tiene un fallo en la confiugracion del SHC, el fin del turno no termina al día siguiente, para corregirlo se añade un día en caso de turno NOCHE
                    if (tipoTurno.Id == "3")
                    {
                        finTurnoUTC = finTurnoUTC.AddDays(1);
                    }
                    float oeeCritico = (float)context.ParametrosPlanta_Admin.AsNoTracking().Where(p => p.IdLinea.Value == numLinea && p.IdParametro == 13).Select(p => p.VALOR_FLOAT).First();
                    float oeeObjetivo = (float)context.ParametrosPlanta_Admin.AsNoTracking().Where(p => p.IdLinea.Value == numLinea && p.IdParametro == 12).Select(p => p.VALOR_FLOAT).First();
                    int tiempoVaciadoLinea = DAO_Turnos.GetTiempoVaciadoLineaByTurno(0, numLinea);
                    //ContingenciaBread.crearConsolidadoTurno(fechaTurnoUTC, lineaPath, idTipoTurno, inicioTurnoUTC, finTurnoUTC, 0, oeeCritico, oeeObjetivo, tiempoVaciadoLinea);
                    DTO_ConsolidadoTurnos dtoCrear = Mapper_ConsolidadoTurnos.MapperDatosToCrearDTO(fechaTurnoUTC, lineaPath, idTipoTurno, inicioTurnoUTC, finTurnoUTC, 0, oeeCritico, oeeObjetivo, tiempoVaciadoLinea);
                    await _iDAOTurnos.CrearConsolidadoTurno(dtoCrear);
                }

                //DESPLANIFICAMOS TODOS LOS REGISTROS DE CONSOLIDADOHORARIO
                arrMaquinas = context.MaquinasLineasPlanConti.AsNoTracking().Where(m => m.NumLinea == numLinea).ToArray();
            }

            List<string> ordenesActualizar = new List<string>();
            List<string> particionesActualizar = new List<string>();
            for (int m = 0; m < arrMaquinas.Length; m++)
            {
                var datosMaquina = GetTurnosProduccionMaquinas(new { maquinaID = arrMaquinas[m].Id, idTipoTurno = idTipoTurno, fechaTurnoUTC = fechaTurnoUTC });

                dynamic[] arrRegNuevos = datosMaquina.ToArray();
                for (int i = 0; i < arrRegNuevos.Length; i++)
                {
                    //GUARDAMOS LAS ORDENES QUE TENEMOS QUE VOLVER A CALCULAR
                    string idParticion = arrRegNuevos[i].idParticion;
                    string idOrden = arrRegNuevos[i].idOrden;
                    if (idParticion != "" && !particionesActualizar.Contains(idParticion))
                        particionesActualizar.Add(idParticion); // Si el registro no existe lo añade
                    if (idOrden != "" && !ordenesActualizar.Contains(idOrden))
                        ordenesActualizar.Add(idOrden); // Si el registro no existe lo añade
                    // DESPLANIFICAMOS
                    planificarRegistroConsolidado(arrRegNuevos[i], 0);
                }
            }

            DAO_Produccion daoProduccion = new DAO_Produccion();
            //ACTUALIZAMOS PARTICIONES
            particionesActualizar.ForEach(p =>
            {
                Orden particion = daoProduccion.obtenerDatosProduccionParticion(p);
                if (particion.id == "VACIA")
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, "No se encuentra la partición: " + p, "TurnoController.borrarTurno", "WEB-ENVASADO", "Sistema");
                }
                else
                {
                    DAO_Orden.ActualizarPropiedadesOrden(particion);
                }
            });
            //ACTUALIZAMOS TODAS LA ORDENES QUE TENIAN LOS REGISTROS
            ordenesActualizar.ForEach(ordID =>
            {
                if (ordID != "")
                {
                    Orden ord = daoProduccion.obtenerDatosProduccionOrden(ordID);
                    DAO_Orden.ActualizarPropiedadesOrden(ord);
                }
            });
        }

        public void actualizarParticion(string p, int numLinea)
        {
            DAO_Produccion daoProduccion = new DAO_Produccion();
            Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea);
            List<Orden> particiones = linea.obtenerOrdenes();
            var particion = particiones.Find(o => o.id == p);

            if (particion == null) // Puede ser null porque se trata de una partición Cerrada
            {
                particion = daoProduccion.obtenerDatosProduccionParticion(p);
            }
            else
            {
                daoProduccion.obtenerDatosProduccionParticion(particion, DateTime.UtcNow, new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day));
            }

            DAO_Orden.ActualizarPropiedadesOrden(particion);
        }

        public async Task RellenarRegistrosTurno(DTO_ConsolidadoTurnos turno, int numLinea)
        {
            MaquinasLineasPlanConti[] arrMaquinas;

            using (MESEntities context = new MESEntities())
            {
                arrMaquinas = context.MaquinasLineasPlanConti.AsNoTracking().Where(m => m.NumLinea == numLinea).ToArray();
            }

            //TiposTurno tipoTurno = mesEnt.TiposTurno.Where(i => i.Id == turno.IdTipoTurno.ToString()).First();
            //DateTime inicioTurnoUTC = fechaTurnoUTC.Add(tipoTurno.Inicio.TimeOfDay).AddMinutes((double)-tipoTurno.Bias).ToUniversalTime();
            //DateTime finTurnoUTC = fechaTurnoUTC.Add(((DateTime)tipoTurno.Fin).TimeOfDay).AddMinutes((double)-tipoTurno.Bias).ToUniversalTime();
                
            //El turno de NOCHE tiene un fallo en la confiugracion del SHC, el fin del turno no termina al día siguiente, para corregirlo se añade un día en caso de turno NOCHE
            //if (tipoTurno.Id == "3")
            //{
            //    finTurnoUTC = finTurnoUTC.AddDays(1);
            //}

            Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea);
            List<string> ordenesActualizar = new List<string>();
            List<string> particionesActualizar = new List<string>();

            for (int m = 0; m < arrMaquinas.Length; m++)
            {
                IEnumerable<object> datosMaquina = GetTurnosProduccionMaquinas(new { maquinaID = arrMaquinas[m].Id, idTipoTurno = turno.IdTipoTurno, fechaTurnoUTC = turno.FechaTurno });
                dynamic[] arr = datosMaquina.ToArray();

                if (arr.Length == 0)
                {
                    //SI NO TIENE NINGUN REGISTRO RELLENAMOS TODAS LAS HORAS
                    crearRegistrosConsolidadoEntreHoras(arrMaquinas[m].Id, arrMaquinas[m].Clase, turno.InicioTurno, turno.FinTurno, linea.id, (int)turno.IdTurno);
                }
                else
                {
                    //SI TIENE REGISTROS rellenamos los espacios en blanco.
                    for (int i = 1; i < arr.Length; i++)
                    {
                        if (arr[i - 1].fechaFinUTC < arr[i].fechaInicioUTC)
                        {
                            //Comprobamos que la fecha fin del anterior sea menor que la fecha inicio, 
                            crearRegistrosConsolidadoEntreHoras(arrMaquinas[m].Id, arrMaquinas[m].Clase, arr[i - 1].fechaFinUTC, arr[i].fechaInicioUTC, linea.id, (int)turno.IdTurno);
                        }
                    }
                    //SI TIENE REGISTROS Comprobamos que el primer registro empieza cuando debe empezar el turno
                    if (arr.Length > 0 && arr[0].fechaInicioUTC > turno.InicioTurno)
                    {
                        //
                        crearRegistrosConsolidadoEntreHoras(arrMaquinas[m].Id, arrMaquinas[m].Clase, turno.InicioTurno, arr[0].fechaInicioUTC, linea.id, (int)turno.IdTurno);
                    }
                    //SI TIENE REGISTROS Comprobamos que el ultimo registro termina cuando debe terminar el turno
                    if (arr.Length > 0 && arr.Last().fechaFinUTC < turno.FinTurno)
                    {
                        crearRegistrosConsolidadoEntreHoras(arrMaquinas[m].Id, arrMaquinas[m].Clase, arr.Last().fechaFinUTC, turno.FinTurno, linea.id, (int)turno.IdTurno);
                    }
                }

                //UNA VEZ CREADOS LOS REGISTROS LOS VOLVEMOS A REVISAR PARA MARCAR LOS REGISTROS QUE ENTRAN DENTRO DEL TRABAJO PLANIFICADO
                datosMaquina = GetTurnosProduccionMaquinas(new { maquinaID = arrMaquinas[m].Id, idTipoTurno = turno.IdTipoTurno, fechaTurnoUTC = turno.FechaTurno });
                //TurnosOEE shcObj = mesEnt.TurnosOEE.Where(t => t.Id == turno.IdTurno).First();
                var shcObj = await _iDAOTurnos.ObtenerTurnoOEE(turno.IdTurno);

                dynamic[] arrRegNuevos = datosMaquina.ToArray();
                for (int i = 0; i < arrRegNuevos.Length; i++)
                {
                    DateTime inicioConsol = arrRegNuevos[i].fechaInicioUTC;
                    DateTime finConsol = arrRegNuevos[i].fechaFinUTC;
                    string idOrden = arrRegNuevos[i].idOrden;
                    string idParticion = arrRegNuevos[i].idParticion;
                    if (idParticion != "" && !particionesActualizar.Contains(idParticion))
                        particionesActualizar.Add(idParticion); // Si el registro no existe lo añade
                    if (idOrden != "" && !ordenesActualizar.Contains(idOrden))
                        ordenesActualizar.Add(idOrden); // Si el registro no existe lo añade

                    if (shcObj.InicioTurno <= inicioConsol && finConsol <= shcObj.FinTurno)
                    {
                        //Comprobamos que no este entre los breaks o que tengamos que partir el registro
                        if (shcObj.InicioBreak != null && inicioConsol < shcObj.InicioBreak && finConsol > shcObj.InicioBreak)
                        {
                            dividirRegistro(shcObj.InicioBreak.Value, arrRegNuevos[i], shcObj.Id, 0, false);
                        }
                        else if (shcObj.FinBreak != null && inicioConsol < shcObj.FinBreak && finConsol > shcObj.FinBreak)
                        {
                            dividirRegistro(shcObj.FinBreak.Value, arrRegNuevos[i], 0, shcObj.Id, false);
                        }
                        else if (shcObj.InicioBreak != null && shcObj.FinBreak != null && shcObj.InicioBreak <= inicioConsol && finConsol <= shcObj.FinBreak)
                        {
                            //EL registro cae entre el break, DESPLANIFICAMOS
                            planificarRegistroConsolidado(arrRegNuevos[i], 0);
                        }
                        else
                        {
                            //El registro cae dentro del SHC, PLANIFICAMOS
                            planificarRegistroConsolidado(arrRegNuevos[i], shcObj.Id);
                        }
                    }
                    else
                    {
                        if (inicioConsol < shcObj.FinTurno && finConsol > shcObj.FinTurno)
                        {
                            //si el registro cae parcialmente dentro del turno lo dividimos en dos, repartimos las cantidades proporcionalmente
                            dividirRegistro(shcObj.FinTurno, arrRegNuevos[i], shcObj.Id, 0, false);
                        }
                        else
                        {
                            if (inicioConsol < shcObj.InicioTurno && finConsol > shcObj.InicioTurno)
                            {
                                //si el registro cae parcialmente dentro del turno lo dividimos en dos, repartimos las cantidades proporcionalmente
                                dividirRegistro(shcObj.InicioTurno, arrRegNuevos[i], 0, shcObj.Id, false);
                            }
                            else
                            {
                                //si no está entre ninguno de lo breaks o dentro del turno planificado se DESPLANIFICA
                                planificarRegistroConsolidado(arrRegNuevos[i], 0);
                            }
                        }
                    }
                }
            }

            DAO_Produccion daoProduccion = new DAO_Produccion();
            particionesActualizar.ForEach(p =>
            {
                actualizarParticion(p, numLinea);
            });

            //ACTUALIZAMOS TODAS LA ORDENES QUE TENIAN LOS REGISTROS
            ordenesActualizar.ForEach(ordID =>
            {
                if (ordID != "" && ordID != "0")
                {
                    Orden ord = daoProduccion.obtenerDatosProduccionOrden(ordID);
                    DAO_Orden.ActualizarPropiedadesOrden(ord);
                }
            });

            //INSERTAR REGISTROS                   Registros insertados para Dia: <Día> Turno: <Turno> Id turno: <shc_work_sched_day_pk> Línea: <Línea>
            //DAO_Log.registrarLog(DateTime.Now, "Registros insertados: ","Día: " + fechaTurnoUTC + ", Turno: " + tipoTurno.Nombre + ", Id turno: " + shcID + ", Línea: " + numLinea, HttpContext.Current.User.Identity.Name);
        }

        public void planificarRegistroConsolidado(dynamic registroMaquina, int shcID)
        {
            DateTime inicioConsol = registroMaquina.fechaInicioUTC;
            DateTime finConsol = registroMaquina.fechaFinUTC;
            double duracion = (finConsol - inicioConsol).TotalHours;
            int numLinea = registroMaquina.numLinea;
            Lineas linea;

            using (MESEntities context = new MESEntities())
            {
                linea = context.Lineas.AsNoTracking().Where(l => ((int)l.NumeroLinea) == numLinea).First();
            }
             
            bool esMultilinea = !string.IsNullOrEmpty(linea.Grupo);

            float tPlanificado = 0;
            if (shcID > 0)
                tPlanificado = (float)duracion * 3600;

            float envasesTeoricos = 0;
            if (registroMaquina.clase == "LLENADORA" && shcID > 0)
            {
                float velocidaNominalHoraMax = DAO_Turnos.GetVelocidadNominalHoraLinea(linea, (string)registroMaquina.idParticion);
                envasesTeoricos = (int)Math.Round(velocidaNominalHoraMax * duracion); //Solo se multiplica por la duracion del nuevo por que ya es la particion de hora, aunque velocidadNominal sea float lo truncamos a entero ya que son envases
            }

            if (registroMaquina.clase == "PALETIZADORA" && shcID > 0)
            {
                float velocidaNominalHoraMax = DAO_Turnos.GetVelocidadNominalPaleteraHoraLinea(linea, (string)registroMaquina.idParticion);
                envasesTeoricos = (int)Math.Round(velocidaNominalHoraMax * duracion); //Solo se multiplica por la duracion del nuevo por que ya es la particion de hora, aunque velocidadNominal sea float lo truncamos a entero ya que son envases
            }

            if (registroMaquina.clase == "ETIQUETADORA_PALETS" && shcID > 0)
            {
                float velocidaNominalHoraMax = DAO_Turnos.GetVelocidadNominalEtiquetadoraHoraLinea(linea, (string)registroMaquina.idParticion);
                envasesTeoricos = (int)Math.Round(velocidaNominalHoraMax * duracion); //Solo se multiplica por la duracion del nuevo por que ya es la particion de hora, aunque velocidadNominal sea float lo truncamos a entero ya que son envases
            }

            //Si el registro cae dentro del turno lo editamos
            editarRegistroConsolidado((string)registroMaquina.maquinaID, (DateTime)registroMaquina.fechaInicioUTC, (DateTime)registroMaquina.fechaFinUTC, (string)registroMaquina.clase,
                (string)registroMaquina.idOrden, (string)registroMaquina.idParticion, inicioConsol, finConsol, (int)registroMaquina.contadorProd, (int)registroMaquina.contadorProdAuto,
                (int)registroMaquina.contadorRech, (int)registroMaquina.contadorRechAuto, tPlanificado, envasesTeoricos, shcID, esMultilinea, false, false);
        }

        public void crearRegistrosConsolidadoEntreHoras(string idMaq, string clase, DateTime fechaInicio, DateTime fechaFin, string idLinea, int shcID)
        {
            DateTime fechaIniConsol = fechaInicio;
            DateTime fechafinConsol = fechaInicio.Date.AddHours(fechaInicio.Hour + 1);
            //realizamos el bucle para trocear los registros de horas desde la fechaInicio a la fechaFin
            do
            {
                //Si la fecha fin del registro posterior es menor que la fechaFinQ
                if (fechafinConsol > fechaFin)
                    fechafinConsol = fechaFin;

                DAO_Produccion daoProd = new DAO_Produccion();
                DatosProduccion datosProd = daoProd.ObtenerDatosProduccionMaquina(fechaIniConsol, fechafinConsol, idMaq);

                if (datosProd == null)
                {
                    datosProd = new DatosProduccion();
                }
                else
                {
                    if (clase == "ETIQUETADORA_PALETS")
                    {
                        datosProd.cantidadProducida = DAO_Turnos.ObtenerPaletsEtiquetadoraPorLineaFechas(idLinea, fechaIniConsol, fechafinConsol);
                    }
                }

                //Turno turno = DAO_Turnos.ObtenerTurnoSHCPorFecha(idLinea, fechaIniConsol);

                CrearRegistroConsolidadoHora(idMaq, clase, "", "", fechaIniConsol, fechafinConsol, datosProd.cantidadProducida, datosProd.cantidadProducida,
                    datosProd.rechazos, datosProd.rechazos, (float)datosProd.tiempoPlanificado, (float)datosProd.velocidadNominal, shcID,
                    (float)datosProd.tiempoNeto, (float)datosProd.tiempoBruto, (float)datosProd.tiempoOperativo);

                fechaIniConsol = fechafinConsol;
                if (fechafinConsol.Hour == fechaFin.Hour && fechaFin.Minute > 0)
                {
                    fechafinConsol = fechafinConsol.AddMinutes(fechaFin.Minute).AddSeconds(fechaFin.Second);
                }
                else
                {
                    fechafinConsol = fechafinConsol.AddHours(1);
                }

            }
            while (fechafinConsol <= fechaFin);
        }

        public void CrearRegistroConsolidadoHora(string idMaq, string clase, string orderId, string particionId, DateTime fechaInicio, DateTime fechaFin, int Contador, int ContadorAuto, int Rechazos, int RechazosAuto, float tPlanificado, float velocidadNominal, int shcID, float tiempoNeto, float tiempoBruto, float tiempoOperativo)
        {
            if (clase == "LLENADORA")
            {
                COB_MSM_PROD_LLENADORA_HORA cobRPA = new COB_MSM_PROD_LLENADORA_HORA();
                cobRPA.CONTADOR_RECHAZOS = Rechazos;
                cobRPA.CONTADOR_RECHAZOS_AUTO = RechazosAuto;
                cobRPA.CONTADOR_PRODUCCION = Contador;
                cobRPA.CONTADOR_PRODUCCION_AUTO = ContadorAuto;
                cobRPA.ID_MAQUINA = idMaq;
                cobRPA.ID_ORDEN = orderId;
                cobRPA.ID_PARTICION = particionId;
                cobRPA.SHC_WORK_SCHED_DAY_PK = shcID;
                cobRPA.FECHA_INICIO = fechaInicio;
                cobRPA.FECHA_FIN = fechaFin;
                cobRPA.HORA = Convert.ToInt16(fechaInicio.Hour);
                cobRPA.TIEMPO_PLANIFICADO = tPlanificado;
                cobRPA.VELOCIDAD_NOMINAL = velocidadNominal;

                cobRPA.TIEMPO_NETO = tiempoNeto;
                cobRPA.TIEMPO_BRUTO = tiempoBruto;
                cobRPA.TIEMPO_OPERATIVO = tiempoOperativo;

                ContingenciaBread.CrearConsolidadoHora(cobRPA);
            }
            else
            {
                COB_MSM_PROD_RESTO_MAQ_HORA cobRPA = new COB_MSM_PROD_RESTO_MAQ_HORA();
                cobRPA.CONTADOR_RECHAZOS = Rechazos;
                cobRPA.CONTADOR_RECHAZOS_AUTO = RechazosAuto;
                cobRPA.CONTADOR_PRODUCCION = Contador;
                cobRPA.CONTADOR_PRODUCCION_AUTO = ContadorAuto;
                cobRPA.ID_MAQUINA = idMaq;
                cobRPA.ID_ORDEN = orderId;
                cobRPA.ID_PARTICION = particionId;
                cobRPA.SHC_WORK_SCHED_DAY_PK = shcID;
                cobRPA.FECHA_INICIO = fechaInicio;
                cobRPA.FECHA_FIN = fechaFin;
                cobRPA.HORA = Convert.ToInt16(fechaInicio.Hour);
                cobRPA.TIEMPO_PLANIFICADO = tPlanificado;
                cobRPA.VELOCIDAD_NOMINAL = (clase == "PALETIZADORA" || clase == "ETIQUETADORA_PALETS") ? velocidadNominal : 0; //LAS MAQUINAS NO TIENEN VELOCIDAD NOMINAL PERO LA PALETERA SÍ
                //cobRPA.TIPO_OFFSET = TipoOffset.Modificado.GetStringValue();
                cobRPA.TIEMPO_NETO = tiempoNeto;
                cobRPA.TIEMPO_BRUTO = tiempoBruto;
                cobRPA.TIEMPO_OPERATIVO = tiempoOperativo;
                ContingenciaBread.CrearConsolidadoHora(cobRPA);
            }
        }

        public void editarRegistroConsolidado(string idMaq, DateTime fechaInicioBuscar, DateTime fechaFinBuscar, string clase, string orderId,
            string particionId, DateTime fechaInicioNew, DateTime fechaFinNew, int Contador, int ContadorAuto, int Rechazos, int RechazosAuto,
            float tPlanificado, float velocidadNominal, int shcID, bool esMultilinea, bool esAsignar, bool esDividir)
        {
            if (clase == "LLENADORA")
            {
                COB_MSM_PROD_LLENADORA_HORA cobRPA = new COB_MSM_PROD_LLENADORA_HORA();
                cobRPA.CONTADOR_RECHAZOS = Rechazos;
                cobRPA.CONTADOR_RECHAZOS_AUTO = RechazosAuto;
                cobRPA.CONTADOR_PRODUCCION = Contador;
                cobRPA.CONTADOR_PRODUCCION_AUTO = ContadorAuto;
                cobRPA.ID_MAQUINA = idMaq;
                cobRPA.ID_ORDEN = orderId;
                cobRPA.ID_PARTICION = particionId;
                //cobRPA.SHC_WORK_SCHED_DAY_PK = ;
                cobRPA.FECHA_INICIO = fechaInicioNew;
                cobRPA.FECHA_FIN = fechaFinNew;
                cobRPA.HORA = Convert.ToInt16(fechaInicioNew.Hour);
                //cobRPA.TIPO_OFFSET = TipoOffset.Modificado.GetStringValue();
                cobRPA.SHC_WORK_SCHED_DAY_PK = shcID;
                cobRPA.TIEMPO_PLANIFICADO = tPlanificado;
                cobRPA.VELOCIDAD_NOMINAL = velocidadNominal;

                ContingenciaBread.EditarConsolidadoHora(idMaq, fechaInicioBuscar, fechaFinBuscar, cobRPA, esMultilinea, esAsignar, esDividir);
            }
            else
            {
                COB_MSM_PROD_RESTO_MAQ_HORA cobRPA = new COB_MSM_PROD_RESTO_MAQ_HORA();
                cobRPA.CONTADOR_RECHAZOS = Rechazos;
                cobRPA.CONTADOR_RECHAZOS_AUTO = RechazosAuto;
                cobRPA.CONTADOR_PRODUCCION = Contador;
                cobRPA.CONTADOR_PRODUCCION_AUTO = ContadorAuto;
                cobRPA.ID_MAQUINA = idMaq;
                cobRPA.ID_ORDEN = orderId;
                cobRPA.ID_PARTICION = particionId;
                cobRPA.FECHA_INICIO = fechaInicioNew;
                cobRPA.FECHA_FIN = fechaFinNew;
                cobRPA.HORA = Convert.ToInt16(fechaInicioNew.Hour);
                cobRPA.SHC_WORK_SCHED_DAY_PK = shcID;
                //cobRPA.TIPO_OFFSET = TipoOffset.Modificado.GetStringValue();
                cobRPA.TIEMPO_PLANIFICADO = tPlanificado;
                cobRPA.VELOCIDAD_NOMINAL = (clase == "PALETIZADORA" || clase == "ETIQUETADORA_PALETS") ? velocidadNominal : 0; //LAS MAQUINAS NO TIENEN VELOCIDAD NOMINAL PERO LA PALETERA SÍ

                ContingenciaBread.EditarConsolidadoHora(idMaq, fechaInicioBuscar, fechaFinBuscar, cobRPA, esMultilinea, esAsignar, esDividir);
            }
        }

        //Añadido plan Contingencia -  boton asignar
        [Route("api/editarRegistrosMaquina/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public object editarRegistrosMaquina(dynamic filterData)
        {
            List<string> ordenesActualizar = new List<string>();

            try
            {
                dynamic[] arrSel = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic[]>(filterData.arrSel.ToString());
                
                string wo = filterData.orden;
                // Se limpian los espacios, tabuladores y saltos de línea
                string idOrden = string.IsNullOrWhiteSpace(wo) ? string.Empty : Regex.Replace(wo, @"\s+", "");
                
                string idparticion = string.Empty;

                int totalSumarCont = filterData.contador;
                int totalSumarRech = filterData.rechazos;
                int porcentajeValor = filterData.porcentaje;
                float porcentajeProd = (float) porcentajeValor / 100;
                int sumadoCont = 0;
                int sumadoRech = 0;
                List<string> particionesActualizar = new List<string>();
                string maquinaID = arrSel[0].maquinaID;
                string clase = arrSel[0].clase;
                int numLinea = arrSel[0].numLinea;
                double horasTotales = 0;
                string ordenId = string.Empty;
                Lineas linea;
                bool esMultilinea;

                using (MESEntities context = new MESEntities())
                {
                    linea = context.Lineas.AsNoTracking().Where(l => ((int)l.NumeroLinea) == numLinea).First();
                    esMultilinea = !string.IsNullOrEmpty(linea.Grupo);

                    if (idOrden != string.Empty)
                    {
                        try
                        {
                            Ordenes orden = context.Ordenes.AsNoTracking().Where(o => o.Id == idOrden).FirstOrDefault();

                            if (orden == null)
                            {
                                return new object[] { false, IdiomaController.GetResourceName("NO_EXISTE_ORDEN") };
                            }

                            if (orden.Linea != linea.Id)
                            {
                                return new object[] { false, IdiomaController.GetResourceName("ORDEN_NO_PERTENECE_LINEA") };
                            }

                            ordenId = orden.Id;
                            ordenesActualizar.Add(ordenId);
                            idparticion = orden.Id + ".1";
                            particionesActualizar.Add(idparticion);
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("NO_EXISTE_ORDEN") + " -> " + ex.Message + 
                                " -> " + ex.StackTrace, "TurnoController.editarRegistrosMaquina", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                            return new object[] { false, IdiomaController.GetResourceName("NO_EXISTE_ORDEN") };
                        }
                    }
                }

                float velNominalHoraLineaProducto = 0;

                if (clase == "PALETIZADORA")
                {
                    velNominalHoraLineaProducto = DAO_Turnos.GetVelocidadNominalPaleteraHoraLinea(linea, idparticion);
                }
                else if (clase == "ETIQUETADORA_PALETS")
                {
                    velNominalHoraLineaProducto = DAO_Turnos.GetVelocidadNominalEtiquetadoraHoraLinea(linea, idparticion);
                }
                else
                {
                    velNominalHoraLineaProducto = DAO_Turnos.GetVelocidadNominalHoraLinea(linea, idparticion);
                }

                //SUM total duracion de horas registros
                for (int i = 0; i < arrSel.Length; i++)
                {
                    horasTotales += (double)arrSel[i].duracion;
                }

                //Asignamos cantidades dependiendo el porcentaje de tiempo
                for (int i = 0; i < arrSel.Length; i++)
                {
                    DateTime iniConsolidado = (DateTime)arrSel[i].fechaInicioUTC;
                    DateTime finConsolidado = (DateTime)arrSel[i].fechaFinUTC;
                    string ordenAnterior = (string)arrSel[i].idOrden;
                    string particionAnterior = (string)arrSel[i].idParticion;
                    float duracion = (float)arrSel[i].duracion;
                    double porcentaje = duracion / horasTotales;
                    float tiempoPlanificado = (float)arrSel[i].tiempoPlanificado;
                    float velocidadNominal;
                    float velocidadNominalAux = (float)Math.Round(duracion * velNominalHoraLineaProducto * porcentajeProd);
                    int numMaquinas = 1;

                    if (clase == "LLENADORA") 
                    {
                        velocidadNominal = velocidadNominalAux;
                    } 
                    else if (clase == "PALETIZADORA" || clase == "ETIQUETADORA_PALETS") 
                    {
                        using (MESEntities contexto = new MESEntities())
                        {
                            numMaquinas = contexto.MaquinasLineas.AsNoTracking().Where(m => m.Clase == clase && m.NumLinea == linea.NumeroLinea).Count();
                        }
                        // En las líneas de doble salida como anteriormente se ha dividido entre el número de paleteras o etiquetadoras, ahora hay que
                        // multiplicar por ese mismo número para que la velocidad nominal se mantenga
                        velocidadNominal = esMultilinea ? (velocidadNominalAux * numMaquinas) : velocidadNominalAux;
                    }
                    else
                        velocidadNominal = 0;
                    
                    if ((int)arrSel[i].shcID <= 0)
                        velocidadNominal = 0;

                    int contConsolidado;
                    int rechConsolidado;

                    if (i < (arrSel.Length - 1))
                    {
                        contConsolidado = (int)Math.Round(totalSumarCont * porcentaje); //redondeo en caso de decimales
                        rechConsolidado = (int)Math.Round(totalSumarRech * porcentaje); //redondeo en caso de decimales
                    }
                    else
                    {
                        // con el redondeo nos pasamos ya del total que había sumar o no llegaremos, por lo tanto le sumamos el sobrante al último registro
                        contConsolidado = totalSumarCont - sumadoCont;
                        rechConsolidado = totalSumarRech - sumadoRech;
                    }

                    //EDIT CONSOLIDADO
                    editarRegistroConsolidado((string)arrSel[i].maquinaID, iniConsolidado, finConsolidado, clase, ordenId, idparticion, iniConsolidado,
                        finConsolidado, contConsolidado, (int)arrSel[i].contadorProdAuto, rechConsolidado, (int)arrSel[i].contadorRechAuto,
                        tiempoPlanificado, velocidadNominal, (int)arrSel[i].shcID, esMultilinea, true, false);

                    sumadoCont += contConsolidado;
                    sumadoRech += rechConsolidado;

                    //Guardamos la orden para actualizar si no existe ya en el array
                    if (ordenAnterior != "" && !ordenesActualizar.Contains(ordenAnterior))
                    {
                        ordenesActualizar.Add(ordenAnterior);
                    }

                    if (particionAnterior != "" && !particionesActualizar.Contains(particionAnterior))
                    {
                        particionesActualizar.Add(particionAnterior);
                    }

                    int idTipoTurno = (int)arrSel[i].idTipoTurno;

                    using (MESEntities contexto = new MESEntities())
                    {
                        MaquinasLineas maquina = contexto.MaquinasLineas.AsNoTracking().Where(m => m.Id == maquinaID).FirstOrDefault();
                        string maquinaDesc = maquina == null ? string.Empty : maquina.Descripcion;

                        TiposTurno tiposTurno = contexto.TiposTurno.AsNoTracking().Where(t => t.Id == idTipoTurno.ToString()).FirstOrDefault();
                        string turno = tiposTurno == null ? string.Empty : tiposTurno.Nombre;

                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "Registro asignado ", "Día: " + arrSel[i].fechaTurnoUTC + ", Turno: " + turno +
                            ", Id turno: " + arrSel[i].shcID + ", Línea: " + arrSel[i].numLinea + ", Máquina: " + maquinaDesc + ", Hora inicio: " +
                            arrSel[i].fechaInicioLocal + ", Hora fin: " + arrSel[i].fechaFinLocal + ", WO: " + idOrden + ", Contador: " +
                            contConsolidado + ", Rechazos:" + rechConsolidado, HttpContext.Current.User.Identity.Name);
                    }
                }
                
                DAO_Produccion daoProduccion = new DAO_Produccion();
                //actualizamos particiones
                particionesActualizar.ForEach(p =>
                {
                    actualizarParticion(p, numLinea);
                });

                //actualizamos la orden relacionada con los registros;
                ordenesActualizar.ForEach(ordstr =>
                {
                    Orden ord = daoProduccion.obtenerDatosProduccionOrden(ordstr);
                    DAO_Orden.ActualizarPropiedadesOrden(ord);
                });

                return new object[] { true, "" };
            }
            catch (OverflowException oex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, oex.Message + " -> " + oex.StackTrace, "TurnoController.editarRegistrosMaquina", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_LIMITE_CONTADOR_RECHAZOS"));
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, string.Join(", ", ordenesActualizar) + " -> " + ex.Message + " -> " + ex.StackTrace, 
                    "TurnoController.editarRegistrosMaquina", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_ASIGNAR"));
            }
        }

        [Route("api/turnos/{idLinea}/{desde}/{hasta}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_13_VisualizacionParosPerdidasTerminal, Funciones.ENV_PROD_EXE_43_VisualizacionPicos
            , Funciones.MER_PROD_GES_1_VisualizacionMermasPortal, Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO)]
        public IEnumerable<TurnoParo> GetTurnos(string idLinea, long desde, long hasta)
        {
            try
            {
                List<TurnoParo> turnos = new List<TurnoParo>();
                DateTime refDate = new DateTime(1970, 1, 1);
                DAO_Turnos daoTurnos = new DAO_Turnos();
                idLinea = idLinea.ToLower() == "null" ? null : idLinea;
                turnos = daoTurnos.ObtenerTurnos(idLinea, refDate.AddMilliseconds(desde), refDate.AddMilliseconds(hasta));

                return turnos;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTurnos", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }

        [Route("api/obtenerTurnosOrden/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_3_VisualizacionWOActivas, Funciones.ENV_PROD_EXE_33_VisualizacionHistoricoDeWo)]
        public List<Turno> ObtenerTurnosOrden(dynamic data)
        {
            try
            {
                int numLinea = Convert.ToInt32(data.numLinea.Value);
                string idParticion = data.idParticion.ToString();
                //DateTime fechaInicio = (DateTime)data.fechaInicio;
                //DateTime fechaFin = (DateTime)data.fechaFin;

                DAO_Turnos daoTurnos = new DAO_Turnos();
                return daoTurnos.ObtenerTurnosOrden(numLinea, idParticion);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.GetTurnos", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/resumenTurno/{idLinea}/{idTurnoAct}/{idTurnoAnt}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_13_VisualizacionParosPerdidasTerminal)]
        public ResumenTurno GetResumenTurno(int idLinea, int? idTurnoAct, int? idTurnoAnt)
        {
            try
            {
                ResumenTurno resumen = null;
                DAO_Turnos daoTurnos = new DAO_Turnos();
                resumen = daoTurnos.ObtenerResumenTurno(idLinea, idTurnoAct, idTurnoAnt);

                return resumen;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetResumenTurno", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }

        [Route("api/turnosFabrica/{idLinea}/{anyo}/{semana}")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_8_VisualizacionDeLosTurnosDeFabrica, Funciones.ENV_PROD_RES_7_GestionDeLosTurnosDeFabrica)]
        public List<SemanaTurno> GetTurnosFabrica(string idLinea, int anyo, int semana)
        {
            try
            {
                List<SemanaTurno> turnos;
                DAO_Turnos daoTurnos = new DAO_Turnos();
                idLinea = idLinea == "0" ? string.Empty : idLinea;
                turnos = daoTurnos.ObtenerTurnosFabrica(idLinea, anyo, semana);

                return turnos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetTurnosFabrica", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTurnosFabrica", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNOS"));
            }
        }

        [Route("api/tiposTurnosFabrica")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_RES_8_VisualizacionDeLosTurnosDeFabrica, Funciones.ENV_PROD_EXE_13_VisualizacionParosPerdidasTerminal,
                      Funciones.ENV_PROD_EXE_43_VisualizacionPicos, Funciones.ENV_PROD_EXE_57_GestionRelevoTurnoOficialesTerminal,
                      Funciones.ENV_PROD_EXE_57_VisualizacionRelevoTurnoOficialesTerminal, Funciones.ENV_PROD_EXE_59_GestionRelevoTurnoOficiales,
                      Funciones.ENV_PROD_EXE_59_VisualizacionRelevoTurnoOficiales)]
        public IEnumerable<TipoTurno> GetTiposTurnosFabrica()
        {
            try
            {
                List<TipoTurno> tiposTurnos;
                DAO_Turnos daoTurnos = new DAO_Turnos();
                tiposTurnos = daoTurnos.ObtenerTiposTurno();
                return tiposTurnos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetTurnosFabrica", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTiposTurnosFabrica", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TIPOS_DE_TURNOS"));
            }
        }

        [Route("api/tiposPlantillaTurnoFabrica")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_RES_8_VisualizacionDeLosTurnosDeFabrica)]
        public IEnumerable<TipoPlantillaTurno> GetTiposPlantillaTurnosFabrica()
        {
            try
            {
                List<TipoPlantillaTurno> tiposPlantillaTurnos;
                DAO_Turnos daoTurnos = new DAO_Turnos();
                tiposPlantillaTurnos = daoTurnos.ObtenerTiposPlantillaTurno();
                return tiposPlantillaTurnos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetTiposTurnosFabrica", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTiposPlantillaTurnosFabrica", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TIPOS_PLANTILLA"));
            }
        }

        //Plan Contingencia2
        [Route("api/setOperacionesSobreTurnos/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_7_GestionDeLosTurnosDeFabrica)]
        public async Task<object> setOperacionesSobreTurnos(dynamic[] excepciones)
        {
            List<string> results = new List<string>();
            for (int i = 0; i < excepciones.Length; i++)
            {
                dynamic tExcepcion = excepciones[i];
                string exception = await SetTurnoFabricaException(tExcepcion);
                if(exception != null)
                    results.Add(exception);
            }
            return new object[] { true, "" };
        }

        [Route("api/setTurnoFabricaException/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_7_GestionDeLosTurnosDeFabrica)]
        public async Task<string> SetTurnoFabricaException(dynamic turnoExcepcion)
        {
            string operacion = string.Empty;
            int idTurno = 0;

            try
            {
                operacion = turnoExcepcion.operacion.Value;
                string idLinea = turnoExcepcion.idLinea.Value;
                idTurno = Convert.ToInt32(turnoExcepcion.idTurno.Value);
                double day = Convert.ToDouble(turnoExcepcion.fechaTurno.Value);
                double start = Convert.ToDouble(turnoExcepcion.inicio.Value);
                double end = Convert.ToDouble(turnoExcepcion.fin.Value);
                string idTipoTurno = turnoExcepcion.tipoTurno.Value.ToString();
                bool turnoBreak = false;
                DateTime inicioBreak = new DateTime();
                DateTime finBreak = new DateTime();
                if (turnoExcepcion.wtBreak != null)
                {
                    turnoBreak = true;
                    inicioBreak = new DateTime(1970, 1, 1).AddSeconds(Convert.ToDouble(turnoExcepcion.wtBreak.inicioBreak.Value));
                    finBreak = new DateTime(1970, 1, 1).AddSeconds(Convert.ToDouble(turnoExcepcion.wtBreak.finBreak.Value));
                }

                DateTime fechaTurno = new DateTime(1970, 1, 1).AddSeconds(day);
                DateTime fechaInicio = new DateTime(1970, 1, 1).AddSeconds(start);
                DateTime fechaFin = new DateTime(1970, 1, 1).AddSeconds(end);

                //IsDaylightSavingTime si es true estamos en verano
                if (!TimeZoneInfo.Local.IsDaylightSavingTime(fechaInicio))
                {
                    fechaInicio = fechaInicio.AddHours(1);
                    fechaTurno = fechaInicio.Date;
                    if (turnoBreak)
                    {
                        inicioBreak = inicioBreak.AddHours(1);
                    }
                }

                if (!TimeZoneInfo.Local.IsDaylightSavingTime(fechaFin))
                {
                    fechaFin = fechaFin.AddHours(1);
                    if (turnoBreak)
                    {
                        finBreak = finBreak.AddHours(1);
                    }
                }

                ReturnValue result = new ReturnValue();
                string _mensajeOperacion = "";
                switch (operacion)
                {
                    case "ADD":
                        TiposTurno tipoTurno = DAO_Turnos.GetTipoTurnoByType(Convert.ToInt32(idTipoTurno));
                        DateTime plantillaTurno = tipoTurno.Fin.Value.AddMinutes(-Convert.ToDouble(tipoTurno.Bias));
                        TimeSpan HoraFinTeoricoTurno = new TimeSpan(plantillaTurno.Hour, plantillaTurno.Minute, plantillaTurno.Second);
                        //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format("Creación turno,  linea: {0}, fechaTurno: {1}, fechaInicio: {2}, fechafin: {3}, tipoTurno: {4}", idLinea, fechaTurno.ToString(), fechaInicio.ToLocalTime().ToString(), fechaFin.ToLocalTime().ToString(), tipoTurno.Nombre), HttpContext.Current.User.Identity.Name);
                        result = CalendarioBread.insertarTurno(fechaTurno, fechaInicio, fechaFin, idTipoTurno, idLinea, HoraFinTeoricoTurno, tipoTurno.Nombre, out idTurno);
                        if (result.succeeded)
                        {
                            DAO_Turnos.ActualizarFechaBiasTurno(fechaTurno, fechaInicio, fechaInicio, idTurno);
                        }
                        //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", result.succeeded ? string.Format("Creación turno correcta, id:{0}", idTurno) : "Error en la creación del turno", HttpContext.Current.User.Identity.Name);
                        _mensajeOperacion = IdiomaController.GetResourceName("CREACION_TURNO");
                        if (result.succeeded && turnoBreak)
                        {
                            //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format("Creación turno break, inicioBreak: {0}, finBreak: {1}", inicioBreak.ToLocalTime().ToString(), finBreak.ToLocalTime().ToString()), HttpContext.Current.User.Identity.Name);
                            result = CalendarioBread.insertarBreak(inicioBreak, finBreak, idTurno);

                            //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", result.succeeded ? "Creación turno break correcta" : "Error en la creación del break", HttpContext.Current.User.Identity.Name);

                        }
                        break;
                    case "UPDATE":
                        CalendarioBread.eliminarBreakPorIdTurno(idTurno);
                        //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format("Edición turno, idTurno:{0}, linea: {1}, fechaTurno: {2}, fechaInicio: {3}, fechafin: {4}, tipoTurno: {5}", idTurno, idLinea, fechaTurno.ToString(), fechaInicio.ToLocalTime().ToString(), fechaFin.ToLocalTime().ToString(), idTipoTurno), HttpContext.Current.User.Identity.Name);

                        result = CalendarioBread.editarTurno(idTurno, fechaTurno, fechaInicio, fechaFin);
                        if (result.succeeded)
                        {
                            DAO_Turnos.ActualizarFechaBiasTurno(fechaTurno, fechaInicio, fechaInicio, idTurno);
                        }
                        //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", result.succeeded ? string.Format("Edición turno correcta, id:{0}", idTurno) : "Error en la edición del turno", HttpContext.Current.User.Identity.Name);
                        _mensajeOperacion = IdiomaController.GetResourceName("EDICION_TURNO");
                        if (result.succeeded && turnoBreak)
                        {
                            //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format("Edición turno break, inicioBreak: {0}, finBreak: {1}", inicioBreak.ToLocalTime().ToString(), finBreak.ToLocalTime().ToString()), HttpContext.Current.User.Identity.Name);

                            result = CalendarioBread.insertarBreak(inicioBreak, finBreak, idTurno);
                            //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", result.succeeded ? "Edición turno break correcta" : "Error en la edición del break", HttpContext.Current.User.Identity.Name);

                        }
                        break;
                    case "DELETE":
                        //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format("Borrado de turno, idTurno:{0}, linea: {1}, fechaTurno: {2}, tipoTurno: {3}", idTurno, idLinea, fechaTurno.ToString(), idTipoTurno), HttpContext.Current.User.Identity.Name);
                        _mensajeOperacion = IdiomaController.GetResourceName("BORRADO_TURNO");
                        result = CalendarioBread.eliminarBreakPorIdTurno(idTurno);
                        result = CalendarioBread.borrarTurno(idTurno);
                        //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetTurnoFabrica", result.succeeded ? string.Format("Borrado turno correcta, id:{0}", idTurno) : "Error en el borrado del turno", HttpContext.Current.User.Identity.Name);

                        break;
                }

                if (result.succeeded)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format(_mensajeOperacion + ". " + IdiomaController.GetResourceName("ID_TURNO") +
                        ":{0}, " + IdiomaController.GetResourceName("LINEA") + ": {1}, " + IdiomaController.GetResourceName("FECHA_TURNO") + ": {2}, " + IdiomaController.GetResourceName("FECHA_INICIO") +
                        ": {3}, " + IdiomaController.GetResourceName("FECHA_FIN") + ": {4}, " + IdiomaController.GetResourceName("TIPO_TURNO") + ": {5}", idTurno, idLinea, fechaTurno.ToString(),
                        fechaInicio.ToLocalTime().ToString(), fechaFin.ToLocalTime().ToString(), idTipoTurno), HttpContext.Current.User.Identity.Name);

                    if (idTipoTurno.Equals("3") && fechaInicio.ToString("tt", CultureInfo.InvariantCulture).Equals("AM"))
                    {
                        DateTime fecha = fechaTurno.AddDays(-1);
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format("Turno de noche con horas sólo despues de la medianoche, actualizamos fecha turno: {0}", fecha.ToString()), HttpContext.Current.User.Identity.Name);
                        DAO_Turnos.ActualizaFechaTurno(fecha, idTurno);
                        fechaTurno = fecha;
                    }

                    int numLinea = PlantaRT.planta.lineas.Where(l => l.id == idLinea).Select(l => l.numLinea).First();

                    //Plan contingencia v2 si hemos creado / editado el turno revisaremos todos los consolidados para editar sus registros.
                    //solo actualizamos si es un turno pasado
                    //Si la operacion es DELETE borramos el consolidado de turno y desplanificamos los registros horarios.

                    using (MESEntities context = new MESEntities())
                    {
                        if (DateTime.UtcNow > fechaFin)
                        {
                            TiposTurno tipoTurno = context.TiposTurno.AsNoTracking().Where(i => i.Id == idTipoTurno).First();
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "Turno replanificado", "Día: " + fechaTurno + ", Turno: " + tipoTurno.Nombre + ", Id turno: " + idTurno + ", Línea: " + numLinea, HttpContext.Current.User.Identity.Name);

                            int numIdTipoTurno = int.Parse(idTipoTurno);
                            if (operacion == "DELETE")
                            {
                                await borrarTurno(numIdTipoTurno, numLinea, fechaTurno, idTurno);
                            }
                            else
                            {
                                float oeeCritico = (float)context.ParametrosPlanta_Admin.AsNoTracking().Where(p => p.IdLinea.Value == numLinea && p.IdParametro == 13).Select(p => p.VALOR_FLOAT).First();
                                float oeeObjetivo = (float)context.ParametrosPlanta_Admin.AsNoTracking().Where(p => p.IdLinea.Value == numLinea && p.IdParametro == 12).Select(p => p.VALOR_FLOAT).First();

                                string lineaPath = context.Lineas.AsNoTracking().Where(l => l.NumeroLinea == numLinea).Select(l => l.Id).First();
                                //obtenemos la fecha de Inicio y fin del turno porque los que vienen del DTO_ProduccionTurno son el Inicio y Fin del shc

                                DateTime inicioTurnoUTC = fechaTurno.Add(tipoTurno.Inicio.TimeOfDay).AddMinutes((double)-tipoTurno.Bias).ToUniversalTime();
                                DateTime finTurnoUTC = fechaTurno.Add(((DateTime)tipoTurno.Fin).TimeOfDay).AddMinutes((double)-tipoTurno.Bias).ToUniversalTime();
                                //El turno de NOCHE tiene un fallo en la confiugracion del SHC, el fin del turno no termina al día siguiente, para corregirlo se añade un día en caso de turno NOCHE
                                if (tipoTurno.Id == "3")
                                {
                                    finTurnoUTC = finTurnoUTC.AddDays(1);
                                }
                                //obtenemos la fecha de Inicio y fin del turno porque los que vienen del DTO_ProduccionTurno son el Inicio y Fin del shc
                                //bool encontrado = ContingenciaBread.rePlanificarRegistroConsolidadoTurno(fechaTurno, lineaPath, numIdTipoTurno, idTurno);
                                DTO_ConsolidadoTurnos dto = Mapper_ConsolidadoTurnos.MapperDatosToReplanificarDTO(fechaTurno, lineaPath, numIdTipoTurno, idTurno);
                                bool encontrado = await _iDAOTurnos.ActualizarIdTurno(dto);

                                if (!encontrado)
                                {
                                    int tiempoVaciadoLinea = DAO_Turnos.GetTiempoVaciadoLineaByTurno(0, numLinea);
                                    //ContingenciaBread.crearConsolidadoTurno(fechaTurno, lineaPath, numIdTipoTurno, inicioTurnoUTC, finTurnoUTC, idTurno, oeeCritico, oeeObjetivo, tiempoVaciadoLinea);
                                    DTO_ConsolidadoTurnos dtoCrear = Mapper_ConsolidadoTurnos.MapperDatosToCrearDTO(fechaTurno, lineaPath, numIdTipoTurno, inicioTurnoUTC, finTurnoUTC, idTurno, oeeCritico, oeeObjetivo, tiempoVaciadoLinea);
                                    await _iDAOTurnos.CrearConsolidadoTurno(dtoCrear);
                                }

                                dto.InicioTurno = inicioTurnoUTC;
                                dto.FinTurno = finTurnoUTC;

                                await RellenarRegistrosTurno(dto, numLinea);
                            }
                        }
                    }

                    return string.Empty;
                }
                else
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_ASIGNANDO_CALENDARIO") + " (" + operacion + ") - " + result.message, "TurnosController.SetTurnoFabricaException", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    throw new Exception(string.Format("{0}, turno: {1} - {2}", IdiomaController.GetResourceName("ERROR_ASIGNANDO_CALENDARIO"), idLinea, idTurno));
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, operacion + "- IdTurno = " + idTurno + ex.Message + " -> " + ex.StackTrace, "TurnosController.SetTurnoFabricaException", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_ASIGNANDO_CALENDARIO"));
            }
        }

        //[Route("api/diasFestivos/{anyo}")]
        [Route("api/diasFestivos")]
        [HttpGet]
        [ApiAuthorize(
            Funciones.ENV_PROD_RES_7_GestionDeLosTurnosDeFabrica,
            Funciones.ENV_PROD_RES_6_VisualizacionDelCalendarioDeFabrica)]
        //public IEnumerable<DiaFestivo> GetDiasFestivos(string anyo)
        public IEnumerable<DiaFestivo> GetDiasFestivos()
        {
            try
            {
                List<DiaFestivo> festivos = new List<DiaFestivo>();
                DAO_Turnos daoTurnos = new DAO_Turnos();
                //festivos = daoTurnos.ObtenerDiasFestivos(anyo);
                festivos = daoTurnos.ObtenerDiasFestivos();
                return festivos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetDiasFestivos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetDiasFestivos", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_DIAS"));
            }
        }

        [Route("api/diasFestivos/insertar")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_RES_13_GestionDelCalendarioDeFabrica)]
        public DiaFestivo InsertarDiaFestivo(DiaFestivo festivo)
        {
            try
            {

                if (festivo.id == 0)
                {
                    DAO_Turnos daoTurnos = new DAO_Turnos();
                    daoTurnos.InsertarFestivo(festivo);
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.insertarDiaFestivo", "Creado día festivo: " + festivo.id + " - " + festivo.inicio + " - " + festivo.fin, HttpContext.Current.User.Identity.Name);

                }
                return festivo;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.insertarDiaFestivo", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoControler.InsertarDiaFestivo", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_UN_FESTIVO"));
            }

        }

        [Route("api/diasFestivos/eliminar/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_RES_13_GestionDelCalendarioDeFabrica)]
        public void EliminarFestivo(int id)
        {
            try
            {
                DAO_Turnos daoTurnos = new DAO_Turnos();
                daoTurnos.EliminarFestivo(id);
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "AccionesMejoraController.EliminarFestivo", "Eliminado festivo: id: " + id, HttpContext.Current.User.Identity.Name);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AccionesMejoraController.EliminarFestivo", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoControler.EliminarFestivo", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_FESTIVO_2"));
            }


        }


        [Route("api/turnosLineaDia/{idLinea}/{fecha}")]
        [HttpGet]
        public List<Turno> GetTurnosLineaDia(string idLinea, double fecha)
        {

            try
            {
                List<Turno> turnos = new List<Turno>();
                DAO_Turnos daoTurnos = new DAO_Turnos();
                DateTime dateRef = new DateTime(1970, 1, 1);
                turnos = daoTurnos.ObtenerTurnosLineaDia(idLinea, dateRef.AddMilliseconds(fecha));
                return turnos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetTurnos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTurnosLineaDia", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }

        [Route("api/semanas/{anyo}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DIS_3_VisualizacionAnalisisSPI, Funciones.ENV_PROD_INF_VisualizacionInformes,
                      Funciones.ENV_PROD_RES_8_VisualizacionDeLosTurnosDeFabrica, Funciones.LOG_PROD_SCH_2_VisualizacionAdherenciaVolumen)]
        public List<Semana> ObtenerSemanas(int anyo)
        {

            try
            {

                List<Semana> semanas = new List<Semana>();
                DAO_Turnos daoTurnos = new DAO_Turnos();
                semanas = daoTurnos.ObtenerSemanas(anyo);
                return semanas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.ObtenerSemanas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.ObtenerSemanas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_SEMANAS"));
            }
        }

        [Route("api/turnocercano/{idLinea}/{fecha}/{idTipoTurno}/{mayormenor}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_INF_VisualizacionInformes)]
        public Turno GetTurnoCercano(string idLinea, double fecha, int idTipoTurno, int mayorMenor)
        {

            try
            {

                Turno turno = null;
                DAO_Turnos daoTurnos = new DAO_Turnos();
                DateTime dateRef = new DateTime(1970, 1, 1);
                turno = daoTurnos.ObtenerTurnoCercano(idLinea, dateRef.AddMilliseconds(fecha), idTipoTurno, mayorMenor);
                return turno;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetTurnoCercano", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTurnoCercano", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNO"));
            }
        }

        [Route("api/turnoSiguiente/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_13_VisualizacionParosPerdidasTerminal, Funciones.ENV_PROD_EXE_43_VisualizacionPicos)]
        public Turnos ObtenerTurnoSiguiente(dynamic data)
        {
            try
            {
                DAO_Turnos daoTurnos = new DAO_Turnos();
                return daoTurnos.ObtenerTurnoSiguiente(data);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [Route("api/turnosActual/{idLinea}")]
        [HttpGet]
        public Turno GetTurnoActual(string idLinea)
        {
            try
            {
                List<Turno> listTurnos = PlantaRT.planta.turnoActual;

                return listTurnos.Where(p => p.linea.id == idLinea).FirstOrDefault();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.GetTurnos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTurnoActual", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }

        [Route("api/obtenerTurnoSegunFecha/{fechaIni}/{idLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_32_GestionOrdenesArranque, Funciones.ENV_PROD_EXE_44_GestionOrdenesCambio, Funciones.ENV_PROD_EXE_40_GestionParosPerdidasLlenadora)]
        public string obtenerTurnoSegunFecha(int fechaIni, int idLinea)
        {
            try
            {
                string _result = DAO_Turnos.obtenerTurnoSegunFecha(fechaIni, idLinea);

                if (_result == "Turno no encontrado")
                {
                    return IdiomaController.GetResourceName("TURNO_NO_ENCONTRADO");
                }

                return IdiomaController.GetResourceName("TURNO" + _result);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.obtenerTurnoSegunFecha", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.obtenerTurnoSegunFecha", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_TURNO"));
            }
        }

        [Route("api/turnos/obtenerLimitesOEETurno/{numLinea}/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<dynamic> obtenerLimitesOEETurno(int numLinea, int idTurno)
        {
            try
            {
                dynamic limitesTurno = await _iDAOTurnos.ObtenerLimitesOEETurno(idTurno);

                if (limitesTurno == null)
                {
                    limitesTurno = DAO_Turnos.ObtenerOEELimitesTurnoLinea(numLinea);
                }

                return limitesTurno;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.obtenerLimitesOEETurno", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER_LIMITES"));
            }
        }

        [Route("api/SetPlantillaFabrica/{idLinea}/{numeroSemana}/{anno}/{tipoPlantilla}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_RES_7_GestionDeLosTurnosDeFabrica)]
        public bool SetPlantillaFabrica(string idLinea, int numeroSemana, int anno, int tipoPlantilla)
        {
            bool result = true;
            try
            {
                List<dynamic> lstPlantilla = DAO_Turnos.ObtenerTurnosPlantilla(anno, numeroSemana, tipoPlantilla);
                if (lstPlantilla != null)
                {
                    dynamic semana = DAO_Turnos.ObtenerSemanaTurno(numeroSemana, anno);
                    DAO_Turnos.DeleteTurnosPlantillas(semana.Inicio, semana.Fin, idLinea);
                }

                foreach (dynamic item in lstPlantilla)
                {
                    int idTurno;
                    result = DAO_Turnos.SetTurnoPlantilla(item.FechaTurno, ((DateTime)item.Inicio).ToUniversalTime(), ((DateTime)item.Fin).ToUniversalTime(), item.IdTipoTurno, idLinea, item.TemplateDay, out idTurno);
                    DateTime? inicioBreak = item.InicioBreak;
                    DateTime? finBreak = item.FinBreak;
                    if (result)
                    {
                        if (item.IdTipoTurno.Equals("3") && ((DateTime)item.Inicio).ToUniversalTime().ToString("tt", CultureInfo.InvariantCulture).Equals("AM"))
                        {
                            DateTime fecha = ((DateTime)item.FechaTurno).AddDays(-1);
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format("Turno de noche con horas sólo despues de la medianoche, actualizamos fecha turno: {0}", fecha.ToString()), HttpContext.Current.User.Identity.Name);
                            DAO_Turnos.ActualizaFechaTurno(fecha, idTurno);
                        }
                        if (inicioBreak.HasValue)
                        {

                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.SetPlantillaFabrica", string.Format("Creación turno break, inicioBreak: {0}, finBreak: {1}", inicioBreak.Value.ToString(), finBreak.Value.ToString()), HttpContext.Current.User.Identity.Name);
                            ReturnValue resultBreak = CalendarioBread.insertarBreak(((DateTime)inicioBreak.Value).ToUniversalTime(), ((DateTime)finBreak.Value).ToUniversalTime(), idTurno);
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.SetTurnoFabrica", resultBreak.succeeded ? "Creación turno break correcta" : "Error en la creación del break", HttpContext.Current.User.Identity.Name);

                        }
                    }
                }

                if (result)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.SetPlantillaFabrica",
                            string.Format(IdiomaController.GetResourceName("APLICACION_PLANTILLA_SEMANAL") + ". "
                            + IdiomaController.GetResourceName("LINEA") + ": {0}, "
                            + IdiomaController.GetResourceName("PLANTILLA") + ": {1}, "
                            + IdiomaController.GetResourceName("SEMANA") + ": {2}"
                        , idLinea, tipoPlantilla, numeroSemana), HttpContext.Current.User.Identity.Name);
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "TurnoController.SetPlantillaFabrica", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoControler.SetPlantillaFabrica", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ASIGNANDO_CALENDARIO"));
            }
            return result;
        }

        [Route("api/ObtenerDatosCurvaRendimiento")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_46_VisualizacionCurvaRendimientoTurno, Funciones.ENV_PROD_EXE_47_VisualizacionCurvaRendimientoTurnoTerminal)]
        public RendimientoTurno ObtenerDatosCurvaRendimiento(dynamic datos)
        {
            try
            {
                DAO_Turnos daoTurnos = new DAO_Turnos();
                string linea = datos.linea.ToString();
                int turno = Convert.ToInt32(datos.turno.Value);

                var rendimiento = daoTurnos.ObtenerDatosCurvaRendimiento(linea, turno);

                return rendimiento;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerDatosCurvaRendimiento", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/ObtenerConsolidadoTurnos/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos)]
        public async Task<List<DTO_ConsolidadoTurnos>> ObtenerConsolidadoTurnos(dynamic datos)
        {
            try
            {
                List<DTO_ConsolidadoTurnos> lista = await _iDAOTurnos.ObtenerConsolidadoTurnos(datos);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_TURNOS") + " - " + ex.Message, "TurnoController.ObtenerConsolidadoTurnos", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }

        [Route("api/ObtenerConsolidadoTurno/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos, 
            Funciones.ENV_PROD_EXE_57_GestionRelevoTurnoOficialesTerminal,
            Funciones.ENV_PROD_EXE_57_VisualizacionRelevoTurnoOficialesTerminal,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerConsolidadoTurno(string linea, DateTime fecha, int idTipoTurno)
        {
            try
            {
                var turno = await _iDAOTurnos.ObtenerConsolidadoTurnosPorLineaFechaTipoTurno(linea, fecha, idTipoTurno);

                return Json(turno);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_TURNOS") + " - " + ex.Message, "TurnoController.ObtenerConsolidadoTurno", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }

        [Route("api/MarcarTurnoParaRecalculoIC/")]
        [HttpPut]
        public async Task MarcarTurnoParaRecalculoIC(dynamic datos)
        {
            int idTurno = Convert.ToInt32(datos.idTurno.Value);
            int? numLinea = Convert.ToInt32(datos.numLinea.Value);
            DateTime? fechaTurno = Convert.ToDateTime(datos.fechaTurno.Value).ToLocalTime();
            int? idTipoTurno = Convert.ToInt32(datos.idTipoTurno.Value);

            await _iDAOTurnos.SetTurnoParaRecalculoICT(idTurno, fechaTurno, idTipoTurno, numLinea);
        }

        [Route("api/ObtenerDuracionTurno/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos, Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public async Task<float> ObtenerDuracionTurno(int idTurno)
        {
            try
            {
                float duracion = await _iDAOTurnos.ObtenerDuracionTurno(idTurno);

                return duracion;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_TURNOS") + " - " + ex.Message, "TurnoController.ObtenerConsolidadoTurnos", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/ActualizarOEEObjetivoCriticoTurno")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public async Task<bool> ActualizarOEEObjetivoCriticoTurno(DTO_ConsolidadoTurnos datos)
        {
            try
            {
                var correcto = await _iDAOTurnos.ActualizarOEEObjetivoCriticoTurno(datos);

                if (correcto)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.ActualizarOEEObjetivoCriticoTurno", "Datos del turno modificados - Día: " + datos.FechaTurno.ToLocalTime().ToShortDateString() +
                        ", Turno: " + datos.TipoTurno + ", Id Turno: " + datos.IdTurno + " OEE Critico: " + datos.OEECritico + " OEE Objetivo: " + datos.OEEObjetivo, HttpContext.Current.User.Identity.Name);
                }

                return correcto;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoController.ActualizarOEEObjetivoCriticoTurno", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        [Route("api/ActualizarConsolidadoTurno")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public async Task<bool> ActualizarConsolidadoTurno(DTO_ConsolidadoTurnos datos)
        {
            try
            {
                var correcto = await _iDAOTurnos.ActualizarConsolidadoTurno(datos);

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.ActualizarConsolidadoTurno", IdiomaController.GetResourceName("ACTUALIZANDO_OK") +
                    " los datos del turno " + datos.IdTurno, HttpContext.Current.User.Identity.Name);

                return correcto;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("NO_ACTUALIZADO_TURNO") + " " + datos.IdTurno + ". - " +
                    ex.Message + " -> " + ex.StackTrace, "TurnoController.ActualizarConsolidadoTurno", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        [Route("api/ActualizarICPorLineaGrupo")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public async Task<bool> ActualizarICPorLineaGrupo(DTO_ConsolidadoTurnos datos)
        {
            try
            {
                var correcto = await _iDAOTurnos.ActualizarICPorLineaGrupo(datos);
                if (correcto)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.ActualizarICPorLineaGrupo", IdiomaController.GetResourceName("ACTUALIZANDO_OK") +
                        " el IC de la línea " + datos.IdLinea + " y grupo " + datos.GrupoIC, HttpContext.Current.User.Identity.Name);
                }
                else
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.ActualizarICPorLineaGrupo", IdiomaController.GetResourceName("NO_CALCULO_IC") +
                        " de la línea " + datos.IdLinea + " y grupo " + datos.GrupoIC, HttpContext.Current.User.Identity.Name);
                }

                return correcto;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_ACTUALIZAR_IC") + " de la línea " + datos.IdLinea +
                    " y grupo " + datos.GrupoIC + ". - " + ex.Message + " -> " + ex.StackTrace, "TurnoController.ActualizarICPorLineaGrupo", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        [Route("api/turnos/ObtenerSemaforoTurno/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerSemaforoTurno(int idTurno)
        {
            try
            {
                string result = await _iDAOTurnos.ObtenerSemaforoTurno(idTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerSemaforoTurno", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_SEMAFORO_TURNO"));
            }
        }

        [Route("api/turnos/ObtenerSemaforoArranqueWOTurno/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerSemaforoArranqueWOTurno(int idTurno)
        {
            try
            {
                string result = await _iDAOTurnos.ObtenerSemaforoArranqueWOTurno(idTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerSemaforoTurno", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_SEMAFORO_ARRANQUE_WO_TURNO"));
            }
        }

        [Route("api/turnos/ObtenerSemaforoFinalizacionWOTurno/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerSemaforoFinalizacionWOTurno(int idTurno)
        {
            try
            {
                string result = await _iDAOTurnos.ObtenerSemaforoFinalizacionWOTurno(idTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerSemaforoTurno", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_SEMAFORO_FINALIZACION_WO_TURNO"));
            }
        }

        [Route("api/turnos/ComentarioTurno/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerComentarioTurno(int idTurno)
        {
            try
            {
                string result = await _iDAOTurnos.ObtenerComentarioTurno(idTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerComentarioTurno", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_COMENTARIO_TURNO"));
            }
        }

        [Route("api/ObtenerFormulariosCalidadPorTurno/")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos, 
            Funciones.ENV_PROD_PC_2_Gestion_turnos,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<List<DTO_Forms>> ObtenerFormulariosCalidadPorTurno(dynamic datos)
        {
            try
            {
                List<DTO_Forms> lista = await _iDAOTurnos.ObtenerFormulariosCalidadPorTurno(datos);

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerFormulariosCalidadPorTurno", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/turnos/ComentarioTurno")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_PC_2_Gestion_turnos)]
        public async Task<bool> ActualizarComentarioTurno([FromBody] DTO_ConsolidadoTurnos datos)
        {
            try
            {
                var correcto = await _iDAOTurnos.ActualizarComentarioTurno(datos);

                if (correcto)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.ActualizarComentarioTurno", "Nota de Turno modificada - Día: " + datos.InicioTurnoLocal.ToShortDateString() +
                        ", Turno: " + datos.TipoTurno + ", Id Turno: " + datos.IdTurno + " Nota: " + datos.Comentario, HttpContext.Current.User.Identity.Name);
                }

                return correcto;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoController.ActualizarComentarioTurno", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        [Route("api/turnos/TurnoAnterior")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos)]
        public async Task<IHttpActionResult> ObtenerTurnoAnterior(int idTurnoActual)
        {
            try
            {
                var idTurno = await _iDAOTurnos.ObtenerIdTurnoAnterior(idTurnoActual);

                return Json(idTurno);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerTurnoAnterior", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNO_ANTERIOR"));
            }
        }

        [Route("api/turnos/TurnoAnteriorFechaLinea")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos)]
        public async Task<IHttpActionResult> ObtenerTurnoAnteriorFechaLinea(string idLinea, DateTime fecha)
        {
            try
            {
                var idTurno = await _iDAOTurnos.ObtenerIdTurnoAnteriorFechaLinea(idLinea, fecha);

                return Json(idTurno);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerTurnoAnteriorFechaLinea", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNO_ANTERIOR"));
            }
        }

        [Route("api/turnos/breaks")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_SCH_1_VisualizacionSecuenciadorWO, Funciones.ENV_PROD_PC_1_Visualizacion_turnos, Funciones.ENV_PROD_EXE_13_VisualizacionParosPerdidasTerminal, Funciones.ENV_PROD_EXE_43_VisualizacionPicos)]
        public async Task<IHttpActionResult> ObtenerTurnosConBreak(int? idTurno = null, string idLinea = null, DateTime? fechaActual = null, DateTime? fechaInicio = null, DateTime? fechaFin = null)
        {
            try
            {
                var resultado = await _iDAOTurnos.ObtenerTurnosConBreak(idTurno, idLinea, fechaActual, fechaInicio, fechaFin);

                return Json(resultado);
            }
            catch
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }

        [Route("api/turnos/breaksConsecutivo")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos, Funciones.ENV_PROD_EXE_13_VisualizacionParosPerdidasTerminal, Funciones.ENV_PROD_EXE_43_VisualizacionPicos)]
        public async Task<IHttpActionResult> ObtenerTurnoConBreakConsecutivo(bool anterior = true, int? idTurno = null, string idLinea = null, DateTime? fechaActual = null)
        {
            try
            {
                var resultado = await _iDAOTurnos.ObtenerTurnoConBreakConsecutivo(anterior, idTurno, idLinea, fechaActual);

                return Json(resultado);
            }
            catch
            {
                return BadRequest(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
        }

        [Route("api/ObtenerConsolidadoTurno/")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_PC_1_Visualizacion_turnos, Funciones.ENV_PROD_EXE_57_GestionRelevoTurnoOficialesTerminal,
                      Funciones.ENV_PROD_EXE_57_VisualizacionRelevoTurnoOficialesTerminal)]
        public async Task<IHttpActionResult> ObtenerConsolidadoTurnosPorIdTurno(int idTurno)
        {
            try
            {
                var turno = await _iDAOTurnos.ObtenerConsolidadoTurnosPorIdTurno(idTurno);

                return Json(turno);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_CONSOLIDADOS") + " - " + ex.Message,
                    "TurnoController.ObtenerConsolidadoTurnosPorIdTurno", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_CONSOLIDADOS"));
            }
        }

        [Route("api/tipoTurnoById/{id}")]
        [HttpGet]
        public TiposTurno GetTipoTurnoById(int id)
        {
            try
            {
                TiposTurno tipoTurno = DAO_Turnos.GetTipoTurnoByType(id);
                return tipoTurno;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoControler.GetTipoTurnoById", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TIPOS_TURNO"));
            }
        }

        [Route("api/ObtenerRelevoTurnoOficiales/")]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_57_GestionRelevoTurnoOficialesTerminal, Funciones.ENV_PROD_EXE_57_VisualizacionRelevoTurnoOficialesTerminal,
                      Funciones.ENV_PROD_EXE_59_GestionRelevoTurnoOficiales, Funciones.ENV_PROD_EXE_59_VisualizacionRelevoTurnoOficiales)]
        [HttpGet]
        public async Task<IHttpActionResult> ObtenerRelevoTurnoOficiales(int idConsolidadoTurno, string idZona)
        {
            try
            {
                var turno = await _iDAOTurnos.ObtenerRelevoTurnoOficiales(idConsolidadoTurno, idZona);

                return Json(turno);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_AL_OBTENER_RELEVO") + " - " + ex.Message,
                    "TurnoController.ObtenerRelevoTurnoOficiales", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return BadRequest(IdiomaController.GetResourceName("ERROR_AL_OBTENER_RELEVO"));
            }
        }

        [Route("api/ObtenerRelevosTurnosOficiales/")]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_59_GestionRelevoTurnoOficiales, Funciones.ENV_PROD_EXE_59_VisualizacionRelevoTurnoOficiales)]
        [HttpGet]
        public async Task<List<DTO_RelevoTurnoOficiales>> ObtenerRelevosTurnosOficiales(string idLinea, string idZona, DateTime fechaDesde, DateTime fechaHasta)
        {
            try
            {
                List<DTO_RelevoTurnoOficiales> resultado = await _iDAOTurnos.ObtenerRelevosTurnosOficiales(idLinea, idZona, fechaDesde, fechaHasta);

                return resultado;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerRelevosTurnosOficiales", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        [Route("api/ActualizarRelevoTurnoOficiales/")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_57_GestionRelevoTurnoOficialesTerminal, Funciones.ENV_PROD_EXE_59_GestionRelevoTurnoOficiales)]
        public async Task<IHttpActionResult> ActualizarRelevoTurnoOficiales(DTO_RelevoTurnoOficiales datos)
        {
            try
            {
                var res = await _iDAOTurnos.ActualizarRelevoTurnoOficiales(datos);

                if(res != "") //error
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_AL_ACTUALIZAR_RELEVO") + " - " + res,
                    "TurnoController.ActualizarRelevoTurnoOficiales", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                }
                else
                {
                    var linea = PlantaRT.planta.lineas.Find(l => l.id == datos.IdLinea);
                    var zona = linea.zonas.Find(z => z.id == datos.IdZona);
                    string turno = "Noche";
                    if(datos.IdTipoTurno == 1) { turno = "Mañana"; }
                    else if (datos.IdTipoTurno == 2) { turno = "Tarde"; }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.ActualizarRelevoTurnoOficiales", "Relevo Turno Oficiales Modificado; Linea: " + linea.numLinea + " - " + linea.descripcion + "; Zona: " + zona.descripcion + "; Fecha: " + datos.InicioTurno.ToShortDateString() +
                    "; Turno: " + turno + "; Notas: " + datos.Notas + "; Oficial: " + datos.Oficial, HttpContext.Current.User.Identity.Name);
                }

                return Json(res);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_AL_ACTUALIZAR_RELEVO") + " - " + ex.Message,
                    "TurnoController.ActualizarRelevoTurnoOficiales", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return BadRequest(IdiomaController.GetResourceName("ERROR_AL_ACTUALIZAR_RELEVO"));
            }
        }

        [Route("api/ActivarRelevoTurnoOficiales/")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_57_GestionRelevoTurnoOficialesTerminal, Funciones.ENV_PROD_EXE_59_GestionRelevoTurnoOficiales)]
        public async Task<IHttpActionResult> ActivarRelevoTurnoOficiales(DTO_RelevoTurnoOficiales datos)
        {
            try
            {
                var res = await _iDAOTurnos.ActivarRelevoTurnoOficiales(datos);

                return Json(res);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_AL_ACTIVAR_RELEVO") + " - " + ex.Message,
                    "TurnoController.ActivarRelevoTurnoOficiales", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return BadRequest(IdiomaController.GetResourceName("ERROR_AL_ACTIVAR_RELEVO"));
            }
        }

        [Route("api/turnos/OEETurno/{idTurno}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_11_VisualizacionParteTurno, 
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerOEETurno(int idTurno)
        {
            try
            {
                double result = await _iDAOTurnos.ObtenerOEETurno(idTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TurnoController.ObtenerOEETurno", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_OEE_TURNO"));
            }
        }
    }
}
