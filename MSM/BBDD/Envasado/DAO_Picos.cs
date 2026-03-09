using Common.Models.Operation;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Envasado;
using MSM.Utilidades;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_Picos
    {

        public List<Pico> ObtenerPicos(int idTurno)
        {
            List<Pico> picos = new List<Pico>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerPicos]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("turno", idTurno);
            
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();

                using (MESEntities contexto = new MESEntities())
                {
                    while (dr.Read())
                    {
                        var pico = new Pico();
                        pico.idPico = DataHelper.GetInt(dr, "IdPico");
                        pico.particion = DataHelper.GetString(dr, "IdParticion");
                        pico.turno = idTurno;
                        pico.cantidad = DataHelper.GetInt(dr, "Cantidad");
                        pico.codProducto = DataHelper.GetInt(dr, "IdProducto");
                        pico.descProducto = DataHelper.GetString(dr, "Descripcion");
                        pico.fechaTurno = DataHelper.GetDate(dr, "FechaTurno");
                        pico.idTipoTurno = DataHelper.GetInt(dr, "TipoTurno");
                        pico.OrdenEstadoActual = contexto.Particiones.AsNoTracking().Where(p => p.Id == pico.particion).Select(p => p.EstadoAct).First();
                        pico.SSCC = DataHelper.GetString(dr, "SSCC");

                        picos.Add(pico);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Picos.ObtenerPicos", "WEB-WO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PICOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return picos;
        }

        public List<Pico> ObtenerPicosOrdenParticion(string idOrdenParticion)
        {
            List<Pico> listaPicos = new List<Pico>();

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerPicosOrdenParticion]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@idOrdenParticion", idOrdenParticion);

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    var pico = new Pico();
                    pico.idPico = DataHelper.GetInt(dr, "IdPico");
                    pico.orden = DataHelper.GetString(dr, "IdOrden");
                    pico.particion = DataHelper.GetString(dr, "IdParticion");
                    pico.cantidad = DataHelper.GetInt(dr, "Cantidad");
                    pico.turno = DataHelper.GetInt(dr, "IdTurno");
                    pico.fechaTurno = DataHelper.GetDate(dr, "FechaTurno");
                    pico.idTipoTurno = DataHelper.GetInt(dr, "TipoTurno");
                    pico.SSCC = DataHelper.GetString(dr, "SSCC");

                    listaPicos.Add(pico);
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Picos.ObtenerPicosOrdenParticion", "WEB-WO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return listaPicos;
        }

        public static bool CrearPico(Pico pico)
        {
            using (MESEntities contexto = new MESEntities())
            {
                try
                {
                    PicosEnvasado tPico = new PicosEnvasado();
                    tPico.SSCC = "Creado manualmente";
                    tPico.SHC_WORK_SCHED_DAY_PK = pico.turno;
                    string idOrdenPadre = pico.particion.Substring(0, pico.particion.IndexOf("."));
                    tPico.IdOrden = idOrdenPadre;
                    tPico.IdParticion = pico.particion;
                    tPico.Cantidad = pico.cantidad;

                    contexto.PicosEnvasado.Add(tPico);
                    contexto.SaveChanges();
                    
                    return true;
                }
                catch 
                {
                    return false;
                }
            }
        }

        public static bool ModificarPico(Pico pico)
        {
            using (MESEntities contexto = new MESEntities())
            {
                try
                {
                    PicosEnvasado tPico = contexto.PicosEnvasado.FirstOrDefault(x => x.IdPico == pico.idPico);

                    if (tPico != null)
                    {
                        tPico.SHC_WORK_SCHED_DAY_PK = pico.turno;
                        string idOrdenPadre = pico.particion.Substring(0, pico.particion.IndexOf("."));
                        tPico.IdOrden = idOrdenPadre;
                        tPico.IdParticion = pico.particion;
                        tPico.Cantidad = pico.cantidad;
                        contexto.SaveChanges();

                        return true;
                    }

                    return false;
                }
                catch
                {
                    return false;
                }
            }
        }

        public static bool EliminarPico(int idPico)
        {
            using (MESEntities contexto = new MESEntities())
            {
                try
                {
                    PicosEnvasado tPico = contexto.PicosEnvasado.FirstOrDefault(x => x.IdPico == idPico);

                    if (tPico != null)
                    {
                        contexto.PicosEnvasado.Remove(tPico);
                        contexto.SaveChanges();

                        return true;
                    }

                    return false;
                }
                catch
                {
                    return false;
                }
            }
        }

        public static int ObtenerPicosCajasWO(string idParticion)
        {
            int picosCajas = 0;

            using (MESEntities contexto = new MESEntities())
            {
                try
                {
                    var picos = contexto.PicosEnvasado.AsNoTracking().Where(x => x.IdParticion == idParticion);
                    if (picos.Count() > 0)
                    {
                        picosCajas = picos.Sum(x => x.Cantidad);
                    }
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Picos.ObtenerPicosCajasWO", "WEB-WO", "Sistema");
                }
            }

            return picosCajas;
        }

        public static int ObtenerPicosPaletsWO(string idParticion)
        {
            int picosPalets = 0;

            using (MESEntities contexto = new MESEntities())
            {
                try
                {
                    var picos = contexto.PicosEnvasado.AsNoTracking().Where(x => x.IdParticion == idParticion);
                    if (picos.Count() > 0)
                    {
                        picosPalets = picos.Count();
                    }
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Picos.ObtenerPicosPaletsWO", "WEB-WO", "Sistema");
                }
            }

            return picosPalets;
        }

        public static bool ActualizarPicosEnvasado(List<ProduccionDto> producciones)
        {
            try
            {
                List<long> listaIdsProd = producciones.Where(x => x.Picos != null && x.ParticionWO != null).Select(x => x.IdProduccion).ToList();

                if (listaIdsProd.Count > 0)
                {
                    DataTable listaIds = Utils.MapeoLongListToDataTable(listaIdsProd);

                    using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                    {
                        using (var command = new SqlCommand("[MES_PicosEnvasado_Guardar]", connection))
                        {
                            command.CommandType = CommandType.StoredProcedure;
                            command.CommandTimeout = 120;

                            SqlParameter paramListaIds = command.Parameters.AddWithValue("@listaIds", listaIds);
                            paramListaIds.SqlDbType = SqlDbType.Structured;
                            paramListaIds.TypeName = "dbo.BigintList";

                            connection.Open();
                            command.ExecuteNonQuery();
                        }
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Picos.ActualizarPicosEnvasado", "WEB-WO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }
    }
}
