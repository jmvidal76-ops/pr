using System;
using System.Collections.Generic;
using MSM.Models.Envasado;
using System.Data.SqlClient;
using System.Configuration;
using System.Data;
using System.Collections;
using MSM.Utilidades;
using System.Data.SqlTypes;
using MSM.Models.Planta;
using MSM.BBDD.Envasado;
using MSM.Controllers.Planta;
using MSM.BBDD.Model;
using System.Linq;
using MSM.DTO;
using System.Threading;
using System.Threading.Tasks;

namespace MSM.BBDD.Planta
{
    public class DAO_Planta
    {
        /// <summary>
        /// Obtiene el listado de turnos/linea de la planta
        /// </summary>
        /// <returns>Una lista con datos de turno por cada linea</returns>
        public List<Turno> obtenerTurnosLineasPlanta(ref MSM.Models.Planta.Planta planta)
        {
            List<Turno> turnosLineas = new List<Turno>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[NOT_CambiosTurno]", conexion);
            comando.Parameters.AddWithValue("@fechaHora", DateTime.Now.ToUniversalTime());
            comando.Parameters.AddWithValue("@idPlanta", planta.Id);
            comando.CommandType = CommandType.StoredProcedure;
            comando.CommandTimeout = 3;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    Linea lin = planta.lineas.Find(linea => linea.id == DataHelper.GetString(dr, "Linea"));
                    turnosLineas.Add(
                    new Turno(
                        DataHelper.GetInt(dr, "IdTurno"),
                        ref lin,
                        DataHelper.GetDate(dr, "Fecha"),
                        DataHelper.GetDate(dr, "InicioTurno"),
                        DataHelper.GetDate(dr, "FinTurno"),
                        new TipoTurno(int.Parse(DataHelper.GetString(dr, "IdTipoTurno") ?? "0"), DataHelper.GetString(dr, "Turno")),
                        new DatosProduccion(),
                        (DataHelper.GetString(dr, "Turno") == null ? false : true)
                    ));
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Planta.obtenerProductosPlanta", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.obtenerTurnosLineasPlanta", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PRODUCTOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return turnosLineas;
        }

        public List<Producto> obtenerProductosPlanta()
        {
            List<Producto> productos = new List<Producto>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerProductosPlanta]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    productos.Add(new Producto(dr["Descripcion"].ToString(),
                                               dr["Descripcion"].ToString(),
                                               dr["udMedida"].ToString(),
                                               new TipoProducto(dr["IdTipoProducto"].ToString(), dr["TipoProducto"].ToString()), null));
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.obtenerProductosPlanta", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PRODUCTOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return productos;
        }

        public List<Linea> ObtenerLineasPlanta(ref MSM.Models.Planta.Planta planta)
        {
            List<Linea> lineas = new List<Linea>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerLineasPlanta]", conexion);
            comando.Parameters.AddWithValue("@planta", planta.Id);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    lineas.Add(new Linea(int.Parse(dr["NumeroLinea"].ToString()), dr["NumeroLineaDescripcion"].ToString(),
                               dr["Id"].ToString(), dr["Nombre"].ToString(), dr["Descripcion"].ToString(), ref planta)
                    {
                        oeeCritico = Convert.ToDouble(dr["OEECritico"]),
                        oeeObjetivo = Convert.ToDouble(dr["OEEObjetivo"]),
                        Grupo = dr["Grupo"].ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.ObtenerLineasPlanta", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS_LINEAS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return lineas;
        }

        public List<Zona> ObtenerZonasLinea(ref Linea linea)
        {
            List<Zona> zonas = new List<Zona>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerZonasLineaV2]", conexion);
            comando.Parameters.AddWithValue("@linea", linea.numLinea);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();

                while (dr.Read())
                {
                    string idOrden = dr["Orden"].ToString();
                    Orden ordenZona = linea.ordenesActivas.Find(orden => orden.id == idOrden);

                    string idZona = dr["Id"].ToString();
                    int numZona = DataHelper.GetInt(dr, "NumeroZona");
                    string nombreZona = dr["Nombre"].ToString();
                    string descripcion = dr["Descripcion"].ToString();
                    string compartida = dr["Compartida"].ToString();
                    bool arranque = Convert.ToBoolean(dr["Arranque"]);
                    bool permiteProduccion = Convert.ToBoolean(dr["PermiteProduccion"]);
                    bool produccionCompartida = Convert.ToBoolean(dr["ProduccionCompartida"]);
                    bool maquinasCompartidas = Convert.ToBoolean(dr["MaquinasCompartidas"]);
                    bool inicioPausa = Convert.ToBoolean(dr["InicioPausa"]);

                    Zona zona = new Zona(idZona, linea.id, numZona, nombreZona, ordenZona, compartida, ref linea, descripcion)
                    {
                        Arranque = arranque,
                        InicioPausa = inicioPausa,
                        Permite_Produccion = permiteProduccion,
                        ProduccionCompartida = produccionCompartida,
                        MaquinasCompartidas = maquinasCompartidas
                    };

                    zonas.Add(zona);
                }

                //Repaso las zonas por si hay alguna que tenga subzonas, para añadireselas como referencia
                foreach (Zona zona in zonas)
                {
                    if (zona.id.Contains(".") && !zona.id.Contains(".C"))
                    {
                        foreach (Zona zonabusca in zonas)
                        {
                            if (zonabusca.id.Contains(".") && zonabusca.numZona != zona.numZona && !zonabusca.id.Contains(".C") && zona.id.Split('.')[0] == zonabusca.id.Split('.')[0])
                            {
                                zona.subZonas.Add(zonabusca.id);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.ObtenerZonasLinea", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENINENDO_LAS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return zonas;
        }

        public void actualizarZonasLinea(ref Linea linea)
        {
            List<Zona> zonasActualizadas = this.ObtenerZonasLinea(ref linea);
            linea.zonas.Clear();
            linea.zonas.AddRange(zonasActualizadas);
        }

        public List<Maquina> ObtenerMaquinasZona(ref Zona zona)
        {
            List<Maquina> maquinas = new List<Maquina>();

            try
            {
                using (var conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                using (var comando = new SqlCommand("[MES_ObtenerMaquinasZona]", conexion))
                {
                    comando.Parameters.AddWithValue("@linea", zona._refLinea.id);
                    comando.Parameters.AddWithValue("@zona", zona.id);
                    comando.CommandType = CommandType.StoredProcedure;

                    conexion.Open();

                    using (var dr = comando.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            string idMaquina = dr["Id"].ToString();
                            string nombre = dr["Nombre"].ToString();
                            string descripcion = dr["Descripcion"].ToString();
                            EstadoMaquina estado = new EstadoMaquina(dr["Estado"].ToString().ToEnum<Tipos.EstadosMaquina>());
                            TipoMaquina tipo = new TipoMaquina((int)dr["IdClase"], dr["Clase"].ToString());
                            int posicion = Convert.ToInt32(dr["Posicion"]);
                            DateTime fechaActualizacion = Convert.IsDBNull(dr["RowUpdated"]) ? SqlDateTime.MinValue.Value : (DateTime)dr["RowUpdated"];

                            bool generaRechazos = Convert.ToBoolean(dr["RechazoManual"]);

                            var maquina = new Maquina(idMaquina, nombre, descripcion, estado, tipo,ref zona, posicion, fechaActualizacion, generaRechazos)
                            {
                                ordenIdMaquina = dr["OrdenMaquina"].ToString()
                            };

                            maquinas.Add(maquina);

                            // Marcar el tipo de zona según la clase
                            switch (dr["Clase"].ToString())
                            {
                                case "LLENADORA":
                                    zona.esLlenadora = true;
                                    break;
                                case "DESPALETIZADORA":
                                    zona.esDespaletizadora = true;
                                    break;
                                case "PALETIZADORA":
                                    zona.esPaletizadora = true;
                                    break;
                                case "ENCAJONADORA":
                                    zona.esEncajonadora = true;
                                    break;
                                case "EMPAQUETADORA":
                                    zona.esEmpaquetadora = true;
                                    break;
                                case "ETIQUETADORA":
                                    zona.esEtiquetadora = true;
                                    break;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.ObtenerMaquinasZona", "WEB-PLANTA", "Sistema");
                throw new Exception($"Error al obtener las máquinas de la zona {zona.id}: {ex.Message}", ex);
            }

            return maquinas;
        }


        public List<Orden> ObtenerOrdenesPendientes(ref Linea linea)
        {
            List<Orden> ordenes = new List<Orden>();

            try
            {
                using (var conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (var comando = new SqlCommand("[MES_ObtenerOrdenesPendientes]", conexion))
                    {
                        comando.Parameters.AddWithValue("@linea", linea.id);
                        comando.CommandType = CommandType.StoredProcedure;
                        conexion.Open();

                        using (var dr = comando.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                string id = DataHelper.GetString(dr, "Id");
                                string idOrdenPadre = DataHelper.GetString(dr, "IdOrdenPadre");
                                int idSuborden = DataHelper.GetInt(dr, "IdSuborden");
                                string descripcion = DataHelper.GetString(dr, "Descripcion");
                                EstadoOrden estadoOrden = new EstadoOrden(DataHelper.GetInt(dr, "IdEstadoAct"));

                                string idTipoProducto = dr["IdTipoProducto"].ToString();
                                string tipoProductoName = dr["TipoProducto"].ToString();
                                TipoProducto tipoProducto = new TipoProducto(idTipoProducto, tipoProductoName);

                                string idProducto = dr["IdProducto"].ToString();
                                string productoName = string.Join(" ", dr["Producto"].ToString().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                                string udMedida = dr["udMedida"].ToString();
                                Producto producto = new Producto(idProducto, productoName, udMedida, tipoProducto, null)
                                {
                                    hectolitros = (double)DataHelper.GetDecimal(dr, "HectolitrosProducto")
                                };

                                NivelDisponibilidad nivelDisponibilidad = new NivelDisponibilidad(2, "Medio", "greenBall.png");

                                int cantidadPlanificada = (int)dr.GetDouble(dr.GetOrdinal("CantidadPlanificada"));
                                DateTime fechaInicioReal = DataHelper.GetDate(dr, "FecIniReal");
                                DateTime fechaFinReal = DataHelper.GetDate(dr, "FecFinReal");
                                DateTime fechaIniEstimada = DataHelper.GetDate(dr, "FecIniEstimada");
                                DateTime fechaFinEstimada = DataHelper.GetDate(dr, "FecFinEstimada");

                                DatosProduccionOrden datosProdOrden = new DatosProduccionOrden()
                                {
                                    paletsProducidos = (int)dr.GetDouble(dr.GetOrdinal("CantidadProducida")),
                                    cantidadPicosCajas = Convert.ToInt32(dr["PicosCajas"])
                                };

                                double velocidadNominad = DataHelper.GetDouble(dr, "VelocidadNominal");
                                double oeeObjetivo = DataHelper.GetDouble(dr, "OEEObjetivo");
                                double oeeCritico = DataHelper.GetDouble(dr, "OEECritico");
                                string codigoJDE = DataHelper.GetString(dr, "CodigoJDE");
                                double oee = DataHelper.GetDouble(dr, "OEE");
                                double calidad = DataHelper.GetDouble(dr, "Calidad");
                                int rechazos = DataHelper.GetInt(dr, "Rechazos");
                                DateTime rowUpdated = DataHelper.GetDate(dr, "RowUpdated");
                                double? oeePreactor = dr["OEEPreactor"] == DBNull.Value ? null : (double?)dr["OEEPreactor"];
                                int envasesPorPalet = DataHelper.GetInt(dr, "EnvasesPorPalet");
                                int cajasPorPalet = DataHelper.GetInt(dr, "CajasPorPalet");
                                Tipos.Pausa tipoPausa = DataHelper.GetString(dr, "CausaPausa").ToEnum<Tipos.Pausa>();

                                var orden = new Orden(id, idOrdenPadre, idSuborden, descripcion, estadoOrden, producto, nivelDisponibilidad,
                                                      cantidadPlanificada, fechaInicioReal, fechaFinReal, fechaIniEstimada, fechaFinEstimada,
                                                      datosProdOrden, velocidadNominad, oeeObjetivo, oeeCritico, codigoJDE, oee, calidad,
                                                      rechazos,ref  linea, rowUpdated, oeePreactor)
                                {
                                    CajasPorPalet = cajasPorPalet,
                                    EnvasesPorPalet = envasesPorPalet,
                                    TipoPausa = tipoPausa
                                };

                                ordenes.Add(orden);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.ObtenerOrdenesPendientes", "WEB-PLANTA", "Sistema");
                throw new Exception($"Error al obtener las órdenes pendientes para la línea {linea.id}: {ex.Message}", ex);
            }

            // Calcular duraciones
            foreach (var orden in ordenes)
            {
                orden.duracion = DAO_Orden.ObtenerDuracion(orden.idLinea, orden.dFecInicioEstimado, orden.dFecFinEstimado);
                orden.duracionReal = DAO_Orden.ObtenerDuracionReal(orden.id);
            }

            return ordenes;
        }


        public List<Orden> ObtenerOrdenesActivas(ref Linea linea)
        {
            List<Orden> ordenes = new List<Orden>();

            try
            {
                using (var conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                using (var comando = new SqlCommand("[MES_ObtenerOrdenesActivasV2]", conexion))
                {
                    comando.Parameters.AddWithValue("@linea", linea.id);
                    comando.CommandType = CommandType.StoredProcedure;

                    conexion.Open();

                    using (var dr = comando.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            string id = DataHelper.GetString(dr, "Id");
                            string descripcion = DataHelper.GetString(dr, "Descripcion");
                            EstadoOrden estadoOrden = new EstadoOrden(DataHelper.GetInt(dr, "IdEstadoAct"));

                            string idTipoProducto = DataHelper.GetString(dr, "IdTipoProducto");
                            string tipoProductoName = DataHelper.GetString(dr, "TipoProducto");
                            TipoProducto tipoProducto = new TipoProducto(idTipoProducto, tipoProductoName);

                            string idProducto = DataHelper.GetString(dr, "IdProducto");
                            string productoName = string.Join(" ", DataHelper.GetString(dr, "Producto").Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                            string udMedida = DataHelper.GetString(dr, "udMedida");
                            Producto producto = new Producto(idProducto, productoName, udMedida, tipoProducto, null)
                            {
                                hectolitros = (double)DataHelper.GetDecimal(dr, "HectolitrosProducto")
                            };

                            NivelDisponibilidad nivelDisponibilidad = new NivelDisponibilidad(2, "Medio", "greenBall.png");

                            int cantidadPlanificada = DataHelper.GetInt(dr, "CantidadPlanificada");
                            DateTime fechaInicioReal = DataHelper.GetDate(dr, "FecIniReal");
                            DateTime fechaFinReal = DataHelper.GetDate(dr, "FecFinReal");
                            DateTime fechaIniEstimada = DataHelper.GetDate(dr, "FecIniEstimada");
                            DateTime fechaFinEstimada = DataHelper.GetDate(dr, "FecFinEstimada");

                            DatosProduccionOrden datosProdOrden = new DatosProduccionOrden()
                            {
                                paletsProducidos = DataHelper.GetInt(dr, "CantidadProducida"),
                                cantidadPicosCajas = DataHelper.GetInt(dr, "PicosCajas")
                            };

                            double velocidadNominal = DataHelper.GetDouble(dr, "VelocidadNominal");
                            double oeeObjetivo = Math.Round(DataHelper.GetDouble(dr, "OEEObjetivo"), 2, MidpointRounding.AwayFromZero);
                            double oeeCritico = Math.Round(DataHelper.GetDouble(dr, "OEECritico"), 2, MidpointRounding.AwayFromZero);
                            string codigoJDE = DataHelper.GetString(dr, "CodigoJDE");
                            double oee = DataHelper.GetDouble(dr, "OEE");
                            double calidad = DataHelper.GetDouble(dr, "Calidad");
                            int rechazos = DataHelper.GetInt(dr, "Rechazos");
                            DateTime rowUpdated = DataHelper.GetDate(dr, "RowUpdated");
                            double? oeePreactor = dr["OEEPreactor"] == DBNull.Value ? null : (double?)dr["OEEPreactor"];
                            if (oeePreactor.HasValue)
                            {
                                oeePreactor = Math.Round(oeePreactor.Value, 2, MidpointRounding.AwayFromZero);
                            }
                            int envasesPorPalet = DataHelper.GetInt(dr, "EnvasesPorPalet");
                            int cajasPorPalet = DataHelper.GetInt(dr, "CajasPorPalet");
                            Tipos.Pausa tipoPausa = DataHelper.GetString(dr, "CausaPausa").ToEnum<Tipos.Pausa>();
                            string idOrdenPadre = DataHelper.GetString(dr, "IdOrdenPadre");
                            int idSuborden = DataHelper.GetInt(dr, "IdSuborden");

                            var orden = new Orden(id, idOrdenPadre, idSuborden, descripcion, estadoOrden, producto, nivelDisponibilidad, cantidadPlanificada,
                                                   fechaInicioReal, fechaFinReal, fechaIniEstimada, fechaFinEstimada, datosProdOrden, velocidadNominal,
                                                   oeeObjetivo, oeeCritico, codigoJDE, oee, calidad, rechazos,ref linea, rowUpdated, oeePreactor)
                            {
                                CajasPorPalet = cajasPorPalet,
                                EnvasesPorPalet = envasesPorPalet,
                                TipoPausa = tipoPausa
                            };

                            ordenes.Add(orden);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.ObtenerOrdenesActivas", "WEB-PLANTA", "Sistema");
                throw new Exception($"Error al obtener las órdenes activas para la línea {linea.id}: {ex.Message}", ex);
            }

            // Llamadas fuera del bloque try-catch para no afectar la ejecución si hay un error en la consulta de SQL
            foreach (var orden in ordenes)
            {
                orden.duracion = DAO_Orden.ObtenerDuracion(orden.idLinea, orden.dFecInicioEstimado, orden.dFecFinEstimado);
                orden.duracionReal = DAO_Orden.ObtenerDuracionReal(orden.id);
            }

            return ordenes;
        }


        public void actualizarOrdenes(ref Linea linea)
        {
            //Obtenemos las nuevas ordenes
            List<Orden> ordenesActPendientes = this.ObtenerOrdenesPendientes(ref linea);
            List<Orden> ordenesActActivas = this.ObtenerOrdenesActivas(ref linea);

            //Adds
            foreach (Orden ordenAct in ordenesActPendientes)
            {
                Orden ordenAntPen = linea.ordenesPendientes.Find(orden => orden.id == ordenAct.id);
                if (ordenAntPen != null)
                {
                    ordenAct.produccion = ordenAntPen.produccion;
                }
                else
                {
                    Orden ordenAntAct = linea.ordenesActivas.Find(orden => orden.id == ordenAct.id);
                    if (ordenAntAct != null)
                    {
                        ordenAct.produccion = ordenAntAct.produccion;
                    }
                }
            }

            //Adds
            foreach (Orden ordenAct in ordenesActActivas)
            {
                Orden ordenAntAct = linea.ordenesActivas.Find(orden => orden.id == ordenAct.id);
                if (ordenAntAct != null)
                {
                    ordenAct.produccion = ordenAntAct.produccion;
                }
                else
                {
                    Orden ordenAntPen = linea.ordenesPendientes.Find(orden => orden.id == ordenAct.id);
                    if (ordenAntPen != null)
                    {
                        ordenAct.produccion = ordenAntPen.produccion;
                    }
                }
            }

            //Nuevas Pendientes
            linea.ordenesPendientes.Clear();
            linea.ordenesPendientes.AddRange(ordenesActPendientes);
            //Nuevas Activas
            linea.ordenesActivas.Clear();
            linea.ordenesActivas.AddRange(ordenesActActivas);
        }

        public Hashtable ObtenerOrdenesZonas()
        {
            Hashtable zonasOrden = new Hashtable();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;

            string consulta = "MES_ObtenerOrdenesZonasV2";
            SqlCommand comando = new SqlCommand(consulta, conexion);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read()) // Cambios en el estado de ordenes ya asignadas a lineas
                {
                    string idLinea = dr.GetString(0);
                    string zona = dr.GetString(1);
                    string orden = dr.GetString(2);

                    zonasOrden.Add(zona, new object[2] { orden, idLinea });
                }
                return zonasOrden;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.ObtenerOrdenesZonas", "WEB-PLANTA", "Sistema");
                return zonasOrden;
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }
        }

        /// <summary>
        /// Obtiene las zonas compartidas de una zona
        /// </summary>
        /// <param name="idZona">Id de la zona de la que se quieren obtener sus zonas compartidas</param>
        /// <returns>Lista con las zonas compartidas</returns>
        internal List<ZonaCompartida> obtenerZonasCompartidas(string idZona)
        {
            List<ZonaCompartida> lstZonasCompartidas = ObtenerZonasConfiguradasComoCompartidas(idZona);
            lstZonasCompartidas.AddRange(ObtenerZonasCompartidasVirtuales(idZona));
            return lstZonasCompartidas;
        }

        private static List<ZonaCompartida> ObtenerZonasConfiguradasComoCompartidas(string idZona)
        {
            List<ZonaCompartida> lstZonasCompartidas = new List<ZonaCompartida>();
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerZonasCompartidas]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@IdZona", idZona);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);

                            foreach (DataRow row in dt.Rows)
                            {
                                string id = row["Id"].ToString();
                                string nombreZona = row["NombreZona"].ToString();
                                string descZona = row["DescripcionZona"].ToString();
                                int numLinea = (int)row["NumLinea"];
                                string numLineaDesc = (string)row["NumeroLineaDescripcion"];
                                ZonaCompartida zonaCompartida = new ZonaCompartida()
                                {
                                    Id = id,
                                    Nombre = nombreZona,
                                    Descripcion = descZona,
                                    NumLinea = numLinea,
                                    NumLineaDescripcion = numLineaDesc
                                };

                                lstZonasCompartidas.Add(zonaCompartida);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.ObtenerZonasConfiguradasComoCompartidas", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ZONAS"));
            }

            return lstZonasCompartidas;
        }

        private static List<ZonaCompartida> ObtenerZonasCompartidasVirtuales(string idZona)
        {
            List<ZonaCompartida> lstZonasCompartidas = new List<ZonaCompartida>();
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerZonasCompartidasVirtuales]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@IdZona", idZona);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);

                            foreach (DataRow row in dt.Rows)
                            {
                                string id = row["Id"].ToString();
                                string nombreZona = row["NombreZona"].ToString();
                                string descZona = row["DescripcionZona"].ToString();
                                int numLinea = (int)row["NumLinea"];
                                string numLineaDescripcion = (string)row["NumLineaDescripcion"];

                                ZonaCompartida zonaCompartida = new ZonaCompartida()
                                {
                                    Id = id,
                                    Nombre = nombreZona,
                                    Descripcion = descZona,
                                    NumLinea = numLinea,
                                    NumLineaDescripcion = numLineaDescripcion
                                };

                                lstZonasCompartidas.Add(zonaCompartida);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.ObtenerZonasCompartidasVirtuales", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ZONAS"));
            }

            return lstZonasCompartidas;
        }

        /// <summary>
        /// Obtiene los videowall asociados a la planta
        /// </summary>
        /// <returns>Lista de videowalls de la planta</returns>
        public List<VideowallPantallas> ObtenerPantallasVideowall()
        {
            var listaPantallas = new List<VideowallPantallas>();

            using (MESEntities context = new MESEntities())
            {
                listaPantallas = context.VideowallPantallas.AsNoTracking().ToList();
            }

            foreach (var pantalla in listaPantallas)
            {
                pantalla.Nombre = pantalla.Nombre.Replace("Tren", "Línea");
            }

            return listaPantallas;
        }

        /// <summary>
        /// Obtiene la informacion de líneas que pertenecen a una pantalla
        /// </summary>
        /// <param name="idPantalla">Id pantalla</param>
        /// <returns>Un listado con la informacion necesaria de las lineas traidas</returns>
        public List<DTO_Videowall> ObtenerInformacionLineaVideowall(int idPantalla)
        {
            var listaPantallas = new List<DTO_Videowall>();

            using (MESEntities context = new MESEntities())
            {
                //Código antiguo Daniel Alvarez Santiago 24/02/2022
                //listaPantallas = db.VideowallConfiguracion.Where(x => x.IdPantalla == idPantalla).ToList();

                listaPantallas = (from vpn in context.VideowallConfiguracion.AsNoTracking()
                                join vpl in context.VideowallPantallasLineas.AsNoTracking() on vpn.IdPantalla equals vpl.IdPantalla
                                where vpn.IdPantalla == idPantalla
                                select new DTO_Videowall()
                                {
                                    Id = vpl.Id,
                                    IdPantalla = vpl.IdPantalla,
                                    IdLinea = vpl.IdLinea,
                                    Pagina = vpn.Pagina,
                                    Visible = vpn.Visible,
                                    Duracion = vpn.Duracion,
                                }).ToList();
            }

            return listaPantallas;
        }

        /// <summary>
        /// Obtiene la descripción de la planta
        /// </summary>
        /// <param name="pNombre">Nombrede la planta</param>
        /// <returns>descripcion planta</returns>
        internal static string GetDescripcionPlanta(string pNombre)
        {
            string descripcion = string.Empty;
            using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerNombreDescripcionPlanta]", conn))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@equip_name", pNombre);

                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.VarChar);
                    returnParam.Direction = ParameterDirection.ReturnValue;

                    command.Parameters.Add(returnParam);

                    conn.Open();
                    command.ExecuteNonQuery();

                    if (returnParam.Value != DBNull.Value)
                    {
                        descripcion = (string)returnParam.Value;
                    }
                }
            }

            return descripcion;
        }

        public static async Task<bool> ActualizarFechaUltimaEjecucionPerroGuardian(int idProceso)
        {
            try
            {
                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                using (var command = new SqlCommand("UPDATE PerroGuardian SET FechaUltimaEjecucion = GETUTCDATE() WHERE IdProceso = @id", connection))
                {
                    command.Parameters.AddWithValue("@id", idProceso);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace,
                    "DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian", "I-MES-REALTIME", "Sistema");

                return false;
            }
        }

        public static decimal ObtenerOEEFabrica(DateTime desde, DateTime hasta)
        {

            decimal OEE = 0;

            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("SELECT dbo.MES_GetOEEFabricaEntreFechas(@DESDE, @HASTA)", connection))
                    {
                        comando.Parameters.AddWithValue("@DESDE", desde);
                        comando.Parameters.AddWithValue("@HASTA", hasta);

                        connection.Open();
                        OEE = Convert.ToDecimal(comando.ExecuteScalar());
                    }

                    //using (SqlCommand comando = new SqlCommand("[MES_GetOEEFabricaEntreFechas]", connection))
                    //{
                    //    comando.CommandType = CommandType.StoredProcedure;
                    //    comando.Parameters.AddWithValue("@DESDE", desde);
                    //    comando.Parameters.AddWithValue("@HASTA", hasta);

                    //    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Decimal);
                    //    returnParam.Direction = ParameterDirection.ReturnValue;
                    //    returnParam.Precision = 6;
                    //    returnParam.Scale = 2;

                    //    comando.Parameters.Add(returnParam);


                    //    connection.Open();
                    //    comando.ExecuteNonQuery();

                    //    OEE = Convert.ToDecimal(returnParam.Value);

                    //}
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_Planta.ObtenerOEEFabrica", "WEB-VIDEOWALL", "Sistema");
            }

            return OEE;
        }

        public static bool HayNuevaMMPPSinPropiedades()
        {
            using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_PropiedadesMMPP_ComprobarNuevosSinPropiedades]", conn))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    SqlParameter returnParam = new SqlParameter("@Result", SqlDbType.Int);
                    returnParam.Direction = ParameterDirection.ReturnValue;
                    command.Parameters.Add(returnParam);

                    conn.Open();
                    command.ExecuteNonQuery();

                    return Convert.ToBoolean(returnParam.Value);
                }
            }
        }
    }
}
