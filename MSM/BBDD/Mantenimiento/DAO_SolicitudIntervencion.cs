using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MSM.BBDD.Planta;
using System.Data.SqlClient;
using System.Configuration;
using System.Data;
using MSM.BBDD.Model;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Mantenimiento;
using Microsoft.AspNet.Identity;
using MSM.Models.Planta;
using Microsoft.AspNet.Identity.EntityFramework;
using MSM.Models.Envasado;
using MSM.Mappers.Mantenimiento;
using MSM.Models.Mantenimiento;
using Common.Models.Mantenimiento;
using Common.Models.Envasado;
using MSM.Mappers.Envasado;
using MSM.Controllers.Envasado;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace MSM.BBDD.Mantenimiento
{
    public class DAO_SolicitudIntervencion : IDAO_SolicitudMantenimiento
    {

        private List<DTO_SolicitudIntervencion> ObtenerSolicitudesQuery(Expression<Func<MantenimientoIntervenciones, bool>> predicate)
        {
            var lista = new List<DTO_SolicitudIntervencion>();
            //Obtenemos los datos de los usuarios
            UserManager<Usuario> gestorUsuarios = new UserManager<Usuario>(new UserStore<Usuario>(new ApplicationDbContext()));
            List<Usuario> usuarios = gestorUsuarios.Users.ToList();

            using (MESEntities context = new MESEntities())
            {
                var resultados = context.MantenimientoIntervenciones.AsNoTracking()
                    .Where(predicate)
                    // El GroupJoin junto con SelectMany simula un Left Join
                    .GroupJoin(
                        context.MaquinasEnvasado.AsNoTracking(),
                        i => new { linea = i.Linea, maquina = i.Maquina },
                        m => new { linea = m.LineaAsociada, maquina = m.CodigoMaquina },
                        (i, m) => new
                        {
                            intervencion = i,
                            maquinas = m
                        })
                    .SelectMany(
                        x => x.maquinas.DefaultIfEmpty(),
                        (x, maquina) => new { x.intervencion, maquina }
                    )
                    .GroupJoin(
                        context.MantenimientoEstados.AsNoTracking(),
                        x => x.intervencion.Estado,
                        estado => estado.CodigoEstado,
                        (x, estado) => new { x.intervencion, x.maquina, estado }
                    )
                    .SelectMany(
                        x => x.estado.DefaultIfEmpty(),
                        (x, estado) => new
                        {
                            x.intervencion,
                            estado,
                            x.maquina,
                            equipoEnvasado = x.intervencion.EquiposConstructivosEnvasado,
                            averia = x.intervencion.TipoAveria,
                            areaFab = x.intervencion.MaestroAreasFabricacion,
                            zonaFab = x.intervencion.MaestroZonasFabricacion,
                            equipoFab = x.intervencion.MaestroEquiposFabricacion,
                            grupoConstructivoFab = x.intervencion.MaestroGruposConstructivosFabricacion,
                            repuestoFab = x.intervencion.MaestroRepuestosFabricacion
                        }
                    )
                    .OrderByDescending(o => o.intervencion.FechaCreacion)
                    .ToList();

                foreach (var item in resultados)
                {
                    item.intervencion.EquiposConstructivosEnvasado = item.equipoEnvasado;
                    item.intervencion.TipoAveria = item.averia;
                    item.intervencion.MaestroAreasFabricacion = item.areaFab;
                    item.intervencion.MaestroZonasFabricacion = item.zonaFab;
                    item.intervencion.MaestroEquiposFabricacion = item.equipoFab;
                    item.intervencion.MaestroGruposConstructivosFabricacion = item.grupoConstructivoFab;
                    item.intervencion.MaestroRepuestosFabricacion = item.repuestoFab;

                    lista.Add(Mapper_MantenimientoIntervencion.Mapper_MantenimientoIntervencion_toDTO_Usuario(item.intervencion, item.maquina?.Descripcion, item.estado?.NombreEstado, usuarios.Find(u => u.Id.Equals(item.intervencion.Usuario))));
                }
            }

            return lista;
        }

        public List<DTO_SolicitudIntervencion> ObtenerSolicitudesIntervencionTerminal(string linea)
        {
            try
            {
                string EstadoCerrada = TipoEnumEstadosSolicitudMantenimiento.Cerrada.GetString();

                return ObtenerSolicitudesQuery(w => w.Linea == linea && w.Estado != EstadoCerrada && !w.CerradoEnJDE && w.EsEnvasado);
             
            }
            catch(Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerSolicitudesIntervencionTerminal", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                return null;
            }
        }

        public List<DTO_SolicitudIntervencion> ObtenerSolicitudesIntervencion(DateTime startDate, DateTime endDate, bool esEnvasado)
        {
            try
            {
                return ObtenerSolicitudesQuery(w => w.FechaCreacion >= startDate && w.FechaCreacion < endDate && w.EsEnvasado == esEnvasado);
                
            } 
            catch(Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerSolicitudesIntervencionTerminal", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                return null;
            }
        }

        public List<DTO_CambioEstadoMantenimiento> ObtenerCambiosEstadoMantenimiento(DateTime startDate, DateTime endDate, bool esEnvasado)
        {
            try
            {
                var lista = new List<DTO_CambioEstadoMantenimiento>();

                using (MESEntities context = new MESEntities())
                {
                    // Obtenemos las OTs de mantenimiento que entran en el rango de fechas
                    var listaOTs = context.MantenimientoIntervenciones.AsNoTracking()
                        .Where(e => e.FechaCreacion >= startDate && e.FechaCreacion < endDate && e.EsEnvasado == esEnvasado)
                        .OrderBy(e => e.OT)
                        .Select(e => e.OT)
                        .Distinct().ToList();

                    lista = context.MantenimientoCambiosEstados.AsNoTracking()
                        .Where(e => listaOTs.Contains(e.OT))
                        .Join(context.MantenimientoEstados.AsNoTracking(), a => a.Estado, b => b.CodigoEstado, (a, b) => new { cambioEstado = a, estado = b })
                        .OrderBy(e => e.cambioEstado.OT).ThenBy(e => e.cambioEstado.FechaInicio)
                        .AsEnumerable()
                        .Select(e => Mapper_MantenimientoIntervencion.Mapper_MantenimientoCambioEstado_toDTO_Estado(e.cambioEstado, e.estado.NombreEstado)).ToList();
                }

                return lista;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerCambiosEstadoMantenimiento", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                return null;
            }
        }

        public bool CrearSolicitudIntervencion(DTO_SolicitudIntervencion solicitud, out int nuevoCodigo)
        {
            nuevoCodigo = 0;
            int resultado = 0;

            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_GuardarIntervencionMantenimiento]", connection))
                    {
                        comando.Parameters.Add(new SqlParameter("@Linea", solicitud.Linea));
                        comando.Parameters.Add(new SqlParameter("@Maquina", solicitud.Maquina));
                        comando.Parameters.Add(new SqlParameter("@EquipoConstructivo", solicitud.EquipoConstructivo));
                        comando.Parameters.Add(new SqlParameter("@AreaFabricacion", solicitud.AreaFabricacion));
                        comando.Parameters.Add(new SqlParameter("@ZonaFabricacion", solicitud.ZonaFabricacion));
                        comando.Parameters.Add(new SqlParameter("@EquipoFabricacion", solicitud.EquipoFabricacion));
                        comando.Parameters.Add(new SqlParameter("@GrupoConstructivoFabricacion", solicitud.GrupoConstructivoFabricacion));
                        comando.Parameters.Add(new SqlParameter("@RepuestoFabricacion", solicitud.RepuestoFabricacion));
                        comando.Parameters.Add(new SqlParameter("@TipoAveria", solicitud.IdTipoAveria));
                        comando.Parameters.Add(new SqlParameter("@DescripcionAveria", solicitud.DescripcionAveria));
                        comando.Parameters.Add(new SqlParameter("@DescripcionProblema", solicitud.DescripcionProblema));
                        comando.Parameters.Add(new SqlParameter("@Usuario", solicitud.Usuario.Id));
                        comando.Parameters.Add(new SqlParameter("@EsEnvasado", solicitud.EsEnvasado));
                        var nuevoCodigoParam = new SqlParameter("@NUEVO_CODIGO", SqlDbType.Int);
                        nuevoCodigoParam.Direction = ParameterDirection.Output;
                        comando.Parameters.Add(nuevoCodigoParam);

                        var resultadoParam = new SqlParameter("@RESULTADO", DBNull.Value);
                        resultadoParam.Direction = ParameterDirection.ReturnValue;
                        comando.Parameters.Add(resultadoParam);

                        comando.CommandType = CommandType.StoredProcedure;
                        connection.Open();
                        comando.ExecuteNonQuery();

                        resultado = Convert.ToInt32(comando.Parameters["@RESULTADO"].Value);
                        if (resultado == 0) 
                        {
                            // Operacion correcta
                            nuevoCodigo = Convert.ToInt32(comando.Parameters["@NUEVO_CODIGO"].Value);
                            return true;
                        }
                        else if (resultado == 1)
                        {
                            // Se ha creado la OT, pero el equipo no existe en JDE
                            nuevoCodigo = Convert.ToInt32(comando.Parameters["@NUEVO_CODIGO"].Value);                            
                            return false;
                        }
                        
                        // Error en la operación
                        
                        throw new Exception("Error creando la solicitud de mantenimiento ("+resultado.ToString()+")");
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_GUARDAR_SOLICITUD_MANTENIMIENTO") + ": " + ex.Message + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.CrearSolicitudIntervencion", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                throw new Exception("Error creando la solicitud de mantenimiento (" + resultado.ToString() + ")");
            }
        }

        public bool EditarSolicitudIntervencion(DTO_SolicitudIntervencion solicitud)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_ActualizarIntervencionMantenimiento]", connection))
                    {
                        comando.Parameters.Add(new SqlParameter("@ID", solicitud.Id));
                        comando.Parameters.Add(new SqlParameter("@Linea", solicitud.Linea));
                        comando.Parameters.Add(new SqlParameter("@Maquina", solicitud.Maquina));
                        comando.Parameters.Add(new SqlParameter("@EquipoConstructivo", solicitud.EquipoConstructivo));
                        comando.Parameters.Add(new SqlParameter("@AreaFabricacion", solicitud.AreaFabricacion));
                        comando.Parameters.Add(new SqlParameter("@ZonaFabricacion", solicitud.ZonaFabricacion));
                        comando.Parameters.Add(new SqlParameter("@EquipoFabricacion", solicitud.EquipoFabricacion));
                        comando.Parameters.Add(new SqlParameter("@GrupoConstructivoFabricacion", solicitud.GrupoConstructivoFabricacion));
                        comando.Parameters.Add(new SqlParameter("@RepuestoFabricacion", solicitud.RepuestoFabricacion));
                        comando.Parameters.Add(new SqlParameter("@TipoAveria", solicitud.IdTipoAveria));
                        comando.Parameters.Add(new SqlParameter("@DescripcionAveria", solicitud.DescripcionAveria));
                        comando.Parameters.Add(new SqlParameter("@DescripcionProblema", solicitud.DescripcionProblema));
                        comando.Parameters.Add(new SqlParameter("@ComentarioCierre", solicitud.ComentarioCierre));

                        var resultadoParam = new SqlParameter("@RESULTADO", DBNull.Value);
                        resultadoParam.Direction = ParameterDirection.ReturnValue;
                        comando.Parameters.Add(resultadoParam);

                        comando.CommandType = CommandType.StoredProcedure;
                        connection.Open();
                        comando.ExecuteNonQuery();

                        int resultado = Convert.ToInt32(comando.Parameters["@RESULTADO"].Value);
                        if (resultado == 0)
                        {
                            // Operación correcta
                            return true;
                        }
                        else if (resultado == 1)
                        {
                            // Se ha editado la OT, pero el equipo no existe en JDE
                            return false;
                        }

                        // Error en la operación
                        throw new Exception("Error actualizando la solicitud de mantenimiento ("+resultado.ToString()+")");
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_EDITAR_SOLICITUD_MANTENIMIENTO").Replace("#ID", solicitud.NumOT.ToString()) + ": " + ex.Message + " -> " + ex.StackTrace,
                        "DAO_SolicitudIntervencion.EditarSolicitudIntervencion", "WEB-CALIDAD", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return false;
            }
        }

        private void CrearOTProgramada(int OT,out int nuevoCodigo, out Exception ex)
        {
            ex = null;
            nuevoCodigo = 0;
            int resultado = 0;

            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_CrearIntervencionMantenimientoProgramada]", connection))
                    {
                        comando.Parameters.Add(new SqlParameter("@OT", OT));
                        var nuevoCodigoParam = new SqlParameter("@NUEVO_CODIGO", SqlDbType.Int);
                        nuevoCodigoParam.Direction = ParameterDirection.Output;
                        comando.Parameters.Add(nuevoCodigoParam);

                        var resultadoParam = new SqlParameter("@RESULTADO", DBNull.Value);
                        resultadoParam.Direction = ParameterDirection.ReturnValue;
                        comando.Parameters.Add(resultadoParam);

                        comando.CommandType = CommandType.StoredProcedure;
                        connection.Open();
                        comando.ExecuteNonQuery();

                        resultado = Convert.ToInt32(comando.Parameters["@RESULTADO"].Value);
                        if (resultado == 0)
                        {
                            // Operacion correcta
                            nuevoCodigo = Convert.ToInt32(comando.Parameters["@NUEVO_CODIGO"].Value);
                            return;
                        }  

                        throw new Exception("Error creando la solicitud de mantenimiento programada (" + resultado.ToString() + ")");
                    }
                }
            }
            catch(Exception ex2)
            {
                ex = ex2;
            }
        }

        public bool CerrarSolicitudIntervencion(DTO_SolicitudIntervencion solicitud)
        {
            // Identificador del motivo Averia en la tabla JustificacionParosMotivos
            const int ID_MOTIVO_AVERIA = 1;
            // Valor de Causa por defecto que se usará si no se encuentra una equivalencia con los tipos de avería de mantenimiento. (el 1 es Mecánica)
            const int ID_CAUSA_DEFECTO = 1;

            using (MESEntities context = new MESEntities())
            {
                try
                {
                    var solicitudBBDD = context.MantenimientoIntervenciones.FirstOrDefault(x => x.IdMantenimientoIntervenciones == solicitud.Id);

                    if (solicitudBBDD != null)
                    {
                        // si hay que crear una OT programada lo intentamos antes del proceso de cierre normal, para poder cancelarlo si falla la programada
                        if (solicitud.OTProgramada)
                        {
                            int nuevoCodigo;
                            Exception ex;
                            CrearOTProgramada(solicitud.NumOT, out nuevoCodigo, out ex);
                            if (ex != null)
                            {
                                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CREAR_OT_PROGRAMADA").Replace("#ID#", solicitud.NumOT.ToString()) + ": " +
                                    ex.Message + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.CrearOTProgramada", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                                return false;
                            }
                            else
                            {
                                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "SolicitudesIntervencionController.CrearOTProgramada", IdiomaController.GetResourceName("CREADA_OT_PROGRAMADA").Replace("#ID#", nuevoCodigo.ToString()), HttpContext.Current?.User.Identity.Name ?? "Sistema");
                            }
                        }

                        solicitudBBDD.ComentarioCierre = solicitud.ComentarioCierre;
                        solicitudBBDD.FechaCierre = DateTime.UtcNow;
                        solicitudBBDD.Estado = TipoEnumEstadosSolicitudMantenimiento.Cerrada.GetString();

                        context.SaveChanges();

                        // Justificamos los paros mayores asociados a la OT cerrada

                        var queryParos = from p in context.ParosPerdidas.AsNoTracking()
                                    join pm in context.MantenimientoParosRelaciones.AsNoTracking() on p.Id equals pm.IdParo
                                    join l in context.Lineas.AsNoTracking() on p.IdLinea equals l.NumeroLinea
                                    where pm.IdMantenimientoIntervenciones == solicitudBBDD.IdMantenimientoIntervenciones
                                        && p.IdTipoParoPerdida == (short)TipoEnumTipoParo.PARO_MAYOR
                                    select new { paro = p, linea = l};

                        List<ParoPerdida> lista = queryParos.AsEnumerable()
                            .Select(e => Mapper_ParosPerdidas.Mapper_ParoPerdida(e.paro, e.linea))
                            .ToList();

                        var equivalenciasCausasParos = context.MantenimientoEquivalenciaCausas.AsNoTracking().ToList();

                        foreach(var p in lista)
                        {                            
                            p.motivoId = ID_MOTIVO_AVERIA;
                            var causaEquivalenciaOT = equivalenciasCausasParos.Find(f => f.IdTipoAveriaOT == solicitudBBDD.IdTipoAveria);
                            p.causaId = causaEquivalenciaOT != null ? causaEquivalenciaOT.IdCausaParo : ID_CAUSA_DEFECTO;                            
                            
                            p.idMaquinaResponsable = solicitudBBDD.Maquina;
                            p.idEquipoConstructivo = solicitudBBDD.EquipoConstructivo;
                            p.observaciones = String.IsNullOrEmpty(p.observaciones) ? solicitudBBDD.ComentarioCierre :
                                string.Concat(
                                    p.observaciones, 
                                    p.observaciones.EndsWith(".", StringComparison.Ordinal) ? "" : ".",
                                    IdiomaController.GetResourceName("CIERRE_OT"),
                                    solicitudBBDD.ComentarioCierre);
                        }

                        ParosPerdidasController.JustificarParosMayoresCierreOT(lista);
                    }

                    return true;

                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CERRAR_SOLICITUD_MANTENIMIENTO").Replace("#ID", solicitud.NumOT.ToString()) + ": " + 
                        ex.Message + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.CerrarSolicitudIntervencion", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                    return false;
                }
            }
        }

        public static bool CalcularTiempoT1(int idSolicitud)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("MES_CalcularTiempoT1Mantenimiento", connection))
                    {
                        comando.Parameters.Add(new SqlParameter("@ID", idSolicitud));
                        comando.CommandType = CommandType.StoredProcedure;

                        connection.Open();
                        comando.ExecuteNonQuery();

                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CALCULAR_T1_MANTENIMIENTO").Replace("#ID", idSolicitud.ToString()) + ": " +
                        ex.Message + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.CalcularTiempoT1", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return false;
            }
        }

        public List<SolicitudesLinea> ObtenerSolicitudesAbiertasLinea()
        {
            try
            {
                var resultado = new List<SolicitudesLinea>();
                List<string> estadosCerrada = new List<string>
                {
                    TipoEnumEstadosSolicitudMantenimiento.Cancelada.GetString(),
                    TipoEnumEstadosSolicitudMantenimiento.FueraDeAveria.GetString()
                };

                string estadoM5 = TipoEnumEstadosSolicitudMantenimiento.Cerrada.GetString();

                var solicitudesAbiertas = ObtenerSolicitudesQuery(a => !estadosCerrada.Contains(a.Estado) && a.EsEnvasado);

                resultado = solicitudesAbiertas
                    .Where(a => (a.Estado != estadoM5 || DateTime.Now - ((DateTime)(a.FechaCierre ?? DateTime.MinValue)) <= TimeSpan.FromMinutes(30)))
                    .GroupBy(o => o.Linea)
                    .Select(g => new SolicitudesLinea {
                        Linea = g.Key,
                        NumSolicitudes = g.Count(),
                        OTs = g.ToList().OrderBy(o => TipoEnumEstadosSolicitudMantenimientoExtensions.StateOrder(o.Estado)).ThenBy(o => o.FechaCreacion).ToList()
                    })
                    .ToList();

                

                return resultado;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerSolicitudesAbiertasLinea", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                return null;
            }
        }

        public bool AsociarParosSolicitudMantenimiento(int idSolicitud, List<int> paros)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    context.Database.ExecuteSqlCommand("Delete from MantenimientoParosRelaciones where IdMantenimientoIntervenciones = " + idSolicitud.ToString());

                    foreach(int p in paros)
                    {
                        context.MantenimientoParosRelaciones.Add(new MantenimientoParosRelaciones() { IdMantenimientoIntervenciones = idSolicitud, IdParo = p });
                    }

                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.AsociarParosSolicitudMantenimiento", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return false;
            }
        }

        public List<DTO_SolicitudIntervencion> ObtenerSolicitudMantenimientoPorParo(int idParo)
        {
            try
            {
                var lista = new List<MantenimientoIntervenciones>();
                var OTsIDs = new List<int>();

                using (MESEntities context = new MESEntities())
                {
                    OTsIDs = context.MantenimientoParosRelaciones.AsNoTracking().Where(e => e.IdParo == idParo).Select(e => e.IdMantenimientoIntervenciones).ToList();
                }

                return ObtenerSolicitudesQuery(w => OTsIDs.Contains(w.IdMantenimientoIntervenciones));
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerSolicitudMantenimientoPorParo", "WEB-Mantenimiento", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                return null;
            }
        }

        public List<TipoAveria> ObtenerTiposAveria()
        {
            try
            {
                var lista = new List<TipoAveria>();

                using (MESEntities context = new MESEntities())
                {
                    lista = context.TipoAveria.AsNoTracking().ToList();
                }

                return lista;
            }
            catch(Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerTiposAveria", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return null;
            }
        }

        #region CONF_VALIDACION_ARRANQUE

        public List<DTO_ConfValidacionArranque> ObtenerConfValidacionArranque()
        {
            try
            {
                var lista = new List<DTO_ConfValidacionArranque>();

                using (MESEntities context = new MESEntities())
                {
                    var query = from a in context.vMantenimientoConfMaquinasValidacionArranque.AsNoTracking()
                                orderby a.Linea, a.CodigoMaquina descending
                                select a;

                    lista = query.AsEnumerable().Select(e => Mapper_MantenimientoIntervencion.Mapper_ConfValidacionArranque_toDTO(e)).ToList();
                }

                return lista;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerConfValidacionArranque", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                return null;
            }
        }

        public bool CrearConfValidacionArranque(DTO_ConfValidacionArranque item, out string message)
        {
            message = "";

            try {

                using (MESEntities context = new MESEntities())
                {
                    if (context.MantenimientoConfMaquinasValidacionArranque.Where(f => f.CodigoMaquina == item.CodigoMaquina && f.Linea == item.Linea).Count() > 0)
                    {
                        // Ya existe un registro de validacion de arranque para esa máquina
                        message = IdiomaController.GetResourceName("ERROR_CONF_VALIDACION_ARRANQUE_REPETIDA");
                        return false;
                    }

                    var nuevo = new MantenimientoConfMaquinasValidacionArranque {
                        CodigoMaquina = item.CodigoMaquina,
                        Linea = item.Linea
                    };

                    context.MantenimientoConfMaquinasValidacionArranque.Add(nuevo);

                    context.SaveChanges();                                
                }

                return true;
            
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + ": " + ex.Message + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.CrearConfValidacionArranque", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return false;
            }
        }

        public bool EliminarConfValidacionArranque(DTO_ConfValidacionArranque item)
        {
            try
            {

                using (MESEntities context = new MESEntities())
                {

                    var elem = context.MantenimientoConfMaquinasValidacionArranque.Where(f => f.Id == item.Id).FirstOrDefault();

                    if (elem != null) {
                        context.MantenimientoConfMaquinasValidacionArranque.Remove(elem);
                        context.SaveChanges();
                    }
                }

                return true;

            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.EliminarConfValidacionArranque", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return false;
            }
        }

        #endregion CONF_VALIDACION_ARRANQUE

        #region DATOS_VALIDACION_ARRANQUE

        public bool CheckValidacionArranque(int OT)
        {
            try
            {
                bool result = false;

                using (MESEntities context = new MESEntities())
                {
                    var _ot = context.MantenimientoIntervenciones.AsNoTracking().Where(w => w.OT == OT).FirstOrDefault();

                    if (_ot != null)
                    {
                        bool configurado = context.MantenimientoConfMaquinasValidacionArranque.AsNoTracking().Any(a => a.CodigoMaquina.Equals(_ot.Maquina) && a.Linea.Equals(_ot.Linea));

                        result = configurado;
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.CheckValidacionArranque", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                return false;
            }
        }
        
        public DTO_DatosValidacionArranque ObtenerDatosValidacionArranque(int OT)
        {
            try
            {
                DTO_DatosValidacionArranque result = null;

                using (MESEntities context = new MESEntities())
                {
                    var query = from a in context.MantenimientoDatosValidacionArranqueOT.AsNoTracking()
                                where a.OT == OT
                                select a;

                    result = query.AsEnumerable().Select(e => Mapper_MantenimientoIntervencion.Mapper_DatosValidacionArranque_toDTO(e)).ToList().FirstOrDefault();
                }

                return result;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerDatosValidacionArranque", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                return null;
            }
        }

        public bool ValidarArranque(DTO_DatosValidacionArranque val)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    // Si ya existe registro de validacion para la OT, se actualiza el existente
                    var registro = context.MantenimientoDatosValidacionArranqueOT
                        .Where(f => f.OT == val.OT).FirstOrDefault();

                    if (registro != null)
                    {
                        registro.ResponsableProduccion = val.ResponsableProduccion;
                        registro.ResponsableMantenimiento = val.ResponsableMantenimiento;
                        registro.FechaValidacion = val.FechaValidacion;
                        
                    }
                    else
                    {
                        var nuevoRegistro = new MantenimientoDatosValidacionArranqueOT()
                        {
                            OT = val.OT,
                            ResponsableMantenimiento = val.ResponsableMantenimiento,
                            ResponsableProduccion = val.ResponsableProduccion,
                            FechaValidacion = val.FechaValidacion
                        };

                        context.MantenimientoDatosValidacionArranqueOT.Add(nuevoRegistro);
                    }

                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ValidarArranque", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");
                throw ex;
            }
        }

        #endregion DATOS_VALIDACION_ARRANQUE

        #region MAESTROS_FABRICACION

        public List<DTO_MaestroFabricacionBase> BuscadorTAGMantenimientoFabricacion(string tag)
        {
            try
            {
                var lista = new List<DTO_MaestroFabricacionBase>();

                using (MESEntities context = new MESEntities())
                {
                    lista = context.MaestroAreasFabricacion.AsNoTracking().Select(s => new { id = s.Codigo, desc = s.Descripcion })
                        .Union( context.MaestroZonasFabricacion.AsNoTracking().Select(s => new { id = s.Codigo, desc = s.Descripcion }))
                        .Union( context.MaestroEquiposFabricacion.AsNoTracking().Select(s => new { id = s.Codigo, desc = s.Descripcion }))
                        .Union( context.MaestroGruposConstructivosFabricacion.AsNoTracking().Select(s => new { id = s.Codigo, desc = s.Descripcion }))
                        .Union( context.MaestroRepuestosFabricacion.AsNoTracking().Select(s => new { id = s.Codigo, desc = s.Descripcion }))
                        .Where(t => t.id.Contains(tag))
                        .OrderBy(o => o.id)
                        .Take(50)
                        .AsEnumerable()
                        .Select(s => new DTO_MaestroFabricacionBase() { Codigo = s.id, Descripcion = s.desc })
                        .ToList();
                }

                return lista;

            } catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.BuscadorTAGMantenimientoFabricacion", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return null;
            }
        }

        public async Task<DTO_DatosTagFab> CargarTAGMantenimientoFabricacion(string tag)
        {
            try
            {
                var lista = new List<DTO_MaestroFabricacionBase>();

                using (MESEntities context = new MESEntities())
                {
                    var codigo = new SqlParameter("@Codigo", tag);
                    var res = await context.Database.SqlQuery<DTO_DatosTagFab>("SELECT * FROM dbo.BuscarTAGMantenimientoFab (@Codigo)", codigo).ToListAsync();

                    return res.FirstOrDefault();
                }

            } catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.CargarTAGMantenimientoFabricacion", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return null;
            }
        }

        public List<DTO_MaestroFabricacionBase> ObtenerMaestroAreasFabricacion()
        {
            try
            {
                var lista = new List<DTO_MaestroFabricacionBase>();

                using (MESEntities context = new MESEntities())
                {
                    lista = context.MaestroAreasFabricacion.AsNoTracking()
                        .AsEnumerable()
                        .Select(s => Mapper_MantenimientoIntervencion.Mapper_MaestroAreasFabricacion_toDTO(s))
                        .ToList();
                }

                return lista;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerMaestroAreasFabricacion", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return null;
            }
        }

        public List<DTO_MaestroFabricacion> ObtenerMaestroZonasFabricacion(int? idPadre)
        {
            try
            {
                var lista = new List<DTO_MaestroFabricacion>();

                using (MESEntities context = new MESEntities())
                {
                    lista = context.MaestroZonasFabricacion.AsNoTracking()
                        .Where(w => idPadre == null ? true : (int)idPadre == w.IdAreaFabricacion)
                        .AsEnumerable()
                        .Select(s => Mapper_MantenimientoIntervencion.Mapper_MaestroZonasFabricacion_toDTO(s))
                        .ToList();
                }

                return lista;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerMaestroZonasFabricacion", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return null;
            }
        }

        public List<DTO_MaestroFabricacion> ObtenerMaestroEquiposFabricacion(int? idPadre)
        {
            try
            {
                var lista = new List<DTO_MaestroFabricacion>();

                using (MESEntities context = new MESEntities())
                {
                    lista = context.MaestroEquiposFabricacion.AsNoTracking()
                        .Where(w => idPadre == null ? true : (int)idPadre == w.IdZonaFabricacion)
                        .AsEnumerable()
                        .Select(s => Mapper_MantenimientoIntervencion.Mapper_MaestroEquiposFabricacion_toDTO(s))
                        .ToList();
                }

                return lista;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerMaestroEquiposFabricacion", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return null;
            }
        }

        public List<DTO_MaestroFabricacion> ObtenerMaestroGruposConstructivosFabricacion(int? idPadre)
        {
            try
            {
                var lista = new List<DTO_MaestroFabricacion>();

                using (MESEntities context = new MESEntities())
                {
                    lista = context.MaestroGruposConstructivosFabricacion.AsNoTracking()
                        .Where(w => idPadre == null ? true : (int)idPadre == w.IdEquipoFabricacion)
                        .AsEnumerable()
                        .Select(s => Mapper_MantenimientoIntervencion.Mapper_MaestroGruposConstructivosFabricacion_toDTO(s))
                        .ToList();
                }

                return lista;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerMaestroGruposConstructivosFabricacion", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return null;
            }
        }

        public List<DTO_MaestroFabricacion> ObtenerMaestroRepuestosFabricacion(int? idPadre)
        {
            try
            {
                var lista = new List<DTO_MaestroFabricacion>();

                using (MESEntities context = new MESEntities())
                {
                    lista = context.MaestroRepuestosFabricacion.AsNoTracking()
                        .Where(w => idPadre == null ? true : (int)idPadre == w.IdGrupoConstructivoFabricacion)
                        .AsEnumerable()
                        .Select(s => Mapper_MantenimientoIntervencion.Mapper_MaestroRepuestosFabricacion_toDTO(s))
                        .ToList();
                }

                return lista;
            }
            catch (Exception ex)
            {
                string Mensaje = ex.InnerException == null ? ex.Message : String.Concat(ex.Message, "; IE: ", ex.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, Mensaje + " -> " + ex.StackTrace, "DAO_SolicitudIntervencion.ObtenerMaestroRepuestosFabricacion", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return null;
            }
        }

        #endregion
    }
}