using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class ParametrosLinea
    {
        //Atributos
        private string _idPPR;
        private string _idLinea;
        private int _numeroLinea;
        private string _descripcionLinea;
        private string _idProducto;
        private string _nombreProducto;
        private long _velocidadNominal;
        private double _OEE_objetivo;
        private double _OEE_critico;
        private double _OEE_medio;
        private double _OEE_preactor;
        private string _numeroLineaDescripcion;
        private bool _inhabilitarCalculo;
        private string _formatoComun;
        private int _velocidadNominalMaqLimitante;

        //Constructor
        public ParametrosLinea(string pIdPPR, string pIdLinea, int pNumeroLinea, string pDescripcionLinea, string pIdProducto, string pNombreProducto,
                               long pVelocidad, int pVelocidadNominalMaqLimitante, double pOEE_Objetivo, double pOEE_critico, double pOEE_medio,
                               double pOEE_preactor, string numeroLineaDescripcion, bool inhabilitarCalculo, string formatoComun)
        {
            _idPPR = pIdPPR;
            _idLinea = pIdLinea;
            _idProducto = pIdProducto;
            _velocidadNominal = pVelocidad;
            _velocidadNominalMaqLimitante = pVelocidadNominalMaqLimitante;
            _OEE_objetivo = pOEE_Objetivo;
            _OEE_critico = pOEE_critico;
            _OEE_medio = pOEE_medio;
            _numeroLinea = pNumeroLinea;
            _descripcionLinea = pDescripcionLinea;
            _nombreProducto = pNombreProducto;
            _OEE_preactor = pOEE_preactor;
            _numeroLineaDescripcion = numeroLineaDescripcion;
            _inhabilitarCalculo = inhabilitarCalculo;
            _formatoComun = formatoComun;
        }

        public string idPPR
        {
            get { return _idPPR; }
            set { _idPPR = value; }
        }

        public string id
        {
            get { return _idLinea + _idProducto; }
        }

        public string idLinea 
        {
            get { return _idLinea; }
            set { _idLinea = value; }
        }

        public string nombreLinea
        {
            get { return _numeroLinea + " - " + _descripcionLinea; }          
        }

        public int numeroLinea
        {
            get { return _numeroLinea; }
            set { _numeroLinea = value; }
        }

        public string numeroLineaDescripcion
        {
            get { return _numeroLineaDescripcion; }
            set { _numeroLineaDescripcion = value; }
        }

        public string descripcionLinea
        {
            get { return _descripcionLinea; }
            set { _descripcionLinea = value; }
        }

        public long velocidadNominal
        {
            get { return _velocidadNominal; }
            set { _velocidadNominal = value; }
        }

        public string idProducto
        {
            get { return _idProducto; }
            set { _idProducto = value; }
        }

        public string nombreProducto
        {
            get { return _nombreProducto; }
            set { _nombreProducto = value; }
        }

        public double OEE_objetivo
        {
            get { return _OEE_objetivo; }
            set { _OEE_objetivo = value; }
        }

        public double OEE_critico
        {
            get { return _OEE_critico; }
            set { _OEE_critico = value; }
        }

        public double OEE_medio
        {
            get { return _OEE_medio; }
            set { _OEE_medio = value; }
        }

        public double OEE_preactor
        {
            get { return _OEE_preactor; }
            set { _OEE_preactor = value; }
        }

        public bool InhabilitarCalculo
        {
            get { return _inhabilitarCalculo; }
        }

        public string FormatoComun
        {
            get { return _formatoComun; }
        }

        public int VelocidadNominalMaqLimitante
        {
            get { return _velocidadNominalMaqLimitante; }
            set { _velocidadNominalMaqLimitante = value; }
        }
    }
}