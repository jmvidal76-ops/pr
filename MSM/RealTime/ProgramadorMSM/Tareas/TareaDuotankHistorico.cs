using Common.Models.Planta;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Logistica;
using MSM.BBDD.Planta;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.RealTime
{
    public class TareaDuotankHistorico : ITareaMSM
    {
        public string Nombre { get => NOMBRE; }
        public TipoEnumProcesoPerroGuardian Tipo { get => TipoEnumProcesoPerroGuardian.ActualizarDuotank; }
        public static string NOMBRE { get => "ActDuotank"; }

        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public async Task Tarea()
        {
            var ultimosDatosDuotank = DAO_Logistica.UltimosDatosDuotank;

            // Si no tenemos información, se obtienen los últimos datos de la zona en la tabla DuotankHistorico
            if (ultimosDatosDuotank == null)
            {
                ultimosDatosDuotank = DAO_Logistica.ObtenerUltimosDatosDuotankHistorico();
            }

            var nuevosDatosDuotank = await DAO_Logistica.ObtenerDuotankDatos();
            //var nuevosDatosDuotank = await DAO_Logistica.ObtenerDuotankSimulado();

            // Para la primera vez cuando no tenemos nada en la tabla DuotankHistorico
            if (ultimosDatosDuotank.Count == 0)
            {
                foreach (var nuevoDato in nuevosDatosDuotank)
                {
                    DAO_Logistica.GuardarDuotankHistorico(nuevoDato.ZonaCarga.Id, nuevoDato.Matricula, nuevoDato.Operacion, nuevoDato.PorcentajeLlenado);
                }
            }
            else
            {
                for (int i = 0; i < nuevosDatosDuotank.Count; i++)
                {
                    if (nuevosDatosDuotank[i].Matricula == ultimosDatosDuotank[i].Matricula && nuevosDatosDuotank[i].Operacion == ultimosDatosDuotank[i].Operacion &&
                        nuevosDatosDuotank[i].PorcentajeLlenado == ultimosDatosDuotank[i].PorcentajeLlenado)
                    {
                        continue;
                    }

                    string mensaje = "Matricula antigua: " + ultimosDatosDuotank[i].Matricula + ". Matricula nueva: " + nuevosDatosDuotank[i].Matricula +
                        ". Operacion antigua: " + ultimosDatosDuotank[i].Operacion + ". Operacion nueva: " + nuevosDatosDuotank[i].Operacion +
                        ". Porcentaje antiguo: " + ultimosDatosDuotank[i].PorcentajeLlenado + ". Porcentaje nuevo: " + nuevosDatosDuotank[i].PorcentajeLlenado;
                    
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "TareaDuotankHistorico", mensaje, "SISTEMA");

                    bool fechaFinActualizada = DAO_Logistica.ActualizarFechaFinDuotankHistorico(ultimosDatosDuotank[i].ZonaCarga.Id);
                    if (fechaFinActualizada)
                    {
                        DAO_Logistica.GuardarDuotankHistorico(nuevosDatosDuotank[i].ZonaCarga.Id, nuevosDatosDuotank[i].Matricula, 
                            nuevosDatosDuotank[i].Operacion, nuevosDatosDuotank[i].PorcentajeLlenado);
                    }
                } 
            }

            DAO_Logistica.UltimosDatosDuotank = nuevosDatosDuotank;
           
            hub.Clients.All.notDuotank();
        }
    }
}