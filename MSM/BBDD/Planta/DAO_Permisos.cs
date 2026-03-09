
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using MSM.Models.Planta;
using MSM.Controllers.Planta;

namespace MSM.BBDD.Planta
{
    public class DAO_Permisos
    {
        public bool TienePermisos(string rol, string funcion) {
            
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            bool result;
            SqlCommand comando = new SqlCommand("[APP_TienePermiso]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@rol", rol);
            comando.Parameters.AddWithValue("@funcion", funcion);
            try
            {

                conexion.Open();
                result = (bool) comando.ExecuteScalar();                
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Permisos.TienePermisos", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Permisos.TienePermisos", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_CONSULTANDO_PERMISOS"));
            }
            finally
            {                
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
            return result;
        }

        public List<Funcion> FuncionesUsuario(string userName) {

            List<Funcion> funciones = new List<Funcion>();
            if (!string.IsNullOrEmpty(userName)) {
                SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
                SqlDataReader dr = null;
                SqlCommand comando = new SqlCommand("[APP_ObtenerFuncionesUsuario]", conexion);
                comando.CommandType = CommandType.StoredProcedure;
                comando.Parameters.AddWithValue("@userName", userName);


                try
                {

                    conexion.Open();
                    dr = comando.ExecuteReader();
                    while (dr.Read())
                    {
                        funciones.Add(new Funcion {
                            id = DataHelper.GetInt(dr,"ID_FUNCION"),
                            codigo = DataHelper.GetString(dr,"CODIGO"),
                            descripcion = DataHelper.GetString(dr,"DESCRIPCION")
                        });
                    }
                }
                catch (Exception ex)
                {
                    //DAO_Log.registrarLog(DateTime.Now, "DAO_Permisos.FuncionesUsuario", ex, "Sistema");
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Permisos.FuncionesUsuario", "WEB-PLANTA", "Sistema");
                    throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_FUNCIONES_DE"));
                }
                finally
                {
                    if (dr != null && !dr.IsClosed) dr.Close();
                    if (conexion.State == ConnectionState.Open) conexion.Close();
                }
            }         
            return funciones;
        }
    }
}
