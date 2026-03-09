using Autofac;
using Clients.ApiClient.Contracts;
using Common.Models.Almacen.Proveedor;
using Common.Models.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Mappers.Envasado;
using MSM.Mappers.DTO.Mermas;
using MSM.Mappers.Mermas;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using System.Web;
using System.Globalization;
using Newtonsoft.Json;

namespace MSM.BBDD.Mermas
{
    public class DAO_Mermas : IDAO_Mermas
    {
        private IApiClient _api;
        private string _urlMermas;
        private string _urlMermasFab;
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();
        private string UriFrabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();
        private static readonly IDAO_Ubicacion _daoUbicacion = AutofacContainerConfig.Container.Resolve<IDAO_Ubicacion>();

        public DAO_Mermas()
        {

        }

        public DAO_Mermas(IApiClient api)
        {
            _api = api;
            _urlMermas = string.Concat(UriEnvasado, "api/mermas/");
            _urlMermasFab = string.Concat(UriFrabricacion, "api/mermas/");
        }

        public List<MermasContadorGlobal> ObtenerContadoresGlobalesMermas()
        {
            try
            {
                var result = new List<MermasContadorGlobal>();

                using (MESEntities context = new MESEntities())
                {
                    result = context.MermasContadorGlobal.AsNoTracking().ToList();
                }

                return result;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENIENDO_CONTADORES_ACUMULADOS_MERMAS") + ": " +
                        message + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerContadoresGlobalesMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return null;
            }
        }

        public bool CrearContadorGlobalMermas(string nombre)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    context.MermasContadorGlobal.Add(
                        new MermasContadorGlobal()
                        {
                            NombreContadorGlobal = nombre
                        }
                    );

                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CREAR_CONTADOR_ACUMULADO_MERMAS") + ": " +
                        ex.Message + $" Params: nombre: {nombre}." + " -> " + ex.StackTrace, "DAO_Mermas.CrearContadorGlobalMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return false;
            }
        }

        public List<DTO_ClaveValorInfo> ObtenerMaquinasMermas(string idLinea = null)
        {
            try
            {
                List<DTO_ClaveValorInfo> lista = new List<DTO_ClaveValorInfo>();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    var query = @"
                        SELECT DISTINCT IdMaquina
                        , NombreMaquina = U.Nombre
                        , DescripcionMaquina = U.Descripcion
                        , Clase = LEFT(RIGHT(U.Nombre, 6), 3)
                        , IdLinea = L.Id
                        FROM MermasMaquinasContadores MC
                        JOIN MES_MSM_Trazabilidad.UBI.tUbicacion U ON U.IdUbicacion = MC.IdMaquina
                        JOIN Lineas L ON RIGHT(L.Id, 4) = LEFT(U.Nombre, 4)
                        WHERE L.Id = ISNULL(@IdLinea, L.Id) AND MC.Activo = 1
                        order by L.Id, DescripcionMaquina
                    ";

                    using (SqlCommand comando = new SqlCommand(query, connection))
                    {
                        comando.Parameters.AddWithValue("@IdLinea", idLinea ?? (object)DBNull.Value);

                        using (SqlDataAdapter da = new SqlDataAdapter(comando))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                var maq = new DTO_ClaveValorInfo()
                                {
                                    Id = int.Parse(row["IdMaquina"].ToString()),
                                    Valor = row["DescripcionMaquina"].ToString(),
                                    Info = new string[] { row["NombreMaquina"].ToString(), row["Clase"].ToString(), row["IdLinea"].ToString() }
                                };

                                lista.Add(maq);
                            }
                        }
                    }
                }

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENIENDO_MAQUINAS") + ": " +
                        ex.Message + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerMaquinasMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return null;
            }
        }
        
        public List<DTO_ClaveValorInfo> ObtenerMaquinasSinUsarMermas(string idLinea = null)
        {
            try
            {
                List<DTO_ClaveValorInfo> lista = new List<DTO_ClaveValorInfo>();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    var query = @"
                    SELECT IdMaquina = U.IdUbicacion
		                    ,ClaseMaquina = LEFT(RIGHT(U.Nombre, 6),3)
		                    ,CodigoMaquina = U.Nombre
		                    ,DescripcionMaquina = U.Descripcion
		                    ,IdLinea = U.IdLinea
                    FROM MES_MSM_Trazabilidad.UBI.tUbicacion U
                    Where ISNULL(IdLinea, '') != ''
                    AND LEFT(RIGHT(U.Nombre, 6),3) in (
	                    SELECT Distinct(ClaseMaquina) 
	                    FROM MermasMaestroContadores
                    )
                    AND NOT EXISTS (SELECT 1 FROM MermasMaquinasContadores C where C.IdMaquina = U.IdUbicacion AND C.Activo = 1)
                    AND IdLinea = @IdLinea
                    ORDER BY CodigoMaquina
                    ";

                    using (SqlCommand comando = new SqlCommand(query, connection))
                    {
                        comando.Parameters.AddWithValue("@IdLinea", idLinea ?? (object)DBNull.Value);

                        using (SqlDataAdapter da = new SqlDataAdapter(comando))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                var maq = new DTO_ClaveValorInfo()
                                {
                                    Id = int.Parse(row["IdMaquina"].ToString()),
                                    Valor = row["DescripcionMaquina"].ToString(),
                                    Info = new string[] { row["CodigoMaquina"].ToString(), row["ClaseMaquina"].ToString(), row["IdLinea"].ToString() }
                                };

                                lista.Add(maq);
                            }
                        }
                    }
                }

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENIENDO_MAQUINAS") + ": " +
                        ex.Message + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerMaquinasSinUsarMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return null;
            }
        }

        public List<ProveedorEANDto> ObtenerProveedoresMermas()
        {

            try
            {
                List<ProveedorEANDto> lista = new List<ProveedorEANDto>();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_ObtenerProveedores]", connection))
                    {
                        comando.CommandType = CommandType.StoredProcedure;

                        using (SqlDataAdapter da = new SqlDataAdapter(comando))
                        {

                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                ProveedorEANDto prov = new ProveedorEANDto()
                                {
                                    IdProveedor = int.Parse(row["IdProveedor"].ToString()),
                                    Nombre = row["Nombre"].ToString()
                                };

                                lista.Add(prov);
                            }
                        }
                    }
                }

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_PROVEEDORES_MERMAS") + ": " +
                        ex.Message + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerProveedoresMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return null;
            }
        }

        public List<DTO_MermasGrid> ObtenerMermas(string linea, DateTime desde, DateTime hasta)
        {
            try
            {
                var result = new List<DTO_MermasGrid>();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[MES_MermasObtenerRegistrosTurnos]", connection))
                    {
                        comando.Parameters.AddWithValue("@LINEA", linea);
                        comando.Parameters.AddWithValue("@DESDE", desde);
                        comando.Parameters.AddWithValue("@HASTA", hasta);
                        comando.CommandType = CommandType.StoredProcedure;

                        using (SqlDataAdapter da = new SqlDataAdapter(comando))
                        {

                            connection.Open();
                            DataSet ds = new DataSet();
                            da.Fill(ds);

                            if (ds.Tables.Count != 3)
                            {
                                throw new Exception($"El SP devolvió menos tablas de las esperadas ({ds.Tables.Count}).");
                            }

                            if (ds.Tables.Count > 0)
                            {
                                foreach (DataRow row in ds.Tables[0].Rows)
                                {
                                    var mermaGrid = new DTO_MermasGrid()
                                    {
                                        Id = row["IdMermaTurno"] is DBNull ? 0 : Convert.ToInt32(row["IdMermaTurno"]),
                                        IdTurno = row["IdTurno"] is DBNull ? 0 : Convert.ToInt32(row["IdTurno"]),
                                        Fecha = row["Fecha"] is DBNull ? DateTime.MinValue : Convert.ToDateTime(row["Fecha"]),
                                        IdTipoTurno = row["IdTipoTurno"] is DBNull ? 0 : Convert.ToInt32(row["IdTipoTurno"]),
                                        Turno = row["TipoTurno"].ToString(),
                                        MaquinasResumen = new List<MermasGridMaquina>()
                                    };

                                    mermaGrid.Estado = TipoEnumEstadoMermas.CORRECTO;
                                    if (ds.Tables.Count > 2)
                                    {
                                        var estados = ds.Tables[2].Rows.Cast<DataRow>();

                                        if (!ds.Tables[2].Columns.Contains("IdMermaTurno"))
                                        {
                                            throw new Exception($"La tabla 2 (estados) del SP no contiene las columnas correctas: " +
                                                $"{string.Join(", ", ds.Tables[2].Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList())}. ");
                                        }
                                        var estado = estados.Where(r =>
                                        {
                                            int auxId = (r["IdMermaTurno"] is DBNull ? 0 : Convert.ToInt32(r["IdMermaTurno"]));
                                            return auxId == mermaGrid.Id;
                                        }).FirstOrDefault();

                                        mermaGrid.Estado = estado == null || estado["estado"] is DBNull ? 0 : TipoEnumEstadoMermasExtensions.GetEnum(Convert.ToInt32(estado["estado"]));
                                    }

                                    if (ds.Tables.Count > 1)
                                    {
                                        var contadoresTabla = ds.Tables[1].Rows.Cast<DataRow>();
                                        var contadoresAgrupados = new List<MermasContadoresAgrupados>();

                                        contadoresAgrupados.AddRange(contadoresTabla.Where(r =>
                                        {
                                            int auxId = (r["IdMermaTurno"] is DBNull ? 0 : Convert.ToInt32(r["IdMermaTurno"]));
                                            return auxId == mermaGrid.Id;

                                        })
                                            .Select(e =>
                                                new MermasContadoresAgrupados()
                                                {
                                                    Clase = e["Clase"].ToString(),
                                                    ContadorGlobal = e["ContadorGlobal"] is DBNull ? 0 : Convert.ToInt32(e["ContadorGlobal"]),
                                                    NombreContadorGlobal = e["NombreContadorGlobal"].ToString(),
                                                    Valor = e["Valor"] is DBNull ? 0 : Convert.ToDecimal(e["Valor"])
                                                }
                                            )
                                            .ToList()
                                        );

                                        foreach (var e in contadoresAgrupados)
                                        {

                                            // Comprobamos si ya existe una entrada para la clase de maquina
                                            var res = mermaGrid.MaquinasResumen.Find(x => x.CodigoClaseMaquina.Equals(e.Clase));
                                            if (res != null)
                                            {
                                                // comprobamos si dentro de la clase ya existen valores para el contador agrupado
                                                var cont = res.contadoresGlobales.Find(x => x.IdContadorGlobal == e.ContadorGlobal);
                                                if (cont != null)
                                                {
                                                    cont.Valor += e.Valor;
                                                }
                                                else
                                                {
                                                    res.contadoresGlobales.Add(new MermasGridContadoresGlobales()
                                                    {
                                                        IdContadorGlobal = e.ContadorGlobal ?? 0,
                                                        NombreContador = e.NombreContadorGlobal,
                                                        Valor = e.Valor
                                                    });
                                                }
                                            }
                                            else
                                            {
                                                mermaGrid.MaquinasResumen.Add(new MermasGridMaquina()
                                                {
                                                    CodigoClaseMaquina = e.Clase,
                                                    ClaseMaquina = TipoEnumMaquinasClasesExtensions.GetEnumAbrev(e.Clase).ToString(),
                                                    contadoresGlobales = new List<MermasGridContadoresGlobales>()
                                                        {
                                                            new MermasGridContadoresGlobales()
                                                            {
                                                                IdContadorGlobal = e.ContadorGlobal ?? 0,
                                                                NombreContador = e.NombreContadorGlobal,
                                                                Valor = e.Valor
                                                            }
                                                        }
                                                });
                                            }
                                        }

                                        result.Add(mermaGrid);

                                    }
                                }
                            }
                        }
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + $" Params: linea: { linea}, desde: { desde.ToLocalTime().ToString()}, hasta: { hasta.ToLocalTime().ToString()}." + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return null;
            }
        }

        public async Task<string> CrearMerma(MermaModel mermaModel)
        {
            var mermaTurno = mermaModel.mermaTurno;
            var merma = mermaModel.merma;

            try
            {
                using (MESEntities context = new MESEntities())
                {
                    // Obtenemos el registro que define el turno al que pertenece la merma (puede existir ya, en caso contrario se crea)
                    var m = context.MermasTurnos.Where(t => t.IdTurno == mermaTurno.IdTurno).FirstOrDefault();

                    if (m == null)
                    {
                        m = context.MermasTurnos.Add(new MermasTurnos()
                        {
                            IdTurno = mermaTurno.IdTurno,
                            FechaCreado = DateTime.UtcNow,
                            FechaActualizado = DateTime.UtcNow
                        });
                    }

                    // Obtenemos datos para comprobar que el turno, la maquina y la wo corresponden a la misma linea
                    var turno = context.Turnos.Where(w => w.Id == mermaTurno.IdTurno).FirstOrDefault();
                    var wo = context.Ordenes.Where(w => w.Id == merma.WO).FirstOrDefault();
                    var maquina = await _daoUbicacion.seleccionaUbicacionPorId(merma.IdMaquina);

                    if(turno == null || (wo != null && turno.Linea != wo.Linea) || turno.Linea != maquina.IdLinea)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("MERMA_LINEA_NO_COINCIDE") + ": turno="+mermaTurno.IdTurno+", maquina="+merma.IdMaquina+", WO="+(merma.WO ?? "N/A"), "DAO_Mermas.CrearMerma", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                        return IdiomaController.GetResourceName("MERMA_LINEA_NO_COINCIDE");
                    }

                    // Comprobamos que no exista ya un registro de merma con la misma combinación de turno-máquina-proveedor-wo
                    if (context.MermasRegistros.Any(e => e.IdMermaTurno == m.IdMermaTurno && e.IdMaquina == merma.IdMaquina && e.CodigoProveedor == merma.CodigoProveedor && e.WO == merma.WO))
                    {
                        return IdiomaController.GetResourceName("YA_EXISTE_MERMA");
                    }

                    context.SaveChanges();

                    var r = context.MermasRegistros.Add(new MermasRegistros()
                    {
                        IdMermaTurno = m.IdMermaTurno,
                        IdMaquina = merma.IdMaquina,
                        CodigoProveedor = merma.CodigoProveedor,
                        WO = merma.WO,
                        IdProducto = merma.IdProducto,
                        FechaCreado = DateTime.UtcNow,
                        FechaActualizado = DateTime.UtcNow,
                    });

                    context.SaveChanges();

                    var contadores = context.vMermasMaquinasContadores
                        .Where(c => c.IdMermaMaquinaContador != null && c.IdMaquina == merma.IdMaquina
                        && c.Incluido && c.Activo).ToList();

                    foreach (var c in contadores)
                    {
                        context.MermasContadores.Add(new MermasContadores()
                        {
                            IdMermaMaquinaContador = c.IdMermaMaquinaContador.Value,
                            IdMermaRegistro = r.IdMermaRegistro,
                            Unidad = "uds",
                            FechaCreado = DateTime.UtcNow,
                            FechaActualizado = DateTime.UtcNow,                            
                        });
                    }

                    context.SaveChanges();
                }

                return null;
            }
            catch (Exception exc)
            {
                string message = exc.InnerException != null ? exc.Message + " IE: " + exc.InnerException.Message : exc.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CREANDO_MERMA") + ": " + message + " -> " + exc.StackTrace, "DAO_Mermas.CrearMerma", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return IdiomaController.GetResourceName("ERROR_CREANDO_MERMA");
            }
        }

        public List<DTO_MermasRegistro> ObtenerRegistrosMermas(int idMerma)
        {
            try
            {
                var registros = new List<DTO_MermasRegistro>();

                using (MESEntities context = new MESEntities())
                {
                    // Todos los registros mermas del turno
                    registros = context.vMermasRegistros.AsNoTracking()
                        .Where(r => r.IdMermaTurno == idMerma)
                        .OrderBy(o => o.CodigoMaquina).ThenBy(o => o.DescripcionProveedor).ThenBy(o => o.WO).ThenBy(o => o.FechaActualizado)
                        .AsEnumerable().Select(e => Mapper_Merma.Mapper_RegistrosMermas_toDTO(e)).ToList();


                    var regIds = registros.Select(r => r.Id).ToList();

                    // Todos los contadores que pertenezcan a estos registros
                    List<DTO_MermasContador> contadores = context.MermasContadores.AsNoTracking()
                        .Where(c => regIds.Contains(c.IdMermaRegistro))
                        .Join(context.vMermasMaquinasContadores.AsNoTracking()
                            .Where(w => w.IdMermaMaquinaContador != null && w.Activo), 
                            cont => cont.IdMermaMaquinaContador, 
                            contM => contM.IdMermaMaquinaContador,
                            (cont, contM) => new { 
                                cont = cont,
                                contM = contM
                            })
                        .AsEnumerable().Select(e => Mapper_Merma.Mapper_ContadorMermas_toDTO(e.cont, e.contM)).ToList();

                   
                    foreach (var reg in registros)
                    {
                        reg.Contadores = contadores.FindAll(f => f.IdRegistro == reg.Id);
                        foreach (var cont in reg.Contadores)
                        {
                            cont.ContadorProduccion = reg.ContadorProduccion;
                        }
                    }
                }

                return registros;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, message + $" Params: idMerma: {idMerma}." + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerRegistrosMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return null;
            }
        }

        public bool EditarRegistroMermas(DTO_MermasRegistro registro, out Exception ex)
        {
            ex = null;
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var elemento = context.MermasRegistros.Where(e => e.IdMermaRegistro == registro.Id).FirstOrDefault();

                    if (elemento != null)
                    {
                        // Comprobamos que no exista ya un registro de merma del mismo turno-máquina, y que tenga el mismo proveedor y WO (y que no sea el mismo registro)
                        if (context.MermasRegistros.Any(e => e.IdMermaRegistro != registro.Id && e.IdMermaTurno == registro.IdTurnoMerma && e.IdMaquina == registro.IdMaquina && e.CodigoProveedor == registro.CodigoProveedor && e.WO == registro.WO))
                        {
                            ex = new Exception(IdiomaController.GetResourceName("YA_EXISTE_MERMA"));
                            return false;
                        }

                        elemento.CodigoProveedor = registro.CodigoProveedor;
                        elemento.Observaciones = registro.Observaciones;
                        elemento.WO = registro.WO;
                        elemento.IdProducto = registro.IdProducto;

                        foreach (var cont in registro.Contadores)
                        {
                            var contadorBBDD = context.MermasContadores.Where(e => e.IdMermaContador == cont.Id).FirstOrDefault();

                            if (contadorBBDD != null)
                            {
                                contadorBBDD.Valor = cont.Valor;
                                contadorBBDD.Unidad = cont.Unidad ?? contadorBBDD.Unidad;
                                contadorBBDD.Justificacion = cont.Justificacion;
                            }
                        }
                    }

                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception exc)
            {
                string message = exc.InnerException != null ? exc.Message + " IE: " + exc.InnerException.Message : exc.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_EDITANDO_REGISTRO_MERMAS") + ": " + message +
                    $" Params: id: {registro.Id}." + " -> " + exc.StackTrace, "DAO_Mermas.EditarRegistroMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                ex = new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_REGISTRO_MERMAS"));
                return false;
            }
        }

        public bool EditarObservacionesRegistroMermas(DTO_MermasRegistro registro)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var elemento = context.MermasRegistros.Where(e => e.IdMermaRegistro == registro.Id).FirstOrDefault();

                    if (elemento != null)
                    {
                        elemento.Observaciones = registro.Observaciones;
                    }

                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_EDITANDO_REGISTRO_MERMAS") + ": " + message + $" Params: id: {registro.Id}, observaciones: {registro.Observaciones}." + " -> " + ex.StackTrace, "DAO_Mermas.EditarObservacionesRegistroMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return false;
            }
        }

        private bool EliminarRegistroMermasCore(MESEntities context, int id)
        {
            context.MermasContadores.RemoveRange(context.MermasContadores.Where(e => e.IdMermaRegistro == id));

            var elemento = context.MermasRegistros.Where(e => e.IdMermaRegistro == id).FirstOrDefault();

            context.MermasRegistros.Remove(elemento);

            // Si es el ultimo registro del turno, borramos tambien el turno
            int idTurno = elemento.IdMermaTurno;
            int numRegistros = context.MermasRegistros.Count(r => r.IdMermaTurno == idTurno);
            if (numRegistros == 1)
            {
                context.MermasTurnos.Remove(context.MermasTurnos.Where(t => t.IdMermaTurno == idTurno).FirstOrDefault());
            }

            return true;
        }

        // Le pasa un contexto externo para poder usarlo dentro de una transacción
        public bool EliminarRegistroMermas(int id, MESEntities externalContext = null)
        {
            try
            {
                bool result = true;
                if (externalContext != null)
                {
                    // Se usa el contexto externo para poder agrupar todas las operaciones en una única transacción, y poder deshacerlas en caso necesario
                    result = EliminarRegistroMermasCore(externalContext, id);
                }
                else
                {
                    using (MESEntities context = new MESEntities())
                    {
                        result = EliminarRegistroMermasCore(context, id);
                        context.SaveChanges();
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_ELIMINANDO_REGISTRO_MERMAS") + ": " + message + $" Params: id: {id}." + " -> " + ex.StackTrace, "DAO_Mermas.EliminarRegistroMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return false;
            }
        }

        public List<DTO_MermasContador> ObtenerContadoresMermas(int idRegistro)
        {
            try
            {
                var contadores = new List<DTO_MermasContador>();

                using (MESEntities context = new MESEntities())
                {
                    contadores = context.MermasContadores.AsNoTracking()
                        .Where(c => c.IdMermaRegistro == idRegistro)
                        .Join(context.vMermasMaquinasContadores.AsNoTracking()
                            .Where(w => w.IdMermaMaquinaContador != null),
                            cont => cont.IdMermaMaquinaContador,
                            contM => contM.IdMermaMaquinaContador,
                            (cont, contM) => new {
                                cont = cont,
                                contM = contM
                            })
                        .OrderBy(e => e.contM.Orden)
                        .AsEnumerable().Select(e => Mapper_Merma.Mapper_ContadorMermas_toDTO(e.cont, e.contM)).ToList();
                }

                // Obtenemos el contador de produccion para cada conjunto de contadores de maquina
                foreach (var c in contadores)
                {
                    c.ContadorProduccion = contadores.Find(f => f.IdRegistro == c.IdRegistro && f.ContadorConfiguracion.EsContadorProduccion)?.Valor;
                }

                return contadores;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, message + $" Params: idRegistro: {idRegistro}." + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerRegistrosMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return null;
            }
        }

        public bool EditarContadorMermas(int id, DTO_MermasContador contador)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var elemento = context.MermasContadores.Where(e => e.IdMermaContador == contador.Id).FirstOrDefault();

                    if (elemento != null)
                    {
                        elemento.Valor = (decimal)contador.Valor;
                        elemento.Unidad = contador.Unidad;
                        elemento.Justificacion = contador.Justificacion;

                        context.SaveChanges();
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_EDITANDO_CONTADOR_MERMAS") + ": " + message +
                    $" Params: id: {contador.Id}, valor: {contador.Valor}, unidad: {contador.Unidad}, justificacion: {contador.Justificacion}." + " -> " + ex.StackTrace, "DAO_Mermas.EditarContadorMerma", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return false;
            }
        }

        public List<DTO_MermasMaquinaContador> ObtenerMaquinasContadoresMermas(string linea)
        {
            try
            {
                var contadores = new List<DTO_MermasConfiguracionContador>();

                using (MESEntities context = new MESEntities())
                {
                    contadores = context.vMermasMaquinasContadores.AsNoTracking()
                        .GroupBy(m => m.IdMaquina)
                        .Where(grupo => grupo.Any(m => m.Activo))
                        .SelectMany(grupo => grupo)
                        .Where(c => c.ActivoMaestro && c.IdLinea.Equals(linea) && ((c.Incluido && c.Activo) || (!c.Incluido)))                        
                        .AsEnumerable().Select(c => Mapper_Merma.Mapper_MermasMaquinaContador_toDTO(c)).ToList();
                }

                var maquinasContadores = contadores.GroupBy(g => g.IdMaquina)
                    .Select(s => s.First())
                    .OrderBy(o =>o.CodigoMaquina)
                    .Select(s2 => new DTO_MermasMaquinaContador()
                    {
                        IdLinea = s2.Linea,
                        IdMaquina = s2.IdMaquina,
                        CodigoMaquina = s2.CodigoMaquina,
                        DescripcionMaquina = s2.DescripcionMaquina,
                        ClaseMaquina = s2.ClaseMaquina
                    }).ToList();

                foreach (var mc in maquinasContadores)
                {
                    mc.Contadores = contadores.FindAll(f => f.IdMaquina == mc.IdMaquina);
                    mc.Contadores.Sort((o1, o2) => o1.Orden.CompareTo(o2.Orden));
                }

                return maquinasContadores;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, message + $" Params: linea: {linea}." + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerMermasMaquinasContadores", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return null;
            }
        }

        public bool CrearMaquinasContadorMermas(DTO_MermasMaquinaContador maquinaContador)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    foreach(var c in maquinaContador.Contadores)
                    {
                        MermasMaquinasContadores contadorBBDD;
                        MermasMaestroContadores maestroContadorBBDD;

                        maestroContadorBBDD = context.MermasMaestroContadores.AsNoTracking()
                               .Where(w => w.IdMermasMaestroContadores == c.IdMaestroContador).FirstOrDefault();
                        contadorBBDD = context.MermasMaquinasContadores
                        .Where(w => w.IdMaquina == maquinaContador.IdMaquina && w.IdMermaMaestroContador == c.IdMaestroContador).FirstOrDefault();

                        if (c.Incluido)
                        {
                            // Si ya existe el registro para esa máquina, lo activamos y actualizamos, si no lo creamos
                            if (contadorBBDD != null)
                            {
                                contadorBBDD.Activo = true;
                            }
                            else
                            {
                                contadorBBDD = new MermasMaquinasContadores()
                                {
                                    IdMermaMaestroContador = c.IdMaestroContador,
                                    IdMaquina = maquinaContador.IdMaquina,
                                    Activo = true,
                                    FechaCreado = DateTime.UtcNow
                                };
                                context.MermasMaquinasContadores.Add(contadorBBDD);
                            }

                            contadorBBDD.Activo = true;
                            contadorBBDD.PorcentajeMinimo = c.PorcentajeMinimo == maestroContadorBBDD.PorcentajeMinimo ? (decimal?)null : c.PorcentajeMinimo;
                            contadorBBDD.PorcentajeMaximo = c.PorcentajeMaximo == maestroContadorBBDD.PorcentajeMaximo ? (decimal?)null : c.PorcentajeMaximo;
                            contadorBBDD.ClaseEnvase = c.ClaseEnvase == maestroContadorBBDD.ClaseEnvase ? null : c.ClaseEnvase;
                            contadorBBDD.FechaActualizado = DateTime.UtcNow;
                        }
                        else
                        {
                            if (contadorBBDD != null)
                            {
                                contadorBBDD.Activo = false;
                                contadorBBDD.FechaActualizado = DateTime.UtcNow;
                            }
                        }                        
                    }
                    
                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CREANDO_MAQUINAS_CONTADOR_MERMAS") + ": " + message
                    + " -> " + ex.StackTrace, "DAO_Mermas.CrearMaquinasContadorMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return false;
            }
        }

        public bool EditarMaquinasContadorMermas(DTO_MermasConfiguracionContador contador)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    // Activamos o desactivamos el contador maquina
                    MermasMaquinasContadores contadorBBDD;
                    MermasMaestroContadores maestroContadorBBDD;

                    maestroContadorBBDD = context.MermasMaestroContadores.AsNoTracking()
                           .Where(w => w.IdMermasMaestroContadores == contador.IdMaestroContador).FirstOrDefault();
                    contadorBBDD = context.MermasMaquinasContadores
                        .Where(w => w.IdMaquina == contador.IdMaquina && w.IdMermaMaestroContador == contador.IdMaestroContador).FirstOrDefault();

                    if (contador.Incluido)
                    {
                        if (contadorBBDD == null)
                        {
                            contadorBBDD = new MermasMaquinasContadores()
                            {
                                IdMermaMaestroContador = contador.IdMaestroContador,
                                IdMaquina = contador.IdMaquina,
                                Activo = true,
                                FechaCreado = DateTime.UtcNow                            
                            };
                            context.MermasMaquinasContadores.Add(contadorBBDD);
                        }
                        contadorBBDD.Activo = true;
                        contadorBBDD.PorcentajeMinimo = contador.PorcentajeMinimo == maestroContadorBBDD.PorcentajeMinimo ? (decimal?)null : contador.PorcentajeMinimo;
                        contadorBBDD.PorcentajeMaximo = contador.PorcentajeMaximo == maestroContadorBBDD.PorcentajeMaximo ? (decimal?)null : contador.PorcentajeMaximo;
                        contadorBBDD.ClaseEnvase = contador.ClaseEnvase == maestroContadorBBDD.ClaseEnvase ? null : contador.ClaseEnvase;
                        contadorBBDD.FechaActualizado = DateTime.UtcNow;
                    }
                    else
                    {
                        if (contadorBBDD != null)
                        {
                            contadorBBDD.Activo = false;
                        }
                    }
                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_EDITANDO_CONTADOR_MAQUINA_MERMAS") + ": " + message +
                    $" Params: id: {contador.Id}." + " -> " + ex.StackTrace, "DAO_Mermas.EditarMaquinasContadorMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return false;
            }
        }
        
        public bool EliminarMaquinasContadorMermas(DTO_MermasMaquinaContador contador)
        {
            using (MESEntities context = new MESEntities())
            {
                using (var tran = context.Database.BeginTransaction())
                {
                    try
                    {
                        // Obtenemos todas las MermasRegistros asociados a esta máquina
                        //var registros = context.MermasRegistros.AsNoTracking()
                        //    .Where(w => w.IdMaquina == contador.IdMaquina)
                        //    .Select(s => s.IdMermaRegistro).ToList();

                        //foreach (int regId in registros)
                        //{
                        //    var result = EliminarRegistroMermas(regId);
                        //    if (!result)
                        //    {
                        //        throw new Exception("Error borrando un registro de mermas");
                        //    }
                        //}

                        //context.MermasMaquinasContadores.RemoveRange(context.MermasMaquinasContadores.Where(w => w.IdMaquina == contador.IdMaquina));

                        // Desactivamos los registros de MaquinaContador
                        var elems = context.MermasMaquinasContadores.Where(w => w.IdMaquina == contador.IdMaquina).ToList();

                        foreach (var m in elems)
                        {
                            m.Activo = false;
                            m.FechaActualizado = DateTime.UtcNow;
                        }

                        context.SaveChanges();
                        tran.Commit();
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_ELIMINANDO_MAQUINAS_CONTADOR_MERMAS") + ": " + message +
                            $" Params: idMaquina: {contador.IdMaquina}." + " -> " + ex.StackTrace, "DAO_Mermas.EliminarMaquinasContadorMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                        return false;
                    }
                }
            }

            return true;
        }

        /// <summary>
        /// Comprueba si la máquina ya tiene un contador de producción configurado
        /// </summary>
        /// <param name="Maquina">Codigo de la máquina a comprobar</param>
        /// <returns>Devuelve true si puede crearse un contador de producción en esta máquina, y false si ya tiene uno configurado</returns>
        public bool ComprobarContadorProduccion(DTO_MermasConfiguracionContador contador)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    if (context.vMermasMaquinasContadores.AsNoTracking().Any(c => c.IdMaquina == contador.IdMaquina && c.IdMermaMaquinaContador != contador.Id && c.EsProduccion))
                    {
                        // Si ya existe un contador de produccion para la máquina, no dejamos crear otro
                        return false;
                    }

                    return true;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_COMPROBANDO_CONTADOR_PRODUCCION") + ": " + ex.Message + " -> " + ex.StackTrace, "DAO_Mermas.ComprobarContadorProduccion", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                throw ex;
            }
        }

        /// <summary>
        /// Comprueba si la máquina ya tiene un contador de rechazo configurado
        /// </summary>
        /// <param name="Maquina">Codigo de la máquina a comprobar</param>
        /// <returns>Devuelve true si puede crearse un contador de rechazo en esta máquina, y false si ya tiene uno configurado</returns>
        public bool ComprobarContadorRechazo(DTO_MermasConfiguracionContador contador)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    if (context.vMermasMaquinasContadores.AsNoTracking().Any(c => c.IdMaquina == contador.IdMaquina && c.IdMermaMaquinaContador != contador.Id && c.EsRechazoTotal))
                    {
                        // Si ya existe un contador de rechazo para la máquina, no dejamos crear otro
                        return false;
                    }

                    return true;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_COMPROBANDO_CONTADOR_RECHAZO") + ": " + ex.Message + " -> " + ex.StackTrace, "DAO_Mermas.ComprobarContadorRechazo", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                throw ex;
            }
        }

        public List<DTO_MermasConfiguracionContador> ObtenerContadoresClaseMaquina(TipoEnumMaquinasClases clase)
        {
            try
            {
                var contadores = new List<DTO_MermasConfiguracionContador>();
                string claseStr = clase.GetAbrevFromEnum();

                using (MESEntities context = new MESEntities())
                {
                    contadores = context.MermasMaestroContadores.AsNoTracking()
                        .Where(c => c.Activo && c.ClaseMaquina == claseStr)
                        .OrderBy(c => c.Orden)
                        .AsEnumerable().Select(c => Mapper_Merma.Mapper_MermasConfiguracionContador_toDTO(c)).ToList();
                }
                return contadores;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, message + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerContadoresClaseMaquina", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return null;
            }
        }

        public List<DTO_MermasConfiguracionContador> ObtenerConfiguracionContadoresMermas()
        {
            try
            {
                var contadores = new List<DTO_MermasConfiguracionContador>();

                using (MESEntities context = new MESEntities())
                {
                    contadores = context.MermasMaestroContadores.AsNoTracking()
                        .Where(c => c.Activo)
                        .OrderBy(c => c.ClaseMaquina).ThenBy(c => c.Orden)
                        .Select(s => new { m = s, g = s.MermasContadorGlobal })
                        .AsEnumerable().Select<dynamic, DTO_MermasConfiguracionContador>(c => { c.m.MermasContadorGlobal = c.g; return Mapper_Merma.Mapper_MermasConfiguracionContador_toDTO(c.m); }).ToList();
                }
                return contadores;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, message + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerConfiguracionContadoresMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return null;
            }
        }

        public bool CrearConfiguracionContadorMermas(DTO_MermasConfiguracionContador contador)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {

                    if (contador.EsContadorProduccion)
                    {
                        contador.Orden = 1;
                        contador.TipoGlobal = null;
                        contador.PorcentajeMaximo = 0;
                        contador.PorcentajeMinimo = 0;
                    }
                    else if (contador.RechazoTotal)
                    {
                        contador.Orden = 2;
                        contador.TipoGlobal = null;
                    }

                    context.MermasMaestroContadores.Add(Mapper_Merma.Mapper_ConfiguracionContadorMermas_toDB(contador));

                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_CREANDO_CONFIGURACION_CONTADOR_MERMAS") + ": " + message + " -> " + ex.StackTrace, "DAO_Mermas.CrearConfiguracionContadorMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return false;
            }
        }

        public void EditarConfiguracionContadorMermas(List<DTO_MermasConfiguracionContador> contadores, out Exception outEx)
        {
            outEx = null;

            try
            {
                // Validación de contadores
                if (contadores.Count < 2)
                {
                    outEx = new Exception(IdiomaController.GetResourceName("ERROR_CREAR_EDITAR_CONTADOR_MERMA_1"));
                    return;
                }
                if (contadores.FindAll(a => a.EsContadorProduccion).Count != 1 || contadores.FindAll(a => a.RechazoTotal).Count != 1)
                {
                    outEx = new Exception(IdiomaController.GetResourceName("ERROR_CREAR_EDITAR_CONTADOR_MERMA_2"));
                    return;
                }
                if (contadores.Find(a => a.EsContadorProduccion).Orden != 1 || contadores.Find(a => a.RechazoTotal).Orden != 2)
                {
                    outEx = new Exception(IdiomaController.GetResourceName("ERROR_CREAR_EDITAR_CONTADOR_MERMA_3"));
                    return;
                }
                if (contadores.Any(a => String.IsNullOrEmpty(a.Descripcion)))
                {
                    outEx = new Exception(IdiomaController.GetResourceName("ERROR_CREAR_EDITAR_CONTADOR_MERMA_4"));
                    return;
                }
                if (contadores.Any(a => a.PorcentajeMinimo < 0 || a.PorcentajeMaximo < 0))
                {
                    outEx = new Exception(IdiomaController.GetResourceName("ERROR_CREAR_EDITAR_CONTADOR_MERMA_5"));
                    return;
                }
                if (contadores.Any(a => a.PorcentajeMinimo > a.PorcentajeMaximo))
                {
                    outEx = new Exception(IdiomaController.GetResourceName("ERROR_CREAR_EDITAR_CONTADOR_MERMA_6"));
                    return;
                }

                var clase = TipoEnumMaquinasClasesExtensions.GetAbrevFromEnum(
                    (TipoEnumMaquinasClases)Enum.Parse(typeof(TipoEnumMaquinasClases), contadores.FirstOrDefault()?.ClaseMaquina)
                    );

                using (MESEntities context = new MESEntities())
                {
                    var contadoresActuales = context.MermasMaestroContadores.Where(w => w.ClaseMaquina == clase).ToList();

                    foreach (var c in contadoresActuales)
                    {
                        var coincidencia = contadores.Find(f => f.IdMaestroContador == c.IdMermasMaestroContadores);

                        // Si el contador BBDD no viene en los nuevos, lo desactivamos
                        if (coincidencia == null)
                        {
                            c.Activo = false;
                            c.FechaActualizado = DateTime.UtcNow;
                        }
                        else
                        {
                            c.Descripcion = coincidencia.Descripcion;
                            c.Orden = coincidencia.Orden;
                            c.ClaseEnvase = coincidencia.ClaseEnvase;
                            c.EsContadorProduccion = coincidencia.EsContadorProduccion;
                            c.EsRechazoTotal = coincidencia.RechazoTotal;
                            c.PorcentajeMinimo = coincidencia.PorcentajeMinimo;
                            c.PorcentajeMaximo = coincidencia.PorcentajeMaximo;
                            c.ContadorGlobal = coincidencia.TipoGlobal;
                            c.FechaActualizado = DateTime.UtcNow;
                        }
                    }

                    // Cualquier contador que no existiera lo creamos
                    var nuevos = contadores.FindAll(f => f.IdMaestroContador == 0);

                    foreach(var cn in nuevos)
                    {
                        context.MermasMaestroContadores.Add(new MermasMaestroContadores()
                        {
                            ClaseMaquina = clase,
                            Descripcion = cn.Descripcion,
                            Orden = cn.Orden,
                            ClaseEnvase = cn.ClaseEnvase,
                            EsContadorProduccion = cn.EsContadorProduccion,
                            EsRechazoTotal = cn.RechazoTotal,
                            PorcentajeMinimo = cn.PorcentajeMinimo,
                            PorcentajeMaximo = cn.PorcentajeMaximo,
                            ContadorGlobal = cn.TipoGlobal,
                            FechaCreado = DateTime.UtcNow,
                            FechaActualizado = DateTime.UtcNow,
                            Activo = true
                        });
                    }

                    context.SaveChanges();                    
                }
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_EDITANDO_CONFIGURACION_CONTADOR_MERMAS") + ": " + message +
                    " -> " + ex.StackTrace, "DAO_Mermas.EditarConfiguracionContadorMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                
                outEx = new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_CONFIGURACION_CONTADOR_MERMAS"));
            }
        }

        public bool EliminarConfiguracionContadorMermas(string maquinaClase)
        {
            try
            {
                // Desactivamos todos los contadores maestros de mermas de la clase pasada
                var clase = TipoEnumMaquinasClasesExtensions.GetAbrevFromEnum(
                    (TipoEnumMaquinasClases)Enum.Parse(typeof(TipoEnumMaquinasClases), maquinaClase)
                    );
                using (MESEntities context = new MESEntities())
                {
                    var elems = context.MermasMaestroContadores.Where(w => w.Activo && w.ClaseMaquina.ToUpper() == clase.ToUpper()).ToList();

                    foreach(var e in elems)
                    {
                        // Comprobamos si existen registros dependientes de este para borrado lógico de ambas tablas, si no existen borrado físico
                        var mermasMaquinas = context.MermasMaquinasContadores.Where(w => w.IdMermaMaestroContador == e.IdMermasMaestroContadores).ToList();
                        if (mermasMaquinas.Count > 0)
                        {
                            e.Activo = false;
                            e.FechaActualizado = DateTime.UtcNow;
                            mermasMaquinas.ForEach(m => { m.Activo = false; m.FechaActualizado = DateTime.UtcNow; });
                        }
                        else
                        {
                            context.MermasMaestroContadores.Remove(e);
                        }                        
                    }

                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_ELIMINANDO_CONFIGURACION_CONTADOR_MERMAS") + ": " + message + $" Params: clase: {maquinaClase}." + " -> " + ex.StackTrace, "DAO_Mermas.EliminarConfiguracionContadorMermas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                return false;
            }
        }

        public List<DTO_MermasRegistro> ObtenerMermasTerminal(long idTurno, string claseMaquina)
        {
            try
            {
                var mermas = new List<DTO_MermasRegistro>();

                List<DTO_MermasContador> contadores = new List<DTO_MermasContador>();

                // TODO revisar si este código evita los deadlocks
                using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadUncommitted})) {
                    using (MESEntities context = new MESEntities())
                    {
                        mermas = context.vMermasRegistros.AsNoTracking()
                            .Join(context.vMermasTurnos.AsNoTracking(), r => r.IdMermaTurno, t => t.IdMermaTurno, (r, t) => new { registro = r, turno = t })
                            .Where(e => e.turno.IdTurno == idTurno && e.registro.ClaseMaquina == claseMaquina)
                            .OrderByDescending(e => e.registro.FechaCreado)
                            .AsEnumerable().Select(e => Mapper_Merma.Mapper_RegistrosMermas_toDTO(e.registro, e.turno)).ToList();

                        var mermasIds = mermas.Select(e => e.Id);

                        contadores = context.MermasContadores.AsNoTracking()
                            .Join(context.vMermasMaquinasContadores.AsNoTracking()
                            .Where(w => w.IdMermaMaquinaContador != null && w.Activo),
                            cont => cont.IdMermaMaquinaContador,
                            contM => contM.IdMermaMaquinaContador,
                            (cont, contM) => new {
                                cont = cont,
                                contM = contM
                            })
                            .Where(e => mermasIds.Contains(e.cont.IdMermaRegistro))
                            .OrderBy(e => e.contM.Orden)
                            .AsEnumerable().Select(e => Mapper_Merma.Mapper_ContadorMermas_toDTO(e.cont, e.contM)).ToList();
                    }
                }                

                foreach (var m in mermas)
                {
                    m.Contadores = contadores.FindAll(c => c.IdRegistro == m.Id);
                    m.Contadores = m.Contadores.OrderBy(c => c.ContadorConfiguracion.Orden).ToList();
                    foreach (var c in m.Contadores)
                    {
                        c.ContadorProduccion = m.ContadorProduccion;
                    }
                }

                return mermas;
            }
            catch (Exception ex)
            {
                string message = ex.InnerException != null ? ex.Message + " IE: " + ex.InnerException.Message : ex.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, message + $" Params: idTurno: {idTurno}, claseMaquina: {claseMaquina}." + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerMermasTerminal", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return null;
            }
        }

        public async Task<DTO_RespuestaAPI<DTO_MermasExcel>> ObtenerMermasExcel(string idLinea, DateTime fechaInicio, DateTime fechaFin)
        {

            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<DTO_MermasExcel>>(string.Concat(_urlMermas, "Excel?idLinea=", idLinea,
                "&fechaInicio=", fechaInicio.ToString(), "&fechaFin=", fechaFin.ToString()));

            return result;
        }

        public static List<DTO_MermasAnalisis> ObtenerMermasAnalisis(int anioIni, int semanaIni, int anioFin, int semanaFin)
        {
            var listaRegistros = new List<DTO_MermasAnalisis>();

            try
            {
                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var command = new SqlCommand("[MES_Mermas_ObtenerAnalisis]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 90;
                        command.Parameters.AddWithValue("@anioIni", anioIni);
                        command.Parameters.AddWithValue("@semanaIni", semanaIni);
                        command.Parameters.AddWithValue("@anioFin", anioFin);
                        command.Parameters.AddWithValue("@semanaFin", semanaFin);

                        connection.Open();
                        
                        using (SqlDataReader dr = command.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                var dtoMermasAnalisis = new DTO_MermasAnalisis();
                                dtoMermasAnalisis.Linea = DataHelper.GetString(dr, "Linea");
                                dtoMermasAnalisis.Semaforo = DataHelper.GetString(dr, "Semaforo");
                                dtoMermasAnalisis.IME = Convert.ToDecimal(dr["IME"]);
                                dtoMermasAnalisis.PorcentajeTrazadosRespectoLlenados = Convert.ToDecimal(dr["PorcentajeTrazadosRespectoLlenados"]);
                                dtoMermasAnalisis.PaletsDespaletera = DataHelper.GetInt(dr, "PaletsDespaletera");
                                dtoMermasAnalisis.EnvasesLlenadora = DataHelper.GetInt(dr, "EnvasesLlenadora");
                                dtoMermasAnalisis.PorcentajeMermaInspectoresVacio = Convert.ToDecimal(dr["PorcentajeMermaInspectoresVacio"]);
                                dtoMermasAnalisis.PorcentajeMermaLlenadoraEtiquetadora = Convert.ToDecimal(dr["PorcentajeMermaLlenadoraEtiquetadora"]);

                                listaRegistros.Add(dtoMermasAnalisis);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Mermas.ObtenerMermasAnalisis", "WEB-ENVASADO", "Sistema");
            }

            return listaRegistros;
        }

        public static List<MermasAnalisisConfig> ObtenerMermasAnalisisConfiguracion()
        {
            using (MESEntities contexto = new MESEntities())
            {
                var result = contexto.MermasAnalisisConfig.AsNoTracking().ToList();
                return result;
            }
        }

        public static bool EditarMermaAnalisisConfiguracion(MermasAnalisisConfig mermaAnalisisConfig)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MermasAnalisisConfig mermaExistente = context.MermasAnalisisConfig.FirstOrDefault(x => x.IdMermaAnalisisConfig == mermaAnalisisConfig.IdMermaAnalisisConfig);
                    if (mermaExistente != null)
                    {
                        mermaExistente.IMEObjetivo = mermaAnalisisConfig.IMEObjetivo;

                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Mermas.EditarMermaAnalisisConfiguracion", "IME Objetivo: " + mermaAnalisisConfig.IMEObjetivo +
                        ". " + IdiomaController.GetResourceName("GUARDADO_CORRECTAMENTE"), HttpContext.Current.User.Identity.Name);

                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Mermas.EditarMermaAnalisisConfiguracion",
                        "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);

                    return false;
                }
            }
        }


        public async Task<DTO_RespuestaAPI<List<DTO_DatosMermas>>> ObtenerDatosCalculoMermas(DateTime fechaDesde, DateTime fechaHasta, string zona, string tipo)
        {
            var zonaEsc = Uri.EscapeDataString(zona ?? string.Empty);
            var tipoEsc = Uri.EscapeDataString(tipo ?? string.Empty);

            var url = $"{_urlMermasFab}ObtenerDatosCalculoMermas?fechaDesde={fechaDesde.ToUniversalTime():u}&fechaHasta={fechaHasta.ToUniversalTime():u}&zona={zonaEsc}&tipo={tipoEsc}";

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_DatosMermas>>>(url);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarDatosCalculoMermas(string zona, dynamic dto)
        {
            var url = $"{_urlMermasFab}ActualizarDatosCalculoMermas" + "?zona=" + zona;
            var jsonResult = await _api.PutPostsAsync<dynamic>(url, dto);

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> BorradoLogicoDatosCalculoMermas(string zona, int id, string usuario)
        {
            var url = $"{_urlMermasFab}BorradoLogicoDatosCalculoMermas" + "?zona=" + zona + "&id=" + id + "&usuario=" + usuario;

            var jsonResult = await _api.DeletePostsAsync<dynamic>(url);
            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_ConfExtrDatosMermas>>> ObtenerConfiguracionExtraccionDatosMermas(int zona, string tipo)
        {
            var tipoEsc = Uri.EscapeDataString(tipo ?? string.Empty);

            var url = $"{_urlMermasFab}ObtenerConfiguracionExtraccionDatosMermas?zona={zona}&tipo={tipoEsc}";

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_ConfExtrDatosMermas>>>(url);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> CrearConfiguracionExtraccionDatosMermas(DTO_ConfExtrDatosMermas dto)
        {
            var url = $"{_urlMermasFab}CrearConfiguracionExtraccionDatosMermas";
            var jsonResult = await _api.PostPostsAsync<dynamic>(dto, url);

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarConfiguracionExtraccionDatosMermas(dynamic dto)
        {
            var url = $"{_urlMermasFab}ActualizarConfiguracionExtraccionDatosMermas";
            var jsonResult = await _api.PutPostsAsymmetricAsync<dynamic>(url, dto);

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> EliminarConfiguracionExtraccionDatosMermas(int id)
        {
            var url = $"{_urlMermasFab}EliminarConfiguracionExtraccionDatosMermas";
            var ret = await _api.DeletePostsAsync<DTO_RespuestaAPI<bool>>(url + "/" + id);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_FormulasCalculo>>> ObtenerFormulasCalculo(int id)
        {
            var url = $"{_urlMermasFab}ObtenerFormulasCalculo?id={id}";

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_FormulasCalculo>>>(url);
            return ret;
        }
        public async Task<DTO_RespuestaAPI<List<DTO_ZonasCalculoMermas>>> ObtenerZonasCalculoExtracto(int id)
        {
            var url = $"{_urlMermasFab}ObtenerZonasCalculoExtracto?id={id}";

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_ZonasCalculoMermas>>>(url);
            return ret;
        }
        public async Task<DTO_RespuestaAPI<List<DTO_ZonasCalculoMermas>>> ObtenerZonasCalculoExistencias(int id)
        {
            var url = $"{_urlMermasFab}ObtenerZonasCalculoExistencias?id={id}";

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_ZonasCalculoMermas>>>(url);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_MermasExistencias>>> ObtenerExistenciasCalculoMermas(DateTime fechaDesde, DateTime fechaHasta, int zona)
        {
            var url = $"{_urlMermasFab}ObtenerExistenciasCalculoMermas?fechaDesde={fechaDesde.ToUniversalTime():u}&fechaHasta={fechaHasta.ToUniversalTime():u}&zona={zona}";

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_MermasExistencias>>>(url);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_ConfExistenciasMermas>>> ObtenerConfiguracionCalculoExistencias(int zona)
        {
            var url = $"{_urlMermasFab}ObtenerConfiguracionCalculoExistencias?zona={zona}";
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_ConfExistenciasMermas>>>(url);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> CrearConfiguracionCalculoExistencias(DTO_ConfExistenciasMermas dto)
        {
            var url = $"{_urlMermasFab}CrearConfiguracionCalculoExistencias";
            var jsonResult = await _api.PostPostsAsync<dynamic>(dto, url);

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarConfiguracionCalculoExistencias(dynamic dto)
        {
            var url = $"{_urlMermasFab}ActualizarConfiguracionCalculoExistencias";
            var jsonResult = await _api.PutPostsAsymmetricAsync<dynamic>(url, dto);

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> EliminarConfiguracionCalculoExistencias(int id)
        {
            var url = $"{_urlMermasFab}EliminarConfiguracionCalculoExistencias";
            var ret = await _api.DeletePostsAsync<DTO_RespuestaAPI<bool>>(url + "/" + id);

            return ret;
        }


        public async Task<DTO_RespuestaAPI<List<DTO_MermasConfigVariable>>> ObtenerParametrosGenerales()
        {
            var url = $"{_urlMermasFab}ObtenerParametrosGenerales";
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_MermasConfigVariable>>>(url);
            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> CrearParametroGeneral(DTO_MermasConfigVariable dto)
        {
            var url = $"{_urlMermasFab}CrearParametroGeneral";
            var jsonResult = await _api.PostPostsAsync<dynamic>(dto, url);

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarParametroGeneral(dynamic dto)
        {
            var url = $"{_urlMermasFab}ActualizarParametroGeneral";
            var jsonResult = await _api.PutPostsAsymmetricAsync<dynamic>(url, dto);

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> EliminarParametroGeneral(int id)
        {
            var url = $"{_urlMermasFab}EliminarParametroGeneral";
            var ret = await _api.DeletePostsAsync<DTO_RespuestaAPI<bool>>(url + "/" + id);
            return ret;
        }
    }
}