using BreadMES.Envasado;
using Common.Models.Envasado;
using Common.Models.RTDS;
using G2Base;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Envasado;
using MSM.Utilidades;
using ReglasMES;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using Siemens.SimaticIT.MM.Breads.Types;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_Linea
    {
        private const string VELOCIDAD_NOMINAL = "VELOCIDAD_NOMINAL";
        private const string RTDS = "RTDS";

        public static List<ParametrosLinea> obtenerParametrosLinea()
        {
            List<ParametrosLinea> parametrosLineas = new List<ParametrosLinea>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerParametrosLinea]", conexion);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    string idPPR = DataHelper.GetString(dr, "idPPR");
                    string idLinea = DataHelper.GetString(dr, "idLinea");
                    short NumeroLinea = DataHelper.GetShort(dr, "NumeroLinea");
                    string DescripcionLinea = DataHelper.GetString(dr, "DescripcionLinea");
                    string NumeroLineaDescripcion = DataHelper.GetString(dr, "NumeroLineaDescripcion");
                    string idProducto = DataHelper.GetString(dr, "idProducto");
                    string NombreProductoGrid = string.Join(" ", DataHelper.GetString(dr, "NombreProductoGrid").Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                    int VelocidadNominal = DataHelper.GetInt(dr, "VelocidadNominal");
                    int velocidadNominalMaqLimitante = DataHelper.GetInt(dr, "VelocidadNominalMaqLimitante");
                    double OEEObjetivo = Math.Round(DataHelper.GetDouble(dr, "OEEObjetivo"), 2);
                    double OEECritico = Math.Round(DataHelper.GetDouble(dr, "OEECritico"), 2);
                    double OEECalculado = Math.Round(DataHelper.GetDouble(dr, "OEECalculado"), 2);
                    double OEEPreactor = Math.Round(DataHelper.GetDouble(dr, "OEEPreactor"), 2);
                    bool inhabilitarCalculo = DataHelper.GetShort(dr, "InhabilitarCalculo") == 1;
                    string formatoComun = string.IsNullOrEmpty(dr["CodigoFormatoComun"].ToString()) ? string.Empty : string.Format("{0} - {1}", dr["CodigoFormatoComun"].ToString(), dr["DescripcionFormatoComun"].ToString());

                    parametrosLineas.Add(new ParametrosLinea(idPPR, idLinea, NumeroLinea, DescripcionLinea, idProducto, NombreProductoGrid, VelocidadNominal,
                        velocidadNominalMaqLimitante, OEEObjetivo, OEECritico, OEECalculado, OEEPreactor, NumeroLineaDescripcion, inhabilitarCalculo, formatoComun));
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_ParametrosLinea.obtenerParametrosLinea", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_ParametrosLinea.obtenerParametrosLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return parametrosLineas;
        }

        public List<Model.ParametrosDefecto> ObtenerParametrosDefecto()
        {
            using (Model.MESEntities contexto = new Model.MESEntities())
            {
                return contexto.ParametrosDefecto.AsNoTracking().OrderBy(p => p.NumeroLinea).ToList();
            }
        }

        public List<Producto> ObtenerProductosLinea(string idLinea)
        {
            List<Producto> productosLinea = new List<Producto>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerProductosLinea]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    productosLinea.Add(
                        new Producto(
                            DataHelper.GetString(dr, "idProducto"),
                            DataHelper.GetString(dr, "descripcion"),
                            DataHelper.GetString(dr, "UdMedida"),
                            new TipoProducto(dr["IdTipoProducto"].ToString(), dr["TipoProducto"].ToString()), null));
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_ParametrosLinea.obtenerProductosLinea", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_ParametrosLinea.obtenerProductosLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return productosLinea;
        }

        public string[] obtenerPPR(string idLinea, string idProducto)
        {
            string[] ppr = new string[2];
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerPPR]", conexion);
            comando.Parameters.AddWithValue("@idLinea", idLinea);
            comando.Parameters.AddWithValue("@idProducto", idProducto);
            comando.CommandType = CommandType.StoredProcedure;

            try
            {
                conexion.Open();
                dr = comando.ExecuteReader();
                while (dr.Read())
                {
                    ppr[0] = DataHelper.GetString(dr, "PPR");
                    ppr[1] = DataHelper.GetString(dr, "Versionado");
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_ParametrosLinea.obtenerParametrosLinea", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_ParametrosLinea.obtenerParametrosLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return ppr;
        }

        internal static List<Arranque> ObtenerTiposArranqueLinea(int numLinea)
        {
            List<Arranque> lstArranque = new List<Arranque>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerTiposArranqueLinea]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@numLinea", numLinea);

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                Arranque arranque = new Arranque() { Id = Convert.ToInt32(row["Id"]), Descripcion = row["Descripcion"].ToString() };
                                lstArranque.Add(arranque);
                            }
                        }
                        catch (Exception ex)
                        {
                            //DAO_Log.registrarLog(DateTime.Now, "DAO_Linea.obtenerTiposArranqueLinea", ex, "Sistema");
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Linea.obtenerTiposArranqueLinea", "WEB-ENVASADO", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_TIPOS"));
                        }
                    }
                }
            }

            return lstArranque;
        }

        internal static async Task<object> RevisarVelocidadNominalLlenadora(Linea linea)
        {
            //revisa las ordenes en la zona llenadora y primera zona y pone la velocidad nominal correspondiente.
            //si la llenadora tiene orden le pondremos la velocidad de la orden, sino le pondremos el de la primera zona
            //si la primera orden tampoco tiene la velocidadNominal le pondremos la máxima de la línea.
            try
            {
                int numLlenadoras = 0;
                List<Model.Zonas> zonasArranque = new List<Model.Zonas>();
                Model.Zonas zonaPaletera = new Model.Zonas();
                DAO_Orden daoOrden = new DAO_Orden();
                Orden orden = new Orden();
                string ordenIdLlenadora = string.Empty;
                float nuevaVelocidadNominal = 0;

                using (Model.MESEntities contexto = new Model.MESEntities())
                {
                    string llenadora = TipoEnumMaquinasClases.LLENADORA.ToString();
                    numLlenadoras = contexto.MaquinasLineas.AsNoTracking().Where(m => m.Clase == llenadora && m.NumLinea == linea.numLinea).Count();
                    zonasArranque = contexto.Zonas.AsNoTracking().Where(z => z.FK_LINEAS_ID == linea.numLinea && z.ARRANQUE == 1).ToList();
                    zonaPaletera = contexto.Zonas.AsNoTracking().Where(z => z.FK_LINEAS_ID == linea.numLinea && z.PERMITE_PRODUCCION == 1).First();
                }

                //linea.zonas.Where(z => z.Arranque == true).ToList().ForEach(z =>
                zonasArranque.ForEach(z =>
                {
                    if (z.DESC_ZONA.Contains("Llenado")) ordenIdLlenadora = z.ORDER_ID_ANTERIOR;

                    if (z.DESC_ZONA.Contains("Llenado") && !string.IsNullOrEmpty(z.ORDER_ID))
                    {
                        orden = daoOrden.ObtenerOrden(z.ORDER_ID);
                        nuevaVelocidadNominal = (float)orden.velocidadNominal;
                        return;
                    }
                    else if (!string.IsNullOrEmpty(z.ORDER_ID))
                    {
                        orden = daoOrden.ObtenerOrden(z.ORDER_ID);
                        nuevaVelocidadNominal = (float)orden.velocidadNominal;
                    }
                });

                if (nuevaVelocidadNominal == 0)
                {
                    if (string.IsNullOrEmpty(zonaPaletera.ORDER_ID) || zonaPaletera.ORDER_ID != ordenIdLlenadora)
                    {
                        var listaParametrosLinea = obtenerParametrosLinea();
                        nuevaVelocidadNominal = listaParametrosLinea.Where(p => linea.id == p.idLinea).Select(p => p.velocidadNominal).Max();
                    }
                    else
                    {
                        orden = daoOrden.ObtenerOrden(zonaPaletera.ORDER_ID);
                        nuevaVelocidadNominal = (float)orden.velocidadNominal;
                    }
                }

                nuevaVelocidadNominal = (nuevaVelocidadNominal / numLlenadoras);

                RTDSValuesDto tagValues = new RTDSValuesDto()
                {
                    Tags = new List<string>(),
                    TagsValues = new List<object>(),
                    Unit = RTDS
                };

                string lineaCorto = linea.id.Split('.').Last();
                string variableRTDS = lineaCorto + "_" + VELOCIDAD_NOMINAL + "_" + "LLE";
                tagValues.Tags.Add(variableRTDS);
                tagValues.TagsValues.Add(nuevaVelocidadNominal);

                DAO_Tags daoTags = new DAO_Tags();
                var values = await daoTags.writeRTDS(tagValues);

                foreach (var item in values as IEnumerable)
                {
                    if (!Convert.ToBoolean(item))
                    {
                        var mensaje = IdiomaController.GetResourceName("ERROR_RTDS") + "Variable: " + variableRTDS + ", valor: " + nuevaVelocidadNominal;
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, mensaje, "DAO_Orden.RevisarVelocidadNominalLlenadora", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "Exception err: " + ex.Message, "DAO_Linea.RevisarVelocidadNominal", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                return new { err = false, errDesc = "" };
            }

            return new { err = true, errDesc = "" };
        }

        internal static async Task<object> RevisarVelocidadNominalPaletera(Linea linea, List<MaquinasCompartidas> listaMaquinas, string wo)
        {
            //revisa las ordenes en la zona paletizadora y primera zona y pone la velocidad nominal correspondiente.
            //si la paletizadora tiene orden le pondremos la velocidad de la orden, sino le pondremos el de la primera zona
            //si la primera orden tampoco tiene la velocidadNominal le pondremos la máxima de la línea.
            try
            {
                float nuevaVelocidadNominal = 0;
                int numPaleteras;

                using (Model.MESEntities contexto = new Model.MESEntities())
                {
                    if (listaMaquinas == null)
                    {
                        numPaleteras = contexto.MaquinasLineas.AsNoTracking().Where(m => m.Clase == "PALETIZADORA" && m.NumLinea == linea.numLinea).Count();
                    }
                    else
                    {
                        numPaleteras = listaMaquinas.Where(m => m.value).Count();
                    }

                    Model.Particiones particion = contexto.Particiones.AsNoTracking().Where(p => p.Id == wo).FirstOrDefault();
                    if (particion != null)
                    {
                        nuevaVelocidadNominal = (float)particion.VelocidadNominal;
                    }
                }

                if (nuevaVelocidadNominal == 0)
                {
                    var listaParametrosLinea = obtenerParametrosLinea();
                    nuevaVelocidadNominal = listaParametrosLinea.Where(p => linea.id == p.idLinea).Select(p => p.velocidadNominal).Max();
                }

                nuevaVelocidadNominal = numPaleteras == 0 ? 0 : (nuevaVelocidadNominal / numPaleteras);

                RTDSValuesDto tagValues = new RTDSValuesDto()
                {
                    Tags = new List<string>(),
                    TagsValues = new List<object>(),
                    Unit = RTDS
                };

                string lineaCorto = linea.id.Split('.').Last();
                string variableRTDS = lineaCorto + "_" + VELOCIDAD_NOMINAL + "_" + "PAL";
                tagValues.Tags.Add(variableRTDS);
                tagValues.TagsValues.Add(nuevaVelocidadNominal);

                DAO_Tags daoTags = new DAO_Tags();
                var values = await daoTags.writeRTDS(tagValues);

                foreach (var item in values as IEnumerable)
                {
                    if (!Convert.ToBoolean(item))
                    {
                        var mensaje = IdiomaController.GetResourceName("ERROR_RTDS") + "Variable: " + variableRTDS + ", valor: " + nuevaVelocidadNominal;
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, mensaje, "DAO_Orden.RevisarVelocidadNominalPaletera", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "Exception err: " + ex.Message, "DAO_Linea.RevisarVelocidadNominalPaletera", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                return new { err = false, errDesc = "" };
            }

            return new { err = true, errDesc = "" };
        }

        internal static async Task<object> RevisarVelocidadNominalPaleteraZona(Linea linea, List<MaquinasCompartidas> listaMaquinas)
        {
            //revisa las ordenes en la zona paletizadora y primera zona y pone la velocidad nominal correspondiente.
            //si la paletizadora tiene orden le pondremos la velocidad de la orden, sino le pondremos el de la primera zona
            //si la primera orden tampoco tiene la velocidadNominal le pondremos la máxima de la línea.
            try
            {
                float nuevaVelocidadNominal = 0;
                int numPaleteras;

                using (Model.MESEntities contexto = new Model.MESEntities())
                {
                    if (listaMaquinas == null)
                    {
                        numPaleteras = contexto.MaquinasLineas.AsNoTracking().Where(m => m.Clase == "PALETIZADORA" && m.NumLinea == linea.numLinea).Count();
                    }
                    else
                    {
                        numPaleteras = listaMaquinas.Where(m => m.value).Count();
                    }

                    var zonaPaletera = contexto.Zonas.AsNoTracking().Where(z => z.FK_LINEAS_ID == linea.numLinea && z.PERMITE_PRODUCCION == 1).First();
                    if (!string.IsNullOrEmpty(zonaPaletera.ORDER_ID))
                    {
                        DAO_Orden daoOrden = new DAO_Orden();
                        var orden = daoOrden.ObtenerOrden(zonaPaletera.ORDER_ID);
                        nuevaVelocidadNominal = (float)orden.velocidadNominal;
                    }
                }

                if (nuevaVelocidadNominal == 0)
                {
                    var listaParametrosLinea = obtenerParametrosLinea();
                    nuevaVelocidadNominal = listaParametrosLinea.Where(p => linea.id == p.idLinea).Select(p => p.velocidadNominal).Max();
                }

                nuevaVelocidadNominal = numPaleteras == 0 ? 0 : (nuevaVelocidadNominal / numPaleteras);

                RTDSValuesDto tagValues = new RTDSValuesDto()
                {
                    Tags = new List<string>(),
                    TagsValues = new List<object>(),
                    Unit = RTDS
                };

                string lineaCorto = linea.id.Split('.').Last();
                string variableRTDS = lineaCorto + "_" + VELOCIDAD_NOMINAL + "_" + "PAL";
                tagValues.Tags.Add(variableRTDS);
                tagValues.TagsValues.Add(nuevaVelocidadNominal);

                DAO_Tags daoTags = new DAO_Tags();
                var values = await daoTags.writeRTDS(tagValues);

                foreach (var item in values as IEnumerable)
                {
                    if (!Convert.ToBoolean(item))
                    {
                        var mensaje = IdiomaController.GetResourceName("ERROR_RTDS") + "Variable: " + variableRTDS + ", valor: " + nuevaVelocidadNominal;
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_RTDS"), "DAO_Orden.RevisarVelocidadNominalPaletera", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "Exception err: " + ex.Message, "DAO_Linea.RevisarVelocidadNominalPaletera", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                return new { err = false, errDesc = "" };
            }

            return new { err = true, errDesc = "" };
        }

        internal List<Producto> ObtenerProductosSalientesLinea(dynamic datos)
        {
            try
            {
                List<Producto> listaProductos = new List<Producto>();
                string linea = datos.linea.ToString();
                string producto = datos.producto.ToString();
                List<COB_MSM_TIEMPOS_CAMBIOS> listaProductosSalientes = LineasBread.ObtenerProductoSalientesLinea(linea, producto);

                foreach (COB_MSM_TIEMPOS_CAMBIOS cambio in listaProductosSalientes)
                {
                    Definition def = MaterialBread.ObetenerDefinicionProducto(cambio.ID_PRODUCTO_SALIENTE.ToString());

                    if (def != null)
                    {
                        Producto p = new Producto(def.ID, def.Description);
                        MaterialClass mClass = MaterialBread.ObtenerTipoProducto(def.MaterialClassPK);

                        if (mClass != null)
                        {
                            TipoProducto tm = new TipoProducto(mClass.ParentMaterialClassID, mClass.Description);
                            p.tipoProducto = tm;
                        }

                        listaProductos.Add(p);
                    }
                    else
                    {
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Linea.obtenerProductosSalientesLinea", "Producto no encontrado en el sistema: " + cambio.ID_PRODUCTO_SALIENTE.ToString(), "Sistema");
                    }
                }

                return listaProductos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Linea.obtenerProductosSalientesLinea", ex, "Sistema");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Linea.obtenerProductosSalientesLinea", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_PRODUCTOS"));
            }
        }

        internal List<string> ObtenerTiemposObjetivosPreactor(dynamic datos)
        {
            try
            {
                var tiempos = new List<string>();
                string linea = datos.linea.ToString();
                string producto = datos.producto.ToString();
                int tipo = int.Parse(datos.tipo.ToString());
                int numeroLinea = LineasBread.ObtenerNumeroLinea(linea);

                if (tipo == 0)
                {
                    string tipoArranque = datos.tipoArranque.ToString();
                    COB_MSM_TIEMPOS_ARRANQUES tArran = TiemposBread.ObtenerTiempodeArranque(numeroLinea, producto, tipoArranque);

                    if (tArran != null)
                    {
                        tiempos.Add(tArran.TIEMPO_OBJETIVO_1.ToString() + ";" + tArran.TIEMPO_OBJETIVO_2.ToString());
                        tiempos.Add(tArran.TIEMPO_PREACTOR.ToString());
                        return tiempos;
                    }

                    tiempos.Add("0;0");
                    tiempos.Add("0");
                    return tiempos;
                }

                string productoSal = datos.productoSal.ToString();
                COB_MSM_TIEMPOS_CAMBIOS tCamb = TiemposBread.ObtenerTiempodeCambio(numeroLinea, producto, productoSal);

                if (tCamb != null)
                {
                    tiempos.Add(tCamb.TIEMPO_OBJETIVO_1.ToString() + ";" + tCamb.TIEMPO_OBJETIVO_2.ToString());
                    tiempos.Add(tCamb.TIEMPO_PREACTOR.ToString());
                    return tiempos;
                }

                tiempos.Add("0;0");
                tiempos.Add("0");
                return tiempos;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Linea.ObtenerTiemposObjetivosPreactor", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_TIEMPOS"));
            }
        }

        internal static void ModificarMaquinasMultilinea()
        {
            try
            {
                PMConnectorBase.Connect();

                using (ModificarAsignacionMaquinaMultilinea re = new ModificarAsignacionMaquinaMultilinea(PMConnectorBase.PmConexion))
                {
                    CallResult resRegla = new CallResult();
                    resRegla = re.Start();

                    switch (resRegla)
                    {
                        case CallResult.CR_Ok: //no registramos si esta ok
                            break;
                        case CallResult.CR_Timedout:
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "Err timeout: " + resRegla.GetValue(), "DAO_Linea.ModificarAsignacionMaquinaMultilinea", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                            break;
                        default:
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, "Err: " + resRegla.GetValue(), "DAO_Linea.ModificarAsignacionMaquinaMultilinea", "I-MES-WO", HttpContext.Current.User.Identity.Name);
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Linea.ModificarMaquinasMultilinea", "WEB-ENVASADO", "Sistema");
            }
        }
    }
}
