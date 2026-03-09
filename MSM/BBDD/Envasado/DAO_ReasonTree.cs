
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models;
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
    /// <summary>
    /// Clase que define los métodos de acceso a los datos relativo al árbol de razones o reason tree.
    /// </summary>
    public class DAO_ReasonTree
    {
        /// <summary>
        /// Devuelve la estructura de datos completa del reason tree
        /// </summary>
        /// <returns></returns>
        public ReasonTree LoadReasonTree() {
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerReasonTree]", conexion);
            
            ReasonTree reasonTree = new ReasonTree();
            reasonTree.Categorias = new List<Categoria>();

            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                
                int idCategoria = 0;
                int idMotivo = 0;
                //int idCausa = 0;

                Categoria categoria = null;
                Motivo motivo = null;                
                //Causa causa = null;
                
                while (dr.Read())
                {
                    if (idCategoria != DataHelper.GetInt(dr, "IdCategoria")) {
                        idCategoria = DataHelper.GetInt(dr, "IdCategoria");
                        categoria = new Categoria() { 
                            id = idCategoria, 
                            nombre = DataHelper.GetString(dr, "Categoria"),
                            motivos = new List<Motivo>()
                        };
                        reasonTree.Categorias.Add(categoria);
                    }

                    if (idMotivo != DataHelper.GetInt(dr, "IdNivel1"))
                    {
                        idMotivo = DataHelper.GetInt(dr, "IdNivel1");
                        motivo = new Motivo(){
                            id = idMotivo,
                            nombre = DataHelper.GetString(dr, "Nivel1"),
                            causas = new List<Causa>()
                        };
                        categoria.motivos.Add(motivo);
                    }

                    //if (idCausa != DataHelper.GetInt(dr, "IdNivel2"))
                    if (DataHelper.GetInt(dr, "IdNivel2")!=0)
                    {
                        //idCausa = DataHelper.GetInt(dr, "IdNivel2");
                        Causa causa = new Causa()
                        {
                            id = DataHelper.GetInt(dr, "IdNivel2"),
                            nombre = DataHelper.GetString(dr, "Nivel2"),                            
                        };
                        motivo.causas.Add(causa);
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_ReasonTree.LoadReasonTree", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_ReasonTree.LoadReasonTree", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_ARBOL"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return reasonTree;
        }
    }
}