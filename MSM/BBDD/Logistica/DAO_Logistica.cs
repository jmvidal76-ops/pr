using Common.Models.RTDS;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Logistica;
using MSM.Mappers.Logistica;
using MSM.Models.Fabricacion;
using MSM.Models.Logistica;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Logistica
{

    public class DAO_Logistica
    {
        private const string RTDS = "RTDS";
        private const string CIP = "CIP";
        private const string DETENIDO = "DETENIDO";
        private const string LLENANDO = "LLENANDO";
        private const string LLEN_PORC = "LLEN_PORC";
        private const string MATRICULA = "MATRICULA";
        private const string SIN_OPER = "SIN_OPER";
        private const string T_OPER = "T_OPER";

        public static List<DuotankInfo> UltimosDatosDuotank;
        public static IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        #region PANTALLA DESLIZANTE

        public static List<DiasSemanaDeslizante> GetDiasSemana()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.DiasSemanaDeslizante.AsNoTracking().ToList();
            }
        }

        public static string ManageJobDeslizante()
        {
            try
            {
                using (var sqlConn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var cmd = new SqlCommand("[MES_JobDeslizante]", sqlConn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        sqlConn.Open();
                        cmd.ExecuteNonQuery();
                        return RESULTADO_OK;
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.ManageJobDeslizante", "WEB-LOGISTICA", "Sistema");
            }

            return RESULTADO_ERROR;
        }

        public static List<DeslizanteGeneral> GetParamGeneral()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.DeslizanteGeneral.AsNoTracking().ToList();
            }
        }

        public static string AddParamGeneral(dynamic item)
        {
            try
            {
                int semanas = Convert.ToInt32(item.Semanas);
                int idDia = Convert.ToInt32(item.IdDia.id);
                string dia = item.IdDia.dia.ToString();
                string hora = item.Hora.ToString();
                DateTime fecha = DateTime.Parse(hora);
                hora = fecha.ToLocalTime().ToString("HH:mm:ss");
                var result = RESULTADO_OK;

                using (MESEntities db = new MESEntities())
                {
                    var dato = db.DeslizanteGeneral.FirstOrDefault(x => x.IdDia == idDia);

                    if (dato == null) // No existe el parametro así que lo creamos
                    {
                        var datos = new DeslizanteGeneral();
                        datos.Semanas = semanas;
                        datos.IdDia = idDia;
                        datos.Hora = hora;
                        db.DeslizanteGeneral.Add(datos);

                        db.SaveChanges();
                    }
                    else
                    {
                        result = RESULTADO_PARAMETRO_EXISTENTE; // Ya existe el parámetro de configuración
                    }
                }

                if (result == RESULTADO_OK)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Logistica.AddParamGeneral", IdiomaController.GetResourceName("GUARDAR_PARAMETRO") +
                        ". Semanas: " + semanas + ", Día: " + dia + ", Hora: " + hora, HttpContext.Current.User.Identity.Name);
                    result = ManageJobDeslizante();
                }

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.AddParamGeneral", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                return RESULTADO_ERROR_PARAMETROS;
            }
        }

        public static string UpdateParamGeneral(dynamic item)
        {
            try
            {
                int id = Convert.ToInt32(item.Id);
                int semanas = Convert.ToInt32(item.Semanas);
                int idDia = Convert.ToInt32(item.IdDia);
                string hora = item.Hora.ToString();
                DateTime fecha = DateTime.Parse(hora);
                hora = fecha.ToLocalTime().ToString("HH:mm:ss");
                var result = RESULTADO_OK;

                using (MESEntities db = new MESEntities())
                {
                    var dato = db.DeslizanteGeneral.FirstOrDefault(x => x.IdDia == idDia);

                    if (dato == null) // No existe ningún parámetro para ese día así que podemos modificarlo
                    {
                        var datoExistente = db.DeslizanteGeneral.FirstOrDefault(x => x.Id == id);
                        datoExistente.Semanas = semanas;
                        datoExistente.IdDia = idDia;
                        datoExistente.Hora = hora;
                        db.SaveChanges();
                    }
                    else
                    {
                        result = RESULTADO_PARAMETRO_EXISTENTE; // Ya existe el parámetro de configuración
                    }
                }

                if (result == RESULTADO_OK)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Logistica.SetParamGeneral", IdiomaController.GetResourceName("MOD_PARAMETRO_OK") +
                        ". Semanas: " + semanas + ", Hora: " + hora, HttpContext.Current.User.Identity.Name);
                    result = ManageJobDeslizante();
                }

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetParamGeneral", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                return RESULTADO_ERROR_PARAMETROS;
            }
        }

        public static string DeleteParamGeneral(dynamic item)
        {
            try
            {
                int id = Convert.ToInt32(item.Id);

                using (MESEntities db = new MESEntities())
                {
                    var dato = db.DeslizanteGeneral.FirstOrDefault(x => x.Id == id);

                    if (dato != null)
                    {
                        db.DeslizanteGeneral.Remove(dato);
                        db.SaveChanges();
                    }
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Logistica.DeleteParamGeneral", IdiomaController.GetResourceName("TITLE_ELIMINAR_PARAMETRO"), HttpContext.Current.User.Identity.Name);
                
                return ManageJobDeslizante();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.DeleteParamGeneral", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                return RESULTADO_ERROR_PARAMETROS;
            }
        }

        public static List<DeslizanteFormatos> GetParamFormatos()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.DeslizanteFormatos.AsNoTracking().ToList();
            }
        }

        public static string AddParamFormato(dynamic item)
        {
            try
            {
                string formato = item[0].formato.ToString();

                using (MESEntities db = new MESEntities())
                {
                    var maxIdFormato = db.DeslizanteFormatos.Max(x => x.IdFormato);

                    var datos = new DeslizanteFormatos();
                    datos.IdFormato = maxIdFormato + 1;
                    datos.Descripcion = formato;
                    db.DeslizanteFormatos.Add(datos);

                    db.SaveChanges();
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Logistica.AddParamFormato", IdiomaController.GetResourceName("NEW_FORMATO_OK") + ": " + formato, HttpContext.Current.User.Identity.Name);
                
                return RESULTADO_OK;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.AddParamFormato", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                return RESULTADO_ERROR_PARAMETROS;
            }
        }

        public static string UpdateParamFormato(dynamic item)
        {
            try
            {
                int idFormato = Convert.ToInt32(item[0].idFormato);
                string formato = item[0].formato.ToString();

                var result = RESULTADO_OK;

                using (MESEntities db = new MESEntities())
                {
                    var desFormato = db.DeslizanteFormatos.FirstOrDefault(x => x.Descripcion == formato);

                    if (desFormato == null) // No existe ningún formato, así que podemos modificarlo
                    {
                        var datoExistente = db.DeslizanteFormatos.FirstOrDefault(x => x.IdFormato == idFormato);
                        datoExistente.Descripcion = formato;
                        db.SaveChanges();
                    }
                    else
                    {
                        result = RESULTADO_PARAMETRO_EXISTENTE; // Ya existe el formato
                    }
                }

                if (result == RESULTADO_OK)
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Logistica.UpdateParamFormato", IdiomaController.GetResourceName("NUEVO_FORMATO") + ": " + formato, HttpContext.Current.User.Identity.Name);
                }

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.UpdateParamFormato", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                return RESULTADO_ERROR_PARAMETROS;
            }
        }

        public static string DeleteParamFormato(dynamic item)
        {
            try
            {
                int idFormato = Convert.ToInt32(item[0].idFormato);
                string formato = item[0].formato.ToString();

                using (MESEntities db = new MESEntities())
                {
                    var desFormato = db.DeslizanteFormatos.FirstOrDefault(x => x.IdFormato == idFormato);

                    if (desFormato != null)
                    {
                        var productos = db.DeslizanteProductos.Where(x => x.IdFormato == idFormato);
                        foreach (var producto in productos) 
                        {
                            db.DeslizanteProductos.Remove(producto);
                        }

                        db.DeslizanteFormatos.Remove(desFormato);
                        db.SaveChanges();
                    }
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Logistica.DeleteParamFormato", IdiomaController.GetResourceName("TITLE_ELIMINAR_FORMATO") + ": " + formato, HttpContext.Current.User.Identity.Name);

                return RESULTADO_OK;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.DeleteParamFormato", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                return RESULTADO_ERROR_PARAMETROS;
            }
        }

        public static List<ProductoDeslizante> GetProductos()
        {
            List<ProductoDeslizante> relacion = new List<ProductoDeslizante>();

            using (MESEntities context = new MESEntities())
            {
                relacion = context.RelacionCodArticuloCodCaja.AsNoTracking().Where(g => !g.CodigoExpedicion.Contains("UE"))
                    .Select(g => new ProductoDeslizante()
                    {
                        defid = g.CodigoExpedicion,
                        descript = g.DescUnidadExpedicion,
                        item = g.IdTipoFormato
                    }).ToList();
            }

            // Ordenar primero numericamente y después alfabeticamente por defid
            relacion.Sort((a, b) =>
            {
                int nA, nB;

                if (int.TryParse(a.defid, out nA))
                {
                    if (int.TryParse(b.defid, out nB))
                    {
                        return nA - nB; // Ambos son enteros
                    }
                    else
                    {
                        return -1; // a es un entero y va antes que b por se un string
                    }
                }
                else if (int.TryParse(b.defid, out nB))
                {
                    return 1; // Si b es un entero, va antes que a por ser un string
                }

                return (string.Compare(a.defid, b.defid));
            });

            return relacion;
        }

        public static List<DeslizanteProductos> GetParamProductos()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.DeslizanteProductos.AsNoTracking().ToList();
            }
        }

        public static string AddParamProducto(dynamic item)
        {
            try
            {
                int idFormato = Convert.ToInt32(item[0].formatoId);
                string paleta = item[0].paleta.ToString();
                string descripcion = item[0].descripcion.ToString();
                string defId = item[0].defId.ToString();

                using (MESEntities db = new MESEntities())
                {
                    var datos = new DeslizanteProductos();
                    datos.IdFormato = idFormato;
                    datos.DefId = defId;
                    datos.Paleta = paleta;
                    datos.Descripcion = descripcion;
                    db.DeslizanteProductos.Add(datos);

                    db.SaveChanges();
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Logistica.AddParamProducto", IdiomaController.GetResourceName("NEW_PRODUCTO_OK") + 
                    ": " + paleta + " - " + descripcion, HttpContext.Current.User.Identity.Name);

                return RESULTADO_OK;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.AddParamProducto", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                return RESULTADO_ERROR_PARAMETROS;
            }
        }

        public static string DeleteParamProducto(dynamic item)
        {
            try
            {
                int id = Convert.ToInt32(item[0].id);
                DeslizanteProductos dato;

                using (MESEntities db = new MESEntities())
                {
                    dato = db.DeslizanteProductos.FirstOrDefault(x => x.Id == id);

                    if (dato != null)
                    {
                        db.DeslizanteProductos.Remove(dato);
                        db.SaveChanges();
                    }
                }

                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Logistica.DeleteParamProducto", IdiomaController.GetResourceName("TITLE_ELIMINAR_PRODUCTO") +
                    ": " + dato.Paleta + " - " + dato.Descripcion, HttpContext.Current.User.Identity.Name);

                return RESULTADO_OK;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.DeleteParamProducto", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                return RESULTADO_ERROR_PARAMETROS;
            }
        }

        public static List<InstantaneaDeslizante> GetInstantaneas(dynamic item)
        {
            String fechaInicio = ((dynamic)item)[0].fechaIni;
            String fechaFinal = ((dynamic)item)[0].fechaFin;

            DateTime fechaIni = DateTime.Parse(fechaInicio);    //hora inicial 00:00:00
            DateTime fechaFin = DateTime.Parse(fechaFinal);
            fechaFin = fechaFin.Date.AddHours(23).AddMinutes(59).AddSeconds(59);    //hora final 23:59:59

            var listIns = new List<InstantaneaDeslizante>();
            using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (var command = new SqlCommand("[MES_ObtenerDeslizanteInstantaneas]", conn))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@fechaIni", fechaIni);
                    command.Parameters.AddWithValue("@fechaFin", fechaFin);

                    using (var da = new SqlDataAdapter(command))
                    {
                        conn.Open();
                        var dt = new DataTable();
                        da.Fill(dt);

                        foreach (DataRow row in dt.Rows)
                        {
                            var ins = new InstantaneaDeslizante();

                            ins.id = row.Field<int>("id");
                            ins.fecha = row.Field<DateTime>("fecha");
                            ins.numAnyoInicial = row.Field<int>("numAnyoInicial");
                            ins.numSemanaInicial = row.Field<int>("numSemanaInicial");
                            ins.numAnyoFinal = row.Field<int>("numAnyoFinal");
                            ins.numSemanaFinal = row.Field<int>("numSemanaFinal");
                            ins.tipo = row.Field<string>("tipo");

                            listIns.Add(ins);
                        }
                    }
                }
            }

            return listIns;
        }

        public static bool SetInstantanea(dynamic item)
        {
            bool res = false;
            String accion = ((dynamic)item)[0].accion;

            switch (accion)
            {
                case "new":
                    try
                    {
                        string tipo = (string)(((dynamic)item)[0].tipo);
                        int numSemanas = (int)(((dynamic)item)[0].numSemanas);

                        using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                        {
                            using (var command = new SqlCommand("MES_DeslizanteTomarInstantanea", conn))
                            {
                                command.CommandType = CommandType.StoredProcedure;
                                command.Parameters.AddWithValue("@numSemanas", numSemanas);
                                command.Parameters.AddWithValue("@tipo", tipo);
                                
                                conn.Open();
                                command.ExecuteNonQuery();
                            }
                        }

                        res = true;
                    }
                    catch (Exception ex)
                    {
                        //DAO_Log.RegistrarLogBook(DateTime.Now, "DAO_Planificacion.InsertarInstantaneaDeslizante", ex, HttpContext.Current.User.Identity.Name);
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetInstantanea - NEW", "WEB-LOGISTICA", "Sistema");
                        throw new Exception(IdiomaController.GetResourceName("ERROR_REGISTRANDO_INSTANTANEA"));
                    }
                    break;
                case "delete":
                    try
                    {
                        var id = (int)(((dynamic)item)[0].id);
                        using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                        {
                            using (var command = new SqlCommand("[MES_EliminarDeslizanteInstantanea]", conn))
                            {
                                command.CommandType = CommandType.StoredProcedure;
                                command.Parameters.AddWithValue("@idIns", id);

                                conn.Open();
                                command.ExecuteNonQuery();
                            }
                        }

                        res = true;
                    }
                    catch (Exception ex)
                    {
                        //DAO_Log.RegistrarLogBook(DateTime.Now, "DAO_Planificacion.EliminarInstantaneaDeslizante", ex, HttpContext.Current.User.Identity.Name);
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetInstantanea - DELETE", "WEB-LOGISTICA", "Sistema");
                        throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_INSTANTANEA"));
                    }
                    break;
                default:
                    break;
            }

            return res;
        }

        public static List<DeslizanteCerveza> GetDeslizanteCerveza(List<int> semanas)
        {
            using (var contexto = new MESEntities())
            {
                return contexto.DeslizanteCerveza.AsNoTracking().Where(x => semanas.Contains(x.Semana)).ToList();
            }
        }

        public static List<DeslizanteEnvasado> GetDeslizanteEnvasado(List<int> semanas)
        {
            using (var contexto = new MESEntities())
            {
                return contexto.DeslizanteEnvasado.AsNoTracking().Where(x => semanas.Contains(x.Semana)).ToList();
            }
        }

        public static List<DeslizanteEnvasadoHl> GetDeslizanteEnvasadoHl(List<int> semanas)
        {
            using (var contexto = new MESEntities())
            {
                return contexto.DeslizanteEnvasadoHl.AsNoTracking().Where(x => semanas.Contains(x.Semana)).ToList();
            }
        }

        public static DatosInstantaneaDeslizante ShowInstantanea(dynamic item)
        {
            int idInstantanea = Convert.ToInt32(item.idIns.Value);
            int vista = Convert.ToInt32(item.vista.Value);

            var result = new DatosInstantaneaDeslizante();
            result.datos = new List<SemanaInstantaneaDeslizante>();

            using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                conn.Open();

                using (var command = new SqlCommand("MES_MostrarInstantaneaDeslizante", conn))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@idInstantanea", idInstantanea);
                    command.Parameters.AddWithValue("@vista", vista);
                    command.CommandTimeout = 120;
                    using (var reader = command.ExecuteReader())
                    {
                        // Leer primer DataSet con las fechas
                        if (reader.Read())
                        {
                            var res = result;
                            res.vista = vista;
                            res.fechaInicial = DataHelper.GetDate(reader, "fechaInicial");
                            res.numAnyoInicial = DataHelper.GetInt(reader, "numAnyoInicial");
                            res.numSemanaInicial = DataHelper.GetInt(reader, "numSemanaInicial");
                            res.fechaFinal = DataHelper.GetDate(reader, "fechaFinal");
                            res.numAnyoFinal = DataHelper.GetInt(reader, "numAnyoFinal");
                            res.numSemanaFinal = DataHelper.GetInt(reader, "numSemanaFinal");
                            result = res;
                        }
                        else
                        {
                            return null;
                        }

                        // Leer los datos en el siguiente DataSet
                        if (reader.NextResult())
                        {
                            var datos = result.datos;
                            while (reader.Read())
                            {
                                var fila = new SemanaInstantaneaDeslizante();
                                fila.Item = vista == 0 ? DataHelper.GetString(reader, "idCzaEnv") : DataHelper.GetString(reader, "idItem");
                                fila.Descripcion = DataHelper.GetString(reader, "descripcion");
                                fila.Anio = DataHelper.GetInt(reader, "anio");
                                fila.Semana = DataHelper.GetInt(reader, "semana");
                                fila.Cantidad = DataHelper.GetInt(reader, "cantidad");
                                fila.Linea = DataHelper.GetString(reader, "linea");
                                fila.Formato = DataHelper.GetString(reader, "formato");
                                fila.Paleta = DataHelper.GetString(reader, "idPaleta");
                                
                                datos.Add(fila);
                            }
                        }
                    }
                }
            }

            return result;
        }

        #endregion PANTALLA DESLIZANTE

        #region PANTALLA ADHERENCIA

        #region CODIGO COMUN
        private const string RESULTADO_OK = "0";
        private const string RESULTADO_SIN_CAMBIOS = "1";
        private const string RESULTADO_ERROR = "-1";
        private const string RESULTADO_ERROR_PARAMETROS = "-2";
        private const string RESULTADO_PARAMETRO_EXISTENTE = "-3";
        #endregion CODIGO COMUN

        #region CONFIGURACION MOTIVOS
        public static List<AdherenciaMotivos> GetMotivosAdherencia(bool verInactivos)
        {
            using (var contexto = new MESEntities())
            {
                return contexto.AdherenciaMotivos.AsNoTracking().Where(x => x.IdMotivo != "ZZ" && (verInactivos || x.Activo)).ToList(); //ZZ es el motivo Sin Justificar
            }
        }

        public static string SetMotivosAdherencia(dynamic item)
        {
            var resultado = string.Empty;

            string causa = ((dynamic)item)[0].causa;
            string motivo = ((dynamic)item)[0].motivo;
            string origen = ((dynamic)item)[0].origen;
            string descripcion = ((dynamic)item)[0].descripcion;
            string accion = ((dynamic)item)[0].accion;
            var activo = ((dynamic)item)[0].activo;

            switch (accion)
            {
                case "new":
                    try
                    {
                        using (var contexto = new MESEntities())
                        {
                            AdherenciaMotivos adhMotivo = contexto.AdherenciaMotivos.FirstOrDefault(x => x.IdMotivo == causa);
                            
                            if (adhMotivo != null) 
                            {
                                return RESULTADO_PARAMETRO_EXISTENTE; //Ya existe el motivo
                            }

                            // No existe el motivo así que lo creamos
                            adhMotivo = new AdherenciaMotivos();
                            adhMotivo.IdMotivo = causa;
                            adhMotivo.Motivo = motivo;
                            adhMotivo.Origen = origen;
                            adhMotivo.Descripcion = descripcion;
                            adhMotivo.Activo = true;

                            contexto.AdherenciaMotivos.Add(adhMotivo);
                            contexto.SaveChanges();
                        }

                        DAO_Log.logUsuario("Nuevo Motivo '{0}' creado, con nombre: {1} y origen: {2}", causa, motivo, origen);
                        resultado = RESULTADO_OK;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetMotivosAdherencia - NEW", "WEB-LOGISTICA", "Sistema");
                        resultado = RESULTADO_ERROR;
                    }

                    break;
                case "delete":
                    try
                    {
                        using (var contexto = new MESEntities())
                        {
                            AdherenciaMotivos adhMotivo = contexto.AdherenciaMotivos.FirstOrDefault(x => x.IdMotivo == causa);

                            if (adhMotivo != null)
                            {
                                adhMotivo.Activo = false;

                                contexto.SaveChanges();
                            }
                        }

                        DAO_Log.logUsuario("El Motivo '{0}' se ha desactivado correctamente", causa);
                        resultado = RESULTADO_OK;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetMotivosAdherencia - DELETE", "WEB-LOGISTICA", "Sistema");
                        resultado = RESULTADO_ERROR;
                    }
                    
                    break;
                case "edit":
                    try
                    {
                        using (var contexto = new MESEntities())
                        {
                            AdherenciaMotivos adhMotivo = contexto.AdherenciaMotivos.FirstOrDefault(x => x.IdMotivo == causa);

                            if (adhMotivo != null) //Si ya existe el motivo se actualizan los datos
                            {
                                adhMotivo.Motivo = motivo;
                                adhMotivo.Origen = origen;
                                adhMotivo.Descripcion = descripcion;
                                adhMotivo.Activo = activo;

                                contexto.SaveChanges();
                            }
                        }

                        DAO_Log.logUsuario("El Motivo '{0}' se ha modificado correctamente", causa);
                        resultado = RESULTADO_OK;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetMotivosAdherencia - EDIT", "WEB-LOGISTICA", "Sistema");
                        resultado = RESULTADO_ERROR;
                    }

                    break;
            }

            hub.Clients.All.notAdherenciaMotivos();

            return resultado;
        }
        #endregion CONFIGURACION MOTIVOS

        #region PARAMETROS
        public static string EditarParametrosAdherencia(dynamic item)
        {
            int id = ((dynamic)item)[0].Id;
            string valor = ((dynamic)item)[0].Valor;

            try
            {
                using (MESEntities db = new MESEntities())
                {
                    var parametro = db.AdherenciaParametros.Where(x => x.Id == id).First();

                    parametro.Valor = valor;
                    db.SaveChanges();

                    return IdiomaController.GetResourceName("MOD_PARAMETRO_OK");
                }
            }
            catch
            {
                return IdiomaController.GetResourceName("MOD_PARAMETRO_NOK");
            }
        }
        #endregion PARAMETROS

        #region VISTA ADHERENCIA VOLUMEN

        public static List<AdherenciaDesvVolumen> GetDesviacionVolumen(dynamic item)
        {
            if (item == null)
            {
                return new List<AdherenciaDesvVolumen>();
            }

            string vista = ((dynamic)item)[0].vista;
            string tipoComparacion = string.Empty;

            if (vista == "0")
            {
                tipoComparacion = "PLAN_INT";
            }
            else if (vista == "1")
            {
                tipoComparacion = "REAL";
            }
            else 
            {
                tipoComparacion = "PLAN_INI_REAL";
            }

            int anioIni = ((dynamic)item)[0].anioIni;
            int semanaIni = ((dynamic)item)[0].semanaIni;
            int anioFin = ((dynamic)item)[0].anioFin;
            int semanaFin = ((dynamic)item)[0].semanaFin;
            int esAdherente = ((dynamic)item)[0].esAdherente;

            var listaRegistros = new List<AdherenciaDesvVolumen>();
            
            try
            {
                using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_ObtenerDesviacionVolumenAdherencia]", conn))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@tipoComparacion", tipoComparacion);
                        command.Parameters.AddWithValue("@anioIni", anioIni);
                        command.Parameters.AddWithValue("@semanaIni", semanaIni);
                        command.Parameters.AddWithValue("@anioFin", anioFin);
                        command.Parameters.AddWithValue("@semanaFin", semanaFin);
                        command.Parameters.AddWithValue("@esAdherente", esAdherente);

                        conn.Open();
                        SqlDataReader dr = command.ExecuteReader();

                        while (dr.Read())
                        {
                            var adhDesVol = new AdherenciaDesvVolumen();

                            adhDesVol.Id = DataHelper.GetInt(dr, "Id");
                            adhDesVol.TipoComparacion = DataHelper.GetString(dr, "TipoComparacion"); 
                            adhDesVol.Anio = DataHelper.GetInt(dr, "Anio");
                            adhDesVol.Semana = DataHelper.GetInt(dr, "Semana");
                            var anio = adhDesVol.Anio.ToString();
                            adhDesVol.SemanaNombre = IdiomaController.GetResourceName("SEMANA") + " " + adhDesVol.Semana + "/" + anio.Substring(anio.Length - 2);
                            adhDesVol.Linea = DataHelper.GetString(dr, "Linea");

                            using (MESEntities contexto = new MESEntities())
                            {
                                adhDesVol.LineaDescripcion = contexto.DeslizanteLineas.Where(x => x.nombreLinea == adhDesVol.Linea).First().descripcion;
                            }

                            adhDesVol.Formato = DataHelper.GetString(dr, "Formato");
                            adhDesVol.IdPaleta = DataHelper.GetString(dr, "IdPaleta");
                            adhDesVol.ItemMD = DataHelper.GetString(dr, "ItemMD");
                            adhDesVol.Descripcion = DataHelper.GetString(dr, "Descripcion");
                            adhDesVol.CPBPlanificados = DataHelper.GetInt(dr, "CPBPlanificados");
                            adhDesVol.CPBReales = DataHelper.GetInt(dr, "CPBReales");
                            adhDesVol.HLPlanificados = DataHelper.GetDouble(dr, "HLPlanificados");
                            adhDesVol.HLReales = DataHelper.GetDouble(dr, "HLReales");
                            adhDesVol.Desviacion = DataHelper.GetDouble(dr, "Desviacion");
                            adhDesVol.IdMotivo = DataHelper.GetString(dr, "IdMotivo");
                            adhDesVol.Comentario = DataHelper.GetString(dr, "Comentario");
                            adhDesVol.FecModif = Convert.ToDateTime(dr["FecModif"].ToString());

                            listaRegistros.Add(adhDesVol);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.GetDesviacionVolumen", "WEB-LOGISTICA", "Sistema");
            }

            return listaRegistros;
        }

        public static string SetDesvVolumen(dynamic item)
        {
            List<int> listaIds = item[0].listaIds.ToObject<List<int>>();
            string accion = ((dynamic)item)[0].accion;
            string resultado = RESULTADO_SIN_CAMBIOS; // Sin cambios
            
            switch (accion)
            {
                case "delete":
                    try
                    {
                        using (var contexto = new MESEntities())
                        {
                            foreach (var id in listaIds)
                            {
                                AdherenciaDesviacionVolumen adhDesvVol = contexto.AdherenciaDesviacionVolumen.FirstOrDefault(x => x.Id == id);
                                contexto.AdherenciaDesviacionVolumen.Remove(adhDesvVol);
                            }
                            
                            contexto.SaveChanges();
                        }

                        DAO_Log.logUsuario(IdiomaController.GetResourceName("ELIMINAR_INADHERENCIA"));
                        resultado = RESULTADO_OK;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetDesvVolumen - DELETE", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                        resultado = RESULTADO_ERROR;
                    }
                    break;

                case "edit":
                    try
                    {
                        string causa = ((dynamic)item)[0].causa;
                        string comentario = ((dynamic)item)[0].comentario;

                        using (var contexto = new MESEntities())
                        {
                            foreach (var id in listaIds)
                            {
                                AdherenciaDesviacionVolumen adhDesvVol = contexto.AdherenciaDesviacionVolumen.FirstOrDefault(x => x.Id == id);
                                adhDesvVol.IdMotivo = causa;
                                adhDesvVol.Comentario = comentario;
                            }
                            
                            contexto.SaveChanges();
                        }

                        DAO_Log.logUsuario(IdiomaController.GetResourceName("EDITAR_INADHERENCIA") + ". Nuevo motivo: '{0}', comentario: '{1}'", causa, comentario);
                        resultado = RESULTADO_OK;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetDesvVolumen - EDIT", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                        resultado = RESULTADO_ERROR;
                    }
                    break;
            }

            return resultado;
        }

        public static List<AdherenciaParametros> ObtenerParametrosAdherenciaVolumen()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.AdherenciaParametros.AsNoTracking().Where(x => x.EsVolumen).ToList();
            }
        }

        #endregion VISTA ADHERENCIA VOLUMEN

        #region VISTA ADHERENCIA SECUENCIA

        public static List<DTO_AdherenciaDesviacionSecuencia> ObtenerDesviacionSecuencia(dynamic item)
        {
            if (item == null)
            {
                return new List<DTO_AdherenciaDesviacionSecuencia>();
            }

            string tipoComparacion = ((dynamic)item)[0].vista == "0" ? "PLAN" : "REAL";
            int anioIni = ((dynamic)item)[0].anioIni;
            int semanaIni = ((dynamic)item)[0].semanaIni;
            int anioFin = ((dynamic)item)[0].anioFin;
            int semanaFin = ((dynamic)item)[0].semanaFin;
            bool esAdherente = ((dynamic)item)[0].esAdherente;

            var listaDesviaciones = new List<AdherenciaDesviacionSecuencia>();
            var listaRegistros = new List<DTO_AdherenciaDesviacionSecuencia>();

            try
            {
                using (MESEntities context = new MESEntities())
                {
                    if (anioIni == anioFin)
                    {
                        listaDesviaciones = context.AdherenciaDesviacionSecuencia.AsNoTracking().Where(x => x.Anio == anioIni && x.Semana >= semanaIni &&
                            x.Semana <= semanaFin && x.TipoComparacion == tipoComparacion && (esAdherente ? x.PrimerProductoDesviado == "": x.PrimerProductoDesviado != "")).ToList();
                    }
                    else 
                    {
                        listaDesviaciones = context.AdherenciaDesviacionSecuencia.AsNoTracking().Where(x => ((x.Anio == anioIni && x.Semana >= semanaIni) ||
                            (x.Anio == anioFin && x.Semana <= semanaFin)) && x.TipoComparacion == tipoComparacion && (esAdherente ? x.PrimerProductoDesviado == "" : x.PrimerProductoDesviado != "")).ToList();
                    }

                    foreach (var desviacion in listaDesviaciones)
                    {
                        var linea = context.Lineas.AsNoTracking().Where(x => x.Id == desviacion.Linea).First();
                        DTO_AdherenciaDesviacionSecuencia dto = new DTO_AdherenciaDesviacionSecuencia();
                        dto.SemanaNombre = IdiomaController.GetResourceName("SEMANA") + " " + desviacion.Semana + "/" + desviacion.Anio.ToString().Substring(desviacion.Anio.ToString().Length - 2);                        
                        dto.LineaDescripcion = linea.NumeroLineaDescripcion + " - " + linea.Descripcion;
                        dto.AdherenciaDesviacionSecuencia = desviacion;

                        listaRegistros.Add(dto);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.ObtenerDesviacionSecuencia", "WEB-LOGISTICA", "Sistema");
            }

            return listaRegistros;
        }

        public static string SetDesviacionSecuencia(dynamic item)
        {
            List<int> listaIds = item[0].listaIds.ToObject<List<int>>();
            string accion = ((dynamic)item)[0].accion;
            string resultado = RESULTADO_SIN_CAMBIOS; // Sin cambios

            switch (accion)
            {
                case "delete":
                    try
                    {
                        using (var contexto = new MESEntities())
                        {
                            foreach (var id in listaIds)
                            {
                                AdherenciaDesviacionSecuencia adhDesvSec = contexto.AdherenciaDesviacionSecuencia.FirstOrDefault(x => x.Id == id);
                                contexto.AdherenciaDesviacionSecuencia.Remove(adhDesvSec);
                            }

                            contexto.SaveChanges();
                        }

                        DAO_Log.logUsuario(IdiomaController.GetResourceName("ELIMINAR_INADHERENCIA"));
                        resultado = RESULTADO_OK;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetDesviacionSecuencia - DELETE", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                        resultado = RESULTADO_ERROR;
                    }
                    break;

                case "edit":
                    try
                    {
                        string causa = ((dynamic)item)[0].causa;
                        string comentario = ((dynamic)item)[0].comentario;

                        using (var contexto = new MESEntities())
                        {
                            foreach (var id in listaIds)
                            {
                                AdherenciaDesviacionSecuencia adhDesvSec = contexto.AdherenciaDesviacionSecuencia.FirstOrDefault(x => x.Id == id);
                                adhDesvSec.IdMotivo = causa;
                                adhDesvSec.Comentario = comentario;
                            }

                            contexto.SaveChanges();
                        }

                        DAO_Log.logUsuario(IdiomaController.GetResourceName("EDITAR_INADHERENCIA") + ". Nuevo motivo: '{0}', comentario: '{1}'", causa, comentario);
                        resultado = RESULTADO_OK;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetDesviacionSecuencia - EDIT", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                        resultado = RESULTADO_ERROR;
                    }
                    break;
            }

            return resultado;
        }

        public static List<AdherenciaParametros> ObtenerParametrosAdherenciaSecuencia()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.AdherenciaParametros.AsNoTracking().Where(x => !x.EsVolumen).ToList();
            }
        }

        #endregion VISTA ADHERENCIA SECUENCIA

        #region VISTA ADHERENCIA CONGELADO

        public static List<DTO_AdherenciaDesviacionCongelado> ObtenerDesviacionCongelado(dynamic item)
        {
            if (item == null)
            {
                return new List<DTO_AdherenciaDesviacionCongelado>();
            }

            int anioIni = ((dynamic)item)[0].anioIni;
            int semanaIni = ((dynamic)item)[0].semanaIni;
            int anioFin = ((dynamic)item)[0].anioFin;
            int semanaFin = ((dynamic)item)[0].semanaFin;
            bool esAdherente = ((dynamic)item)[0].esAdherente;

            var listaDesviaciones = new List<AdherenciaDesviacionCongelado>();
            var listaRegistros = new List<DTO_AdherenciaDesviacionCongelado>();

            try
            {
                using (MESEntities context = new MESEntities())
                {
                    if (anioIni == anioFin)
                    {
                        listaDesviaciones = context.AdherenciaDesviacionCongelado.AsNoTracking().Where(x => x.Anio == anioIni && x.Semana >= semanaIni && x.Semana <= semanaFin && 
                            (esAdherente ? (x.DesvIni <= x.DesviacionObjetivo && x.DesvFin <= x.DesviacionObjetivo) : (x.DesvIni > x.DesviacionObjetivo || x.DesvFin > x.DesviacionObjetivo))).ToList();
                    }
                    else
                    {
                        listaDesviaciones = context.AdherenciaDesviacionCongelado.AsNoTracking().Where(x => ((x.Anio == anioIni && x.Semana >= semanaIni) || (x.Anio == anioFin && x.Semana <= semanaFin)) &&
                            (esAdherente ? (x.DesvIni <= x.DesviacionObjetivo && x.DesvFin <= x.DesviacionObjetivo) : (x.DesvIni > x.DesviacionObjetivo || x.DesvFin > x.DesviacionObjetivo))).ToList();
                    }

                    foreach (var desviacion in listaDesviaciones)
                    {
                        DTO_AdherenciaDesviacionCongelado dto = new DTO_AdherenciaDesviacionCongelado();
                        dto.SemanaNombre = IdiomaController.GetResourceName("SEMANA") + " " + desviacion.Semana + "/" + desviacion.Anio.ToString().Substring(desviacion.Anio.ToString().Length - 2);
                        dto.LineaDescripcion = context.DeslizanteLineas.AsNoTracking().Where(x => x.nombreLinea == desviacion.Linea).First().descripcion;
                        dto.AdherenciaDesviacionCongelado = desviacion;

                        listaRegistros.Add(dto);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.ObtenerDesviacionCongelado", "WEB-LOGISTICA", "Sistema");
            }

            return listaRegistros;
        }

        public static string SetDesviacionCongelado(dynamic item)
        {
            List<int> listaIds = item[0].listaIds.ToObject<List<int>>();
            string accion = ((dynamic)item)[0].accion;
            string resultado = RESULTADO_SIN_CAMBIOS; // Sin cambios

            switch (accion)
            {
                case "delete":
                    try
                    {
                        using (var contexto = new MESEntities())
                        {
                            foreach (var id in listaIds)
                            {
                                AdherenciaDesviacionCongelado adhDesvCong = contexto.AdherenciaDesviacionCongelado.FirstOrDefault(x => x.Id == id);
                                contexto.AdherenciaDesviacionCongelado.Remove(adhDesvCong);
                            }

                            contexto.SaveChanges();
                        }

                        DAO_Log.logUsuario(IdiomaController.GetResourceName("ELIMINAR_INADHERENCIA"));
                        resultado = RESULTADO_OK;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetDesviacionCongelado - DELETE", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                        resultado = RESULTADO_ERROR;
                    }
                    break;
                case "edit":
                    try
                    {
                        string causa = ((dynamic)item)[0].causa;
                        string comentario = ((dynamic)item)[0].comentario;

                        using (var contexto = new MESEntities())
                        {
                            foreach (var id in listaIds)
                            {
                                AdherenciaDesviacionCongelado adhDesvCong = contexto.AdherenciaDesviacionCongelado.FirstOrDefault(x => x.Id == id);
                                adhDesvCong.IdMotivo = causa;
                                adhDesvCong.Comentario = comentario;
                            }

                            contexto.SaveChanges();
                        }

                        DAO_Log.logUsuario(IdiomaController.GetResourceName("EDITAR_INADHERENCIA") + ". Nuevo motivo: '{0}', comentario: '{1}'", causa, comentario);
                        resultado = RESULTADO_OK;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.SetDesviacionCongelado - EDIT", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                        resultado = RESULTADO_ERROR;
                    }
                    break;
            }

            return resultado;
        }

        public static List<AdherenciaParametros> ObtenerParametrosAdherenciaCongelado()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.AdherenciaParametros.AsNoTracking().Where(x => x.EsCongelado).OrderByDescending(x => x.Id).ToList();
            }
        }

        #endregion VISTA ADHERENCIA CONGELADO

        #endregion PANTALLA ADHERENCIA

        #region PANTALLA CONTROL STOCK Y MERMAS
        public List<DTO_MermasStockVacio> ObtenerMermasStockVacio()
        {
            List<DTO_MermasStockVacio> lista = new List<DTO_MermasStockVacio>();

            try
            {
                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_ObtenerMermasStockVacio]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        connection.Open();
                        SqlDataReader dr = command.ExecuteReader();

                        while (dr.Read())
                        {
                            var dtoMermasStockVacio = new DTO_MermasStockVacio();

                            var mermas = new MermasStockVacio();
                            mermas.Linea = DataHelper.GetString(dr, "Linea");
                            mermas.Producto = DataHelper.GetString(dr, "Producto");
                            mermas.Merma = DataHelper.GetDecimal(dr, "Merma");

                            string formatoComun = string.IsNullOrEmpty(dr["CodigoFormatoComun"].ToString()) ? string.Empty :
                                string.Format("{0} - {1}", dr["CodigoFormatoComun"].ToString(), dr["DescripcionFormatoComun"].ToString());

                            dtoMermasStockVacio.MermasStockVacio = mermas;
                            dtoMermasStockVacio.DescripcionLinea = DataHelper.GetString(dr, "DescripcionLinea");
                            dtoMermasStockVacio.FormatoComun = formatoComun;
                            dtoMermasStockVacio.DescripcionProducto = DataHelper.GetString(dr, "DescripcionProducto");

                            lista.Add(dtoMermasStockVacio);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.ObtenerMermasStockVacio", "WEB-LOGISTICA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MERMAS_STOCK_VACIO"));
            }

            return lista;
        }

        public bool GuardarMerma(MermasStockVacio merma)
        {
            try
            {
                using (MESEntities db = new MESEntities())
                {
                    var mermaStockVacio = db.MermasStockVacio.Where(x => x.Linea == merma.Linea && x.Producto == merma.Producto).First();

                    mermaStockVacio.Merma = merma.Merma;
                    db.SaveChanges();

                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public List<DTO_MovimientosVacio> ObtenerMovimientosVacio(DateTime fechaInicio, DateTime fechaFin)
        {
            List<DTO_MovimientosVacio> lista = new List<DTO_MovimientosVacio>();

            try
            {
                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_ObtenerMovimientosVacio]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@fechaInicio", fechaInicio);
                        command.Parameters.AddWithValue("@fechaFin", fechaFin.AddDays(1));

                        connection.Open();
                        SqlDataReader dr = command.ExecuteReader();

                        while (dr.Read())
                        {
                            var dtoMovimientosVacio = new DTO_MovimientosVacio();

                            var movimientos = new MovimientosVacio();
                            movimientos.Id = DataHelper.GetLong(dr, "Id");
                            movimientos.IdMovimiento = DataHelper.GetString(dr, "IdMovimiento");
                            movimientos.FechaMovimiento = DataHelper.GetDate(dr, "FechaMovimiento");
                            movimientos.IdCaja = DataHelper.GetString(dr, "IdCaja");
                            movimientos.IdOrden = DataHelper.GetString(dr, "IdOrden");
                            movimientos.StockInicial = DataHelper.GetInt(dr, "StockInicial");
                            movimientos.CantidadMovimiento = DataHelper.GetInt(dr, "CantidadMovimiento");
                            movimientos.StockFinal = DataHelper.GetInt(dr, "StockFinal");

                            dtoMovimientosVacio.MovimientosVacio = movimientos;
                            dtoMovimientosVacio.DescripcionMovimiento = DataHelper.GetString(dr, "DescripcionMovimiento");
                            dtoMovimientosVacio.DescripcionCaja = DataHelper.GetString(dr, "DescripcionCaja");

                            lista.Add(dtoMovimientosVacio);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.ObtenerMovimientosVacio", "WEB-LOGISTICA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MOVIMIENTOS_VACIO"));
            }

            return lista;
        }

        public IEnumerable ObtenerCajas()
        {
            IEnumerable lista = null;

            try
            {
                using (MESEntities context = new MESEntities())
                {
                    //lista = db.ProductosCajas.Select(x => new { x.IdCaja, x.DescripcionCaja }).Distinct().ToList();
                    
                    var query = (from m in context.MovimientosVacio.AsNoTracking()
                                 join p in context.ProductosCajas.AsNoTracking() on m.IdCaja equals p.IdCaja into cajas
                                 from mp in cajas.DefaultIfEmpty()
                                 select new { m.IdCaja, DescripcionCaja = mp.DescripcionCaja ?? string.Empty }).Distinct().ToList();

                    lista = query.OrderBy(x => x.IdCaja);
                    
                    return lista;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.ObtenerCajas", "WEB-LOGISTICA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CAJAS"));
            }
        }

        public IEnumerable ObtenerWOConsumoCajaVacia()
        {
            IEnumerable listaWO = null;
            DateTime fecha = DateTime.Now.AddDays(-15);

            try
            {
                using (MESEntities db = new MESEntities())
                {
                    listaWO = db.Ordenes.AsNoTracking().Where(x => x.FecFinReal > fecha && (x.EstadoAct == "Finalizada" || x.EstadoAct == "Cerrada")).Select(x => new { x.IdProducto, x.Id }).ToList();
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.ObtenerWOConsumoCajaVacia", "WEB-LOGISTICA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LISTADO"));
            }

            return listaWO;
        }

        public bool GuardarAjusteManual(string idCaja, int cantidad)
        {
            try
            {
                using (MESEntities db = new MESEntities())
                {
                    var movimientoVacio = new MovimientosVacio();
                    movimientoVacio.IdMovimiento = "AM";
                    movimientoVacio.FechaMovimiento = DateTime.Now;
                    movimientoVacio.IdCaja = idCaja;
                    movimientoVacio.IdOrden = "Ajuste Manual";
                    movimientoVacio.LineaOrden = 0;
                    movimientoVacio.StockInicial = cantidad;
                    movimientoVacio.CantidadMovimiento = cantidad;
                    movimientoVacio.StockFinal = cantidad;

                    db.MovimientosVacio.Add(movimientoVacio);
                    db.SaveChanges();

                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public bool GuardarConsumoCajaVacia(string wo, string idCaja, int cantidad)
        {
            try
            {
                using (MESEntities db = new MESEntities())
                {
                    var orden = db.Ordenes.Where(x => x.Id == wo).FirstOrDefault();
                    DateTime fecha = orden == null ? DateTime.Now : orden.FecFinReal.Value;

                    var movimientoVacio = new MovimientosVacio();
                    movimientoVacio.IdMovimiento = "COV";
                    movimientoVacio.FechaMovimiento = fecha;
                    movimientoVacio.IdCaja = idCaja;
                    movimientoVacio.IdOrden = wo;
                    movimientoVacio.LineaOrden = 0;
                    movimientoVacio.StockInicial = 0;
                    movimientoVacio.CantidadMovimiento = cantidad;
                    movimientoVacio.StockFinal = 0;

                    db.MovimientosVacio.Add(movimientoVacio);
                    db.SaveChanges();

                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public bool RecalcularStock()
        {
            try
            {
                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_RecalcularStock]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        connection.Open();
                        command.ExecuteNonQuery();

                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.RecalcularStock", "WEB-LOGISTICA", "Sistema");
                return false;
            }
        }

        public static List<StockVacioParametros> ObtenerParametrosStockVacio()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.StockVacioParametros.AsNoTracking().ToList();
            }
        }

        public static string EditarParametrosStockVacio(dynamic item)
        {
            int id = ((dynamic)item)[0].Id;
            string valor = ((dynamic)item)[0].Valor;

            try
            {
                using (MESEntities db = new MESEntities())
                {
                    var parametro = db.StockVacioParametros.Where(x => x.Id == id).First();

                    parametro.Valor = valor;
                    db.SaveChanges();

                    return IdiomaController.GetResourceName("MOD_PARAMETRO_OK");
                }
            }
            catch
            {
                return IdiomaController.GetResourceName("MOD_PARAMETRO_NOK");
            }
        }

        public static int ObtenerStockFinal(string idCaja)
        {
            using (MESEntities context = new MESEntities())
            {
                return context.MovimientosVacio.AsNoTracking().Where(m => m.IdCaja == idCaja).OrderByDescending(m => m.Id).First().StockFinal;
            }
        }

        public List<StockVacioMinimosMaximos> ObtenerMinimosMaximosStock()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.StockVacioMinimosMaximos.AsNoTracking().OrderBy(m => m.CodigoCaja).ToList();
            }
        }

        public int GuardarMinimosMaximosStock(dynamic datos)
        {
            try
            {
                var correctos = 0;
                using (MESEntities db = new MESEntities())
                {
                    foreach (var dato in datos)
                    {
                        string codigoCaja = dato.CodigoCaja.ToString();
                        string descripcionCaja = dato.DescripcionCaja.ToString();
                        int minimo = Convert.ToInt32(dato.Minimo.Value);
                        int maximo = Convert.ToInt32(dato.Maximo.Value);

                        var stockVacioMinMax = db.StockVacioMinimosMaximos.Where(x => x.CodigoCaja == codigoCaja).FirstOrDefault();

                        if (stockVacioMinMax != null)
                        {
                            stockVacioMinMax.DescripcionCaja = descripcionCaja;
                            stockVacioMinMax.Minimo = minimo;
                            stockVacioMinMax.Maximo = maximo;
                            
                            db.SaveChanges();

                            correctos++;
                        }
                    }

                    return correctos;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int GuardarImportarStock(dynamic datos)
        {
            try
            {
                var correctos = 0;
                using (MESEntities db = new MESEntities())
                {
                    foreach (var dato in datos)
                    {
                        string codigoCaja = dato.CodigoCaja.ToString();
                        int cantidad = Convert.ToInt32(dato.Cantidad.Value);

                        var movimientoVacio = new MovimientosVacio();
                        movimientoVacio.IdMovimiento = "AM";
                        movimientoVacio.FechaMovimiento = DateTime.Now;
                        movimientoVacio.IdCaja = codigoCaja;
                        movimientoVacio.IdOrden = "Ajuste Manual";
                        movimientoVacio.LineaOrden = 0;
                        movimientoVacio.StockInicial = cantidad;
                        movimientoVacio.CantidadMovimiento = cantidad;
                        movimientoVacio.StockFinal = cantidad;

                        db.MovimientosVacio.Add(movimientoVacio);
                        db.SaveChanges();
                        correctos++;
                    }

                    return correctos;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #endregion

        #region PANTALLA PREVISION STOCK
        public static List<PrevisionStockVacio> ObtenerPrevisionStock(DateTime fechaInicio, DateTime fechaFin)
        {
            var listaPrevisiones = new List<PrevisionStockVacio>();

            using (MESEntities context = new MESEntities())
            {
                var datos = context.StockVacioPrevision.AsNoTracking().Where(x => x.Fecha >= fechaInicio && x.Fecha <= fechaFin && x.TipoApunte == "STK").OrderBy(x => x.Fecha).ToList();

                foreach (var dato in datos)
                {
                    var prevision = new PrevisionStockVacio();
                    prevision.Id = dato.Id;
                    prevision.Fecha = dato.Fecha.ToString("yyyy-MM-dd");
                    prevision.CodigoCaja = dato.CodigoCaja;
                    prevision.DescripcionCaja = dato.DescripcionCaja;
                    prevision.TipoApunte = dato.TipoApunte;
                    prevision.Cantidad = dato.Cantidad;
                    prevision.Minimo = context.StockVacioMinimosMaximos.AsNoTracking().Where(m => m.CodigoCaja == dato.CodigoCaja).Select(m => m.Minimo).First();
                    prevision.Maximo = context.StockVacioMinimosMaximos.AsNoTracking().Where(m => m.CodigoCaja == dato.CodigoCaja).Select(m => m.Maximo).First();

                    listaPrevisiones.Add(prevision);
                }
            }

            return listaPrevisiones;
        }

        public bool RecalcularPrevisionStock()
        {
            try
            {
                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_RecalcularPrevisionStock]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180;
                        connection.Open();
                        command.ExecuteNonQuery();

                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.RecalcularPrevisionStock", "WEB-LOGISTICA", "Sistema");
                return false;
            }
        }

        #endregion

        #region PANTALLA DUOTANK

        public static List<DuotankMatriculas> ObtenerDuotankMatriculas()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.DuotankMatriculas.AsNoTracking().ToList();
            }
        }

        private static string ObtenerMatriculaPorId(int id)
        {
            var matricula = string.Empty;

            if (id == 0) return matricula;

            using (MESEntities context = new MESEntities())
            {
                matricula = context.DuotankMatriculas.AsNoTracking().Where(x => x.Id == id).Select(x => x.Nombre).FirstOrDefault();
            }

            return matricula ?? (IdiomaController.GetResourceName("INDETERMINADA") + " con código PLC: " + id);
        }

        private static List<DuotankZonasCarga> ObtenerDuotankZonasCarga()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.DuotankZonasCarga.AsNoTracking().ToList();
            }
        }

        public static async Task<List<DuotankInfo>> ObtenerDuotankDatos()
        {
            var lista = new List<DuotankInfo>();

            RTDSValuesDto rtdsValues = new RTDSValuesDto()
            {
                Tags = new List<string>(),
                TagsValues = new List<object>(),
                Unit = RTDS
            };

            DAO_Tags daoTags = new DAO_Tags();

            var zonasCarga = ObtenerDuotankZonasCarga();

            foreach (var zona in zonasCarga)
            {
                rtdsValues.Tags.Add(zona.Nombre + "_" + CIP);
                rtdsValues.Tags.Add(zona.Nombre + "_" + DETENIDO);
                rtdsValues.Tags.Add(zona.Nombre + "_" + LLENANDO);
                rtdsValues.Tags.Add(zona.Nombre + "_" + LLEN_PORC);
                rtdsValues.Tags.Add(zona.Nombre + "_" + MATRICULA);
                rtdsValues.Tags.Add(zona.Nombre + "_" + SIN_OPER);
                rtdsValues.Tags.Add(zona.Nombre + "_" + T_OPER);

                object values = await daoTags.readRTDS(rtdsValues);
                var duotankInfo = new DuotankInfo();

                foreach (var tag in values as IEnumerable)
                {
                    duotankInfo.ZonaCarga = zona;
                    var nombre = ((dynamic)tag).name.ToString().ToUpper();
                    string nombreTag = nombre.Substring(nombre.IndexOf('_') + 1);

                    switch (nombreTag)
                    {
                        case CIP:
                            duotankInfo.CIP = Convert.ToBoolean(((dynamic)tag).value);
                            break;
                        case DETENIDO:
                            duotankInfo.Detenido = Convert.ToBoolean(((dynamic)tag).value);
                            break;
                        case LLENANDO:
                            duotankInfo.Llenando = Convert.ToBoolean(((dynamic)tag).value);
                            break;
                        case LLEN_PORC:
                            duotankInfo.PorcentajeLlenado = Convert.ToDecimal(((dynamic)tag).value);
                            break;
                        case MATRICULA:
                            duotankInfo.Matricula = ObtenerMatriculaPorId(Convert.ToInt32(((dynamic)tag).value));
                            break;
                        case SIN_OPER:
                            duotankInfo.SinOperacion = Convert.ToBoolean(((dynamic)tag).value);
                            break;
                        default:
                            duotankInfo.TiempoOperacion = TimeSpan.FromSeconds(Convert.ToInt32(((dynamic)tag).value)).ToString(@"hh\:mm\:ss");
                            break;
                    }
                }

                lista.Add(duotankInfo);
            }

            return lista;
        }

        public static List<DuotankInfo> ObtenerDuotankSimulado()
        {
            var lista = new List<DuotankInfo>();
            string query = "SELECT * FROM dbo.DuotankSimulacion";// GROUP BY IdZona ORDER BY Id DESC

            using (MESEntities context = new MESEntities())
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                var duotankInfo = new DuotankInfo();
                                int idZona = Convert.ToInt32(row["IdZona"]);
                                duotankInfo.ZonaCarga = context.DuotankZonasCarga.Where(x => x.Id == idZona).First();
                                duotankInfo.CIP = Convert.ToBoolean(row["CIP"]);
                                duotankInfo.Detenido = Convert.ToBoolean(row["Detenido"]);
                                duotankInfo.Llenando = Convert.ToBoolean(row["Llenando"]);
                                duotankInfo.PorcentajeLlenado = Convert.ToDecimal(row["Porcentaje"]);
                                duotankInfo.Matricula = row["Matricula"].ToString();
                                duotankInfo.SinOperacion = Convert.ToBoolean(row["SinOperacion"]);
                                duotankInfo.TiempoOperacion = row["TiempoOperacion"].ToString();

                                lista.Add(duotankInfo);
                            }
                        }
                    }
                }
            }

            return lista;
        }

        public static List<DTO_DuotankHistorico> ObtenerDuotankHistorico(DateTime fechaDesde, DateTime fechaHasta)
        {
            List<DTO_DuotankHistorico> listaDatos = new List<DTO_DuotankHistorico>();
            List<DuotankHistorico> listaDuotankHistorico = new List<DuotankHistorico>();

            using (MESEntities context = new MESEntities())
            {
                listaDuotankHistorico = context.DuotankHistorico.AsNoTracking().Where(x => x.FechaInicio >= fechaDesde && x.FechaFin <= fechaHasta).ToList();

                foreach (var dato in listaDuotankHistorico)
                {
                    var nombreZona = context.DuotankZonasCarga.AsNoTracking().Where(x => x.Id == dato.IdZona).Select(x => x.Nombre + " " + x.Descripcion).First();

                    DTO_DuotankHistorico dto = new DTO_DuotankHistorico();
                    dto.IdDuotankHistorico = dato.IdDuotankHistorico;
                    dto.Zona = nombreZona;
                    dto.FechaInicio = dato.FechaInicio?.ToLocalTime();
                    dto.FechaFin = dato.FechaFin?.ToLocalTime();
                    dto.Matricula = dato.Matricula;
                    dto.Operacion = dato.Operacion;
                    dto.Porcentaje = dato.Porcentaje;

                    listaDatos.Add(dto);
                }
            }

            return listaDatos;
        }

        public static List<DuotankInfo> ObtenerUltimosDatosDuotankHistorico()
        {
            var lista = new List<DuotankInfo>();
            var ultimosDatos = new List<DuotankHistorico>();

            using (MESEntities context = new MESEntities())
            {
                ultimosDatos = context.DuotankHistorico.AsNoTracking().GroupBy(x => x.IdZona).Select(g => g.OrderByDescending(x => x.IdDuotankHistorico).FirstOrDefault()).ToList();

                foreach (var dato in ultimosDatos)
                {
                    var duotankInfo = new DuotankInfo();
                    duotankInfo.ZonaCarga = context.DuotankZonasCarga.Where(x => x.Id == dato.IdZona).First();
                    duotankInfo.CIP = dato.Operacion.Contains(IdiomaController.GetResourceName("CIP"));
                    duotankInfo.Detenido = dato.Operacion.Contains(IdiomaController.GetResourceName("DETENIDO"));
                    duotankInfo.Llenando = dato.Operacion.Contains(IdiomaController.GetResourceName("LLENANDO"));
                    duotankInfo.PorcentajeLlenado = dato.Porcentaje.Value;
                    duotankInfo.Matricula = dato.Matricula;
                    duotankInfo.SinOperacion = dato.Operacion == IdiomaController.GetResourceName("SIN_OPERACION");
                    duotankInfo.TiempoOperacion = string.Empty;

                    lista.Add(duotankInfo);
                }
            }

            return lista;
        }

        public static bool ActualizarFechaFinDuotankHistorico(int idZona)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var duotankHistorico = context.DuotankHistorico.Where(x => x.IdZona == idZona).OrderByDescending(x => x.IdDuotankHistorico).First();

                    duotankHistorico.FechaFin = DateTime.UtcNow;
                    context.SaveChanges();

                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public static bool GuardarDuotankHistorico(int idZona, string matricula, string operacion, decimal porcentaje)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var duotankHistorico = new DuotankHistorico();
                    duotankHistorico.IdZona = idZona;
                    duotankHistorico.FechaInicio = DateTime.UtcNow;
                    duotankHistorico.Matricula = matricula;
                    duotankHistorico.Operacion = operacion;
                    duotankHistorico.Porcentaje = porcentaje;

                    context.DuotankHistorico.Add(duotankHistorico);
                    context.SaveChanges();

                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region PANTALLA OEE PLANIFICACION
        public static List<DTO_OEEPlanificaciones> ObtenerDatosOEEPlanificaciones()
        {
            var lista = new List<vt_OEEPlanificaciones>();

            using (MESEntities context = new MESEntities())
            {
                lista = context.vt_OEEPlanificaciones.AsNoTracking().Select(x => x).OrderBy(o => o.NumeroLinea).ThenBy(o => o.IdProducto).ToList();
            }

            return lista.Select(o => Mapper_OEEPlanificaciones.Mapper_vt_OEEPlanificaciones_To_DTO(o)).ToList();
        }

        public static int EjecutarJobActualizarOEEPlanificaciones()
        {
            try
            {
                int result = 0;
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_EjecutarJobActualizarOEEPlanificaciones]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 60;

                        connection.Open();
                        result = command.ExecuteNonQuery();
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.EjecutarJobActualizarOEEPlanificaciones", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_EJECUTANDO_JOB_SINCRONIZACION_JDE") + ": " + ex.Message + ".&lt;br&gt;");
            }
        }

        public static bool EditarOEEPlanificaciones(List<DTO_OEEPlanificaciones> data)
        {
            try
            {
                long[] ids = data.Select(o => o.IdOEEPlanificaciones).ToArray();
                var oeePlanData = data.FirstOrDefault();

                using (MESEntities db = new MESEntities())
                {
                    var result = db.OEEPlanificaciones.Where(o => ids.Contains(o.IdOEEPlanificaciones)).ToList();
                    if (result != null && result.Count > 0)
                    {
                        result.ForEach(o =>
                        {
                            o.InhabilitarCalculoAC = oeePlanData.InhabilitarCalculoAC;
                            o.AjusteOEE = oeePlanData.AjusteOEE;
                            o.InhabilitarCalculoOEE = oeePlanData.InhabilitarCalculoOEE;
                            o.MediaAC = oeePlanData.MediaAC != null ? oeePlanData.MediaAC : o.MediaAC;
                            o.OEEPlanificado = (oeePlanData.OEEPlanificado != null ? (double)oeePlanData.OEEPlanificado : o.OEEPlanificado);
                        });

                        db.SaveChanges();
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.EditarOEEPlanificaciones", "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);
                return false;
                throw new Exception(IdiomaController.GetResourceName("ERROR_EJECUTANDO_JOB_SINCRONIZACION_JDE") + ": " + ex.Message + ".&lt;br&gt;");
            }
        }

        public static List<DTO_OEEPlanificacionConfig> ObtenerConfiguracionOEEPlanificacion()
        {
            List<DTO_OEEPlanificacionConfig> listaDatos = new List<DTO_OEEPlanificacionConfig>();

            using (MESEntities context = new MESEntities())
            {
                var configuraciones = context.OEEPlanificacionConfig.AsNoTracking().ToList();

                foreach (var configuracion in configuraciones)
                {
                    var linea = context.Lineas.AsNoTracking().Where(x => x.Id == configuracion.IdLinea).First();

                    DTO_OEEPlanificacionConfig dto = new DTO_OEEPlanificacionConfig();
                    dto.IdOEEPlanificacionConfig = configuracion.IdOEEPlanificacionConfig;
                    dto.IdLinea = configuracion.IdLinea;
                    dto.Descripcion = configuracion.Descripcion;
                    dto.Valor = configuracion.Valor;
                    dto.Unidad = configuracion.Unidad;
                    dto.Linea = IdiomaController.GetResourceName("LINEA") + " " + linea.NumeroLineaDescripcion + " - " + linea.Descripcion;

                    listaDatos.Add(dto);
                }
            }

            return listaDatos;
        }

        public static bool EditarValorDesviacion(DTO_OEEPlanificacionConfig datosOEEConfig)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    OEEPlanificacionConfig OEEConfigExistente = context.OEEPlanificacionConfig.FirstOrDefault(x => x.IdOEEPlanificacionConfig == datosOEEConfig.IdOEEPlanificacionConfig);
                    if (OEEConfigExistente != null)
                    {
                        OEEConfigExistente.Valor = datosOEEConfig.Valor;

                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Logistica.EditarValorDesviacion", "Valor: " + datosOEEConfig.Valor +
                        ". " + IdiomaController.GetResourceName("GUARDADO_CORRECTAMENTE"), HttpContext.Current.User.Identity.Name);

                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Logistica.EditarValorDesviacion", 
                        "WEB-LOGISTICA", HttpContext.Current.User.Identity.Name);

                    return false;
                }
            }
        }

        #endregion
    }
}