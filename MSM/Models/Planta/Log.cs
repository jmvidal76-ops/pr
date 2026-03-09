using System;
using System.Collections.Generic;

namespace MSM.Models.Planta
{
    public class Log
    {
        //Atributos

        private long _id;
        private DateTime _fechaHora;
        private string _funcion;
        private string _tipo;
        private string _evento;
        private string _usuario;
        //Constructor

        public Log()
        {

        }

        public Log(long pId, DateTime pFechaHora, string pFuncion, string pTipo, string pEvento, string pUsuario)
        {
            _id = pId;
            _fechaHora = pFechaHora;
            _funcion = pFuncion;
            _tipo = pTipo;
            _evento = pEvento;
            _usuario = pUsuario;
        }

        //Propiedades

        public long id
        {
            get { return _id; }
        }

        public DateTime fechaHora
        {
            set { _fechaHora = value; }
            get { return _fechaHora; }
        }

        public string funcion
        {
            set { _funcion = value; }
            get { return _funcion; }
        }

        public string tipo
        {
            set { _tipo = value; }
            get { return _tipo; }
        }

        public string evento
        {
            set { _evento = value; }
            get { return _evento; }
        }

        public string usuario
        {
            set { _usuario = value; }
            get { return _usuario; }
        }

        //Metodos

    }
}