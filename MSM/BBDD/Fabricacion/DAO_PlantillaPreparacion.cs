using BreadMES.Fabricacion;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Web;

namespace MSM.BBDD.Fabricacion
{
    public class DAO_PlantillaPreparacion
    {
        internal static List<TipoOrdenPreparacion> GetTipoPlantillasPreparacion()
        {
            try
            {
                List<TipoOrdenPreparacion> lstPlantilla = new List<TipoOrdenPreparacion>();
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerTiposPlantillasPreparacion]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                TipoOrdenPreparacion tipoOrden = new TipoOrdenPreparacion()
                                {
                                    Id = row["IdTipoPlantilla"] == DBNull.Value ? 0 : (int)row["IdTipoPlantilla"],
                                    Nombre = row["TipoPlantilla"] == DBNull.Value ? string.Empty : (string)row["TipoPlantilla"],
                                    Descripcion = row["TipoPlantilla"] == DBNull.Value ? string.Empty : IdiomaController.GetResourceName((string)row["TipoPlantilla"]),
                                };
                                lstPlantilla.Add(tipoOrden);
                            }
                        }
                    }
                }
                return lstPlantilla;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_PlantillaPreparacion.GetTipoPlantillasPreparacion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_PlantillaPreparacion.GetTipoPlantillasPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }            
        }

        internal static List<PlantillaPreparacion> GetPlantillasPreparacion()
        {
            try
            {
                List<PlantillaPreparacion> lstPlantilla = new List<PlantillaPreparacion>();
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerPlantillasPreparacion]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                TipoOrdenPreparacion tipoOrden = new TipoOrdenPreparacion() 
                                {
                                    Id = row["IdTipoPlantilla"] == DBNull.Value ? 0 : (int)row["IdTipoPlantilla"],
                                    Descripcion = row["TipoPlantilla"] == DBNull.Value ? string.Empty : (string)row["TipoPlantilla"],
                                };
                                PlantillaPreparacion pp = new PlantillaPreparacion()
                                {
                                    IdPlantilla = row["IdPlantilla"] == DBNull.Value ? 0 : (long)row["IdPlantilla"],
                                    Descripcion = row["Descripcion"] == DBNull.Value ? string.Empty : (string)row["Descripcion"],
                                    Tipo = tipoOrden,
                                    IdUbicacion = row["IdUbicacion"] == DBNull.Value ? 0 : (int)row["IdUbicacion"],
                                    Ubicacion = row["Ubicacion"] == DBNull.Value ? string.Empty : (string)row["Ubicacion"],
                                    FechaCreacion = row["FechaCreacion"] == DBNull.Value ? DateTime.MinValue : ((DateTime)row["FechaCreacion"]).ToLocalTime(),
                                    Volumen = row["Volumen"] == DBNull.Value ? 0 : (float)row["Volumen"],
                                    Unidades = row["Unidades"] == DBNull.Value ? string.Empty : (string)row["Unidades"],
                                    NotasSupervisor = row["NotasSupervisor"] == DBNull.Value ? string.Empty : (string)row["NotasSupervisor"],
                                    NotasOficial = row["NotasOficial"] == DBNull.Value ? string.Empty : (string)row["NotasOficial"],
                                };
                                lstPlantilla.Add(pp);
                            }
                        }
                    }
                }
                return lstPlantilla;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_PlantillaPreparacion.GetPlantillasPreparacion", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_PlantillaPreparacion.GetPlantillasPreparacion", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal static bool BorrarMaterialPlantilla(long idDetallePlantilla)
        {
            return PlantillaPreparacionBread.BorrarDetallelPlantilla(idDetallePlantilla);
        }

        internal static bool BorrarMateria(dynamic datos)
        {
            return PlantillaPreparacionBread.BorrarMateria(datos);
        }

        internal static bool EditarMaterialPlantilla(dynamic materialPlantilla)
        {
            return PlantillaPreparacionBread.EditarDetallePlantilla(materialPlantilla);
        }

        internal static bool EditarMaterialOrden(dynamic datos)
        {
            return PlantillaPreparacionBread.EditarMaterialOrden(datos);
        }

        internal static bool CrearMaterialPlantilla(dynamic materialPlantilla)
        {
            return PlantillaPreparacionBread.CrearDetallePlantilla(materialPlantilla);
        }

        

        internal static bool CrearPlantillaPreparacion(dynamic datos, out long idPlantilla)
        {
            return PlantillaPreparacionBread.CrearPlantilla(datos, out idPlantilla);
        }

        internal static bool EditarPlantillaPreparacion(dynamic datos)
        {
            return PlantillaPreparacionBread.EditarPlantilla(datos);
        }

        internal static bool BorrarPlantillaPreparacion(long idPlantilla, string usuario)
        {
            return PlantillaPreparacionBread.BorrarPlantilla(idPlantilla, usuario);
        }

        internal static bool CrearDetallePlantillaPreparacion(dynamic item)
        {
            return PlantillaPreparacionBread.CrearDetallePlantilla(item);
        }
    }
}