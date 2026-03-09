using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class TiempoArranque
    {
        //Atributos
        private long _idTiempoArranque;
        private int _idLinea;
        private string _descLinea;
        private Producto _productoEntrante;
        private int _tipoArranque;
        private int _tiempo1;
        private int _tiempo2;
        private int _tiempoM;
        private int _tiempoCalc2;
        private int _tiempopreactor;
        private string _descArranque;
        private string _numeroLineaDescripcion;
        private string _formatoComunEntrante;
        private bool _inhabilitarCalculo;

        //Constructor
        public TiempoArranque(long pTiempoArranque,int pIdLinea, string pDescLinea, Producto pProductoEntrante, int pTipoArranque, int pTiempo1, 
                              int pTiempo2, int pTiempoM,int tcal, int tprea, string descArranque, string numeroLineaDescripcion,
                              string formatoComunEntrante, bool inhabilitarCalculo)
        {
            _idTiempoArranque = pTiempoArranque;
            _idLinea = pIdLinea;
            _descLinea = pDescLinea;
            _productoEntrante = pProductoEntrante;
            _tipoArranque = pTipoArranque;
            _tiempo1 =pTiempo1;
            _tiempo2 = pTiempo2;
            _tiempoM = pTiempoM;
            _tiempoCalc2 = tcal;
            _tiempopreactor = tprea;
            _descArranque = descArranque;
            _numeroLineaDescripcion = numeroLineaDescripcion;
            _formatoComunEntrante = formatoComunEntrante;
            _inhabilitarCalculo = inhabilitarCalculo;
        }

        //Propiedades
        public long idTiempoArranque
        {
            get { return _idTiempoArranque; }
            set { _idTiempoArranque = value; }
        }

        public int idLinea
        {
            get { return _idLinea; }
            set { _idLinea = value; }
        }

        public string descLinea
        {
            get { return _descLinea; }
            set { _descLinea = value; }
        }

        public Producto productoEntrante
        {
            get { return _productoEntrante; }
            set { _productoEntrante = value; }
        }

        public int tipoArranque
        {
            get { return _tipoArranque; }
            set { _tipoArranque = value; }
        }

        public int tiempo1
        {
            get { return _tiempo1; }
            set { _tiempo1 = value; }
        }

        public int tiempo2
        {
            get { return _tiempo2; }
            set { _tiempo2 = value; }
        }

        public int tiempoM
        {
            get { return _tiempoM; }
            set { _tiempoM = value; }
        }

        public int tiempoCalculado2
        {
            get { return _tiempoCalc2; }
            set { _tiempoCalc2 = value; }
        }

        public int tiempoPreactor
        {
            get { return _tiempopreactor; }
            set { _tiempopreactor = value; }
        }

        public string descArranque
        {
            get { return _descArranque; }
            set { _descArranque = value; }
        }

        public string numeroLineaDescripcion
        {
            get { return _numeroLineaDescripcion; }
            set { _numeroLineaDescripcion = value; }
        }

        public string FormatoComunEntrante
        {
            get { return _formatoComunEntrante; }
        }

        public bool InhabilitarCalculo
        {
            get { return _inhabilitarCalculo; }
        }
    }
}