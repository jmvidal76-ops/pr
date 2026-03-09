using Autofac;
using BreadMES.Envasado;
using BreadMES.Envasado.Envasado;
using Clients.ApiClient.Contracts;
using Common.Models.Operation;
using Common.Models.RTDS;
using G2Base;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad;
using MSM.BBDD.LIMS;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using MSM.RealTime;
using MSM.Utilidades;
using ReglasMES;
using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads.Extensions;
using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads.Types;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using Siemens.SimaticIT.MM.Breads.Types;
using Siemens.SimaticIT.POM.Breads;
using Siemens.SimaticIT.POM.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_Orden: IDAO_Orden
    {
        private IApiClient _api;
        private string _urlLotes;
        private string _urlProductos;        
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();
        private static readonly IDAO_Ubicacion _daoUbicacion = AutofacContainerConfig.Container.Resolve<IDAO_Ubicacion>();
        private static readonly IDAO_LIMS _daoLims = AutofacContainerConfig.Container.Resolve<IDAO_LIMS>();
        private static readonly string _connectionString = ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString;

        public DAO_Orden()
        {

        }

        public DAO_Orden(IApiClient api)
        {
            _api = api;
            _urlLotes = string.Concat(UriEnvasado, "api/lotes/");
            _urlProductos = string.Concat(UriEnvasado, "api/productos/");
        }

        public Orden ObtenerOrden(string idOrden)
        {
            Orden orden = new Orden();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerOrden]", conexion);
            comando.Parameters.AddWithValue("@orden", idOrden);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    string idLinea = DataHelper.GetString(dr, "Linea");
                    Linea linea = PlantaRT.planta.lineas.Find(l => l.id == idLinea);

                    string id = DataHelper.GetString(dr, "Id");
                    string descripcion = DataHelper.GetString(dr, "Descripcion");
                    EstadoOrden estadoOrden = new EstadoOrden(DataHelper.GetInt(dr, "IdEstadoAct"));

                    string idTipoProducto = dr["IdTipoProducto"].ToString();
                    string tipoProductoName = dr["TipoProducto"].ToString();
                    TipoProducto tipoProducto = new TipoProducto(idTipoProducto, tipoProductoName);

                    string idProducto = dr["IdProducto"].ToString();
                    string productoName = string.Join(" ", dr["Producto"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                    string udMedida = dr["udMedida"].ToString();
                    Producto producto = new Producto(idProducto, productoName, udMedida, tipoProducto, null)
                    {
                        hectolitros = (double)DataHelper.GetDecimal(dr, "HectolitrosProducto")
                    };

                    NivelDisponibilidad nivelDisponibilidad = new NivelDisponibilidad(2, "Medio", "greenBall.png");

                    int cantidadPlanificada = (int)dr.GetDouble(dr.GetOrdinal("CantidadPlanificada"));
                    DateTime fechaInicioReal = DataHelper.GetDate(dr, "FecIniReal");
                    DateTime fechaFinReal = DataHelper.GetDate(dr, "FecFinReal");
                    DateTime fechaIniEstimada = DataHelper.GetDate(dr, "FecIniEstimada");
                    DateTime fechaFinEstimada = DataHelper.GetDate(dr, "FecFinEstimada");

                    DatosProduccionOrden datosProdOrden = new DatosProduccionOrden()
                    {
                        //paletsAlmacen = (int)dr.GetDouble(dr.GetOrdinal("CantidadProducida")),
                        cantidadPicosCajas = Convert.ToInt32(dr["PicosCajas"])
                    };

                    double velocidadNominad = DataHelper.GetDouble(dr, "VelocidadNominal");
                    double oeeObjetivo = DataHelper.GetDouble(dr, "OEEObjetivo");
                    double oeeCritico = DataHelper.GetDouble(dr, "OEECritico");
                    string codigoJDE = DataHelper.GetString(dr, "CodigoJDE");
                    double oee = DataHelper.GetDouble(dr, "OEE");
                    double calidad = DataHelper.GetDouble(dr, "Calidad");
                    int rechazos = DataHelper.GetInt(dr, "Rechazos");
                    DateTime rowUpdated = DataHelper.GetDate(dr, "RowUpdated");
                    double? oeePreactor = dr["OEEPreactor"] == DBNull.Value ? null : (double?)dr["OEEPreactor"];
                    int envasesPorPalet = DataHelper.GetInt(dr, "EnvasesPorPalet");
                    int cajasPorPalet = DataHelper.GetInt(dr, "CajasPorPalet");
                    string idOrdenPadre = DataHelper.GetString(dr, "IdOrdenPadre");
                    int idSuborden = DataHelper.GetInt(dr, "IdSuborden");
                    Tipos.Pausa tipoPausa = DataHelper.GetString(dr, "CausaPausa").ToEnum<Tipos.Pausa>();

                    orden = new Orden(id, idOrdenPadre, idSuborden, descripcion, estadoOrden, producto, nivelDisponibilidad, cantidadPlanificada,
                                      fechaInicioReal, fechaFinReal, fechaIniEstimada, fechaFinEstimada, datosProdOrden, velocidadNominad,
                                      oeeObjetivo, oeeCritico, codigoJDE, oee, calidad, rechazos,ref  linea, rowUpdated, oeePreactor)
                    {
                        CajasPorPalet = cajasPorPalet,
                        EnvasesPorPalet = envasesPorPalet,
                        TipoPausa = tipoPausa
                    };
                }

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerOrden", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDEN") + orden.id);
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return orden;
        }

        internal static int obtenerSiEsArranqueOCambio(string lineaPath)
        {
            //-1 sino hay que hacer nada /  0 si arranque / 1 si cambio
            int tipoArranque;
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerSiEsArranqueOCambio]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@lineaPath", lineaPath);
                        SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.VarChar);
                        returnParam.Direction = ParameterDirection.ReturnValue;
                        command.Parameters.Add(returnParam);
                        command.CommandTimeout = 20;

                        connection.Open();
                        command.ExecuteNonQuery();
                        tipoArranque = returnParam.Value == DBNull.Value ? 0 : Convert.ToInt16(returnParam.Value);
                    }
                }
            }
            catch (Exception ex)
            {
                tipoArranque = -1;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerSiEsArranqueOCambio", "WEB-ENVASADO", "Sistema");
            }

            return tipoArranque;
        }

        internal static int obtenerSiWOEstaHaciendoConsolidados(string woid)
        {
            int bloqueado; // 0 no bloqueada 1 bloqueada
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerSiWOEstaHaciendoConsolidados]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@woId", woid);
                        SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.VarChar);
                        returnParam.Direction = ParameterDirection.ReturnValue;
                        command.Parameters.Add(returnParam);
                        command.CommandTimeout = 20;

                        connection.Open();
                        command.ExecuteNonQuery();
                        bloqueado = returnParam.Value == DBNull.Value ? 0 : Convert.ToInt16(returnParam.Value);
                    }
                }
            }
            catch (Exception ex)
            {
                bloqueado = 0;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerSiWOEstaHaciendoConsolidados", "WEB-ENVASADO", "Sistema");
            }

            return bloqueado;
        }

        public string obtenerCodigoNuevaWO(string codBase)
        {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerCodigoNuevaWO]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@codBase", codBase);
            string codigo = "";
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                if (dr.Read())
                {
                    codigo = (int.Parse(dr.GetString(0)) + 1).ToString("D5");
                }
                else
                {
                    codigo = "00001";
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.obtenerCodigoNuevaWO", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerCodigoNuevaWO", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_NUEVO"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
            return codigo.ToString();

        }

        public List<Orden> obtenerOrdenesIntervalo(string idLinea, DateTime fIni, DateTime fFin)
        {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerOrdenesIntervalo]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@linea", idLinea);
            comando.Parameters.AddWithValue("@fIni", fIni);
            comando.Parameters.AddWithValue("@fFin", fFin);
            List<Orden> ordenes = new List<Orden>();

            try
            {
                Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    ordenes.Add(new Orden(dr["Id"].ToString(), dr["IdOrdenPadre"].ToString(), (int)dr["IdSuborden"], dr["Descripcion"].ToString(),
                        new EstadoOrden((int)dr["IdEstadoAct"]),
                        new Producto(dr["IdProducto"].ToString(), dr["Producto"].ToString(), dr["udMedida"].ToString(),
                                     new TipoProducto(dr["IdTipoProducto"].ToString(), dr["TipoProducto"].ToString()), null)
                        {
                            hectolitros = (double)DataHelper.GetDecimal(dr, "HectolitrosProducto")
                        },
                        new NivelDisponibilidad(2, "Medio", "greenBall.png"),
                        (int)dr.GetDouble(dr.GetOrdinal("CantidadPlanificada")),
                        DataHelper.GetDate(dr, "FecIniReal"),
                        DataHelper.GetDate(dr, "FecFinReal"),
                        DataHelper.GetDate(dr, "FecIniEstimada"),
                        DataHelper.GetDate(dr, "FecFinEstimada"),
                        new DatosProduccionOrden()
                        {
                            // paletsAlmacen = (int)dr.GetDouble(dr.GetOrdinal("CantidadProducida"))
                        },
                        DataHelper.GetDouble(dr, "VelocidadNominal"),
                        DataHelper.GetDouble(dr, "oeeObjetivo"),
                        DataHelper.GetDouble(dr, "oeeCritico"),
                        DataHelper.GetString(dr, "CodigoJDE"),
                        DataHelper.GetDouble(dr, "OEE"),
                        DataHelper.GetDouble(dr, "Calidad"),
                        DataHelper.GetInt(dr, "Rechazos"),
                        ref lin,
                        DataHelper.GetDate(dr, "RowUpdated"),
                        dr["OEEPreactor"] == DBNull.Value ? null : (double?)dr["OEEPreactor"])
                    {
                        CajasPorPalet = DataHelper.GetInt(dr, "CajasPorPalet"),
                        EnvasesPorPalet = DataHelper.GetInt(dr, "EnvasesPorPalet"),
                        TipoPausa = DataHelper.GetString(dr, "CausaPausa").ToEnum<Tipos.Pausa>()
                    });
                }

                return ordenes;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.obtenerOrdenesIntervalo", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerOrdenesIntervalo", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDENES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        public List<Orden> obtenerOrdenesPlanificadasProgramaEnvasado(DateTime fFechaInicio, DateTime fFechaFin, string fIdLinea = null)
        {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerPlanificacionOrdenes]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@fechaInicio", fFechaInicio);
            comando.Parameters.AddWithValue("@fechaFin", fFechaFin);
            comando.Parameters.AddWithValue("@idLinea", fIdLinea);

            List<Orden> ordenes = new List<Orden>();
            
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    string idLinea = DataHelper.GetString(dr, "Linea");
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);

                    string id = dr["Id"].ToString();
                    string idOrdenPadre = dr["idOrdenPadre"].ToString();
                    int idSubOrden = (int)dr["idSuborden"];
                    string descripcion = dr["Descripcion"].ToString();

                    int idEstadoAct = (int)dr["IdEstadoAct"];
                    EstadoOrden estadoOrden = new EstadoOrden(idEstadoAct);

                    string idProducto = dr["IdProducto"].ToString();
                    string strproducto = string.Join(" ", dr["Producto"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                    string udMedida = dr["udMedida"].ToString();
                    string idTipoProducto = dr["IdTipoProducto"].ToString();
                    string strtipoProducto = dr["TipoProducto"].ToString();
                    TipoProducto tipoProducto = new TipoProducto(idTipoProducto, strtipoProducto);
                    Producto producto = new Producto(idProducto, strproducto, udMedida, tipoProducto, null)
                    {
                        hectolitros = Convert.ToDouble(dr["HectolitrosProducto"])
                    };

                    NivelDisponibilidad nivelDisp = new NivelDisponibilidad(2, "Medio", "greenBall.png");
                    int cantidadPlanificada = (int)dr.GetDouble(dr.GetOrdinal("CantidadPlanificada"));
                    DateTime fecIniReal = DataHelper.GetDate(dr, "FecIniReal");
                    DateTime fecFinReal = DateTime.MinValue;
                    if (estadoOrden.Estado != Tipos.EstadosOrden.Producción)
                    {
                        fecFinReal = DataHelper.GetDate(dr, "FecFinReal");
                    }

                    DateTime fecIniEstimada = DataHelper.GetDate(dr, "FecIniEstimada");
                    DateTime fecFinEstimada = DataHelper.GetDate(dr, "FecFinEstimada");

                    int paletsProducidos = (int)dr.GetDouble(dr.GetOrdinal("CantidadProducida"));
                    DatosProduccionOrden datosProdOrden = new DatosProduccionOrden()
                    {
                        paletsEtiquetadoraProducidos = paletsProducidos,
                        cantidadPicosCajas = Convert.ToInt32(dr["PicosCajas"]),
                        cantidadPicosPalets = Convert.ToInt32(dr["PicosPalets"]),
                    };

                    double velocidadNominal = DataHelper.GetDouble(dr, "VelocidadNominal");
                    double oeeObjetivo = DataHelper.GetDouble(dr, "oeeObjetivo");
                    double oeeCritico = DataHelper.GetDouble(dr, "oeeCritico");
                    string codigoJDE = DataHelper.GetString(dr, "CodigoJDE");
                    DateTime rowUpdated = DataHelper.GetDate(dr, "RowUpdated");
                    double? oeePreactor = dr["OEEPreactor"] == DBNull.Value ? null : (double?)dr["OEEPreactor"];

                    Orden orden = new Orden(id, idOrdenPadre, idSubOrden, descripcion, estadoOrden, producto, nivelDisp, cantidadPlanificada,
                                            fecIniReal, fecFinReal, fecIniEstimada, fecFinEstimada, datosProdOrden, velocidadNominal, oeeObjetivo,
                                            oeeCritico, codigoJDE, 0, 0, 0,ref  lin, rowUpdated, oeePreactor);

                    int envasesPorPalet = DataHelper.GetInt(dr, "EnvasesPorPalet");
                    int cajasPorPalet = DataHelper.GetInt(dr, "CajasPorPalet");
                    Tipos.Pausa tipoPausa = DataHelper.GetString(dr, "CausaPausa").ToEnum<Tipos.Pausa>();

                    orden.EnvasesPorPalet = envasesPorPalet;
                    orden.CajasPorPalet = cajasPorPalet;
                    orden.TipoPausa = tipoPausa;

                    orden.fecFinEstimadoCalculadoTurno = lin != null ? Utils.getDateTurno(PlantaRT.planta.turnoActual.Find(x => x.linea.numLinea == lin.numLinea), orden) : IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE");
                    if (!VerificarFechaNoDisponible(orden.fecFinEstimadoCalculadoTurno))
                    {
                        TimeSpan diff = Convert.ToDateTime(orden.fecFinEstimadoCalculadoTurno) - DateTime.Now;

                        string zeroHours, zeroMinutes, zeroSeconds = "";
                        zeroHours = Convert.ToInt32(diff.Hours) < 10 ? "0" : "";
                        zeroMinutes = Convert.ToInt32(diff.Minutes) < 10 ? "0" : "";
                        zeroSeconds = Convert.ToInt32(diff.Seconds) < 10 ? "0" : "";
                        orden.duracionCalculadaTurno = zeroHours + Convert.ToInt32(diff.Hours) + ":" + zeroMinutes + Convert.ToInt32(diff.Minutes) + ":" + zeroSeconds + Convert.ToInt32(diff.Seconds);
                    }
                    else
                    {
                        orden.duracionCalculadaTurno = "00:00:00";
                    }

                    if (estadoOrden.esActiva)
                    {
                        Orden ord = PlantaRT.planta.lineas.Find(l => l.id.Equals(idLinea)).ordenesActivas.Where(o => o.id.Equals(id)).FirstOrDefault();
                        if (ord != null)
                        {
                            orden.produccion.paletsEtiquetadoraProducidos = ObtenerPaletsEtiquetadoraWO(ord.id);
                            orden.produccion.cajas = ord.produccion.cajas;
                            orden.produccion.envases = ord.produccion.envases;
                        }
                    }

                    ordenes.Add(orden);
                }

                return ordenes;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.obtenerPlanificacionOrdenes", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerPlanificacionOrdenes", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDENES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        public List<Orden> obtenerHistoricoOrdenes(DateTime fFechaInicio, DateTime fFechaFin)
        {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerHistoricoOrdenes]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@fIni", fFechaInicio);
            comando.Parameters.AddWithValue("@fFin", fFechaFin.AddDays(1));
            comando.CommandTimeout = 180;
            List<Orden> ordenes = new List<Orden>();

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                List<Task> limsTasks = new List<Task>();
                while (dr.Read())
                {
                    string idLinea = DataHelper.GetString(dr, "Linea");
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);

                    string id = DataHelper.GetString(dr, "Id");
                    string descripcion = DataHelper.GetString(dr, "Descripcion");
                    EstadoOrden estadoOrden = new EstadoOrden(DataHelper.GetInt(dr, "IdEstadoAct"));

                    string idTipoProducto = dr["IdTipoProducto"].ToString();
                    string tipoProductoName = dr["TipoProducto"].ToString();
                    TipoProducto tipoProducto = new TipoProducto(idTipoProducto, tipoProductoName);

                    string idProducto = dr["IdProducto"].ToString();
                    string productoName = string.Join(" ", dr["Producto"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                    string udMedida = dr["udMedida"].ToString();
                    Producto producto = new Producto(idProducto, productoName, udMedida, tipoProducto, null);

                    NivelDisponibilidad nivelDisponibilidad = new NivelDisponibilidad(2, "Medio", "greenBall.png");

                    int cantidadPlanificada = (int)dr.GetDouble(dr.GetOrdinal("CantidadPlanificada"));
                    DateTime fechaInicioReal = DataHelper.GetDate(dr, "FecIniReal");
                    DateTime fechaFinReal = DataHelper.GetDate(dr, "FecFinReal");
                    DateTime fechaIniEstimada = DataHelper.GetDate(dr, "FecIniEstimada");
                    DateTime fechaFinEstimada = DataHelper.GetDate(dr, "FecFinEstimada");

                    DatosProduccionOrden datosProdOrden = new DatosProduccionOrden()
                    {
                        paletsProducidos = (int)dr.GetDouble(dr.GetOrdinal("CantidadProducida")),
                        cantidadPicosCajas = Convert.ToInt32(dr["PicosCajas"])
                    };
                    double velocidadNominal = DataHelper.GetDouble(dr, "VelocidadNominal");
                    double oee = DataHelper.GetDouble(dr, "OEE");
                    double oeeCritico = DataHelper.GetDouble(dr, "OeeCritico");
                    double oeeObjetivo = DataHelper.GetDouble(dr, "OeeObjetivo");
                    double calidad = DataHelper.GetDouble(dr, "Calidad");
                    double? oeePreactor = dr["OEEPreactor"] == DBNull.Value ? null : (double?)dr["OEEPreactor"];

                    Orden orden = new Orden(id, null, 0, descripcion, estadoOrden, producto, nivelDisponibilidad, cantidadPlanificada,
                                             fechaInicioReal, fechaFinReal, fechaIniEstimada, fechaFinEstimada, datosProdOrden, velocidadNominal,
                                             oeeObjetivo, oeeCritico, null, oee, calidad, 0, 0, 0, 0, 0, 0, 0, 0, 0, ref lin, DateTime.MinValue,
                                             oeePreactor);

                    //Obtenemos estado LIMS de la orden
                    limsTasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                            // Dentro de esta lambda, podemos usar await porque la llamada es 'async'
                            DTO_ClaveValor lims = (await _daoLims.obtenerEstadoLIMSdeWOEnvasado(orden.id)).Data;
                            if (lims != null)
                            {
                                orden.EstadoLIMS = lims.Id;
                                orden.ColorLIMS = lims.Valor;
                            }
                        }
                        catch (Exception ex)
                        {
                            // Manejo de la excepción para evitar que el Task.WhenAll falle
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Error en tarea LIMS: " + ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtnerEStadoLIMSwoeNVASADO", "WEB-ENVASADO", "Sistema");
                        }
                    }));

                    ordenes.Add(orden);
                }

                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

                // Espera a que todas las tareas se completen
                Task.WhenAll(limsTasks).Wait();

                return ordenes;
            }
            catch (Exception ex)
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerHistoricoOrdenes", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_HISTORICO_ORDENES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        public static List<HistoricoOrden> ObtenerHistoricoOrden(string idOrden)
        {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerHistoricoOrden]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@idOrden", idOrden);

            List<HistoricoOrden> historico = new List<HistoricoOrden>();
            try
            {

                conexion.Open();
                dr = comando.ExecuteReader();
                DateTime fechaAnt = DateTime.MinValue;
                while (dr.Read())
                {

                    historico.Add(new HistoricoOrden(
                        DataHelper.GetString(dr, "IdOrden"),
                        DataHelper.GetDate(dr, "FechaCambio"),
                        fechaAnt,
                        //new EstadoOrden(int.Parse(dr["IdEstado"].ToString()), dr["Estado"].ToString(), dr["Color"].ToString())
                        new EstadoOrden(int.Parse(dr["IdEstado"].ToString()))
                    ));

                    fechaAnt = DataHelper.GetDate(dr, "FechaCambio");
                }
                return historico;

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.obtenerHistoricoOrden", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerHistoricoOrden", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_HISTORICO"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        public List<DTO.DTO_ProduccionTurnoOrdenes> obtenerProduccionOrdenTurno(int numLinea, string idOrden)
        {
            List<DTO.DTO_ProduccionTurnoOrdenes> turnoOrdenes = new List<DTO.DTO_ProduccionTurnoOrdenes>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("MES_ObtenerDatosProduccionOrdenTurno", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@numLinea", numLinea);
            comando.Parameters.AddWithValue("@idOrden", idOrden);

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    turnoOrdenes.Add(new DTO.DTO_ProduccionTurnoOrdenes()
                    {
                        fechaTurnoUTC = DataHelper.GetDate(dr, "DIA_TURNO"),
                        idTipoTurno = DataHelper.GetInt(dr, "TIPO_TURNO"),
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

                return turnoOrdenes;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerProduccionOrdenTurno", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PRODUCCION"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        public List<DTO.DTO_ProduccionTurnoOrdenes> obtenerProduccionParticionTurno(int numLinea, string idParticion)
        {
            List<DTO.DTO_ProduccionTurnoOrdenes> turnoOrdenes = new List<DTO.DTO_ProduccionTurnoOrdenes>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("MES_ObtenerDatosProduccionParticionTurno", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@numLinea", numLinea);
            comando.Parameters.AddWithValue("@idParticion", idParticion);

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    turnoOrdenes.Add(new DTO.DTO_ProduccionTurnoOrdenes()
                    {
                        fechaTurnoUTC = DataHelper.GetDate(dr, "DIA_TURNO"),
                        idTipoTurno = DataHelper.GetInt(dr, "TIPO_TURNO"),
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

                return turnoOrdenes;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerProduccionParticionTurno", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PRODUCCION_DE"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        internal static void ObtenerConversionesProducto(List<Orden> ordenes)
        {
            try
            {
                if (ordenes.Count > 0)
                {
                    using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                    {
                        using (SqlCommand command = new SqlCommand("[MES_ObtenerConversionesOrdenes]", conexion))
                        {
                            command.CommandType = CommandType.StoredProcedure;
                            DataTable dt = new DataTable();
                            dt.Columns.Add("Item", typeof(string));
                            foreach (Orden o in ordenes)
                            {
                                dt.Rows.Add(new object[] { o.idOrdenPadre });
                            }
                            SqlParameter param = command.Parameters.AddWithValue("@ordenes", dt);
                            param.SqlDbType = SqlDbType.Structured;

                            using (SqlDataAdapter da = new SqlDataAdapter(command))
                            {
                                conexion.Open();

                                DataTable ds = new DataTable();

                                da.Fill(ds);

                                var m = ds.AsEnumerable().Join(ordenes, d => d.Field<string>("ID_ORDEN"), o => o.idOrdenPadre, (d, o) =>
                                {
                                    o.EnvasesPorPalet = Convert.ToInt32(d.Field<int>("EnvasesPorPalet"));
                                    o.CajasPorPalet = Convert.ToInt32(d.Field<int>("CajasPorPalet"));
                                    return true;
                                }).ToList();
                            }

                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerConversionesProducto", "WEB-ENVASADO", "Sistema");
            }
        }

        internal static void ObtenerHectolitrosProducto(List<Orden> ordenes)
        {
            try
            {
                if (ordenes.Count > 0)
                {
                    using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                    {
                        using (SqlCommand command = new SqlCommand("[MES_ObtenerHectolitrosProductoOrdenes]", conexion))
                        {
                            command.CommandType = CommandType.StoredProcedure;
                            DataTable dt = new DataTable();
                            dt.Columns.Add("Item", typeof(string));
                            foreach (Orden o in ordenes)
                            {
                                dt.Rows.Add(new object[] { o.idOrdenPadre });
                            }
                            SqlParameter param = command.Parameters.AddWithValue("@ordenes", dt);
                            param.SqlDbType = SqlDbType.Structured;

                            using (SqlDataAdapter da = new SqlDataAdapter(command))
                            {
                                conexion.Open();

                                DataTable ds = new DataTable();

                                da.Fill(ds);

                                var m = ds.AsEnumerable().Join(ordenes, d => d.Field<string>("ID_ORDEN"), o => o.idOrdenPadre, (d, o) =>
                                {
                                    o.producto.hectolitros = Convert.ToDouble(d.Field<decimal>("HectolitrosProducto"));
                                    return true;
                                }).ToList();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerHectolitrosProducto", "WEB-ENVASADO", "Sistema");
            }
        }

        internal static double ObtenerDuracion(string idLinea, DateTime dtInicio, DateTime dtFin)
        {
            double duracion = 0;

            try
            {
                if (dtInicio != DateTime.MinValue && dtFin != DateTime.MinValue && dtFin.Year > 1901)
                {

                    List<Turno> listTurnos = new List<Turno>();

                    using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                    {
                        using (SqlCommand command = new SqlCommand("[MES_ObtenerTurnosOrden]", connection))
                        {
                            command.CommandType = CommandType.StoredProcedure;
                            command.Parameters.AddWithValue("@linea", idLinea);
                            command.Parameters.AddWithValue("@desde", dtInicio);
                            command.Parameters.AddWithValue("@hasta", dtFin);

                            using (SqlDataAdapter da = new SqlDataAdapter(command))
                            {

                                connection.Open();
                                DataTable dt = new DataTable();
                                da.Fill(dt);
                                foreach (DataRow row in dt.Rows)
                                {
                                    Turno turno = new Turno();
                                    turno.idTurno = (int)row["Id"];
                                    turno.inicio = (DateTime)row["InicioTurno"];
                                    turno.fin = (DateTime)row["FinTurno"];
                                    listTurnos.Add(turno);
                                }
                            }
                        }
                    }
                    foreach (Turno turno in listTurnos)
                    {
                        DateTime inicio = dtInicio >= turno.inicio ? dtInicio : turno.inicio;
                        DateTime fin = dtFin >= turno.fin ? turno.fin : dtFin;
                        duracion += (fin - inicio).TotalSeconds;
                    }
                }

                return duracion;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.ObtenerDuracion", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerDuracion", "WEB-WO", "Sistema");
                //throw new Exception("Error al obetener duracion orden"); // rmartinez 300516: se comenta la línea para evitar el propagado de la excepción 
            }

            return duracion;
        }

        internal static double ObtenerDuracionReal(string idOrden)
        {
            double duracionReal = 0;

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("MES_GetTiempoPaletera", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idOrdenParticion", idOrden);

                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Real);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);

                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        duracionReal = Convert.ToDouble(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerDuracionReal", "WEB-WO", "Sistema");
                    }
                }
            }

            return duracionReal;
        }

        internal static double ObtenerEnvasesTeoricosEtiquetadoraPalets(string idOrden, bool logTriggers)
        {
            double envasesTeoricos = 0;

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("MES_GetEnvasesTeoricosEtiquetadoraPaletsOrden", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@IdOrden", idOrden);

                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Real);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);

                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        envasesTeoricos = Convert.ToDouble(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        if (logTriggers)
                        {
                            DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Envases teóricos de etiquetadora de palets", "Error: " + ex.Message, "Error");
                        }

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerEnvasesTeoricosEtiquetadoraPalets", "WEB-WO", "Sistema");
                    }
                }
            }

            return envasesTeoricos;
        }

        /// <summary>
        /// Obtiene los estados actuales de las ordenes activas y pendientes (para determinar cambio de estado) así como la relación de Ordenes con zonas (para determinar cambio de orden)
        /// </summary>
        /// <param name="lastUpdate">Fecha última Modificación</param>
        /// <returns>Dataset con dos DataTables -> dt(1): contiene estados actuales de las ordenes activas y pendientes, dt(2): contiene la relación de Ordenes con zonas</returns>
        internal static DataSet ObtenerEstadosOrden(DateTime? lastUpdate)
        {
            Stopwatch timer = Stopwatch.StartNew();
            DataSet ds = new DataSet();

            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                using (SqlCommand command = new SqlCommand("[NOT_CambiosOrdenesV2]", connection))
                using (SqlDataAdapter adapter = new SqlDataAdapter(command))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandTimeout = 20;

                    var param = command.Parameters.Add("@lastUpdate", SqlDbType.DateTime);
                    param.Value = lastUpdate ?? (object)DBNull.Value;

                    connection.Open();
                    adapter.Fill(ds);
                }

                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMB_EST_ORD-Duración proc. almacenado NOT_CambiosOrdenesV2", timer.Elapsed.ToString(), "Info");
                }

                return ds;
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogCambioEstadoOrdenes)
                {
                    DAO_Log.EscribeLog("CAMB_EST_ORD-Proc. almacenado NOT_CambiosOrdenesV2", "Error: " + ex.Message, "Error");
                }

                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"{ex.Message} -> {ex.StackTrace}", "DAO_Orden.NOT_CambiosOrdenes", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("OBTENERESTADOSORDEN"));
            }
            finally
            {
                timer.Stop();
            }
        }

        internal static string obtenerNuevoEstadoWOPadre(string idOrden)
        {
            try
            {
                DataTable dt = new DataTable();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerNuevoEstadoFechasWO]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@ordenPadreID", idOrden);
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
                    string estadoActual = (string)dt.Rows[0]["estadoActual"];
                    string estadoNuevo = (string)dt.Rows[0]["estadoNuevo"];

                    if (estadoActual != estadoNuevo)
                        return estadoNuevo;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerNuevoEstadoFechasWO", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }

            return "";
        }

        internal Orden obtenerDetalleHistoricoOrden(string idOrden)
        {
            Orden orden = null;
            DataSet ds = new DataSet();

            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerDetalleHistoricoOrden]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idOrden", idOrden);

                        using (SqlDataAdapter da = new SqlDataAdapter())
                        {
                            connection.Open();
                            da.SelectCommand = command;

                            da.Fill(ds);
                        }
                    }
                }

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];

                    string idLinea = row["Linea"].ToString();
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);

                    string id = row["Id"].ToString();
                    string descripcion = row["Descripcion"].ToString();
                    EstadoOrden estadoOrden = new EstadoOrden(Convert.ToInt32(row["IdEstadoAct"]));

                    string idTipoProducto = row["IdTipoProducto"].ToString();
                    string tipoProductoName = row["TipoProducto"].ToString();
                    TipoProducto tipoProducto = new TipoProducto(idTipoProducto, tipoProductoName);

                    string idProducto = row["IdProducto"].ToString();
                    string productoName = string.Join(" ", row["Producto"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                    string udMedida = row["udMedida"].ToString();
                    Producto producto = new Producto(idProducto, productoName, udMedida, tipoProducto, null)
                    {
                        hectolitros = Convert.ToDouble(row["HectolitrosProducto"])
                    };

                    NivelDisponibilidad nivelDisponibilidad = new NivelDisponibilidad(2, "Medio", "greenBall.png");

                    int cantidadPlanificada = Convert.ToInt32(row["CantidadPlanificada"]);
                    //int cantidadProducida = Convert.ToInt32(row["CantidadProducida"]);
                    DateTime fechaInicioReal = row["FecIniReal"] != DBNull.Value ? (DateTime)row["FecIniReal"] : DateTime.MinValue;
                    DateTime fechaFinReal = row["FecFinReal"] != DBNull.Value ? (DateTime)row["FecFinReal"] : DateTime.MinValue;
                    DateTime fechaIniEstimada = row["FecIniEstimada"] != DBNull.Value ? (DateTime)row["FecIniEstimada"] : DateTime.MinValue;
                    DateTime fechaFinEstimada = row["FecFinEstimada"] != DBNull.Value ? (DateTime)row["FecFinEstimada"] : DateTime.MinValue;

                    DatosProduccionOrden datosProdOrden = new DatosProduccionOrden()
                    {
                        paletsEtiquetadoraProducidos = Convert.ToInt32(row["PaletsETQProducidos"]),
                        paletsProducidos = Convert.ToInt32(row["PaletsProducidos"]),
                        cajas = Convert.ToInt32(row["CajasProducidas"]),
                        envases = Convert.ToInt32(row["EnvasesProducidos"]),
                        cantidadPicosCajas = Convert.ToInt32(row["PicosCajas"]),
                        cantidadPicosPalets = Convert.ToInt32(row["PicosPalets"]),
                        cantidadEnvasesNoConformidad = Convert.ToInt32(row["EnvNoConformidad"]),
                        cantidadPaletsNoConformidad = Convert.ToInt32(row["EnvNoConformidadPalets"])
                    };

                    double velocidadNominad = Convert.ToDouble(row["VelocidadNominal"]);
                    double oeeObjetivo = Convert.ToDouble(row["OEEObjetivo"]);
                    double oeeCritico = Convert.ToDouble(row["OEECritico"]);
                    string codigoJDE = row["CodigoJDE"].ToString();
                    double oee = Convert.ToDouble(row["OEE"]);
                    double calidad = Convert.ToDouble(row["Calidad"]);
                    int rechazos = Convert.ToInt32(row["Rechazos"]);
                    int rechazosLlenadoraManual = 0; //Convert.ToInt32(row["rechazosSalidaLlenadoraManual"]);
                    int rechazosLlenadoraAutomatico = Convert.ToInt32(row["rechazosSalidaLlenadoraAutomatico"]);
                    int rechazosClasificadorManual = 0; //Convert.ToInt32(row["rechazosClasificadorManual"]);
                    int rechazosClasificadorAutomatico = Convert.ToInt32(row["rechazosClasificadorAutomatico"]);
                    int rechazosVaciosManual = 0; //Convert.ToInt32(row["rechazosVaciosManual"]);
                    int rechazosVaciosAutomatico = Convert.ToInt32(row["rechazosVaciosAutomatico"]);
                    int rechazosProductoTerminadoManual = 0; //Convert.ToInt32(row["rechazosProductoTerminadoManual"]);
                    int rechazosProductoTerminadoAutomatico = Convert.ToInt32(row["rechazosProductoTerminadoAutomatico"]);

                    //int prodLlenadora = DataHelper.GetInt(dr, "ProdLlenadora");
                    DateTime rowUpdated = row["RowUpdated"] != DBNull.Value ? (DateTime)row["RowUpdated"] : DateTime.MinValue;
                    double? oeePreactor = row["OEEPreactor"] == DBNull.Value ? null : (double?)row["OEEPreactor"];
                    int envasesPorPalet = Convert.ToInt32(row["EnvasesPorPalet"]);
                    int cajasPorPalet = Convert.ToInt32(row["CajasPorPalet"]);
                    Tipos.Pausa tipoPausa = (row["CausaPausa"].ToString()).ToEnum<Tipos.Pausa>();

                    orden = new Orden(id, null, 0, descripcion, estadoOrden, producto, nivelDisponibilidad, cantidadPlanificada, fechaInicioReal,
                                      fechaFinReal, fechaIniEstimada, fechaFinEstimada, datosProdOrden, velocidadNominad, oeeObjetivo, oeeCritico,
                                      codigoJDE, oee, calidad, rechazos, rechazosClasificadorAutomatico, rechazosClasificadorManual,
                                      rechazosLlenadoraAutomatico, rechazosLlenadoraManual, rechazosProductoTerminadoAutomatico,
                                      rechazosProductoTerminadoManual, rechazosVaciosAutomatico, rechazosVaciosManual, ref lin, rowUpdated,
                                      oeePreactor)
                    {
                        CajasPorPalet = cajasPorPalet,
                        EnvasesPorPalet = envasesPorPalet,
                        TipoPausa = tipoPausa
                    };

                    orden.duracion = ObtenerDuracion(orden.idLinea, orden.dFecInicioEstimado, orden.dFecFinEstimado);
                    //orden.duracionReal = DAO_Orden.ObtenerDuracion(orden.idLinea, orden.dFecInicio, orden.dFecFin);
                    orden.duracionReal = ObtenerDuracionReal(orden.id);
                    orden.produccion.rendimiento = Convert.ToDouble(row["Rendimiento"]);
                }

                return orden;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.ObtenerPaletsConsolidadosOrdenTurno", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerDetalleHistoricoOrden", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_LOS_DATOS"));
            }
        }

        internal Orden obtenerDetalleParticionOrden(string idParticion)
        {
            Orden orden = null;
            DataSet ds = new DataSet();

            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerDatosGeneralesParticion]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@ordenId", idParticion);

                        using (SqlDataAdapter da = new SqlDataAdapter())
                        {
                            connection.Open();
                            da.SelectCommand = command;

                            da.Fill(ds);
                        }
                    }
                }

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];

                    string idLinea = row["Linea"].ToString();
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == idLinea);

                    string id = row["Id"].ToString();
                    string descripcion = row["Descripcion"].ToString();
                    EstadoOrden estadoOrden = new EstadoOrden(Convert.ToInt32(row["IdEstadoAct"]));

                    string idTipoProducto = row["IdTipoProducto"].ToString();
                    string tipoProductoName = row["TipoProducto"].ToString();
                    TipoProducto tipoProducto = new TipoProducto(idTipoProducto, tipoProductoName);

                    string idProducto = row["IdProducto"].ToString();
                    string productoName = string.Join(" ", row["Producto"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                    string udMedida = row["udMedida"].ToString();
                    Producto producto = new Producto(idProducto, productoName, udMedida, tipoProducto, null)
                    {
                        hectolitros = Convert.ToDouble(row["HectolitrosProducto"])
                    };

                    NivelDisponibilidad nivelDisponibilidad = new NivelDisponibilidad(2, "Medio", "greenBall.png");

                    int cantidadPlanificada = Convert.ToInt32(row["CantidadPlanificada"]);
                    //int cantidadProducida = Convert.ToInt32(row["CantidadProducida"]);
                    DateTime fechaInicioReal = row["FecIniReal"] != DBNull.Value ? (DateTime)row["FecIniReal"] : DateTime.MinValue;
                    DateTime fechaFinReal = row["FecFinReal"] != DBNull.Value ? (DateTime)row["FecFinReal"] : DateTime.MinValue;
                    DateTime fechaIniEstimada = row["FecIniEstimada"] != DBNull.Value ? (DateTime)row["FecIniEstimada"] : DateTime.MinValue;
                    DateTime fechaFinEstimada = row["FecFinEstimada"] != DBNull.Value ? (DateTime)row["FecFinEstimada"] : DateTime.MinValue;

                    DatosProduccionOrden datosProdOrden = new DatosProduccionOrden()
                    {
                        paletsEtiquetadoraProducidos = Convert.ToInt32(row["PaletsETQProducidos"]),
                        paletsProducidos = Convert.ToInt32(row["PaletsProducidos"]),
                        cajas = Convert.ToInt32(row["CajasProducidas"]),
                        envases = Convert.ToInt32(row["EnvasesProducidos"]),
                        cantidadPicosCajas = Convert.ToInt32(row["PicosCajas"]),
                        cantidadPicosPalets = Convert.ToInt32(row["PicosPalets"]),
                        cantidadEnvasesNoConformidad = Convert.ToInt32(row["EnvNoConformidad"]),
                        cantidadPaletsNoConformidad = Convert.ToInt32(row["EnvNoConformidadPalets"])
                    };

                    double velocidadNominad = Convert.ToDouble(row["VelocidadNominal"]);
                    double oeeObjetivo = Convert.ToDouble(row["OEEObjetivo"]);
                    double oeeCritico = Convert.ToDouble(row["OEECritico"]);
                    string codigoJDE = row["CodigoJDE"].ToString();
                    double oee = Convert.ToDouble(row["OEE"]);
                    double calidad = Convert.ToDouble(row["Calidad"]);
                    int rechazos = Convert.ToInt32(row["Rechazos"]);
                    int rechazosLlenadoraManual = 0; //Convert.ToInt32(row["rechazosSalidaLlenadoraManual"]);
                    int rechazosLlenadoraAutomatico = Convert.ToInt32(row["rechazosSalidaLlenadoraAutomatico"]);
                    int rechazosClasificadorManual = 0; //Convert.ToInt32(row["rechazosClasificadorManual"]);
                    int rechazosClasificadorAutomatico = Convert.ToInt32(row["rechazosClasificadorAutomatico"]);
                    int rechazosVaciosManual = 0; //Convert.ToInt32(row["rechazosVaciosManual"]);
                    int rechazosVaciosAutomatico = Convert.ToInt32(row["rechazosVaciosAutomatico"]);
                    int rechazosProductoTerminadoManual = 0; //Convert.ToInt32(row["rechazosProductoTerminadoManual"]);
                    int rechazosProductoTerminadoAutomatico = Convert.ToInt32(row["rechazosProductoTerminadoAutomatico"]);

                    //int prodLlenadora = DataHelper.GetInt(dr, "ProdLlenadora");
                    DateTime rowUpdated = row["FecHorAct"] != DBNull.Value ? (DateTime)row["FecHorAct"] : DateTime.MinValue;
                    double? oeePreactor = row["OEEPreactor"] == DBNull.Value ? null : (double?)row["OEEPreactor"];
                    int envasesPorPalet = Convert.ToInt32(row["EnvasesPorPalet"]);
                    int cajasPorPalet = Convert.ToInt32(row["CajasPorPalet"]);
                    Tipos.Pausa tipoPausa = (row["CausaPausa"].ToString()).ToEnum<Tipos.Pausa>();

                    orden = new Orden(id, null, 0, descripcion, estadoOrden, producto, nivelDisponibilidad, cantidadPlanificada, fechaInicioReal,
                                      fechaFinReal, fechaIniEstimada, fechaFinEstimada, datosProdOrden, velocidadNominad, oeeObjetivo, oeeCritico,
                                      codigoJDE, oee, calidad, rechazos, rechazosClasificadorAutomatico, rechazosClasificadorManual,
                                      rechazosLlenadoraAutomatico, rechazosLlenadoraManual, rechazosProductoTerminadoAutomatico,
                                      rechazosProductoTerminadoManual, rechazosVaciosAutomatico, rechazosVaciosManual, ref lin, rowUpdated,
                                      oeePreactor)
                    {
                        CajasPorPalet = cajasPorPalet,
                        EnvasesPorPalet = envasesPorPalet,
                        TipoPausa = tipoPausa
                    };

                    orden.duracion = ObtenerDuracion(orden.idLinea, orden.dFecInicioEstimado, orden.dFecFinEstimado);
                    //orden.duracionReal = DAO_Orden.ObtenerDuracion(orden.idLinea, orden.dFecInicio, orden.dFecFin);
                    orden.duracionReal = ObtenerDuracionReal(orden.id);
                    orden.produccion.rendimiento = Convert.ToDouble(row["Rendimiento"]);
                }

                return orden;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.ObtenerPaletsConsolidadosOrdenTurno", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerDetalleParticionOrden", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_LOS_DATOS"));
            }
        }

        internal static int ObtenerNumeroParticiones(string idOrdenPadre)
        {
            int numParticiones = 0;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("SELECT dbo.[GetNumParticionesOrden](@id_wo)", connection))
                {
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue("@id_wo", idOrdenPadre);
                    command.CommandTimeout = 5;
                    try
                    {
                        connection.Open();
                        numParticiones = (int)command.ExecuteScalar();
                    }
                    catch (Exception ex)
                    {
                        //DAO_Log.registrarLog(DateTime.Now, "DAO_Orden.ObtenerNumeroParticiones", ex, "Sistema");
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.obtenerNumeroParticion", "WEB-WO", "Sistema");
                    }
                }
            }
            return numParticiones;
        }

        /// <summary>
        /// Obtiene los tipos de arranque
        /// </summary>
        /// <returns>List(TIPO_ARRANQUE)</returns>
        internal List<dynamic> obtenerTiposArranque()
        {
            List<dynamic> lstTiposArranques = new List<dynamic>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerTiposArranque]", connection))
                {
                    using (SqlDataAdapter da = new SqlDataAdapter())
                    {
                        connection.Open();
                        da.SelectCommand = command;
                        DataSet ds = new DataSet();
                        da.Fill(ds);

                        if (ds != null && ds.Tables.Count > 0)
                        {
                            foreach (DataRow row in ds.Tables[0].Rows)
                            {
                                dynamic TiposArranque = new System.Dynamic.ExpandoObject();
                                TiposArranque.NumLinea = (int)row["NumLinea"];
                                TiposArranque.ID_ARRANQUE = (short)row["IdArranque"];
                                TiposArranque.DESC_ARRANQUE = row["Descripcion"];
                                lstTiposArranques.Add(TiposArranque);
                            }
                        }
                    }
                }
            }
            return lstTiposArranques;
        }

        internal static bool cambiarEstadoOrden(string id, string estado)
        {
            return OrdenesBread.changeOrderStatus(id, estado).succeeded;
        }

        internal static object cambiarEstadoOrden(string woID, string estado, string usuario, string tipoUsuario)
        {
            //tipoUsuario= supervisor / operario

            ReturnValue err = new ReturnValue();
            //tratamiento particion.
            //A. POM update actual start & end time
            err = OrdenesBread.changeOrderActualDates(woID, estado);
            if (!err.succeeded)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "POM Bread." + IdiomaController.GetResourceName("ERROR_ACT_FECHAS_WO") + ": " + err.message, "DAO_ORDEN.cambiarEstadoOrdenes", "I-MES-WO", usuario);
                //throw new Exception();
                return new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_CAMBIANDO_ESTADO") };
            }

            if (estado == "Iniciando" || estado == "Producción" || estado == "Cancelada")
            {
                // Cambiamos el estado de la propipiedad
                Order ordenAC = OrdenesBread.ObtenerOrden(woID);
                OrderProperty op = OrdenesBread.ObtenerPropiedadOrdenByName(ordenAC.PK, "WO_SET_UP_TIME");

                //Se modifica la fecha fin real para las ordenes que son canceladas para que puedan visualizarse en el histórico
                if (estado == "Cancelada")
                {
                    OrdenesBread.editarDatosGeneralesOrden(null, DateTime.Now.ToUniversalTime(), ordenAC.ID);
                    EditarPropiedadOrden("FECHA_FIN_REAL", ordenAC.ID, DateTime.Now.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss"));
                }
                else
                {
                    if (ordenAC.ActualStartTime.HasValue)
                        EditarPropiedadOrden("WO_SET_UP_TIME", ordenAC.ID, ordenAC.ActualStartTime.Value.ToString("yyyy-MM-dd HH:mm:ss"));
                }
            }
            //string setTime = DateTime.Parse(order.ActualStartTime).ToString("yyyy-MM-dd HH:mm:ss"); order.ActualStartTime.ToString("yyyy-MM-dd");

            //B. POM status
            err = OrdenesBread.changeOrderStatus(woID, estado);
            if (!err.succeeded)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "POM Bread." + IdiomaController.GetResourceName("ERROR_CAMBIANDO_ESTADO") + err.message, "DAO_ORDEN.cambiarEstadoOrdenes", "I-MES-WO", usuario);
                //throw new Exception();
                return new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_AL_CAMBIAR_EL") };
            }
            else
            {
                //string desE = "WO: " + woID + ", " + IdiomaController.GetResourceName("NUEVO") + " " + IdiomaController.GetResourceName("ESTADO") + ": " + estado + ", " + IdiomaController.GetResourceName("USUARIO") + ": " + tipoUsuario;
                //DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, IdiomaController.GetResourceName("CAMBIO_ESTADO") + ". " + desE, "DAO_ORDEN.cambiarEstadoOrdenes", "I-MES-WO", usuario);
            }


            //C. Historico register COB_HISTORICO_WO
            COB_MSM_HISTORICO_ORDENES cobH = new COB_MSM_HISTORICO_ORDENES();
            cobH.ORDER_ID = woID;
            cobH.FECHA_CAMBIO = DateTime.UtcNow;
            cobH.ESTADO = GetCodigoEstadoOrden(estado);

            if (!DAO_Contingencias.CrearHistoricoOffset(cobH))
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 1, "Error: Orden " + cobH.ORDER_ID + ", FechaCambio " + cobH.FECHA_CAMBIO + " y Estado " + estado, 
                    "DAO_Contingencias.CrearHistoricoOffset", "I-MES-WO", usuario);

            //Esta parte solo lo hacemos si es una particion
            if (woID.Contains("."))
            {
                //D.Async call to "Consolidados  WO" if new status CERRADA. //solo para particion
                if (estado == "Cerrada")
                {
                    ActualizarConsolidadosWO(woID, usuario);
                }
                //E. JDE: Async Call to "Iterface manager" in PM which manage COB_MSM_WO_JDE and SIT_ExecuteJobMESJDE
                DAO_Contingencias.Call_Interface_JDE(estado, woID, usuario);
                //Fin tratamiento particion

                ////F.Notificar a RealTime que ha habido cambios, ACTUALIZAR DATOS DE REALTIME
                //CambiosEstadosOrdenes cambiosEO = new CambiosEstadosOrdenes();
                //cambiosEO.Execute(null);

                if (!err.succeeded)
                {
                    return new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_AL_CAMBIAR_EL") };

                }
            }
            return new { err = true, errDesc = IdiomaController.GetResourceName("CAMBIO_ESTADO") };
        }

        internal static async Task<object> asignarWO2Zonas(int tipoOrdenArranqCambio, int tipoArranque, string lineaPath, List<Zona> zonas, string woIdEntrante, 
                                                           string usuario, string tipoUsuario)
        {
            //01 ACTUALIZAMOS TODAS LAS ZONAS y guardamos el nuevo estado para poner en la orden: 
            //Si entre las zonas está la PALETIZADORA el estado será PRODUCCIÓN, si no será INICIANDO
            dynamic result = new { err = true, errDesc = "" };
            bool revisarVelNominalLinea = false;
            bool revisarVelNomPaletera = false;
            bool zonaConMaquinasCompartidas = false;
            Tipos.EstadosOrden nuevoEstado = Tipos.EstadosOrden.Iniciando;
            string zonasStr = "{";

            foreach (Zona z in zonas)
            {
                if (z.Arranque)
                {
                    revisarVelNominalLinea = true;
                }

                if (z.esPaletizadora)
                {
                    revisarVelNomPaletera = true;
                }

                zonasStr += z.id + " - " + z.descripcion + ", ";

                if (z.Permite_Produccion)
                { 
                    nuevoEstado = Tipos.EstadosOrden.Producción;
                }

                if (z.MaquinasCompartidas) 
                {
                    zonaConMaquinasCompartidas = true;
                }

                //1. Llamar a asignar orden en zona y el permisivo de llenadora
                ReturnValue resultEditZona = await UpdateOrderIdZona(lineaPath, z, woIdEntrante);
                if (!resultEditZona.succeeded)
                {
                    result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_ASIGNANDO_ZONA") };
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "COB_MSM_ZONA Bread, change order id (err: " + resultEditZona.numcode + "): " + resultEditZona.message, "ZonasBread.updateOrderIdZona", "I-MES-WO", usuario);
                    break;
                }
            }

            zonasStr += "}";
            if (!result.err)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_ASIGNANDO_ZONA") + ". " + result.errDesc + ". " + 
                    string.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"), woIdEntrante, zonasStr, nuevoEstado, tipoUsuario), "dbo.MES_ActualizaWOEquiposZona", "I-MES-WO", usuario);
                return result;
            }

            //2. Lanzar la regla gestión de máquinas (consolidados y propiedades de estas)                 
            ActualizarConsolidadosMaquinas(0, lineaPath, woIdEntrante, usuario);

            //3. Actualizar propiedades de la línea (Velocidad nominal) dependiendo de las zonas.          
            if (revisarVelNominalLinea)
            {
                Linea lin = PlantaRT.planta.lineas.Where(l => l.id == lineaPath).First();
                result = await DAO_Linea.RevisarVelocidadNominalLlenadora(lin);
                if (!result.err)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_ASIGNANDO_ZONA") + ". " +
                        IdiomaController.GetResourceName("ERROR_CAMBIANDO_VEL_LINEA") + String.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"),
                        woIdEntrante, zonasStr, nuevoEstado, tipoUsuario), "DAO_Linea.RevisarVelocidadNominal", "I-MES-WO", usuario);
                    return result;
                }
            }

            if (revisarVelNomPaletera)
            {
                Linea lin = PlantaRT.planta.lineas.Where(l => l.id == lineaPath).First();
                // Si es la línea de doble salida de Alovera
                if (zonaConMaquinasCompartidas) //string.IsNullOrEmpty(lin.Grupo)
                {
                    DAO_Tags daoTags = new DAO_Tags();
                    var listaMaquinas = daoTags.ObtenerConfiguracionMaquinasCompartidas();
                    var paleterasLinea = listaMaquinas.Where(m => m.Linea == lin.id && m.Maquina.Contains("PAL")).ToList();
                    List<MaquinasCompartidas> listaPaleteras = new List<MaquinasCompartidas>();

                    foreach (var paletera in paleterasLinea)
                    {
                        MaquinasCompartidas maquinaCompartida = new MaquinasCompartidas();
                        maquinaCompartida.Nombre = paletera.Maquina;
                        maquinaCompartida.value = paletera.Activa;
                        listaPaleteras.Add(maquinaCompartida);
                    }

                    result = await DAO_Linea.RevisarVelocidadNominalPaletera(lin, listaPaleteras, woIdEntrante);

                    //Tratamiento línea opuesta
                    Linea lineaOpuesta = PlantaRT.planta.lineas.Find(l => l.Grupo == lin.Grupo && l.id != lin.id);
                    var paleterasLineaOpuesta = listaMaquinas.Where(m => m.Linea == lineaOpuesta.id && m.Maquina.Contains("PAL")).ToList();
                    List<MaquinasCompartidas> listaPaleterasOpuestas = new List<MaquinasCompartidas>();

                    foreach (var paleteraOpuesta in paleterasLineaOpuesta)
                    {
                        MaquinasCompartidas maquinaCompartidaOpuesta = new MaquinasCompartidas();
                        maquinaCompartidaOpuesta.Nombre = paleteraOpuesta.Maquina;
                        maquinaCompartidaOpuesta.value = paleteraOpuesta.Activa;
                        listaPaleterasOpuestas.Add(maquinaCompartidaOpuesta);
                    }

                    result = await DAO_Linea.RevisarVelocidadNominalPaleteraZona(lineaOpuesta, listaPaleterasOpuestas);
                }
                else
                {
                    result = await DAO_Linea.RevisarVelocidadNominalPaletera(lin, null, woIdEntrante);
                }

                if (!result.err)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_ASIGNANDO_ZONA") + ". " +
                        IdiomaController.GetResourceName("ERROR_CAMBIANDO_VEL_LINEA") + String.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"),
                        woIdEntrante, zonasStr, nuevoEstado, tipoUsuario), "DAO_Linea.RevisarVelocidadNominalPaletera", "I-MES-WO", usuario);
                    return result;
                }
            }

            //4. Llamar a actualizar estado orden y actual start time.  . Actualizaremos el actual_start_time si no se ha modificado antes su valor.
            IEnumerable<Tipos.EstadosOrden> estadoActualOrden = PlantaRT.planta.obtenerOrdenesActivas().Where(o => o.id == woIdEntrante).Select(o => o.estadoActual.Estado);
            //estadoActualOrden == null --> solo cambios el estado si la orden no estaba antes en orden activas (no estaba INICIANDO o PRODUCCIÓN)
            //(estadoActualOrden != nuevoEstado && estadoActualOrden != "Producción") --> o bien si el estado que queremos cambiar es el mismo o queremos pasar de Producción a Inciando
            if (estadoActualOrden.Count() == 0 || (estadoActualOrden.First() != nuevoEstado && estadoActualOrden.First() != Tipos.EstadosOrden.Producción))
            {
                string nuevoEstadoStr = nuevoEstado.ToString();
                result = cambiarEstadoOrden(woIdEntrante, nuevoEstadoStr, usuario, tipoUsuario);
                if (!result.err)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_ASIGNANDO_ZONA") + ". " + String.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"), woIdEntrante, zonasStr, nuevoEstado, tipoUsuario), "DAO_Orden.cambiarEstadoOrden", "I-MES-WO", usuario);
                    return result;
                }
                string woIdPadre = woIdEntrante.Split('.')[0];
                //la actualización de la WO padre podemos hacerla en asincrono
                string nuevoEstadoPadre = obtenerNuevoEstadoWOPadre(woIdPadre);
                if (nuevoEstadoPadre != "")
                {
                    dynamic resultAux = cambiarEstadoOrden(woIdPadre, nuevoEstadoPadre, usuario, tipoUsuario);
                    if (!resultAux.err)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_ASIGNANDO_ZONA") + ". " + String.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"), woIdPadre, zonasStr, nuevoEstado, tipoUsuario), "DAO_Orden.cambiarEstadoOrdenes", "I-MES-WO", usuario);
                    }
                }
            }

            //5. Gestión de cambio o arranque, según el checkeo que se ha realizado antes de llamar a la función asignar 
            //MARCAR LA ORDEN SI GENERA UN CAMBIO O UN ARRANQUE (SI ARRANQUE TAMB. EL TIPO), RESETEAR VALORES FCHA EN LA QUE PASO POR LLENADORA Y PALETIZADORA 

            var tareaProcesamiento = Task.Run(() =>
              {
                  tratamientoWOCambioArranqueEnAsignar(tipoOrdenArranqCambio, tipoArranque, lineaPath, woIdEntrante, zonas, usuario);
                  //CERRAR LAS ORDENES DE CAMBIO Y DE ARRANQUE
                  if (nuevoEstado == Tipos.EstadosOrden.Producción)
                  {
                      Task.Run(() => CerrarOrdenCambio(woIdEntrante));
                      Task.Run(() => CerrarOrdenArranque(woIdEntrante));
                  }
              }).ContinueWith((t) => {
                  if (t.IsFaulted)
                  {
                      DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "Error en tarea asincrona tratamientoWOCambioArranqueEnAsignar", "DAO_Orden.cambiarEstadoOrdenes", "I-MES-WO", usuario);

                  }
              });

            // Tarea 2: Notificar cambios de estado en paralelo
            var tareaNotificacion = Task.Run(() => { NotificarCambiosEstado(); })
                .ContinueWith((t) => {
                if (t.IsFaulted)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "Error en tarea asincrona NotificarCambiosEstado", "DAO_Orden.cambiarEstadoOrdenes", "I-MES-WO", usuario);

                }
            }); ;

            return result;
        }

        private static void NotificarCambiosEstado()
        {
            try
            {
                CambiosEstadosOrdenes cambiosEO = new CambiosEstadosOrdenes();
                cambiosEO.Execute(null);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2,
                    $"Error en NotificarCambiosEstado: {ex.Message}",
                    "DAO_Orden.NotificarCambiosEstado", "I-MES-WO", "Sistema");
            }
        }

        internal static object tratamientoWOCambioArranqueEnDesasignar(string lineaPath, string woIdSaliente, List<Zona> zonas, string usuario)
        {
            dynamic result = new { err = true, errDesc = "" };
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                Order ordenSaliente = OrdenesBread.ObtenerOrden(woIdSaliente);
                ReturnValue ret;
                zonas.ForEach(z =>
                {
                    //ACTUALIZACIÓN DE LA FECHA EN LA QUE PASO LA WO POR LLENADORA SI ESTA LA LLENADORA   
                    if (z.esLlenadora)
                    {
                        //NOS GUARDAMOS CUANDO SE DESASIGNO DE LA LLENADORA PARA LUEGO PODER CALCULAR LAS ORDENES DE CAMBIO             
                        ret = daoOrden.editaCreaPropiedadGenOrden(ordenSaliente, "CAMBIO_ARRANQ_FECHA_LLENADORA_DESASIG", "Datetime", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
                        if (!ret.succeeded)
                        {
                            result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_GUARDANDO_FECHA_DESASIG") };

                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "daoOrden.editaCreaPropiedadGenOrden, save prp CAMBIO_ARRANQ_FECHA_LLENADORA_DESASIG (err: " + ret.numcode + "): " + ret.message, "OrdenesBread.ObtenerOrden", "I-MES-WO", usuario);
                        }
                    }
                    if (z.esPaletizadora)
                    {
                        //NOS GUARDAMOS CUANDO SE DESASIGNO DE LA LLENADORA PARA LUEGO PODER CALCULAR LAS ORDENES DE CAMBIO             
                        ret = daoOrden.editaCreaPropiedadGenOrden(ordenSaliente, "CAMBIO_ARRANQ_FECHA_PALETIZADORA_DESASIG", "Datetime", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
                        if (!ret.succeeded)
                        {
                            result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_GUARDANDO_FECHA_DESASIG") };

                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "daoOrden.editaCreaPropiedadGenOrden, save prp CAMBIO_ARRANQ_FECHA_PALETIZADORA_DESASIG (err: " + ret.numcode + "): " + ret.message, "OrdenesBread.ObtenerOrden", "I-MES-WO", usuario);
                        }
                    }
                });
            }
            catch (Exception ret)
            {
                result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES") };
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "daoOrden.tratamientoWOCambioArranqueEnDesasignar: " + ret.Message, "OrdenesBread.tratamientoWOCambioArranqueEnDesasignar", "I-MES-WO", usuario);

            }
            return result;
        }

        internal static object tratamientoWOCambioArranqueEnAsignar(int tipoOrdenArranqCambio, int tipoArranque, string lineaPath, string woIdEntrante, List<Zona> zonas, string usuario)
        {
            dynamic result = new { err = true, errDesc = "" };
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                Order ordenEntrante = OrdenesBread.ObtenerOrden(woIdEntrante);
                ReturnValue ret;

                //
                if (tipoOrdenArranqCambio >= 0)
                {
                    //PROP1: CAMBIO_ARRANQ_TIPO variable para indicar si es arranque o cambio
                    ret = daoOrden.editaCreaPropiedadGenOrden(ordenEntrante, "CAMBIO_ARRANQ_TIPO", "Numeric", tipoOrdenArranqCambio.ToString());
                    if (!ret.succeeded)
                    {
                        result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_GUARDANDO_TIPO_ARRANQUE") };

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "daoOrden.editaCreaPropiedadGenOrden, save prp CAMBIO_ARRANQ_ID (err: " + ret.numcode + "): " + ret.message, "OrdenesBread.ObtenerOrden", "I-MES-WO", usuario);
                    }
                    //PROP2: FECHA QUE EMPEZO EL ARRANQUE/CABIO                
                    ret = daoOrden.editaCreaPropiedadGenOrden(ordenEntrante, "CAMBIO_ARRANQ_FECHA", "Datetime", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
                    if (!ret.succeeded)
                    {
                        result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_GUARDANDO_TIPO_ARRANQUE") };

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "daoOrden.editaCreaPropiedadGenOrden, save prp CAMBIO_ARRANQ_FECHA (err: " + ret.numcode + "): " + ret.message, "OrdenesBread.ObtenerOrden", "I-MES-WO", usuario);
                    }
                    //PROP3: ARRANQUE_ID variable para indicar el tipo de arranque (si es cambio esta variable se guarda también pero no se utiliza)
                    ret = daoOrden.editaCreaPropiedadGenOrden(ordenEntrante, "ARRANQUE_ID", "Numeric", tipoArranque.ToString());
                    if (!ret.succeeded)
                    {
                        result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_GUARDANDO_TIPO_ARRANQUE") };

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "daoOrden.editaCreaPropiedadGenOrden, save prp ARRANQUE_ID (err: " + ret.numcode + "): " + ret.message, "OrdenesBread.ObtenerOrden", "I-MES-WO", usuario);
                    }
                }
                zonas.ForEach(z =>
                {
                    //ACTUALIZACIÓN DE LA FECHA EN LA QUE PASO LA WO POR LLENADORA SI ESTA LA LLENADORA   
                    if (z.esLlenadora)
                    {
                        ret = daoOrden.editaCreaPropiedadGenOrden(ordenEntrante, "CAMBIO_ARRANQ_FECHA_LLENADORA", "Datetime", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
                        if (!ret.succeeded)
                        {
                            result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_GUARDANDO_FECHA_ASIG") };

                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "daoOrden.editaCreaPropiedadGenOrden, save prp CAMBIO_ARRANQ_ID (err: " + ret.numcode + "): " + ret.message, "OrdenesBread.ObtenerOrden", "I-MES-WO", usuario);
                        }                  
                    }
                });
                zonas.ForEach(z =>
                {
                    if (z.esPaletizadora)
                    {
                        //CREACIÓN DE LA ORDEN DE CAMBIO O ARRANQUE CON LOS DATOS GUARDADOS SI EN LAS ZONAS ASIGNADAS ESTA LA PALETIZADORA      
                        //revisar api/obtenerTurnoSegunFecha para obtener el turno en nel arranque
                        //revisar api/obtenerOrdenAnterior dada una fecha, para obtener la orden que había anteriormente para cambio                
                        //Datos de fecha de arranque hay que gestionarla y ponerle el del tiemplo del turno
                        //...                   
                        //obtener DATOS                   
                        DataTable dt = new DataTable();
                        //DAO_Log.registrarLogTraza("DAO_Produccion", "obtenerDatosProduccionParticion", "Inicio MES_ObtenerDatosProduccionParticion ord:" + ord.id);
                        try
                        {
                            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                            {
                                using (SqlCommand command = new SqlCommand("[MES_ObtenerDatosTipoCambioArranqueOrden]", connection))
                                {
                                    command.CommandType = CommandType.StoredProcedure;
                                    command.Parameters.AddWithValue("@ordenId", ordenEntrante.ID);
                                    command.CommandTimeout = 60;
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

                            if (dt.Rows.Count > 0)
                            {
                                //IMPORTANTE!  a partir de aquí se utiliza los parametros guardados para esa orden entrante
                                int tipoCambioArranqueOrdenEnt = int.Parse(dt.Rows[0].Field<string>("CAMBIO_ARRANQ_TIPO"));
                                int tipoArranqueOrdenEnt = int.Parse(dt.Rows[0].Field<string>("ARRANQUE_ID"));
                                DateTime? fechaCambioArranque = dt.Rows[0].Field<DateTime?>("CAMBIO_ARRANQ_FECHA");
                                DateTime? fechaLlenadoraCambioArranqueOrdenEnt = dt.Rows[0].Field<DateTime?>("CAMBIO_ARRANQ_FECHA_LLENADORA");
                                DateTime ActualStartTime = (DateTime)fechaCambioArranque;
                                //si es arranque buscaremos si hay turno para igualar actualStartTime a la del turno
                                if (tipoCambioArranqueOrdenEnt == 0)
                                {
                                    using (MESEntities context = new MESEntities())
                                    {
                                        IEnumerable<TurnosConBreak> turnosArray = context.TurnosConBreak.AsNoTracking().Where(t => t.InicioTurno <= fechaCambioArranque && t.FinTurno >= fechaCambioArranque && t.Linea == lineaPath);
                                        if (turnosArray.Count() > 0)
                                        {
                                            TurnosConBreak _turno = turnosArray.First();
                                            ActualStartTime = _turno.FinBreak != null ? (DateTime)_turno.FinBreak : (DateTime)_turno.InicioTurno;
                                        }
                                        //si no hay turno planificado el actualStartTime será igual a la fechaCambioArranque
                                    }
                                }

                                int tiempoLlenadora = 0;
                                int tiempoPaletizadora = 0;

                                int tiempoObjLlenadora = 0, tiempoObjPaletizadora = 0, tiempoPreactor = 0;
                                string productoSal = "", idProductoSal = "", ordenSal = "";

                                var flagDatos = -1;

                                if (tipoCambioArranqueOrdenEnt == 0)
                                {
                                    //'ObjName: "COB_MSM_TIEMPOS_ARRANQUES",
                                    //'Filter: "ID_PRODUCTO_ENTRANTE = [THE-ROOT.STR_ID_PRODUCTO_ENTRANTE]  AND FK_LINEAS_ID = [THE-ROOT.INT_FK_LINEAS_ID] AND FK_ARRANQUES_ID=[THE-ROOT.INT_FK_ARRANQUES_ID]"
                                    try
                                    {
                                        flagDatos = ObtenerDatosOrdenArranque(lineaPath, ordenEntrante.FinalMaterialID, tipoArranqueOrdenEnt,
                                            ref tiempoObjLlenadora, ref tiempoObjPaletizadora, ref tiempoPreactor);
                                        if (flagDatos < 0)
                                        {
                                            result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_DATOS_OBJETIVOS_ARRANQ_CAMBIO") };

                                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "DAO_Orden.ObtenerDatosOrdenCambio -" + IdiomaController.GetResourceName("ERROR_DATOS_OBJETIVOS_ARRANQ_CAMBIO"), "daoOrden.tratamientoWOCambioArranque", "I-MES-WO", usuario);
                                        }

                                        //calculamos tiempos hasta llenadora y paletizadora
                                        if (ActualStartTime != null && fechaLlenadoraCambioArranqueOrdenEnt != null)
                                            tiempoLlenadora = (int)((TimeSpan)(fechaLlenadoraCambioArranqueOrdenEnt - ActualStartTime)).TotalSeconds;

                                        if (ActualStartTime != null)
                                            tiempoPaletizadora = (int)((TimeSpan)(DateTime.UtcNow - ActualStartTime)).TotalSeconds;
                                    }
                                    catch
                                    {
                                        tiempoObjLlenadora = 0;
                                        tiempoObjPaletizadora = 0;
                                        tiempoPreactor = 0;
                                    }
                                }
                                else if (tipoCambioArranqueOrdenEnt == 1)
                                {
                                    //'ObjName: "COB_MSM_TIEMPOS_CAMBIOS",
                                    //'Filter: "ID_PRODUCTO_ENTRANTE = [THE-ROOT.STR_ID_PRODUCTO_ENTRANTE-0]  AND ID_PRODUCTO_SALIENTE = [THE-ROOT.STR_ID_PRODUCTO_SALIENTE-0] AND FK_LINEAS_ID = [THE-ROOT.INT_FK_LINEAS_ID-0] "

                                    try
                                    {
                                        DateTime? fechaDesasignacionLlenadora = null, fechaDesasignacionPaletizadora = null;
                                        flagDatos = ObtenerDatosOrdenCambio(lineaPath, ordenEntrante.FinalMaterialID, ref ordenSal, ref idProductoSal,
                                            ref productoSal, ref tiempoObjLlenadora, ref tiempoObjPaletizadora, ref fechaDesasignacionLlenadora,
                                            ref fechaDesasignacionPaletizadora, ref tiempoPreactor);
                                        if (flagDatos < 0)
                                        {
                                            result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_DATOS_OBJETIVOS_ARRANQ_CAMBIO") };

                                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "DAO_Orden.ObtenerDatosOrdenCambio -" + IdiomaController.GetResourceName("ERROR_DATOS_OBJETIVOS_ARRANQ_CAMBIO"), "daoOrden.tratamientoWOCambioArranque", "I-MES-WO", usuario);
                                        }

                                        //calculamos tiempos hasta llenadora y paletizadora
                                        if (fechaDesasignacionLlenadora != null && fechaLlenadoraCambioArranqueOrdenEnt != null)
                                            tiempoLlenadora = (int)((TimeSpan)(fechaLlenadoraCambioArranqueOrdenEnt - fechaDesasignacionLlenadora)).TotalSeconds;
                                        if (fechaDesasignacionPaletizadora != null)
                                            tiempoPaletizadora = (int)((TimeSpan)(DateTime.UtcNow - fechaDesasignacionPaletizadora)).TotalSeconds;
                                    }
                                    catch
                                    {
                                        tiempoObjLlenadora = 0;
                                        tiempoObjPaletizadora = 0;
                                        tiempoPreactor = 0;
                                        productoSal = "";
                                        idProductoSal = "";
                                        ordenSal = "";
                                    }
                                }

                                if (tiempoLlenadora < 0)
                                    tiempoLlenadora = 0;
                                if (tiempoPaletizadora < 0)
                                    tiempoPaletizadora = 0;

                                if (result.err)
                                {
                                    if (ordenEntrante.FinalMaterialID != idProductoSal || tipoCambioArranqueOrdenEnt != 1)
                                    {
                                        bool manual = false;
                                        //si el producto entrante y saliente es el mismo, NO creamos la orden de cambio
                                        //ASINCRONAMETE creamos la orden de cambio 
                                        ReturnValue retAC = CrearOrdenArranqueCambioDatos(ActualStartTime.ToString(), lineaPath, tiempoLlenadora, tiempoPaletizadora,
                                            tiempoObjLlenadora, tiempoObjPaletizadora, ordenEntrante.FinalMaterialID, ordenEntrante.FinalMaterialID, tipoCambioArranqueOrdenEnt,
                                            ordenEntrante.ID, productoSal, idProductoSal, tipoArranqueOrdenEnt.ToString(), ordenSal, usuario, tiempoPreactor, manual);
                                        if (!retAC.succeeded)
                                        {
                                            result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_CREANDO_ORDEN_ARRANQ_CAMBIO") };
                                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "daoOrden.tratamientoWOCambioArranque, create Orden Cambio/arranque (err: " + retAC.numcode + "): " + retAC.message, "daoOrden.crearOrdenArranqueCambioDatos", "I-MES-WO", usuario);
                                        }
                                    }
                                }
                            }
                            else
                            {
                                result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_CREANDO_ORDEN_ARRANQ_CAMBIO") };
                                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "call sql -> MES_ObtenerDatosTipoCambioArranqueOrden, No hay datos", "daoOrden.tratamientoWOCambioArranque", "I-MES-WO", usuario);
                            }
                        }
                        catch (Exception ex)
                        {
                            result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_CREANDO_ORDEN_ARRANQ_CAMBIO") };

                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "call sql -> MES_ObtenerDatosTipoCambioArranqueOrden, exception: " + ex.Message, "daoOrden.tratamientoWOCambioArranque", "I-MES-WO", usuario);
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_ORDENES") };
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "Exception: " + ex.Message, "daoOrden.tratamientoWOCambioArranque", "I-MES-WO", usuario);
            }

            return result;
        }

        internal static int ObtenerDatosOrdenArranque(string idLinea, string idProducto, int tipoDeArranque, ref int tiempoObjLlenadora,
            ref int tiempoObjPaletizadora, ref int tiempoPreactor)
        {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTiemposArranqueOrden]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@idProducto", idProducto);
            comando.Parameters.AddWithValue("@tipoArranque", tipoDeArranque);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    tiempoObjLlenadora = DataHelper.GetInt(dr, "Tobj1");
                    tiempoObjPaletizadora = DataHelper.GetInt(dr, "Tobj2");
                    tiempoPreactor = DataHelper.GetInt(dr, "TIEMPO_PREACTOR");
                    break;
                }
            }
            catch
            {
                return -1;
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return 1;
        }

        internal static int ObtenerDatosOrdenCambio(string idLinea, string idProductoEntrante, ref string ordenSal, ref string idProductoSal,
            ref string productoSal, ref int tiempoObjLlenadora, ref int tiempoObjPaletizadora, ref DateTime? ordenSalFechaLlenadoraDesag,
            ref DateTime? ordenSalFechaPaletizadoraDesag, ref int tiempoPreactor)
        {

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTiemposCambioOrden]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@idProductoEntrante", idProductoEntrante);
            //comando.Parameters.AddWithValue("@idProductoSaliente", idProductoSaliente);
            comando.CommandType = CommandType.StoredProcedure;
            comando.CommandTimeout = 120;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    tiempoObjLlenadora = DataHelper.GetInt(dr, "Tobj1");
                    tiempoObjPaletizadora = DataHelper.GetInt(dr, "Tobj2");
                    //ref string ordenSal, ref string idProductoSal, ref string productoSal,	
                    ordenSal = DataHelper.GetString(dr, "ordenSal");
                    idProductoSal = DataHelper.GetString(dr, "idProductoSal");
                    productoSal = DataHelper.GetString(dr, "productoSal");
                    string fechaLlenadora = DataHelper.GetString(dr, "fechaDesasignacionLlenadora");
                    string fechaPalerizadora = DataHelper.GetString(dr, "fechaDesasignacionPaletizadora");
                    if (fechaLlenadora != null)
                        ordenSalFechaLlenadoraDesag = DateTime.Parse(fechaLlenadora);
                    if (fechaPalerizadora != null)
                        ordenSalFechaPaletizadoraDesag = DateTime.Parse(fechaPalerizadora);
                    tiempoPreactor = DataHelper.GetInt(dr, "TIEMPO_PREACTOR");
                    break;
                }
            }
            catch
            {
                return -1;
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();

            }

            return 1;
        }

        internal static async Task<object> desasignarWO2Zonas(string lineaPath, List<Zona> zonas, string woIdSaliente, string nuevoEstado, string usuario, string tipoUsuario)
        {
            dynamic result = new { err = true, errDesc = "" };
            string zonasStr = "{";
            bool revisarVelNomLlenadora = false;
            bool revisarVelNomPaletera = false;
            bool zonaConMaquinasCompartidas = false;

            foreach (Zona z in zonas)
            {
                if (z.Arranque || z.esPaletizadora)
                {
                    revisarVelNomLlenadora = true;
                }

                if (z.esPaletizadora)
                {
                    revisarVelNomPaletera = true;
                }

                if (z.MaquinasCompartidas)
                {
                    zonaConMaquinasCompartidas = true;
                }

                zonasStr += z.descripcion + ", ";
                //1. Llamar a asignar orden en zona y el permisivo de llenadora 
                ReturnValue resultEditZona = await UpdateOrderIdZona(lineaPath, z, string.Empty);
                if (!resultEditZona.succeeded)
                {
                    result = new { err = false, errDesc = IdiomaController.GetResourceName("ERROR_DESASIGNANDO_ZONA") };
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_DESASIGNANDO_ZONA") + ". COB_MSM_ZONA Bread err, change order id (WO: " + woIdSaliente + ", Zona: " + z.descripcion + "  err: " + resultEditZona.numcode + "): " + resultEditZona.message, "ZonasBread.updateOrderIdZona", "I-MES-WO", usuario);
                    break;
                }
            }
            zonasStr += "}";
            if (!result.err)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_DESASIGNANDO_ZONA") + ": " + String.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"), woIdSaliente, zonasStr, nuevoEstado, tipoUsuario), "DAO_Orden.ActualizarConsolidadosWOMaquinasZona", "I-MES-WO", usuario);
                return result;
            }

            //2. Lanzar la regla gestión de consolidados de máquinas (consolidados y propiedades de estas)                 
            ActualizarConsolidadosMaquinas(1, lineaPath, woIdSaliente, usuario);

            //3. Revisar velocidad nominal Linea             
            if (revisarVelNomLlenadora)
            {
                Linea lin = PlantaRT.planta.lineas.Where(l => l.id == lineaPath).First();
                result = await DAO_Linea.RevisarVelocidadNominalLlenadora(lin);
                if (!result.err)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_DESASIGNANDO_ZONA") + ". " +
                        String.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"), woIdSaliente, zonasStr, nuevoEstado, tipoUsuario), "DAO_Linea.RevisarVelocidadNominal", "I-MES-WO", usuario);
                    return result;
                }
            }

            if (revisarVelNomPaletera)
            {
                Linea lin = PlantaRT.planta.lineas.Where(l => l.id == lineaPath).First();
                // Si es la línea de doble salida de Alovera
                if (zonaConMaquinasCompartidas)//string.IsNullOrEmpty(lin.Grupo)
                {
                    DAO_Tags daoTags = new DAO_Tags();
                    var listaMaquinas = daoTags.ObtenerConfiguracionMaquinasCompartidas();
                    var paleterasLinea = listaMaquinas.Where(m => m.Linea == lin.id && m.Maquina.Contains("PAL")).ToList();
                    List<MaquinasCompartidas> listaPaleteras = new List<MaquinasCompartidas>();

                    foreach (var paletera in paleterasLinea)
                    {
                        MaquinasCompartidas maquinaCompartida = new MaquinasCompartidas();
                        maquinaCompartida.Nombre = paletera.Maquina;
                        maquinaCompartida.value = paletera.Activa;
                        listaPaleteras.Add(maquinaCompartida);
                    }

                    result = await DAO_Linea.RevisarVelocidadNominalPaleteraZona(lin, listaPaleteras);

                    //Tratamiento línea opuesta
                    Linea lineaOpuesta = PlantaRT.planta.lineas.Find(l => l.Grupo == lin.Grupo && l.id != lin.id);
                    var paleterasLineaOpuesta = listaMaquinas.Where(m => m.Linea == lineaOpuesta.id && m.Maquina.Contains("PAL")).ToList();
                    List<MaquinasCompartidas> listaPaleterasOpuestas = new List<MaquinasCompartidas>();

                    foreach (var paleteraOpuesta in paleterasLineaOpuesta)
                    {
                        MaquinasCompartidas maquinaCompartidaOpuesta = new MaquinasCompartidas();
                        maquinaCompartidaOpuesta.Nombre = paleteraOpuesta.Maquina;
                        maquinaCompartidaOpuesta.value = paleteraOpuesta.Activa;
                        listaPaleterasOpuestas.Add(maquinaCompartidaOpuesta);
                    }

                    result = await DAO_Linea.RevisarVelocidadNominalPaleteraZona(lineaOpuesta, listaPaleterasOpuestas);
                }
                else
                {
                    result = await DAO_Linea.RevisarVelocidadNominalPaleteraZona(lin, null);
                }

                if (!result.err)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_DESASIGNANDO_ZONA") + ". " +
                        String.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"), woIdSaliente, zonasStr, nuevoEstado, tipoUsuario), "DAO_Linea.RevisarVelocidadNominalPaletera", "I-MES-WO", usuario);
                    return result;
                }
            }

            //4. Lllamar a actualizar estado orden y actual start time.  . Actualizaremos el actual_start_time si no se ha modificado antes su valor.
            if (nuevoEstado != "")
            {
                result = cambiarEstadoOrden(woIdSaliente, nuevoEstado, usuario, tipoUsuario);
                if (!result.err)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_DESASIGNANDO_ZONA") + ". " + String.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"), woIdSaliente, zonasStr, nuevoEstado, tipoUsuario), "DAO_Orden.cambiarEstadoOrdenes", "I-MES-WO", usuario);
                    return result;
                }
                string woIdPadre = woIdSaliente.Split('.')[0];

                string nuevoEstadoPadre = obtenerNuevoEstadoWOPadre(woIdPadre);
                if (nuevoEstadoPadre != "")
                {
                    dynamic resultAux = cambiarEstadoOrden(woIdPadre, nuevoEstadoPadre, usuario, tipoUsuario);
                    if (!resultAux.err)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, IdiomaController.GetResourceName("ERROR_DESASIGNANDO_ZONA") + ". " + String.Format(IdiomaController.GetResourceName("ERROR_ASIG_DESA_FORMAT_STRING"), woIdPadre, zonasStr, nuevoEstado, tipoUsuario), "DAO_Orden.cambiarEstadoOrdenes", "I-MES-WO", usuario);
                    }
                }
            }

            //5. Guardar fechas para poder crear orden de cambio a posteriori
            result = tratamientoWOCambioArranqueEnDesasignar(lineaPath, woIdSaliente, zonas, usuario);

            // Tarea 2: Notificar cambios de estado en paralelo
            var tareaNotificacion = Task.Run(() =>  {  NotificarCambiosEstado(); });

            return result;
        }

        private static async Task<ReturnValue> UpdateOrderIdZona(string idLinea, Zona zona, string woId)
        {
            ReturnValue ret = new ReturnValue();
            try
            {
                COB_MSM_ZONAS_BREAD contextp = new COB_MSM_ZONAS_BREAD();
                string filtro = string.Format("{{ID_ZONA}} = '{0}'", zona.id);
                List<COB_MSM_ZONAS> encontrados = contextp.Select("", 0, -1, filtro).ToList();
                if (encontrados.Count() == 1)
                {
                    COB_MSM_ZONAS cob = encontrados.First();

                    // Comprobación para ver si la WO a asignar se puede incluir en esa zona
                    if (woId != string.Empty)
                    {
                        Linea lin = PlantaRT.planta.lineas.Where(l => l.numLinea == cob.FK_LINEAS_ID).FirstOrDefault();
                        Particiones particion;
                        using (MESEntities contexto = new MESEntities())
                        {
                            particion = contexto.Particiones.AsNoTracking().Where(p => p.Id == woId).FirstOrDefault();
                        }

                        if (particion.Linea != lin.id)
                        {
                            ret.succeeded = false;
                            return ret;
                        }
                    }

                    cob.ORDER_ID_ANTERIOR = !string.IsNullOrEmpty(cob.ORDER_ID) ? cob.ORDER_ID : cob.ORDER_ID_ANTERIOR;
                    cob.ORDER_ID = woId;
                    // Se pone el flag a 1 para indicar que tiene que revisar los consolidados de sus máquinas
                    cob.FLAG_CHECK_CONSOLIDADOS = 1;
                    cob.FECHA_ULTIMA_ACTUALIZACION = DateTime.UtcNow;

                    ret = contextp.Edit(cob);

                    if (ret.succeeded && zona.esLlenadora)
                    {
                        DAO_Tags daoTags = new DAO_Tags();
                        await daoTags.ModificarPermisivoWO(idLinea, woId);
                    }
                }
                else
                {
                    ret.succeeded = false;
                }
            }
            catch (Exception ex)
            {
                ret.succeeded = false;
                ret.message = ex.Message;
            }

            return ret;
        }

        static object ActualizarConsolidadosMaquinas(int actualizarOrdenes, string lineaPath, string woId, string usuario)
        {
            PMConnectorBase.Connect();
            using (ModificarConsolidadosAsignarDesasignarWO reglaObj = new ModificarConsolidadosAsignarDesasignarWO(PMConnectorBase.PmConexion))
            {
                string errDesc = IdiomaController.GetResourceName("ERROR_ACT_CONSOLIDADOS_MAQUINAS");
                CallResult resRegla = reglaObj.Start(woId.Split('.')[0], woId, lineaPath, actualizarOrdenes); // woIdSaliente.Split('.')[0], woIdSaliente, lineaPath);

                switch (resRegla)
                {
                    case CallResult.CR_Ok:
                        //se lanza de forma asincrono no tiene sentido registrar esto
                        //DAO_Log.registrarLogBook("WEB-BACKEND", 3, 1, "Llamanda desde .Net a la regla a actualizar WO y CONSOLIDADOS de máquinas. zona: " + z.id, "DAO_ORDEN.actualizarConsolidadosWOMaquinasZona", "I-MES-WO", usuario);
                        break;
                    case CallResult.CR_Timedout:
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, errDesc + " (err Timeout) ", "DAO_ORDEN.actualizarConsolidadosWOMaquinasZona", "I-MES-WO", usuario);
                        return new { err = false, errDesc = errDesc };
                    default:
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, errDesc + " Err: " + resRegla.ToString(), "DAO_ORDEN.actualizarConsolidadosWOMaquinasZona", "I-MES-WO", usuario);
                        return new { err = false, errDesc = errDesc };
                }
            }

            return new { err = true, errDesc = "" };
        }

        static object ActualizarConsolidadosWO(string woID, string usuario)
        {
            PMConnectorBase.Connect();
            using (ActualizarProduccionOrden reglaObj = new ActualizarProduccionOrden(PMConnectorBase.PmConexion))
            {
                string woIDPadre = woID.Split('.')[0];
                string errDesc = IdiomaController.GetResourceName("ERROR_OBTENIENDO_DATOS_PROD");
                CallResult resRegla = reglaObj.Call(true, woIDPadre, woID);

                switch (resRegla)
                {
                    case CallResult.CR_Ok:
                        //se lanza de forma asincrono no tiene sentido registrar esto
                        //DAO_Log.registrarLogBook("WEB-BACKEND", 3, 1, "Llamanda desde .Net a la regla a actualizar WO y CONSOLIDADOS de máquinas. zona: " + z.id, "DAO_ORDEN.actualizarConsolidadosWOMaquinasZona", "I-MES-WO", usuario);
                        break;
                    case CallResult.CR_Timedout:
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, errDesc + " (err Timeout) ", "DAO_ORDEN.actualizarConsolidadosWO", "I-MES-WO", usuario);
                        return new { err = false, errDesc = errDesc };
                    default:
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, errDesc + " Err: " + resRegla.ToString(), "DAO_ORDEN.actualizarConsolidadosWO", "I-MES-WO", usuario);
                        return new { err = false, errDesc = errDesc };
                }
            }

            return new { err = true, errDesc = "" };
        }

        internal ReturnValue editarOrdenArranqueCambio(dynamic datos)
        {
            try
            {
                string orden = datos.idOrden.ToString();
                string fecha = datos.fecha.ToString();
                string linea = datos.linea.ToString();
                int numeroLinea = 0;

                using (MESEntities contexto = new MESEntities())
                {
                    numeroLinea = contexto.Lineas.AsNoTracking().Where(l => l.Id == linea).Select(l => l.NumeroLinea).First().Value;
                }

                int duracionLlenadora = int.Parse(datos.duracionLlenadora.ToString()) * 60;
                int duracionPaletizadora = int.Parse(datos.duracionPaletizadora.ToString()) * 60;
                int duracionObjetivoLlenadora = int.Parse(datos.toLlenadora.ToString());
                int duracionObjetivoPaletizadora = int.Parse(datos.toPaletizadora.ToString());
                int tiempoPreactor = int.Parse(datos.tiempoPreactor.ToString());
                string producto = datos.productoEnt.ToString();
                string idProducto = producto.Substring(0, producto.IndexOf('-')).Trim();
                int tipo = int.Parse(datos.tipo.ToString());
                string ordenEnt = producto.Substring(producto.IndexOf('('), producto.Length - producto.IndexOf('(')).Replace("(", String.Empty).Replace(")", String.Empty).Trim();
                string productoSal = "";
                string idProductoSal = "";
                string tipoArranque = "";
                string ordenSal = "";

                OrdenesArranque ordenArranque = new OrdenesArranque();
                OrdenesCambio ordenCambio = new OrdenesCambio();

                if (tipo == 0)
                {
                    using (MESEntities context = new MESEntities())
                    {
                        ordenArranque = context.OrdenesArranque.AsNoTracking().Where(e => e.Id.Equals(orden)).FirstOrDefault();
                    }

                    tipoArranque = datos.tipoArranque.ToString();

                    TiemposBread.ModificarTiempoArranque(datos, numeroLinea);
                }
                else
                {
                    using (MESEntities context = new MESEntities())
                    {
                        ordenCambio = context.OrdenesCambio.AsNoTracking().Where(e => e.Id.Equals(orden)).FirstOrDefault();
                    }

                    productoSal = datos.productoSal.ToString();
                    idProductoSal = productoSal.Substring(0, productoSal.IndexOf('-')).Trim();
                    ordenSal = productoSal.Substring(productoSal.IndexOf('('), productoSal.Length - productoSal.IndexOf('(')).Replace("(", String.Empty).Replace(")", String.Empty).Trim();

                    TiemposBread.ModificarTiempoCambio(datos, numeroLinea);
                }

                DateTime fechaDT = DateTime.Parse(fecha);
                ReturnValue ret = new ReturnValue();

                Order ordenCambioArranque = OrdenesBread.ObtenerOrden(orden);

                if (ordenCambioArranque == null)
                    return new ReturnValue(false, -1, "Orden no encontrada");

                ordenCambioArranque.ActualStartTime = fechaDT;
                ordenCambioArranque.EstimatedStartTime = fechaDT;

                int maximo = duracionPaletizadora >= duracionLlenadora ? duracionPaletizadora : duracionLlenadora;
                DateTime fechaFin = fechaDT.AddSeconds(maximo);
                ordenCambioArranque.ActualEndTime = fechaFin;
                ordenCambioArranque.EstimatedEndTime = fechaFin;

                ret = OrdenesBread.EditarOrden(ordenCambioArranque);

                if (!ret.succeeded) return ret;

                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ActualizaLineaArranqueCambio]", conexion))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@orden", ordenCambioArranque.ID);
                        command.Parameters.AddWithValue("@valor", linea.ToString());
                        conexion.Open();

                        command.ExecuteNonQuery();
                    }
                }

                ret = editaCreaPropiedadOrden(ordenCambioArranque, "TIEMPO_1", duracionLlenadora.ToString());
                if (!ret.succeeded) return ret;
                ret = editaCreaPropiedadOrden(ordenCambioArranque, "TIEMPO_2", duracionPaletizadora.ToString());
                if (!ret.succeeded) return ret;

                ret = editaCreaPropiedadOrden(ordenCambioArranque, "TIEMPO_OBJETIVO_LLE", duracionObjetivoLlenadora.ToString());
                if (!ret.succeeded) return ret;
                ret = editaCreaPropiedadOrden(ordenCambioArranque, "TIEMPO_OBJETIVO_PAL", duracionObjetivoPaletizadora.ToString());
                if (!ret.succeeded) return ret;
                ret = editaCreaPropiedadOrden(ordenCambioArranque, "TIEMPO_PREACTOR", tiempoPreactor.ToString());
                if (!ret.succeeded) return ret;

                if (tipo == 0)
                {
                    int pos = producto.IndexOf('-');
                    producto = producto.Substring(0, pos).Trim();
                    ret = editaCreaPropiedadOrden(ordenCambioArranque, "CMB_MATERIAL_1", idProducto);
                    if (!ret.succeeded) return ret;
                    ret = editaCreaPropiedadOrden(ordenCambioArranque, "CMB_WO_1", ordenEnt.ToString());
                    if (!ret.succeeded) return ret;
                    ret = editaCreaPropiedadOrden(ordenCambioArranque, "ARRANQUE_ID", tipoArranque);
                    if (!ret.succeeded) return ret;
                }
                else
                {
                    int pos = producto.IndexOf('-');
                    producto = producto.Substring(0, pos).Trim();
                    ret = editaCreaPropiedadOrden(ordenCambioArranque, "CMB_MATERIAL_2", idProducto);
                    if (!ret.succeeded) return ret;
                    ret = editaCreaPropiedadOrden(ordenCambioArranque, "CMB_WO_2", ordenEnt.ToString());
                    if (!ret.succeeded) return ret;
                    pos = productoSal.IndexOf('-');
                    productoSal = productoSal.Substring(0, pos).Trim();
                    ret = editaCreaPropiedadOrden(ordenCambioArranque, "CMB_MATERIAL_1", idProductoSal);
                    if (!ret.succeeded) return ret;
                    ret = editaCreaPropiedadOrden(ordenCambioArranque, "CMB_WO_1", ordenSal.ToString());
                    if (!ret.succeeded) return ret;
                }

                if (ret.succeeded)
                {
                    if (tipo == 0) //Arranque
                    {
                        string excep = "Edicion Orden Arranque: " + orden + ";Linea: " + linea + ";InicioReal:" + string.Format("{0:dd/MM/yyyy HH:mm:ss}", ordenArranque.InicioReal) + "=>" + 
                            string.Format("{0:dd/MM/yyyy HH:mm:ss}", fechaDT.ToLocalTime()) + "; OrdenEntrante:" + ordenArranque.IDProductoEntrante + "=>" + idProducto + ";TipoArranque:" + 
                            ordenArranque.TipoArranque + "=>" + tipoArranque + ";Tiempos(LLE;PAL):" + ordenArranque.MinutosFinal1.ToString() + ";" + ordenArranque.MinutosFinal2.ToString() + "=>" + 
                            (duracionLlenadora / 60).ToString() + ";" + (duracionPaletizadora / 60).ToString();
                        
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.editarOrdenArranque", excep, HttpContext.Current.User.Identity.Name);
                    }
                    else //Cambio
                    {
                        string excep = "Edicion Orden Cambio: " + orden + ";Linea: " + linea + ";InicioReal:" + string.Format("{0:dd/MM/yyyy HH:mm:ss}", ordenCambio.InicioReal) + "=>" + 
                            string.Format("{0:dd/MM/yyyy HH:mm:ss}", fechaDT.ToLocalTime()) + "; OrdenEntrante:" + ordenCambio.IDProductoEntrante + "=>" + idProducto + ";OrdenSaliente:" + 
                            ordenCambio.IDProductoSaliente + "=>" + idProductoSal + ";Tiempos(LLE;PAL):" + ordenCambio.MinutosFinal1.ToString() + ";" + ordenCambio.MinutosFinal2.ToString() + "=>" + 
                            (duracionLlenadora / 60).ToString() + ";" + (duracionPaletizadora / 60).ToString();
                        
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.editarOrdenCambio", excep, HttpContext.Current.User.Identity.Name);
                    }
                }

                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.editarOrdenArranqueCambio", "WEB-WO", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal static ReturnValue CerrarOrdenCambio(string idOrden)
        {
            ReturnValue result = new ReturnValue();
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var ordenCambio = context.OrdenesCambio.AsNoTracking().Where(oc => oc.OrdenEntrante == idOrden && oc.EstadoAct != "Cerrada").ToList();
                    foreach (var item in ordenCambio)
                    {
                        Order itemOrdenCambio = OrdenesBread.ObtenerOrden(item.Id);
                        itemOrdenCambio.StatusID = "Cerrada";
                        result = OrdenesBread.EditarOrden(itemOrdenCambio);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.CerrarOrdenCambio", "WEB-WO", "Sistema");
            }

            return result;
        }

        internal static ReturnValue CerrarOrdenArranque(string idOrden)
        {
            ReturnValue result = new ReturnValue();
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var ordenArranque = context.OrdenesArranque.AsNoTracking().Where(oc => oc.OrdenEntrante == idOrden && oc.EstadoAct != "Cerrada").ToList();
                    foreach (var item in ordenArranque)
                    {
                        Order itemOrdenCambio = OrdenesBread.ObtenerOrden(item.Id);
                        itemOrdenCambio.StatusID = "Cerrada";
                        result = OrdenesBread.EditarOrden(itemOrdenCambio);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.CerrarOrdenArranque", "WEB-WO", "Sistema");
            }

            return result;
        }

        public static List<Zona> obtenerZonasOrdenLinea(string orderid, string lineaStr)
        {
            List<Zona> result = new List<Zona>();
            Linea lin = PlantaRT.planta.lineas.Where(l => l.id == lineaStr).First();
            lin.zonas.ForEach(z =>
            {
                if (z.ordenActual != null && z.ordenActual.id == orderid)
                    result.Add(z);
            });

            return result;
        }

        public ReturnValue editaCreaPropiedadOrden(Order orden, string propiedad, string valor)
        {
            OrderProperty op = OrdenesBread.ObtenerPropiedadOrdenByName(orden.PK, propiedad);
            if (op == null)
            {
                OrderProperty op1 = new OrderProperty();
                op1.MultiValue = false;
                op1.Name = propiedad;
                op1.OrderID = orden.ID;
                op1.OrderPK = orden.PK;
                if (propiedad.Contains("TIEMPO") || propiedad.Contains("ARRANQUE") || propiedad.Contains("CAMBIO_ARRANQ_TIPO"))
                    op1.Type = "Numeric";
                else
                    op1.Type = "String";

                op1.UoMID = "n/a";

                ReturnValue ret = OrdenesBread.CrearPropiedadOrden(op1);

                if (!ret.succeeded) return ret;
            }
            op = OrdenesBread.ObtenerPropiedadOrdenByName(orden.PK, propiedad);

            if (op.Type.ToLower().Equals("string"))
            {
                EditarPropiedadOrden(propiedad, orden.ID, valor);
                return new ReturnValue(true);
            }
            else
            {
                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ActualizaMinutosArranqueCambio]", conexion))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@orden", orden.ID);
                        command.Parameters.AddWithValue("@tipo", propiedad);
                        command.Parameters.AddWithValue("@valor", valor);
                        conexion.Open();

                        try
                        {
                            command.ExecuteNonQuery();
                            return new ReturnValue(true);
                        }
                        catch
                        {
                            return new ReturnValue(false, -1, "Error actualizando el valor");
                        }
                    }
                }
            }
        }

        public ReturnValue editaCreaPropiedadGenOrden(Order orden, string propiedad, string type, string valor)
        {
            OrderProperty op = OrdenesBread.ObtenerPropiedadOrdenByName(orden.PK, propiedad);
            if (op == null)
            {
                OrderProperty op1 = new OrderProperty();
                op1.MultiValue = false;
                op1.Name = propiedad;
                op1.OrderID = orden.ID;
                op1.OrderPK = orden.PK;
                op1.Type = type; //type = "Numeric", "String"
                op1.UoMID = "n/a";

                ReturnValue ret = OrdenesBread.CrearPropiedadOrden(op1);

                if (!ret.succeeded) return ret;
            }
            op = OrdenesBread.ObtenerPropiedadOrdenByName(orden.PK, propiedad);

            EditarPropiedadOrden(propiedad, orden.ID, valor);
            return new ReturnValue(true);
        }

        internal ReturnValue eliminarOrdenArranqueCambio(dynamic datos)
        {
            try
            {
                string orden = datos.idOrden.ToString();
                ReturnValue ret = new ReturnValue();

                Order ordenCambioArranque = OrdenesBread.ObtenerOrden(orden);

                if (ordenCambioArranque.ID.StartsWith("OC"))
                {
                    List<COB_MSM_ACCIONES_CAMBIOS> mejora = AccionesMejoraBread.ObtenerAccionMejoraCambioPorID(ordenCambioArranque.ID);

                    foreach (var paromejora in mejora)
                    {
                        ret = AccionesMejoraBread.BorrarAccionMejoraCambio(paromejora);

                        if (!ret.succeeded)
                            return ret;
                    }
                }
                else
                {
                    List<COB_MSM_ACCIONES_ARRANQUES> mejora = AccionesMejoraBread.ObtenerAccionMejoraArranquePorID(ordenCambioArranque.ID);

                    foreach (var paromejora in mejora)
                    {
                        ret = AccionesMejoraBread.BorrarAccionMejoraArranque(paromejora);

                        if (!ret.succeeded)
                            return ret;
                    }
                }

                List<OrderProperty> listaProp = OrdenesBread.ObtenerPropiedadesOrden(ordenCambioArranque.PK);

                foreach (OrderProperty propiedad in listaProp)
                {
                    ret = OrdenesBread.BorrarPropiedadOrden(propiedad);
                }

                ret = OrdenesBread.BorrarOrden(ordenCambioArranque);

                if (ret.succeeded)
                {
                    if (ordenCambioArranque.ID.StartsWith("OA"))
                    {
                        string excep = "Borrada Orden Arranque: " + ordenCambioArranque.ID;
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.elimniarOrdenArranque", excep, HttpContext.Current.User.Identity.Name);
                    }
                    else //Cambio
                    {
                        string excep = "Borrada Orden Cambio: " + ordenCambioArranque.ID;
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "OrdenesController.eliminarOrdenCambio", excep, HttpContext.Current.User.Identity.Name);
                    }
                }

                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.eliminarOrdenArranqueCambio", "WEB-WO", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal ReturnValue crearOrdenArranqueCambioDatosSinFiltrar(dynamic datos)
        {
            try
            {
                //string orden = datos.idOrden.ToString();
                string fecha = datos.fecha.ToString();
                string linea = datos.linea.ToString();
                int duracionLlenadora = int.Parse(datos.duracionLlenadora.ToString()) * 60;
                int duracionPaletizadora = int.Parse(datos.duracionPaletizadora.ToString()) * 60;
                int tiempoObjetivoLlenadora = int.Parse(datos.toLlenadora.ToString());
                int tiempoObjetivoPaletizadora = int.Parse(datos.toPaletizadora.ToString());
                int tiempoPreactor = int.Parse(datos.tiempoPreactor.ToString());
                string producto = datos.productoEnt.ToString();
                string idProducto = producto.Substring(0, producto.IndexOf('-')).Trim();
                int tipo = int.Parse(datos.tipo.ToString());
                string ordenEnt = producto.Substring(producto.IndexOf('('), producto.Length - producto.IndexOf('(')).Replace("(", String.Empty).Replace(")", String.Empty).Trim();
                string productoSal = "";
                string idProductoSal = "";
                string tipoArranque = "";
                string ordenSal = "";
                bool manual = true;

                if (tipo == 0)
                    tipoArranque = datos.tipoArranque.ToString();
                else
                {
                    productoSal = datos.productoSal.ToString();
                    idProductoSal = productoSal.Substring(0, productoSal.IndexOf('-')).Trim();
                    ordenSal = productoSal.Substring(productoSal.IndexOf('('), productoSal.Length - productoSal.IndexOf('(')).Replace("(", String.Empty).Replace(")", String.Empty).Trim();
                }

                ReturnValue ret = CrearOrdenArranqueCambioDatos(fecha, linea, duracionLlenadora, duracionPaletizadora, tiempoObjetivoLlenadora, tiempoObjetivoPaletizadora,
                    idProducto, producto, tipo, ordenEnt, productoSal, idProductoSal, tipoArranque, ordenSal, HttpContext.Current.User.Identity.Name, tiempoPreactor, manual);

                return ret;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        static internal ReturnValue CrearOrdenArranqueCambioDatos(string fecha, string linea, int duracionLlenadora, int duracionPaletizadora,
            int tiempoObjetivoLlenadora, int tiempoObjetivoPaletizadora, string idProducto, string producto, int tipo, string ordenEnt,
            string productoSal, string idProductoSal, string tipoArranque, string ordenSal, string user, int tiempoPreactor, bool manual)
        {
            try
            {
                //string orden = datos.idOrden.ToString();
                DateTime fechaDT = DateTime.Parse(fecha);

                ReturnValue ret = new ReturnValue();
                CallResult result;
                PMConnectorBase.Connect();
                int errorCode = 0;
                string errorDesc = "";
                string orderID = "";
                string mensaje = tipo == 0 ? IdiomaController.GetResourceName("CREACION_ORDEN_ARRANQ") : IdiomaController.GetResourceName("CREACION_ORDEN_CAMBIO");
                string usuario = manual ? HttpContext.Current.User.Identity.Name : "Sistema";

                if (tipo == 0)
                {
                    CrearWOArranque regla = new CrearWOArranque(PMConnectorBase.PmConexion);
                    using (CrearWOArranque re = new CrearWOArranque(PMConnectorBase.PmConexion))
                    {
                        result = regla.Call(linea, idProducto, "", int.Parse(tipoArranque), ref errorCode, ref errorDesc, ref orderID);
                    }
                }
                else
                {
                    PMConnectorBase.Connect();
                    CrearWOCambio regla = new CrearWOCambio(PMConnectorBase.PmConexion);
                    using (CrearWOCambio re = new CrearWOCambio(PMConnectorBase.PmConexion))
                    {
                        result = regla.Call(linea, idProducto, "", ref errorCode, ref errorDesc, ref orderID);
                    }
                }

                switch (result)
                {
                    case CallResult.CR_Ok:
                        break;
                    case CallResult.CR_Timedout:
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 3, 2, IdiomaController.GetResourceName("ERROR_CREANDO_ORDEN_ARRANQ_CAMBIO") + ", TimeOut", "DAO_Orden.crearOrdenArranqueCambioDatos", "I-MES-WO", usuario);
                        break;
                    default:
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 3, 2, IdiomaController.GetResourceName("ERROR_CREANDO_ORDEN_ARRANQ_CAMBIO") + ": " + errorDesc, "DAO_Orden.crearOrdenArranqueCambioDatos", "I-MES-WO", usuario);
                        break;
                }

                if (result == CallResult.CR_Ok)
                {
                    DAO_Orden daoOrden = new DAO_Orden();
                    Order ordenNueva = OrdenesBread.ObtenerOrden(orderID);

                    if (tipo == 0)
                    {
                        if (manual) 
                        {
                            ordenNueva.ActualStartTime = fechaDT;
                            ordenNueva.EstimatedStartTime = fechaDT;
                        }
                    }
                    else
                    {
                        ordenNueva.ActualStartTime = fechaDT;
                        ordenNueva.EstimatedStartTime = fechaDT;
                    }

                    int maximo = duracionPaletizadora >= duracionLlenadora ? duracionPaletizadora : duracionLlenadora;
                    DateTime fechaFin = fechaDT.AddSeconds(maximo);
                    ordenNueva.ActualEndTime = fechaFin;
                    ordenNueva.EstimatedEndTime = fechaFin;
                    ret = OrdenesBread.EditarOrden(ordenNueva);
                    if (!ret.succeeded) return ret;
                    ordenNueva = OrdenesBread.ObtenerOrden(orderID);

                    ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "TIEMPO_OBJETIVO_LLE", tiempoObjetivoLlenadora.ToString());
                    if (!ret.succeeded) return ret;
                    ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "TIEMPO_OBJETIVO_PAL", tiempoObjetivoPaletizadora.ToString());
                    if (!ret.succeeded) return ret;
                    ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "TIEMPO_1", duracionLlenadora.ToString());
                    if (!ret.succeeded) return ret;
                    ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "TIEMPO_2", duracionPaletizadora.ToString());
                    if (!ret.succeeded) return ret;
                    ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "TIEMPO_PREACTOR", tiempoPreactor.ToString());
                    if (!ret.succeeded) return ret;

                    if (tipo == 1)
                    {
                        ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "CMB_WO_1", ordenSal);
                        if (!ret.succeeded) return ret;
                        ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "CMB_WO_2", ordenEnt);
                        if (!ret.succeeded) return ret;
                        ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "CMB_MATERIAL_1", idProductoSal);
                        if (!ret.succeeded) return ret;
                        ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "CMB_MATERIAL_2", idProducto);
                        if (!ret.succeeded) return ret;
                    }
                    else
                    {
                        ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "CMB_WO_1", ordenEnt);
                        if (!ret.succeeded) return ret;
                        ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "CMB_MATERIAL_1", idProducto);
                        if (!ret.succeeded) return ret;
                        ret = daoOrden.editaCreaPropiedadOrden(ordenNueva, "ARRANQUE_ID", tipoArranque);
                        if (!ret.succeeded) return ret;
                    }
                }

                if (manual)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Orden.CrearOrdenArranqueCambioDatos", mensaje + ". WO: " + orderID, usuario);
                }
                else 
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 3, 2, mensaje + ". WO: " + orderID, "DAO_Orden.CrearOrdenArranqueCambioDatos", "I-MES-WO", usuario);
                }

                return ret;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal List<DTO.DTO_OrdenesPlanificadas> obtenerOrdenesFinalizadas(int fechaIni, string linea)
        {
            //DateTime fechaActual = new DateTime(1970,1,1);
            //fechaActual = fechaActual.AddSeconds(fechaIni).ToLocalTime();
            List<DTO.DTO_OrdenesPlanificadas> listaOrdenes = new List<DTO.DTO_OrdenesPlanificadas>();

            using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerOrdenFinalizadasTurno]", conexion))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@linea", linea);
                    command.Parameters.AddWithValue("@fechaIni", fechaIni);
                    conexion.Open();

                    SqlDataReader dr = command.ExecuteReader();

                    while (dr.Read())
                    {
                        DTO.DTO_OrdenesPlanificadas orden = new DTO.DTO_OrdenesPlanificadas();
                        orden.Calidad = double.Parse(dr["Calidad"].ToString());
                        orden.CantidadPlanificada = int.Parse(dr["CantidadPlanificada"].ToString());
                        orden.CantidadProducida = int.Parse(dr["CantidadProducida"].ToString());
                        orden.Disponibilidad = double.Parse(dr["Disponibilidad"].ToString());
                        orden.Eficiencia = double.Parse(dr["Eficiencia"].ToString());
                        orden.EstadoAct = dr["EstadoAct"].ToString();
                        orden.FecFinEstimada = dr["FecFinEstimada"].ToString();
                        orden.FecFinReal = dr["FecFinReal"].ToString();
                        orden.FecIniEstimada = dr["FecIniEstimada"].ToString();
                        orden.FecIniReal = dr["FecIniReal"].ToString();
                        orden.id = dr["id"].ToString();
                        orden.IdProducto = dr["IdProducto"].ToString();
                        orden.Linea = dr["Linea"].ToString();
                        orden.OEE = double.Parse(dr["OEE"].ToString());
                        orden.RendMecanico = double.Parse(dr["RendMecanico"].ToString());

                        Definition def = MaterialBread.ObetenerDefinicionProducto(orden.IdProducto);

                        orden.IdProducto = orden.IdProducto + " - " + def.Name;

                        using (MESEntities context = new MESEntities())
                        {
                            var lineaVista = context.Lineas.AsNoTracking().Where(m => m.Id.Equals(orden.Linea)).FirstOrDefault();

                            orden.Linea = IdiomaController.GetResourceName("LINEA") + " " + lineaVista.NumeroLinea.ToString() + " - " + lineaVista.Descripcion;
                        }

                        listaOrdenes.Add(orden);
                    }
                }
            }

            return listaOrdenes;
        }

        internal string obtenerOrdenesRelacionadas(dynamic datos)
        {
            string orden = datos.orden.ToString();

            Order ordenAC = OrdenesBread.ObtenerOrden(orden);

            OrderProperty op = OrdenesBread.ObtenerPropiedadOrdenByName(ordenAC.PK, "CMB_WO_1");

            string relacionado1 = "";
            string relacionado2 = "";

            if (op != null)
                relacionado1 = op.Value.ToString();

            if (ordenAC.ID.StartsWith("OC"))
            {
                op = OrdenesBread.ObtenerPropiedadOrdenByName(ordenAC.PK, "CMB_WO_2");
                if (op != null)
                    relacionado2 = op.Value.ToString();
            }

            if (string.IsNullOrEmpty(relacionado2))
                return relacionado1;
            else
                return relacionado1 + ";" + relacionado2;
        }

        internal static bool editarDatosGenerales(DateTime? fInicio, DateTime? fFin, string idOrden)
        {
            return OrdenesBread.editarDatosGeneralesOrden(fInicio, fFin, idOrden);
        }

        internal static List<Orden> GetParticionesOrden(string idOrden)
        {
            List<Orden> lstOrdenes = new List<Orden>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerParticionesOrden]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@ordenId", idOrden);
                    using (SqlDataAdapter da = new SqlDataAdapter())
                    {
                        connection.Open();
                        da.SelectCommand = command;
                        DataSet ds = new DataSet();
                        da.Fill(ds);

                        if (ds != null && ds.Tables.Count > 0)
                        {
                            foreach (DataRow row in ds.Tables[0].Rows)
                            {
                                Orden ord = new Orden();
                                ord.id = (string)row["Id"];
                                ord.idOrdenPadre = (string)row["IdOrdenPadre"];
                                ord.idSuborden = (int)row["IdSuborden"];
                                ord.dFecInicio = row["FecIniReal"] != System.DBNull.Value ? Convert.ToDateTime(row["FecIniReal"]) : DateTime.MinValue;
                                ord.dFecFin = row["FecFinReal"] != System.DBNull.Value ? Convert.ToDateTime(row["FecFinReal"]) : DateTime.MinValue;
                                lstOrdenes.Add(ord);
                            }
                        }
                    }
                }
            }
            return lstOrdenes.OrderBy(o => o.idSuborden).ToList();
        }

        internal static void ActualizarPropiedadesOrden(Orden ord)
        {
            EditarPropiedadOrden("PALETS_PRODUCIDOS", ord.id, ord.produccion.paletsProducidos.ToString());
            EditarPropiedadOrden("CAJAS_PRODUCIDAS", ord.id, ord.produccion.cajas.ToString());
            EditarPropiedadOrden("ENVASES_PRODUCIDOS", ord.id, ord.produccion.envases.ToString());
            EditarPropiedadOrden("RECHAZOS_CLASIFICADOR", ord.id, ord.rechazosClasificadorAutomatico.ToString());
            EditarPropiedadOrden("RECHAZOS_MAN_CLASIFICADOR", ord.id, ord.rechazosClasificadorManual.ToString());
            EditarPropiedadOrden("RECHAZOS_VACIOS", ord.id, ord.rechazosVaciosAutomatico.ToString());
            EditarPropiedadOrden("RECHAZOS_MAN_VACIOS", ord.id, ord.rechazosVaciosManual.ToString());
            EditarPropiedadOrden("RECHAZOS_LLENADORA", ord.id, ord.rechazosLlenadoraAutomatico.ToString());
            EditarPropiedadOrden("RECHAZOS_MAN_LLENADORA", ord.id, ord.rechazosLlenadoraManual.ToString());
            EditarPropiedadOrden("RECHAZOS_PRODUCTO_TERMINADO", ord.id, ord.rechazosProductoTerminadoAutomatico.ToString());
            EditarPropiedadOrden("RECHAZOS_MAN_PRODUCTO_TERMINADO", ord.id, ord.rechazosProductoTerminadoManual.ToString());
            EditarPropiedadOrden("PICOS", ord.id, ord.produccion.cantidadPicosCajas.ToString());
            EditarPropiedadOrden("OEE", ord.id, ord.produccion.oee.ToString(new NumberFormatInfo() { NumberDecimalSeparator = "." }));
            EditarPropiedadOrden("CALIDAD", ord.id, (ord.calidad / 1000).ToString(new NumberFormatInfo() { NumberDecimalSeparator = "." }));
            EditarPropiedadOrden("RENDIMIENTO", ord.id, ord.produccion.rendimiento.ToString(new NumberFormatInfo() { NumberDecimalSeparator = "." }));

            Order ordenBread = OrdenesBread.ObtenerOrden(ord.id);
            ordenBread.ProducedQuantity = ord.produccion.paletsEtiquetadoraProducidos;
            OrdenesBread.EditarOrden(ordenBread);
        }

        internal static void EditarPropiedadOrden(string NombreProp, string idOrden, string valor)
        {
            using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ActualizaPropiedadOrden]", conexion))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@orden", idOrden);
                    command.Parameters.AddWithValue("@nombreProp", NombreProp);
                    command.Parameters.AddWithValue("@valor", valor);
                    conexion.Open();

                    command.ExecuteNonQuery();
                }
            }
        }

        internal static void GuardarFechasAntiguas(string idParticion)
        {
            List<DatosContingeciaOrden> lstDatosAntiguos = DAO_Produccion.ObtenerDatosGeneralesAntiguos(idParticion);

            if (lstDatosAntiguos.Count == 2)
            {
                DatosContingeciaOrden datosRespaldo = lstDatosAntiguos.Last();
                if (datosRespaldo.fecFin.Equals(DateTime.MinValue) && datosRespaldo.fecInicio.Equals(DateTime.MinValue))
                {
                    EditarPropiedadOrden("FECHA_INICIO_REAL", idParticion, lstDatosAntiguos.First().fecInicio.ToString());
                    EditarPropiedadOrden("FECHA_FIN_REAL", idParticion, lstDatosAntiguos.First().fecFin.ToString());
                }
            }
        }

        internal static int GetCodigoEstadoOrden(string nombreEstado)
        {
            using (MESEntities context = new MESEntities())
            {
                EstadosOrden estado = context.EstadosOrden.AsNoTracking().Where(e => e.Estado.Equals(nombreEstado)).FirstOrDefault();
                return estado.Id;
            }
        }

        internal static void CrearHistoricoOrden(string codigo, DateTime fechaInicioPlanificado, DateTime fechaFinPlanificado)
        {
            COB_MSM_HISTORICO_ORDENES cobHistoricoPlanif = GetHistoricoOrden(codigo, GetCodigoEstadoOrden("Planificada"));
            if (cobHistoricoPlanif != null)
            {
                List<string> lstEstados = new List<string>(new string[] { "Iniciando", "Producción", "Finalizada" });
                DateTime fechaCambio = cobHistoricoPlanif.FECHA_CAMBIO;
                foreach (string estado in lstEstados)
                {
                    fechaCambio = fechaCambio.AddSeconds(1);
                    COB_MSM_HISTORICO_ORDENES cobH = new COB_MSM_HISTORICO_ORDENES();
                    cobH.ORDER_ID = codigo;
                    cobH.FECHA_CAMBIO = lstEstados.IndexOf(estado).Equals(lstEstados.Count() - 1) ? (fechaFinPlanificado > fechaCambio ? fechaFinPlanificado : fechaCambio) : fechaCambio;
                    cobH.ESTADO = GetCodigoEstadoOrden(estado);
                    DAO_Contingencias.CrearHistoricoOffset(cobH);
                }
            }
        }

        private static COB_MSM_HISTORICO_ORDENES GetHistoricoOrden(string codigo, int estado)
        {
            return OrdenesBread.GetHistoricoOrden(codigo, estado);
        }

        internal static string obtenerOrdenAnterior(dynamic datos)
        {
            string idOrden = datos.orden.ToString();
            string idLinea = datos.linea.ToString();
            return OrdenesBread.obtenerOrdenAnterior(idOrden, idLinea);
        }

        internal static string obtenerOrdenPosterior(dynamic datos)
        {
            string idOrden = datos.orden.ToString();
            string idLinea = datos.linea.ToString();
            return OrdenesBread.obtenerOrdenPosterior(idOrden, idLinea);
        }

        /// <summary>
        /// Actualiza los datos de una orden
        /// </summary>
        /// <param name="idParticion">id particion</param>
        /// <param name="Idlinea">Id linea</param>
        public static void actualizarDatosOrden(string idParticion, string Idlinea)
        {
            DAO_Produccion daoProduccion = new DAO_Produccion();
            Linea linea = PlantaRT.planta.lineas.Where(l => l.id == Idlinea).FirstOrDefault();
            var ordenActiva = linea.ordenesActivas.Where(oA => oA.id == idParticion);

            if (ordenActiva.Count() > 0)
            {
                daoProduccion.obtenerDatosProduccionParticion(ordenActiva.FirstOrDefault(), DateTime.UtcNow, new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day).AddHours(DateTime.UtcNow.Hour));
            }
            else
            {
                var ordenPendiente = linea.ordenesPendientes.Where(oA => oA.id == idParticion);
                if (ordenPendiente.Count() > 0)
                {
                    daoProduccion.obtenerDatosProduccionParticion(ordenPendiente.FirstOrDefault(), DateTime.UtcNow, new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day).AddHours(DateTime.UtcNow.Hour));
                }
                else //Está cerrada
                {
                    string ordID = idParticion.Split('.')[0];
                    Orden ord = daoProduccion.obtenerDatosProduccionOrden(ordID);
                    ActualizarPropiedadesOrden(ord);
                }
            }
        }

        public static double GetVelocidadNominal(Orden orden)
        {
            double velocidadNominal = 0;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerVelocidadNominalOrden]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idProducto", orden.producto.codigo);
                    command.Parameters.AddWithValue("@numLinea", orden._refLinea.numLinea);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.VarChar);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    command.CommandTimeout = 20;
                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        velocidadNominal = returnParam.Value == DBNull.Value ? 0 : Convert.ToDouble(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        if (PlantaRT.activarLogCambioEstadoOrdenes)
                        {
                            DAO_Log.EscribeLog("CAMB_EST_ORD-Función MES_ObtenerVelocidadNominalOrden", "Error: " + ex.Message, "Error");
                        }

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.GetVelocidadNominal", "WEB-WO", "Sistema");
                    }
                }
            }
            return velocidadNominal;
        }

        public async Task<DTO_EnvasesCajasPaletProducto> GetConversionesProducto(string producto)
        {
            return await _api.GetPostsAsync<DTO_EnvasesCajasPaletProducto>(string.Concat(_urlProductos, "EnvasesCajasPalet?producto=", producto));
        }

        public async Task<double> GetHectolitrosProducto(string producto)
        {
            return await _api.GetPostsAsync<double>(string.Concat(_urlProductos, "Hectolitros?producto=", producto));
        }

        public static double GetOEEObjetivoOrden(Orden orden)
        {
            double oeeObjetivo = 0;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerOEEObjetivoOrden]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idProducto", orden.producto.codigo);
                    command.Parameters.AddWithValue("@numLinea", orden._refLinea.numLinea);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.VarChar);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    command.CommandTimeout = 20;
                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        oeeObjetivo = returnParam.Value == DBNull.Value ? 0 : Convert.ToDouble(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        if (PlantaRT.activarLogCambioEstadoOrdenes)
                        {
                            DAO_Log.EscribeLog("CAMB_EST_ORD-Función MES_ObtenerOEEObjetivoOrden", "Error: " + ex.Message, "Error");
                        }

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.GetOEEObjetivoOrden", "WEB-WO", "Sistema");
                    }
                }
            }

            return oeeObjetivo;
        }

        public static double GetOEECriticoOrden(Orden orden)
        {
            double oeeCritico = 0;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerOEECriticoOrden]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idProducto", orden.producto.codigo);
                    command.Parameters.AddWithValue("@numLinea", orden._refLinea.numLinea);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.VarChar);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    command.CommandTimeout = 20;
                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        oeeCritico = returnParam.Value == DBNull.Value ? 0 : Convert.ToDouble(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        if (PlantaRT.activarLogCambioEstadoOrdenes)
                        {
                            DAO_Log.EscribeLog("CAMB_EST_ORD-Función MES_ObtenerOEECriticoOrden", "Error: " + ex.Message, "Error");
                        }

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.GetOEECriticoOrden", "WEB-WO", "Sistema");
                    }
                }
            }

            return oeeCritico;
        }

        public static DateTime? ObtenerFechaArranqueLlenadora(string idParticion, bool logTriggers)
        {
            DateTime? fechaArranque = null;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetFechaArranqueLlenadora]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@id_wo", idParticion);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.VarChar);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    command.CommandTimeout = 20;
                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        fechaArranque = returnParam.Value == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        if (logTriggers)
                        {
                            DAO_Log.EscribeLog("PROD_CAMB_TUR_PAU_FIN-Fecha arranque de llenadora", "Error: " + ex.Message, "Error");
                        }

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerFechaArranqueLlenadora", "WEB-WO", "Sistema");
                    }
                }
            }

            return fechaArranque;
        }

        internal static bool ValidarZonaConOrden(string idZona)
        {
            return ZonasBread.CheckZonaConOrden(idZona);
        }

        public string GetOrderNotes(string orderID)
        {
            Order_BREAD obread = BreadFactory.Create<Order_BREAD>();
            try
            {
                Order order = obread.Select("", 0, 0, "{ID} = '" + orderID + "'").FirstOrDefault();
                return order.Description;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<DateTime?> CalcularFechaFinOrden(string idLinea, string idProducto, int cantidad, DateTime fechaInicio)
        {
            try
            {
                // Obtenemos las relaciones de cantidad PaletEnvases
                var relaciones = await GetConversionesProducto(idProducto);

                if (relaciones == null)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CALCULANDO_FIN_WO__NO_REL").Replace("#LINEA", idLinea).Replace("#PRODUCTO", idProducto.ToString()), "DAO_Orden.CalcularFechaFinOrden", "WEB-ENVASADO", "Sistema");
                    return null;
                }

                Model.ParametrosLinea paramLinea = null;

                using (MESEntities context = new MESEntities())
                {
                    //Obtenemos la duración total de la orden
                    paramLinea = context.ParametrosLinea.AsNoTracking().Where(e => e.idLinea == idLinea && e.Producto == idProducto).FirstOrDefault();
                }

                if (paramLinea != null)
                {
                    decimal duracionOrdenMin = 0;
                    int cantidadEnvases = cantidad * relaciones.EnvasesPorPalet;
                    duracionOrdenMin = Math.Ceiling((decimal)(cantidadEnvases / (paramLinea.VelocidadNominal * paramLinea.OEEPreactor / 100)) * 60);

                    DateTime fin = fechaInicio;
                    DAO_Turnos daoTurnos = new DAO_Turnos();
                    //Para calcular la fecha de fin hay que tener en cuenta los turnos planificados en los que se pueda ejecutar
                    while (duracionOrdenMin > 0)
                    {
                        var turnoFecha = DAO_Turnos.ObtenerTurnoSHCPorFecha(idLinea, fin);

                        if (turnoFecha == null)
                        {
                            // Si no existe turno en la hora que toca, buscamos el siguiente planificado.
                            // Tenemos que añadir a la duración de la orden el hueco entre los turnos                            
                            turnoFecha = daoTurnos.ObtenerTurnoSiguiente(idLinea, fin);
                            if (turnoFecha != null)
                            {
                                fin = turnoFecha.inicioLocal;
                            }
                            else
                            {
                                // En caso de que no existan turnos planificados posteriores, sumamos la duración directamente
                                fin = fin.AddMinutes((double)duracionOrdenMin);
                                duracionOrdenMin = 0;
                            }
                        }

                        if (duracionOrdenMin > 0)
                        {
                            var tiempoDelTurno = Math.Min((decimal)(turnoFecha.finLocal - fin).TotalMinutes, duracionOrdenMin);
                            duracionOrdenMin -= tiempoDelTurno;
                            fin = fin.AddMinutes((double)tiempoDelTurno);
                        }
                    }

                    return fin;
                }

                // No se ha encontrado el parametroLinea
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CALCULANDO_FIN_WO__NO_PARAM").Replace("#LINEA", idLinea).Replace("#PRODUCTO", idProducto.ToString()), "DAO_Orden.CalcularFechaFinOrden", "WEB-ENVASADO", "Sistema");
                return null;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CALCULANDO_FIN_WO") + ": " + ex.Message + " -> " + ex.StackTrace, "DAO_Orden.CalcularFechaFinOrden", "WEB-ENVASADO", "Sistema");

                return null;
            }
        }

        public Dictionary<int, string> CrearWOsPlanificador(List<DTO_PlanificadorExportarWO> wos, out string errorMsg, out string errorPPR, out bool administratorError, string userName = "system")
        {
            if (HttpContext.Current != null)
            {
                userName = HttpContext.Current.User.Identity.Name;
            }

            errorMsg = "";
            errorPPR = "";
            administratorError = false;
            var result = new Dictionary<int, string>();

            DAO_Linea daoLinea = new DAO_Linea();
            DAO_Orden ord = new DAO_Orden();
            CrearWOManual regla = null;

            try
            {                

                foreach (var wo in wos)
                {
                    string codigoBase = ConfigurationManager.AppSettings["PrefWoPlanificador"] + wo.FechaInicioPlanificada.ToLocalTime().ToString("yy") + "-";
                    int codigoWO = Convert.ToInt32(ord.obtenerCodigoNuevaWO(codigoBase));

                    var ppr_id = daoLinea.obtenerPPR(wo.IdLinea, wo.IdProducto);
                    string ppr = "";
                    if (ppr_id.Length > 0)
                    {
                        ppr = ppr_id[0];
                    }

                    double fechaInicio = Math.Round((wo.FechaInicioPlanificada - new DateTime(1970, 1, 1)).TotalSeconds, 3);
                    double fechaFin = Math.Round((wo.FechaFinPlanificada - new DateTime(1970, 1, 1)).TotalSeconds, 3);
                    double fechaEntrega = Math.Round((wo.FechaEntrega - new DateTime(1970, 1, 1)).TotalSeconds, 3);

                    string codigoIteracion = Convert.ToInt32(codigoWO).ToString("D5");

                    string codigo = codigoBase + codigoIteracion;
                    codigoWO++;

                    PMConnectorBase.Connect();
                    string errDesc = "";  

                    regla = new CrearWOManual(PMConnectorBase.PmConexion);
                    CallResult res = regla.Call(codigo, ppr, wo.Cantidad, wo.UOM, fechaInicio, fechaFin, codigo, "0", "1", wo.Estado, fechaEntrega, 0.0, null, wo.CodigoOriginal, wo.Descripcion, ref errDesc);

                    if (res == CallResult.CR_Ok)
                    {
                        result.Add(wo.IdWOSecuenciadasMES, codigo);
                        CallResult resHija = regla.Call(codigo, ppr, wo.Cantidad, wo.UOM, fechaInicio, fechaFin, codigo + ".1", "1", "", wo.Estado, fechaEntrega, 0.0, null, wo.CodigoOriginal, wo.Descripcion, ref errDesc);
                        
                        if (resHija == CallResult.CR_Ok)
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Orden.CrearWOsPlanificador", "Orden creada (planificador) - "+
                                "Linea: " + wo.IdLinea +
                                "; WO: " + codigo +
                                ", Producto: " + wo.IdProducto +
                                ", Cantidad: " + wo.Cantidad +
                                ", Uom.: " + wo.UOM +
                                ", Fecha Inicio Est.: " + wo.FechaInicioPlanificada.ToString("dd/MM/yyyy HH:mm:ss") +
                                ", Fecha Fin Est.: " + wo.FechaFinPlanificada.ToString("dd/MM/yyyy HH:mm:ss") +     
                                "; Notas: " + wo.Descripcion
                            , userName);
                        }
                    }
                    else
                    {
                        if (res == CallResult.CR_Timedout)
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Orden.CrearWOsPlanificador", "The call timed out", userName);
                            administratorError = true;
                            errorMsg += IdiomaController.GetResourceName("ERROR_CREANDO_WO") +
                                string.Concat("(id: ", wo.CodigoOriginal, "Linea: ",  wo.IdLinea, ", idProducto: ", wo.IdProducto, ", cantidad: ", wo.Cantidad
                                , ", fechaIni: ", wo.FechaInicioPlanificada.ToString(), ", fechaFin: ", wo.FechaFinPlanificada.ToString(), ": Timeout en regla de Simatic.&lt;br&gt;");
                        }
                        else
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Orden.CrearWOsPlanificador", errDesc, userName);

                            // Detectamos los errores que sean porque no existe el PPR
                            //if (errDesc.IndexOf("PPR status") != -1)
                            //{
                                if (string.IsNullOrEmpty(errorPPR))
                                {
                                    errorPPR = string.Concat(IdiomaController.GetResourceName("LA_COMBINACION"), IdiomaController.GetResourceName("LINEA_PRODUCTO"));
                                }
                                else
                                {
                                    errorPPR = string.Concat(IdiomaController.GetResourceName("LAS_COMBINACIONES"), errorPPR.Substring(errorPPR.IndexOf("line")), IdiomaController.GetResourceName("LINEA_PRODUCTO"));
                                }

                                errorPPR = errorPPR.Replace("#LINE", wo.IdLinea).Replace("#PRODUCT", wo.IdProducto);
                            //}

                            errorMsg += IdiomaController.GetResourceName("ERROR_CREANDO_WO") +
                                string.Concat("(id: ", wo.CodigoOriginal, "Linea: ", wo.IdLinea, ", idProducto: ", wo.IdProducto, ", cantidad: ", wo.Cantidad
                                , ", fechaIni: ", wo.FechaInicioPlanificada.ToString(), ", fechaFin: ", wo.FechaFinPlanificada.ToString(), ": ",errDesc,".&lt;br&gt;");
                        }
                    }
                }

                if (!string.IsNullOrEmpty(errorPPR))
                {
                    if(errorPPR.CountSequence("line") == 1)
                    {
                        errorPPR = string.Concat(errorPPR, IdiomaController.GetResourceName("NO_EXISTE_MES"));
                    }
                    else
                    {
                        errorPPR = string.Concat(errorPPR, IdiomaController.GetResourceName("NO_EXISTEN_MES"));
                    }                    
                }
            }
            catch(Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.CrearWOsPlanificador", "WEB-ENVASADO", userName);
                throw new Exception(IdiomaController.GetResourceName("ERROR_CREANDO_WO") + ": "+ex.Message);
            }
            finally
            {
                regla.Dispose();
            }

            return result;
        }

        public void EditarOrdenPlanificada(Orden orden, out string errorMessage, bool ejecutarJobJDE = true, string userName = "system")
        {
            if (HttpContext.Current != null)
            {
                userName = HttpContext.Current.User.Identity.Name;
            }

            errorMessage = IdiomaController.GetResourceName("ERROR_EDITAR_ORDEN");
            try
            {
                // sólo editamos las ordenes creadas o planificadas
                var fullOrder = ObtenerOrden(orden.id); 
                if(fullOrder.estadoActual.Estado != Tipos.EstadosOrden.Creada && fullOrder.estadoActual.Estado != Tipos.EstadosOrden.Planificada)
                {
                    errorMessage = IdiomaController.GetResourceName("ORD_ENV_ACTIVA");
                    throw new Exception(errorMessage);
                }

                Order_BREAD obread = BreadFactory.Create<Order_BREAD>();
                Order order = obread.Select("", 0, 0, "{ID} = '" + orden.id + "'").FirstOrDefault();                
                order.Description = orden.descripcion;
                order.FinalMaterialQuantity = orden.cantPlanificada;
                order.EstimatedStartTime = orden.dFecInicioEstimado;
                order.EstimatedEndTime = orden.dFecFinEstimado;
                ReturnValue result = obread.Edit(order);

                if (!result.succeeded)
                {
                    throw new Exception(result.message);
                }

                // Editamos tambien la orden padre
                string orderPadre = orden.id.Substring(0, orden.id.IndexOf('.'));
                order = obread.Select("", 0, 0, "{ID} = '" + orderPadre + "'").FirstOrDefault();
                order.Description = orden.descripcion;
                order.FinalMaterialQuantity = orden.cantPlanificada;
                order.EstimatedStartTime = orden.dFecInicioEstimado;
                order.EstimatedEndTime = orden.dFecFinEstimado;
                result = obread.Edit(order);

                if (!result.succeeded)
                {
                    throw new Exception(result.message);
                }

                // Llamada a la regla de Simatic para actualizar la tabla de intercambio con JDE
                PMConnectorBase.Connect();
                using (GestionWOPlanificador reglaObj = new GestionWOPlanificador(PMConnectorBase.PmConexion))
                {
                    double fechaI = Math.Round((orden.dFecInicioEstimado - new DateTime(1970, 1, 1)).TotalSeconds, 3);
                    double fechaF = Math.Round((orden.dFecFinEstimado - new DateTime(1970, 1, 1)).TotalSeconds, 3);

                    string errDescription = "";
                    CallResult resRegla = reglaObj.Call(orderPadre, order.PPRName, orden.cantPlanificada, order.FinalMaterialUoMID, fechaI, fechaF, orden.id, "Edit", ref errDescription); 

                    if (resRegla != CallResult.CR_Ok)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "Error llamando a la regla de Simatic MSM.INTERFAZ-MANAGER.JDE-MES-PREACTOR.GESTION_WO_PLANIFICADOR ("+resRegla.ToString()+"). Err: " + errDescription, "DAO_Orden.EditarOrdenPlanificada", "I-MES-WO", userName);
                    }
                }

                // Llamada al job de JDE
                if (ejecutarJobJDE)
                {
                    EjecutarJobICreacionWOenJDE();
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Orden.EditarOrden", "Orden modificada ("+(ejecutarJobJDE ? "manual" : "planificador")+") - " + 
                     "Linea: " + orden.idLinea +
                    "; WO: " + orderPadre +
                    ", Producto: " + orden.producto.codigo +
                    ", Cantidad: " + orden.cantPlanificada +
                    ", Uom.: " + orden.producto.udMedida +
                    ", Fecha Inicio Est.: " + orden.dFecInicioEstimado.ToString("dd/MM/yyyy HH:mm:ss") +
                    ", Fecha Fin Est.: " + orden.dFecFinEstimado.ToString("dd/MM/yyyy HH:mm:ss") +
                    "; Notas: " + orden.descripcion
                    , userName);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static void SetOrderNotes(string idOrden, string notas)
        {
            try
            {
                Order_BREAD obread = BreadFactory.Create<Order_BREAD>();
                Order order = obread.Select("", 0, 0, "{ID} = '" + idOrden + "'").FirstOrDefault();
                order.Description = notas;
                ReturnValue result = obread.Edit(order);

                if (!result.succeeded)
                {
                    throw new Exception(result.message);
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Orden.SetOrderNotes", "Nota de Orden modificada - WO: " + idOrden + " Nota: " + notas, HttpContext.Current.User.Identity.Name);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<Orden> ObtenerOrdenesLineaTurno(string idLinea, DateTime fechaInicio, DateTime fechaFin)
        {
            List<Orden> ordenes = new List<Orden>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerParticionesLineaTurno]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@linea", idLinea);
            comando.Parameters.AddWithValue("@fechaInicio", fechaInicio);
            comando.Parameters.AddWithValue("@fechaFin", fechaFin);

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Orden orden = new Orden();
                    orden.id = dr["Id"].ToString();
                    orden.producto = new Producto(dr["IdProducto"].ToString(),
                        string.Join(" ", dr["Producto"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)));

                    ordenes.Add(orden);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerParticionesLineaTurno", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return ordenes;
        }

        public List<Orden> ObtenerOrdenesTurno(int idTurno)
        {
            List<Orden> ordenes = new List<Orden>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerParticionesTurno]", conexion);
            comando.CommandTimeout = 60;
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@idTurno", idTurno);

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Orden orden = new Orden();
                    orden.id = dr["Id"].ToString();
                    orden.producto = new Producto(dr["IdProducto"].ToString(),
                        string.Join(" ", dr["Producto"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)));

                    ordenes.Add(orden);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerParticionesLineaFechas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return ordenes;
        }

        private bool VerificarFechaNoDisponible(string FechaFinEstimada)
        {
            return FechaFinEstimada.Equals(IdiomaController.GetResourceName("NO_DISPONIBLE"))
                || FechaFinEstimada.Equals(IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE"))
                || FechaFinEstimada.Equals(IdiomaController.GetResourceName("SIN_ORDEN_ACTIVA"))
                || FechaFinEstimada.Equals(IdiomaController.GetResourceName("SIN_TURNO_ACTIVO"))
                || FechaFinEstimada.Equals(IdiomaController.GetResourceName("SIN_OEE_WO"))
                || FechaFinEstimada.Equals(IdiomaController.GetResourceName("SIN_OEE_PREACTOR"));
        }

        public List<Orden> ObtenerWOActivas()
        {
            List<Orden> ordenes = new List<Orden>();

            try
            { 
            //Obtenemos las ordenes que estan activas en cada linea
            foreach (Linea lin in PlantaRT.planta.lineas)
            {
                foreach (Orden ord in lin.ordenesActivas) //Son las de estado Iniciando o Producción
                {
                    //if (zon.ordenActual != null && zon.ordenActual.idSuborden != "0" && zon.ordenActual.idSuborden != null && !ordenes.Contains(zon.ordenActual) && zon.ordenActual.estadoActual.id != Tipos.EstadosOrden.Creada.GetValue() && zon.ordenActual.estadoActual.id != Tipos.EstadosOrden.Planificada.GetValue()) ordenes.Add(zon.ordenActual);
                    if (ord != null && !ordenes.Contains(ord))
                    {
                        //if (ord.estadoActual.nombre.Equals(Tipos.EstadosOrden.Finalizada) && ord.dFecFin == DateTime.MinValue)
                        //{
                        //    DAO_Produccion daoProduccion = new DAO_Produccion();
                        //    daoProduccion.obtenerDatosGeneralesParticion(ord);
                        //}
                        //else
                        //{
                        ord.fecFinEstimadoCalculadoTurno = Utils.getDateTurno(PlantaRT.planta.turnoActual.Find(x => x.linea.numLinea == lin.numLinea), ord);

                        if (!VerificarFechaNoDisponible(ord.fecFinEstimadoCalculadoTurno))
                        {
                            TimeSpan diff = Convert.ToDateTime(ord.fecFinEstimadoCalculadoTurno) - DateTime.Now;
                            string zeroHours, zeroMinutes, zeroSeconds = "";
                            zeroHours = Convert.ToInt32(diff.Hours) < 10 ? "0" : "";
                            zeroMinutes = Convert.ToInt32(diff.Minutes) < 10 ? "0" : "";
                            zeroSeconds = Convert.ToInt32(diff.Seconds) < 10 ? "0" : "";
                            ord.duracionCalculadaTurno = zeroHours + Convert.ToInt32(diff.Hours) + ":" + zeroMinutes + Convert.ToInt32(diff.Minutes) + ":" + zeroSeconds + Convert.ToInt32(diff.Seconds);
                        }
                        else
                        {
                            ord.duracionCalculadaTurno = "00:00:00";
                        }
                        //}

                        ord.produccion.paletsEtiquetadoraProducidos = ObtenerPaletsEtiquetadoraWO(ord.id);
                        ordenes.Add(ord);
                    }
                }
            }

            //Obtenemos las ordenes pendiente de cada linea
            foreach (Linea lin in PlantaRT.planta.lineas)
            {
                List<Tipos.EstadosOrden> lstFiltroEstados = new List<Tipos.EstadosOrden>();
                lstFiltroEstados.Add(Tipos.EstadosOrden.Creada);
                lstFiltroEstados.Add(Tipos.EstadosOrden.Planificada);
                foreach (Orden ord in lin.ordenesPendientes.Where(o => !lstFiltroEstados.Contains(o.estadoActual.Estado)))
                {
                    if (!ordenes.Contains(ord))
                    {
                        ord.produccion.paletsEtiquetadoraProducidos = ObtenerPaletsEtiquetadoraWO(ord.id);
                        ordenes.Add(ord);
                    }
                }
            }

            List<Orden> lstOrdenesCerradas = ordenes.Where(o => o.estadoActual.Estado.Equals(Tipos.EstadosOrden.Cerrada)).ToList();
            foreach (Orden orden in lstOrdenesCerradas)
            {
                CambiosEstadosOrdenes c = new CambiosEstadosOrdenes();
                c.setActivaPendiente(orden, true);
            }

            List<Task> limsTasks = new List<Task>();
                foreach (Orden orden in ordenes)
                {
                    // La lógica de asignación de FechaFinEstimadaReal se mantiene tal cual
                    if (orden.estadoActual.Estado == Tipos.EstadosOrden.Iniciando || orden.estadoActual.Estado == Tipos.EstadosOrden.Producción)
                    {
                        orden.FechaFinEstimadaReal = VerificarFechaNoDisponible(orden.fecFinEstimadoCalculadoTurno) ? DateTime.MinValue : Convert.ToDateTime(orden.fecFinEstimadoCalculadoTurno);
                    }
                    else
                    {
                        orden.FechaFinEstimadaReal = orden.dFecFinLocal;
                    }

                    //Obtenemos estado LIMS de la orden
                    limsTasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                        // Dentro de esta lambda, podemos usar await porque la llamada es 'async'
                        DTO_ClaveValor lims = (await _daoLims.obtenerEstadoLIMSdeWOEnvasado(orden.idOrdenPadre)).Data;
                            if (lims != null)
                            {
                                orden.EstadoLIMS = lims.Id;
                                orden.ColorLIMS = lims.Valor;
                            }
                        }
                        catch (Exception ex)
                        {
                        // Manejo de la excepción para evitar que el Task.WhenAll falle
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Error en tarea LIMS: " + ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtnerEStadoLIMSwoeNVASADO", "WEB-ENVASADO", "Sistema");
                        }
                    }));
                }
                Task.WhenAll(limsTasks).Wait();

                return ordenes.Where(o => !o.estadoActual.Estado.Equals(Tipos.EstadosOrden.Cerrada)).ToList();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerWOActivas", "WEB-ENVASADO", "Sistema");

                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ORDENES"));
            }
            finally
            {
            }
        }


        public static void trazaRealTime(string linea, string woId, string operacion)
        {            
            try
            {
                Linea lin = PlantaRT.planta.lineas.Where(l => l.id == linea).First();

                //obtener zonas de BD
                string trazaZonas = "ESTADO LINEA: " + linea + ", OPERACION: " + operacion + ", WO: " + woId;
                List<Zona> zonas = new List<Zona>();
                
                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_ObtenerZonasLineaV2]", conexion))
                    {
                        comando.Parameters.AddWithValue("@linea", lin.numLinea);
                        comando.CommandType = CommandType.StoredProcedure;
                        conexion.Open();
                        SqlDataReader dr = comando.ExecuteReader();
                        bool hayFallo = false;
                        while (dr.Read())
                        {
                            string idOrden = dr["Orden"].ToString();
                            string idZona = dr["Id"].ToString();
                            int numZona = DataHelper.GetInt(dr, "NumeroZona");
                            string nombreZona = dr["Nombre"].ToString();

                            lin.zonas.ForEach(z =>
                            {
                                if (idZona == z.id)
                                {
                                    string idOrdenRT = z.ordenActual != null ? z.ordenActual.id : "";
                                    trazaZonas += "Zona: " + nombreZona + " woBD: " + idOrden + "woRT: " + idOrdenRT + "; ";

                                    if (idOrden != idOrdenRT)
                                        hayFallo = true;
                                }
                            });
                        }

                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, trazaZonas, "trazaRealTime", "I-MES-WO", "system");

                        if (hayFallo)
                        {
                            string ordenesActivasLineas = "FALLO en REALTIME. " + " LINEA: " + linea + ", OPERACION: " + operacion + ", WO: " + woId + ". WO ACTIVAS PLANTA: ";
                            PlantaRT.planta.lineas.ForEach(l =>
                            {
                                l.ordenesActivas.ForEach(wo => {
                                    ordenesActivasLineas += wo.id + "; ";
                                });
                            });
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ordenesActivasLineas, "trazaRealTime", "I-MES-WO", "system");
                        }
                    }
                }                        
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "trazaRealTime: " + ex.Message, "trazaRealTime", "I-MES-WO", "system");
            }
        }

        /// <summary>
        /// Para asignar el porcentaje de producción de las llenadoras en las líneas de doble salida (Alovera y Solán)
        /// </summary>
        /// <param name="idLinea">Nombre de la línea</param>
        /// <param name="accion">Si es asignar, desasignar o cambio de estado supervisor</param>
        public static async Task AsignarProduccionLineasDobleSalida(string idLinea, string accion)
        {
            Linea lin = PlantaRT.planta.lineas.Where(l => l.id == idLinea).First();
            if (!string.IsNullOrEmpty(lin.Grupo))
            {
                using (MESEntities contexto = new MESEntities())
                {
                    var configuracion = contexto.LineasDobleSalidaConfiguracion.AsNoTracking().Where(c => c.Descripcion.Contains(lin.Grupo)).FirstOrDefault();
                    if (configuracion != null)
                    {
                        // De cada zona llenadora o paletera de las líneas vemos si tienen o no WO
                        var idOrdenPrimeraLlenadora = contexto.Zonas.AsNoTracking().Where(z => z.ID_ZONA == configuracion.ZonaLlenadoraPrimeraLinea).Select(z => z.ORDER_ID).First();
                        var idOrdenSegundaLlenadora = contexto.Zonas.AsNoTracking().Where(z => z.ID_ZONA == configuracion.ZonaLlenadoraSegundaLinea).Select(z => z.ORDER_ID).First();
                        var idOrdenPrimeraPaletera = contexto.Zonas.AsNoTracking().Where(z => z.ID_ZONA == configuracion.ZonaPaleteraPrimeralinea).Select(z => z.ORDER_ID).First();
                        var idOrdenSegundaPaletera = contexto.Zonas.AsNoTracking().Where(z => z.ID_ZONA == configuracion.ZonaPaleteraSegundaLinea).Select(z => z.ORDER_ID).First();

                        var valorPrimeraLlenadora = idOrdenPrimeraLlenadora == string.Empty ? "0" : "1";
                        var valorSegundaLlenadora = idOrdenSegundaLlenadora == string.Empty ? "0" : "1";
                        var valorPrimeraPaletera = idOrdenPrimeraPaletera == string.Empty ? "0" : "1";
                        var valorSegundaPaletera = idOrdenSegundaPaletera == string.Empty ? "0" : "1";

                        // La información obtenida la unificamos en binario y la transformamos a decimal para obtener el caso en el que nos encontramos
                        var casoBinario = Convert.ToInt64(valorPrimeraLlenadora + valorSegundaLlenadora + valorPrimeraPaletera + valorSegundaPaletera);
                        var caso = Utils.BinarioADecimal(casoBinario);

                        var asignacion = contexto.LineasDobleSalidaAsignacion.AsNoTracking().Where(x => x.Caso == caso).FirstOrDefault();
                        if (asignacion != null)
                        {
                            // Creamos el objeto de la RTDS y escribimos los valores
                            RTDSValuesDto tagValues = new RTDSValuesDto()
                            {
                                Tags = new List<string>(),
                                TagsValues = new List<object>(),
                                Unit = "RTDS"
                            };

                            tagValues.Tags.Add(configuracion.VariableRTDSPrimeraLinea);
                            tagValues.Tags.Add(configuracion.VariableRTDSSegundaLinea);
                            tagValues.TagsValues.Add(Math.Round((double)asignacion.PorcentajePrimeraLinea / 100, 2));
                            tagValues.TagsValues.Add(Math.Round((double)asignacion.PorcentajeSegundaLinea / 100, 2));

                            DAO_Tags daoTags = new DAO_Tags();
                            var values = (List<object>)await daoTags.writeRTDS(tagValues);

                            for (int i = 0; i < values.Count(); i++)
                            {
                                if (!Convert.ToBoolean(values[i]))
                                {
                                    var mensaje = IdiomaController.GetResourceName("ERROR_RTDS") + "Variable: " + tagValues.Tags[i] + ", valor: " + tagValues.TagsValues[i];
                                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, mensaje, "DAO_Orden.AsignarProduccionLineasDobleSalida", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                                }
                            }

                            // Para actualizar el reparto de producción de las líneas dobles en la tabla tUbicacion de Trazabilidad
                            List<DTO_ClaveValor> listaDatos = new List<DTO_ClaveValor>();
                            string idPrimeraLinea = contexto.Lineas.Where(l => l.Grupo != null).ToList()[0].Id;
                            string idSegundaLinea = contexto.Lineas.Where(l => l.Grupo != null).ToList()[1].Id;
                            listaDatos.Add(new DTO_ClaveValor { Id = asignacion.PorcentajePrimeraLinea, Valor = idPrimeraLinea });
                            listaDatos.Add(new DTO_ClaveValor { Id = asignacion.PorcentajeSegundaLinea, Valor = idSegundaLinea });
                            await _daoUbicacion.ActualizarRepartoProduccionLineasDobles(listaDatos);
                        }
                    }
                }
            }
        }

        public async Task<List<DTO_LoteMMPPOrden>> ObtenerLotesMateriaPrima(string idWO)
        {
            var result = await _api.GetPostsAsync<List<DTO_LoteMMPPOrden>>(string.Concat(_urlLotes, "LotesMateriaPrima?idWO=", idWO));

            return result;

            //string idLinea = datos.idLinea;
            //string idOrden = datos.idOrden;
            //string idProducto = datos.idProducto;
            //bool esHistorico = datos.esHistorico;

            //DateTime fecInicio = datos.fecInicio;
            //DateTime fechaFinEstimadaReal = datos.fechaFinEstimadaReal;
            //fecInicio = fecInicio.ToUniversalTime();
            //fechaFinEstimadaReal = fechaFinEstimadaReal.ToUniversalTime();

            //List<HistoricoOrden> historico = ObtenerHistoricoOrden(idOrden);
            //var registrosPausada = historico.Where(x => x.estado.nombre == Tipos.EstadosOrden.Pausada.ToString()).OrderBy(x => x.fechaCambio).ToList();
            //var registroIniciando = historico.Find(x => x.estado.nombre == Tipos.EstadosOrden.Iniciando.ToString());
            //DateTime fechaInicio = registroIniciando == null ? fecInicio : registroIniciando.fechaCambio;

            //var registroFinalizada = historico.Find(x => x.estado.nombre == Tipos.EstadosOrden.Finalizada.ToString());
            //var registroCerrada = historico.Find(x => x.estado.nombre == Tipos.EstadosOrden.Cerrada.ToString());

            //DTO_LoteMMPPOrdenDatosEntrada dto = new DTO_LoteMMPPOrdenDatosEntrada();
            //dto.IdLinea = idLinea;
            //dto.IdProducto = idProducto;

            //DateTime fechaFin;
            //List<Tuple<DateTime, DateTime>> listaFechas = new List<Tuple<DateTime, DateTime>>();

            //// Si no se ha pausado la orden
            //if (registrosPausada.Count == 0)
            //{
            //    if (esHistorico)
            //    {
            //        fechaFin = registroFinalizada == null ? registroCerrada.fechaCambio : registroFinalizada.fechaCambio;
            //    }
            //    else
            //    {
            //        fechaFin = fechaFinEstimadaReal;
            //    }
            //} 
            //else
            //{
            //    foreach (var registro in registrosPausada) 
            //    {
            //        fechaFin = registro.fechaCambio;
            //        listaFechas.Add(Tuple.Create(fechaInicio, fechaFin));
            //        fechaInicio = registro.fechaCierre;
            //    }

            //    if (esHistorico)
            //    {
            //        fechaFin = registroFinalizada == null ? registroCerrada.fechaCambio : registroFinalizada.fechaCambio;
            //    }
            //    else
            //    {
            //        fechaFin = fechaFinEstimadaReal;
            //    }
            //}

            //listaFechas.Add(Tuple.Create(fechaInicio, fechaFin));
            //dto.Fechas = listaFechas;
        }

        public async Task<List<DTO_RelacionEnvasesProductos>> ObtenerRelacionesEnvasesProductos()
        {
            var result = await _api.GetPostsAsync<List<DTO_RelacionEnvasesProductos>>(string.Concat(_urlProductos, "RelacionesEnvases"));

            return result;
        }

        public static void EjecutarJobICreacionWOenJDE()
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[SIT_EjecutarJobInterfazCreacionWoMesEnJde]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 60;

                        connection.Open();
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.EjecutarJobICreacionWOenJDE", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EJECUTANDO_JOB_SINCRONIZACION_JDE")+": "+ ex.Message+ ".&lt;br&gt;");
            }
        }

        public static int ObtenerPaletsEtiquetadoraWO(string idWO)
        {
            int palets = 0;

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerPaletsEtiquetadoraWO]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idWO", idWO);

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
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerPaletsEtiquetadoraWO", "WEB-WO", "Sistema");
                    }
                }
            }

            return palets;
        }

        public static double ObtenerRendimientoParticion(string idParticion)
        {
            double rendimiento = 0;

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetRendimientoParticion]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@IdParticion", idParticion);

                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Float);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);

                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        rendimiento = returnParam.Value == DBNull.Value ? 0 : Convert.ToDouble(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerRendimientoParticion", "WEB-WO", "Sistema");
                    }
                }
            }

            return rendimiento;
        }

        public static double ObtenerICParticion(string idParticion)
        {
            double IC = 0;

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetICParticion]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@id_wo", idParticion);

                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Float);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);

                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        IC = returnParam.Value == DBNull.Value ? 0 : Convert.ToDouble(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerICParticion", "WEB-WO", "Sistema");
                    }
                }
            }

            return IC;
        }

        public static double ObtenerOEEParticion(string idParticion)
        {
            double oee = 0;

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetOEEParticion]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@IdParticion", idParticion);

                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Float);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);

                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        oee = returnParam.Value == DBNull.Value ? 0 : Convert.ToDouble(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ObtenerOEEParticion", "WEB-WO", "Sistema");
                    }
                }
            }

            return oee;
        }

        public static bool ActualizarDatosWOCerradas(List<ProduccionDto> producciones)
        {
            try
            {
                DAO_Orden daoOrden = new DAO_Orden();
                Orden orden;
                DAO_Produccion daoProduccion = new DAO_Produccion();

                List<string> listaWO = producciones.Where(x => x.ParticionWO != null).Select(x => x.ParticionWO).Distinct().ToList();

                foreach (var idParticion in listaWO)
                {
                    orden = daoOrden.ObtenerOrden(idParticion);
                    if (orden.estadoActual.Estado == Tipos.EstadosOrden.Cerrada)
                    {
                        ActualizarDatosWO(idParticion);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Orden.ActualizarDatosWOCerradas", "WEB-WO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        public static void ActualizarDatosWO(string idParticion)
        {
            int paletsEtiquetadora = ObtenerPaletsEtiquetadoraWO(idParticion);
            double rendimiento = ObtenerRendimientoParticion(idParticion);
            double IC = 1;
            double OEE = ObtenerOEEParticion(idParticion);
            int picosCajas = DAO_Picos.ObtenerPicosCajasWO(idParticion);
            int picosPalets = DAO_Picos.ObtenerPicosPaletsWO(idParticion);

            //Para la vista Particiones
            Order ordenBread = OrdenesBread.ObtenerOrden(idParticion);
            ordenBread.ProducedQuantity = paletsEtiquetadora;
            OrdenesBread.EditarOrden(ordenBread);

            EditarPropiedadOrden("RENDIMIENTO", idParticion, rendimiento.ToString(new NumberFormatInfo() { NumberDecimalSeparator = "." }));
            EditarPropiedadOrden("CALIDAD", idParticion, IC.ToString(new NumberFormatInfo() { NumberDecimalSeparator = "." }));
            EditarPropiedadOrden("OEE", idParticion, OEE.ToString(new NumberFormatInfo() { NumberDecimalSeparator = "." }));
            EditarPropiedadOrden("PICOS", idParticion, picosCajas.ToString());
            EditarPropiedadOrden("PICOS_PALETS", idParticion, picosPalets.ToString());

            // Para las vista Ordenes
            string ordID = idParticion.Split('.')[0];
            DAO_Produccion daoProduccion = new DAO_Produccion();
            Orden orden = daoProduccion.obtenerDatosProduccionOrden(ordID);

            ordenBread = OrdenesBread.ObtenerOrden(orden.id);
            ordenBread.ProducedQuantity = paletsEtiquetadora;
            OrdenesBread.EditarOrden(ordenBread);

            EditarPropiedadOrden("RENDIMIENTO", orden.id, rendimiento.ToString(new NumberFormatInfo() { NumberDecimalSeparator = "." }));
            EditarPropiedadOrden("CALIDAD", orden.id, IC.ToString(new NumberFormatInfo() { NumberDecimalSeparator = "." }));
            EditarPropiedadOrden("OEE", orden.id, OEE.ToString(new NumberFormatInfo() { NumberDecimalSeparator = "." }));
            EditarPropiedadOrden("PICOS", orden.id, picosCajas.ToString());
            EditarPropiedadOrden("PICOS_PALETS", orden.id, picosPalets.ToString());
        }
    }
}
