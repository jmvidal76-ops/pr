
using System;
using System.Collections.Generic;
using MSM.Controllers.Planta;
using MSM.Utilidades;

namespace MSM.Models.Envasado
{
    public class Orden
    {
        //Atributos
        private string _id;
        private string _idOrdenPadre;
        private int _idSuborden;
        private int _numParticiones;
        private string _codigoJDE;
        private string _descripcion;
        private EstadoOrden _estadoActual;
        private Producto _producto;
        private int _estadoLIMS;
        private string _colorLIMS;

        private DateTime _fecInicioEstimado;
        private DateTime _fecFinEstimado;
        private DateTime _fecInicio;
        private DateTime _fecFin;

        private DatosProduccionOrden _produccion;
        private NivelDisponibilidad _dispMatPackaging;
        private int _cantPlanificada;

        public bool avisoLlenadora;

        private double _velocidadNominal;
        private double _OEEObjetivo;
        private double _OEECritico;
        private double? _OEEPreactor;

        //Datos consolidados
        private double _OEE;
        private double _calidad;
        private int _rechazos;
        private int _rechazosClasificadorAutomatico;
        private int _rechazosClasificadorManual;
        private int _rechazosLlenadoraAutomatico;
        private int _rechazosLlenadoraManual;
        private int _rechazosProductoTerminadoAutomatico;
        private int _rechazosProductoTerminadoManual;
        private int _rechazosVaciosAutomatico;
        private int _rechazosVaciosManual;
        //private int _cantReal;
        private int _envasesPorPalet;
        private int _cajasPorPalet;
        private DateTime _fechaAct;
        private Tipos.Pausa _tipoPausa;
        private string _fecFinEstimadoCalculado;
        private static string _fechaNoDisponible;

        [NonSerialized]
        public Maquina _refMaquina;
        [NonSerialized]
        public Linea _refLinea;

        public Orden()
        {
            _produccion = new DatosProduccionOrden();
            _id = "VACIA";
            _idOrdenPadre = null;
            _idSuborden = 0;
            _descripcion = string.Empty;
            _estadoActual = new EstadoOrden(Tipos.EstadosOrden.Cancelada);
            //_estadoActual = new EstadoOrden(0, "", "#FFFFFF");
            _producto = new Producto(string.Empty, string.Empty, string.Empty, new TipoProducto(string.Empty, string.Empty), null);
            _dispMatPackaging = new NivelDisponibilidad(0, string.Empty, string.Empty);
            _cantPlanificada = 0;
            //_cantReal = 0;
            _fecInicio = DateTime.Now;
            _fecFin = DateTime.Now;
            _refMaquina = null;
            _refLinea = null;
            _envasesPorPalet = 0;
            _cajasPorPalet = 0;
            _fechaAct = DateTime.MinValue;
            _tipoPausa = Tipos.Pausa.SinPausa;
            avisoLlenadora = false;
        }

        public Orden(
            string pId,
            string pIdOrdenPadre,
            int pIdSuborden,
            string pDescripcion,
            EstadoOrden pEstado,
            Producto pProducto,
            NivelDisponibilidad pDispMatPackaging,
            int pCantPlanificada,
            //int pCantReal,
            DateTime pFecInicio,
            DateTime pFecFin,
            DateTime pFecInicioEstimado,
            DateTime pFecFinEstimado,
            DatosProduccionOrden pProduccion,
            double pVelocidadNominal,
            double pOEEObjetivo,
            double pOEECritico,
            double pOEE,
            double pCalidad,
            int pRechazos,
            Linea pLinea = null
        )
        {
            _id = pId;
            _idOrdenPadre = pIdOrdenPadre;
            _idSuborden = pIdSuborden;
            _descripcion = pDescripcion;
            _estadoActual = pEstado;
            _producto = pProducto;
            _dispMatPackaging = pDispMatPackaging;
            _cantPlanificada = pCantPlanificada;
            //_cantReal = pCantReal;
            _fecInicio = pFecInicio;
            _fecFin = pFecFin;
            _fecInicioEstimado = pFecInicioEstimado;
            _fecFinEstimado = pFecFinEstimado;
            _produccion = pProduccion;
            _velocidadNominal = pVelocidadNominal;
            _OEEObjetivo = pOEEObjetivo;
            _OEECritico = pOEECritico;

            _OEE = pOEE;
            _calidad = pCalidad;
            _rechazos = pRechazos;

            _refMaquina = null;
            _refLinea = pLinea;
            avisoLlenadora = false;
        }

        public Orden(string pId,
            string pIdOrdenPadre,
            int pIdsuborden,
            string pDescripcion,
            EstadoOrden pEstado,
            Producto pProducto,
            NivelDisponibilidad pDispMatPackaging,
            int pCantPlanificada,
            //int pCantReal,
            DateTime pFecInicio,
            DateTime pFecFin,
            DateTime pFecInicioEstimado,
            DateTime pFecFinEstimado,
            DatosProduccionOrden pProduccion,
            double pVelocidadNominal,
            double pOEEObjetivo,
            double pOEECritico,
            string pCodigoJDE,
            double pOEE,
            double pCalidad,
            int pRechazos,
            ref Linea pLinea,
            DateTime fechaActualizacion,
            double? pOEEPreactor)
        {
            _id = pId;
            _idOrdenPadre = pIdOrdenPadre;
            _idSuborden = pIdsuborden;
            _descripcion = pDescripcion;
            _estadoActual = pEstado;
            _producto = pProducto;
            _dispMatPackaging = pDispMatPackaging;
            _cantPlanificada = pCantPlanificada;
            //_cantReal = pCantReal;
            _fecInicio = pFecInicio;
            _fecFin = pFecFin;
            _fecInicioEstimado = pFecInicioEstimado;
            _fecFinEstimado = pFecFinEstimado;
            _refLinea = pLinea;
            _produccion = pProduccion;
            _velocidadNominal = pVelocidadNominal;
            _OEEObjetivo = pOEEObjetivo;
            _OEECritico = pOEECritico;
            _OEEPreactor = pOEEPreactor;
            _codigoJDE = pCodigoJDE;

            _OEE = pOEE;
            _calidad = pCalidad;
            _rechazos = pRechazos;

            _refMaquina = null;
            _fechaAct = fechaActualizacion;
            avisoLlenadora = false;
        }


        public Orden(string pId,
            string pIdOrdenPadre,
            int pIdsuborden,
            string pDescripcion,
            EstadoOrden pEstado,
            Producto pProducto,
            NivelDisponibilidad pDispMatPackaging,
            int pCantPlanificada,
            //int pCantReal,
            DateTime pFecInicio,
            DateTime pFecFin,
            DateTime pFecInicioEstimado,
            DateTime pFecFinEstimado,
            DatosProduccionOrden pProduccion,
            double pVelocidadNominal,
            double pOEEObjetivo,
            double pOEECritico,
            string pCodigoJDE,
            double pOEE,
            double pCalidad,
            int pRechazos,
            int pRechazosClasificadorAutomatico,
            int pRechazosClasificadorManual,
            int pRechazosLlenadoraAutomatico,
            int pRechazosLlenadoraManual,
            int pRechazosProductoTerminadoAutomatico,
            int pRechazosProductoTerminadoManual,
            int pRechazosVaciosAutomatico,
            int pRechazosVaciosManual,
            ref Linea pLinea,
            DateTime fechaActualizacion,
            double? pOEEPreactor)
        {
            _id = pId; 
            _idOrdenPadre = pIdOrdenPadre;
            _idSuborden = pIdsuborden;
            _descripcion = pDescripcion;
            _estadoActual = pEstado;
            _producto = pProducto;
            _dispMatPackaging = pDispMatPackaging;
            _cantPlanificada = pCantPlanificada;
            //_cantReal = pCantReal;
            _fecInicio = pFecInicio;
            _fecFin = pFecFin;
            _fecInicioEstimado = pFecInicioEstimado;
            _fecFinEstimado = pFecFinEstimado;
            _refLinea = pLinea;
            _produccion = pProduccion;
            _velocidadNominal = pVelocidadNominal;
            _OEEObjetivo = pOEEObjetivo;
            _OEECritico = pOEECritico;
            _OEEPreactor = pOEEPreactor;
            _codigoJDE = pCodigoJDE;

            _OEE = pOEE;
            _calidad = pCalidad;
            _rechazos = pRechazos;
            _rechazosClasificadorAutomatico = pRechazosClasificadorAutomatico;
            _rechazosClasificadorManual = pRechazosClasificadorManual;
            _rechazosLlenadoraAutomatico = pRechazosLlenadoraAutomatico;
            _rechazosLlenadoraManual = pRechazosLlenadoraManual;
            _rechazosProductoTerminadoAutomatico = pRechazosProductoTerminadoAutomatico;
            _rechazosProductoTerminadoManual = pRechazosProductoTerminadoManual;
            _rechazosVaciosAutomatico = pRechazosVaciosAutomatico;
            _rechazosVaciosManual = pRechazosVaciosManual;
            avisoLlenadora = false;
            _refMaquina = null;
            _fechaAct = fechaActualizacion;
        }

        //Propiedades
        public int EnvasesPorPalet
        {
            get { return _envasesPorPalet; }
            set { _envasesPorPalet = value; }
        }
        public int CajasPorPalet
        {
            get { return _cajasPorPalet; }
            set { _cajasPorPalet = value; }
        }

        public string id
        {
            get { return _id; }
            set { _id = value; }
        }
        public string idOrdenPadre
        {
            get { return _idOrdenPadre; }
            set { _idOrdenPadre = value; }
        }
        public int idSuborden
        {
            get { return _idSuborden; }
            set { _idSuborden = value; }
        }
        public int numParticiones
        {
            get { return _numParticiones; }
            set { _numParticiones = value; }
        }

        public string descripcion
        {
            get { return _descripcion; }
            set { _descripcion = value; }
        }

        public EstadoOrden estadoActual
        {
            get { return _estadoActual; }
            set { _estadoActual = value; }
        }

        public Producto producto
        {
            get { return _producto; }
            set { _producto = value; }
        }

        public NivelDisponibilidad dispMatPackaging
        {
            get { return _dispMatPackaging; }
            set { _dispMatPackaging = value; }
        }

        public int cantPlanificada
        {
            get { return _cantPlanificada; }
            set { _cantPlanificada = value; }
        }

        public DateTime FechaActualizacion
        {
            get { return _fechaAct; }
            set { _fechaAct = value; }
        }

        public Tipos.Pausa TipoPausa
        {
            get { return _tipoPausa; }
            set { _tipoPausa = value; }
        }

        public string strTipoPausa
        {
            get { return TipoPausa.GetProperty("keyReglaSIT") == null ? string.Empty : TipoPausa.GetProperty("keyReglaSIT").ToString(); }
        }

        public int cantReal
        {
            get
            {
                if (produccion != null) return (int)produccion.envases;
                else return 0;
            }
        }

        public string fecInicio
        {
            get
            {
                return _fecInicio == DateTime.MinValue
                    ? FechaNoDisponible
                    : _fecInicio.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss");
            }
        }

        public string fecFin
        {
            get
            {
                return _fecFin == DateTime.MinValue
                    ? FechaNoDisponible
                    : _fecFin.ToLocalTime().ToString();
            }
            set
            {
                DateTime.TryParse(value, out _fecFin);
            }
        }

        public string fecInicioEstimado
        {
            get
            {
                return _fecInicioEstimado == DateTime.MinValue
                    ? FechaNoDisponible
                    : _fecInicioEstimado.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss");
            }
        }

        public string fecFinEstimado
        {
            get
            {
                return _fecFinEstimado == DateTime.MinValue
                    ? FechaNoDisponible
                    : _fecFinEstimado.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss");
            }
        }

        private static string FechaNoDisponible
        {
            get
            {
                if (_fechaNoDisponible == null)
                    _fechaNoDisponible = "--/--/----";

                return _fechaNoDisponible;
            }
        }

        public string fecFinEstimadoCalculado
        {
            get
            {
                if (_fecFinEstimadoCalculado != null)
                    return _fecFinEstimadoCalculado;

                if (this.duracionCalculada > 0)
                {
                    DateTime fechaCalculada = DateTime.UtcNow.AddSeconds(this.duracionCalculada).ToLocalTime();
                    _fecFinEstimadoCalculado = fechaCalculada.ToString();
                }
                else
                {
                    if (_fechaNoDisponible == null)
                        _fechaNoDisponible = "--/--/----";

                    _fecFinEstimadoCalculado = _fechaNoDisponible;
                }

                return _fecFinEstimadoCalculado;
            }
        }

        public string fecFinEstimadoCalculadoTurno
        {
            get;
            set;
        }

        public DateTime dFecInicio
        {
            get { return _fecInicio; }
            set { _fecInicio = value; }
        }

        public DateTime dFecFin
        {
            get { return _fecFin; }
            set { _fecFin = value; }
        }

        public DateTime dFecInicioEstimado
        {
            get { return _fecInicioEstimado; }
            set { _fecInicioEstimado = value; }
        }

        public DateTime dFecFinEstimado
        {
            get { return _fecFinEstimado; }
            set { _fecFinEstimado = value; }
        }

        public DateTime dFecInicioEstimadoLocal
        {
            get { return _fecInicioEstimado.ToLocalTime().AddMilliseconds(-_fecInicioEstimado.ToLocalTime().Millisecond); }
        }

        public DateTime dFecFinEstimadoLocal
        {
            get { return _fecFinEstimado.ToLocalTime().AddMilliseconds(-_fecFinEstimado.ToLocalTime().Millisecond); }
        }

        public DateTime dFecIniLocal
        {
            get { return _fecInicio.ToLocalTime(); }
        }

        public DateTime dFecFinLocal
        {
            get { return _fecFin.ToLocalTime(); }
        }

        public DateTime FechaFinEstimadaReal { get; set; }

        public DateTime? dFecArranqueEnLLenadora {get;set;}
        public double duracion { get; set; }
        //{
        //    get { return (_fecFinEstimado - _fecInicioEstimado).TotalHours; }
        //}

        public double duracionReal { get; set; }
        //{
        //    get { return _fecFin != DateTime.MinValue ? (_fecFin - _fecInicio).TotalHours : 0; }
        //}
        public double duracionCalculada { 
            get {
                int cantidadRestante = (this.cantPlanificada * this.EnvasesPorPalet) - (this.produccion == null ? 0: this.produccion.paletsProducidos* this.EnvasesPorPalet);
                if (cantidadRestante < 0)
                {
                    return 0;
                }
                else
                {
                    double denominador = this.produccion == null ? 0 : (this.velocidadNominal * ((this.produccion.oee == 0 ? 100 : this.produccion.oee) / 100));
                    return TimeSpan.FromHours(denominador > 0 ? cantidadRestante / denominador : 0).TotalSeconds;
                }
            } 
        }

        public string duracionCalculadaTurno
        {
            get;
            set;
        }

        public DatosProduccionOrden produccion
        {
            get { return _produccion; }
            set { _produccion = value; }
        }

        public double velocidadNominal
        {
            get { return _velocidadNominal; }
            set { _velocidadNominal = value; }
        }

        public double oeeObjetivo
        {
            get { return _OEEObjetivo; }
            set { _OEEObjetivo = value; }
        }

        public double oeeCritico
        {
            get { return _OEECritico; }
            set { _OEECritico = value; }
        }

        public double? oeePreactor
        {
            get { return _OEEPreactor; }
            set { _OEEPreactor = value; }
        }

        public string codigoJDE
        {
            get { return _codigoJDE; }
            set { _codigoJDE = value; }
        }

        public string idLinea
        {
            get
            {
                if (_refMaquina != null && _refMaquina._refZona != null && _refMaquina._refZona._refLinea != null) return _refMaquina._refZona._refLinea.id;
                if (_refLinea != null) return _refLinea.id;
                else return "SIN LINEA ASOCIADA";
            }
        }

        public string descLinea
        {
            get
            {
                if (_refMaquina != null && _refMaquina._refZona != null && _refMaquina._refZona._refLinea != null) return _refMaquina._refZona._refLinea.descripcion;
                if (_refLinea != null) return _refLinea.descripcion;
                else return "SIN LINEA ASOCIADA";
            }
        }

        public int numLinea
        {
            get
            {
                if (_refMaquina != null && _refMaquina._refZona != null && _refMaquina._refZona._refLinea != null) return _refMaquina._refZona._refLinea.numLinea;
                if (_refLinea != null) return _refLinea.numLinea;
                else return -1;
            }
        }

        public string numLineaDescripcion
        {
            get
            {
                if (_refMaquina != null && _refMaquina._refZona != null && _refMaquina._refZona._refLinea != null) return _refMaquina._refZona._refLinea.numLineaDescripcion;
                if (_refLinea != null) return _refLinea.numLineaDescripcion;
                else return string.Empty;
            }
        }

        // Metodos

        public DateTime dfecInicio()
        {
            return _fecInicio;
        }

        public DateTime dfecFin()
        {
            return _fecFin;
        }

        public double fecInicioUTC()
        {
            return (_fecInicio - new DateTime(1970, 1, 1)).TotalSeconds;
        }

        public double fecFinUTC()
        {
            return (_fecFin - new DateTime(1970, 1, 1)).TotalSeconds;
        }

        public double OEE
        {
            get
            {
                if (_OEE > 0) return _OEE;

                if (estadoActual.id == Tipos.EstadosOrden.Iniciando.GetValue() || estadoActual.id == Tipos.EstadosOrden.Producción.GetValue()) return _produccion.oee;
                
                return _OEE;
            }
            set { _OEE = value; }
        }        

        public double calidad
        {
            get
            {
                //if (estadoActual.id == Tipos.EstadosOrden.Iniciando.GetValue() || estadoActual.id == Tipos.EstadosOrden.Finalizando.GetValue() || estadoActual.id == Tipos.EstadosOrden.Producción.GetValue()) return 100.0;
                //else 
                return _calidad * 1000;
            }
            set { _calidad = value; }
        }

        public int rechazos
        {
            get
            {
                return _rechazos;
            }
            set { _rechazos = value; }
        }

        public int rechazosClasificadorAutomatico
        {
            get
            {
                return _rechazosClasificadorAutomatico;
            }
            set { _rechazosClasificadorAutomatico = value; }
        }
        public int rechazosClasificadorManual
        {
            get
            {
                return _rechazosClasificadorManual;
            }
            set { _rechazosClasificadorManual = value; }
        }
        public int rechazosLlenadoraAutomatico
        {
            get
            {
                return _rechazosLlenadoraAutomatico;
            }
            set { _rechazosLlenadoraAutomatico = value; }
        }
        public int rechazosLlenadoraManual
        {
            get
            {
                return _rechazosLlenadoraManual;
            }
            set { _rechazosLlenadoraManual = value; }
        }

        public int rechazosProductoTerminadoAutomatico
        {
            get
            {
                return _rechazosProductoTerminadoAutomatico;
            }
            set { _rechazosProductoTerminadoAutomatico = value; }
        }
        public int rechazosProductoTerminadoManual
        {
            get
            {
                return _rechazosProductoTerminadoManual;
            }
            set { _rechazosProductoTerminadoManual = value; }
        }
        public int rechazosVaciosAutomatico
        {
            get
            {
                return _rechazosVaciosAutomatico;
            }
            set { _rechazosVaciosAutomatico = value; }
        }
        public int rechazosVaciosManual
        {
            get
            {
                return _rechazosVaciosManual;
            }
            set { _rechazosVaciosManual = value; }
        }

        public int envasesTotales { get; set; }

        public int EstadoLIMS
        {
            get { return _estadoLIMS; }
            set { _estadoLIMS = value; }
        }

        public string ColorLIMS
        {
            get { return _colorLIMS; }
            set { _colorLIMS = value; }
        }

        public override bool Equals(Object ord)
        {
            if (ord.GetType() == this.GetType())
            {
                return this._id == ((Orden)ord).id;
            }
            return false;
        }

        // Lo añado porque el compilador daba warning al tener sólo el Equals. DAJ
        public override int GetHashCode()
        {
            return 1969571243 + EqualityComparer<string>.Default.GetHashCode(_id);
        }
    }
}
