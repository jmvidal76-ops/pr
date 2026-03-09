using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;


namespace MSM.BBDD.Planta
{
    public class AccesoBBDD
    {
        //---------------------------------------------------------------------------------------
        // Atributos
        //---------------------------------------------------------------------------------------
        private string cadenaConexion = "";


        //---------------------------------------------------------------------------------------
        // Constructor
        //---------------------------------------------------------------------------------------
        public AccesoBBDD()
        {
            this.cadenaConexion = ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString;
        }


        //---------------------------------------------------------------------------------------
        // Metodos
        //---------------------------------------------------------------------------------------


        //<summary>
	    //Función para abrir una conexión a la base de datos
	    //</summary>
        public SqlConnection abrirConexion()
        {

           SqlConnection conexion;
            
           conexion = new SqlConnection(this.cadenaConexion);

           return conexion;
          
        }

        //<summary>
	    //Función para ejecutar una consulta SELECT SQL
	    //</summary>
	    //<param name="txtConsulta"></param>
	    //<param name="conexion">conexión sin abrir</param>

        public SqlDataReader ejecutarConsulta (String txtConsulta, SqlConnection conexion)
        {
            
            SqlCommand cmdConsulta;
            SqlDataReader dtrResultado = null;

            try
            {
                conexion.Open();
                cmdConsulta =  new SqlCommand(txtConsulta,conexion);

                //Tipo
                cmdConsulta.CommandType = CommandType.Text;

                //Ejecutar y obtener resultado
                dtrResultado = cmdConsulta.ExecuteReader();
               
            }
            catch (Exception e)
            {
               
                //Cierra reader si está abierto
                if (dtrResultado != null)
                {
                     dtrResultado.Close();
                }


                //Cierra conexión si está abierta
                if (conexion.State == ConnectionState.Open)
                {
                    conexion.Close();
                }

                //Seguimos propagando la excepción para que la puedan tratar 
                //los métodos que llaman a éste
                throw e;
                
            }

            return dtrResultado;

        }



       //<summary>
	    //Función para ejecutar una sentencia INSERT, UPDATE, DELETE SQL
	    //</summary>
	    //<param name="txtSentencia"></param>
	    //<param name="conexion">conexión abierta</param>
	    //<param name="cerrarConexion"></param>
	   
        public int ejecutarSentencia (string txtSentencia, SqlConnection conexion, Boolean cerrarConexion)
        {
        
            //Declara variables que almacenarán la sentencia sql y el resultado
            SqlCommand cmdSentencia;
            int registrosAfectados = 0;

            try
            {
                //Abrir conexión
			    if (conexion.State != ConnectionState.Open)
                {
                    conexion.Open();
                }
                //Preparar sentencia SQL
                cmdSentencia = new SqlCommand(txtSentencia, conexion);

                //Tipo
			    cmdSentencia.CommandType = CommandType.Text;

			    //Ejecutar y obtener el número de registros afectados (insertados)
                registrosAfectados = cmdSentencia.ExecuteNonQuery();
		

            }
            catch (Exception e)
            {

			    //Cierra conexión si está abierta
                if (conexion.State == ConnectionState.Open && cerrarConexion)
                {
                    conexion.Close();
                }
				
                //Seguimos propagando la excepción para que la puedan tratar 
			    //los métodos que llaman a éste
                throw e;
            }

            //Cerrar conexión
		    if (conexion.State == ConnectionState.Open && cerrarConexion)
            {
                conexion.Close();
            }

            return registrosAfectados;

        }

 
    }
}