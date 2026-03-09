using System;
using System.Collections.Generic;

namespace MSM.Models.Envasado
{
    public class ParoPerdidaPPAMaquinas
    {


        private int _NumLinea;
        private string _Linea;
        private int _CodMaquina;
        private string _IdMaquina;
        private string _DescripcionMaquina;
        private int _ParoMayorMenor;
        private DateTime _Inicio;
        private DateTime _Fin;
        private int _Duracion;
        private DateTime _InicioTurno;
        private DateTime _FinTurno;
        private int _IdTurno;
        private string _IdTipoTurno;
        private string _NumLineaDescripcion;        


        //Constructor
        public ParoPerdidaPPAMaquinas()
        {
        }

        public ParoPerdidaPPAMaquinas(
            int NumLinea,
            string NumLineaDescripcion,
            string Linea,
            int CodMaquina,
            string IdMaquina,
            string DescripcionMaquina,
            int ParoMayorMenor,
            DateTime Inicio,
            DateTime Fin,
            int Duracion,
            DateTime InicioTurno,
            DateTime FinTurno,
            int IdTurno,
            string IdTipoTurno)
        {
             _NumLinea=NumLinea;
             _NumLineaDescripcion = NumLineaDescripcion;
            _Linea=Linea;
            _CodMaquina=CodMaquina;
            _IdMaquina=IdMaquina;
            _DescripcionMaquina=DescripcionMaquina;
            _ParoMayorMenor=ParoMayorMenor;
            _Inicio=Inicio;
            _Fin=Fin;
            _Duracion=Duracion;
            _InicioTurno=InicioTurno;
            _FinTurno=FinTurno;
            _IdTurno=IdTurno;
            _IdTipoTurno=IdTipoTurno;
        }

        public string IdTipoTurno
        {
            get { return _IdTipoTurno; }
            set { _IdTipoTurno = value; }
        }

        public int IdTurno
        {
            get { return _IdTurno; }
            set { _IdTurno = value; }
        }

        public DateTime FinTurno
        {
            get { return _FinTurno; }
            set { _FinTurno = value; }
        }

        public DateTime InicioTurno
        {
            get { return _InicioTurno; }
            set { _InicioTurno = value; }
        }

        public int Duracion
        {
            get { return _Duracion; }
            set { _Duracion = value; }
        }

        public DateTime Fin
        {
            get { return _Fin; }
            set { _Fin = value; }
        }

        public DateTime Inicio
        {
            get { return _Inicio; }
            set { _Inicio = value; }
        }


        public int ParoMayorMenor
        {
            get { return _ParoMayorMenor; }
            set { _ParoMayorMenor = value; }
        }

        public string DescripcionMaquina
        {
            get { return _DescripcionMaquina; }
            set { _DescripcionMaquina = value; }
        }


        public string IdMaquina
        {
            get { return _IdMaquina; }
            set { _IdMaquina = value; }
        }

        public int CodMaquina
        {
            get { return _CodMaquina; }
            set { _CodMaquina = value; }
        }


        public int NumLinea
        {
            get { return _NumLinea; }
            set { _NumLinea = value; }
        }


        public String Linea 
        {
            get { return _Linea; }
            set { _Linea = value; }
        }

        public string NumLineaDescripcion
        {
            get { return _NumLineaDescripcion; }
            set { _NumLineaDescripcion = value; }
        }
    }
}