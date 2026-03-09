using System;
using System.Collections.Generic;

namespace MSM.Models.Envasado
{
    public class TipoTurno
    {
        //Atributos

        private int _id;
        private string _nombre;
        private DateTime _inicio;
        private DateTime _fin;

        //Constructor
        public TipoTurno()
        { }
        
        public TipoTurno(int pId, string pNombre)
        {
            _id = pId;
            _nombre = pNombre;
        }

        public TipoTurno(int pId, string pNombre, DateTime pInicio, DateTime pFin)
        {
            _id = pId;
            _nombre = pNombre;
            _inicio = pInicio;
            _fin = pFin;
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

        public DateTime inicio
        {
            get { return _inicio.ToLocalTime(); }
            set { _inicio = value; }
        }

        public DateTime fin
        {
            get { return _fin.ToLocalTime(); }
            set { _fin = value; }
        }

        public DateTime inicioUTC
        {
            get { return _inicio; }
            set { _inicio = value; }
        }

        public DateTime finUTC
        {
            get { return _fin; }
            set { _fin = value; }
        }

        //Metodos

    }
}
