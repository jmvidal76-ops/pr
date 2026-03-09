
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models;
using MSM.Models.Envasado;
using MSM.Utilidades;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_Query
    {
        public List<Query> obtenerQueries()
        {

            List<Query> queries = new List<Query>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerQueries]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {

                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {

                    queries.Add(
                        new Query()
                        {
                            id = DataHelper.GetInt(dr, "ID_QUERY"),
                            nombre = DataHelper.GetString(dr, "NOMBRE"),
                            texto = DataHelper.GetString(dr, "TEXTO")
                        });

                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Query.obtenerQueries", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Query.obtenerQueries", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_QUERIES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return queries;
        }

        public Query obtenerQuery(int id, bool filtros)
        {

            Query query = null;
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerQuery]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@id", id);
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                if (dr.Read())
                {

                    if (!filtros)
                        query = new Query()
                            {
                                id = DataHelper.GetInt(dr, "ID_QUERY"),
                                nombre = DataHelper.GetString(dr, "NOMBRE"),
                                texto = DataHelper.GetString(dr, "TEXTO").Replace("[WHEREPERDIDA]", "").Replace("[ANDPERDIDA]", "").Replace("[WHEREPTC]", "").Replace("[ANDPTC]", "")
                            };
                    else
                        query = new Query()
                        {
                            id = DataHelper.GetInt(dr, "ID_QUERY"),
                            nombre = DataHelper.GetString(dr, "NOMBRE"),
                            texto = DataHelper.GetString(dr, "TEXTO")
                        };
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Query.obtenerQueries", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Query.obtenerQuery", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_QUERY"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return query;
        }

        public QueryResult ejecutarQuery(dynamic datos)
        {



            //Query query = obtenerQuery(id, filtros);
            QueryResult result = new QueryResult();
            result.Fields = new List<string>();
            result.Types = new List<string>();
            result.Records = new List<Hashtable>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            //Hashtable record = new Hashtable();
            SqlCommand comando = new SqlCommand();
            comando.Connection = conexion;
            comando.CommandType = CommandType.StoredProcedure;
            comando.CommandText = "[dbo].[MES_ObtenerDatosQueries]";
            comando.CommandTimeout = 180;



            string linea = datos.linea != null ? (string)datos.linea : "";
            double fini = datos.fini != null ? (double.Parse((string)datos.fini) / 1000) : 0;
            int tini = datos.tini != null ? int.Parse((string)datos.tini) : 0;
            double ffin = datos.ffin != null ? (double.Parse((string)datos.ffin) / 1000) : 0;
            int tfin = datos.tfin != null ? int.Parse((string)datos.tfin) : 0;
            int id = datos.id != null ? int.Parse((string)datos.id) : 0;


            comando.Parameters.AddWithValue("@linea", linea);
            comando.Parameters.AddWithValue("@fini", fini);
            comando.Parameters.AddWithValue("@tini", tini);
            comando.Parameters.AddWithValue("@ffin", ffin);
            comando.Parameters.AddWithValue("@tfin", tfin);
            comando.Parameters.AddWithValue("@id", id);                      

            try
            {

                conexion.Open();
                dr = comando.ExecuteReader();
                if (dr.Read())
                {
                    for (int i = 0; i < dr.FieldCount; i++)
                    {
                        result.Fields.Add(dr.GetName(i));
                        result.Types.Add(dr.GetDataTypeName(i));
                    }
                }
                do
                {
                    Hashtable record = new Hashtable();
                    foreach (string field in result.Fields)
                    {
                        record[field] = dr[field];
                    }
                    result.Records.Add(record);

                } while (dr.Read());
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Query.ejecutarQuery", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Query.EjecutarQuery", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EJECUTANDO_QUERY"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return result;
        }

        public QueryResultGrafico ejecutarQueryGrafico(dynamic datos)
        {

            //Query query = obtenerQueryGrafico(id);
            QueryResultGrafico result = new QueryResultGrafico();
            result.Fields = new List<string>();
            result.Types = new List<string>();
            result.Records = new List<Hashtable>();
            result.valores = new List<float>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            Hashtable record = new Hashtable();
            SqlCommand comando = new SqlCommand();
            comando.Connection = conexion;
            comando.CommandTimeout = 180;
            comando.CommandType = CommandType.StoredProcedure;
            comando.CommandText = "[dbo].[MES_ObtenerDatosQueriesGraficos]";

            string linea = datos.linea != null ? (string)datos.linea : "";
            int arranque = datos.arranque != "" ? int.Parse((string)datos.arranque) : 0;
            int anyo = datos.anyo != "" ? int.Parse((string)datos.anyo) : 0;
            int semana = datos.semana != "" ? int.Parse((string)datos.semana) : 0;
            int rangos = datos.rangos != null ? int.Parse((string)datos.rangos) : 0;
            Int64 fini = datos.fini != null ? Int64.Parse((string)datos.fini) / 1000 : 0;
            int tini = datos.tini != null ? int.Parse((string)datos.tini) : 0;
            Int64 ffin = datos.ffin != null ? Int64.Parse((string)datos.ffin) / 1000 : 0;
            int tfin = datos.tfin != null ? int.Parse((string)datos.tfin) : 0;
            int id = datos.id != null ? int.Parse((string)datos.id) : 0;
            string maq = datos.maquina != null ? datos.maquina : "";
            string mot = datos.motivos != null ? datos.motivos : "";
            string tipo = (string)datos.tipo;

            comando.Parameters.AddWithValue("@linea", linea);
            comando.Parameters.AddWithValue("@arranque", arranque);
            comando.Parameters.AddWithValue("@anyo", anyo);
            comando.Parameters.AddWithValue("@semana", semana);
            comando.Parameters.AddWithValue("@rangos", rangos);
            comando.Parameters.AddWithValue("@fini", fini);
            comando.Parameters.AddWithValue("@tini", tini);
            comando.Parameters.AddWithValue("@ffin", ffin);
            comando.Parameters.AddWithValue("@tfin", tfin);
            comando.Parameters.AddWithValue("@maq", maq.Length > 1 ? maq.Replace("@", ",").Substring(0, maq.Length - 1) : "");
            comando.Parameters.AddWithValue("@mot", mot.Length > 1 ? mot.Replace("@", ",").Substring(0, mot.Length - 1) : "");
            comando.Parameters.AddWithValue("@id", id);

            try
            {

                conexion.Open();
                dr = comando.ExecuteReader();

                if (tipo.Equals("pie"))
                {

                    while (dr.Read())
                    {
                        for (int i = 0; i < dr.FieldCount; i++)
                        {
                            result.Fields.Add(dr.GetName(i));
                        }

                        record = new Hashtable();
                        foreach (string field in result.Fields)
                        {
                            record[field] = dr[field];
                        }
                        result.Records.Add(record);
                    }
                }
                else
                    if (tipo.Equals("bar"))
                    {
                        while (dr.Read())
                        {
                            result.valores.Add(float.Parse(dr["data"].ToString()));
                            result.Fields.Add(dr["categories"].ToString());
                        }
                    }
                    else
                        if (tipo.Equals("lin"))
                        {
                            String serienombre = "";
                            List<float> valores = new List<float>();
                            List<Series> serie = new List<Series>();
                            List<String> nombres = new List<String>();

                            while (dr.Read())
                            {
                                if (!nombres.Exists(element => element.Equals(dr["categories"].ToString())))
                                {
                                    nombres.Add(dr["categories"].ToString());
                                }

                                if (!serienombre.Equals(dr["seriesname"].ToString()))
                                {
                                    if (valores.Count > 0)
                                    {
                                        serie.Add(new Series { name = serienombre, data = valores });
                                    }

                                    serienombre = dr["seriesname"].ToString();

                                    valores = new List<float>();
                                }
                                valores.Add(float.Parse(dr["seriesdata"].ToString()));

                            }

                            serie.Add(new Series { name = serienombre, data = valores });

                            result.Fields = nombres;
                            result.series = serie;

                            if (id == 6)
                            {
                                //Añadir tendencia
                                //List<float> valTend = new List<float>();
                                //float acumVal = 0;
                                //for (int i = 0; i < result.series[0].data.Count; i++)
                                //{
                                //    acumVal += result.series[0].data[i];
                                //    valTend.Add(acumVal / (i + 1));
                                //}
                                var resultTendencia = result.series[0].data.Select((d, i) => new { valor = d, index = i + 1 }).ToList();
                                TendenciaLineal tendencia = new TendenciaLineal(resultTendencia.Select(r => Convert.ToSingle(r.index)).ToList(), resultTendencia.Select(r => r.valor).ToList());

                                List<float> valTend = new List<float>();
                                foreach (var item in resultTendencia)
                                {
                                    float valTendencia = tendencia.GetYValue(item.index);
                                    valTend.Add(valTendencia);
                                }

                                Series tend = new Series();
                                tend.name = "Tendencia Rendimiento";
                                tend.data = valTend;
                                result.series.Add(tend);
                            }
                            else
                                if (id == 10)
                                {
                                    //Añadir tendencia
                                    //List<float> valTend = new List<float>();
                                    //float acumVal = 0;
                                    //for (int i = 0; i < result.series[0].data.Count; i++)
                                    //{
                                    //    acumVal += result.series[0].data[i];
                                    //    valTend.Add(acumVal / (i + 1));
                                    //}
                                    var resultTendencia = result.series[0].data.Select((d, i) => new { valor = d, index = i + 1 }).ToList();
                                    TendenciaLineal tendencia = new TendenciaLineal(resultTendencia.Select(r => Convert.ToSingle(r.index)).ToList(), resultTendencia.Select(r => r.valor).ToList());

                                    List<float> valTend = new List<float>();
                                    foreach (var item in resultTendencia)
                                    {
                                        float valTendencia = tendencia.GetYValue(item.index);
                                        valTend.Add(valTendencia);
                                    }

                                    Series tend = new Series();
                                    tend.name = "Tendencia Disponibilidad";
                                    tend.data = valTend;
                                    result.series.Add(tend);

                                    //Eficiencia
                                    //valTend = new List<float>();
                                    //acumVal = 0;
                                    //for (int i = 0; i < result.series[1].data.Count; i++)
                                    //{
                                    //    acumVal += result.series[1].data[i];
                                    //    valTend.Add(acumVal / (i + 1));
                                    //}
                                    resultTendencia = result.series[1].data.Select((d, i) => new { valor = d, index = i + 1 }).ToList();
                                    tendencia = new TendenciaLineal(resultTendencia.Select(r => Convert.ToSingle(r.index)).ToList(), resultTendencia.Select(r => r.valor).ToList());

                                    valTend = new List<float>();
                                    foreach (var item in resultTendencia)
                                    {
                                        float valTendencia = tendencia.GetYValue(item.index);
                                        valTend.Add(valTendencia);
                                    }

                                    tend = new Series();
                                    tend.name = "Tendencia Eficiencia";
                                    tend.data = valTend;
                                    result.series.Add(tend);

                                    //OEE
                                    //valTend = new List<float>();
                                    //acumVal = 0;
                                    //for (int i = 0; i < result.series[2].data.Count; i++)
                                    //{
                                    //    acumVal += result.series[2].data[i];
                                    //    valTend.Add(acumVal / (i + 1));
                                    //}

                                    resultTendencia = result.series[2].data.Select((d, i) => new { valor = d, index = i + 1 }).ToList();
                                    tendencia = new TendenciaLineal(resultTendencia.Select(r => Convert.ToSingle(r.index)).ToList(), resultTendencia.Select(r => r.valor).ToList());

                                    valTend = new List<float>();
                                    foreach (var item in resultTendencia)
                                    {
                                        float valTendencia = tendencia.GetYValue(item.index);
                                        valTend.Add(valTendencia);
                                    }

                                    tend = new Series();
                                    tend.name = "Tendencia OEE";
                                    tend.data = valTend;
                                    result.series.Add(tend);
                                }
                                else
                                    if (id == 11)
                                    {
                                        //Añadir tendencia
                                        var resultTendencia = result.series[0].data.Select((d, i) => new { valor = d, index = i + 1 }).ToList();
                                        TendenciaLineal tendencia = new TendenciaLineal(resultTendencia.Select(r => Convert.ToSingle(r.index)).ToList(), resultTendencia.Select(r => r.valor).ToList());

                                        List<float> valTend = new List<float>();
                                        foreach (var item in resultTendencia)
                                        {
                                            float valTendencia = tendencia.GetYValue(item.index);
                                            valTend.Add(valTendencia);
                                        }


                                        Series tend = new Series();
                                        tend.name = "Tendencia Rendimiento";
                                        tend.data = valTend;
                                        result.series.Add(tend);
                                    }
                        }
                        else
                            if (tipo.Equals("mul"))
                            {
                                String serienombre = "";
                                List<float> valores = new List<float>();
                                List<Series> serie = new List<Series>();
                                List<String> nombres = new List<String>();
                                // string stackn = "";

                                while (dr.Read())
                                {
                                    if (!nombres.Exists(element => element.Equals(dr["categories"].ToString())))
                                    {
                                        nombres.Add(dr["categories"].ToString());
                                    }


                                    if (!serienombre.Equals(dr["seriesname"].ToString()) /*|| !stackn.Equals(dr["stack"].ToString())*/)
                                    {
                                        if (valores.Count > 0)
                                        {
                                            serie.Add(new Series { name = serienombre, data = valores/*, stack = stackn */});
                                        }

                                        serienombre = dr["seriesname"].ToString();
                                        //stackn = dr["stack"].ToString();

                                        valores = new List<float>();
                                    }
                                    valores.Add(float.Parse(dr["seriesdata"].ToString()));

                                }

                                serie.Add(new Series { name = serienombre, data = valores/*, stack = stackn*/ });

                                result.Fields = nombres;
                                result.series = serie;
                            }

                //if (dr.Read())
                //{
                //    for (int i = 0; i < dr.FieldCount; i++)
                //    {
                //        result.Fields.Add(dr.GetName(i));
                //        result.Types.Add(dr.GetDataTypeName(i));
                //    }
                //}
                //do
                //{
                //    Hashtable record = new Hashtable();
                //    foreach (string field in result.Fields)
                //    {
                //        record[field] = dr[field];
                //    }
                //    result.Records.Add(record);

                //} while (dr.Read());
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Query.ejecutarQuery", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Query.EjecutarQueryGrafico", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EJECUTANDO_QUERY"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return result;
        }


        //Lista de queries
        internal List<QueryGrafico> obtenerQueriesGraficos()
        {
            List<QueryGrafico> queries = new List<QueryGrafico>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerQueriesGraficos]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {

                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {

                    queries.Add(
                         new QueryGrafico()
                         {
                             id = DataHelper.GetInt(dr, "ID_QUERY"),
                             nombre = DataHelper.GetString(dr, "NOMBRE"),
                             texto = DataHelper.GetString(dr, "TEXTO"),
                             tipo = DataHelper.GetString(dr, "TIPO"),
                             seriesname = DataHelper.GetString(dr, "SERIESNAME"),
                             maxvalor = DataHelper.GetString(dr, "MAXVALOR"),
                             colores = DataHelper.GetString(dr, "COLORES").Split(',')
                         });

                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Query.obtenerQueries", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Query.obtenerQueriesGrafico", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_QUERIES"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return queries;
        }

        public Query obtenerQueryGrafico(int id)
        {

            Query query = null;
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerQueryGrafico]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@id", id);
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                if (dr.Read())
                {
                    query = new Query()
                    {
                        id = DataHelper.GetInt(dr, "ID_QUERY"),
                        nombre = DataHelper.GetString(dr, "NOMBRE"),
                        texto = DataHelper.GetString(dr, "TEXTO")
                    };
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Query.obtenerQueries", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Query.obtenerQueryGrafico", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_QUERY"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return query;
        }

    }
}