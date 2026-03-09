using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class HistoricoOrden
    {

         //Atributos
        //private int _idHistorico;
        private string _idOrden;
        private DateTime _fechaCambio;
        private DateTime _fechaCierre;
        private EstadoOrden _estado;
       
        //Constructor

        public HistoricoOrden(string pIdOrden, DateTime pFechaCambio, DateTime pFechaCierre,EstadoOrden pEstado)
        {
            _idOrden = pIdOrden;
            _fechaCambio = pFechaCambio;
            _fechaCierre = pFechaCierre;
            _estado = pEstado;       
        }

        //Propiedades

        public string idOrden
        {
            get { return _idOrden; }
            set { _idOrden = value; }
        }

        public DateTime fechaCambio
        {
            get { return _fechaCambio; }
            set { _fechaCambio = value; }
        }

        public DateTime fechaCierre
        {
            get { return _fechaCierre; }
            set { _fechaCierre = value; }
        }

        public DateTime fechaCambioLocal
        {
            get
            {
                return _fechaCambio.ToLocalTime();
            }
        }

        public DateTime fechaCierreLocal
        {
            get
            {
               return _fechaCierre.ToLocalTime();
            }
        }

        public EstadoOrden estado
        {
            get { return _estado; }
            set { _estado = value; }
        }

        //public int duracion
        //{
        //    get
        //    {
        //        if (fechaCierre != DBNull.Value)
        //        {
        //        }
        //    }
        //}
        //Metodos

    }
}