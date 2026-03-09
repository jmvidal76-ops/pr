using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MSM.Models.Envasado;
using System.Data.SqlClient;
using System.Configuration;
using System.Data;
using System.Collections;
using MSM.BBDD.Planta;
using BreadMES.Envasado;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using MSM.Controllers.Planta;
using ReglasMES;
using G2Base;

namespace MSM.BBDD.Envasado
{
    public class DAO_Contingencias
    {
        public List<ContingenciaCantidad> obtenerContingencias(Int64 fechaInicio, Int64 fechaFin, string linea)
        {

            List<ContingenciaCantidad> result = new List<ContingenciaCantidad>();
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerContingencias]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@fini", fechaInicio);
            comando.Parameters.AddWithValue("@ffin", fechaFin);
            comando.Parameters.AddWithValue("@linea", linea);

            try
            {

                conexion.Open();
                dr = comando.ExecuteReader();

                while (dr.Read())
                {
                    result.Add(new ContingenciaCantidad()
                    {
                        ID = Int32.Parse(dr["ID"].ToString()),
                        Fecha = dr["Fecha"].ToString(),
                        Turno = dr["Turno"].ToString(),
                        envLlenadora = Int32.Parse(dr["envLlenadora"].ToString()),
                        palPaletizadora = Int32.Parse(dr["palPaletizadora"].ToString()),
                        env_vacios = Int32.Parse(dr["ENVASES_VACIOS_RECHAZADOS"].ToString()),
                        env_llenos = Int32.Parse(dr["ENVASES_LLENOS_RECHAZADOS"].ToString())

                    });
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Contingencias.obtenerContingencias", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Contingencias.obtenerContingencias", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return result;

        }

        internal List<DTO.DTO_ContingenciasHoras> ObtenerSubGrid(Int64 fecha, string turno, string linea)
        {
            List<DTO.DTO_ContingenciasHoras> result = new List<DTO.DTO_ContingenciasHoras>();
            int idturno = 0;
            switch (turno)
            {
                case "Mañana": idturno = 1; break;
                case "Tarde": idturno = 2; break;
                case "Noche": idturno = 3; break;
                default: idturno = 0; break;
            }

            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;
            SqlCommand comando = new SqlCommand("[MES_ObtenerHorasContingencias]", conexion);
            comando.CommandType = CommandType.StoredProcedure;
            comando.Parameters.AddWithValue("@fecha", fecha);
            comando.Parameters.AddWithValue("@turno", idturno);
            comando.Parameters.AddWithValue("@linea", linea);

            try
            {

                conexion.Open();
                dr = comando.ExecuteReader();

                while (dr.Read())
                {
                    result.Add(new DTO.DTO_ContingenciasHoras()
                    {
                        ID = Int32.Parse(dr["ID"].ToString()),
                        _hora = dr["Hora"].ToString(),
                        eLlenadora = Int32.Parse(dr["eLlenadora"].ToString()),
                        pPaletizadora = Int32.Parse(dr["pPaletizadora"].ToString()),
                        env_vacios = Int32.Parse(dr["rLlenadora"].ToString()),
                        env_llenos = Int32.Parse(dr["rPaletizadora"].ToString()),
                        Turno = Int32.Parse(dr["Turno"].ToString()),
                        Fecha = DateTime.Parse(dr["Fecha"].ToString())
                    });
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Contingencias.obtenerContingencias", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Contingencias.ObtenerSubGrid --> procedure MES_ObtenerHorasContingencias", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LAS"));
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return result;
        }

        internal static object Call_Interface_JDE(string estado, string woId, string usuario)
        {
            string errDesc = IdiomaController.GetResourceName("ERROR_LLAMANDO_INTERFAZJDE");

            
            if (woId.Contains(".") && (estado == "Cerrada" || estado == "Cancelada" || estado == "Pausada" || estado == "Producción" || estado == "Finalizada"))
            {
                //primero comunicaremos la orden si es cerrada o cancelada

                if (estado == "Cerrada" || estado == "Cancelada")
                {
                    //Cogemos la orden padre y lanzamos la regla en sincrono
                    PMConnectorBase.Connect();
                    using (InterfazJDEChangeStatusWO reglaObj = new InterfazJDEChangeStatusWO(PMConnectorBase.PmConexion))
                    {


                        CallResult resRegla = reglaObj.Call(estado, woId.Split('.')[0]); // woIdSaliente.Split('.')[0], woIdSaliente, lineaPath);
                        if (resRegla != null)
                        {
                            switch (resRegla)
                            {
                                case CallResult.CR_Ok:
                                    //se lanza de forma asincrono no tiene sentido registrar esto
                                    //DAO_Log.registrarLogBook("WEB-BACKEND", 3, 1, "Llamanda desde .Net a la regla a actualizar WO y CONSOLIDADOS de máquinas. zona: " + z.id, "DAO_ORDEN.actualizarConsolidadosWOMaquinasZona", "I-MES-WO", usuario);
                                    break;
                                case CallResult.CR_Timedout:
                                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, errDesc + " (err Timeout) ", "DAO_Continfencia.Call_Interface_JDE", "I-MES-WO", usuario);
                                    return new { err = false, errDesc = errDesc };
                                default:
                                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, errDesc + " Err: " + resRegla.ToString(), "DAO_Continfencia.Call_Interface_JDE", "I-MES-WO", usuario);
                                    return new { err = false, errDesc = errDesc };
                            }
                        }
                        else
                        {
                            return new { err = false, errDesc = errDesc + " CallResult is null" };
                        }
                    }

                }

                //es particion y el estado es cerrada o cancelada
                PMConnectorBase.Connect();
                using (InterfazJDEChangeStatusWOpart reglaObj = new InterfazJDEChangeStatusWOpart(PMConnectorBase.PmConexion))
                {


                    CallResult resRegla = reglaObj.Start(estado, woId); // woIdSaliente.Split('.')[0], woIdSaliente, lineaPath);
                    if (resRegla != null)
                    {
                        switch (resRegla)
                        {
                            case CallResult.CR_Ok:
                                //se lanza de forma asincrono no tiene sentido registrar esto
                                //DAO_Log.registrarLogBook("WEB-BACKEND", 3, 1, "Llamanda desde .Net a la regla a actualizar WO y CONSOLIDADOS de máquinas. zona: " + z.id, "DAO_ORDEN.actualizarConsolidadosWOMaquinasZona", "I-MES-WO", usuario);
                                break;
                            case CallResult.CR_Timedout:
                                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, errDesc + " (err Timeout) ", "DAO_Continfencia.Call_Interface_JDE_Part", "I-MES-WO", usuario);
                                return new { err = false, errDesc = errDesc };
                            default:
                                DAO_Log.RegistrarLogBook("WEB-BACKEND", 5, 2, errDesc + " Err: " + resRegla.ToString(), "DAO_Continfencia.Call_Interface_JDE_Part", "I-MES-WO", usuario);
                                return new { err = false, errDesc = errDesc };
                        }
                    }
                    else
                    {
                        return new { err = false, errDesc = errDesc + " CallResult is null" };
                    }
                }

            }
           
            return new { err = true, errDesc = "" };
           
        }

        internal static bool Editar_WO_JDE_Status(string estado, string woId)
        {
            return ContingenciaBread.Editar_WO_JDE_Status(estado, woId);
        }

        internal static bool CrearHistoricoOffset(COB_MSM_HISTORICO_ORDENES cobHistorico)
        {
            return ContingenciaBread.CrearHistoricoOffset(cobHistorico);
        }
    }
}
