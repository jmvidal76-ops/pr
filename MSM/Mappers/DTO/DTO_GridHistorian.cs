using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_GridHistorian
    {
        private int _fechaInt;
        private string _valor;
        private int _milisegundo;
        private string _estado;
        private int _idHistorian;
        private string _nombreHistorian;
        private string _tipo;
        private DateTime _fechaAct;

        public int fechaEntero
        {
            get
            {
                return _fechaInt;
            }
            set
            {
                _fechaInt = value;
            }
        }

        public DateTime fecha
        {
            get
            {
                return new DateTime(1970, 01, 01).AddSeconds(fechaEntero).ToLocalTime();
            }
        }

        public string valor
        {
            get
            {
                return _valor;
            }
            set
            {
                _valor = value;
            }
        }

        public int milisegundo
        {
            get
            {
                return _milisegundo;
            }
            set
            {
                _milisegundo = value;
            }
        }

        public string estado
        {
            get
            {
                return _estado;
            }
            set
            {
                _estado = value;
            }
        }

        public int id
        {
            get
            {
                return _idHistorian;
            }
            set
            {
                _idHistorian = value;
            }
        }

        public string nombre
        {
            get
            {
                return _nombreHistorian;
            }
            set
            {
                _nombreHistorian = value;
            }
        }

        public string tipo
        {
            get
            {
                return _tipo;
            }
            set
            {
                switch (value)
                {
                    case "i": _tipo = "Numero"; break;
                    default: _tipo = "Texto"; break;
                }
            }
        }

        public DateTime fechaAct
        {
            get
            {
                return _fechaAct;
            }
            set
            {
                _fechaAct = value;
            }
        }

    }
}