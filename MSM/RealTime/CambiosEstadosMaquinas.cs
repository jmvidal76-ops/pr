using Common.Models.Planta;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.RealTime;
using MSM.Utilidades;
using Quartz;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Data.SqlTypes;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace MSM
{

    public class CambiosEstadosMaquinas : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        private static readonly object lockerCambiosEstadosMaquinas = new object();
        public class CambiosEstado
        {
            public List<string> Lineas { get; } = new List<string>();
            public List<dynamic> Llenadoras { get; } = new List<dynamic>();

            public bool TieneCambios => Lineas.Count > 0 || Llenadoras.Count > 0;

            public void AgregarCambioLinea(string lineaId)
            {
                if (!Lineas.Contains(lineaId))
                {
                    Lineas.Add(lineaId);
                }
            }
            public void AgregarCambioLlenadora(dynamic llenadora)
            {
                Llenadoras.Add(llenadora);
            }
        }

        public async void Execute(IJobExecutionContext context)
        {
            try
            {
                if (PlantaRT.activarLogCambioEstadoMaquinas)
                    DAO_Log.EscribeLog("CAMBIOS DE ESTADO DE MÁQUINAS", "INICIO", "Info");

                Stopwatch tim = Stopwatch.StartNew();
                await DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian((int)TipoEnumProcesoPerroGuardian.CambioEstadoMaquina)
                    .ConfigureAwait(false);

                DateTime? lastUpdate = getLastUpdate();
                var ds = await ObtenerDatosAsync(lastUpdate);

                if (ds.Tables.Count < 2)
                {
                    DAO_Log.EscribeLog("ERROR: No se obtuvieron datos esperados.", "Error", "Error");
                    return;
                }

                // Procesamos las tablas
                var cambiosEstado = new CambiosEstado();

                await ProcesarEstadosNuevosAsync(ds.Tables[0], cambiosEstado);
                await ProcesarMaquinasDesconectadasAsync(ds.Tables[1], cambiosEstado);

                // Si hubo cambios, notificamos
                if (cambiosEstado.TieneCambios)
                    await NotificarCambiosAsync(cambiosEstado);

                if (PlantaRT.activarLogCambioEstadoMaquinas)
                    DAO_Log.EscribeLog("CAMBIOS DE ESTADO DE MÁQUINAS", "FIN", "Info");
            
            }
            catch (SqlException sqlEx)
            {
                DAO_Log.EscribeLog("ERROR SQL", sqlEx.Message, "Error");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, $"{sqlEx.Message} -> {sqlEx.StackTrace}",
                    "CambiosEstadosMaquinas.Execute", "I-MES-REALTIME", "Sistema");
            }
            catch (Exception ex)
            {
                DAO_Log.EscribeLog("ERROR GENERICO", ex.Message, "Error");
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, $"{ex.Message} -> {ex.StackTrace}",
                    "CambiosEstadosMaquinas.Execute", "I-MES-REALTIME", "Sistema");
            }
        }

        private async Task<DataSet> ObtenerDatosAsync(DateTime? lastUpdate)
        {
            DataSet ds = new DataSet();
            using (var conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            using (var comando = new SqlCommand("NOT_CambiosMaquinas", conexion))
            using (var da = new SqlDataAdapter(comando))
            {
                comando.CommandType = CommandType.StoredProcedure;
                comando.Parameters.AddWithValue("@lastUpdate", lastUpdate ?? SqlDateTime.MinValue);

                await conexion.OpenAsync();
                await Task.Run(() => da.Fill(ds)); // Llenar el DataSet con las dos tablas
            }

            return ds;
        }
        private async Task ProcesarEstadosNuevosAsync(DataTable dtEstadosNuevos, CambiosEstado cambiosEstado)
        {
            foreach (var row in dtEstadosNuevos.AsEnumerable())
            {
                string linea = row.Field<string>("Linea");
                string zona = row.Field<string>("Zona");
                string idMaquina = row.Field<string>("IdMaquina");
                int estado = row.Field<int>("Estado");
                DateTime fechaAct = row.Field<DateTime>("FechaAct");

                Linea lin = PlantaRT.planta.lineas.FirstOrDefault(l => l.id == linea);
                Zona zon = lin?.zonas.FirstOrDefault(z => z.id == zona);
                Maquina maq = zon?.maquinas.FirstOrDefault(m => m.nombre == idMaquina);

                if (maq != null && maq.estado.id.GetValue() != estado)
                {
                    lock (lin)
                    {
                        lock (maq)
                        {
                            maq.estado = new EstadoMaquina(estado.ToString().ToEnum<Tipos.EstadosMaquina>());
                            cambiosEstado.AgregarCambioLinea(lin.id);  // Registra el cambio de línea
                        }
                    }
                }

                if (maq != null)
                {
                    maq.FechaActualizacion = fechaAct;
                }
            }
        }

        /// <summary>
        /// Creamos objeto dinámico que tendrá el futuro mensaje que se enviará a la parte cliente
        /// </summary>
        /// <param name="lin">Linea donde se ha producido el cambio de estado</param>
        /// <param name="maq">Máquina donde se ha producido el cambio de estado</param>
        private void setMensajeCambioEstado(Linea lin, Maquina maq, dynamic cambioEstado)
        {
            try
            {
                List<int> lineas = (List<int>)cambioEstado.lineas;
                if (lineas.Count > 0 || !lineas.Any(l => l == lin.numLinea))
                {
                    lineas.Add(lin.numLinea);
                }

                if (maq.tipo.nombre.Equals("LLENADORA"))
                {
                    List<dynamic> llenadoras = (List<dynamic>)cambioEstado.llenadoras;

                    dynamic maquina = new System.Dynamic.ExpandoObject();
                    maquina.nombreMaquina = maq.nombre;
                    maquina.estadoMaquina = maq.estado.id == Tipos.EstadosMaquina.Produccion ? "produccion" : "parada";
                    maquina.numLinea = lin.numLinea;

                    llenadoras.Add(maquina);
                }

            }
            catch(Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, $"{ex.Message} -> {ex.StackTrace}",
                    "CambiosEstadosMaquinas.setMensajeCambioEstado", "I-MES-REALTIME", "Sistema");
            }
        }

        private async Task ProcesarMaquinasDesconectadasAsync(DataTable dtMaquinasDesc, CambiosEstado cambiosEstado)
        {
            var lineasDict = dtMaquinasDesc.AsEnumerable()
                .GroupBy(row => row.Field<string>(0))
                .ToDictionary(g => g.Key, g => g.Select(r => r.Field<string>(1)).Distinct().ToList());

            foreach (var lineaEntry in lineasDict)
            {
                string linea = lineaEntry.Key;
                Linea lin = PlantaRT.planta.lineas.FirstOrDefault(p => p.id == linea);
                if (lin == null) continue;

                foreach (string zona in lineaEntry.Value)
                {
                    Zona zon = lin.zonas.FirstOrDefault(z => z.id == zona);
                    if (zon == null) continue;

                    List<string> listMaquinasDesc = dtMaquinasDesc.AsEnumerable()
                        .Where(row => row.Field<string>(0) == linea && row.Field<string>(1) == zona)
                        .Select(row => row.Field<string>(2))
                        .ToList();

                    foreach (var maquina in zon.maquinas)
                    {
                        if (listMaquinasDesc.Contains(maquina.nombre) && maquina.estado.id != Tipos.EstadosMaquina.NoConectada)
                        {
                            maquina.estado = new EstadoMaquina(Tipos.EstadosMaquina.NoConectada);
                            cambiosEstado.AgregarCambioLinea(lin.id);  // Registra el cambio de línea
                        }
                    }
                }
            }
        }

        private async Task NotificarCambiosAsync(CambiosEstado cambiosEstado)
        {
            // Enviar notificación (esto podría implicar un servicio de mensajería o un procesamiento posterior)
            NotificarCambios(cambiosEstado);
        }

        private DateTime? getLastUpdate()
        {
            List<Maquina> lstMaquinas = new List<Maquina>();
            foreach (Linea linea in PlantaRT.planta.lineas)
            {
                foreach (Zona zona in linea.zonas)
                {
                    lstMaquinas.AddRange(zona.maquinas);
                }
            }

            return lstMaquinas.Count > 0 ? lstMaquinas.Max(m => m.FechaActualizacion) : (DateTime?)null;
        }

        /// <summary>
        /// Método para notificar cambios de estado de máquinas.
        /// </summary>
        /// <param name="cambiosEstado"></param>
        private void NotificarCambios(dynamic cambiosEstado)
        {
            hub.Clients.All.notCambiosEstadoMaquina(cambiosEstado);
        }
    }

    

}