using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class MaterialMove_BORRAR
    {
        private string _batchID;
        private Int64 _unixTime;
        private DateTime _startDate;
        private DateTime _endDate;
        private string _nombreProc;
        private int _idProc;
        private string _equipoOrigen;
        private string _equipoDestino;
        private Material _material;
        private float _valorMM;
        private string _uom;

        public MaterialMove_BORRAR()
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

        public DateTime startDate
        {
            get { return _startDate; }
            set { _startDate = value; }
        }

        public DateTime endDate
        {
            get { return _endDate; }
            set { _endDate = value; }
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

        public string equipoOrigen
        {
            get { return _equipoOrigen; }
            set { _equipoOrigen = value; }
        }

        public string equipoDestino
        {
            get { return _equipoDestino; }
            set { _equipoDestino = value; }
        }

        public Material material
        {
            get { return _material; }
            set { _material = value; }
        }

        public float valorMM
        {
            get { return _valorMM; }
            set { _valorMM = value; }
        }

        public string uom
        {
            get { return _uom; }
            set { _uom = value; }
        }

    }
}