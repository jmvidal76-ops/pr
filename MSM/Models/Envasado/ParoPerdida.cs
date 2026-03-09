using System;
using System.Collections.Generic;

namespace MSM.Models.Envasado
{
    public class ParoPerdida
    {

        //Atributos
        private long _id;
        private bool _justificado;
        private DateTime _fechaHoraInicio;
        private DateTime _fechaHoraFin;

        private short _idTipoParoPerdida;
        private string _tipoParoPerdida;
        
        private string _maquina;
        private string _descmaquina;
        private string _motivo;
        private string _causa; 
        private int _motivoId;
        private int _causaId;

        private string _idMaquinaResponsable;
        private string _nombreMaquinaResponsable;
        private string _idEquipoConstructivo;
        private string _nombreEquipoConstructivo;
        private string _descripcion;
        private string _observaciones;

        public double DuracionPerdidas { get; set; }
        public double DuracionParosMenores { get; set; }
        public int NumeroParosMenores { get; set; }
        public float Duracion { get; set; }

        //Constructor
        public ParoPerdida()
        {
        }

        public ParoPerdida(long pId, short pIdTipoParoPerdida, string pTipoParoPerdida, bool pJustificado, DateTime pFechaInicio, DateTime pFechaFin, 
            string pMaquina, string pdesMaquina, string pMotivo, string pCausa, int pMotivoId, int pCausaId, string pIdMaquinaResponsable, 
            string pNombreMaquinaResponsable, string pIdEquipoConstructivo, string pNombreEquipoConstructivo, string pDescripcion, string pObservaciones)
        {
            _id = pId;
            _idTipoParoPerdida = pIdTipoParoPerdida;
            _tipoParoPerdida = pTipoParoPerdida;
            _justificado = pJustificado;
            _fechaHoraInicio = pFechaInicio;
            _fechaHoraFin = pFechaFin;
            _maquina = pMaquina;
            _descmaquina = pdesMaquina;
            _motivo = pMotivo;
            _causaId = pCausaId;
            _motivoId = pMotivoId;
            _causa = pCausa;
            _idMaquinaResponsable = pIdMaquinaResponsable;
            _nombreMaquinaResponsable = pNombreMaquinaResponsable;
            _idEquipoConstructivo = pIdEquipoConstructivo;
            _nombreEquipoConstructivo = pNombreEquipoConstructivo;
            _descripcion = pDescripcion;
            _observaciones = pObservaciones;
        }

        //Propiedades
        public long id
        {
            get { return _id; }
            set { _id = value; }
        }

        public short IdTipoParoPerdida 
        {
            get { return _idTipoParoPerdida; }
            set { _idTipoParoPerdida = value; }
        }

        public bool justificado
        {
            get { return _justificado; }
            set { _justificado = value; }
        }

        public String fechaHora
        {
            get { 
                return _fechaHoraInicio.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss"); 
            }
        }

        public double  fechaHoraUTC
        {
            get
            {
                return (_fechaHoraInicio  - new DateTime(1970, 1, 1)).TotalSeconds;
            }
            set
            {
                _fechaHoraInicio = (new DateTime(1970, 1, 1)).AddSeconds(value);
            }
        }

        public String fechaHoraFin
        {
            get
            {
                return _fechaHoraFin.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss");
            }
        }

        public double fechaHoraFinUTC
        {
            get
            {
                return (_fechaHoraFin - new DateTime(1970, 1, 1)).TotalSeconds;
            }
            set
            {
                _fechaHoraFin = (new DateTime(1970, 1, 1)).AddSeconds(value);
            }
        }

        //Minutos
        public string duracion
        {
            get
            {
                TimeSpan ts = (_fechaHoraFin - _fechaHoraInicio);                
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string StrDuracionPerdidas
        {
            get
            {
                TimeSpan ts = (_fechaHoraInicio.AddSeconds(DuracionPerdidas) - _fechaHoraInicio);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string StrDuracionParosMenores
        {
            get
            {
                TimeSpan ts = (_fechaHoraInicio.AddSeconds(DuracionParosMenores) - _fechaHoraInicio);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string strDuracionPerdidaProduccion
        {
            get 
            {
                TimeSpan ts = (_fechaHoraInicio.AddSeconds(DuracionParosMenores + DuracionPerdidas) - _fechaHoraInicio);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string strDuracion
        {
            get
            {
                TimeSpan ts = (_fechaHoraInicio.AddSeconds(Duracion) - _fechaHoraInicio);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string maquina
        {
            get { return _maquina; }
            set { _maquina = value; }
        }

        public string descmaquina
        {
            get { return _descmaquina; }
            set { _descmaquina = value; }
        }

        public string motivo
        {
            get { return _motivo; }
            set { _motivo = value; }
        }

        public string causa
        {
            get { return _causa; }
            set { _causa = value; }
        }

        public int motivoId
        {
            get { return _motivoId; }
            set { _motivoId = value; }
        }

        public int causaId
        {
            get { return _causaId; }
            set { _causaId = value; }
        }

        public string idMaquinaResponsable
        {
            get { return _idMaquinaResponsable; }
            set { _idMaquinaResponsable = value; }
        }

        public string nombreMaquinaResponsable
        {
            get { return _nombreMaquinaResponsable; }
            set { _nombreMaquinaResponsable = value; }
        }

        public string idEquipoConstructivo
        {
            get { return _idEquipoConstructivo; }
            set { _idEquipoConstructivo = value; }
        }

        public string nombreEquipoConstructivo
        {
            get { return _nombreEquipoConstructivo; }
            set { _nombreEquipoConstructivo = value; }
        }

        public string descripcion
        {
            get { return _descripcion; }
            set { _descripcion = value; }
        }

        public string observaciones
        {
            get { return _observaciones == null ? string.Empty : _observaciones; }
            set { _observaciones = value; }
        }

        public DateTime dFechaHoraInicioLocal
        {
            get
            {
                return _fechaHoraInicio.ToLocalTime();
            }
        }

        public DateTime dFechaHoraFinLocal
        {
            get
            {
                return _fechaHoraFin.ToLocalTime();
            }
        }

        public int idAveria { get; set; }

        public bool justificacionMultiple { get; set; }

        public string linea { get; set; }

        public bool aplicarJustificacionMaquina { get; set; }

        public bool aplicarJustificacionEquipo { get; set; }

        public bool aplicarJustificacionAveria { get; set; }

    }
}