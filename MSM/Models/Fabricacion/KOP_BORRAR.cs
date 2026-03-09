using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class KOP_BORRAR
    {

        private string _batchID;
        private Int64 _unixTime;
        private DateTime _timeStamp;
        private string _nombreProc;
        private int _idProc;
        private string _equipo;
        private string _codKOP;
        private float _valorKOP;
        private string _uom;
        private string _tipoKOP;

        public KOP_BORRAR()
        { }

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

        public DateTime timeStamp
        {
            get { return _timeStamp; }
            set { _timeStamp = value; }
        }

        public string nombreProc
        {
            get { return _nombreProc; }
            set { _nombreProc = value; }
        }

        public int idProc
        {
            get { return _idProc; }
            set { _idProc = value; }
        }

        public string equipo
        {
            get { return _equipo; }
            set { _equipo = value; }
        }

        public string codigoKOP
        {
            get { return _codKOP; }
            set { _codKOP = value; }
        }

        public float valorKOP
        {
            get { return _valorKOP; }
            set { _valorKOP = value; }
        }

        public string uom
        {
            get { return _uom; }
            set { _uom = value; }
        }

        public string tipoKOP
        {
            get { return _tipoKOP; }
            set { _tipoKOP = value; }
        }
    }
}