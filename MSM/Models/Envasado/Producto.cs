using System;
using System.Collections.Generic;

namespace MSM.Models.Envasado
{
    public class Producto
    {
        //Atributos

        private string _codigo;
        private string _nombre;
        private TipoProducto _tipoProducto;
        private List<Material> _materiales;
        private string _udMedida;
        private double? _hectolitros;

        //Constructor

        public Producto(string pCodigo, string pNombre,string pUdMedida, TipoProducto pTipoProducto,List<Material> pMateriales)
        {
            _codigo = pCodigo;
            _nombre = pNombre;
            _tipoProducto = pTipoProducto;
            _materiales = pMateriales;
            _udMedida = pUdMedida;
            _hectolitros = null;
        }

        public Producto(string pCodigo, string pNombre)
        {
            _codigo = pCodigo;
            _nombre = pNombre;
    
        }

        //Propiedades

        public string codigo
        {
            get { return _codigo; }
            set { _codigo = value; }
        }

        public string nombre
        {
            get { return _nombre; }
            set { _nombre = value; }
        }

        public TipoProducto tipoProducto
        {
            get { return _tipoProducto; }
            set { _tipoProducto = value; }
        }

        public string udMedida
        {
            get { return _udMedida; }
            set { _udMedida = value; }
        }

        public double? hectolitros 
        {
            get { return _hectolitros; }
            set { _hectolitros = value; }
        }

        //Metodos

    }
}