using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using BreadMES.Envasado;
using MSM.BBDD.Planta;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using MSM.Controllers.Planta;
using MSM.BBDD.Model;
using System.Linq;
using MSM.BBDD.Envasado;
using MSM.DTO;
using System.Threading.Tasks;
using Clients.ApiClient.Contracts;
using MSM.Mappers.DTO;

namespace MSM.BBDD
{
    public class DAO_AccionMejora: IDAO_AccionMejora
    {
        private IApiClient _api;
        private string _urlArranques;
        private string _urlCambios;
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();

        public DAO_AccionMejora()
        {

        }

        public DAO_AccionMejora(IApiClient api)
        {
            _api = api;
            _urlArranques = string.Concat(UriEnvasado, "api/Arranques/");
            _urlCambios = string.Concat(UriEnvasado, "api/Cambios/");

        }

        public List<AccionMejora> ObtenerAccionesMejora(dynamic datos)
        {
            DateTime fechaInicio = ((DateTime)datos.fInicio.Value).ToLocalTime();
            DateTime fechaFin = ((DateTime)datos.fFin.Value).ToLocalTime();
            int tipo = (int)datos.tipo;
            List<AccionMejora> acciones = new List<AccionMejora>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerAccionesMejora]", conexion);
            comando.Parameters.AddWithValue("@fechaInicio", fechaInicio);
            comando.Parameters.AddWithValue("@fechaFin", fechaFin);
            comando.Parameters.AddWithValue("@tipo", tipo);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    acciones.Add(new AccionMejora()
                    {
                        id = DataHelper.GetLong(dr, "ID_ACCION_MEJORA"),
                        descripcionProblema = DataHelper.GetString(dr, "DESCRIPCION_PROBLEMA"),
                        causa = DataHelper.GetString(dr, "CAUSA"),
                        accionPropuesta = DataHelper.GetString(dr, "ACCION_PROPUESTA"),
                        observaciones = DataHelper.GetString(dr, "OBSERVACIONES"),
                        usuario = DataHelper.GetString(dr, "USUARIO"),
                        fechaAlta = DataHelper.GetDateForFilter(dr, "FECHA_ALTA"),
                        fechaFinalizada = DataHelper.GetNullableDateForFilter(dr, "FECHA_FINALIZADA"),
                        tipo = (AccionMejora.TiposAccionMejora)DataHelper.GetShort(dr, "TIPO"),
                        idLinea = DataHelper.GetString(dr, "ID_LINEA"),
                        numeroLinea = DataHelper.GetNullableInt(dr, "NumeroLinea") != null ? DataHelper.GetNullableInt(dr, "NumeroLinea").ToString() : string.Empty,
                        nombreLinea = DataHelper.GetString(dr, "NombreLinea"),
                        idMaquina = DataHelper.GetString(dr, "ID_MAQUINA"),
                        nombreMaquina = string.IsNullOrEmpty(DataHelper.GetString(dr, "NombreMaquina")) ? string.Empty : 
                            char.ToUpper(DataHelper.GetString(dr, "NombreMaquina")[0]) + DataHelper.GetString(dr, "NombreMaquina").Substring(1).ToLower(),
                        idEquipoConstructivo = DataHelper.GetString(dr, "ID_EQUIPO_CONSTRUCTIVO"),
                        nombreEquipoConstructivo = string.IsNullOrEmpty(DataHelper.GetString(dr, "NombreEquipoConstructivo")) ? string.Empty :
                            char.ToUpper(DataHelper.GetString(dr, "NombreEquipoConstructivo")[0]) + DataHelper.GetString(dr, "NombreEquipoConstructivo").Substring(1).ToLower(),
                        numeroLineaDescripcion = DataHelper.GetString(dr, "NumeroLineaDescripcion") != null ? DataHelper.GetString(dr, "NumeroLineaDescripcion").ToString() : string.Empty,
                        idTurno = DataHelper.GetInt(dr, "IdTurno"),
                        fechaTurno = DataHelper.GetNullableDate(dr, "FechaTurno") == null ? new DateTime() : DataHelper.GetDate(dr, "FechaTurno"),
                        idTipoTurno = DataHelper.GetString(dr, "IdTipoTurno"),
                        tipoTurno = DataHelper.GetString(dr, "IdTipoTurno") == "" ? string.Empty : DAO_Turnos.GetTipoTurnoByType(DataHelper.GetInt(dr, "IdTipoTurno")).Nombre
                    });
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND",1,1,ex.Message+" -> "+ex.StackTrace,"DAO_AccionMejora.obtenerAccionesMejora","WEB-ENVASADO","Sistema");

                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ACCIONES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return acciones;
        }

        public List<ParosPerdidas> ObtenerAccionMejoraParosPerdidas(int idMejora)
        {
            List<ParosPerdidas> parosPerdidas = new List<ParosPerdidas>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerAccionMejoraParosPerdidas]", conexion);
            comando.Parameters.AddWithValue("@idMejora", idMejora);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();

                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    parosPerdidas.Add(new ParosPerdidas() 
                    {
                        Id = DataHelper.GetLong(dr, "Id"),
                        IdTipoParoPerdida = DataHelper.GetShort(dr, "IdTipoParoPerdida"),
                        TipoParoPerdida = DataHelper.GetString(dr, "Tipo"),
                        DescLinea = DataHelper.GetString(dr, "DescLinea"),
                        IdLinea = DataHelper.GetShort(dr, "IdLinea"),
                        NumeroLineaDescripcion = DataHelper.GetString(dr, "NumeroLineaDescripcion"),
                        Turno = DataHelper.GetInt(dr, "Turno"),
                        FechaTurno = DataHelper.GetDate(dr,"FechaTurno"),
                        IdTipoTurno = DataHelper.GetString(dr, "IdTipoTurno"),
                        NombreTipoTurno = DataHelper.GetString(dr, "NombreTipoTurno"),
                        Justificado = DataHelper.GetNullableShort(dr, "Justificado"),
                        INICIO = DataHelper.GetDate(dr, "Inicio"),
                        FIN = DataHelper.GetDate(dr, "Fin"),
                        EquipoId = DataHelper.GetString(dr, "EquipoId"),
                        EquipoNombre = DataHelper.GetString(dr, "EquipoNombre"),
                        MaquinaCausaId = DataHelper.GetString(dr, "MaquinaCausaId"),
                        MaquinaCausaNombre = string.IsNullOrEmpty(DataHelper.GetString(dr, "MaquinaCausaNombre")) ? string.Empty :
                            char.ToUpper(DataHelper.GetString(dr, "MaquinaCausaNombre")[0]) + DataHelper.GetString(dr, "MaquinaCausaNombre").Substring(1).ToLower(),
                        MotivoNombre = DataHelper.GetString(dr, "MotivoNombre"),
                        CausaNombre = DataHelper.GetString(dr, "CausaNombre"),
                        MotivoId =  DataHelper.GetString(dr, "MotivoId"),
                        CausaId = DataHelper.GetString(dr, "CausaId"),
                        EquipoConstructivoNombre = string.IsNullOrEmpty(DataHelper.GetString(dr, "EquipoConstructivoNombre")) ? string.Empty :
                            char.ToUpper(DataHelper.GetString(dr, "EquipoConstructivoNombre")[0]) + DataHelper.GetString(dr, "EquipoConstructivoNombre").Substring(1).ToLower(),
                        Descripcion = string.IsNullOrEmpty(DataHelper.GetString(dr, "Descripcion")) ? string.Empty :
                            char.ToUpper(DataHelper.GetString(dr, "Descripcion")[0]) + DataHelper.GetString(dr, "Descripcion").Substring(1).ToLower(),
                        Observaciones = DataHelper.GetString(dr, "Observaciones"),
                        NumeroParosMenores = DataHelper.GetInt(dr, "NumeroParosMenores"),
                        DuracionParosMenores = DataHelper.GetNullableDouble(dr, "DuracionParosMenores"),
                        DuracionParoMayor = DataHelper.GetNullableDouble(dr, "DuracionParoMayor"),
                        DuracionBajaVelocidad = DataHelper.GetNullableDouble(dr, "DuracionBajaVelocidad"),
                        InicioLocal = DataHelper.GetDate(dr,"InicioLocal"),
                        FinLocal = DataHelper.GetDate(dr,"FinLocal"),
                        EquipoDescripcion = DataHelper.GetString(dr, "EquipoDescripcion"),
                        Duracion = DataHelper.GetNullableDouble(dr, "Duracion").HasValue ? DataHelper.GetNullableDouble(dr, "Duracion").Value : 0
                    });                    
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.obtenerAccionMejoraParosPerdidas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PAROS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return parosPerdidas;
        }

        public void InsertarAccionMejora(AccionMejora accion) 
        {
            try
            {
                accion.idTurno = ObtenerTurnoAccionMejora(accion);

                COB_MSM_ACCIONES_DE_MEJORA nuevaAccionMejoraBread = new COB_MSM_ACCIONES_DE_MEJORA();
                
                nuevaAccionMejoraBread.CAUSA = accion.causa;
                nuevaAccionMejoraBread.ACCION_PROPUESTA = accion.accionPropuesta;
                nuevaAccionMejoraBread.OBSERVACIONES = accion.observaciones;
                nuevaAccionMejoraBread.USUARIO = accion.usuario;
                nuevaAccionMejoraBread.FECHA_ALTA = accion.fechaAlta;

                if (accion.fechaFinalizada.HasValue)
                {
                    nuevaAccionMejoraBread.FECHA_FINALIZADA = accion.fechaFinalizada.Value;
                }

                nuevaAccionMejoraBread.DESCRIPCION_PROBLEMA = accion.descripcionProblema;
                nuevaAccionMejoraBread.TIPO = (short) accion.tipo;
                nuevaAccionMejoraBread.ID_LINEA = accion.idLinea;
                nuevaAccionMejoraBread.ID_MAQUINA = accion.idMaquina;
                
                if (!string.IsNullOrEmpty(accion.idEquipoConstructivo))
                {
                    nuevaAccionMejoraBread.ID_EQUIPO_CONSTRUCTIVO = accion.idEquipoConstructivo;
                }

                nuevaAccionMejoraBread.SHC_WORK_SCHED_DAY_PK = accion.idTurno;

                AccionesMejoraBread.Insertar(nuevaAccionMejoraBread);

                accion.id = nuevaAccionMejoraBread.ID_ACCION_MEJORA;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.insertarAccionMejora", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_ACCION"));
            }
        }

        public void InsertarAccionMejoraParoMayor(long idMejora, long idParoMayor) 
        {
            try
            {
                COB_MSM_ACCIONES_PAROS nuevaAccionParo = new COB_MSM_ACCIONES_PAROS();
                nuevaAccionParo.FK_ACCIONES_DE_MEJORA_ID = idMejora;
                nuevaAccionParo.ID_PARO = idParoMayor;
                AccionesMejoraBread.insertarAccionMejoraParo(nuevaAccionParo);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.insertarAccionMejoraParoMayor", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_PARO"));
            }
        }

        public void InsertarAccionMejoraCambio(long idMejora, string idCambio)
        {
            try
            {
                COB_MSM_ACCIONES_CAMBIOS nuevaAccionCambios = new COB_MSM_ACCIONES_CAMBIOS();
                nuevaAccionCambios.FK_ACCION_MEJORA_ID = idMejora;
                nuevaAccionCambios.ID_CAMBIO = idCambio;
                AccionesMejoraBread.insertarAccionMejoraCambios(nuevaAccionCambios);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.insertarAccionMejoraCambio", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_CAMBIO"));
            }
        }

        public void InsertarAccionMejoraArranque(long idMejora, string idArranque)
        {
            try
            {
                COB_MSM_ACCIONES_ARRANQUES nuevaAccionArranque = new COB_MSM_ACCIONES_ARRANQUES();
                nuevaAccionArranque.FK_ACCION_MEJORA_ID = idMejora;
                nuevaAccionArranque.ID_ARRANQUE = idArranque;
                AccionesMejoraBread.insertarAccionMejoraArranque(nuevaAccionArranque);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.insertarAccionMejoraArranque", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_ARRANQUE"));
            }
        }

        public void ActualizarAccionMejora(AccionMejora accion) 
        {
            try
            {
                accion.idTurno = ObtenerTurnoAccionMejora(accion);

                COB_MSM_ACCIONES_DE_MEJORA accionMejoraBread = new COB_MSM_ACCIONES_DE_MEJORA();

                accionMejoraBread.ID_ACCION_MEJORA = accion.id;
                accionMejoraBread.CAUSA = accion.causa;
                accionMejoraBread.ACCION_PROPUESTA = accion.accionPropuesta;
                accionMejoraBread.OBSERVACIONES = accion.observaciones;
                accionMejoraBread.USUARIO = accion.usuario;
                accionMejoraBread.FECHA_ALTA = accion.fechaAlta;

                if (accion.fechaFinalizada.HasValue)
                {
                    accionMejoraBread.FECHA_FINALIZADA = accion.fechaFinalizada.Value;
                }
                else
                {
                    accionMejoraBread.SetPropertyValue("FECHA_FINALIZADA", null);
                }

                accionMejoraBread.DESCRIPCION_PROBLEMA = accion.descripcionProblema;
                accionMejoraBread.TIPO = (short)accion.tipo;
                accionMejoraBread.ID_LINEA = accion.idLinea;
                accionMejoraBread.ID_MAQUINA = accion.idMaquina;

                if (!string.IsNullOrEmpty(accion.idEquipoConstructivo))
                {
                    accionMejoraBread.ID_EQUIPO_CONSTRUCTIVO = accion.idEquipoConstructivo;
                }
                else
                {
                    accionMejoraBread.ID_EQUIPO_CONSTRUCTIVO = null;
                }

                accionMejoraBread.SHC_WORK_SCHED_DAY_PK = accion.idTurno;

                AccionesMejoraBread.Actualizar(accionMejoraBread);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.ActualizarAccionMejora", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_ACCION"));
            }
        }

        private static int ObtenerTurnoAccionMejora(AccionMejora accion)
        {
            if (accion.fechaTurno == new DateTime() || accion.idTipoTurno == string.Empty)
            {
                return 0;
            }
            else
            {
                using (MESEntities context = new MESEntities())
                {
                    var fechaTurno = accion.fechaTurno.ToLocalTime();
                    var turno = context.Turnos.AsNoTracking().Where(t => t.Linea == accion.idLinea && t.Fecha == fechaTurno && t.IdTipoTurno == accion.idTipoTurno).FirstOrDefault();
                    return turno == null ? 0 : turno.Id;
                }
            }
        }

        public void EliminarAccionMejora(int idAccionMejora)
        {
            try
            {   
                AccionesMejoraBread.eliminarAccionMejora(idAccionMejora);    
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.eliminarAccionMejora", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_ACCION"));
            }
        }

        public void EliminarAccionMejoraParosPerdidas(int idMejora)
        {
            try
            {
                AccionesMejoraBread.eliminarAccionMejoraParos(idMejora);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.eliminarAccionMejoraParosPerdidas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR__ELIMINANDO"));
            }
        }

        public void EliminarAccionMejoraCambios(int idMejora)
        {
            try
            {
                AccionesMejoraBread.eliminarAccionMejoraCambios(idMejora);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.eliminarAccionMejoraCambios", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR__ELIMINANDO_ASIGNACION"));
            }
        }

        public void EliminarAccionMejoraArranques(int idAccion)
        {
            try
            {
                AccionesMejoraBread.eliminarAccionMejoraArranques(idAccion);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.eliminarAccionMejoraArranques", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR__ELIMINANDO_ASIGNACION_DE"));
            }
        }

        public List<OrdenesCambio> ObtenerAccionMejoraCambios(int idMejora)
        {
            List<OrdenesCambio> cambios = new List<OrdenesCambio>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerAccionMejoraCambios]", conexion);
            comando.Parameters.AddWithValue("@idMejora", idMejora);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();

                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    cambios.Add(new OrdenesCambio()
                    {
                        Id = DataHelper.GetString(dr, "Id"),
                        Linea = DataHelper.GetNullableInt(dr,"Linea"),
                        DescripcionLinea = DataHelper.GetString(dr, "DescripcionLinea"),
                        InicioReal = DataHelper.GetNullableDateForFilter(dr,"InicioReal"),
                        TipoTurno = DataHelper.GetString(dr,"TipoTurno"),
                        TipoTurnoId = DataHelper.GetInt(dr, "TipoTurnoId").ToString(),
                        FechaTurno = DataHelper.GetDateForFilter(dr,"FechaTurno"),
                        IDProductoEntrante = (string)dr["IDProductoEntrante"],
                        ProductoEntrante = string.Join(" ", DataHelper.GetString(dr, "ProductoEntrante").Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)),
                        IDProductoSaliente = (string)dr["IDProductoSaliente"],
                        ProductoSaliente = string.Join(" ", DataHelper.GetString(dr, "ProductoSaliente").Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)),
                        MinutosFinal1 = DataHelper.GetNullableInt(dr, "MinutosFinal1"),
                        MinutosFinal2 = DataHelper.GetNullableInt(dr, "MinutosFinal2"),
                        MinutosObjetivo1 = DataHelper.GetInt(dr, "MinutosObjetivo1"),
                        MinutosObjetivo2 = DataHelper.GetInt(dr, "MinutosObjetivo2"),
                        NumLineaDescripcion = DataHelper.GetString(dr,"NumLineaDescripcion")
                    });
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.obtenerAccionMejoraCambios", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CAMBIOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return cambios;
        }

        public async Task<List<DTO_OrdenesArranques>> ObtenerAccionMejoraArranquesFiltro(string idLinea, int idTipoTurno, DateTime fechaTurno)
        {
            var result = await _api.GetPostsAsync<List<DTO_OrdenesArranques>>(string.Concat(_urlArranques, "ArranquesFiltro?idLinea=", idLinea, "&idTipoTurno=" + idTipoTurno, "&fechaTurno=" + fechaTurno.ToString()));

            return result;
        }

        public async Task<List<DTO_OrdenesCambios>> ObtenerAccionMejoraCambiosFiltro(string idLinea, int idTipoTurno, DateTime fechaTurno)
        {
            var result = await _api.GetPostsAsync<List<DTO_OrdenesCambios>>(string.Concat(_urlCambios, "CambiosFiltro?idLinea=", idLinea, "&idTipoTurno=" + idTipoTurno, "&fechaTurno=" + fechaTurno.ToString()));

            return result;
        }

        internal List<OrdenesArranque> ObtenerAccionMejoraArranques(int idMejora)
        {
            List<OrdenesArranque> arranques = new List<OrdenesArranque>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerAccionMejoraArranques]", conexion);
            comando.Parameters.AddWithValue("@idMejora", idMejora);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();

                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    arranques.Add(new OrdenesArranque()
                    {
                        Id = DataHelper.GetString(dr, "Id"),
                        Linea = DataHelper.GetNullableInt(dr, "Linea"),
                        DescripcionLinea = DataHelper.GetString(dr, "DescripcionLinea"),
                        InicioReal = DataHelper.GetNullableDate(dr, "InicioReal"),
                        TipoTurno = DataHelper.GetString(dr, "TipoTurno"),
                        TipoTurnoId = DataHelper.GetString(dr, "TipoTurnoId"),
                        FechaTurno = DataHelper.GetNullableDate(dr, "FechaTurno"),
                        IDProductoEntrante = (string)dr["IDProductoEntrante"],
                        ProductoEntrante = string.Join(" ", DataHelper.GetString(dr, "ProductoEntrante").Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)),                        
                        MinutosFinal1 = (int)DataHelper.GetNullableInt(dr, "MinutosFinal1"),
                        MinutosFinal2 = (int)DataHelper.GetNullableInt(dr, "MinutosFinal2"),
                        MinutosObjetivo1 = (int)DataHelper.GetNullableInt(dr, "MinutosObjetivo1"),
                        MinutosObjetivo2 = (int)DataHelper.GetNullableInt(dr, "MinutosObjetivo2"),
                        TipoArranque = (int)DataHelper.GetNullableInt(dr,"TipoArranque"),
                        NumLineaDescripcion = DataHelper.GetString(dr, "NumLineaDescripcion"),
                    });
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.obtenerAccionMejoraArranques", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ARRANQUES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return arranques;
        }

        private static List<DTO_OrdenesArranques> ObtenerDtoArranques(List<OrdenesArranque> arranques)
        {
            List<TIPOS_ARRANQUE> tiposArranques = new List<TIPOS_ARRANQUE>();

            using (MESEntities context = new MESEntities())
            {
                tiposArranques = context.TIPOS_ARRANQUE.AsNoTracking().ToList();
            }

            List<DTO_OrdenesArranques> lstArranques = arranques.Join(tiposArranques, oa => oa.TipoArranque, ta => Convert.ToInt32(ta.ID_ARRANQUE), (oa, ta) => new
            {
                oa,
                ta
            }).Select(ot => new DTO_OrdenesArranques()
            {
                DescripcionLinea = ot.oa.DescripcionLinea,
                EstadoAct = ot.oa.EstadoAct,
                FechaTurno = ot.oa.FechaTurno,
                Id = ot.oa.Id,
                ID_ARRANQUE = ot.oa.ID_ARRANQUE,
                IdLinea = ot.oa.IdLinea,
                IDProductoEntrante = ot.oa.IDProductoEntrante,
                InicioReal = ot.oa.InicioReal,
                InicioUTC = ot.oa.InicioUTC,
                Linea = ot.oa.Linea,
                MinutosFinal1 = ot.oa.MinutosFinal1,
                MinutosFinal2 = ot.oa.MinutosFinal2,
                MinutosObjetivo1 = ot.oa.MinutosObjetivo1,
                MinutosObjetivo2 = ot.oa.MinutosObjetivo2,
                ProductoEntrante = ot.oa.ProductoEntrante,
                TipoArranque = ot.oa.TipoArranque,
                TipoTurno = ot.oa.TipoTurno,
                TipoTurnoId = ot.oa.TipoTurnoId,
                DESC_ARRANQUE = ot.ta.DESC_ARRANQUE,
                NumLineaDescripcion = ot.oa.NumLineaDescripcion,
                IndicadorLlenadora = ot.oa.IndicadorLlenadora,
                IndicadorPaletizadora = ot.oa.IndicadorPaletizadora,
                TiempoPreactor = ot.oa.TiempoPreactor
            }).ToList();

            return lstArranques;
        }

        public List<DTO_OrdenesArranques> ObtenerOrdenesArranque(dynamic datos)
        {
            string idLinea = datos.idLinea.Value.ToString();
            DateTime fechaInicio;
            DateTime fechaFin;

            if (idLinea == string.Empty)
            {
                fechaInicio = ((DateTime)datos.fechaInicio.Value).Date;
                fechaFin = ((DateTime)datos.fechaFin.Value).Date.AddDays(1);
            }
            else
            {
                fechaInicio = (DateTime)datos.fechaInicio.Value;
                fechaFin = (DateTime)datos.fechaFin.Value;
            }

            List<OrdenesArranque> arranques = new List<OrdenesArranque>();

            using (MESEntities contexto = new MESEntities())
            {
                if (idLinea == string.Empty)
                {
                    arranques = contexto.OrdenesArranque.AsNoTracking().Where(x => x.InicioReal >= fechaInicio && x.InicioReal <= fechaFin).OrderByDescending(x => x.InicioReal).ToList();
                }
                else
                {
                    arranques = contexto.OrdenesArranque.AsNoTracking().Where(x => x.IdLinea == idLinea && x.InicioReal >= fechaInicio && x.InicioReal <= fechaFin).OrderByDescending(x => x.InicioReal).ToList();
                }
            }

            arranques.All(o =>
            {
                o.ProductoEntrante = o.ProductoEntrante == null ? string.Empty : string.Join(" ", o.ProductoEntrante.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                o.InicioReal = o.InicioReal.HasValue ? o.InicioReal.Value.AddMilliseconds(-o.InicioReal.Value.Millisecond) : o.InicioReal;
                o.IndicadorLlenadora = o.MinutosFinal1 <= o.MinutosObjetivo1 ? "Verde" : "Rojo";
                o.IndicadorPaletizadora = o.MinutosFinal2 <= o.MinutosObjetivo2 ? "Verde" : "Rojo";
                return true;
            });

            List<DTO_OrdenesArranques> lstArranques = ObtenerDtoArranques(arranques);

            return lstArranques;
        }

        public List<OrdenesCambio> ObtenerOrdenesCambio(dynamic datos)
        {
            string idLinea = datos.idLinea.Value.ToString();
            DateTime fechaInicio;
            DateTime fechaFin;

            if (idLinea == string.Empty)
            {
                fechaInicio = ((DateTime)datos.fechaInicio.Value).Date;
                fechaFin = ((DateTime)datos.fechaFin.Value).Date.AddDays(1);
            }
            else
            {
                fechaInicio = (DateTime)datos.fechaInicio.Value;
                fechaFin = (DateTime)datos.fechaFin.Value;
            }

            List<OrdenesCambio> cambios = new List<OrdenesCambio>();

            using (MESEntities contexto = new MESEntities())
            {
                if (idLinea == string.Empty)
                {
                    cambios = contexto.OrdenesCambio.AsNoTracking().Where(x => x.InicioReal >= fechaInicio && x.InicioReal <= fechaFin).ToList();
                }
                else
                {
                    cambios = contexto.OrdenesCambio.AsNoTracking().Where(x => x.IdLinea == idLinea && x.InicioReal >= fechaInicio && x.InicioReal <= fechaFin).ToList();
                }
            }

            cambios.All(o =>
            {
                o.ProductoEntrante = o.ProductoEntrante == null ? string.Empty : string.Join(" ", o.ProductoEntrante.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                o.ProductoSaliente = o.ProductoSaliente == null ? string.Empty : string.Join(" ", o.ProductoSaliente.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                o.InicioReal = o.InicioReal.HasValue ? o.InicioReal.Value.AddMilliseconds(-o.InicioReal.Value.Millisecond) : o.InicioReal;
                o.IndicadorLlenadora = o.MinutosFinal1 <= o.MinutosObjetivo1 ? "Verde" : "Rojo";
                o.IndicadorPaletizadora = o.MinutosFinal2 <= o.MinutosObjetivo2 ? "Verde" : "Rojo";
                return true;
            });

            cambios = cambios.OrderByDescending(p => p.InicioReal).ToList();

            return cambios;
        }
    }
}