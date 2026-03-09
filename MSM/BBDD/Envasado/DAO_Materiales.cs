using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_Materiales
    {
        public List<Material> ObtenerDatosMaestros()
        {
            List<Material> materiales = new List<Material>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerDatosMaestros]", conexion);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    DateTime? fechaEfectivoDesde = null;
                    DateTime? fechaEfectivoHasta = null;
                    DateTime? fechaCreacion = null;
                    DateTime? fechaUltCreacion = null;

                    if (!String.IsNullOrEmpty(dr["F_EfectivoDesde"].ToString()))
                    {
                        fechaEfectivoDesde = Convert.ToDateTime(dr["F_EfectivoDesde"]);
                    }
                    if (!String.IsNullOrEmpty(dr["F_EfectivoHasta"].ToString()))
                    {
                        fechaEfectivoHasta = Convert.ToDateTime(dr["F_EfectivoHasta"]);
                    }
                    if (!String.IsNullOrEmpty(dr["FechaCreacion"].ToString()))
                    {
                        fechaCreacion = Convert.ToDateTime(dr["FechaCreacion"]);
                    }
                    if (!String.IsNullOrEmpty(dr["FechaUltCreacion"].ToString()))
                    {
                        fechaUltCreacion = Convert.ToDateTime(dr["FechaUltCreacion"]);
                    }

                    string formatoComun = string.IsNullOrEmpty(dr["CodigoFormatoComun"].ToString()) ? string.Empty : 
                        string.Format("{0} - {1}", dr["CodigoFormatoComun"].ToString(), dr["DescripcionFormatoComun"].ToString());

                    string idSubclase = string.IsNullOrEmpty(dr["IdSubclase"].ToString()) ? string.Empty :
                        dr["IdSubclase"].ToString();
                    string subclase = string.IsNullOrEmpty(dr["Subclase"].ToString()) ? string.Empty :
                        dr["Subclase"].ToString();


                    materiales.Add(new Material(dr["IdMaterial"].ToString(), string.Join(" ", dr["Nombre"].ToString().Split(new char[] {' '}, StringSplitOptions.RemoveEmptyEntries)),
                        dr["IdClase"].ToString(), string.Join(" ", dr["Descripcion"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)),
                        dr["Version"].ToString(), dr["Status"].ToString(), dr["UdMedida"].ToString(), dr["Autor"].ToString(), 
                        fechaEfectivoDesde, fechaEfectivoHasta, fechaCreacion, fechaUltCreacion, Convert.ToBoolean(dr["EnUso"]), 
                        dr["ModificadoPor"].ToString(), dr["InfoAdicional"].ToString(), dr["DescTipo"].ToString(), dr["IdLote"].ToString(), 
                        dr["Clase"].ToString(), dr["Marca"].ToString(), dr["Gama"].ToString(), dr["TipoEnvase"].ToString())
                    { 
                        FormatoComun = formatoComun,
                        idSubclase = idSubclase,
                        subclase = subclase
                    });
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.obtenerMateriales", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_DATOS_MAESTROS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return materiales;
        }

        public List<Material> ObtenerListaMateriales()
        {
            List<Material> materiales = new List<Material>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerListaMateriales]", conexion);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    string nombre = string.Join(" ", dr["Nombre"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                    string formatoComun = string.IsNullOrEmpty(dr["CodigoFormatoComun"].ToString()) ? string.Empty : 
                        string.Format("{0} - {1}", dr["CodigoFormatoComun"].ToString(), dr["DescripcionFormatoComun"].ToString());

                    Material material = new Material(dr["IdProducto"].ToString(), nombre);
                    material.descripcion = string.Join(" ", dr["Descripcion"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                    material.udMedida = dr["UdMedida"].ToString();
                    material.gama = dr["Gama"].ToString();
                    material.marca = dr["Marca"].ToString();
                    material.tipoEnvase = dr["TipoEnvase"].ToString();
                    material.FormatoComun = formatoComun;

                    materiales.Add(material);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.ObtenerListaMateriales", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MATERIALES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return materiales;
        }

        public List<MaterialDetalle> ObtenerDetalleMateriales(string codigoProducto)
        {
            List<MaterialDetalle> listaDetalleMateriales = new List<MaterialDetalle>();

            try
            {
                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_ObtenerDetalleMateriales]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@codigoProducto", codigoProducto);

                        connection.Open();
                        SqlDataReader dr = command.ExecuteReader();

                        while (dr.Read())
                        {
                            var materialDetalle = new MaterialDetalle();
                            var nombreLinea = DataHelper.GetString(dr, "Linea");

                            using (MESEntities contexto = new MESEntities())
                            {
                                materialDetalle.Linea = contexto.DeslizanteLineas.AsNoTracking().Where(x => x.nombreLinea == nombreLinea).First().descripcion;
                            }

                            materialDetalle.IdMaterial = DataHelper.GetString(dr, "IdMaterial");
                            materialDetalle.NombreMaterial = DataHelper.GetString(dr, "NombreMaterial");
                            materialDetalle.Cantidad = DataHelper.GetDecimal(dr, "Cantidad");
                            materialDetalle.UnidadMedida = DataHelper.GetString(dr, "UnidadMedida");

                            listaDetalleMateriales.Add(materialDetalle);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.ObtenerDetalleMateriales", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_DETALLE_MATERIALES"));
            }

            return listaDetalleMateriales;
        }

        public List<MaterialEan> ObtenerEansValidos(string idMaterial)
        {
            List<MaterialEan> listaEans = new List<MaterialEan>();

            try
            {
                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_ObtenerEansValidos]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idMaterial", idMaterial);

                        connection.Open();
                        SqlDataReader dr = command.ExecuteReader();

                        while (dr.Read())
                        {
                            var materialEan = new MaterialEan();
                            materialEan.IdEan = DataHelper.GetString(dr, "IdEan");
                            materialEan.NombreEan = DataHelper.GetString(dr, "NombreEan");
                            materialEan.CodProveedor = DataHelper.GetString(dr, "CodProveedor");
                            materialEan.Proveedor = DataHelper.GetString(dr, "Proveedor");

                            listaEans.Add(materialEan);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.ObtenerEansValidos", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EAN"));
            }

            return listaEans;
        }

        public List<Material> obtenerProductos()
        {
            List<Material> materiales = new List<Material>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerProductos]", conexion);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    DateTime? fechaEfectivoDesde = null;
                    DateTime? fechaEfectivoHasta = null;
                    DateTime? fechaCreacion = null;
                    DateTime? fechaUltCreacion = null;

                    if (!String.IsNullOrEmpty(dr["F_EfectivoDesde"].ToString()))
                    {
                        fechaEfectivoDesde = Convert.ToDateTime(dr["F_EfectivoDesde"]);
                    }
                    if (!String.IsNullOrEmpty(dr["F_EfectivoHasta"].ToString()))
                    {
                        fechaEfectivoHasta = Convert.ToDateTime(dr["F_EfectivoHasta"]);
                    }
                    if (!String.IsNullOrEmpty(dr["FechaCreacion"].ToString()))
                    {
                        fechaCreacion = Convert.ToDateTime(dr["FechaCreacion"]);
                    }
                    if (!String.IsNullOrEmpty(dr["FechaUltCreacion"].ToString()))
                    {
                        fechaUltCreacion = Convert.ToDateTime(dr["FechaUltCreacion"]);
                    }

                    materiales.Add(new Material(dr["IdProducto"].ToString(), dr["Nombre"].ToString(), dr["IdTipoProducto"].ToString(), 
                        dr["Descripcion"].ToString(), dr["Version"].ToString(), dr["Status"].ToString(), dr["UdMedida"].ToString(), 
                        dr["Autor"].ToString(), fechaEfectivoDesde, fechaEfectivoHasta, fechaCreacion, fechaUltCreacion,
                        Convert.ToBoolean(dr["EnUso"]), dr["ModificadoPor"].ToString(), dr["InfoAdicional"].ToString(), dr["Tipo"].ToString(), 
                        dr["IdLote"].ToString(), dr["TipoProducto"].ToString(), dr["Marca"].ToString(), dr["Gama"].ToString(), dr["TipoEnvase"].ToString()));
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.obtenerMateriales", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MATERIALES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return materiales;
        }

        public List<TiempoCambio> ObtenerTiemposCambio()
        {
            List<TiempoCambio> cambios = new List<TiempoCambio>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTiemposCambio]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.CommandTimeout = 120;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    string formatoComunEntrante = string.IsNullOrEmpty(dr["CodigoFormatoComunEntrante"].ToString()) ? string.Empty : 
                        string.Format("{0} - {1}", dr["CodigoFormatoComunEntrante"].ToString(), dr["DescripcionFormatoComunEntrante"].ToString());

                    string formatoComunSaliente = string.IsNullOrEmpty(dr["CodigoFormatoComunSaliente"].ToString()) ? string.Empty : 
                        string.Format("{0} - {1}", dr["CodigoFormatoComunSaliente"].ToString(), dr["DescripcionFormatoComunSaliente"].ToString());

                    bool inhabilitarCalculo = DataHelper.GetShort(dr, "InhabilitarCalculo") == 1;

                    cambios.Add(new TiempoCambio(
                        DataHelper.GetLong(dr, "IdTiempoCambio"),
                        DataHelper.GetShort(dr, "idLinea"),
                        DataHelper.GetString(dr, "descLinea"),
                        new Producto(DataHelper.GetString(dr, "IdProductoEntrante"),  string.Join(" ", DataHelper.GetString(dr, "ProductoEntrante").Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries))),
                        new Producto(DataHelper.GetString(dr, "IdProductoSaliente"), string.Join(" ", DataHelper.GetString(dr, "ProductoSaliente").Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries))),
                        DataHelper.GetInt(dr, "Tobj1"),
                        DataHelper.GetInt(dr, "Tobj2"),
                        DataHelper.GetInt(dr, "Tm"),
                        DataHelper.GetInt(dr, "TIEMPO_CALCULADO_2"),
                        DataHelper.GetInt(dr, "TIEMPO_PREACTOR"),
                        DataHelper.GetString(dr, "NumeroLineaDescripcion"),
                        formatoComunEntrante,
                        formatoComunSaliente,
                        inhabilitarCalculo
                    ));
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.obtenerTiemposCambio", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TIEMPOS_CAMBIO"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return cambios;
        }

        public List<TiempoArranque> ObtenerTiemposArranque()
        {
            List<TiempoArranque> arranques = new List<TiempoArranque>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerTiemposArranque]", conexion);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    string formatoComunEntrante = string.IsNullOrEmpty(dr["CodigoFormatoComunEntrante"].ToString()) ? string.Empty :
                        string.Format("{0} - {1}", dr["CodigoFormatoComunEntrante"].ToString(), dr["DescripcionFormatoComunEntrante"].ToString());

                    bool inhabilitarCalculo = DataHelper.GetShort(dr, "InhabilitarCalculo") == 1;

                    arranques.Add(new TiempoArranque(
                        DataHelper.GetLong(dr, "IdTiempoArranque"),
                        DataHelper.GetShort(dr, "idLinea"),
                        DataHelper.GetString(dr, "descLinea"),
                        new Producto(DataHelper.GetString(dr, "IdProductoEntrante"), string.Join(" ", DataHelper.GetString(dr, "ProductoEntrante").Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries))),
                        DataHelper.GetShort(dr, "tipoArranque"),
                        DataHelper.GetInt(dr, "Tobj1"),
                        DataHelper.GetInt(dr, "Tobj2"),
                        DataHelper.GetInt(dr, "Tm"),
                        DataHelper.GetInt(dr, "TIEMPO_CALCULADO_2"),
                        DataHelper.GetInt(dr, "TIEMPO_PREACTOR"),
                        DataHelper.GetString(dr, "DescArranque"),
                        DataHelper.GetString(dr,"NumeroLineaDescripcion"),
                        formatoComunEntrante,
                        inhabilitarCalculo
                    ));
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.obtenerTiemposArranque", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_TIEMPOS_ARRANQUE"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return arranques;
        }

        public Material ObtenerMaterialCodEan(string codEan)
        {
            Material material = null;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerMaterialesEAN]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@codEan", codEan);

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                material = new Material((string)row["CodigoMaterial"], (string)row["Descripcion"]);
                            }
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.obtenerMaterialCodEan", "I-ERP-MES-MATERIAL", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL"));
                        }
                    }
                }
            }

            return material;
        }

        public List<Material> ObtenerMaterialesProducto(string idLinea, string idProducto)
        {
            List<Material> listaMateriales = new List<Material>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerMaterialesProducto]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@linea", idLinea);
                    command.Parameters.AddWithValue("@id_prod", idProducto);
                    
                    try
                    {
                        connection.Open();
                        SqlDataReader dr = command.ExecuteReader();
                        while (dr.Read())
                        {
                            Material material = new Material(DataHelper.GetString(dr, "IdMaterial"), DataHelper.GetString(dr, "Name"));
                            listaMateriales.Add(material);
                        }
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.obtenerMaterialesProducto", "WEB-ENVASADO", "Sistema");
                        throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_MATERIALES"));
                    }
                }
            }

            return listaMateriales;
        }

        internal static double? ObtenerOeeMedioPreactor(int numeroLinea, string codProducto)
        {
            double? oeePreactor = 0;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetOEEMedioPreactor]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@numLinea", numeroLinea);
                    command.Parameters.AddWithValue("@IdProducto", codProducto);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Float);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    command.CommandTimeout = 20;

                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        oeePreactor = returnParam.Value == DBNull.Value ? (double?)null : Convert.ToDouble(returnParam.Value);                       
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.obtenerOeePreactor", "WEB-WO", "Sistema");
                        throw ex;
                    }
                }
            }

            return oeePreactor;
        }

        internal static int? ObtenerTiempoCambioPreactor(int numeroLinea, string idProductoEntrante, string idProductoSaliente)
        {
            int? tiempoPre = null;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetTiempoCambioMedioPreactor]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@numLinea", numeroLinea);
                    command.Parameters.AddWithValue("@IdProductoEntrante", idProductoEntrante);
                    command.Parameters.AddWithValue("@IdProductoSaliente", idProductoSaliente);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Int);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    command.CommandTimeout = 20;

                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        tiempoPre = returnParam.Value == DBNull.Value ? (int?)null : Convert.ToInt32(returnParam.Value);     
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.obtenerTiempoCambioPreactor", "WEB-WO", "Sistema");
                        throw ex;
                    }
                }
            }

            return tiempoPre;
        }

        internal static int? ObtenerTiempoArranquePreactor(int numeroLinea, string idProductoEntrante, int TipoArranque)
        {
            int? tiempoPre = null;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetTiempoArranqueMedioPreactor]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@numLinea", numeroLinea);
                    command.Parameters.AddWithValue("@idProductoEntrante", idProductoEntrante);
                    command.Parameters.AddWithValue("@TipoArranque", TipoArranque);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.VarChar);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    command.CommandTimeout = 20;

                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        tiempoPre = returnParam.Value == DBNull.Value ? (int?)null : Convert.ToInt32(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.obtenerTiempoArranquePreactor", "WEB-WO", "Sistema");
                        throw ex;
                    }
                }
            }

            return tiempoPre;
        }

        internal static double ObtenerOEEWOMedio(int numeroLinea, string codProducto)
        {
            double OEEWOMedio = 0;

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_GetOEEMedio]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@numLinea", numeroLinea);
                    command.Parameters.AddWithValue("@IdProducto", codProducto);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Float);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);
                    command.CommandTimeout = 20;

                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                        OEEWOMedio = Convert.ToDouble(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.ObtenerOEEWOMedio", "WEB-WO", "Sistema");
                        throw ex;
                    }
                }
            }

            return OEEWOMedio;
        }

        internal static List<int> ObtenerTiempoCambioMedio(int numeroLinea, string idProductoEntrante, string idProductoSaliente)
        {
            List<int> tiemposMedios = new List<int>();

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("select * from dbo.MES_GetTiempoCambioMedio(@numLinea, @idProductoEntrante, @idProductoSaliente)", connection))
                {
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue("@numLinea", numeroLinea);
                    command.Parameters.AddWithValue("@idProductoEntrante", idProductoEntrante);
                    command.Parameters.AddWithValue("@idProductoSaliente", idProductoSaliente);
                    command.CommandTimeout = 20;

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                tiemposMedios.Add(Convert.ToInt32(row["TiempoMedio_1"]));
                                tiemposMedios.Add(Convert.ToInt32(row["TiempoMedio_2"]));
                            }
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.ObtenerTiempoCambioMedio", "WEB-WO", "Sistema");
                            throw ex;
                        }
                    }
                }
            }

            return tiemposMedios;
        }

        internal static List<int> ObtenerTiempoArranqueMedio(int numeroLinea, string idProductoEntrante, int tipoArranque)
        {
            List<int> tiemposMedios = new List<int>();

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("select * from dbo.MES_GetTiempoArranqueMedio(@numLinea, @idProductoEntrante, @TipoArranque)", connection))
                {
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue("@numLinea", numeroLinea);
                    command.Parameters.AddWithValue("@idProductoEntrante", idProductoEntrante);
                    command.Parameters.AddWithValue("@TipoArranque", tipoArranque);
                    command.CommandTimeout = 20;

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                tiemposMedios.Add(Convert.ToInt32(row["TiempoMedio_1"]));
                                tiemposMedios.Add(Convert.ToInt32(row["TiempoMedio_2"]));
                            }
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.ObtenerTiempoArranqueMedio", "WEB-WO", "Sistema");
                            throw ex;
                        }
                    }
                }
            }

            return tiemposMedios;
        }

        public List<DTO_ConfiguracionEmpaquetadoras> ObtenerConfiguracionEmpaquetadoras()
        {
            List<DTO_ConfiguracionEmpaquetadoras> lista = new List<DTO_ConfiguracionEmpaquetadoras>();

            try
            {
                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_ObtenerConfiguracionEmpaquetadoras]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        connection.Open();
                        SqlDataReader dr = command.ExecuteReader();

                        while (dr.Read())
                        {
                            var dtoConfigEmpaquetadoras = new DTO_ConfiguracionEmpaquetadoras();

                            var configEmpaquetadoras = new ConfiguracionEmpaquetadoras();
                            configEmpaquetadoras.Linea = DataHelper.GetString(dr, "Linea");
                            configEmpaquetadoras.Producto = DataHelper.GetString(dr, "Producto");

                            string formatoComun = string.IsNullOrEmpty(dr["CodigoFormatoComun"].ToString()) ? string.Empty :
                                string.Format("{0} - {1}", dr["CodigoFormatoComun"].ToString(), dr["DescripcionFormatoComun"].ToString());

                            dtoConfigEmpaquetadoras.ConfiguracionEmpaquetadoras = configEmpaquetadoras;
                            dtoConfigEmpaquetadoras.DescripcionLinea = DataHelper.GetString(dr, "DescripcionLinea");
                            dtoConfigEmpaquetadoras.FormatoComun = formatoComun;
                            dtoConfigEmpaquetadoras.DescripcionProducto = DataHelper.GetString(dr, "DescripcionProducto");

                            lista.Add(dtoConfigEmpaquetadoras);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Materiales.ObtenerConfiguracionEmpaquetadoras", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CONFIG_EMPAQ"));
            }

            return lista;
        }

        public List<object> ObtenerEmpaquetadorasLineaProducto(string linea, string producto)
        {
            try
            {
                List<object> listaEmpaquetadoras = new List<object>();

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_ObtenerEmpaquetadorasLineaProducto]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@linea", linea);
                        command.Parameters.AddWithValue("@producto", producto);

                        connection.Open();
                        SqlDataReader dr = command.ExecuteReader();

                        while (dr.Read())
                        {
                            var empaquetadora = new 
                            { 
                                Linea = DataHelper.GetString(dr, "Linea"),
                                NumeroLinea = DataHelper.GetInt(dr, "NumeroLinea"),
                                Producto = DataHelper.GetString(dr, "Producto"),
                                Empaquetadora = DataHelper.GetString(dr, "Empaquetadora"),
                                DescripcionEmpaquetadora = DataHelper.GetString(dr, "DescripcionEmpaquetadora"),
                                Suma = DataHelper.GetBool(dr, "Suma")
                            };

                            listaEmpaquetadoras.Add(empaquetadora);
                        }
                    }
                }

                return listaEmpaquetadoras;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool GuardarSumaEmpaquetadora(ConfiguracionEmpaquetadoras config)
        {
            try
            {
                using (MESEntities db = new MESEntities())
                {
                    var configuracionEmpaquetadoras = db.ConfiguracionEmpaquetadoras.Where(x => x.Linea == config.Linea && x.Producto == config.Producto && 
                        x.Empaquetadora == config.Empaquetadora).First();
                    
                    configuracionEmpaquetadoras.Suma = config.Suma;
                    db.SaveChanges();

                    string mensaje = "Cambio de configuración de las empaquetadoras. ";
                    Lineas linea = db.Lineas.Where(l => l.Id == config.Linea).First();
                    string lineaDescripcion = IdiomaController.GetResourceName("LINEA") + " " + linea.NumeroLineaDescripcion + " - " + linea.Descripcion;
                    Maquinas maquina = db.Maquinas.Where(m => m.Nombre == config.Empaquetadora).First();
                    string empaquetadora = IdiomaController.GetResourceName("EMPAQUETADORA") + ": " + maquina.Nombre + " - " + maquina.Descripcion;
                    mensaje += lineaDescripcion + "; " + IdiomaController.GetResourceName("CODIGO_PRODUCTO") + ": " + config.Producto + "; " +
                        empaquetadora + "; " + IdiomaController.GetResourceName("SUMA") + ": " + (config.Suma ? "Sí" : "No");

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Materiales.GuardarSumaEmpaquetadora", mensaje, HttpContext.Current.User.Identity.Name);

                    return true;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}