
using MSM.BBDD.Planta;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MSM.RealTime
{
    public class TareaRecurrenteMSM
    {
        //private readonly Func<Task> _accion;
        private readonly ITareaMSM _accion;
        private TimeSpan _intervalo;
        private Timer _timer;
        private TaskState _estado;
        private readonly List<DateTime> _tiemposEjecucion = new List<DateTime>();
        private Dictionary<DateTime, TimeSpan> _duracionesEjecucion = new Dictionary<DateTime, TimeSpan>();
        private bool _repeat = false;


        public TareaRecurrenteMSM(ITareaMSM accion, TimeSpan intervalo)
        {
            _accion = accion ?? throw new ArgumentNullException(nameof(accion));
            _intervalo = intervalo;
            _estado = new TaskState();
        }

        public TareaRecurrenteMSM(ITareaMSM accion, int minutos): this(accion, TimeSpan.FromMinutes(minutos))
        {            
        }

        public void Iniciar(TimeSpan? dueTime = null)
        {
            TimeSpan _dueTime = dueTime == null ? TimeSpan.Zero : (TimeSpan)dueTime;

            if (_timer == null)
            {
                _timer = new Timer(EjecutarTarea, null, _dueTime, _intervalo);                
            }
            else
            {
                _timer.Change(_dueTime, _intervalo);
            }
            _estado.Estado = TaskStatesEnum.Activa;
        }

        public void EjecutarAhora()
        {
            if (!_estado.EnEjecucion)
            {
                EjecutarTarea(null);
            }            
            else
            {
                // Si ya se está ejecutando la tarea, activamos que se repita al acabar, para que se haga de nuevo todo el proceso por si ha quedado algo pendiente
                _repeat = true;
            }
        }

        public void Detener()
        {
            _estado.Estado = TaskStatesEnum.Inactiva;
            _timer.Dispose();
            _timer = null;
        }

        public void Pausar()
        {
            _timer?.Change(Timeout.Infinite, Timeout.Infinite);
            _estado.Estado = TaskStatesEnum.Pausada;
        }

        public void Reanudar()
        {
            Iniciar();
        }

        public void CambiarIntervalo(TimeSpan nuevoIntervalo, bool ejecutarYa = true)
        {
            _intervalo = nuevoIntervalo;
            if (ejecutarYa)
            {
                Iniciar();
            }
            else
            {
                Iniciar(nuevoIntervalo);
                _estado.ProximaEjecucion = DateTime.UtcNow + nuevoIntervalo;
            }
            
        }

        public void CambiarIntervalo(int nuevoIntervaloMinutos, bool ejecutarYa = true)
        {
            CambiarIntervalo(TimeSpan.FromMinutes(nuevoIntervaloMinutos), ejecutarYa);
        }

        public TaskState ObtenerEstado()
        {
            _estado.FrecuenciaPorMinuto = CalcularEjecucionesMinuto();
            _estado.MediaDuracion = CalcularDuracionMedia();
            return _estado;
        }

        private void LimpiarTiemposEjecucion()
        {
            // Deja sólo los registros necesarios para calcular la frecuencia por minuto,
            // en caso de que la frecuencia sea más de 5 minutos puede que no haya ningún registro
            var cutoff = DateTime.UtcNow.AddMinutes(-6);

            _tiemposEjecucion.RemoveAll(time => time < cutoff);
        }
        
        private void LimpiarDuracionesEjecucion()
        {
            // Antes de eliminar nada comprobamos si tenemos alguna duracion que sea la máxima
            var maxDuracion = _duracionesEjecucion.OrderByDescending(kv => kv.Value).FirstOrDefault();

            if (maxDuracion.Value > _estado.MaximaDuracion.Value)
            {
                _estado.MaximaDuracion = maxDuracion;
            }

            // Mantenemos sólo los 10 últimos registros de duración
            if (_duracionesEjecucion.Count > 10)
            {
                _duracionesEjecucion = _duracionesEjecucion.Skip(_duracionesEjecucion.Count - 10).ToDictionary(pair => pair.Key, pair => pair.Value);
            }
        }

        private double CalcularEjecucionesMinuto()
        {
            LimpiarTiemposEjecucion();
            if (_tiemposEjecucion.Count == 0) return 0;

            var cutoff = DateTime.UtcNow.AddMinutes(-5);
            var countLastFiveMinutes = _tiemposEjecucion.Count(time => time >= cutoff);
            return countLastFiveMinutes / 5.0;
        }

        private TimeSpan CalcularDuracionMedia()
        {
            LimpiarDuracionesEjecucion();

            if (_duracionesEjecucion.Count == 0) return TimeSpan.Zero;

            var total = new TimeSpan(_duracionesEjecucion.Values.Sum(ts => ts.Ticks));
            var media = new TimeSpan(total.Ticks / _duracionesEjecucion.Count);
            
            return media;
        }

        private void EjecutarTarea(object state)
        {
            if (_estado.EnEjecucion)
            {
                return; // If already running, skip this execution
            }

            _estado.EnEjecucion = true;
            _estado.UltimaEjecucion = DateTime.UtcNow;
            _tiemposEjecucion.Add(_estado.UltimaEjecucion.Value);
            Stopwatch tim = Stopwatch.StartNew();
            tim.Start();

            Task.Run(async () =>
            {
                try
                {
                    await _accion.Tarea();
                    _estado.UltimaEjecucionCorrecta = true;
                }
                catch(Exception ex)
                {
                    _estado.UltimoError = String.Format("{0}: {1} - {2}", DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm:ss"), ex.Message, ex.StackTrace);
                    _estado.UltimaEjecucionCorrecta = false;

                }
                finally
                {
                    _estado.EnEjecucion = false;
                    _estado.ProximaEjecucion = DateTime.UtcNow + _intervalo;

                    // Duracion tarea
                    _duracionesEjecucion.Add(_estado.UltimaEjecucion ?? DateTime.UtcNow, tim.Elapsed);
                    tim.Stop();

                    //Actualizar perro guardian
                    await DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian((int)_accion.Tipo);
                    LimpiarTiemposEjecucion();
                    LimpiarDuracionesEjecucion();

                    if (_repeat)
                    {
                        _repeat = false;
                        EjecutarTarea(state);
                    }
                }
            });
        }
    }
}

public enum TaskStatesEnum { 
    Inactiva = 0,
    Activa = 1,
    Pausada = 2
}

public class TaskState
{
    public bool EnEjecucion { get; set; }
    public TaskStatesEnum Estado { get; set; } = TaskStatesEnum.Inactiva;
    public bool UltimaEjecucionCorrecta { get; set; }
    public DateTime? UltimaEjecucion { get; set; }
    public DateTime? ProximaEjecucion { get; set; }
    public string UltimoError { get; set; }
    // Frecuencia de ejecución de la tarea calculado en los últimos 5 minutos
    public double FrecuenciaPorMinuto { get; set; }
    public TimeSpan MediaDuracion { get; set; }
    public KeyValuePair<DateTime, TimeSpan> MaximaDuracion { get; set; }    
    public string EstadoStr { get {
            switch (Estado)
            {
                case TaskStatesEnum.Inactiva:
                    return "Inactiva";
                case TaskStatesEnum.Activa:
                    return "Activa";
                case TaskStatesEnum.Pausada:
                    return "Pausada";
            }

            return "Desconocido";
        }
    }
}