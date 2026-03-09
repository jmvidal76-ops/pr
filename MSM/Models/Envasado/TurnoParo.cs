using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class TurnoParo
    {
        
        private int _idTurno;

        //Atributos
        private DateTime _fecha;
        private DateTime _inicio;
        private DateTime _fin;

        private TipoTurno _tipo;

        private bool _turnoProductivo;
        private string _idLinea;

        //Constructor
        public TurnoParo()
        {

        }

        public TurnoParo(int pIdTurno,DateTime pFecha, DateTime pInicio, DateTime pFin, TipoTurno pTipo,bool pTurnoProductivo)
        {
            _idTurno = pIdTurno;
            _fecha = pFecha;
            _inicio = pInicio;
            _fin = pFin;
            _tipo = pTipo;
            _turnoProductivo = pTurnoProductivo;
        }

      
        public int idTurno
        {
            get { return _idTurno; }
            set { _idTurno = value; }
        }

        public DateTime fecha { 
            get { return _fecha; }
            set { _fecha = value; }
        }

        public bool turnoProductivo
        {
            get { return _turnoProductivo; }
            set { _turnoProductivo = value; }
        }


        public Double fechaUTC
        {
            get { return (_fecha - new DateTime(1970, 1, 1)).TotalSeconds; }
            
        }

        public DateTime inicio
        {
            get { return _inicio; }
            set { _inicio = value; }
        }

        public DateTime fin
        {
            get { return _fin; }
            set { _fin = value; }
        }

        public DateTime inicioLocal
        {
            get { return _inicio.ToLocalTime(); }
        }

        public DateTime finLocal
        {
            get { return _fin.ToLocalTime(); }
        }

        public Double inicioUTC
        {
            get { return (_inicio - new DateTime(1970, 1, 1)).TotalSeconds; }
        }

        public Double finUTC
        {
            get { return (_fin - new DateTime(1970, 1, 1)).TotalSeconds; }
        }

        public TipoTurno tipo
        {
            get { return _tipo; }
            set { _tipo = value; }
        }

        public string idLinea
        {
            get { return _idLinea; }
            set { _idLinea = value; }
        }
    }
}