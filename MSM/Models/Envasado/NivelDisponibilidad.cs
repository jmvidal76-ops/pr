using System;
using System.Collections.Generic;

namespace MSM.Models.Envasado
{
    public class NivelDisponibilidad
    {
        //Atributos

        private int _id;
        private string _nombre;
        private string _icono;

        //Constructor

        public NivelDisponibilidad(int pId, string pNombre,string pIcono)
        {
            _id = pId;
            _nombre = pNombre;
            _icono = pIcono;
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

        public string icono
        {
            get { return _icono; }
            set { _icono = value; }
        }

        //Metodos

    }
}