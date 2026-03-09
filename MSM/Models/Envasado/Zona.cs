using MSM.BBDD.Planta;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MSM.Models.Envasado
{
    public class Zona
    {
        //Atributos

        private string _id; // El id de la zona (Ej: B447-PO_MES-00)
        private string _idLinea; // El id de la linea (Ej: MSM.BURGOS.ENVASADO.B147)
        private int _numZona; // El orden de la linea dentro de la línea
        private string _nombre; // El nombre de la máquina más representativa de la línea
        private string _descripcion;
        private List<string> _subzonas; // codigo referencia de las subzonas compañeras de esta zona
        private string _compartida; // si la zona se comparte en mas de una linea: los ids de las lineas separados por coma
        private List<Maquina> _maquinas;
        //[NonSerialized]
        //private List<Maquina> _maquinasTotales;
        private Orden _ordenActual;
        private bool _esllenadora;
        private bool _esdespaletizadora;
        private bool _esencajonadora;
        private bool _espaletizadora;
        private bool _esenpaquetadora;
        private bool _esetiquetadora;

        [NonSerialized]
        public Linea _refLinea;

        //Constructores

        public Zona()
        {

        }

        public Zona(string pId, string pIdLinea, int pNumZona, string pNombre, Orden pOrden, string pCompartida, ref Linea linea, string pDescripcion)
        {
            _id = pId;
            _idLinea = pIdLinea;
            _numZona = pNumZona;
            _nombre = pNombre;
            _descripcion = pDescripcion;
            _subzonas = new List<string>();
            _refLinea = linea;
            _ordenActual = pOrden;
            _compartida = pCompartida;
            _esdespaletizadora = false;
            _esencajonadora = false;
            _esenpaquetadora = false;
            _esllenadora = false;
            _espaletizadora = false;
            obtenerMaquinas();
            obtenerZonasCompartidas();
            //obtenerMaquinasTotales();
        }        

        //Propiedades
        // Devuelve el id de la zona formateado para considerar las subzonas o zonas compartidas
        public string id
        {
            get
            {
                return _id;
            }
            set { _id = value; }

        }

        public int numZona
        {
            get
            {
                return _numZona;
            }
            set { _numZona = value; }
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

        public List<Maquina> maquinas
        {
            get { return _maquinas; }
            set { _maquinas = value; }
        }

       
        //public List<Maquina> maquinasTotales
        //{
        //    get { return _maquinasTotales; }
        //    set { _maquinasTotales = value; }
        //}

        public List<string> subZonas //obtiene o establece las subzonas hermanas de la zona
        {
            get { return _subzonas; }
            set { _subzonas = value; }
        }

        public string idLineaComparteZona //obtiene o establece las subzonas hermanas de la zona
        {
            get { return _compartida; }
            set { _compartida = value; }
        }

        public Orden ordenActual
        {
            get { return _ordenActual; }
            set { _ordenActual = value; }
        }

        public bool esLlenadora
        {
            //get
            //{
            //    if (buscarTipoMaquina("LLENADORA")) return true;
            //    else return false;
            //}
            get { return _esllenadora; }
            set { _esllenadora = value; }
        }

        public bool esDespaletizadora
        {
            //get
            //{
            //    if (buscarTipoMaquina("DESPALETIZADORA")) return true;
            //    else return false;
            //}
            get { return _esdespaletizadora; }
            set { _esdespaletizadora = value; }
        }

        public bool esPaletizadora
        {
            //get
            //{
            //    if (buscarTipoMaquina("DESPALETIZADORA")) return true;
            //    else return false;
            //}
            get { return _espaletizadora; }
            set { _espaletizadora = value; }
        }

        public bool esEncajonadora
        {
            //get
            //{
            //    if (buscarTipoMaquina("DESPALETIZADORA")) return true;
            //    else return false;
            //}
            get { return _esencajonadora; }
            set { _esencajonadora = value; }
        }

        public bool esEmpaquetadora
        {
            //get
            //{
            //    if (buscarTipoMaquina("DESPALETIZADORA")) return true;
            //    else return false;
            //}
            get { return _esenpaquetadora; }
            set { _esenpaquetadora = value; }
        }

        public bool esEtiquetadora
        {
            get { return _esetiquetadora; }
            set { _esetiquetadora = value; }
        }
        /// <summary>
        /// Indica que la zona puede realizar una asignacion y desasignacion de WOs
        /// </summary>
        public bool InicioPausa
        {
            get;
            set;
        }
        /// <summary>
        /// Indica que la zona es de arranque y habrá que revisar de actualizar la velocidadNominal de llenadora
        /// </summary>
        public bool Arranque
        {
            get;
            set;
        }

        /// <summary>
        /// Indica que la zona es de arranque y habrá que revisar de actualizar la velocidadNominal de llenadora
        /// </summary>
        public bool Permite_Produccion
        {
            get;
            set;
        }
        

        /// <summary>
        /// Indica que las máquinas de la zona pueden compartir la producción
        /// </summary>
        public bool ProduccionCompartida
        {
            get;
            set;
        }

        public List<ZonaCompartida> ZonasCompartidasLinea { get; set; }

        public List<ZonaCompartida> ZonasCompartidasEntreLineas { get; set; }

        //public bool HayMaquinasCompartidas
        //{
        //    get 
        //    {
        //        return this.ListadoMaquinasCompartidas().Count > 0;
        //    }
        //}
        //Metodos

        public void obtenerMaquinas()
        {
            var me = this;
            DAO_Planta p = new DAO_Planta();
            maquinas = p.ObtenerMaquinasZona(ref me);
        }
        public void revisarCambiosWOMaquinas()
        {
            //if (this.esPaletizadora && this.MaquinasCompartidas)
            //Esto solo se hace en la paletizadoras para las multilineas que tienen zonas compartidas, en las demas no se hace porque no existe el dialog de desasignacion de equipos
                var me = this;
                DAO_Planta p = new DAO_Planta();
                List<Maquina> maquinasAux = p.ObtenerMaquinasZona(ref me);
                maquinasAux.ForEach(m =>
                {
                    me.maquinas.Find(old => old.id == m.id).ordenIdMaquina = m.ordenIdMaquina;
                });
            //}
        }

        private void obtenerZonasCompartidas()
        {
            DAO_Planta daoPlanta = new DAO_Planta();
            List<ZonaCompartida> lstZonasCompartidas =  daoPlanta.obtenerZonasCompartidas(this.id);

            this.ZonasCompartidasEntreLineas = lstZonasCompartidas.Where(z => z.NumLinea != this._refLinea.numLinea).ToList();

            this.ZonasCompartidasLinea = lstZonasCompartidas.Where(z => z.NumLinea == this._refLinea.numLinea).ToList();
        }

        public bool buscarTipoMaquina(string tipo)
        {
            foreach (Maquina m in maquinas)
            {
                if (m.tipo.nombre == tipo)
                {
                    return true;
                }
            }
            return false;
        }

        public Zona zonaCompartida() //obtiene las zonas compartidas de otras lineas
        {
            if (idLineaComparteZona != null)
            {
                if (_refLinea != null)
                {
                    string idLinComparte = this.id.Substring(this.id.IndexOf(".C", 0) + 2, 1);
                    Linea lineaComparte = _refLinea._refPlanta.lineas.Find(linea => linea.id.Contains(idLinComparte));
                    return lineaComparte.zonas.Find(zona => zona._id.Contains(".C" + this._refLinea.numLinea));
                }
            }
            return null;
        }

        //public List<Maquina> ListadoMaquinasCompartidas() 
        //{
        //    return this.maquinas.Where(m => m.Compartida).ToList();
        //}

        public bool MaquinasCompartidas { get; set; }
    }
}
