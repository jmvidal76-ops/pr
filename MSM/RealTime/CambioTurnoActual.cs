using Microsoft.AspNet.SignalR;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.RealTime;
using Quartz;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;

namespace MSM
{

    public class CambiosTurnoActual : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public void Execute(IJobExecutionContext context)
        {

        }

        public bool ComprobarCambioTurno(IJobExecutionContext context, ref string logStr)
        {
            bool cambioTurno = false;
            SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString);
            SqlDataReader dr = null;

            try
            {
                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-ComprobarCambioTurno", "Inicio", "Info");
                }
                Stopwatch tim = Stopwatch.StartNew();
                tim.Start();

                Stopwatch timer = Stopwatch.StartNew();
                timer.Start();

                string consulta = "NOT_CambiosTurno";
                SqlCommand comando = new SqlCommand(consulta, conexion);

                SqlParameter fecha = new SqlParameter("@fechaHora", SqlDbType.DateTime);
                fecha.Value = context.FireTimeUtc.Value.UtcDateTime.AddSeconds(30);
                comando.Parameters.Add(fecha);
                comando.Parameters.AddWithValue("@idPlanta", PlantaRT.planta.Id);

                comando.CommandType = CommandType.StoredProcedure;

                conexion.Open();
                dr = comando.ExecuteReader();
                List<Turno> turnosNuevos = new List<Turno>();

                while (dr.Read())
                {
                    Linea lin = PlantaRT.planta.lineas.Find(linea => linea.id == DataHelper.GetString(dr, "Linea"));
                    turnosNuevos.Add(new Turno(
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

                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración proc. almacenado NOT_CambiosTurno", tim.Elapsed.ToString(), "Info");
                }
                timer.Restart();

                string infoTurnos = "";
                for (int i = 0; i < PlantaRT.planta.turnoActual.Count; i++)
                {
                    if (PlantaRT.planta.turnoActual[i].tipo.id != turnosNuevos[i].tipo.id)
                    {
                        PlantaRT.planta.turnoActual[i] = turnosNuevos[i];
                        infoTurnos = infoTurnos + turnosNuevos[i].linea.nombre + " -> " + Resources.idioma.ResourceManager.GetString("TURNO" + turnosNuevos[i].tipo.id) + Environment.NewLine;
                    }
                }

                //logStr += " SP01 - Es nuevo turno - " + infoTurnos + " - tiempo: " + tim.Elapsed + ";" + Environment.NewLine;
                //tim.Restart();

                if (infoTurnos != "")
                {
                    DateTime dtNow = context.FireTimeUtc.Value.UtcDateTime;
                    DateTime dtHoraActualUtc = new DateTime(dtNow.Year, dtNow.Month, dtNow.Day).AddHours(dtNow.Hour);
                    cambioTurno = true;
                    
                    reseteoDatosProduccionHoras(context);
                    timer.Restart();

                    foreach (Linea lin in PlantaRT.planta.lineas)
                    {
                        dynamic limitesOEE = DAO_Turnos.ObtenerOEELimitesTurnoLinea(lin.numLinea);
                        lin.oeeObjetivo = limitesOEE.oeeObjetivo;
                        lin.oeeCritico = limitesOEE.oeeCritico;
                    }

                    if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                    {
                        DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración proc. almacenado MES_ObtenerLimitesOEETurnoParametrosLinea para todas las líneas", tim.Elapsed.ToString(), "Info");
                    }
                    timer.Restart();

                    //logStr += " SP02 - Reseteo de datos de producción " + tim.Elapsed + ";" + Environment.NewLine;
                    //tim.Restart();

                    hub.Clients.All.notTurnos(infoTurnos);
                    ActDatosProduccionMaquina dpm = new ActDatosProduccionMaquina();
                    dpm.ActualizarDatosProduccion(context, dtHoraActualUtc, ref logStr);
                    //logStr += " SP03 - Se actualizan datos de producción de máquinas " + tim.Elapsed + ";" + Environment.NewLine;
                    
                    if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                    {
                        DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración método ActualizarDatosProduccion", tim.Elapsed.ToString(), "Info");
                    }
                    timer.Restart();

                    ActDatosProduccionOrden dpo = new ActDatosProduccionOrden();
                    dpo.ActualizarDatosProduccionOrden(dtNow, dtHoraActualUtc);
                    //logStr += " SP04 - Se actualizan datos de producción de órdenes " + tim.Elapsed + ";" + Environment.NewLine;

                    if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                    {
                        DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración método ActualizarDatosProduccionOrden", tim.Elapsed.ToString(), "Info");
                    }
                }

                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración", tim.Elapsed.ToString(), "Info");
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-ComprobarCambioTurno", "Fin", "Info");
                }

                timer.Stop();
                tim.Stop();
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-Método ComprobarCambioTurno", "Error: " + ex.Message, "Error");
                }

                throw ex;
            }
            finally
            {
                if (dr != null && !dr.IsClosed) dr.Close();
                if (conexion.State == ConnectionState.Open) conexion.Close();
            }

            return cambioTurno;
        }

        private void reseteoDatosProduccionHoras(IJobExecutionContext context)
        {
            foreach (Linea lin in PlantaRT.planta.lineas)
            {
                Turno turno = PlantaRT.planta.turnoActual.Find(x => x.linea.id == lin.id);
                List<Maquina> lstllenadoras = lin.llenadoras;
                foreach (Maquina maq in lin.obtenerMaquinas)
                {
                    switch (maq.tipo.nombre)
                    {
                        case "PALETIZADORA":
                        case "LLENADORA":
                        case "ENCAJONADORA":
                        case "EMPAQUETADORA":
                        case "CLASIFICADOR":
                        case "INSPECTOR_BOTELLAS_VACIAS":
                        case "INSPECTOR_SALIDA_LLENADORA":
                        case "INSPECTOR_BOTELLAS_LLENAS"://id 87
                        case "BASCULA": //id 78
                            maq.datosSeguimiento.datosProduccionHoras.Clear();
                            break;
                    }
                }
            }
        }
    }
}