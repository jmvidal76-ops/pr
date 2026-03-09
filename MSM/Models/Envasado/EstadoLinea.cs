using System;
using System.Collections.Generic;

namespace MSM.Models.Envasado
{
    public class EstadoLinea
    {
        //Atributos

        private int _id;
        private string _nombre;
        private string _color;
        //Constructor

        public EstadoLinea(int pId, string pNombre, string pColor)
        {
            _id = pId;
            _nombre = pNombre;
            _color = pColor;
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
        public string color
        {
            get { return _color; }
            set { _color = value; }
        }

        //Metodos

    }
}