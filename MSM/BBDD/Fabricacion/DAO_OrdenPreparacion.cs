using BreadMES.Fabricacion;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Fabricacion.Tipos;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;

namespace MSM.BBDD.Fabricacion
{
    public class DAO_OrdenPreparacion
    {
        public const string PREPARACION = "PREPARACION";

        private string UriBase = ConfigurationManager.AppSettings["HostApiSiemensBrewingData"].ToString();
        private string _urlLot;

        public DAO_OrdenPreparacion()
        {
            _urlLot = string.Concat(UriBase, "lot/");
        }

        public bool CrearOrdenPreparacion(long idPlantilla, string usuario)
        {
            try
            {
                dynamic orden = GetOrdenPreparacionByPlantilla(idPlantilla);
                List<dynamic> lstDetalle = PlantillaPreparacionBread.ObtenerDetallePlantillaPorIdPlantilla(idPlantilla);
                
                if (lstDetalle.Count() > 0)
                {
                    if (orden != null)
                    {
                        orden.Usuario = usuario;
                        bool result = OrdenPreparacionBread.CrearOrden(orden);

                        if (result)
                        {
                            TipoOrdenPreparacion tipoOrdenPrep = DAO_PlantillaPreparacion.GetTipoPlantillasPreparacion().Find(p => p.Nombre == PREPARACION);
                            if (orden.TipoOrden == tipoOrdenPrep.Id)
                            {
                                string locPath = ObtenerLocationPathUbicacion(orden.IdUbicacion);

                                if (!string.IsNullOrEmpty(locPath))
                                {
                                    var ordenPrepBread = new OrdenPreparacionBread();
                                    ordenPrepBread.CrearLote(_urlLot, orden.Id, locPath, orden.IdMaterial, tipoOrdenPrep.Nombre, orden.VolumenInicial, orden.Unidades);
                                }
                            }

                            foreach (dynamic materiaPrima in lstDetalle)
                            {
                                materiaPrima.Usuario = usuario;
                                materiaPrima.IdOrden = orden.Id;
                                OrdenPreparacionBread.AñadirMateriaPrimaOrden(materiaPrima);
                            }
                        }
                        return result;
                    }
                    else
                    {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_OrdenPreparacion.CrearOrdenPreparacion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_OrdenPreparacion.CrearOrdenPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        private static dynamic GetOrdenPreparacionByPlantilla(long idPlantilla)
        {
            try
            {
                dynamic orden = null;
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerOrdenPreparacionParaCreacion]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@IdPlantilla", idPlantilla);
                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            if (dt != null && dt.Rows.Count > 0)
                            {
                                orden = new ExpandoObject();
                                DataRow row = dt.Rows[0];
                                orden.Id = row["IdOrden"] == DBNull.Value ? string.Empty : (string)row["IdOrden"];
                                orden.TipoOrden = row["TipoOrden"] == DBNull.Value ? 0 : (int)row["TipoOrden"];
                                orden.Descripcion = row["Descripcion"] == DBNull.Value ? string.Empty : (string)row["Descripcion"];
                                orden.VolumenInicial = row["VolumenInicial"] == DBNull.Value ? 0 : (float)row["VolumenInicial"];
                                orden.VolumenReal = row["VolumenReal"] == DBNull.Value ? 0 : (float)row["VolumenReal"];
                                orden.NotasSupervisor = row["NotasSupervisor"] == DBNull.Value ? string.Empty : (string)row["NotasSupervisor"];
                                orden.NotasOficial = row["NotasOficial"] == DBNull.Value ? string.Empty : (string)row["NotasOficial"];
                                orden.IdUbicacion = row["IdUbicacion"] == DBNull.Value ? 0 : (int)row["IdUbicacion"];
                                orden.Unidades = row["Unidades"] == DBNull.Value ? string.Empty : (string)row["Unidades"];
                                orden.IdMaterial = row["IdProducto"] == DBNull.Value ? string.Empty : (string)row["IdProducto"];
                                orden.IdEstado = (int)TipoEstadosOrdenPreparacion.CREADA;
                            }
                        }
                    }
                }
                return orden;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_OrdenPreparacion.GetOrdenPreparacionByPlantilla", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_OrdenPreparacion.GetOrdenPreparacionByPlantilla", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }          
        }

        internal static string ObtenerLocationPathUbicacion(int idUbicacion)
        {
            try
            {
                string loc = string.Empty;
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {

                    using (SqlCommand command = new SqlCommand("[MES_ObtenerLocationPathUbicacion]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@IdUbicacion", idUbicacion);
                        SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.NVarChar);
                        returnParam.Direction = ParameterDirection.ReturnValue;
                        command.Parameters.Add(returnParam);
                        command.CommandTimeout = 20;
                        try
                        {
                            connection.Open();
                            command.ExecuteNonQuery();
                            loc = returnParam.Value == DBNull.Value ? (string)null : Convert.ToString(returnParam.Value);
                        }
                        catch (Exception ex)
                        {
                            //DAO_Log.registrarLog(DateTime.Now, "DAO_Materiales.ObtenerTiempoCambioPreactor", ex, "Sistema");
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_OrdenPreparacion.ObtenerLocationPathUbicacion", "WEB-FABRICACION", "Sistema");
                        }
                    }
                }

                return loc;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_OrdenPreparacion.GetOrdenPreparacionByPlantilla", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_OrdenPreparacion.ObtenerLocationPathUbicacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }        
        }

        internal static List<dynamic> ObtenerOrdenesPreparacion(int finalizadas){
            try
            {
                dynamic orden = null;
                List<dynamic> _returnList = new List<dynamic>();
                string _sp = finalizadas == 1 ? "[MES_ObtenerHistoricoOrdenesPreparacion]" : "[MES_ObtenerOrdenesPreparacionActivas]";

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand(_sp, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            if (dt != null && dt.Rows.Count > 0)
                            {
                                for (int i = 0; i < dt.Rows.Count; i++)
                                {
                                    orden = new ExpandoObject();
                                    DataRow row = dt.Rows[i];
                                    orden.Tipo = row["Tipo"] == DBNull.Value ? string.Empty :  IdiomaController.GetResourceName((string)row["Tipo"]);
                                    orden.Descripcion = row["Descripcion"] == DBNull.Value ? string.Empty : (string)row["Descripcion"];
                                    orden.IdEstado = row["IdEstado"] == DBNull.Value ? 0 : (int)row["IdEstado"];
                                    orden.NombreEstado = row["NombreEstado"] == DBNull.Value ? string.Empty : IdiomaController.GetResourceName((string)row["NombreEstado"]);
                                    orden.IdOrden = row["IdOrden"] == DBNull.Value ? string.Empty : (string)row["IdOrden"];
                                    orden.VolumenInicial = row["VolumenInicial"] == DBNull.Value ? 0 : (float)row["VolumenInicial"];
                                    orden.VolumenReal = row["VolumenReal"] == DBNull.Value ? 0 : (float)row["VolumenReal"];
                                    orden.IdUbicacion = row["IdUbicacion"] == DBNull.Value ? 0 : (int)row["IdUbicacion"];
                                    orden.Ubicacion = row["Ubicacion"] == DBNull.Value ? string.Empty : (string)row["Ubicacion"];
                                    orden.FechaCreacion = row["FechaCreacion"] == DBNull.Value ? null : (DateTime?) Convert.ToDateTime(row["FechaCreacion"]).ToLocalTime();
                                    orden.FechaInicio = row["FechaInicio"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["FechaInicio"]).ToLocalTime();
                                    orden.FechaFin = row["FechaFin"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["FechaFin"]).ToLocalTime();
                                    orden.EstadoSiguiente = row["EstadoSiguiente"] == DBNull.Value ? string.Empty : (string)row["EstadoSiguiente"];
                                    orden.UnidadMedida = row["UnidadMedida"] == DBNull.Value ? string.Empty : (string)row["UnidadMedida"];
                                    _returnList.Add(orden);
                                }
                                
                            }
                        }
                    }
                }
                return _returnList;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_OrdenPreparacion.GetOrdenPreparacionByPlantilla", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_OrdenPreparacion.ObtenerOrdenesPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }          
        }

        internal static bool EditarOrdenPreparacion(dynamic cambio) {
            return OrdenPreparacionBread.EditarOrdenPreparacion(cambio);
        }

        internal static bool creaEstadosOrdenes(int id, string nombre)
        {
            return OrdenPreparacionBread.creaEstadosOrdenes(id,nombre);
        }

        internal static bool creaTipoOrden(int id, string nombre)
        {
            return OrdenPreparacionBread.creaTipoOrden(id, nombre);
        }

        internal static bool creaTransicionOrdenPreparacion(int id, int idSiguiente)
        {
            return OrdenPreparacionBread.creaTransicionOrdenPreparacion(id, idSiguiente);
        }

        
    }
}