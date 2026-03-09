using BreadMES.Envasado;
using Clients.ApiClient.Contracts;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Mappers.Envasado;
using MSM.Models.Envasado;
using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads.Types;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public class DAO_ParosPerdidas : IDAO_ParosPerdidas
    {
        private IApiClient _api;
        private string _urlParosPerdidas;
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();

        public DAO_ParosPerdidas()
        {

        }

        public DAO_ParosPerdidas(IApiClient api)
        {
            _api = api;
            _urlParosPerdidas = string.Concat(UriEnvasado, "api/parosPerdidas/");
        }

        public List<ParoPerdida> ObtenerParos(int idLinea, int idTurno)
        {
            List<ParoPerdida> paros = new List<ParoPerdida>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerParos]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@idTurno", idTurno);
            comando.CommandType = CommandType.StoredProcedure;
            
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();

                while (dr.Read())
                {
                    DateTime fechaFin = DataHelper.GetDate(dr, "Fin");
                    
                    if (fechaFin > DateTime.MinValue)
                    {
                        long id = DataHelper.GetLong(dr, "Id");
                        short idTipoParoPerdida = DataHelper.GetShort(dr, "IdTipoParoPerdida");
                        string tipoParoPerdida = DataHelper.GetString(dr, "TipoParoPerdida");
                        bool justificado = Convert.ToBoolean(DataHelper.GetShort(dr, "Justificado"));
                        DateTime dinicio = DataHelper.GetDate(dr, "Inicio");
                        DateTime dfin = DataHelper.GetDate(dr, "Fin");
                        string equipoNombre = DataHelper.GetString(dr, "EquipoNombre");
                        string equipoDesc = DataHelper.GetString(dr, "EquipoDescripcion");
                        string motivoNombre = DataHelper.GetString(dr, "MotivoNombre");
                        string causaNombre = DataHelper.GetString(dr, "CausaNombre");
                        int motivoId = DataHelper.GetInt(dr, "MotivoId");
                        int causaId = DataHelper.GetInt(dr, "CausaId");
                        string maquinaCausaId = DataHelper.GetString(dr, "MaquinaCausaId");
                        string maquinaCausaNombre = DataHelper.GetString(dr, "MaquinaCausaNombre");
                        maquinaCausaNombre = string.IsNullOrEmpty(maquinaCausaNombre) ? string.Empty : char.ToUpper(maquinaCausaNombre[0]) + maquinaCausaNombre.Substring(1).ToLower();
                        string equipoConstructivoId = DataHelper.GetString(dr, "EquipoConstructivoId");
                        string equipoConstructivoNombre = DataHelper.GetString(dr, "EquipoConstructivoNombre");
                        equipoConstructivoNombre = string.IsNullOrEmpty(equipoConstructivoNombre) ? string.Empty : char.ToUpper(equipoConstructivoNombre[0]) + equipoConstructivoNombre.Substring(1).ToLower();
                        string descripcion = DataHelper.GetString(dr, "Descripcion");
                        descripcion = string.IsNullOrEmpty(descripcion) ? string.Empty : char.ToUpper(descripcion[0]) + descripcion.Substring(1).ToLower();
                        string observaciones = DataHelper.GetString(dr, "Observaciones");

                        ParoPerdida Paro = new ParoPerdida(id, idTipoParoPerdida, tipoParoPerdida, justificado, dinicio, dfin, equipoNombre,
                            equipoDesc, motivoNombre, causaNombre, motivoId, causaId, maquinaCausaId, maquinaCausaNombre, equipoConstructivoId, 
                            equipoConstructivoNombre, descripcion, observaciones);

                        paros.Add(Paro);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerParos", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_PAROS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return paros;
        }

        public List<ParoPerdidaPPAMaquinas> ObtenerParosPerdidasPPAMaquinas(DateTime desde, DateTime hasta, int idLinea)
        {
            List<ParoPerdidaPPAMaquinas> paros = new List<ParoPerdidaPPAMaquinas>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerParosPerdidasPPAMaquinas]", conexion);
            comando.Parameters.AddWithValue("@FecInicio", desde);
            comando.Parameters.AddWithValue("@FecFin", hasta);
            comando.Parameters.AddWithValue("@NumLinea", idLinea);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();

                while (dr.Read())
                {
                    ParoPerdidaPPAMaquinas Paro = new ParoPerdidaPPAMaquinas(
                        DataHelper.GetInt(dr, "NumLinea"),
                        DataHelper.GetString(dr, "NumLineaDescripcion"),
                        DataHelper.GetString(dr, "Linea"),
                        DataHelper.GetInt(dr, "CodMaquina"),
                        DataHelper.GetString(dr, "IdMaquina"),
                        DataHelper.GetString(dr, "DescripcionMaquina"),
                        DataHelper.GetInt(dr, "ParoMayorMenor"),
                        DataHelper.GetDate(dr, "Inicio"),
                        DataHelper.GetDate(dr, "Fin"),
                        DataHelper.GetInt(dr, "Duracion"),
                        DataHelper.GetDate(dr, "InicioTurno"),
                        DataHelper.GetDate(dr, "FinTurno"),
                        DataHelper.GetInt(dr, "IdTurno"),
                        DataHelper.GetString(dr, "IdTipoTurno")
                    );

                    paros.Add(Paro);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerParosPerdidasPPAMaquinas", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_PAROS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return paros;
        }

        public List<ParoPerdida> ObtenerPerdidas(int idLinea, int idTurno)
        {
            List<ParoPerdida> perdidas = new List<ParoPerdida>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerPerdidas]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@idTurno", idTurno);
            comando.CommandType = CommandType.StoredProcedure;
            
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                DateTime inicio = DateTime.MinValue;
                ParoPerdida perdida = null;

                while (dr.Read())
                {
                    long id = DataHelper.GetLong(dr, "id");
                    short idTipoParoPerdida = DataHelper.GetShort(dr, "IdTipoParoPerdida");
                    string tipoParoPerdida = DataHelper.GetString(dr, "TipoParoPerdida");
                    bool justificado = Convert.ToBoolean(DataHelper.GetShort(dr, "Justificado"));
                    DateTime dinicio = DataHelper.GetDate(dr, "Inicio");
                    DateTime dfin = DataHelper.GetDate(dr, "Fin");
                    string equipoNombre = DataHelper.GetString(dr, "EquipoNombre");
                    string equipoDesc = DataHelper.GetString(dr, "EquipoDescripcion");
                    string maquinaCausaId = DataHelper.GetString(dr, "MaquinaCausaId");
                    string maquinaCausaNombre = DataHelper.GetString(dr, "MaquinaCausaNombre");
                    maquinaCausaNombre = string.IsNullOrEmpty(maquinaCausaNombre) ? string.Empty : char.ToUpper(maquinaCausaNombre[0]) + maquinaCausaNombre.Substring(1).ToLower();
                    string motivoNombre = DataHelper.GetString(dr, "MotivoNombre");
                    string causaNombre = DataHelper.GetString(dr, "CausaNombre");
                    int motivoId = DataHelper.GetInt(dr, "MotivoId");
                    int causaId = DataHelper.GetInt(dr, "CausaId");
                    string equipoConstructivoId = DataHelper.GetString(dr, "EquipoConstructivoId");
                    string equipoConstructivoNombre = DataHelper.GetString(dr, "EquipoConstructivoNombre");
                    equipoConstructivoNombre = string.IsNullOrEmpty(equipoConstructivoNombre) ? string.Empty : char.ToUpper(equipoConstructivoNombre[0]) + equipoConstructivoNombre.Substring(1).ToLower();
                    string descripcion = DataHelper.GetString(dr, "Descripcion");
                    descripcion = string.IsNullOrEmpty(descripcion) ? string.Empty : char.ToUpper(descripcion[0]) + descripcion.Substring(1).ToLower();
                    string observaciones = DataHelper.GetString(dr, "Observaciones");

                    perdida = new ParoPerdida(id, idTipoParoPerdida, tipoParoPerdida, justificado, dinicio, dfin, equipoNombre, equipoDesc,
                        motivoNombre, causaNombre, motivoId, causaId, maquinaCausaId, maquinaCausaNombre, equipoConstructivoId, 
                        equipoConstructivoNombre, descripcion, observaciones);

                    perdida.DuracionPerdidas = DataHelper.GetDouble(dr, "DuracionBajaVelocidad");
                    perdida.DuracionParosMenores = DataHelper.GetDouble(dr, "DuracionParosMenores");
                    perdida.NumeroParosMenores = DataHelper.GetInt(dr, "NumeroParosMenores");

                    perdidas.Add(perdida);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerPerdidas", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PERDIDAS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return perdidas;
        }

        public DatosProduccion ObtenerResumenParosPerdidas(DatosProduccion prod)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerResumenParosPerdidas]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idMaquina", prod.nombreMaquina);
                    command.Parameters.AddWithValue("@desde", prod.fecInicio);
                    command.Parameters.AddWithValue("@hasta", prod.fecFin);

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);

                            foreach (DataRow row in dt.Rows)
                            {
                                prod.numParosMayores = (int)row["NumParosMayores"];
                                prod.tiempoParosMayores = (long)row["TiempoParosMayores"];
                                prod.numParosMenores = (int)row["NumParosMenores"];
                                prod.tiempoParosMenores = (long)row["TiempoParosMenores"];
                                prod.tiempoBajaVelocidad = (long)row["TiempoBajaVelocidad"];

                                prod.numParosMayoresJ = (int)row["NumParosMayoresJ"];
                                prod.tiempoParosMayoresJ = (long)row["TiempoParosMayoresJ"];
                                prod.numParosMenoresJ = (int)row["NumParosMenoresJ"];
                                prod.tiempoParosMenoresJ = (long)row["TiempoParosMenoresJ"];
                                prod.tiempoBajaVelocidadJ = (long)row["TiempoBajaVelocidadJ"];
                            }
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerResumenParosPerdidas", "WEB-WO", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_RESUMEN"));
                        }
                    }
                }
            }

            return prod;
        }

        internal static IEnumerable ObtenerParosPerdidasTurno(int idTurno)
        {
            try
            {
                IEnumerable lstParosPerdidas = null;
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerParosPerdidasTurno]", connection))
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
                                lstParosPerdidas = dt.AsEnumerable().Select(p => new
                                {
                                    nombre = Convert.ToString(p["Nombre"]),
                                    hora = Convert.ToInt32(p["HORA"]),
                                    duracionParoMayor = Convert.ToDouble(p["DuracionParoMayor"]),
                                    duracionParoMenor = Convert.ToDouble(p["DuracionParosMenores"]),
                                    duracionBajaVelocidad = Convert.ToDouble(p["DuracionBajaVelocidad"]),
                                    duracionPerdidaProduccion = Convert.ToDouble(p["DuracionPerdidaProduccion"])
                                }).ToList();
                            }
                        }
                    }
                }

                return lstParosPerdidas;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_ParosPerdidas.ObtenerParosPerdidasTurno", "WEB-WO", "Sistema");
                throw ex;
                //throw new Exception("Error obteniendo paros perdidas del turno");
            }
        }

        internal static IEnumerable ObtenerParosPerdidasTotalesLLenadoraTurno(int idTurno)
        {
            try
            {
                IEnumerable lstParosPerdidas = null;
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerParosPerdidasTotalesLLenadoraTurno]", connection))
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
                                lstParosPerdidas = dt.AsEnumerable().Select(p => new
                                {
                                    nombre = Convert.ToString(p["Nombre"]),
                                    duracionParoMayor = Convert.ToDouble(p["DuracionParoMayor"]),
                                    duracionParoMenor = Convert.ToDouble(p["DuracionParosMenores"]),
                                    duracionBajaVelocidad = Convert.ToDouble(p["DuracionBajaVelocidad"]),
                                    duracionPerdidaProduccion = Convert.ToDouble(p["DuracionPerdidaProduccion"]),
                                    numParosMayores = Convert.ToInt32(p["NumParosMayores"]),
                                    numParosMenores = Convert.ToInt32(p["NumParosMenores"])
                                }).ToList();
                            }
                        }
                    }
                }

                return lstParosPerdidas;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_ParosPerdidas.ObtenerParosPerdidasTotalesLLenadoraTurno", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS_PERDIDAS"));
            }
        }

        /// <summary>
        /// Obtiene paros perdidas de llenadora de una linea y un intervalo concreto
        /// </summary>
        /// <param name="fInicio">Fecha inicio</param>
        /// <param name="fFin">Fecha fin</param>
        /// <param name="idLinea">Id Linea</param>
        /// <returns>Lista de ParosPerdidas</returns>
        internal static IEnumerable ObtenerParosPerdidasLlenadora(DateTime fInicio, DateTime fFin, int idLinea, bool filtros)
        {
            List<DTO_ParosPerdidas> list = new List<DTO_ParosPerdidas>();

            using (MESEntities context = new MESEntities())
            {
                if (filtros)
                {
                    list = context.ParosPerdidas.AsNoTracking().Where(p => p.InicioLocal.Value.CompareTo(fInicio) >= 0 && p.InicioLocal.Value.CompareTo(fFin) <= 0 && 
                                                  p.IdLinea == idLinea)
                        .OrderByDescending(p => p.InicioLocal)
                        .AsEnumerable().Select(p => Mapper_ParosPerdidas.Mapper_ParosPerdidas_toDTO(p))
                        .ToList();
                }
                else
                {
                    list = context.ParosPerdidas.AsNoTracking().Where(p => DbFunctions.TruncateTime(p.InicioLocal).Value.CompareTo(fInicio.Date) >= 0 && 
                                                  DbFunctions.TruncateTime(p.InicioLocal).Value.CompareTo(fFin.Date) <= 0 && 
                                                  p.IdLinea == idLinea)
                        .OrderByDescending(p => p.InicioLocal)
                        .AsEnumerable().Select(p => Mapper_ParosPerdidas.Mapper_ParosPerdidas_toDTO(p))
                        .ToList();
                }

                var Ids = list.Select(e => e.Id).ToList();
                var OTs = context.MantenimientoParosRelaciones.AsNoTracking().Where(m => Ids.Contains(m.IdParo))
                    .Join(context.MantenimientoIntervenciones.AsNoTracking(), p => p.IdMantenimientoIntervenciones, m => m.IdMantenimientoIntervenciones, (p, m) => new { idParo = p.IdParo, OT = m.OT})
                    .ToList();

                foreach(var l in list)
                {
                    l.NumOT = OTs.Find(f => f.idParo == l.Id)?.OT;
                }
            }

            return list;
        }

        /// <summary>
        /// Obtiene paros perdidas de llenadora por linea
        /// </summary>
        /// <returns>Lista de ParosPerdidas</returns>
        internal static IEnumerable ObtenerParosPerdidasLlenadora(dynamic datos)
        {
            List<ParosPerdidas> listaParosPerdidas = new List<ParosPerdidas>();
            int numLinea = Convert.ToInt32(datos.numLinea.Value);
            string idTipoTurno = datos.idTipoTurno.Value.ToString();

            using (MESEntities context = new MESEntities())
            {
                if (datos.fechaTurno == null)
                {
                    if (idTipoTurno == string.Empty)
                    {
                        listaParosPerdidas = context.ParosPerdidas.AsNoTracking().Where(p => p.IdLinea == numLinea).ToList();
                    }
                    else
                    {
                        listaParosPerdidas = context.ParosPerdidas.AsNoTracking().Where(p => p.IdLinea == numLinea && p.IdTipoTurno == idTipoTurno).ToList();
                    }
                }
                else 
                {
                    DateTime fechaTurno = ((DateTime)datos.fechaTurno.Value).ToLocalTime();

                    if (idTipoTurno == string.Empty)
                    {
                        listaParosPerdidas = context.ParosPerdidas.AsNoTracking().Where(p => p.IdLinea == numLinea && p.FechaTurno == fechaTurno).ToList();
                    }
                    else
                    {
                        listaParosPerdidas = context.ParosPerdidas.AsNoTracking().Where(p => p.IdLinea == numLinea && p.FechaTurno == fechaTurno && p.IdTipoTurno == idTipoTurno).ToList();
                    }
                }
            }

            return listaParosPerdidas.Select(e => Mapper_ParosPerdidas.Mapper_ParosPerdidas_toDTO(e)).ToList();
        }

        internal ReturnValue EliminarParoPerdida(int idParo)
        {
            COB_MSM_PAROS_PERDIDAS paro = ParosPerdidasBread.ObtenerPorId(idParo.ToString());
            ReturnValue ret = new ReturnValue();

            if (paro != null)
            {
                List<COB_MSM_ACCIONES_PAROS> mejora = AccionesMejoraBread.ObtenerAccionMejoraParosPorID(idParo);

                foreach (var paromejora in mejora)
                {
                    ret = AccionesMejoraBread.eliminarAccionMejoraParos(paromejora);

                    if (!ret.succeeded)
                        return ret;
                }

                ret = ParosPerdidasBread.BorrarParo(paro);
                string idMaquina = string.Empty;

                using (MESEntities context = new MESEntities())
                {
                    idMaquina = context.Maquinas.AsNoTracking().Where(p => p.Id.Equals(paro.MAQUINA)).FirstOrDefault().Nombre;
                }

                //El segundo campo es el id de la llenadora
                actualizaConsolidadoTurno(idParo, idMaquina, paro.MAQUINA);

                return ret;
            }
            else
                return new ReturnValue(false, -1, "Paro no encontrado en el sistema");
        }

        internal int ObtenerMinimoParoMayor(int idLinea)
        {
            COB_MSM_PARAMETROS_LINEA_ADMIN parametro = ParametrosBread.ObtenerParametrosLineaPorNombre("Límite paros menores", idLinea);
            int seg = parametro.VALOR_INT;
            
            return seg / 60;
        }

        internal ReturnValue EditarParo(dynamic datos)
        {
            int tipo = int.Parse(datos.tipo.ToString());

            int id = int.Parse(datos.Id.ToString());
            DateTime fecha = DateTime.Parse(datos.fecha.ToString());
            string linea = datos.linea.ToString();
            int motivo = datos.motivo.ToString().Equals("") ? 0 : int.Parse(datos.motivo.ToString());
            int causa = datos.causa.ToString().Equals("") ? 0 : int.Parse(datos.causa.ToString());
            string maquina = datos.maquina.ToString();
            string equipo = datos.equipo.ToString();
            int idAveria = datos.idAveria.ToString() == string.Empty ? 0 : int.Parse(datos.idAveria.ToString());
            string descripcion = datos.descripcion.ToString() == IdiomaController.GetResourceName("SELECCIONE") ? string.Empty : datos.descripcion.ToString();
            string observaciones = datos.observaciones.ToString();
            int duracionHoras = 0, duracionMinutos = 0, duracionSegundos = 0;
            int MenoresHoras = 0, MenoresMinutos = 0, MenoresSegundos = 0;
            int BajaVelHoras = 0, BajaVelMinutos = 0, BajaVelSegundos = 0, numParosMenores = 0;
            string llenadora = datos.llenadora.ToString();

            if (tipo == 1)
            {
                duracionHoras = int.Parse(datos.duracionHoras.ToString());
                duracionMinutos = int.Parse(datos.duracionMinutos.ToString());
                duracionSegundos = int.Parse(datos.duracionSegundos.ToString());
            }
            else
            {
                MenoresHoras = int.Parse(datos.MenoresHoras.ToString());
                MenoresMinutos = int.Parse(datos.MenoresMinutos.ToString());
                MenoresSegundos = int.Parse(datos.MenoresSegundos.ToString());
                BajaVelHoras = int.Parse(datos.BajaVelHoras.ToString());
                BajaVelMinutos = int.Parse(datos.BajaVelMinutos.ToString());
                BajaVelSegundos = int.Parse(datos.BajaVelSegundos.ToString());
                numParosMenores = int.Parse(datos.numParosMenores.ToString());
            }

            COB_MSM_PAROS_PERDIDAS objeto = ParosPerdidasBread.ObtenerPorId(id);

            objeto.CAUSA = causa;
            objeto.MAQUINA_RESPONSABLE = maquina;
            objeto.EQUIPO_CONSTRUCTIVO = equipo.ToString();
            objeto.DESCRIPCION = descripcion;
            objeto.FK_PAROS_ID = short.Parse(tipo.ToString());
            objeto.INICIO = fecha;
            objeto.FECHA_ULTIMA_ACTUALIZACION = DateTime.UtcNow;
            
            using (MESEntities context = new MESEntities())
            {
                objeto.MAQUINA = context.Maquinas.AsNoTracking().Where(p => p.Nombre.Equals(llenadora)).FirstOrDefault().Id;
            }

            if (motivo > 0 || causa > 0)
            {
                objeto.JUSTIFICADO = 1;

                if (maquina != string.Empty && (bool)datos.aplicarJustificacionMaquina.Value)
                {
                    ModificarNumeroJustificacionesMaquina(linea, maquina);
                }

                if (equipo != string.Empty && (bool)datos.aplicarJustificacionEquipo.Value)
                {
                    ModificarNumeroJustificacionesEquipo(equipo);
                }

                if (idAveria != 0 && (bool)datos.aplicarJustificacionAveria.Value)
                {
                    ModificarNumeroJustificacionesAveria(idAveria);
                }
            }
            else
                objeto.JUSTIFICADO = 0;

            objeto.MOTIVO = motivo;
            objeto.OBSERVACIONES = observaciones;

            using (MESEntities contexto = new MESEntities())
            {
                objeto.SHC_WORK_SCHED_DAY_PK = contexto.Turnos.AsNoTracking().Where(m => m.FinTurno.Value > fecha && fecha >= m.InicioTurno.Value && m.Linea.Equals(linea)).FirstOrDefault().Id;
            }

            if (tipo == 1)
            {
                objeto.DURACION = duracionHoras * 3600 + duracionMinutos * 60 + duracionSegundos;
            }
            else
            {
                objeto.DURACION_BAJA_VELOCIDAD = BajaVelHoras * 3600 + BajaVelMinutos * 60 + BajaVelSegundos;
                objeto.DURACION_PAROS_MENORES = MenoresHoras * 3600 + MenoresMinutos * 60 + MenoresSegundos;
                objeto.NUMERO_PAROS_MENORES = numParosMenores;
                objeto.DURACION = objeto.DURACION_BAJA_VELOCIDAD + objeto.DURACION_PAROS_MENORES;
            }

            objeto.FIN = objeto.INICIO.AddSeconds(objeto.DURACION);

            ReturnValue ret = ParosPerdidasBread.EditarParo(objeto);
            actualizaConsolidadoTurno(objeto.SHC_WORK_SCHED_DAY_PK, llenadora, objeto.MAQUINA);
            
            return ret;
        }

        internal ReturnValue CrearParo(dynamic datos, out double duracion)
        {
            int tipo = int.Parse(datos.tipo.ToString());

            DateTime fecha = DateTime.Parse(datos.fecha.ToString());
            string linea = datos.linea.ToString();
            int motivo = datos.motivo.ToString().Equals("") ? 0 : int.Parse(datos.motivo.ToString());
            int causa = datos.causa.ToString().Equals("") ? 0 : int.Parse(datos.causa.ToString());
            string maquina = datos.maquina.ToString();
            string equipo = datos.equipo.ToString();
            int idAveria = datos.idAveria.ToString() == string.Empty ? 0 : int.Parse(datos.idAveria.ToString());
            string descripcion = datos.descripcion.ToString() == IdiomaController.GetResourceName("SELECCIONE") ? string.Empty : datos.descripcion.ToString();
            string observaciones = datos.observaciones.ToString();
            string llenadora = datos.llenadora.ToString();
            int duracionHoras = 0, duracionMinutos = 0, duracionSegundos = 0;
            int MenoresHoras = 0, MenoresMinutos = 0, MenoresSegundos = 0;
            int BajaVelHoras = 0, BajaVelMinutos = 0, BajaVelSegundos = 0, numParosMenores = 0;

            if (tipo == 1)
            {
                duracionHoras = datos.duracionHoras != null ? int.Parse(datos.duracionHoras.ToString()) : 0;
                duracionMinutos = datos.duracionMinutos != null ? int.Parse(datos.duracionMinutos.ToString()) : 0;
                duracionSegundos = datos.duracionSegundos != null ? int.Parse(datos.duracionSegundos.ToString()) : 0;
            }
            else
            {
                MenoresHoras = datos.MenoresHoras != null ? int.Parse(datos.MenoresHoras.ToString()) : 0;
                MenoresMinutos = datos.MenoresMinutos != null ? int.Parse(datos.MenoresMinutos.ToString()) : 0;
                MenoresSegundos = datos.MenoresSegundos != null ? int.Parse(datos.MenoresSegundos.ToString()) : 0;
                BajaVelHoras = datos.BajaVelHoras != null ? int.Parse(datos.BajaVelHoras.ToString()) : 0;
                BajaVelMinutos = datos.BajaVelMinutos != null ? int.Parse(datos.BajaVelMinutos.ToString()) : 0;
                BajaVelSegundos = datos.BajaVelSegundos != null ? int.Parse(datos.BajaVelSegundos.ToString()) : 0;
                numParosMenores = datos.numParosMenores != null ? int.Parse(datos.numParosMenores.ToString()) : 0;
            }

            COB_MSM_PAROS_PERDIDAS objeto = new COB_MSM_PAROS_PERDIDAS();
            objeto.CAUSA = causa;
            objeto.MAQUINA_RESPONSABLE = maquina;
            objeto.EQUIPO_CONSTRUCTIVO = equipo;
            objeto.DESCRIPCION = descripcion;
            objeto.FK_PAROS_ID = short.Parse(tipo.ToString());
            objeto.INICIO = fecha;
            objeto.FECHA_ULTIMA_ACTUALIZACION = DateTime.UtcNow;

            using (MESEntities context = new MESEntities())
            {
                objeto.MAQUINA = context.Maquinas.AsNoTracking().Where(p => p.Nombre.Equals(llenadora)).FirstOrDefault().Id;
            }

            if (motivo > 0 || causa > 0)
            { 
                objeto.JUSTIFICADO = 1;

                if (maquina != string.Empty) {
                    ModificarNumeroJustificacionesMaquina(linea, maquina);
                }

                if (equipo != string.Empty)
                {
                    ModificarNumeroJustificacionesEquipo(equipo);
                }

                if (idAveria != 0)
                {
                    ModificarNumeroJustificacionesAveria(idAveria);
                }
            }
            else
                objeto.JUSTIFICADO = 0;

            objeto.MOTIVO = motivo;
            objeto.OBSERVACIONES = observaciones;

            using (MESEntities contexto = new MESEntities())
            {
                objeto.SHC_WORK_SCHED_DAY_PK = contexto.Turnos.AsNoTracking().Where(m => m.FinTurno.Value > fecha && fecha >= m.InicioTurno.Value && m.Linea.Equals(linea)).FirstOrDefault().Id;
            }

            if (tipo == 1)
            {
                objeto.DURACION = duracionHoras * 3600 + duracionMinutos * 60 + duracionSegundos;
            }
            else
            {
                objeto.DURACION_BAJA_VELOCIDAD = BajaVelHoras * 3600 + BajaVelMinutos * 60 + BajaVelSegundos;
                objeto.DURACION_PAROS_MENORES = MenoresHoras * 3600 + MenoresMinutos * 60 + MenoresSegundos;
                objeto.NUMERO_PAROS_MENORES = numParosMenores;
                objeto.DURACION = objeto.DURACION_BAJA_VELOCIDAD + objeto.DURACION_PAROS_MENORES;
            }

            objeto.FIN = objeto.INICIO.AddSeconds(objeto.DURACION);

            ReturnValue ret = ParosPerdidasBread.CrearParo(objeto);

            actualizaConsolidadoTurno(objeto.SHC_WORK_SCHED_DAY_PK, llenadora, objeto.MAQUINA);
            duracion = objeto.DURACION;

            return ret;
        }

        public void ModificarNumeroJustificacionesMaquina(string linea, string codigoMaquina)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var maquina = context.MaquinasEnvasado.Where(x => x.LineaAsociada == linea && x.CodigoMaquina == codigoMaquina).First();
                    maquina.NumeroJustificaciones += 1;

                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void ModificarNumeroJustificacionesEquipo(string codigoEquipo)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var equipo = context.EquiposConstructivosEnvasado.Where(x => x.CodigoEquipo == codigoEquipo).First();
                    equipo.NumeroJustificaciones += 1;

                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void ModificarNumeroJustificacionesAveria(int idAveria)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var averia = context.DescripcionAverias.Where(x => x.IdDescripcionAveria == idAveria).First();
                    averia.NumeroJustificaciones += 1;

                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool EsMaquinaObligatoriaParo(int idMotivo)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    return context.JustificacionParosMotivos.AsNoTracking().Where(x => x.IdMotivo == idMotivo).Select(x => x.MaquinaObligatoria).FirstOrDefault();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static ReturnValue actualizaConsolidadoTurno(int turno, string llenadora, string idMaquina)
        {
            //Vamos a recalcular toda la informacion del turno del Consolidado segun la tabla de paros
            ReturnValue ret = new ReturnValue();
            Turnos turno1 = new Turnos();

            //Obtenemos la informacion del turno
            using (MESEntities context = new MESEntities())
            {
                turno1 = context.Turnos.AsNoTracking().Where(m => m.Id == turno).FirstOrDefault();
            }

            //Esta consulta nos va a traer la informacion de paros partida en horas segun turno y maquina
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerParosPerdidasTurnoLlenadora]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idTurno", turno);
                    command.Parameters.AddWithValue("@llenadora", llenadora);

                    connection.Open();

                    using (SqlDataReader dr = command.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            //Guardamos la hora con la que estamos trabajando
                            int horaSQL = int.Parse(dr["HORA"].ToString());

                            //Leemos los campos que devuelve la consulta
                            string nombre = dr["Nombre"].ToString();
                            float duracionParoMayor = int.Parse(dr["DuracionParoMayor"].ToString());
                            float duracionParoMenor = int.Parse(dr["DuracionParosMenores"].ToString());
                            float duracionPerdidaProduccion = int.Parse(dr["DuracionPerdidaProduccion"].ToString());

                            //Leemos el registro para esa hora y esa maquina en el consolidado
                            Collection<COB_MSM_PROD_LLENADORA_HORA> listaHoras = ProduccionLlenadoraHora.ObtenertPorHoraMaquinaTurnoSinOffset(horaSQL, idMaquina, turno1.Id);

                            if (listaHoras.Count > 0)
                            {
                                COB_MSM_PROD_LLENADORA_HORA primeraHora = listaHoras[0];

                                //Si hay mas de un registro para esa hora (Ha habido un cambio)
                                if (listaHoras.Count > 1)
                                {
                                    //Si en el primer registro podemos guardar la informacion directamente
                                    if (primeraHora.TIEMPO_PLANIFICADO >= duracionParoMayor && primeraHora.TIEMPO_PLANIFICADO >= duracionPerdidaProduccion)
                                    {
                                        primeraHora.TIEMPO_OPERATIVO = primeraHora.TIEMPO_PLANIFICADO - duracionParoMayor;
                                        primeraHora.TIEMPO_NETO = (primeraHora.TIEMPO_OPERATIVO - duracionPerdidaProduccion) < 0 ? 0 : primeraHora.TIEMPO_OPERATIVO - duracionPerdidaProduccion;
                                        primeraHora.TIEMPO_BRUTO = (primeraHora.TIEMPO_OPERATIVO - duracionParoMenor) < 0 ? 0 : primeraHora.TIEMPO_OPERATIVO - duracionParoMenor;

                                        ret = ProduccionLlenadoraHora.Editar(primeraHora);

                                        for (int i = 1; i < listaHoras.Count; i++)
                                        {
                                            listaHoras[i].TIEMPO_OPERATIVO = listaHoras[i].TIEMPO_PLANIFICADO;
                                            listaHoras[i].TIEMPO_NETO = listaHoras[i].TIEMPO_PLANIFICADO;
                                            listaHoras[i].TIEMPO_BRUTO = listaHoras[i].TIEMPO_PLANIFICADO;
                                            ret = ProduccionLlenadoraHora.Editar(listaHoras[i]);
                                        }
                                    }
                                    else
                                    {
                                        //Primero tenemos que calcular el tiempo operativo respecto al tiempo planificado y el tiempo de paro mayor
                                        foreach (var hora in listaHoras)
                                        {
                                            if (hora.TIEMPO_PLANIFICADO > 0)
                                            {
                                                //Tiempo planificado mayor que 0
                                                if (hora.TIEMPO_PLANIFICADO > duracionParoMayor)
                                                {
                                                    if (duracionParoMayor == 0)
                                                    {
                                                        hora.TIEMPO_OPERATIVO = hora.TIEMPO_PLANIFICADO;
                                                        ret = ProduccionLlenadoraHora.Editar(hora);
                                                    }
                                                    else
                                                    {
                                                        //Hay suficiente para guardarlo en esa hora
                                                        hora.TIEMPO_OPERATIVO = hora.TIEMPO_PLANIFICADO - duracionParoMayor;
                                                        ret = ProduccionLlenadoraHora.Editar(hora);
                                                        duracionParoMayor = 0;
                                                    }
                                                }
                                                else
                                                {
                                                    //Solo guardamos lo que entre y el resto para otra hora
                                                    hora.TIEMPO_OPERATIVO = 0;
                                                    duracionParoMayor -= hora.TIEMPO_PLANIFICADO;
                                                    ret = ProduccionLlenadoraHora.Editar(hora);
                                                }
                                            }
                                            else
                                            {
                                                //Si es 0 actualizamos el operativo e ya
                                                hora.TIEMPO_OPERATIVO = 0;
                                                ret = ProduccionLlenadoraHora.Editar(hora);
                                            }
                                        }

                                        foreach (var hora in listaHoras)
                                        {
                                            //Hay planificado para calcular
                                            if (hora.TIEMPO_OPERATIVO > 0)
                                            {
                                                //Tiempo operativo mayor que 0
                                                if (hora.TIEMPO_OPERATIVO > duracionPerdidaProduccion)
                                                {
                                                    if (duracionPerdidaProduccion == 0)
                                                    {
                                                        hora.TIEMPO_NETO = hora.TIEMPO_OPERATIVO;
                                                        hora.TIEMPO_BRUTO = hora.TIEMPO_OPERATIVO;
                                                        ret = ProduccionLlenadoraHora.Editar(hora);
                                                    }
                                                    else
                                                    {
                                                        //Hay suficiente para guardarlo en esa hora
                                                        hora.TIEMPO_NETO = hora.TIEMPO_OPERATIVO - duracionPerdidaProduccion;
                                                        hora.TIEMPO_BRUTO = hora.TIEMPO_OPERATIVO - duracionParoMenor;
                                                        ret = ProduccionLlenadoraHora.Editar(hora);
                                                        duracionPerdidaProduccion = 0;
                                                        duracionParoMenor = 0;
                                                    }
                                                }
                                                else
                                                {
                                                    //Solo guardamos lo que entre y el resto para otra hora
                                                    hora.TIEMPO_NETO = 0;
                                                    hora.TIEMPO_BRUTO = 0;
                                                    duracionPerdidaProduccion -= hora.TIEMPO_OPERATIVO;
                                                    duracionParoMenor -= hora.TIEMPO_OPERATIVO;
                                                    ret = ProduccionLlenadoraHora.Editar(hora);
                                                }
                                            }
                                            else
                                            {
                                                //Si es 0 actualizamos el neto y bruto e ya
                                                hora.TIEMPO_NETO = 0;
                                                hora.TIEMPO_BRUTO = 0;
                                                ret = ProduccionLlenadoraHora.Editar(hora);
                                            }
                                        }

                                    }
                                }
                                else
                                {
                                    //Solo hay un registro en esa hora
                                    primeraHora.TIEMPO_OPERATIVO = primeraHora.TIEMPO_PLANIFICADO - duracionParoMayor;
                                    primeraHora.TIEMPO_NETO = (primeraHora.TIEMPO_OPERATIVO - duracionPerdidaProduccion) < 0 ? 0 : primeraHora.TIEMPO_OPERATIVO - duracionPerdidaProduccion;
                                    primeraHora.TIEMPO_BRUTO = (primeraHora.TIEMPO_OPERATIVO - duracionParoMenor) < 0 ? 0 : primeraHora.TIEMPO_OPERATIVO - duracionParoMenor;

                                    ret = ProduccionLlenadoraHora.Editar(primeraHora);
                                }

                            }
                        }
                    }
                }
            }

            return ret;
        }

        internal ReturnValue CheckeaParo(dynamic datos)
        {
            ReturnValue ret = new ReturnValue(true);
            DateTime fecha = DateTime.Parse(datos.fecha.ToString());
            string llenadora = datos.llenadora.ToString();
            string linea = datos.linea.ToString();
            int duracionHoras = datos.duracionHoras != null ? int.Parse(datos.duracionHoras.ToString()) : 0;
            int duracionMinutos = datos.duracionMinutos != null ? int.Parse(datos.duracionMinutos.ToString()) : 0;
            int duracionSegundos = datos.duracionSegundos != null ? int.Parse(datos.duracionSegundos.ToString()) : 0;
            string llenadoraID = "";
            int accion = datos.accion != null ? int.Parse(datos.accion.ToString()) : 0;
            int idParo = accion == 1 ?int.Parse(datos.id.ToString()): 0;
            
            //Validación para que el paro esté entre el turno
            Turnos turnoInicial = new Turnos();
            Turnos turnoFinal = new Turnos();

            DateTime fechaFin = fecha.AddSeconds(duracionHoras * 3600 + duracionMinutos * 60 + duracionSegundos);

            using (MESEntities context = new MESEntities())
            {
                llenadoraID = context.Maquinas.AsNoTracking().Where(p => p.Nombre.Equals(llenadora)).FirstOrDefault().Id;
                turnoInicial = context.Turnos.AsNoTracking().Where(m => m.FinTurno > fecha && fecha >= m.InicioTurno && m.Linea.Equals(linea)).FirstOrDefault();
                turnoFinal = context.Turnos.AsNoTracking().Where(m => m.FinTurno >= fechaFin && fechaFin >= m.InicioTurno && m.Linea.Equals(linea)).FirstOrDefault();
            }

            if (turnoFinal == null || turnoInicial == null)
                return new ReturnValue(false, -3, IdiomaController.GetResourceName("EL_PARO_NO_PUEDE_PRODUCIRSE_FUERA_TURNO"));

            if (turnoInicial.Id != turnoFinal.Id)
                return new ReturnValue(false, -2, IdiomaController.GetResourceName("EL_PARO_NO_PUEDE_DURAR_MAS_RESTANTE"));

            List<COB_MSM_PAROS_PERDIDAS> parosTurno = new List<COB_MSM_PAROS_PERDIDAS>();
            
            //Se obtienen todos los paros y perdidas entre el inicio del turno y el fin del paro o perdida que se quiere editar o crear
            DateTime FechaFinNuevo = new DateTime(fechaFin.Year, fechaFin.Month, fechaFin.Day, fechaFin.Hour, 0, 0);
            if (FechaFinNuevo != fechaFin)
                FechaFinNuevo = FechaFinNuevo.AddHours(1);

            parosTurno = ParosPerdidasBread.ObtenerParosPerdidasTurno(turnoInicial.InicioTurno.Value, FechaFinNuevo, llenadoraID, turnoInicial.Id, idParo).ToList();

            //Se separa por tramos toda la consulta de los paros y perdidas

            // TRAMO 1
            //FechaInicio_t1 = Fecha con minutos en 00:00
            //FechaFin_t1 = FechaInicio_t1 + 1 hora
            DateTime FechaInicio_t1 = new DateTime(fecha.Year, fecha.Month, fecha.Day, fecha.Hour, 0, 0);
            DateTime FechaFin_t1 = FechaInicio_t1.AddHours(1);

            //Se consulta la suma total de los minutos que ya existen en este primer tramo
            double sumaMinutosTramo = SumDiffParosPerdidasTramo(parosTurno, FechaInicio_t1, FechaFin_t1);

            //Se calculan los minutos que ocuparía el paro o perdida para dicho tramo
            double minutosParo_t1 = DiffMinutosDuracionTramo(fecha, fechaFin, FechaInicio_t1, FechaFin_t1);

            //Si pasan los 60 minutos existe solape
            if ((sumaMinutosTramo + minutosParo_t1) > 60)
            {
                return new ReturnValue(false, -1, IdiomaController.GetResourceName("EXISTE_SOLAPAMIENTO"));
            }
            // FIN TRAMO 1

            // TRAMO 2
            //FechaInicio_t2 = FechaFin con minutos en 00:00
            //FechaFin_t2 = FechaInicio_t2 + 1 hora
            DateTime FechaInicio_t2 = new DateTime(fechaFin.Year, fechaFin.Month, fechaFin.Day, fechaFin.Hour, 0, 0);
            DateTime FechaFin_t2 = FechaInicio_t2.AddHours(1);

            //Se consulta la suma total de los minutos que ya existen en este segundo tramo
            double sumaMinutosTramo2 = SumDiffParosPerdidasTramo(parosTurno, FechaInicio_t2, FechaFin_t2);
            //Se calculan los minutos que ocuparía el paro o perdida para dicho tramo
            double minutosParo_t2 = DiffMinutosDuracionTramo(fecha, fechaFin, FechaInicio_t2, FechaFin_t2);
            //Si pasan los 60 minutos existe solape
            if ((sumaMinutosTramo2 + minutosParo_t2) > 60)
            {
                return new ReturnValue(false, -1, IdiomaController.GetResourceName("EXISTE_SOLAPAMIENTO"));
            }
            // FIN TRAMO 2

            // TRAMO 3 - Solo si existe un tramo completo de una hora entre el inicio del paro/perdida hasta el fin.
            //Si FechaFin_t1 != FechaFin_t2
            // FechaInicio_t3 = FechaFin_t1
            // FechaFin_t3 = FechaFin con minutos en 00:00
            if (FechaFin_t1.Hour < FechaInicio_t2.Hour)
            {
                DateTime FechaInicio_t3 = FechaFin_t1;
                DateTime FechaFin_t3 = new DateTime(fechaFin.Year, fechaFin.Month, fechaFin.Day, fechaFin.Hour, 0, 0);
                double sumaMinutosTramo3 = SumDiffParosPerdidasTramo(parosTurno, FechaInicio_t3, FechaFin_t3);
                //Si existe al menos un paro en este tramo existirá solapamiento 
                if ((sumaMinutosTramo3) > 0)
                {
                    return new ReturnValue(false, -1, IdiomaController.GetResourceName("EXISTE_SOLAPAMIENTO"));
                }
            }

            return ret;
        }

        internal static ParosPerdidas ObtenerParoPerdidasLlenadoraPorId(long IdParoPerdida)
        {
            ParosPerdidas paroPerdida = null;

            using (MESEntities context = new MESEntities())
            {
                paroPerdida = context.ParosPerdidas.AsNoTracking().Where(p => p.Id.Equals(IdParoPerdida)).FirstOrDefault();
            }

            return paroPerdida;
        }

        /// <summary>
        /// Método que retorna la cantidad de minutos que hay en un tramo de hora, segun la fecha de inicio y fin
        /// </summary>
        /// <param name="parosTurno">El listado de los paros y perdidas</param>
        /// <param name="fechaInicio">Fecha de Inicio del tramo</param>
        /// <param name="fechaFin">Fecha de fin del tramo</param>
        /// <returns></returns>
        private double SumDiffParosPerdidasTramo(List<COB_MSM_PAROS_PERDIDAS> parosTurno, DateTime fechaInicio, DateTime fechaFin)
        {
            double result = 0;
            parosTurno = parosTurno.Where(p => (p.INICIO >= fechaInicio && p.INICIO < fechaFin) ||
                                               (fechaInicio >= p.INICIO && fechaInicio < p.FIN)).ToList();
            
            foreach (var item in parosTurno)
            {
                //Se modifica la fecha de fin para las perdidas ya que no se tiene bien guardada en Simatic
                item.FIN = item.FK_PAROS_ID == 2 ? item.INICIO.AddSeconds(item.DURACION) : item.FIN;
                
                if (item.INICIO < fechaInicio)
                {
                    TimeSpan _diff = item.FIN - fechaInicio;
                    result += _diff.TotalMinutes;
                }
                else if (item.FIN > fechaFin)
                {
                    TimeSpan _diff = fechaFin - item.INICIO;
                    result += _diff.TotalMinutes;
                }
                else if (item.INICIO >= fechaInicio && item.FIN <= fechaFin)
                {
                    result += item.DURACION > 0 ? item.DURACION / 60 : 0;
                }
            }

            return result;
        }

        /// <summary>
        /// Método que obtiene la cantidad de minutos que puede ocupar un paro o perdida en un tramo de hora
        /// </summary>
        /// <param name="fechaInicioParo">Fecha de Inicio del Paro o Perdida</param>
        /// <param name="fechaFinParo">Fecha de Fin del Paro o Perdida</param>
        /// <param name="fechaInicioTramo">Fecha de inicio del tramo seleccionado</param>
        /// <param name="fechaFinTramo">Fecha de fin del tramo seleccionado</param>
        /// <returns></returns>
        private double DiffMinutosDuracionTramo(DateTime fechaInicioParo, DateTime fechaFinParo, DateTime fechaInicioTramo, DateTime fechaFinTramo)
        {
            double result = 0;

            if (fechaInicioParo < fechaInicioTramo)
            {
                TimeSpan _diff = fechaFinParo - fechaInicioTramo;
                result += _diff.TotalMinutes;
            }
            else if (fechaFinParo > fechaFinTramo)
            {
                TimeSpan _diff = fechaFinTramo - fechaInicioParo;
                result += _diff.TotalMinutes;
            }
            else if (fechaInicioParo >= fechaInicioTramo && fechaFinParo <= fechaFinTramo)
            {
                TimeSpan _diff = fechaFinParo - fechaInicioParo;
                result += _diff.TotalMinutes;
            }

            return result;
        }

        public List<DTO_ParosPerdidas> ObtenerParosSolicitudMantenimiento (int idSolicitud)
        {
            try
            {
                var lista = new List<ParosPerdidas>();

                using (MESEntities context = new MESEntities())
                {
                    var paros = context.MantenimientoParosRelaciones.AsNoTracking().Where(e => e.IdMantenimientoIntervenciones == idSolicitud).Select(e => e.IdParo).ToList();

                    lista = context.ParosPerdidas.AsNoTracking().Where(e => paros.Contains((int)e.Id)).ToList();
                }

                return lista.Select(e => Mapper_ParosPerdidas.Mapper_ParosPerdidas_toDTO(e)).ToList();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_ParosPerdidas.ObtenerParosSolicitudMantenimiento", "WEB-WO", "Sistema");
                return null;
            }
        }

        public async Task<decimal> ObtenerPorcentajeSinJustificar(int idTurno)
        {
            var result = await _api.GetPostsAsync<decimal>(string.Concat(_urlParosPerdidas, "PorcentajeSinJustificar?idTurno=", idTurno));

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_ParosPerdidasRelevoTurno>>> ObtenerParosPerdidasRelevoTurno(int idTurno, bool porDuracion)
        {
            var result = await _api.GetPostsAsync< DTO_RespuestaAPI<List<DTO_ParosPerdidasRelevoTurno>>>(string.Concat(_urlParosPerdidas, "RelevoTurno?idTurno=", idTurno, "&porDuracion=", porDuracion));

            return result;
        }
    }
}
