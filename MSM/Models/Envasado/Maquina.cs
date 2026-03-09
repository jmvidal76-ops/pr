using System;
using System.Collections.Generic;

namespace MSM.Models.Envasado
{
    public class Maquina
    {
        //Atributos

        private string _id;
        private string _nombre;
        private string _descripcion;
        private string _ordenIdMaquina;
        private TipoMaquina _tipo; 
        private DatosSeguimiento _datosSeguimiento;
        private EstadoMaquina _estado;
        private int _posicion;
        private DateTime _fechaAct;
        private bool _generaRechazos;  // agomezn 310516: en la pagina de rechazos al añadir un nuevo rechazo no aparecen los equipos correctos para introducir dichos rechazos 

        [NonSerialized]
        public Zona _refZona;

        //Constructores

        public Maquina()
        { 

        }

        public Maquina(string pId, string pNombre, string pDescripcion, EstadoMaquina pEstado, TipoMaquina pTipo,ref Zona pZona, int pPosicionMaquina, DateTime fechaActualizacion, Boolean generaRechazos) // agomezn 310516: en la pagina de rechazos al añadir un nuevo rechazo no aparecen los equipos correctos para introducir dichos rechazos
        {
            _id = pId;
            _nombre = pNombre;
            _descripcion = pDescripcion;
            _tipo = pTipo;
            _estado = pEstado;
            _refZona = pZona;
            _datosSeguimiento = new DatosSeguimiento(tipo.EsLLenadora);
            _posicion = pPosicionMaquina;
            _fechaAct = fechaActualizacion;
            _generaRechazos = generaRechazos;
        }

        //Propiedades

        public string id
        {
            get { return _id; }
            set { _id = value; }
        }

        public string nombre
        {
            get { return _nombre; }
            set { _nombre = value; }
        }

        public string descripcion
        {
            get { return _descripcion; }
            set { _descripcion = value; }
        }

        public int posicion
        {
            get { return _posicion; }
            set { _posicion = value; }
        }
        
        public TipoMaquina tipo
        {
            get { return _tipo; }
            set { _tipo = value; }
        }

        public DateTime FechaActualizacion
        {
            get { return _fechaAct; }
            set { _fechaAct = value; }
        }
        public string ordenIdMaquina
        {
            get
            {
                return _ordenIdMaquina;
            }
            set { _ordenIdMaquina = value; }
        }
        public Orden orden
        {
            get
            {
                if (_refZona != null)
                {
                    return _refZona.ordenActual;
                }
                else 
                {
                    return null;
                }
            }
            //set { _orden = value; }
        }

        public DatosSeguimiento datosSeguimiento
        {
            get { return _datosSeguimiento; }
            set { _datosSeguimiento = value; }
        }

        public EstadoMaquina estado
        {
            get { return _estado; }
            set { _estado = value; }
        }

        public string numMaquina
        {
            get
            {
                if (!String.IsNullOrEmpty(_id)) return _id.Substring(_id.Length - 2, 2);
                else return "";
            }
        }

        public string NombreZona
        {
            get
            {
                return _refZona != null ? _refZona.descripcion : string.Empty;
            }
        }

        public string idZona
        {
            get
            {
                return _refZona != null ? _refZona.numZona + " - " + _refZona.descripcion : "";
            }
        }

        public bool generaRechazos
        {
            get { return _generaRechazos; } // agomezn 310516: en la pagina de rechazos al añadir un nuevo rechazo no aparecen los equipos correctos para introducir dichos rechazos
            set { _generaRechazos = value; }
        }

        public Boolean menorQueLlenadora()
        {
            if (_refZona._refLinea.llenadoras[0].posicion > this.posicion)
                return true;
            else
                return false;
        }

        //public bool Compartida { get; set; }

        //public bool Activa { get; set; }

        public int CantidadWO { get; set; }
    }
}
