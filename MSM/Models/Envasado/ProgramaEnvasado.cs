using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class ProgramaEnvasado
    {

        //Atributos
        private string _id;
        private string _numSemana;
        private string _anyo;
        private DateTime _primerDiaSemana;
        private string _rutaFichero;


        //Constructor
        public ProgramaEnvasado()
        {

        }

        public ProgramaEnvasado(string pId, string pNumeroSemana, string pAnyo, DateTime pPrimerDiaSemana,string pRutaFichero)
        {
            _id = pId;
            _numSemana = pNumeroSemana;
            _anyo = pAnyo;
            _primerDiaSemana = pPrimerDiaSemana;
            _rutaFichero = pRutaFichero;
        }

        //Propiedades
        public string id
        {
            get { return _id; }
            set { _id = value; }
        }

        public string numSemana
        {
            get { return _numSemana; }
            set { _numSemana = value; }
        }

        public string anyo
        {
            get { return _anyo; }
            set { _anyo = value; }
        }

        public DateTime primerDiaSemana
        {
            get { return _primerDiaSemana; }
            set { _primerDiaSemana = value; }
        }

        public string periodo
        {
            get {
                return "Del " + _primerDiaSemana.GetDateTimeFormats()[0] + " al " + new DateTime(_primerDiaSemana.Year, _primerDiaSemana.Month, _primerDiaSemana.AddDays(6).Day).GetDateTimeFormats()[0];
            }
        }

        public string rutaFichero
        {
            get { return _rutaFichero; }
            set { _rutaFichero = value; }
        }
    }
}