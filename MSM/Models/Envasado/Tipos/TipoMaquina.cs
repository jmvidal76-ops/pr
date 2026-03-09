using System;
using System.Collections.Generic;

namespace MSM.Models.Envasado
{
    public class TipoMaquina
    {
        //Atributos

        private int _id;
        private string _nombre;

        //Constructor

        public TipoMaquina(int pId,string pNombre){
            _id = pId;
            _nombre = pNombre;
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

        public bool EsLLenadora
        {
            get { return string.IsNullOrEmpty(nombre) ? false : nombre.Equals("LLENADORA"); }
        }
        //Metodos

    }
}