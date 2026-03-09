using BreadMES.Envasado;
using Clients.ApiClient.Contracts;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Alt;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using MSM.Models.Planta;
using MSM.RealTime;
using MSM.Utilidades;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using Siemens.SimaticIT.SHC.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Envasado
{

    /// <summary>
    /// Clase que define los métodos de acceso a los datos relativo a los turnos
    /// </summary>
    public class DAO_Turnos : IDAO_Turnos
    {
        private IApiClient _api;
        private string _urlForms;
        private string _urlUbicaciones;
        private string _urlTurno;
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();
        private string UriCalidad = ConfigurationManager.AppSettings["HostApiCalidad"].ToString();

        public DAO_Turnos()
        {

        }

        public DAO_Turnos(IApiClient api)
        {
            _api = api;
            _urlForms = string.Concat(UriCalidad, "api/forms/");
            _urlUbicaciones = string.Concat(UriCalidad, "api/ubicaciones/");
            _urlTurno = string.Concat(UriEnvasado, "api/turnos/");
        }

        /// <summary>
        /// Método que devuelve los turnos de una linea entre dos fechas
        /// </summary>
        /// <param name="idLinea">Código completo de la linea Ej: MSM.BURGOS.ENVASADO.B347</param>
        /// <param name="desde">fecha y hora inicial a partir de la cual se quiere obtener los turnos</param>
        /// <param name="hasta">fecha y hora final hasta la cual se quiere obtener los turnos</param>
        /// <returns>Listado de turnos</returns>
        public List<TurnoParo> ObtenerTurnos(string idLinea, DateTime desde, DateTime hasta)
        {

            List<TurnoParo> turnos = new List<TurnoParo>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTurnos]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@desde", desde);
            comando.Parameters.AddWithValue("@hasta", hasta);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    //Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                    turnos.Add(
                        new TurnoParo(
                            DataHelper.GetInt(dr, "Id"),
                            DataHelper.GetDate(dr, "Fecha"),
                            DataHelper.GetDate(dr, "InicioTurno"),
                            DataHelper.GetDate(dr, "FinTurno"),
                            new TipoTurno(int.Parse(DataHelper.GetString(dr, "IdTipoTurno") ?? "0"), DataHelper.GetString(dr, "Turno")),
                            (DataHelper.GetString(dr, "Turno") == null ? false : true)
                        )
                        {
                            idLinea = DataHelper.GetString(dr, "Linea")
                        });
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurnos", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return turnos;

        }

        /// <summary>
        /// Devuelve los turnos comprendidos entre la fecha de inicio y la fecha de fin de la wo
        /// </summary>
        /// <param name="idLinea"></param>
        /// <param name="fechaInicio"></param>
        /// <param name="fechaFin"></param>
        /// <returns>Lista de turnos</returns>
        public List<Turno> ObtenerTurnosOrden(int numLinea, string idParticion)//DateTime fechaInicio, DateTime fechaFin
        {
            List<Turno> turnos = new List<Turno>();
            var turnoOrdenes = new List<DTO.DTO_ProduccionTurnoOrdenes>();
            DAO_Orden daoOrden = new DAO_Orden();
            var linea = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea).id;

            turnoOrdenes = idParticion.Contains(".1") ? daoOrden.obtenerProduccionParticionTurno(numLinea, idParticion) : daoOrden.obtenerProduccionOrdenTurno(numLinea, idParticion);

            using (MESEntities contexto = new MESEntities())
            {
                foreach (var turnoOrden in turnoOrdenes)
                {
                    var idTipoTurno = turnoOrden.idTipoTurno.ToString();
                    var turnoEncontrado = contexto.Turnos.AsNoTracking().Where(t => t.Linea == linea && t.Fecha == turnoOrden.fechaTurnoUTC && t.IdTipoTurno == idTipoTurno).FirstOrDefault();

                    if (turnoEncontrado != null)
                    {
                        var turno = new Turno();
                        turno.idTurno = turnoEncontrado.Id;
                        turno.fecha = turnoEncontrado.Fecha;
                        turno.inicio = turnoEncontrado.InicioTurno.Value;
                        turno.fin = turnoEncontrado.FinTurno.Value;
                        turno.tipo = new TipoTurno(Convert.ToInt32(turnoEncontrado.IdTipoTurno), turnoEncontrado.Turno);
                        turnos.Add(turno);
                    }
                }
            }

            return turnos;
        }

        /// <summary>
        /// Método que devuelve los turnos de una linea entre dos fechas
        /// </summary>
        /// <param name="idLinea">Código completo de la linea Ej: MSM.BURGOS.ENVASADO.B347</param>
        /// <param name="desde">fecha y hora inicial a partir de la cual se quiere obtener los turnos</param>
        /// <param name="hasta">fecha y hora final hasta la cual se quiere obtener los turnos</param>
        /// <returns>Listado de turnos</returns>
        public List<Turno> ObtenerTurnosLineaDia(string idLinea, DateTime fecha)
        {

            List<Turno> turnos = new List<Turno>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTurnosLineaDia]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@fecha", fecha);

            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                    turnos.Add(
                        new Turno(
                             DataHelper.GetInt(dr, "Id"),
                            ref lin,
                            DataHelper.GetDate(dr, "Fecha"),
                            DataHelper.GetDate(dr, "InicioTurno"),
                            DataHelper.GetDate(dr, "FinTurno"),
                            new TipoTurno(int.Parse(DataHelper.GetString(dr, "IdTipoTurno") ?? "0"), DataHelper.GetString(dr, "Turno")),
                            (DataHelper.GetString(dr, "Turno") == null ? false : true)
                        ));
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurnosLineaDia", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return turnos;
        }

        /// <summary>
        /// Método que devuelve los turnos de una linea entre dos fechas
        /// </summary>
        /// <param name="idLinea">Código completo de la linea Ej: MSM.BURGOS.ENVASADO.B347</param>
        /// <param name="desde">fecha y hora inicial a partir de la cual se quiere obtener los turnos</param>
        /// <param name="hasta">fecha y hora final hasta la cual se quiere obtener los turnos</param>
        /// <returns>Listado de turnos</returns>
        public List<Turno> ObtenerTurnosMayoresFechaLinea(string idLinea, DateTime fecha)
        {

            List<Turno> turnos = new List<Turno>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTurnosMayoresFechaLinea]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@fecha", fecha);

            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                    turnos.Add(
                        new Turno(
                             DataHelper.GetInt(dr, "Id"),
                            ref lin,
                            DataHelper.GetDate(dr, "Fecha"),
                            DataHelper.GetDate(dr, "InicioTurno"),
                            DataHelper.GetDate(dr, "FinTurno"),
                            new TipoTurno(int.Parse(DataHelper.GetString(dr, "IdTipoTurno") ?? "0"), DataHelper.GetString(dr, "Turno")),
                            (DataHelper.GetString(dr, "Turno") == null ? false : true)
                        ));
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurnosMayoresFechaLinea", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return turnos;
        }

        /// <summary>
        /// Método que devuelve la información de un determinado turno
        /// </summary>
        /// <param name="idLinea">Código completo de la linea Ej: MSM.BURGOS.ENVASADO.B347</param>
        /// <param name="desde">Fecha hora de inicio del turno</param>
        /// <param name="hasta">Fecha y hora de fin del turno</param>
        /// <returns>Objeto con la información resumen de un turno</returns>
        public ResumenTurno ObtenerResumenTurno(int idLinea, int? idTurnoAct, int? idTurnoAnt)
        {

            ResumenTurno resumen = new ResumenTurno();
            resumen.ultimaHoraTurnoAnterior = new ResumenTurno();

            if (!idTurnoAct.HasValue && !idTurnoAnt.HasValue)
            {
                return resumen;
            }

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerResumenTurno]", conexion);
            //comando.Parameters.AddWithValue("@desde", desde);
            //comando.Parameters.AddWithValue("@hasta", hasta);
            comando.CommandType = CommandType.StoredProcedure;
            conexion.Open();
            try
            {
                if (idTurnoAct.HasValue)
                {
                    comando.Parameters.AddWithValue("@idLinea", idLinea);
                    comando.Parameters.AddWithValue("@idTurno", idTurnoAct.Value);
                    dr = comando.ExecuteReader();
                    while (dr.Read())
                    {
                        resumen.totalParosNojustificados = DataHelper.GetInt(dr, "TotalParosNojustificados");
                        resumen.milisegundosParosNojustificados = DataHelper.GetLong(dr, "MilisegundosParosNojustificados"); //Convertimos los milisegundos en nano segundos
                        resumen.totalPerdidasNojustificadas = DataHelper.GetInt(dr, "TotalPerdidasNojustificadas");
                        resumen.milisegundosPerdidasNojustificadas = DataHelper.GetLong(dr, "MilisegundosPerdidasNojustificadas"); //Convertimos los milisegundos en nano segundos
                    }
                    dr.Close();
                }

                if (idTurnoAnt.HasValue)
                {
                    comando.Parameters.Clear();
                    comando.Parameters.AddWithValue("@idLinea", idLinea);
                    comando.Parameters.AddWithValue("@idTurno", idTurnoAnt.Value);
                    dr = comando.ExecuteReader();
                    while (dr.Read())
                    {
                        resumen.ultimaHoraTurnoAnterior = new ResumenTurno();
                        resumen.ultimaHoraTurnoAnterior.totalParosNojustificados = DataHelper.GetInt(dr, "TotalParosNojustificados");
                        resumen.ultimaHoraTurnoAnterior.milisegundosParosNojustificados = DataHelper.GetLong(dr, "MilisegundosParosNojustificados"); //Convertimos los milisegundos en nano segundos
                        resumen.ultimaHoraTurnoAnterior.totalPerdidasNojustificadas = DataHelper.GetInt(dr, "TotalPerdidasNojustificadas");
                        resumen.ultimaHoraTurnoAnterior.milisegundosPerdidasNojustificadas = DataHelper.GetLong(dr, "MilisegundosPerdidasNojustificadas"); //Convertimos los milisegundos en nano segundos
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerResumenTurno", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return resumen;
        }

        /// <summary>
        /// Método que devuelve los turnos de Fabrica de una linea y un año.
        /// </summary>
        /// <param name="idLinea">Código completo de la linea Ej: MSM.BURGOS.ENVASADO.B347</param>
        /// <param name="anyo">Año Ej:2015</param>
        /// <returns>Listado de turnos de Fabrica</returns>
        public List<SemanaTurno> ObtenerTurnosFabrica(string idLinea, int anyo, int semana)
        {

            List<SemanaTurno> turnos = new List<SemanaTurno>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerSemanasTurnosFabrica]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@anyo", anyo);
            comando.Parameters.AddWithValue("@semana", semana);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Linea lin = new Linea();
                    lin.id = DataHelper.GetString(dr, "IdLinea");
                    lin.descripcion = DataHelper.GetString(dr, "Descripcion");
                    lin.numLineaDescripcion = DataHelper.GetString(dr, "NumeroLineaDescripcion");

                    turnos.Add(
                        new SemanaTurno(
                            ref lin,
                            DataHelper.GetInt(dr, "year"),
                            DataHelper.GetDate(dr, "PrimerDiaSemana"),
                            DataHelper.GetDate(dr, "Inicio"),
                            DataHelper.GetDate(dr, "Fin"),
                            DataHelper.GetInt(dr, "NumeroSemana"),
                            DataHelper.GetString(dr, "Turnos"),
                            DataHelper.GetString(dr, "Plantilla"))
                            );
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnosFabrica", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurnosFabrica", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return turnos;
        }

        public List<TipoTurno> ObtenerTiposTurno()
        {

            List<TipoTurno> tiposTurnos = new List<TipoTurno>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTiposTurno]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {

                    tiposTurnos.Add(
                        new TipoTurno(
                            int.Parse(DataHelper.GetString(dr, "id")),
                            DataHelper.GetString(dr, "nombre"),
                            DataHelper.GetDate(dr, "inicio"),
                            DataHelper.GetDate(dr, "fin")

                        ));
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTiposTurno", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTiposTurno", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TIPOS_DE"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return tiposTurnos;

        }

        public List<TipoPlantillaTurno> ObtenerTiposPlantillaTurno()
        {

            List<TipoPlantillaTurno> tiposPlantillaTurno = new List<TipoPlantillaTurno>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_Obtener_TiposPlantillaTurno]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {

                    tiposPlantillaTurno.Add(
                        new TipoPlantillaTurno()
                        {
                            pk = DataHelper.GetInt(dr, "pk"),
                            id = DataHelper.GetString(dr, "id"),
                            nombre = DataHelper.GetString(dr, "nombre")
                        });
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTiposPlantillaTurno", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTiposPlantillaTurno", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TIPOS_DE_PLANTILLAS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return tiposPlantillaTurno;

        }

        /// <summary>
        /// Método que devuelve los dias festivos de un año.
        /// </summary>
        /// <param name="anyo">Año Ej:2015</param>
        /// <returns>Listado de dias festivos</returns>
        //public List<DiaFestivo> ObtenerDiasFestivos(string anyo)
        public List<DiaFestivo> ObtenerDiasFestivos()
        {

            List<DiaFestivo> festivos = new List<DiaFestivo>();
            //SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            //SqlDataReader dr = null;
            //SqlCommand comando = new SqlCommand("[MES_ObtenerDiasFestivos]", conexion);
            ////comando.Parameters.AddWithValue("@anyo", anyo);
            //comando.CommandType = CommandType.StoredProcedure;
            //try
            //{
            //    conexion.Open();
            //    dr = comando.ExecuteReader();
            //    while (dr.Read())
            //    {
            //        festivos.Add(
            //            new DiaFestivo(
            //                DataHelper.GetInt(dr, "id"),
            //                DataHelper.GetDate(dr, "fecha"),
            //                DataHelper.GetString(dr, "descripcion"))
            //                );
            //    }

            try
            {
                foreach (Holiday festivo in CalendarioBread.ObtenerFestivos())
                {
                    festivos.Add(new DiaFestivo(festivo.PK, festivo.HolidayDate, festivo.Description));
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerDiasFestivos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerDiasFestivos", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_DIAS"));
            }
            finally
            {
                //if (dr != null && !dr.IsClosed) dr.Close();
                //if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return festivos;
        }

        public void InsertarFestivo(DiaFestivo festivo)
        {

            try
            {
                Holiday nuevoFestivo = new Holiday();
                nuevoFestivo.FactoryCalendarPK = this.ObtenerCalendarioId(ConfigurationManager.AppSettings["PlantaID"].Split('.')[1]);
                nuevoFestivo.BehaviourAfter = 2;
                nuevoFestivo.BehaviourBefore = 2;
                nuevoFestivo.HolidayDate = festivo.inicio;
                nuevoFestivo.HolidayStart = null;
                nuevoFestivo.HolidayEnd = null;//festivo.fin;
                nuevoFestivo.IsWorkingDay = true;
                nuevoFestivo.Description = festivo.descripcion;

                CalendarioBread.Insertar(nuevoFestivo);

                festivo.id = nuevoFestivo.PK;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.insertarFestivo", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.InsertarFestivo", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_FESTIVO"));
            }


        }

        public void EliminarFestivo(int idFestivo)
        {
            try
            {
                CalendarioBread.eliminar(idFestivo);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.eliminarFestivo", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.eliminarFestivo", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_FESTIVO_2"));
            }

        }

        internal int ObtenerCalendarioId(string planta)
        {
            int id = 0;
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerCalendarioId]", conexion);
            comando.Parameters.AddWithValue("@planta", planta);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    id = DataHelper.GetInt(dr, "id");
                    break;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerCalendarioId", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerCalendarioId", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ID"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }

            return id;
        }

        internal Turno ObtenerTurno(string idLinea, DateTime fechaTurno, int tipoTurno)
        {
            Turno turno = null;
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTurno]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@fechaTurno", fechaTurno.Date);
            comando.Parameters.AddWithValue("@tipoTurno", tipoTurno);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                    turno = new Turno(
                            DataHelper.GetInt(dr, "Id"),
                            ref lin,
                            DataHelper.GetDate(dr, "Fecha"),
                            DataHelper.GetDate(dr, "InicioTurno"),
                            DataHelper.GetDate(dr, "FinTurno"),
                            new TipoTurno(int.Parse(DataHelper.GetString(dr, "IdTipoTurno") ?? "0"), DataHelper.GetString(dr, "Turno")),
                            (DataHelper.GetString(dr, "Turno") == null ? false : true));
                    break;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurno", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TURNOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return turno;
        }

        public List<Semana> ObtenerSemanas(int anyo)
        {

            List<Semana> semanas = new List<Semana>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerSemanasAnyo]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("anyo", anyo);
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {

                    semanas.Add(
                        new Semana(
                            anyo,
                            DataHelper.GetInt(dr, "SEMANA"),
                            DataHelper.GetDate(dr, "INICIO"),
                            DataHelper.GetDate(dr, "FIN")
                        ));
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerSemanas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerSemanas", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_SEMANAS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return semanas;

        }

        //Añadido para Plan Contingencia
        public List<DTO.DTO_ProduccionTurnoOrdenes> ObtenerProduccionTurnoOrdenes(int numLinea, DateTime fechaTurnoUTC, int idTipoTurno)
        {

            List<DTO.DTO_ProduccionTurnoOrdenes> turnoOrdenes = new List<DTO.DTO_ProduccionTurnoOrdenes>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerDatosProduccionTurnoOrden]", conexion);
            comando.CommandTimeout = 300;
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("numLinea", numLinea);
            comando.Parameters.AddWithValue("fechaTurno", fechaTurnoUTC);
            comando.Parameters.AddWithValue("tipoTurno", idTipoTurno);
            // comando.Parameters.AddWithValue("biasTurno", workDateBias);
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {

                    turnoOrdenes.Add(new DTO.DTO_ProduccionTurnoOrdenes()
                    {
                        numLinea = numLinea,
                        fechaTurnoUTC = DataHelper.GetDate(dr, "DIA_TURNO"),
                        idTipoTurno = DataHelper.GetInt(dr, "TIPO_TURNO"),
                        idOrden = DataHelper.GetString(dr, "ID_ORDEN"),
                        idProducto = DataHelper.GetString(dr, "ID_PRODUCTO"),
                        descriptProducto = DataHelper.GetString(dr, "DESCRIP_PROD"),
                        fechaInicioUTC = DataHelper.GetDate(dr, "FECHA_INICIO"),
                        fechaFinUTC = DataHelper.GetDate(dr, "FECHA_FIN"),

                        idSHC_MAX = DataHelper.GetInt(dr, "SHC_MAX"),
                        idSHC_MIN = DataHelper.GetInt(dr, "SHC_MIN"),
                        prodDesPaletizadora = DataHelper.GetInt(dr, "PROD_DESPALETIZADORA"),
                        prodLlenadora = DataHelper.GetInt(dr, "PROD_LLENADORA"),
                        prodEmpaquetadora = DataHelper.GetInt(dr, "PROD_EMPAQUETADORA"),
                        prodEncajonadora = DataHelper.GetInt(dr, "PROD_ENCAJONADORA"),
                        prodPaletizadora = DataHelper.GetInt(dr, "PROD_PALETIZADORA"),
                        prodEtiquetadoraPalets = DataHelper.GetInt(dr, "PROD_ETIQUETADORA_PALETS"),
                        rechClasificador = DataHelper.GetInt(dr, "RECH_CLASIFICADOR"),
                        rechInspectorBotellasVacias = DataHelper.GetInt(dr, "RECH_INSPECTOR_BOTELLAS_VACIAS"),
                        rechLLenadora = DataHelper.GetInt(dr, "RECH_LLENADORA"),
                        rechInspectorSalidaLlenadora = DataHelper.GetInt(dr, "RECH_INSPECTOR_SALIDA_LLENADORA"),
                        rechInspectorBotellasLLenas = DataHelper.GetInt(dr, "RECH_INSPECTOR_BOTELLAS_LLENAS"),
                        rechBascula = DataHelper.GetInt(dr, "RECH_BASCULA"),

                        envasesTeoricos = DataHelper.GetDouble(dr, "ENVASES_TEORICOS")

                    });
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerProduccionTurnoOrdenes", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerProduccionTurnoOrdenes", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CONSOLOIDADOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return turnoOrdenes;

        }
        //Añadido para Plan Contingencia
        public List<object> ObtenerProduccionTurnoMaquina(string maquinaID, DateTime fechaTurnoUTC, int idTipoTurno)
        {
            List<Object> consolidadosMaqu = new List<Object>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerDatosProduccionTurnoMaquina]", conexion);
            comando.CommandTimeout = 300;
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("maquinaID", maquinaID);
            comando.Parameters.AddWithValue("fechaTurno", fechaTurnoUTC);
            comando.Parameters.AddWithValue("tipoTurno", idTipoTurno);
            //comando.Parameters.AddWithValue("biasTurno", workDateBias);

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    consolidadosMaqu.Add(new
                    {
                        maquinaID,
                        fechaTurnoUTC,
                        idTipoTurno,
                        pk = DataHelper.GetString(dr, "PK"),
                        numLinea = DataHelper.GetInt(dr, "NUM_LINEA"),
                        clase = DataHelper.GetString(dr, "CLASE"),
                        idParticion = DataHelper.GetString(dr, "ID_PARTICION"),
                        idOrden = DataHelper.GetString(dr, "ID_ORDEN"),
                        idProducto = DataHelper.GetString(dr, "ID_PRODUCTO"),
                        descriptProducto = DataHelper.GetString(dr, "DESCRIP_PROD"),

                        fechaInicioUTC = DataHelper.GetDate(dr, "FECHA_INICIO"),
                        fechaFinUTC = DataHelper.GetDate(dr, "FECHA_FIN"),
                        duracion = DataHelper.GetDouble(dr, "DURACION"),
                        fechaInicioLocal = DataHelper.GetDate(dr, "FECHA_INICIO").ToLocalTime(),
                        fechaFinLocal = DataHelper.GetDate(dr, "FECHA_FIN").ToLocalTime(),
                        shcID = DataHelper.GetInt(dr, "SHC_WORK_SCHED_DAY_PK"),

                        contadorProd = DataHelper.GetInt(dr, "CONTADOR_PRODUCCION"),
                        contadorProdAuto = DataHelper.GetInt(dr, "CONTADOR_PRODUCCION_AUTO"),
                        contadorRech = DataHelper.GetInt(dr, "CONTADOR_RECHAZOS"),
                        contadorRechAuto = DataHelper.GetInt(dr, "CONTADOR_RECHAZOS_AUTO"),

                        tiempoPlanificado = DataHelper.GetDouble(dr, "TIEMPO_PLANIFICADO"),
                        velocidadNominal = DataHelper.GetDouble(dr, "VELOCIDAD_NOMINAL")
                    });
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerProduccionTurnoMaquina", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerProduccionTurnoMaquina", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CONSOLIDADOS_TURNO") + ex.Message);
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return consolidadosMaqu;
        }

        //Añadido para Plan Contingencia
        public List<object> ObtenerParticionesTurno(int numLinea, DateTime fechaInicioUTC, DateTime fechaFinUTC)
        {
            List<Object> particionesTurno = new List<Object>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerParticionesActivas]", conexion);
            comando.CommandTimeout = 300;
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("numLinea", numLinea);
            comando.Parameters.AddWithValue("iniTurno", fechaInicioUTC);
            comando.Parameters.AddWithValue("finTurno", fechaFinUTC);

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    particionesTurno.Add(new
                    {
                        Id = DataHelper.GetString(dr, "Id"),
                        IdOrdenPadre = DataHelper.GetString(dr, "IdOrdenPadre"),
                        IdProducto = DataHelper.GetString(dr, "IdProducto"),
                        VelocidadNominal = DataHelper.GetDouble(dr, "VelocidadNominal"),
                    });
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerParticionesTurnos", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PARTICIONES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return particionesTurno;
        }

        public Turno ObtenerTurnoCercano(string idLinea, DateTime fechaTurno, int tipoTurno, int mayorMenor)
        {
            Turno turno = null;
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTurnoCercano]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@fechaTurno", fechaTurno.Date);
            comando.Parameters.AddWithValue("@tipoTurno", tipoTurno);
            comando.Parameters.AddWithValue("@mayorMenor", mayorMenor);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                    turno = new Turno(
                            DataHelper.GetInt(dr, "Id"),
                            ref lin,
                            DataHelper.GetDate(dr, "Fecha"),
                            DataHelper.GetDate(dr, "InicioTurno"),
                            DataHelper.GetDate(dr, "FinTurno"),
                            new TipoTurno(int.Parse(DataHelper.GetString(dr, "IdTipoTurno") ?? "0"), DataHelper.GetString(dr, "Turno")),
                            (DataHelper.GetString(dr, "Turno") == null ? false : true));
                    break;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnoCercano", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurnoCercano", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNO"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return turno;
        }

        public Turno ObtenerTurnoAnterior(string idLinea, DateTime inicioTurnoActual)
        {
            Turno turno = null;
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTurnoAnterior]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@inicioTurnoAct", inicioTurnoActual);

            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                    turno = new Turno(
                            DataHelper.GetInt(dr, "Id"),
                            ref lin,
                            DataHelper.GetDate(dr, "Fecha"),
                            DataHelper.GetDate(dr, "InicioTurno"),
                            DataHelper.GetDate(dr, "FinTurno"),
                            new TipoTurno(int.Parse(DataHelper.GetString(dr, "IdTipoTurno") ?? "0"), DataHelper.GetString(dr, "Turno")),
                            (DataHelper.GetString(dr, "Turno") == null ? false : true));
                    break;
                }

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurnoAnterior", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNO_ANTERIOR"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return turno;
        }

        public Turno ObtenerTurnoSiguiente(string idLinea, DateTime inicioTurnoActual)
        {
            Turno turno = null;
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTurnoSiguiente]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@inicioTurnoAct", inicioTurnoActual);

            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                    turno = new Turno(
                            DataHelper.GetInt(dr, "Id"),
                            ref lin,
                            DataHelper.GetDate(dr, "Fecha"),
                            DataHelper.GetDate(dr, "InicioTurno"),
                            DataHelper.GetDate(dr, "FinTurno"),
                            new TipoTurno(int.Parse(DataHelper.GetString(dr, "IdTipoTurno") ?? "0"), DataHelper.GetString(dr, "Turno")),
                            (DataHelper.GetString(dr, "Turno") == null ? false : true));
                    break;
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnoSiguiente", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurnoSiguiente", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNO_SIGUIENTE"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }
            return turno;
        }

        public Turnos ObtenerTurnoSiguiente(dynamic data)
        {
            string idLinea = data.idLinea.ToString();
            DateTime fechaTurno = ((DateTime)data.fechaTurno).ToLocalTime();
            string idTipoTurno = data.idTipoTurno.ToString();

            var turno = new Turnos();
            var diaTurno = fechaTurno.Date;

            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    var turnoSel = contexto.Turnos.AsNoTracking().Where(x => x.Linea == idLinea && x.Fecha == diaTurno && x.IdTipoTurno == idTipoTurno).FirstOrDefault();

                    if (turnoSel == null)
                    {
                        turno = contexto.Turnos.AsNoTracking().Where(x => x.Linea == idLinea && x.InicioTurno > fechaTurno && x.IdTipoTurno != "0").OrderBy(x => x.InicioTurno).FirstOrDefault();
                    }
                    else
                    {
                        turno = contexto.Turnos.AsNoTracking().Where(x => x.Linea == idLinea && x.InicioTurno > turnoSel.InicioTurno && x.IdTipoTurno != "0").OrderBy(x => x.InicioTurno).FirstOrDefault();
                    }
                }

                return turno;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNO_SIGUIENTE") + " - " + ex.Message, "DAO_Turnos.ObtenerTurnoSiguiente", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TURNO_SIGUIENTE"));
            }
        }

        internal static Hashtable getInicioTurnoNuloPorHora(DateTime fecha)
        {
            try
            {
                Hashtable htTurno = new Hashtable();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerInicioTurnoPorHora]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@fechaActual", fecha);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {

                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                DateTime fecInicio = DateTime.Parse(row["Inicio"].ToString()).ToLocalTime();
                                DateTime fecFin = DateTime.Parse(row["Fin"].ToString()).ToLocalTime();
                                htTurno.Add("Inicio", new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, fecInicio.Hour, fecInicio.Minute, fecInicio.Second));
                                htTurno.Add("Fin", new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, fecFin.Hour, fecFin.Minute, fecFin.Second));
                            }
                        }
                    }
                }

                return htTurno;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.getInicioTurnoNuloPorHora", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turno.getInicioTurnoNuloPorHora", "WEB-WO", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal static void ActualizaFechaTurno(DateTime fecha, int idTurno)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_SetFechaTurno]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@fecha", fecha);
                    command.Parameters.AddWithValue("@idTurno", idTurno);

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        connection.Open();
                        DataTable dt = new DataTable();
                        da.Fill(dt);
                        if (dt == null || dt.Rows.Count == 0)
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format("Fecha no actualizada para turno {0}", idTurno), HttpContext.Current.User.Identity.Name);
                        }

                        foreach (DataRow row in dt.Rows)
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TurnoController.SetTurnoFabrica", string.Format("Registros actualizados para turno {0} => fecha turno: {1} se actualiza a: {2}",
                                idTurno, row["work_date_old"] == DBNull.Value ? "VALOR_NULO" : Convert.ToDateTime(row["work_date_old"]).ToString(),
                                row["work_date_new"] == DBNull.Value ? "VALOR_NULO" : Convert.ToDateTime(row["work_date_new"]).ToString()), HttpContext.Current.User.Identity.Name);
                        }
                    }
                }
            }
        }

        internal static string obtenerTurnoSegunFecha(int fechaIni, int idLinea)
        {
            DateTime fecha = new DateTime(1970, 1, 1);
            fecha = fecha.AddSeconds(fechaIni);

            Turnos t = new Turnos();

            if (idLinea > 0)
            {
                using (MESEntities context = new MESEntities())
                {
                    Lineas l = context.Lineas.AsNoTracking().Where(e => e.NumeroLinea == idLinea).FirstOrDefault();
                    t = context.Turnos.AsNoTracking().Where(m => m.FinTurno > fecha && fecha >= m.InicioTurno && m.Linea.Equals(l.Id)).FirstOrDefault();
                }
            }
            else
            {
                using (MESEntities context = new MESEntities())
                {
                    t = context.Turnos.AsNoTracking().Where(m => m.FinTurno > fecha && fecha >= m.InicioTurno).FirstOrDefault();
                }
            }

            if (t != null)
                return t.IdTipoTurno;
            else
                return "Turno no encontrado";
        }

        public async Task<dynamic> ObtenerLimitesOEETurno(int idTurno)
        {
            try
            {
                DTO_ConsolidadoTurnos consolidadoTurno = await ObtenerConsolidadoTurnosPorIdTurno(idTurno);

                dynamic limitesTurno = new ExpandoObject();
                if (consolidadoTurno != null)
                {
                    limitesTurno.oeeObjetivo = consolidadoTurno.OEEObjetivo;
                    limitesTurno.oeeCritico = consolidadoTurno.OEECritico;
                }

                return limitesTurno;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerLimitesOEETurno", "WEB-WO", "Sistema");
                return null;
            }
        }

        internal static dynamic ObtenerOEELimitesTurnoLinea(int numLinea)
        {
            dynamic limitesTurno = null;
            Lineas linea = null;

            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    linea = contexto.Lineas.AsNoTracking().Where(l => l.NumeroLinea == numLinea).FirstOrDefault();
                }

                limitesTurno = new ExpandoObject();
                limitesTurno.oeeObjetivo = linea.OEEObjetivo.Value;
                limitesTurno.oeeCritico = linea.OEECritico.Value;

                return limitesTurno;
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-OEELimitesTurno línea " + numLinea, "Error: " + ex.Message, "Error");
                }
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerOEELimitesTurnoLinea", "WEB-WO", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal static TiposTurno GetTipoTurnoByType(int id)
        {
            using (MESEntities contexto = new MESEntities())
            {
                return contexto.TiposTurno.AsNoTracking().Where(tt => tt.Id == id.ToString()).FirstOrDefault();
            }
        }

        public DateTime? ObtenerFechaInicioTurnoPorLineaFecha(string linea, DateTime fecha)
        {
            using (MESEntities contexto = new MESEntities())
            {
                return contexto.Turnos.AsNoTracking().Where(t => t.Linea == linea && t.InicioTurno <= fecha && t.FinTurno >= fecha).Select(t => t.InicioTurno).FirstOrDefault();
            }
        }

        internal static bool GetParticionActivaEnTurnoActual(Orden ord, bool ordenActivaEnTurnoActual, Turno turno, bool logTriggers)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ParticionActivaEnTurno]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@IdTurno", turno.idTurno);
                    command.Parameters.AddWithValue("@ordenId", ord.id);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Bit);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        ordenActivaEnTurnoActual = returnParam.Value == DBNull.Value ? true : Convert.ToBoolean(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        if (logTriggers)
                        {
                            DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Partición activa en turno actual", "Error: " + ex.Message, "Error");
                        }

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.GetParticionActivaEnTurnoActual", "WEB-WO", "Sistema");
                        return true;
                    }
                }
            }
            return ordenActivaEnTurnoActual;
        }

        internal static int GetTiempoVaciadoLineaByTurno(int idTurno, int numLinea)
        {
            int tiempoVaciado = 0;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetTiempoVaciadoLinea]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idTurno", idTurno);
                    command.Parameters.AddWithValue("@numLinea", numLinea);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Int);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    command.CommandTimeout = 20;
                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        tiempoVaciado = returnParam.Value == DBNull.Value ? 0 : Convert.ToInt32(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        //DAO_Log.registrarLog(DateTime.Now, "DAO_Turno.GetTiempoVaciadoLineaByTurno", ex, "Sistema");
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.GetTiempoVaciadoLineaByTurno", "WEB-WO", "Sistema");
                    }
                }
            }

            return tiempoVaciado;
        }

        public async Task SetTurnoParaRecalculoICT(int idTurno, DateTime? fechaTurno = null, int? idTipoTurno = null, int? numLinea = null)
        {
            string linea = string.Empty;
            if (numLinea.HasValue)
            {
                linea = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea.Value).id;
            }

            await MarcarTurnoParaRecalculoIC(idTurno, fechaTurno, idTipoTurno, linea);
        }

        public async Task<bool> DesmarcarTurnoParaRecalculoICT(int idTurno, DateTime? fecha = null, int? idTipoTurno = null, string linea = null)
        {
            return await DesmarcarTurnoParaRecalculoIC(idTurno, fecha, idTipoTurno, linea);
        }

        internal static Turno ObtenerTurnoSHCPorFecha(string idLinea, DateTime fechaTurno)
        {
            try
            {
                Turno turno = null;

                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_ObtenerTurnoPorFecha]", conexion))
                    {
                        comando.Parameters.AddWithValue("@idLinea", idLinea);
                        comando.Parameters.AddWithValue("@fecha", fechaTurno);
                        comando.CommandType = CommandType.StoredProcedure;

                        using (SqlDataAdapter da = new SqlDataAdapter())
                        {
                            conexion.Open();
                            da.SelectCommand = comando;
                            DataSet ds = new DataSet();
                            da.Fill(ds);

                            if (ds != null && ds.Tables.Count > 0)
                            {
                                foreach (DataRow row in ds.Tables[0].Rows)
                                {
                                    turno = new Turno();
                                    turno.idTurno = Convert.ToInt32(row["Id"]);
                                    turno.linea = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                                    turno.fecha = Convert.ToDateTime(row["Fecha"]);
                                    turno.inicio = Convert.ToDateTime(row["InicioTurno"]);
                                    turno.fin = Convert.ToDateTime(row["FinTurno"]);
                                    turno.tipo = new TipoTurno() { id = Convert.ToInt32(row["IdTipoTurno"]), nombre = row["NombreTipoTurno"].ToString() };
                                }
                            }
                        }
                    }

                }
                return turno;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnoPorFecha", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurnoSHCPorFecha", "WEB-WO", "Sistema");
                throw ex;
            }
        }

        internal static List<dynamic> ObtenerTurnosPlantilla(int anno, int numeroSemana, int idPlantilla)
        {
            try
            {
                List<dynamic> lstTurnosPlantillas = new List<dynamic>();
                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_ObtenerPlantillaTurno]", conexion))
                    {
                        comando.Parameters.AddWithValue("@año", anno);
                        comando.Parameters.AddWithValue("@Semana", numeroSemana);
                        comando.Parameters.AddWithValue("@IdPlantilla", idPlantilla);
                        comando.CommandType = CommandType.StoredProcedure;

                        using (SqlDataAdapter da = new SqlDataAdapter())
                        {
                            conexion.Open();
                            da.SelectCommand = comando;
                            DataSet ds = new DataSet();
                            da.Fill(ds);

                            if (ds != null && ds.Tables.Count > 0)
                            {
                                foreach (DataRow row in ds.Tables[0].Rows)
                                {
                                    dynamic turno = new ExpandoObject();
                                    turno.TemplateDay = row["idTemplateDia"] == DBNull.Value ? string.Empty : row["idTemplateDia"].ToString();
                                    turno.FechaTurno = row["FechaTurnoSimatic"] == DBNull.Value ? DateTime.MinValue : ((DateTime)row["FechaTurnoSimatic"]);
                                    turno.Inicio = row["Inicio"] == DBNull.Value ? DateTime.MinValue : ((DateTime)row["Inicio"]);
                                    turno.Fin = row["Fin"] == DBNull.Value ? DateTime.MinValue : ((DateTime)row["Fin"]);
                                    turno.IdTipoTurno = row["TipoTurno"] == DBNull.Value ? string.Empty : row["TipoTurno"].ToString();
                                    turno.InicioBreak = row["break_start"] == DBNull.Value ? (DateTime?)null : ((DateTime)row["break_start"]);
                                    turno.FinBreak = row["break_end"] == DBNull.Value ? (DateTime?)null : ((DateTime)row["break_end"]);

                                    lstTurnosPlantillas.Add(turno);
                                }
                            }
                        }
                    }

                }
                return lstTurnosPlantillas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnosPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerTurnosPlantilla", "WEB-WO", "Sistema");
                throw ex;
            }
        }

        internal static bool SetTurnoPlantilla(DateTime workDate, DateTime startDate, DateTime endDate, string tipoTurno, string idLinea, string templateDay, out int idTurno)
        {
            bool ret = CalendarioBread.insertarTurnoPlantilla(workDate, startDate, endDate, tipoTurno, idLinea, templateDay, out idTurno);
            if (ret)
            {
                DAO_Turnos.ActualizarIdPlantillaTurno(idTurno, templateDay);
                DAO_Turnos.ActualizarFechaBiasTurno(workDate, startDate, endDate, idTurno);
            }
            return ret;
        }

        private static void ActualizarIdPlantillaTurno(int idTurno, string templateDay)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_UpdateIdPlantillaTurno]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idPlantilla", templateDay);
                    command.Parameters.AddWithValue("@IdTurno", idTurno);

                    connection.Open();
                    command.ExecuteNonQuery();
                }
            }
        }

        public static void ActualizarFechaBiasTurno(DateTime workDate, DateTime startDate, DateTime endDate, int idTurno)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_UpdateFechaBiasTurno]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@workDateBias", DiffDate(workDate));
                    command.Parameters.AddWithValue("@startDateBias", DiffDate(startDate));
                    command.Parameters.AddWithValue("endDateBias", DiffDate(endDate));
                    command.Parameters.AddWithValue("@idTurno", idTurno);

                    connection.Open();
                    command.ExecuteNonQuery();
                }
            }
        }

        private static short DiffDate(DateTime date)
        {
            DateTime _dateLocal = date.ToLocalTime();
            TimeSpan _diff = date - _dateLocal;
            return Convert.ToInt16(_diff.TotalMinutes);
        }

        internal static dynamic ObtenerSemanaTurno(int numeroSemana, int anyo)
        {
            try
            {
                dynamic semana = new ExpandoObject();
                List<dynamic> lstTurnosPlantillas = new List<dynamic>();
                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_ObtenerSemanaTurno]", conexion))
                    {
                        comando.Parameters.AddWithValue("@Semana", numeroSemana);
                        comando.Parameters.AddWithValue("@Anyo", anyo);
                        comando.CommandType = CommandType.StoredProcedure;

                        using (SqlDataAdapter da = new SqlDataAdapter())
                        {
                            conexion.Open();
                            da.SelectCommand = comando;
                            DataSet ds = new DataSet();
                            da.Fill(ds);

                            if (ds != null && ds.Tables.Count > 0)
                            {
                                foreach (DataRow row in ds.Tables[0].Rows)
                                {
                                    semana = new ExpandoObject();
                                    semana.Inicio = row["Inicio"] == DBNull.Value ? DateTime.MinValue : ((DateTime)row["Inicio"]);
                                    semana.Fin = row["Fin"] == DBNull.Value ? DateTime.MinValue : ((DateTime)row["Fin"]);
                                }
                            }
                        }
                    }

                }
                return semana;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Turnos.ObtenerTurnosPlantilla", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerSemanaTurno", "WEB-WO", "Sistema");
                throw ex;
            }
        }

        internal static void DeleteTurnosPlantillas(DateTime inicio, DateTime fin, string idLinea)
        {
            CalendarioBread.eliminarTurnosPlantilla(inicio, fin, idLinea);
        }

        public static float GetVelocidadNominalHoraLinea(Lineas linea, string particion)
        {
            int numLlenadoras = 1;
            Particiones particionModel = null;

            using (MESEntities contexto = new MESEntities())
            {
                numLlenadoras = contexto.MaquinasLineas.AsNoTracking().Where(m => m.Clase == "LLENADORA" && m.NumLinea == linea.NumeroLinea).Count();
                if (particion != "")
                    particionModel = contexto.Particiones.AsNoTracking().Where(p => p.Id == particion).FirstOrDefault();
            }

            float velNominalHoraLineaProducto = 0;
            if (particionModel != null)
            {
                velNominalHoraLineaProducto = (float)particionModel.VelocidadNominal;
            }
            else
            {
                //asignamos la velNominal maxima para la línea
                var listaParametrosLinea = DAO_Linea.obtenerParametrosLinea();
                velNominalHoraLineaProducto = listaParametrosLinea.Where(p => p.idLinea == linea.Id).Select(p => p.velocidadNominal).Max();
            }

            return velNominalHoraLineaProducto / numLlenadoras; //dividimos por el numero de llenadoras
        }

        public static float GetVelocidadNominalPaleteraHoraLinea(Lineas linea, string particion)
        {
            int numPaleteras = 1;
            Particiones particionModel = null;

            using (MESEntities contexto = new MESEntities())
            {
                numPaleteras = contexto.MaquinasLineas.AsNoTracking().Where(m => m.Clase == "PALETIZADORA" && m.NumLinea == linea.NumeroLinea).Count();
                if (particion != "")
                    particionModel = contexto.Particiones.AsNoTracking().Where(p => p.Id == particion).FirstOrDefault();
            }

            float velNominalHoraLineaProducto = 0;
            if (particionModel != null)
            {
                velNominalHoraLineaProducto = (float)particionModel.VelocidadNominal;
            }
            else
            {
                //asignamos la velNominal maxima para la línea
                var listaParametrosLinea = DAO_Linea.obtenerParametrosLinea();
                velNominalHoraLineaProducto = listaParametrosLinea.Where(p => p.idLinea == linea.Id).Select(p => p.velocidadNominal).Max();
            }

            return velNominalHoraLineaProducto / numPaleteras; //dividimos por el numero de llenadoras
        }

        public static float GetVelocidadNominalEtiquetadoraHoraLinea(Lineas linea, string particion)
        {
            int numEtiquetadoras = 1;
            Particiones particionModel = null;

            using (MESEntities contexto = new MESEntities())
            {
                numEtiquetadoras = contexto.MaquinasLineas.Where(m => m.Clase == "ETIQUETADORA_PALETS" && m.NumLinea == linea.NumeroLinea).Count();
                if (particion != "")
                    particionModel = contexto.Particiones.Where(p => p.Id == particion).FirstOrDefault();
            }

            float velNominalHoraLineaProducto = 0;
            if (particionModel != null)
            {
                velNominalHoraLineaProducto = (float)particionModel.VelocidadNominal;
            }
            else
            {
                //asignamos la velNominal maxima para la línea
                var listaParametrosLinea = DAO_Linea.obtenerParametrosLinea();
                velNominalHoraLineaProducto = listaParametrosLinea.Where(p => p.idLinea == linea.Id).Select(p => p.velocidadNominal).Max();
            }

            return velNominalHoraLineaProducto / numEtiquetadoras; //dividimos por el numero de llenadoras
        }

        public async Task<List<DTO_CuadroMandoPlanta>> ObtenerInfoCuadroMando()
        {
            try
            {
                var datos = (from linea in PlantaRT.planta.lineas
                             join turnoActual in PlantaRT.planta.turnoActual on linea.numLinea equals turnoActual.linea.numLinea into lineasTurnoAct
                             from turnoActual in lineasTurnoAct.DefaultIfEmpty()
                             select new DTO_CuadroMandoPlanta
                             {
                                 linea = new
                                 {
                                     llenadoras = linea.llenadoras.Select(ll => new { ll.estado, ll.id, datosSeguimiento = ll.datosSeguimiento == null ? null : new { datosProduccionAvanceTurno = ll.datosSeguimiento.datosProduccionHoras == null ? null : new { oee = ll.datosSeguimiento.OeeMaquina } } }),
                                     ordenEnCurso = (turnoActual == null || turnoActual.linea.ordenEnCurso == null) ? null : new
                                     {
                                         turnoActual.linea.ordenEnCurso.id,
                                         produccion = turnoActual.linea.ordenEnCurso.produccion == null ? null : new { turnoActual.linea.ordenEnCurso.produccion.oee, turnoActual.linea.ordenEnCurso.produccion.paletsProducidos },
                                         turnoActual.linea.ordenEnCurso.oeeCritico,
                                         turnoActual.linea.ordenEnCurso.oeeObjetivo,
                                         producto = turnoActual.linea.ordenEnCurso.producto == null ? null : new { turnoActual.linea.ordenEnCurso.producto.codigo, turnoActual.linea.ordenEnCurso.producto.nombre },
                                         turnoActual.linea.ordenEnCurso.fecInicio,
                                         //fecFinEstimadoCalculado = turnoActual.linea.ordenEnCurso.fecFinEstimadoCalculado,
                                         fecFinEstimadoCalculado = Utils.getDateTurno(turnoActual, turnoActual.linea.ordenEnCurso),
                                         turnoActual.linea.ordenEnCurso.fecInicioEstimado,
                                         turnoActual.linea.ordenEnCurso.fecFinEstimado,
                                         turnoActual.linea.ordenEnCurso.cantPlanificada,
                                         turnoActual.linea.ordenEnCurso.CajasPorPalet,
                                         turnoActual.linea.ordenEnCurso.EnvasesPorPalet
                                     },
                                     ordenEnPaletizadora = (turnoActual == null || turnoActual.linea.ordenEnPaletizadora == null) ? null : new
                                     {
                                         turnoActual.linea.ordenEnPaletizadora.id,
                                         produccion = turnoActual.linea.ordenEnPaletizadora.produccion == null ? null : new { turnoActual.linea.ordenEnPaletizadora.produccion.oee, turnoActual.linea.ordenEnPaletizadora.produccion.paletsEtiquetadoraProducidos },
                                         turnoActual.linea.ordenEnPaletizadora.oeeCritico,
                                         turnoActual.linea.ordenEnPaletizadora.oeeObjetivo,
                                         producto = turnoActual.linea.ordenEnPaletizadora.producto == null ? null : new { turnoActual.linea.ordenEnPaletizadora.producto.codigo, turnoActual.linea.ordenEnPaletizadora.producto.nombre },
                                         turnoActual.linea.ordenEnPaletizadora.fecInicio,
                                         //fecFinEstimadoCalculado = turnoActual.linea.ordenEnPaletizadora.fecFinEstimadoCalculado,
                                         fecFinEstimadoCalculado = Utils.getDateTurno(turnoActual, turnoActual.linea.ordenEnPaletizadora),
                                         turnoActual.linea.ordenEnPaletizadora.fecInicioEstimado,
                                         turnoActual.linea.ordenEnPaletizadora.fecFinEstimado,
                                         turnoActual.linea.ordenEnPaletizadora.cantPlanificada,
                                         turnoActual.linea.ordenEnPaletizadora.CajasPorPalet,
                                         turnoActual.linea.ordenEnPaletizadora.EnvasesPorPalet,
                                         desfaseTiempoRealPlan = ObtenerDesfaseTiempoRealPlan(Utils.getDateTurno(turnoActual, turnoActual.linea.ordenEnPaletizadora), turnoActual.linea.ordenEnPaletizadora.fecFinEstimado)
                                     },
                                     linea.numLinea,
                                     linea.numLineaDescripcion,
                                     linea.oeeCritico,
                                     linea.oeeObjetivo
                                 },
                                 idLinea = linea.id,
                                 turno = turnoActual,
                                 IdTurno = turnoActual.idTurno,
                                 EnvasesTurno = turnoActual == null ? 0 : turnoActual.envases,
                                 OEETurno = turnoActual == null ? 0 : turnoActual.OEE,
                                 //PaletsTurno = turnoActual == null ? 0 : turnoActual.palets,
                                 turnoProductivo = turnoActual == null ? false : turnoActual.turnoProductivo,

                             }).ToList();

                foreach (var item in datos)
                {
                    item.PaletsTurno = (item.turno == null || item.turno.idTurno == 0) ? 0 : ObtenerPaletsEtiquetadoraPorLineaFechas(item.turno.linea.id, item.turno.inicio, DateTime.UtcNow);
                    item.TotalesSemana = ObtenerTotalesSemana(item.idLinea);
                    if (item.IdTurno > 0)
                    {
                        item.TurnoActualSemaforo = await ObtenerSemaforoTurno(item.IdTurno);
                        int idTurnoAnterior = await ObtenerIdTurnoAnterior(item.IdTurno);
                        if (idTurnoAnterior > 0)
                        { 
                            item.TurnoAnteriorSemaforo = await ObtenerSemaforoTurno(idTurnoAnterior); 
                        }
                        
                        item.ArranqueWOSemaforo = await ObtenerSemaforoArranqueWOTurno(item.IdTurno);
                        item.FinalizacionWOSemaforo = await ObtenerSemaforoFinalizacionWOTurno(item.IdTurno);
                    }
                }

                return datos;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private string ObtenerDesfaseTiempoRealPlan(string finEstimado, string finPlan)
        {
            DateTime dateOut;
            if (!DateTime.TryParse(finEstimado, out dateOut)) return string.Empty;

            var fechafinEstimado = Convert.ToDateTime(finEstimado);
            var fechafinPlan = Convert.ToDateTime(finPlan);

            TimeSpan ts = fechafinEstimado - fechafinPlan;
            var desfase = string.Format("({0}d {1}h {2}m)", ts.Days, ts.Hours, ts.Minutes);

            return desfase;
        }

        private TotalesSemanaCuadroMando ObtenerTotalesSemana(string idLinea)
        {
            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    return contexto.TotalesSemanaCuadroMando.AsNoTracking().Where(x => x.Linea == idLinea).FirstOrDefault();
                }

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Error: {ex.Message} -> {ex.StackTrace}", "DAO_Turnos.ObtenerTotalesSemana",
                   "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }

            return new TotalesSemanaCuadroMando();
        }

        public async Task<List<DTO_CuadroMandoPlanta>> ObtenerInfoCuadroMandoVideowall(string lineas)
        {
            if (string.IsNullOrWhiteSpace(lineas)) return new List<DTO_CuadroMandoPlanta>();

            // Convertir la lista de líneas de forma segura
            var listaLineas = lineas.Split(',')
                                    .Select(num => int.TryParse(num, out var n) ? n : (int?)null)
                                    .Where(n => n.HasValue)
                                    .Select(n => n.Value)
                                    .ToList();

            if (!listaLineas.Any()) return new List<DTO_CuadroMandoPlanta>();

            try
            {
                var datos = (from linea in PlantaRT.planta.lineas
                             where listaLineas.Contains(linea.numLinea)
                             join turnoActual in PlantaRT.planta.turnoActual
                             on linea.numLinea equals turnoActual.linea.numLinea into lineasTurnoAct
                             from turnoActual in lineasTurnoAct.DefaultIfEmpty()
                             let ordenEnCurso = turnoActual?.linea?.ordenEnCurso
                             let ordenEnPaletizadora = turnoActual?.linea?.ordenEnPaletizadora
                             select new DTO_CuadroMandoPlanta
                             {
                                 linea = new
                                 {
                                     llenadoras = linea.llenadoras.Select(ll => new
                                     {
                                         ll.estado,
                                         ll.id,
                                         datosSeguimiento = ll.datosSeguimiento == null ? null : new
                                         {
                                             datosProduccionAvanceTurno = ll.datosSeguimiento.datosProduccionHoras == null ? null :
                                             new { oee = ll.datosSeguimiento.OeeMaquina }
                                         }
                                     }),
                                     ordenEnCurso = ordenEnCurso == null ? null : new
                                     {
                                         ordenEnCurso.id,
                                         produccion = ordenEnCurso.produccion == null ? null :
                                         new { ordenEnCurso.produccion.oee, ordenEnCurso.produccion.paletsProducidos },
                                         ordenEnCurso.oeeCritico,
                                         ordenEnCurso.oeeObjetivo,
                                         producto = ordenEnCurso.producto == null ? null :
                                         new { ordenEnCurso.producto.codigo, ordenEnCurso.producto.nombre },
                                         ordenEnCurso.fecInicio,
                                         fecFinEstimadoCalculado = Utils.getDateTurno(turnoActual, ordenEnCurso),
                                         ordenEnCurso.fecInicioEstimado,
                                         ordenEnCurso.fecFinEstimado,
                                         ordenEnCurso.cantPlanificada,
                                         ordenEnCurso.CajasPorPalet,
                                         ordenEnCurso.EnvasesPorPalet
                                     },
                                     ordenEnPaletizadora = ordenEnPaletizadora == null ? null : new
                                     {
                                         ordenEnPaletizadora.id,
                                         produccion = ordenEnPaletizadora.produccion == null ? null :
                                         new { ordenEnPaletizadora.produccion.oee, ordenEnPaletizadora.produccion.paletsEtiquetadoraProducidos },
                                         ordenEnPaletizadora.oeeCritico,
                                         ordenEnPaletizadora.oeeObjetivo,
                                         producto = ordenEnPaletizadora.producto == null ? null :
                                         new { ordenEnPaletizadora.producto.codigo, ordenEnPaletizadora.producto.nombre },
                                         ordenEnPaletizadora.fecInicio,
                                         fecFinEstimadoCalculado = Utils.getDateTurno(turnoActual, ordenEnPaletizadora),
                                         ordenEnPaletizadora.fecInicioEstimado,
                                         ordenEnPaletizadora.fecFinEstimado,
                                         ordenEnPaletizadora.cantPlanificada,
                                         ordenEnPaletizadora.CajasPorPalet,
                                         ordenEnPaletizadora.EnvasesPorPalet,
                                         desfaseTiempoRealPlan = ObtenerDesfaseTiempoRealPlan(Utils.getDateTurno(turnoActual, ordenEnPaletizadora), ordenEnPaletizadora.fecFinEstimado)
                                     },
                                     linea.numLinea,
                                     linea.numLineaDescripcion,
                                     linea.oeeCritico,
                                     linea.oeeObjetivo
                                 },
                                 idLinea = linea.id,
                                 turno = turnoActual,
                                 IdTurno = turnoActual?.idTurno ?? 0,
                                 EnvasesTurno = turnoActual?.envases ?? 0,
                                 OEETurno = turnoActual?.OEE ?? 0,
                                 turnoProductivo = turnoActual?.turnoProductivo ?? false
                             }).ToList();

                // Usamos Task.WhenAll para realizar las operaciones asincrónicas en paralelo.
                var tareas = datos.Select(async item =>
                {
                    try
                    {
                        item.PaletsTurno = (item.turno == null || item.turno.idTurno == 0) ? 0 : ObtenerPaletsEtiquetadoraPorLineaFechas(item.turno.linea.id, item.turno.inicio, DateTime.UtcNow);
                        item.TotalesSemana = ObtenerTotalesSemana(item.idLinea);
                        if (item.IdTurno > 0)
                        {
                            item.TurnoActualSemaforo = await ObtenerSemaforoTurno(item.IdTurno);
                            int idTurnoAnterior = await ObtenerIdTurnoAnterior(item.IdTurno);
                            if (idTurnoAnterior > 0)
                            {
                                item.TurnoAnteriorSemaforo = await ObtenerSemaforoTurno(idTurnoAnterior);
                            }

                            item.ArranqueWOSemaforo = await ObtenerSemaforoArranqueWOTurno(item.IdTurno);
                            item.FinalizacionWOSemaforo = await ObtenerSemaforoFinalizacionWOTurno(item.IdTurno);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log de excepciones
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, $"Error al procesar el item con ID {item.IdTurno}: {ex.Message}", "DAO_Turnos.ObtenerInfoCuadroMandoVideowall", "I-MES-WO", "usuario");
                    }
                }).ToList();

                await Task.WhenAll(tareas).ContinueWith((t) => {
                    if (t.IsFaulted)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, $"Error en ObtenerInfoCuadroMandoVideowall en tareas asincronas", "DAO_Turnos.ObtenerInfoCuadroMandoVideowall", "I-MES-WO", "Sistema");

                    }
                }); // Esperamos que todas las tareas finalicen

                return datos;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Error en ObtenerInfoCuadroMandoVideowall: {ex.Message}  -> {ex.StackTrace}", "DAO_Turnos.ObtenerInfoCuadroMandoVideowall", "WEB-WO", "Sistema");
                return new List<DTO_CuadroMandoPlanta>();
            }
        }


        public RendimientoTurno ObtenerDatosCurvaRendimiento(string linea, int turno)
        {
            var datosRendimiento = new RendimientoTurno();
            datosRendimiento.Horas = new List<string>();
            datosRendimiento.Series = new List<RendimientoTurno.Serie>();

            using (MESEntities contexto = new MESEntities())
            {
                var fechas = contexto.GraficaProduccionTeoricaVSReal.AsNoTracking().Where(g => g.Linea == linea && g.Turno == turno).OrderBy(g => g.Fecha).Select(g => g.Fecha).ToList();
                foreach (var fecha in fechas)
                {
                    datosRendimiento.Horas.Add(fecha.ToString("HH:mm"));
                }

                var serieVelNom = new RendimientoTurno.Serie();
                serieVelNom.name = "Velocidad Nominal";
                var produccionesVelNom = contexto.GraficaProduccionTeoricaVSReal.AsNoTracking().Where(g => g.Linea == linea && g.Turno == turno).OrderBy(g => g.Fecha).Select(g => g.ProduccionVelocidadNominal).ToList();
                serieVelNom.data = produccionesVelNom.Select(i => (int?)i).ToList();
                serieVelNom.color = ColorTranslator.ToHtml(Color.FromArgb(Color.Gray.ToArgb()));

                datosRendimiento.Series.Add(serieVelNom);

                var serieVelNomRendObj = new RendimientoTurno.Serie();
                serieVelNomRendObj.name = "Velocidad Nominal Rend. Obj.";
                var produccionesVelNomRendObj = contexto.GraficaProduccionTeoricaVSReal.AsNoTracking().Where(g => g.Linea == linea && g.Turno == turno).OrderBy(g => g.Fecha).Select(g => g.ProduccionVelocidadNominalRndObjetivo).ToList();
                serieVelNomRendObj.data = produccionesVelNomRendObj.Select(i => (int?)i).ToList();
                serieVelNomRendObj.color = ColorTranslator.ToHtml(Color.FromArgb(Color.DodgerBlue.ToArgb()));

                datosRendimiento.Series.Add(serieVelNomRendObj);

                var serieVelNomMaqLim = new RendimientoTurno.Serie();
                serieVelNomMaqLim.name = "Velocidad Nominal Maq. Limitante";
                var produccionesVelNomMaqLim = contexto.GraficaProduccionTeoricaVSReal.AsNoTracking().Where(g => g.Linea == linea && g.Turno == turno).OrderBy(g => g.Fecha).Select(g => g.ProduccionVelocidadNominalMaqLimitante).ToList();
                serieVelNomMaqLim.data = produccionesVelNomMaqLim.Select(i => (int?)i).ToList();
                serieVelNomMaqLim.color = ColorTranslator.ToHtml(Color.FromArgb(Color.DarkBlue.ToArgb()));

                datosRendimiento.Series.Add(serieVelNomMaqLim);

                var serieReal = new RendimientoTurno.Serie();
                serieReal.name = "Producción Real";
                var produccionesReales = contexto.GraficaProduccionTeoricaVSReal.AsNoTracking().Where(g => g.Linea == linea && g.Turno == turno).OrderBy(g => g.Fecha).Select(g => g.ProduccionReal).ToList();
                serieReal.data = produccionesReales;
                serieReal.color = ColorTranslator.ToHtml(Color.FromArgb(Color.Green.ToArgb()));

                datosRendimiento.Series.Add(serieReal);
            }

            return datosRendimiento;
        }

        public async Task<List<DTO_ConsolidadoTurnos>> ObtenerConsolidadoTurnos(dynamic datos)
        {
            string linea = datos.linea;
            DateTime fechaInicio = datos.fechaInicio;
            DateTime fechaFin = datos.fechaFin;
            bool turnosNoPlanif = datos.turnosNoPlanif;

            var lista = await _api.GetPostsAsync<List<DTO_ConsolidadoTurnos>>(string.Concat(_urlTurno, "ObtenerTurnosConsolidados?linea=", linea,
                "&fechaInicio=", fechaInicio.Date.ToString(), "&fechaFin=", fechaFin.Date.ToString(), "&turnosNoPlanif=", turnosNoPlanif));

            return lista;
        }

        internal async Task<bool> MarcarTurnoParaRecalculoIC(int idTurno, DateTime? fechaTurno = null, int? tipoTurno = null, string idLinea = null)
        {
            DTO_ConsolidadoTurnos dto = new DTO_ConsolidadoTurnos
            {
                IdTurno = idTurno,
                IdLinea = idLinea,
                FechaTurno = fechaTurno == null ? DateTime.Now : fechaTurno.Value,
                IdTipoTurno = tipoTurno == null ? 0 : tipoTurno.Value,
                FechaModifRecalculoIC = DateTime.UtcNow
            };

            return await _api.PutPostsAsync<dynamic>(_urlTurno + "ActualizarFechaModifRecalculoIC", dto);
        }

        internal async Task<bool> DesmarcarTurnoParaRecalculoIC(int idTurno, DateTime? fechaTurno = null, int? tipoTurno = null, string idLinea = null)
        {
            DTO_ConsolidadoTurnos dto = new DTO_ConsolidadoTurnos
            {
                IdTurno = idTurno,
                IdLinea = idLinea,
                FechaTurno = fechaTurno == null ? DateTime.Now : fechaTurno.Value,
                IdTipoTurno = tipoTurno == null ? 0 : tipoTurno.Value,
                FechaModifRecalculoIC = null
            };

            return await _api.PutPostsAsync<dynamic>(_urlTurno + "ActualizarFechaModifRecalculoIC", dto);
        }

        public async Task<float> ObtenerDuracionTurno(int idTurno)
        {
            var ret = await _api.GetPostsAsync<float>(string.Concat(_urlTurno, "ObtenerDuracionTurno?idTurno=", idTurno));
            return ret;
        }

        public async Task<bool> ActualizarOEEObjetivoCriticoTurno(DTO_ConsolidadoTurnos datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(_urlTurno + "ActualizarOEEObjetivoCriticoTurno", datos);
            return ret;
        }

        public async Task<DTO_ConsolidadoTurnos> ObtenerConsolidadoTurnosPorLineaFechaTipoTurno(string linea, DateTime fechaTurno, int idTipoTurno)
        {
            return await _api.GetPostsAsync<DTO_ConsolidadoTurnos>(string.Concat(_urlTurno, "ObtenerConsolidadoTurnosPorLineaFechaTipoTurno?linea=", linea,
                    "&fecha=", fechaTurno.Date.ToString(), "&idTipoTurno=", idTipoTurno));

        }

        public async Task<bool> CrearConsolidadoTurno(DTO_ConsolidadoTurnos datos)
        {
            bool ret = false;
            var turno = await ObtenerConsolidadoTurnosPorLineaFechaTipoTurno(datos.IdLinea, datos.FechaTurno, datos.IdTipoTurno);

            if (turno == null)
            {
                return await _api.PostPostsAsync<dynamic>(datos, string.Concat(_urlTurno + "CrearConsolidadoTurno"));
            }

            return ret;
        }

        public async Task<bool> ActualizarIdTurno(DTO_ConsolidadoTurnos datos)
        {
            bool ret = false;
            var turno = await ObtenerConsolidadoTurnosPorLineaFechaTipoTurno(datos.IdLinea, datos.FechaTurno, datos.IdTipoTurno);

            if (turno != null)
            {
                datos.IdConsolidadoTurno = turno.IdConsolidadoTurno;
                return await _api.PutPostsAsync<dynamic>(_urlTurno + "ActualizarIdTurno", datos);
            }

            return ret;
        }

        public async Task<DTO_TurnosOEE> ObtenerTurnoOEE(int idTurno)
        {
            return await _api.GetPostsAsync<DTO_TurnosOEE>(string.Concat(_urlTurno, "ObtenerTurnoOEE?idTurno=", idTurno));
        }

        public async Task<bool> ActualizarConsolidadoTurno(DTO_ConsolidadoTurnos datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(_urlTurno + "ActualizarConsolidadoTurno", datos);
            return ret;
        }

        public async Task<bool> ActualizarICPorLineaGrupo(DTO_ConsolidadoTurnos datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(_urlTurno + "ActualizarICPorLineaGrupo", datos);
            return ret;
        }

        public async Task<string> ObtenerSemaforoArranqueWOTurno(int idTurno)
        {
            try
            {
                var result = await _api.GetPostsAsync<string>(string.Concat(_urlTurno, "SemaforoArranqueWOTurno?idTurno=", idTurno));

                return result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Error: {ex.Message} -> {ex.StackTrace}", "DAO_Turnos.ObtenerSemaforoArranqueWOTurno",
                   "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }

            return string.Empty;
        }

        public async Task<string> ObtenerSemaforoFinalizacionWOTurno(int idTurno)
        {
            try
            {
                var result = await _api.GetPostsAsync<string>(string.Concat(_urlTurno, "SemaforoFinalizacionWOTurno?idTurno=", idTurno));

                return result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Error: {ex.Message} -> {ex.StackTrace}", "DAO_Turnos.ObtenerSemaforoFinalizacionWOTurno",
                   "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }

            return string.Empty;
        }

        public async Task<string> ObtenerSemaforoTurno(int idTurno)
        {
            try
            {
                var result = await _api.GetPostsAsync<string>(string.Concat(_urlTurno, "SemaforoTurno?idTurno=", idTurno));

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Error: {ex.Message} -> {ex.StackTrace}", "DAO_Turnos.ObtenerSemaforoTurno",
                   "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }

            return string.Empty;
        }

        public async Task<int> ObtenerIdTurnoAnterior(int idTurno)
        {
            try
            {
                return await _api.GetPostsAsync<int>(string.Concat(_urlTurno, "ObtenerIdTurnoAnterior?idTurno=", idTurno));

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Error: {ex.Message} -> {ex.StackTrace}", "DAO_Turnos.ObtenerIdTurnoAnterior",
                   "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }

            return 0;
        }

        public async Task<string> ObtenerComentarioTurno(int idTurno)
        {
            var result = await _api.GetPostsAsync<string>(string.Concat(_urlTurno, "ComentarioTurno?idTurno=", idTurno));

            return result;
        }

        public async Task<bool> ActualizarComentarioTurno(DTO_ConsolidadoTurnos datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(_urlTurno + "ComentarioTurno", datos);
            return ret;
        }

        public async Task<List<DTO_Forms>> ObtenerFormulariosCalidadPorTurno(dynamic datos)
        {
            string linea = datos.linea;
            DateTime inicioTurno = datos.inicioTurno;
            DateTime finTurno = datos.finTurno;

            int idLocation = await ObtenerUbicacionPorLinea(linea);

            var lista = await _api.GetPostsAsync<List<DTO_Forms>>(string.Concat(_urlForms, "ObtenerFormulariosCalidadPorTurno?idLocation=", idLocation,
                "&inicioTurno=", inicioTurno.ToString(), "&finTurno=", finTurno.ToString()));

            return lista;
        }

        public async Task<int> ObtenerIdTurnoAnteriorFechaLinea(string idLinea, DateTime fecha)
        {

            var ret = await _api.GetPostsAsync<int>(string.Concat(_urlTurno, "ObtenerIdTurnoAnteriorFechaLinea?idLinea=", idLinea, "&fecha=", fecha.ToString()));

            return ret;
        }

        internal async Task<int> ObtenerUbicacionPorLinea(string linea)
        {
            return await _api.GetPostsAsync<int>(string.Concat(_urlUbicaciones, "ObtenerUbicacionPorLinea?linea=", linea));
        }

        public async Task<List<DTO_TurnosConBreak>> ObtenerTurnosConBreak(int? idTurno, string idLinea, DateTime? fechaActual, DateTime? fechaInicio, DateTime? fechaFin)
        {
            var ret = await _api.GetPostsAsync<List<DTO_TurnosConBreak>>(string.Concat(_urlTurno, "breaks?",
                idTurno != null ? "&idTurno=" + ((int)idTurno).ToString() : "",
                idLinea != null ? "&idLinea=" + idLinea : "",
                fechaActual != null ? "&fechaActual=" + ((DateTime)fechaActual).ToUniversalTime().ToString("u") : "",
                fechaInicio != null ? "&fechaInicio=" + ((DateTime)fechaInicio).ToUniversalTime().ToString("u") : "",
                fechaFin != null ? "&fechaFin=" + ((DateTime)fechaFin).ToUniversalTime().ToString("u") : "").Replace("?&", "?"));

            return ret;
        }

        public async Task<DTO_TurnosConBreak> ObtenerTurnoConBreakConsecutivo(bool anterior, int? idTurno, string idLinea, DateTime? fechaActual)
        {
            var ret = await _api.GetPostsAsync<DTO_TurnosConBreak>(string.Concat(_urlTurno, "breaksConsecutivo?",
                "anterior=" + anterior.ToString(),
                idTurno != null ? "&idTurno=" + ((int)idTurno).ToString() : "",
                idLinea != null ? "&idLinea=" + idLinea : "",
                fechaActual != null ? "&fechaActual=" + ((DateTime)fechaActual).ToUniversalTime().ToString("u") : "").Replace("?&", "?"));

            return ret;
        }

        public async Task<DTO_ConsolidadoTurnos> ObtenerConsolidadoTurnosPorIdTurno(int idTurno)
        {
            return await _api.GetPostsAsync<DTO_ConsolidadoTurnos>(string.Concat(_urlTurno, "ObtenerConsolidadoTurnosPorIdTurno?idTurno=", idTurno));
        }

        public static int ObtenerPaletsEtiquetadoraPorLineaFechas(string idLinea, DateTime fechaInicio, DateTime fechaFin)
        {
            int palets = 0;

            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerPaletsEtiquetadoraPorLineaFechas]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idLinea", idLinea);
                        command.Parameters.AddWithValue("@fechaInicio", fechaInicio);
                        command.Parameters.AddWithValue("@fechaFin", fechaFin);

                        SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Int);
                        returnParam.Direction = ParameterDirection.ReturnValue;
                        command.Parameters.Add(returnParam);

                        try
                        {
                            connection.Open();
                            command.ExecuteNonQuery();
                            palets = returnParam.Value == DBNull.Value ? 0 : Convert.ToInt32(returnParam.Value);
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.ObtenerPaletsEtiquetadoraPorLineaFechas", "WEB-ENVASADO", "Sistema");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Error: {ex.Message} -> {ex.StackTrace}", "DAO_Turnos.ObtenerPaletsEtiquetadoraPorLineaFechas",
                   "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }
            return palets;
        }

        public static bool EliminarConsolidadoHorarioPorId(string pk, string clase)
        {
            long id = 0;

            try
            {
                id = Convert.ToInt64(pk.Split('#')[1]);

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ConsolidadoHorario_EliminarPorId]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@id", id);
                        command.Parameters.AddWithValue("@clase", clase);

                        connection.Open();
                        command.ExecuteNonQuery();
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Id: " + id + ". " + ex.Message + " -> " + ex.StackTrace, "DAO_Turnos.EliminarConsolidadoHorarioPorId",
                    "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        public async Task<DTO_RelevoTurnoOficiales> ObtenerRelevoTurnoOficiales(int idConsolidadoTurno, string idZona)
        {
            return await _api.GetPostsAsync<DTO_RelevoTurnoOficiales>(string.Concat(_urlTurno, "ObtenerRelevoTurnoOficiales?idConsolidadoTurno=", idConsolidadoTurno, "&idZona=", idZona));
        }

        public async Task<List<DTO_RelevoTurnoOficiales>> ObtenerRelevosTurnosOficiales(string idLinea, string idZona, DateTime fechaDesde, DateTime fechaHasta)
        {
            var result = await _api.GetPostsAsync<List<DTO_RelevoTurnoOficiales>>(
                string.Concat(_urlTurno, "ObtenerRelevosTurnosOficiales?idLinea=", idLinea, "&idZona=", idZona, "&fechaDesde=", fechaDesde.ToUniversalTime().ToString("u"), "&fechaHasta=", fechaHasta.ToUniversalTime().ToString("u"))
            );
            return result;
        }

        public async Task<string> ActualizarRelevoTurnoOficiales(DTO_RelevoTurnoOficiales datos)
        {
            try
            {
                var ret = await _api.PutPostsAsync<dynamic>(_urlTurno + "ActualizarRelevoTurnoOficiales", datos);
                return ret;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public async Task<bool> ActivarRelevoTurnoOficiales(DTO_RelevoTurnoOficiales datos)
        {
            try
            {
                var ret = await _api.PutPostsAsync<dynamic>(_urlTurno + "ActivarRelevoTurnoOficiales", datos);
                return ret;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<double> ObtenerOEETurno(int idTurno)
        {
            var result = await _api.GetPostsAsync<double>(string.Concat(_urlTurno, "OEETurno?idTurno=", idTurno));

            return result;
        }
    }
}