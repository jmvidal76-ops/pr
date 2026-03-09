using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml;
using System.Xml.Serialization;

namespace MSM.Models.Envasado
{
    public class Semana
    {

        //Atributos
        private int _year;
        private int _numSemana;
        private DateTime _inicioSemana;
        private DateTime _finSemana;

        private List<Turno> _turnos;
        private List<Orden> _ordenes;
        private List<OrdenesArranque> _arranques;
        private List<OrdenesCambio> _cambios;
        //Constructor
        public Semana()
        {

        }

        public Semana(int pYear, int pNumSemana,DateTime pInicio, DateTime pFin)
        {
            _year = pYear;
            _inicioSemana = pInicio;
            _finSemana = pFin;
            _numSemana = pNumSemana;
        }

        //Propiedades


        public int year {
            get { return _year; }
            set { _year = value; }
        }

        public DateTime inicio {
            get { return _inicioSemana; }
            set { _inicioSemana = value; }
        }

        public DateTime fin {
            get { return _finSemana; }
            set { _finSemana = value; }
        }

        public int numSemana
        {
            get { return _numSemana; }
            set { _numSemana = value; }
        }

        public List<Turno> turnos
        {
            get { return _turnos; }
            set { _turnos = value; }
        }

        public List<Orden> ordenes
        {
            get { return _ordenes; }
            set { _ordenes = value; }
        }

        public List<OrdenesArranque> arranques
        {
            get { return _arranques; }
            set { _arranques = value; }
        }

        public List<OrdenesCambio> cambios
        {
            get { return _cambios; }
            set { _cambios = value; }
        }

        public double? oee
        {
            get
            {
                if (turnos != null && turnos.Count > 0)
                {
                    double ?sumOEE = 0.0;
                    foreach (Turno t in turnos)
                    {
                        sumOEE += t.OEE;
                    }
                    return sumOEE / turnos.Count;
                }
                else return null;
            }
        }

        public int? tiempoArrDosTurnos
        {
            get
            {
                if (arranques != null && arranques.Count > 0)
                {
                    int? sumTiempo = 0;
                    foreach (OrdenesArranque a in arranques)
                    {
                        if (a.TipoArranque == 1)
                        {
                            sumTiempo += a.MinutosFinal1;
                        }
                        
                    }
                    return sumTiempo / arranques.Count;
                }
                else return null;
            }
        }


        public int? tiempoArrLunes
        {
            get
            {
                if (arranques != null && arranques.Count > 0)
                {
                    int? sumTiempo = 0;
                    foreach (OrdenesArranque a in arranques)
                    {
                        if (a.TipoArranque == 2)
                        {
                            sumTiempo += a.MinutosFinal1;
                        }

                    }
                    return sumTiempo / arranques.Count;
                }
                else return null;
            }
        }

        public int? tiempoCambios
        {
            get
            {
                if (cambios != null && cambios.Count > 0)
                {
                    int? sumTiempo = 0;
                    foreach (OrdenesCambio a in cambios)
                    {
                       sumTiempo += a.MinutosFinal1;
                    }
                    return sumTiempo / cambios.Count;
                }
                else return null;
            }
        }
    }
}