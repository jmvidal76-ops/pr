using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class Procedure_BORRAR
    {
        private string _batchID;
        private Int64 _unixTime;
        private DateTime? _startDate;
        private DateTime? _endDate;
        private string _nombre;
        private int _id;
        private string _equipo;

        public Procedure_BORRAR() { }

        public string batchId
        {
            get { return _batchID; }
            set { _batchID = value; }
        }

        public Int64 unixTime
        {
            get { return _unixTime; }
            set { _unixTime = value; }
        }

        public DateTime? startDate
        {
            get { return _startDate; }
            set { _startDate = value; }
        }

        public DateTime? endDate
        {
            get { return _endDate; }
            set { _endDate = value; }
        }

        public string nombre
        {
            get { return _nombre; }
            set { _nombre = value; }
        }

        public int id
        {
            get { return _id; }
            set { _id = value; }
        }

        public string equipo
        {
            get { return _equipo; }
            set { _equipo = value; }
        }


    }

}
