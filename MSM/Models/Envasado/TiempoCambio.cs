using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class TiempoCambio
    {
        //Atributos
        private long _idTiempoCambio;
        private int _idLinea;
        private string _descLinea;
        private Producto _productoEntrante;
        private Producto _productoSaliente;
        private int _tiempo1;
        private int _tiempo2;
        private int _tiempoM;
        private int _tiempoCalc2;
        private int _tiempopreactor;
        private string _numeroLineaDescripcion;
        private string _formatoComunEntrante;
        private string _formatoComunSaliente;
        private bool _inhabilitarCalculo;

        //Constructor
        public TiempoCambio(long pIdTiempoCambio, int pIdLinea, string pDescLinea, Producto pProductoEntrante, Producto pProductoSaliente, 
                            int pTiempo1, int pTiempo2, int pTiempoM, int tcal, int tprea, string numeroLineaDescripcion,
                            string formatoComunEntrante, string formatoComunSaliente, bool inhabilitarCalculo)
        {
            _idTiempoCambio = pIdTiempoCambio;
            _idLinea = pIdLinea;
            _descLinea = pDescLinea;
            _productoEntrante = pProductoEntrante;
            _productoSaliente = pProductoSaliente;
            _tiempo1 =pTiempo1;
            _tiempo2 = pTiempo2;
            _tiempoM = pTiempoM;
            _tiempoCalc2 = tcal;
            _tiempopreactor = tprea;
            _numeroLineaDescripcion = numeroLineaDescripcion;
            _formatoComunEntrante = formatoComunEntrante;
            _formatoComunSaliente = formatoComunSaliente;
            _inhabilitarCalculo = inhabilitarCalculo;
        }

        //Propiedades
        public long idTiempoCambio
        {
            get { return _idTiempoCambio; }
            set { _idTiempoCambio = value; }
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

        public Producto productoSaliente
        {
            get { return _productoSaliente; }
            set { _productoSaliente = value; }
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

        public string numeroLineaDescripcion
        {
            get { return _numeroLineaDescripcion; }
            set { _numeroLineaDescripcion = value; }
        }

        public string FormatoComunEntrante
        {
            get { return _formatoComunEntrante; }
        }

        public string FormatoComunSaliente
        {
            get { return _formatoComunSaliente; }
        }

        public bool InhabilitarCalculo
        {
            get { return _inhabilitarCalculo; }
        }
        
    }
}