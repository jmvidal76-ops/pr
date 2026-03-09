using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace MSM.Models.Envasado
{
    public class ParametroVista
    {

        //Atributos
        private string _nombre;
        private string _valor;

           //Constructor
        public ParametroVista()
        {

        }

        public ParametroVista(string pNombre, string pValor)
        {
            _nombre = pNombre;
            _valor = pValor;
        }

        //Propiedades
        public string valor
        {
            get { return _valor; }
            set { _valor = value; }
        }

        public string nombre
        {
            get { return _nombre; }
            set { _nombre = value; }
        }

    }

    public class Vista
    {

         //Atributos
        private int _id;
        private string _nombre;
        private string _codigo;
        private string _ruta;
        private string _funcion;
        private string _parametros;
        private string _contenedor;
        private string _acciones;
        private string _seccion;

        //Constructor
        public Vista()
        {

        }

        public Vista(int pId, string pNombre, string pCodigo, string pRuta, string pFuncion, string pParametros, string pContenedor, string pAcciones,string pSeccion)
        {
            _id = pId;
            _nombre = pNombre;
            _codigo = pCodigo;
            _ruta = pRuta;
            _funcion = pFuncion;
            _parametros = pParametros;
            _contenedor = pContenedor;
            _acciones = pAcciones;
            _seccion = pSeccion;
        }

        //Propiedades
        public int id
        {
            get { return _id; }
            set { _id = value; }
        }

        public string nombre
        {
            get { return _nombre; }
            set { _nombre = value; }
        }

        public string codigo
        {
            get { return _codigo; }
            set { _codigo = value; }
        }

        public string ruta
        {
            get { return _ruta; }
            set { _ruta = value; }
        }

        public string funcion
        {
            get { return _funcion; }
            set { _funcion = value; }
        }

        public List<ParametroVista> parametros
        {
            get {
                if (_parametros != null && _parametros != "")
                {
                    return new JavaScriptSerializer().Deserialize<List<ParametroVista>>(_parametros);
                }
                else return new List<ParametroVista>();
               
            }
        }

        public string contenedor
        {
            get { return _contenedor; }
            set { _contenedor = value; }
        }
        public string acciones
        {
            get { return _acciones; }
            set { _acciones = value; }
        }

        public string seccion
        {
            get { return _seccion; }
            set { _seccion = value; }
        }

    }
}