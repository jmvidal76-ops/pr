using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Mappers.Envasado;
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
    public class DAO_Sigi
    {
        public List<SIGI_Configuracion> ObtenerLineas()
        {
            using (MESEntities contexto = new MESEntities())
            {
                return contexto.SIGI_Configuracion.AsNoTracking().ToList();
            }
        }

        public List<SIGI_SecuenciacionMES> ObtenerDatosSecuenciacionMES(int idEtiquetaSIGI)
        {
            var lista = new List<SIGI_SecuenciacionMES>();
            var fecha = DateTime.UtcNow;

            using (MESEntities contexto = new MESEntities())
            {
                var configuracion = contexto.SIGI_Configuracion.AsNoTracking().Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).First();
                if (configuracion.ConPlanificacion) 
                { 
                    lista = contexto.SIGI_SecuenciacionMES.AsNoTracking().Where(x => x.IdLinea == configuracion.LineaMES).OrderBy(x => x.FechaInicioPlanificado).ToList();
                }
            }

            foreach (var item in lista)
            {
                item.FechaInicioPlanificado = item.FechaInicioPlanificado.ToLocalTime();
            }

            return lista;
        }

        public List<SIGI_SecuenciacionSIGI> ObtenerDatosSecuenciacionSIGI(int idEtiquetaSIGI)
        {
            using (MESEntities contexto = new MESEntities())
            {
                return contexto.SIGI_SecuenciacionSIGI.AsNoTracking().Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).OrderBy(x => x.Orden).ToList();
            }
        }

        public IEnumerable ObtenerProductosSecuenciacion(int idEtiquetaSIGI)
        {
            using (MESEntities contexto = new MESEntities())
            {
                var idLinea = contexto.SIGI_Configuracion.AsNoTracking().Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).First().LineaMES;

                var query = (from l in contexto.LineasProductos.AsNoTracking()
                             where l.IdLinea == idLinea
                             select new { l.IdProducto, Descripcion = l.IdProducto + " - " + l.Descripcion }).ToList();

                var lista = query.OrderBy(x => x.IdProducto);

                return lista;
            }
        }

        public IEnumerable ObtenerCajasSecuenciacion(int idEtiquetaSIGI)
        {
            using (MESEntities contexto = new MESEntities())
            {
                var idLinea = contexto.SIGI_Configuracion.AsNoTracking().Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).First().LineaMES;

                var query = (from l in contexto.LineasProductos.AsNoTracking()
                             join p in contexto.ProductosCajas.AsNoTracking() on l.IdProducto equals p.IdProducto
                             where l.IdLinea == idLinea
                             select new { p.IdCaja, Descripcion = p.IdCaja + " - " + p.DescripcionCaja }).Distinct().ToList();

                var lista = query.OrderBy(x => x.IdCaja);

                return lista;
            }
        }

        public bool GuardarProductoCaja(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.idLinea;
            string idProductoCaja = datos.idProductoCaja.ToString();
            string descripcion = datos.descripcion.ToString();
            int orden = (int)datos.orden;
            string idLinea = string.Empty;

            using (MESEntities contexto = new MESEntities())
            {
                try
                {
                    idLinea = contexto.SIGI_Configuracion.Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).First().LineaMES;

                    var secuenciacionSigi = new SIGI_SecuenciacionSIGI();
                    secuenciacionSigi.IdEtiquetaSIGI = idEtiquetaSIGI;
                    secuenciacionSigi.IdLinea = idLinea;
                    secuenciacionSigi.ProductoCaja = idProductoCaja;
                    secuenciacionSigi.Descripcion = descripcion;
                    secuenciacionSigi.Orden = orden;

                    contexto.SIGI_SecuenciacionSIGI.Add(secuenciacionSigi);
                    contexto.SaveChanges();

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Sigi.GuardarProductoCaja", "SIGI - ProductoCaja " + idProductoCaja + " - " + 
                        descripcion + " de la línea " + idLinea + ". " + IdiomaController.GetResourceName("GUARDADO_CORRECTAMENTE"), HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - Linea " + idLinea + " - " + ex.Message + " -> " + ex.StackTrace, "DAO_Sigi.GuardarProductoCaja", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public bool CambiarOrdenSIGI(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.idEtiquetaSIGI;
            int idOrigen = (int)datos.idOrigen;
            int ordenOrigen = (int)datos.ordenOrigen;
            int ordenDestino = (int)datos.ordenDestino;
            bool subeOrden = (bool)datos.subeOrden;
            var listaSecuenciacion = new List<SIGI_SecuenciacionSIGI>();

            using (MESEntities contexto = new MESEntities())
            {
                try
                {
                    if (subeOrden)
                    {
                        listaSecuenciacion = contexto.SIGI_SecuenciacionSIGI.Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI && x.Orden >= ordenDestino && x.Orden <= ordenOrigen).ToList();

                        foreach (var item in listaSecuenciacion)
                        {
                            item.Orden = item.Orden + 1;
                        }
                    }
                    else
                    {
                        listaSecuenciacion = contexto.SIGI_SecuenciacionSIGI.Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI && x.Orden <= ordenDestino && x.Orden >= ordenOrigen).ToList();

                        foreach (var item in listaSecuenciacion)
                        {
                            item.Orden = item.Orden - 1;
                        }
                    }

                    var secuenciacionSigiOrigen = contexto.SIGI_SecuenciacionSIGI.Where(x => x.Id == idOrigen).FirstOrDefault();

                    if (secuenciacionSigiOrigen != null)
                    {
                        secuenciacionSigiOrigen.Orden = ordenDestino;
                        contexto.SaveChanges();

                        return true;
                    }
                    else
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + IdiomaController.GetResourceName("ERROR_AL_MODIFICAR_LOS"), "DAO_Sigi.CambiarOrdenSIGI", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                        return false;
                    }
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + ex.Message + " -> " + ex.StackTrace, "DAO_Sigi.CambiarOrdenSIGI", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public bool ActivarSecuenciaAutoSIGI(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.idLinea;
            bool valor = (bool)datos.valor;
            string idLinea = string.Empty;

            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    idLinea = contexto.SIGI_Configuracion.AsNoTracking().Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).First().LineaMES;
                }

                using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("MES_SIGI_ActivarSecuenciaAuto", conn))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idEtiquetaSIGI", idEtiquetaSIGI);
                        command.Parameters.AddWithValue("@valor", valor);

                        conn.Open();
                        command.ExecuteNonQuery();
                    }
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Sigi.ActivarSecuenciaAutoSIGI", "SIGI - " + IdiomaController.GetResourceName("SECUENCIA_ACTIVA_SIGI") + 
                    (valor ? " Activada" : " Desactivada") + " en la línea " + idLinea, HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - Linea " + idLinea + " - " + ex.Message + " -> " + ex.StackTrace, "DAO_Sigi.ActivarSecuenciaAutoSIGI", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        public bool TransferirMES(dynamic datos)
        {
            int tipo = (int)datos.tipo;
            int idEtiquetaSIGI = (int)datos.idEtiquetaSIGI;
            bool esAutomatico = (bool)datos.esAutomatico;
            string idLinea = string.Empty;
            string mensaje = string.Empty;

            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    idLinea = contexto.SIGI_Configuracion.AsNoTracking().Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).First().LineaMES;
                }

                using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("MES_SIGI_EnviarPlanificacionMES", conn))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@tipo", tipo);
                        command.Parameters.AddWithValue("@idEtiquetaSIGI", idEtiquetaSIGI);
                        command.Parameters.AddWithValue("@esAutomatico", esAutomatico);

                        conn.Open();
                        command.ExecuteNonQuery();
                    }
                }

                if (tipo == 1)
                {
                    mensaje = " manual en la línea " + idLinea;
                }
                else 
                {
                    mensaje = " automática " + (esAutomatico ? "Activada" : "Desactivada") + " en la línea " + idLinea;
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Sigi.TransferirMES", "SIGI - " + IdiomaController.GetResourceName("TRANSFERIR_MES") + 
                    mensaje, HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - Linea " + idLinea + " - " + ex.Message + " -> " + ex.StackTrace, "DAO_Sigi.TransferirMES", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        public bool EliminarProductoCaja(SIGI_SecuenciacionSIGI datos)
        {
            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    var secuenciacion = contexto.SIGI_SecuenciacionSIGI.FirstOrDefault(x => x.Id == datos.Id);

                    if (secuenciacion != null)
                    {
                        contexto.SIGI_SecuenciacionSIGI.Remove(secuenciacion);

                        var lista = contexto.SIGI_SecuenciacionSIGI.Where(x => x.IdEtiquetaSIGI == secuenciacion.IdEtiquetaSIGI && x.Orden > secuenciacion.Orden).ToList();

                        foreach (var item in lista)
                        {
                            item.Orden = item.Orden - 1;
                        }

                        contexto.SaveChanges();
                        return true;
                    }
                    else return false;
                }
            }
            catch
            {
                return false;
            }
        }

        public SIGI_Configuracion ObtenerConfiguracion(int idEtiquetaSIGI)
        {
            using (MESEntities contexto = new MESEntities())
            {
                return contexto.SIGI_Configuracion.AsNoTracking().Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).First();
            }
        }

        public bool ObtenerSecuenciaActiva(int idEtiquetaSIGI)
        {
            int conMES = 0;
            try
            {
                using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("MES_SIGI_ObtenerSecuenciaActiva", conn))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idEtiquetaSIGI", idEtiquetaSIGI);

                        conn.Open();
                        var dr = command.ExecuteReader();

                        while (dr.Read())
                        {
                            conMES = DataHelper.GetInt(dr, "CONMES");
                        }
                    }
                }

                return conMES == 1;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + ex.Message + " -> " + ex.StackTrace, "DAO_Sigi.ObtenerSecuenciaActiva", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        public List<string> ObtenerInfoTrenes(int idEtiquetaSIGI)
        {
            List<string> info = new List<string>();

            try
            {
                using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("MES_SIGI_ObtenerInfoTrenes", conn))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idEtiquetaSIGI", idEtiquetaSIGI);

                        conn.Open();
                        var dr = command.ExecuteReader();

                        while (dr.Read())
                        {
                            info.Add(DataHelper.GetString(dr, "CODPALET"));
                            info.Add(DataHelper.GetString(dr, "FCONS"));
                        }
                    }
                }

                return info;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + ex.Message + " -> " + ex.StackTrace, "DAO_Sigi.ObtenerInfoTrenes", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return info;
            }
        }

        public bool FijarValorProduccionSimultanea(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.idEtiquetaSIGI;
            bool valor = (bool)datos.valor;
            SIGI_Configuracion configuracion = new SIGI_Configuracion();

            using (MESEntities contexto = new MESEntities())
            {
                try
                {
                    configuracion = contexto.SIGI_Configuracion.Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).First();
                    configuracion.ValorProdSimultanea = valor;

                    contexto.SaveChanges();

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Sigi.FijarValorProduccionSimultanea", "SIGI - " + IdiomaController.GetResourceName("ENVASAR_PROD_DIFERENTES") +
                        (valor ? " Activado" : " Desactivado") + " en la línea " + configuracion.LineaMES, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - Linea " + configuracion.LineaMES + " - IdEtiquetaSIGI " + idEtiquetaSIGI + " - " + ex.Message + " -> " + ex.StackTrace, "DAO_Sigi.FijarValorProduccionSimultanea", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public bool TransferirSIGI(dynamic datos)
        {
            int idEtiquetaSIGI = (int)datos.idEtiquetaSIGI;
            string idLinea = string.Empty;

            try
            {
                using (MESEntities contexto = new MESEntities())
                {
                    idLinea = contexto.SIGI_Configuracion.AsNoTracking().Where(x => x.IdEtiquetaSIGI == idEtiquetaSIGI).First().LineaMES;
                }

                using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("MES_SIGI_EnviarPlanificacionMESSIGI", conn))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@idEtiquetaSIGI", idEtiquetaSIGI);

                        conn.Open();
                        command.ExecuteNonQuery();
                    }
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Sigi.TransferirSIGI", "SIGI - " + IdiomaController.GetResourceName("TRANSFERIR_SIGI") +
                    " correcta en la línea " + idLinea, HttpContext.Current.User.Identity.Name);
                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - Linea " + idLinea + " - " + ex.Message + " -> " + ex.StackTrace, "DAO_Sigi.TransferirSIGI", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        public List<DTO_SIGIBloqueoPaletsParoLlenadora> ObtenerConfiguracionBloqueoPalets()
        {
            var listaBloqueos = new List<SIGI_BloqueoPaletsParoLlenadora>();
            var listaRegistros = new List<DTO_SIGIBloqueoPaletsParoLlenadora>();

            using (MESEntities contexto = new MESEntities())
            {
                listaBloqueos = contexto.SIGI_BloqueoPaletsParoLlenadora.AsNoTracking().ToList();

                foreach (var bloqueo in listaBloqueos)
                {
                    DTO_SIGIBloqueoPaletsParoLlenadora dto = Mapper_SIGIBloqueoPaletsParoLlenadora.MapperModelToDTO(bloqueo);
                    var configuracion = contexto.SIGI_Configuracion.AsNoTracking().FirstOrDefault(x => x.LineaMES == bloqueo.IdLinea);

                    // Por el caso especial de Granada
                    dto.LineaDescripcion = configuracion == null ? bloqueo.IdLinea : configuracion.DescripcionLinea;
                    
                    listaRegistros.Add(dto);
                }
            }

            return listaRegistros;
        }

        public bool EditarDatosBloqueoPalets(DTO_SIGIBloqueoPaletsParoLlenadora datosBloqueoPalets)
        {
            using (MESEntities contexto = new MESEntities())
            {
                try
                {
                    SIGI_BloqueoPaletsParoLlenadora bloqueoPaletsExistente = contexto.SIGI_BloqueoPaletsParoLlenadora.FirstOrDefault(t => t.IdBloqueo == datosBloqueoPalets.IdBloqueo);
                    if (bloqueoPaletsExistente != null)
                    {
                        bloqueoPaletsExistente.Habilitado = datosBloqueoPalets.Habilitado;
                        bloqueoPaletsExistente.DuracionParoMinutos = datosBloqueoPalets.DuracionParoMinutos;
                        bloqueoPaletsExistente.NumPalets = datosBloqueoPalets.NumPalets;
                        bloqueoPaletsExistente.DuracionLlenadoraEtiquetadoraMinutos = datosBloqueoPalets.DuracionLlenadoraEtiquetadoraMinutos;

                        contexto.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Sigi.EditarDatosBloqueoPalets", "SIGI - Linea " + datosBloqueoPalets.IdLinea + 
                        ". " + IdiomaController.GetResourceName("GUARDADO_CORRECTAMENTE"), HttpContext.Current.User.Identity.Name);

                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "SIGI - Linea " + datosBloqueoPalets.IdLinea + " - " + ex.Message + " -> " + 
                        ex.StackTrace, "DAO_Sigi.EditarDatosBloqueoPalets", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    
                    return false;
                }
            }
        }

        public bool HacerBloqueoSIGI(DTO_SIGIBloqueo datos, string idLinea)
        {
            // Definir la conexión
            using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                // Configurar el comando y el tipo de comando
                using (SqlCommand comando = new SqlCommand("[MES_SIGI_HacerBloqueoPaletas]", conexion))
                {
                    comando.CommandType = CommandType.StoredProcedure;

                    // Agregar los parámetros de entrada
                    comando.Parameters.AddWithValue("@idLinea", idLinea);
                    comando.Parameters.AddWithValue("@numPalets", datos.BLOQUEO_VAL_MES);
                    comando.Parameters.AddWithValue("@tiempoEvacuacion", datos.T_EVACUACION);                    

                    try
                    {
                        conexion.Open();

                        comando.ExecuteNonQuery();

                        return true;
                    }
                    catch (Exception ex)
                    {
                        // Registrar log en caso de excepción
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_AccionMejora.InsertarBloqueoSIGI", "WEB-ENVASADO", "Sistema");
                        throw new Exception(IdiomaController.GetResourceName("ERROR_INSERTANDO_BLOQUEO_SIGI"));
                    }
                }
            }
        }

    }
}