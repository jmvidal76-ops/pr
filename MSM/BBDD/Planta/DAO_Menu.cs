using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MSM.Models.Envasado;
using System.Data.SqlClient;
using System.Configuration;
using System.Data;
using System.Threading;
using MSM.Models.Planta;
using MSM.Controllers.Planta;

namespace MSM.BBDD.Planta
{
    public class DAO_Menu
    {

        //---------------------------------------------------------------------------------------
        //Recupera los menus padres
        //---------------------------------------------------------------------------------------

        public List<Menu> obtenerMenusPadre(string aplicacion, List<Funcion> funcionesUsuario)
        {
            string usuario = Thread.CurrentPrincipal.Identity.Name;
            List<Menu> listaMenusPadre = new List<Menu>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[APP_ObtenerMenus]", conexion);
            comando.Parameters.AddWithValue("@aplicacion", aplicacion);
            comando.Parameters.AddWithValue("@menuPadre", -1);
            comando.Parameters.AddWithValue("@usuario", usuario);
            comando.CommandType = CommandType.StoredProcedure;
    
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    int idMenu = dr.GetInt32(dr.GetOrdinal("ID_MENU"));
                    List<Funcion> funcionesMenu = this.obtenerFunciones(idMenu);

                    listaMenusPadre.Add(
                        new Menu(idMenu,
                            DataHelper.GetString(dr, "NOMBRE"), 
                            DataHelper.GetString(dr,"VISTA"), 
                            (DataHelper.GetInt(dr,"PermisoMenu") == 1), 
                            this.obtenersubMenus(idMenu, aplicacion, funcionesUsuario),
                            funcionesMenu)); 

                }
            }

            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Menu.obtenerMenusPadre", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Menu.obtenerMenusPadre", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_MENÚ"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
            
            return listaMenusPadre;
        }

        public  List<Funcion> obtenerFunciones(int idMenu)
        {
            List<Funcion> funciones = new List<Funcion>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[APP_ObtenerFuncionesMenu]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@idMenu", idMenu);

            try
            {

                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    funciones.Add(new Funcion
                    {
                        id = DataHelper.GetInt(dr, "ID_FUNCION"),
                        codigo = DataHelper.GetString(dr, "CODIGO"),
                        descripcion = DataHelper.GetString(dr, "DESCRIPCION")
                    });
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Menu.obtenerFunciones", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Menu.obtenerFunciones", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_FUNCIONES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return funciones;
        }

        //---------------------------------------------------------------------------------------
        //Recupera los submenus para cada menu padre de forma recursiva.
        //---------------------------------------------------------------------------------------

        public List<Menu> obtenersubMenus(int idPadre, string aplicacion, List<Funcion> funcionesUsuario)
        {
            string usuario = Thread.CurrentPrincipal.Identity.Name;
            List<Menu> listaSubMenus = new List<Menu>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[APP_ObtenerMenus]", conexion);
            comando.Parameters.AddWithValue("@aplicacion", aplicacion);
            comando.Parameters.AddWithValue("@menuPadre", idPadre);
            comando.Parameters.AddWithValue("@usuario", usuario);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {

                    int idMenu = dr.GetInt32(dr.GetOrdinal("ID_MENU"));
                    List<Funcion> funcionesMenu = this.obtenerFunciones(idMenu);
                    List<Menu> subMenus = this.obtenersubMenus(idMenu, aplicacion, funcionesUsuario);

                    bool permiso = false;

                    foreach (Funcion funcion in funcionesMenu)
                    {
                        if (funcionesUsuario.Exists(f => f.codigo == funcion.codigo))
                        {
                            permiso = true;
                            break;
                        }
                    }
                    
                    //Si tiene permisos alguno de sus hijos, la opción padre también debe tener permisos
                    if (!permiso && subMenus != null && subMenus.Count > 0) {
                        permiso = subMenus.Count(s => s.permiso) > 0;
                    }
                    
                    listaSubMenus.Add(new Menu(idMenu,
                        dr["NOMBRE"].ToString(),
                        dr["VISTA"].ToString(),
                        permiso,
                        subMenus,
                        funcionesMenu));
                    
                    
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Menu.obtenerSubMenus", "WEB-PLANTA", "Sistema");
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Menu.obtenersubMenus", ex, HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_SUBMENÚ"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return listaSubMenus;
        }

        //---------------------------------------------------------------
        //Guarda en base de datos una incidencia reportada por el usuario
        //---------------------------------------------------------------

        public void InsertarIncidenciaReportada(Incidencia inc)
        {

            AccesoBBDD bd = new AccesoBBDD();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);

            SqlCommand comando = new SqlCommand("[APP_InsertarIncidencia]", conexion);
            comando.Parameters.AddWithValue("@usuario", inc.usuario);
            comando.Parameters.AddWithValue("@pantalla", inc.pantalla);
            comando.Parameters.AddWithValue("@descripcion", inc.descripcion);
            comando.Parameters.AddWithValue("@aplicacion", inc.aplicacion);
            comando.Parameters.AddWithValue("@email", inc.email);

            comando.CommandType = CommandType.StoredProcedure;
            
            try
            {
                conexion.Open();
                comando.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Menu.InsertarIncidenciaReportada", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Menu.InsertarIncidenciaReportada", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_REGISTRANDO_INCIDENCIA"));
            }
            finally
            {
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        //---------------------------------------------------------------------------------------
        //Recupera los submenus para cada menu padre de forma recursiva.
        //---------------------------------------------------------------------------------------
        /// <summary>
        /// Obtiene la lista de vistas de una aplicación
        /// </summary>
        /// <param name="aplicacion">La aplicación web correspondiente (T:Terminal, P:Portal)</param>
        /// <returns>Una lista de vistas</returns>
        public List<Vista> obtenerVistas(string aplicacion)
        {

            var identity = Thread.CurrentPrincipal.Identity;
            string usuario = identity.Name;
            List<Vista> vistas = new List<Vista>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[APP_ObtenerVistasAplicacion]", conexion);
            comando.Parameters.AddWithValue("@aplicacion", aplicacion);
            comando.Parameters.AddWithValue("@usuario", usuario);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Vista v = new Vista(
                        DataHelper.GetInt(dr, "ID_VISTA"),
                        DataHelper.GetString(dr, "NOMBRE"),
                        DataHelper.GetString(dr, "CODIGO"),
                        DataHelper.GetString(dr, "RUTA"),
                        DataHelper.GetString(dr, "FUNCION"),
                        DataHelper.GetString(dr, "PARAMETROS"),
                        DataHelper.GetString(dr, "CONTENEDOR"),
                        DataHelper.GetString(dr, "ACCIONES"),
                        DataHelper.GetString(dr, "SECCION"));
                    vistas.Add(v);
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Menu.obtenerVistas", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Menu.ObtenerVistas", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_VISTAS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return vistas;
        }
    }
}
