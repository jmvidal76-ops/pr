using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using BreadMES.Envasado;

namespace UtilidadesDesarrollo
{
    public partial class CargaParametrosLineaProducto : Form
    {
        public CargaParametrosLineaProducto()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            SqlConnection conexion = new SqlConnection(textBox1.Text);
            string consulta =@"SELECT DISTINCT LINEA, PPR, NOMBRE FROM [dbo].[ProductosLineas] PL 
                                                            INNER JOIN [dbo].[Productos] P ON PL.[Material] = P.[IdProducto]";

            SqlCommand comando = new SqlCommand(consulta, conexion);

            DataTable dt = new DataTable();
            SqlDataAdapter da = new SqlDataAdapter(comando);
                try
                {
                    conexion.Open();
                    da.Fill(dt);
                    int oeeCritico = 0;
                    int oeeObjetivo = 0;
                    int velocidad_nominal = 0;
                    List<string> lista = new List<string>();

                    for (int i = 0; i < dt.Rows.Count; i++)
                    {
                        string producto = dt.Rows[i].ItemArray[1].ToString();
                        velocidad_nominal = 0;


                        if (dt.Rows[i].ItemArray[0].ToString().Contains("B109"))
                        {
                            //LINEA1
                            if (dt.Rows[i].ItemArray[2].ToString().Contains("1/3"))
                            {
                                velocidad_nominal = 30000;
                            }
                            else if (dt.Rows[i].ItemArray[2].ToString().Contains("1/4"))
                                {
                                    velocidad_nominal = 42000;
                                }

                        }
                        else
                            if (dt.Rows[i].ItemArray[0].ToString().Contains("B209"))
                            {
                                //LINEA2
                                if (dt.Rows[i].ItemArray[2].ToString().Contains("1/3"))
                                {
                                    velocidad_nominal = 61000;
                                }
                                else  if (dt.Rows[i].ItemArray[2].ToString().Contains("1/5"))
                                    {
                                        velocidad_nominal = 69000;
                                    }
                            }
                            else
                                if (dt.Rows[i].ItemArray[0].ToString().Contains("B309"))
                                {
                                    //LINEA3
                                    if (dt.Rows[i].ItemArray[2].ToString().Contains("1/3") || dt.Rows[i].ItemArray[2].ToString().Contains("1/4"))
                                    {
                                        velocidad_nominal = 42000;
                                    }
                                    else
                                        if (dt.Rows[i].ItemArray[2].ToString().Contains("1/2"))
                                        {
                                            velocidad_nominal = 30000;
                                        }

                                }
                                else
                                    if (dt.Rows[i].ItemArray[0].ToString().Contains("B409"))
                                    {
                                        //LINEA4
                                        if (dt.Rows[i].ItemArray[2].ToString().Contains("20L"))
                                        {
                                            velocidad_nominal = 312;
                                        }else
                                            if (dt.Rows[i].ItemArray[2].ToString().Contains("30L"))
                                            {
                                                velocidad_nominal = 300;
                                            }else
                                                if (dt.Rows[i].ItemArray[2].ToString().Contains("50L"))
                                                {
                                                    velocidad_nominal = 280;
                                                }
                                    }

                        lista.Add(producto + "@" + velocidad_nominal.ToString() + "@" + oeeCritico.ToString() + "@" + oeeObjetivo.ToString());
                        //Console.WriteLine(producto + "@" + velocidad_nominal.ToString() + "@" + oeeCritico.ToString() + "@" + oeeObjetivo.ToString());
                    }
                    //Console.WriteLine("Todos: " + lista.Count);
                    BreadMES.Envasado.ParametrosBread.cargarParametrosLineaProducto(lista);
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message);
                }
        }
    }
}
