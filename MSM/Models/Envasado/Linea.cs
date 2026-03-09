using System;
using System.Collections.Generic;
using System.Linq;
using MSM.BBDD.Envasado;
using P = MSM.Models.Planta;

namespace MSM.Models.Envasado
{
    public class Linea
    {
        //Atributos
        private int _numLinea;
        private string _id;
        private string _nombre;
        private string _descripcion;
        private List<Zona> _zonas;
        private List<Orden> _ordenesPendientes; // Ordenes pendientes en la linea: Planificadas,Preparacion,Pausadas
        private List<Orden> _ordenesActivas; // Ordenes que ya estan en una zona
        private int _posicionLlenadora;
        private string _numLineaDescripcion;

        [NonSerialized]
        public P.Planta _refPlanta;

        public Turno turnoActual;

        //Constructor
        public Linea() { }

        public Linea(int pNumLinea, string numeroLineaDescripcion, string pId, string pNombre, string pDescripcion, ref P.Planta pPlanta)
        {
            _numLinea = pNumLinea;
            _numLineaDescripcion = numeroLineaDescripcion;
            _id = pId;
            _nombre = pNombre;
            _descripcion = pDescripcion;

            _refPlanta = pPlanta;
            if (_id != null)
            {
                obtenerOrdenesPendientes();
                obtenerOrdenesActivas();
                obtenerZonas();
            }
        }

        //Propiedades
        public int numLinea
        {
            get { return _numLinea; }
            set { _numLinea = value; }
        }

        public string numLineaDescripcion
        {
            get { return _numLineaDescripcion; }
            set { _numLineaDescripcion = value; }
        }

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

        public List<Zona> zonas
        {
            get { return _zonas; }
            set { _zonas = value; }
        }

        public List<Orden> ordenesPendientes
        {
            get { return _ordenesPendientes; }
            set { _ordenesPendientes = value; }
        }

        public List<Orden> ordenesActivas
        {
            get { return _ordenesActivas; }
            set { _ordenesActivas = value; }
        }

        public int posicionLlenadora
        {
            get { return _posicionLlenadora; }
        }

        public double oeeCritico { get; set; }

        public double oeeObjetivo { get; set; }

        public string Grupo { get; set; }

        //Obtiene la orden en curso
        public Orden ordenEnCurso
        {

            get
            {
                //List<Orden> ordenesActivas = ordenesActivas;
                if (ordenesActivas != null)
                {
                    if (ordenesActivas.Count == 1)
                    {
                        return ordenesActivas[0];
                    }
                    else if (ordenesActivas.Count == 2)
                    {
                        foreach (Maquina llenadora in this.llenadoras)// this.obtenerMaquinasPorTipo("LLENADORA"))
                        {
                            if (llenadora.orden != null) return llenadora.orden;
                        }
                        
                    }
                }
                return null;
            }

        }
        //Obtiene la orden en curso
        public Orden ordenEnPaletizadora
        {
            get
            {
                foreach (Maquina paletera in this.paleteras)
                {
                    if (paletera.orden != null) 
                        return paletera.orden;
                }

                return null;
            }
        }

        public Orden OrdenEnLlenadora
        {
            get
            {
                foreach (Maquina llenadora in this.llenadoras)
                {
                    if (llenadora.orden != null)
                        return llenadora.orden;
                }

                return null;
            }
        }

        public List<Maquina> obtenerMaquinas
        {
            get
            {
                List<Maquina> maquinas = new List<Maquina>();
                if (zonas != null)
                {
                    foreach (Zona z in zonas)
                    {
                        maquinas.AddRange(z.maquinas);
                    }
                }
                return maquinas.OrderBy(m => m.tipo.nombre).ThenBy(m => m.posicion).ToList();
            }
        }

        //Metodos

        public List<Orden> obtenerOrdenes()
        {
            List<Orden> ordenes = new List<Orden>();
            ordenes.AddRange(this.ordenesActivas);
            ordenes.AddRange(this.ordenesPendientes);
            return ordenes;
        }

        public void obtenerZonas()
        {
            var me = this;
            BBDD.Planta.DAO_Planta p = new BBDD.Planta.DAO_Planta();
            zonas = p.ObtenerZonasLinea(ref me);
        }

        public void actualizarZonas()
        {
            var me = this;
            BBDD.Planta.DAO_Planta p = new BBDD.Planta.DAO_Planta();
            p.actualizarZonasLinea(ref me);
        }

        public void obtenerOrdenesPendientes()
        {
            var me = this;
            BBDD.Planta.DAO_Planta p = new BBDD.Planta.DAO_Planta();
            ordenesPendientes = p.ObtenerOrdenesPendientes(ref me);
        }

        public void obtenerOrdenesActivas()
        {
            var me = this;
            BBDD.Planta.DAO_Planta p = new BBDD.Planta.DAO_Planta();
            ordenesActivas = p.ObtenerOrdenesActivas(ref me);
        }

        public void actualizarOrdenes()
        {
            var me = this;
            BBDD.Planta.DAO_Planta p = new BBDD.Planta.DAO_Planta();
            p.actualizarOrdenes(ref me);
        }

        public List<Maquina> llenadoras
        {
            get
            {
                List<Maquina> lstMaquinas = new List<Maquina>();
                List<Zona> lstzona = this.zonas != null ? this.zonas.Where(z => z.esLlenadora == true).ToList() : null;

                if (lstzona != null)
                {
                    foreach (Zona zona in lstzona)
                    {
                        if (zona.maquinas != null)
                        {
                            lstMaquinas.AddRange(zona.maquinas.Where(m => m.tipo.nombre == "LLENADORA").ToList());
                        }
                    }
                }
                return lstMaquinas;
            }
        }

        public List<Maquina> paleteras
        {
            get
            {
                List<Maquina> lstMaquinas = new List<Maquina>();
                List<Zona> lstzona = this.zonas != null ? this.zonas.Where(z => z.esPaletizadora == true).ToList(): null;

                if (lstzona != null)
                {
                    foreach (Zona zona in lstzona)
                    {
                        lstMaquinas.AddRange(zona.maquinas.Where(m => m.tipo.nombre == "PALETIZADORA").ToList());
                    }
                }
                return lstMaquinas;
            }
        }

        public List<Maquina> etiquetadoras
        {
            get
            {
                List<Maquina> lstMaquinas = new List<Maquina>();
                List<Zona> lstzona = this.zonas != null ? this.zonas.Where(z => z.esPaletizadora == true).ToList() : null;

                if (lstzona != null)
                {
                    foreach (Zona zona in lstzona)
                    {
                        lstMaquinas.AddRange(zona.maquinas.Where(m => m.tipo.nombre == "ETIQUETADORA_PALETS").ToList());
                    }
                }
                return lstMaquinas;
            }
        }

        public List<Maquina> encajonadoras
        {
            get
            {
                List<Maquina> lstMaquinas = new List<Maquina>();
                List<Zona> lstzona = this.zonas != null ? this.zonas.Where(z => z.esEncajonadora || z.esEmpaquetadora).ToList() : null;

                if (lstzona != null)
                {
                    foreach (Zona zona in lstzona)
                    {
                        lstMaquinas.AddRange(zona.maquinas.Where(m => m.tipo.nombre == "ENCAJONADORA" || m.tipo.nombre == "EMPAQUETADORA").ToList());
                    }
                }
                return lstMaquinas;
            }
        }

    }
}