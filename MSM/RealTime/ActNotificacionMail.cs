using Common.Models.Planta;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Envasado.GestionAlertas;
using MSM.BBDD.Planta;
using MSM.BBDD.Utilidades.Utils;
using MSM.DTO.Envasado;
using MSM.RealTime;
using Quartz;
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;

namespace MSM
{

    public class ActNotificacionMail : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public async void Execute(IJobExecutionContext context)
        {
            try
            {
                if (PlantaRT.activarLogTiemposParosMaquina)
                {
                    DAO_Log.EscribeLog("TIEMPOS DE PAROS DE MÁQUINAS", "INICIO", "Info");
                }
                Stopwatch tim = Stopwatch.StartNew();
                tim.Start();

                await DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian((int)TipoEnumProcesoPerroGuardian.TiempoParosMaquina);

                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    string consulta = "NOT_ObtenerMaquinasParadasPorTiempoConfigurado";
                    DataTable dtMaquinasParadas = new DataTable();
                    JobDataMap dataMap = context.JobDetail.JobDataMap;
                    string pathHTML = dataMap.GetString("jobPath");

                    using (SqlCommand comando = new SqlCommand(consulta, conexion))
                    {
                        comando.CommandType = CommandType.StoredProcedure;
                        var _valueParada = Utilidades.Utils.getValueSection("Envasado", "EstadosMaquina", "Parada");
                        if (_valueParada != null)
                        {
                            comando.Parameters.AddWithValue("@Estado", Convert.ToInt32(_valueParada));
                            using (SqlDataAdapter da = new SqlDataAdapter())
                            {
                                conexion.Open();
                                da.SelectCommand = comando;

                                DataSet ds = new DataSet();

                                da.Fill(ds);

                                if (ds != null && ds.Tables.Count > 0)
                                {
                                    dtMaquinasParadas = ds.Tables[0];

                                    foreach (DataRow row in dtMaquinasParadas.Rows)
                                    {
                                        DTO_MailNotification mailNotification = new DTO_MailNotification()
                                        {
                                            Id = (int)row["Id"],
                                            BodyMessage = (string)row["BodyMessage"],
                                            //SendedOn = row["SendedOn"] == DBNull.Value ? null : (DateTime?)row["SendedOn"],
                                            Subject = (string)row["Subject"],
                                            MachinesConcat = (string)row["IdMailEquipment"],
                                            UserAddress = (string)row["UserAddress"],
                                            IdEquipment = (string)row["IdEquipment"],
                                            DescriptionEquipment = (string)row["DescriptionEquipment"],
                                        };

                                        DAO_Utils.SendMail(mailNotification, pathHTML, false);
                                        DAO_GestionAlertas.MailNotification_UpdateSendedOn(mailNotification.Id);
                                    }
                                }
                            }
                        }
                    }
                }

                if (PlantaRT.activarLogTiemposParosMaquina)
                {
                    DAO_Log.EscribeLog("T_PARO_MAQ-DURACIÓN Proc. almacenado NOT_ObtenerMaquinasParadasPorTiempoConfigurado", tim.Elapsed.ToString(), "Info");
                    DAO_Log.EscribeLog("TIEMPOS DE PAROS DE MÁQUINAS", "FIN", "Info");
                }
                tim.Stop();
            }
            catch(Exception ex)
            {
                if (PlantaRT.activarLogTiemposParosMaquina)
                {
                    DAO_Log.EscribeLog("T_PARO_MAQ-Paros de máquinas", "Error: " + ex.Message, "Error");
                }
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "Realtime/ActNotificacionMail/Execute", "I-MES-REALTIME", "System");
            }
        }
    }
}
