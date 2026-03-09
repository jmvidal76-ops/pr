using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;

namespace MSM.Models.Planta
{
    public class Planta
    {
        //Atributos
        private string _id;
        private string _nombre;
        private int _anyoImplantacion;
        private List<Linea> _lineas;
        private List<Producto> _productos;
        private List<Turno> _turnoActual;
        private string _logo;
        private string _descripcion;

        //Constructores
        public Planta()
        {

        }

        public Planta(string pId, string pNombre, bool test = false)
        {
            _id = pId;
            _nombre = pNombre;
            _descripcion = GetDescripcionPlanta(pNombre);
            if (test)
            {
                _descripcion += " TEST";
            }
            obtenerLineas();
            obtenerTurnos();

            if (!string.IsNullOrEmpty(ConfigurationManager.AppSettings["ANYO_IMPLANTACION"]))
            {
                _anyoImplantacion = int.Parse(ConfigurationManager.AppSettings["ANYO_IMPLANTACION"]);
            }
            else
            {
                _anyoImplantacion = DateTime.Today.Year;
            }

            _logo = ConfigurationManager.AppSettings["LOGO"];

            if (ConfigurationManager.AppSettings["ACT_DATOS_PRODUCCION"] == "true")
            {
                //DAO_Log.registrarLogTraza("Planta.cs", "Constructor", "LLamada obtenerDatosProduccion()");
                obtenerDatosProduccion();
            }

        }



        //Propiedades
        public string Id
        {
            get { return _id; }
        }

        public string nombre
        {
            get { return _nombre; }
            set { _nombre = value; }
        }

        public int anyoImplantacion
        {
            get { return _anyoImplantacion; }
            set { _anyoImplantacion = value; }
        }

        public String Logo
        {
            get { return _logo; }
            set { _logo = value; }
        }

        public List<Linea> lineas
        {
            get { return _lineas; }
            set { _lineas = value; }
        }

        public List<Producto> productos
        {
            get { return _productos; }
            set { _productos = value; }
        }

        public List<Turno> turnoActual
        {
            get { return _turnoActual; }
            set { _turnoActual = value; }
        }

        public List<Orden> obtenerOrdenesActivas()
        {
            List<Orden> ordenesActivas = new List<Orden>();
            foreach (Linea lin in lineas)
            {
                ordenesActivas.AddRange(lin.ordenesActivas);
            }
            return ordenesActivas;
        }

        public List<Orden> obtenerOrdenes()
        {
            List<Orden> ordenes = new List<Orden>();
            foreach (Linea lin in lineas)
            {
                ordenes.AddRange(lin.obtenerOrdenes());
            }
            return ordenes;
        }

        public string Descripcion
        { 
            get { return _descripcion; }
            set { _descripcion = value; }
        }
        //Metodos

        public void obtenerLineas()
        {
            var me = this;
            DAO_Planta p = new DAO_Planta();
            lineas = p.ObtenerLineasPlanta(ref me);
        }

        public void obtenerTurnos()
        {
            var me = this;
            DAO_Planta p = new DAO_Planta();
            turnoActual = p.obtenerTurnosLineasPlanta(ref me);
        }

        public void obtenerDatosProduccion()
        {
            var me = this;
            DAO_Produccion bdProd = new DAO_Produccion();
            bdProd.obtenerDatosProduccionPlanta(ref me);
        }

        /// <summary>
        /// Obtiene la descripción de la planta
        /// </summary>
        /// <param name="pNombre">Nombrede la planta</param>
        /// <returns>descripcion planta</returns>
        private string GetDescripcionPlanta(string pNombre)
        {
            try
            {
                return DAO_Planta.GetDescripcionPlanta(pNombre);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "GetDescripcionPlanta", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "Planta.GetDescripcionPlanta", "WEB-PLANTA", "Sistema");
                throw ex;
            }
        }
    }
}
