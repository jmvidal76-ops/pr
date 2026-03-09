using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.RealTime
{
    public enum AccionesTareaEnum
    {
        Eliminar = 0,
        Pausar = 1,
        Reanudar = 2,
        EjecutarAhora = 3
    }

    public class ProgramadorMSM
    {
        private readonly ConcurrentDictionary<string, TareaRecurrenteMSM> _tareas = new ConcurrentDictionary<string, TareaRecurrenteMSM>();

        public void IniciarProgramadorMSM()
        {
            // Calculo fecha estimada Fin WO
            if (ConfigurationManager.AppSettings["ACT_FECHA_ESTIMADA_FIN_WO"] == "true")
            {
                int tAct = int.Parse(ConfigurationManager.AppSettings["T_ACT_FECHA_ESTIMADA_FIN_WO"]);
                this.NuevaTarea(new TareaFechaEstimadaFinWO(), TimeSpan.FromSeconds(tAct));
            }

            // Para la actualización de datos del Duotank
            if (ConfigurationManager.AppSettings["ACT_DUOTANK"] == "true")
            {
                int tAct = int.Parse(ConfigurationManager.AppSettings["T_ACT_DUOTANK"]);
                this.NuevaTarea(new TareaDuotankHistorico(), TimeSpan.FromSeconds(tAct));
            }
        }

        //public void NuevaTarea(string nombre, Func<Task> accion, TimeSpan intervalo)
        public void NuevaTarea(ITareaMSM accion, TimeSpan intervalo)
        {
            var _tarea = new TareaRecurrenteMSM(accion, intervalo);
            _tareas[accion.Nombre] = _tarea;
            _tarea.Iniciar();
        }
        
        //public void NuevaTarea(string nombre, Func<Task> accion, int minutos)
        public void NuevaTarea(ITareaMSM accion, int minutos)
        {
            NuevaTarea(accion, TimeSpan.FromMinutes(minutos));
        }

        public void EliminarTarea(string nombre)
        {
            if (_tareas.TryRemove(nombre, out var tarea))
            {
                tarea.Detener();
            }
        }

        public void PausarTarea(string nombre)
        {
            if (_tareas.TryGetValue(nombre, out var tarea))
            {
                tarea.Pausar();
            }
        }

        public void ReanudarTarea(string nombre)
        {
            if (_tareas.TryGetValue(nombre, out var tarea))
            {
                tarea.Reanudar();
            }
        }
        
        public void EjecutarTareaAhora(string nombre)
        {
            if (_tareas.TryGetValue(nombre, out var tarea))
            {
                tarea.EjecutarAhora();
            }
        }

        public void CambiarIntervaloTarea(string nombre, TimeSpan nuevoIntervalo, bool ejecutarYa = true)
        {
            if (_tareas.TryGetValue(nombre, out var tarea))
            {
                tarea.CambiarIntervalo(nuevoIntervalo, ejecutarYa);
            }
        }

        public void CambiarIntervaloTarea(string nombre, int nuevoIntervaloMinutos, bool ejecutarYa = true)
        {
            CambiarIntervaloTarea(nombre, TimeSpan.FromMinutes(nuevoIntervaloMinutos), ejecutarYa);
        }

        public Dictionary<string, TaskState> ObtenerEstadoTarea(string nombre)
        {
            var estados = new Dictionary<string, TaskState>();

            if (_tareas.TryGetValue(nombre, out var tarea))
            {
                estados.Add(nombre, tarea.ObtenerEstado());
            }

            return estados;
        }
        
        public Dictionary<string, TaskState> ObtenerEstadosTarea()
        {
            var estados = new Dictionary<string, TaskState>();

            foreach(var t in _tareas.Keys)
            {
                if (_tareas.TryGetValue(t, out var tarea))
                {
                    estados.Add(t, tarea.ObtenerEstado());
                }
            }            

            return estados;
        }
    }
}