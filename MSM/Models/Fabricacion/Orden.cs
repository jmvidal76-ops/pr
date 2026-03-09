using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using MSM.Utilidades;
using MSM.Models.Fabricacion.Tipos;
using MSM.Controllers.Planta;

namespace MSM.Models.Fabricacion
{

    /// <summary>
    /// Clase de Orden
    /// Correspondiente a la vista Ordenes_FAB
    /// </summary>
    public class Orden
    {
        //Atributos
        private string _id;
        private string _descripcion;
        private EstadoOrden _estadoActual;
        private TipoOrden _tipoOrden;
        private Material _material;
        private DateTime _fecInicioEstimado;
        private DateTime _fecFinEstimado;
        private DateTime _fecInicio;
        private DateTime _fecFin;
        private float _cantidad;
        private int _pk;
        private string _equipo;
        private String _executionEquipment;
        private DateTime _fechaAct;
        private string _loteMES;
        private Equipo _sourceEquipment;
        private Equipo _destinationEquipment;
        private string _cProducida;
        private string _mSobrante;
        private string _eficiencia;
        public Orden()
        {
            _id = "VACIA";
            _descripcion = string.Empty;
            _estadoActual = new EstadoOrden();
            _tipoOrden = new TipoOrden();
            _material = null;
            _fecInicio = DateTime.Now;
            _fecFin = DateTime.Now;
            _fechaAct = DateTime.MinValue;
            _cantidad = 0.0F;
            _pk = 0;
            _executionEquipment = "---";
            _sourceEquipment = new Equipo(-1);
            _destinationEquipment = new Equipo(-1);            
        }

        public Orden(
            string pId,
            string pDescripcion,
            EstadoOrden pEstado,
            Material material,
            DateTime pFecInicio,
            DateTime pFecFin,
            DateTime pFecInicioEstimado,
            DateTime pFecFinEstimado,
            float cantidad,
            TipoOrden tOrden,
            int pk,
            int sourceEquipmentPk,
            int destinationEquipmentPk,
            String executionEquipment = "---"            
        )
        {
            _id = pId;
            _descripcion = pDescripcion;
            _material = material;
            _estadoActual = pEstado;
            _fecInicio = pFecInicio;
            _fecFin = pFecFin;
            _fecInicioEstimado = pFecInicioEstimado;
            _fecFinEstimado = pFecFinEstimado;
            _cantidad = 0.0F;
            _tipoOrden = tOrden;
            _pk = pk;
            _executionEquipment = executionEquipment;
            _sourceEquipment = new Equipo(sourceEquipmentPk);
            _destinationEquipment = new Equipo(destinationEquipmentPk);
        }

        public Orden(string pId,
            string pDescripcion,
            EstadoOrden pEstado,
            Material material,
            DateTime pFecInicio,
            DateTime pFecFin,
            DateTime pFecInicioEstimado,
            DateTime pFecFinEstimado,
            DateTime fechaActualizacion,
            float cantidad,
            TipoOrden tOrden,
            int pk,
            int sourceEquipmentPk,
            int destinationEquipmentPk,
            String executionEquipment = "---" )
        {
            _id = pId;
            _descripcion = pDescripcion;
            _estadoActual = pEstado;
            _material = material;
            _fecInicio = pFecInicio;
            _fecFin = pFecFin;
            _fecInicioEstimado = pFecInicioEstimado;
            _fecFinEstimado = pFecFinEstimado;
            _fechaAct = fechaActualizacion;
            _cantidad = cantidad;
            _tipoOrden = tOrden;
            _pk = pk;
            _executionEquipment = executionEquipment;
            _sourceEquipment = new Equipo(sourceEquipmentPk);
            _destinationEquipment = new Equipo(destinationEquipmentPk);
        }

        //Propiedades

        public Equipo SourceEquipment
        {
            get { return _sourceEquipment; }
            set { _sourceEquipment = value; }
        }

        public Equipo DestinationEquipment
        {
            get { return _destinationEquipment; }
            set { _destinationEquipment = value; }
        }

        public String executionEquipment
        {
            get { return _executionEquipment; }
            set { _executionEquipment = value; }
        }

        public string id
        {
            get { return _id; }
            set { _id = value; }
        }

        public int pk
        {
            get { return _pk; }
            set { _pk = value; }
        }

        public string equipo
        {
            get { return _equipo; }
            set { _equipo = value; }
        }

        public string descripcion
        {
            get { return _descripcion; }
            set { _descripcion = value; }
        }

        public string loteMES
        {
            get { return _loteMES; }
            set { _loteMES = value; }
        }

        public EstadoOrden estadoActual
        {
            get { return _estadoActual; }
            set { _estadoActual = value; }
        }

        public Material material
        {
            get { return _material; }
            set { _material = value; }
        }

        public DateTime FechaActualizacion
        {
            get { return _fechaAct; }
            set { _fechaAct = value; }
        }

        public string fecInicio
        {
            get { return _fecInicio == DateTime.MinValue ? IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE") : _fecInicio.ToString(); }
        }

        public string fecFin
        {
            get { return _fecFin == DateTime.MinValue ? IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE") : _fecFin.ToString(); }
        }

        public string fecInicioEstimado
        {
            get { return _fecInicioEstimado == DateTime.MinValue ? IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE") : _fecInicioEstimado.ToString(); }
        }

        public string fecFinEstimado
        {
            get { return _fecFinEstimado == DateTime.MinValue ? IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE") : _fecFinEstimado.ToString(); }
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
            get { return _fecInicioEstimado.ToLocalTime(); }
        }

        public DateTime dFecFinEstimadoLocal
        {
            get { return _fecFinEstimado.ToLocalTime(); }
        }

        public DateTime dFecIniLocal
        {
            get { return _fecInicio.ToLocalTime(); }
        }

        public DateTime dFecFinLocal
        {
            get { return _fecFin.ToLocalTime(); }
        }

        public float cantidad
        {
            get { return _cantidad; }
            set { _cantidad = value; }
        }

        public TipoOrden tipoOrden
        {
            get { return _tipoOrden; }
            set { _tipoOrden = value; }
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

        public double fecInicioLocal
        {
            get { return (_fecInicio.ToLocalTime() - new DateTime(1970, 1, 1)).TotalSeconds; }
        }

        public double fecFinLocal
        {
            get { return (_fecFin.ToLocalTime() - new DateTime(1970, 1, 1)).TotalSeconds; }
        }

        public double fecInicioUTC()
        {
            return (_fecInicio - new DateTime(1970, 1, 1)).TotalSeconds;
        }

        public double fecFinUTC()
        {
            return (_fecFin - new DateTime(1970, 1, 1)).TotalSeconds;
        }


        public override bool Equals(Object ord)
        {
            if (ord.GetType() == this.GetType())
            {
                return this._id == ((Orden)ord).id;
            }
            return false;
        }

        public string semaforo {
            get
            {
                if(this.KopsMultivalorSinRellenar || this.KopsConstanteSinRellenar)
                    return "Azul";
                else if(!this.KopsMultivalorSinRellenar && !this.KopsConstanteSinRellenar)
                {
                    if (this.KopsConstanteFueraRango || this.KopsMultivalorFueraRango)
                        return "Amarillo";
                    else if (!this.KopsConstanteFueraRango && !this.KopsMultivalorFueraRango)
                        return "Verde";
                }
                return string.Empty;
            }
            set
            {

            }
        }

        public string filtroSemaforo
        {
            get
            {
                if (this.semaforo == "Azul")
                    return IdiomaController.GetResourceName("INEXISTENTE");
                if (this.semaforo == "Amarillo")
                    return IdiomaController.GetResourceName("MALO"); 
                if (this.semaforo == "Verde")
                    return IdiomaController.GetResourceName("BUENO");
                if (string.IsNullOrEmpty(this.semaforo) || this.semaforo == "Gris")
                    return IdiomaController.GetResourceName("SININFO");
                return string.Empty;
            }
            set
            {

            }
        }

        public string semaforoWO { get; set; }

        public bool KopsConstanteFueraRango { get; set; }
        public bool KopsConstanteSinRellenar { get; set; }
        public bool KopsMultivalorFueraRango { get; set; }
        public bool KopsMultivalorSinRellenar { get; set; }
        public bool Recalcular { get; set; }

        public string cProducida
        {
            get {
                double valor;
                _cProducida = Utils.CambiarComaDecimal(_cProducida);
                if (!string.IsNullOrEmpty(_cProducida) && _cProducida != "---")
                {
                    if (double.TryParse(_cProducida, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.CurrentCulture, out valor))
                    {
                        _cProducida = valor.ToString("#0.##");
                    }
                }
                return (string.IsNullOrEmpty(_cProducida)) ? "" : _cProducida;
                }
            set { _cProducida = value; }
        }
        public string mSobrante
        {
            get
            {
                double valor;
                _mSobrante = Utils.CambiarComaDecimal(_mSobrante);
                if (!string.IsNullOrEmpty(_mSobrante) && _mSobrante != "---")
                {
                    if (double.TryParse(_mSobrante, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.CurrentCulture, out valor))
                    {
                        _mSobrante = valor.ToString("#0.##");
                    }
                }
                return (string.IsNullOrEmpty(_mSobrante)) ? "" : _mSobrante;
            }
            set { _mSobrante = value; }
        }
        public string eficiencia
        {

            get {
                double valor;
                _eficiencia = Utils.CambiarComaDecimal(_eficiencia);
                if (!string.IsNullOrEmpty(_eficiencia) && _eficiencia != "---")
                {
                    if (double.TryParse(_eficiencia, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.CurrentCulture, out valor))
                    {
                        _eficiencia = valor.ToString("#0.##");
                    }
                }
                return (string.IsNullOrEmpty(_eficiencia)) ? "" : _eficiencia;
            }
            set { _eficiencia = value; }
        }
        public int numeroDv { get; set; }
        public string colorMultivalor { get; set; }
    }
}