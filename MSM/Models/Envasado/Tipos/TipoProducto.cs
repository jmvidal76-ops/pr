using System;
using System.Collections.Generic;

namespace MSM.Models.Envasado
{
    public class TipoProducto
    {
        //Atributos

        private string _id;
        private string _nombre;

        //Constructor

        public TipoProducto(string pId, string pNombre)
        {
            _id = pId;
            _nombre = pNombre;
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

        //Metodos

    }
}