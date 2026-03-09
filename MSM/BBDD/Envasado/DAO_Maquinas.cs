using Common.Models.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Models.Envasado;
using MSM.RealTime;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace MSM.BBDD.Envasado
{
    public class DAO_Maquinas
    {
        
        public List<MaquinasEnvasado> ObtenerMaquinasLinea(string linea)
        {
            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    return contexto.MaquinasEnvasado.AsNoTracking().Where(m => m.LineaAsociada == linea && m.Activo).OrderByDescending(m => m.NumeroJustificaciones).ThenBy(m => m.Descripcion).ToList();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<EquiposConstructivosEnvasado> ObtenerEquiposConstructivosMaquina(string codigoMaquina)
        {
            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    return contexto.EquiposConstructivosEnvasado.AsNoTracking().Where(e => e.CodigoMaquina == codigoMaquina && e.Activo).OrderByDescending(e => e.NumeroJustificaciones).ThenBy(e => e.Descripcion).ToList();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<DescripcionAverias> ObtenerAveriasEquipoConstructivo(string codigoEquipo)
        {
            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    return contexto.DescripcionAverias.AsNoTracking().Where(a => a.CodigoEquipo == codigoEquipo && a.Activo).OrderByDescending(a => a.NumeroJustificaciones).ThenBy(a => a.Descripcion).ToList();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<DTO_EstadoMaquina> obtenerEstadoHistoricoMaquinas(string idLinea, string idMaquina, DateTime desde, DateTime hasta)
        {
            List<DTO_EstadoMaquina> estados = new List<DTO_EstadoMaquina>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerEstadoHistoricoMaquinas]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@idMaquina", idMaquina);
            comando.Parameters.AddWithValue("@desde", desde);
            comando.Parameters.AddWithValue("@hasta", hasta);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    estados.Add(new DTO_EstadoMaquina()
                    {
                        fechaInicio = DataHelper.GetDate(dr, "FecInicio"),
                        fechaFin = DataHelper.GetDate(dr, "FecFin"),
                        idLinea = DataHelper.GetString(dr, "Linea"),
                        idZona = DataHelper.GetString(dr, "Zona"),
                        idMaquina = DataHelper.GetString(dr, "IdMaquina"),
                        estado = (DTO_EstadoMaquina.Estados)DataHelper.GetShort(dr, "Estado")
                    });
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Maquinas.obtenerEstadoHistoricoMaquinas", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Maquinas.obtenerEstadoHistoricoMaquinas", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_HISTORICO"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return estados;
        }

        public static List<HistoricoMaquina> ObtenerHistoricoMaquinas(dynamic datos)
        {
            var fechaFinReal = (DateTime)datos.fechaFinReal;
            fechaFinReal = (fechaFinReal.Year == 1) ? DateTime.Now.ToUniversalTime() : fechaFinReal;
            var fechaInicio = fechaFinReal.AddDays(-7);
            var lista = new List<HistoricoMaquina>();

            using (MESEntities contexto = new MESEntities())
            {
                var listaHistorico = contexto.HistoricoMaquinas.AsNoTracking().Where(m => m.FechaCambio >= fechaInicio && m.FechaCambio <= fechaFinReal).OrderByDescending(m => m.FechaCambio).ToList();

                foreach (var historico in listaHistorico)
                {
                    HistoricoMaquina historicoMaquina = new HistoricoMaquina();
                    historicoMaquina.HistoricoMaquinas = historico;
                    historicoMaquina.HistoricoMaquinas.FechaCambio = historico.FechaCambio.ToLocalTime();
                    historicoMaquina.MaquinaDescripcion = contexto.Maquinas.AsNoTracking().Where(m => m.Nombre == historico.Maquina).Select(m => m.Descripcion).First();
                    historicoMaquina.NumeroLineaDescripcion = contexto.Lineas.AsNoTracking().Where(m => m.Id == historico.Linea).Select(m => m.NumeroLineaDescripcion).First();

                    lista.Add(historicoMaquina);
                }
            }

            return lista;
        }

        public void RegistrarHistoricoMaquinas(List<ConfiguracionMaquinasCompartidas> valuesOld, List<ConfiguracionMaquinasCompartidas> listaMaquinas)//, string lineaArranque)
        {
            DateTime fechaCambio = DateTime.Now.ToUniversalTime();

            foreach (var maquinaOld in valuesOld)
            {
                var maqSel = listaMaquinas.Find(m => m.Maquina == maquinaOld.Maquina);
                
                if (maqSel != null)
                {
                    //Si ha cambiado el estado lo registramos en el histórico
                    if (maquinaOld.Activa != maqSel.Activa)
                    {
                        if (maqSel.Activa)
                        {
                            var historicoMaquinas = new HistoricoMaquinas();
                            historicoMaquinas.FechaCambio = fechaCambio;
                            //historicoMaquinas.Activa = maqSel.Activa;
                            historicoMaquinas.Maquina = maqSel.Maquina;
                            historicoMaquinas.Linea = maqSel.Linea;

                            using (MESEntities contexto = new MESEntities())
                            {
                                contexto.HistoricoMaquinas.Add(historicoMaquinas);
                                contexto.SaveChanges();
                            }
                        }
                    }
                }
            }
        }

        public int ObtenerContadorProduccionWO(string idMaquina)
        {
            int contadorWO = 0;

            using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand comando = new SqlCommand("[MES_ObtenerContadorProduccionWO]", conexion))
                {
                    comando.CommandType = CommandType.StoredProcedure;
                    comando.Parameters.AddWithValue("@idMaquina", idMaquina);
                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Int);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    comando.Parameters.Add(returnParam);

                    try
                    {
                        conexion.Open();
                        comando.ExecuteNonQuery();
                        contadorWO = Convert.ToInt32(returnParam.Value);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Maquinas.ObtenerContadorProduccionWO", "WEB-ENVASADO", "Sistema");
                        throw ex;
                    }
                }
            }

            return contadorWO;
        }

        public List<Maquinas> ObtenerMaquinasLineaCompleto(string linea, List<TipoEnumMaquinasClases> clases)
        {
            try
            {
                List<string> sClases = clases.Select(c => c.ToString()).ToList();
                using (MESEntities contexto = new MESEntities())
                {
                    return contexto.Maquinas.AsNoTracking().Where(m => m.Linea == linea && sClases.Contains(m.Clase)).OrderByDescending(m => m.Descripcion).ToList();
                }
            }
            catch (Exception ex)
            {
                string mensajeError = ex.InnerException == null ? ex.Message : ex.InnerException.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, mensajeError + " -> " + ex.StackTrace, "DAO_Maquinas.ObtenerMaquinasLineaCompleto", "WEB-ENVASADO", "Sistema");

                return null;
            }
        }
    }
}