using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{

    public class SemanaInstantaneaDeslizante
    {
        public string Item { get; set; }
        public string Descripcion { get; set; }
        public int Anio { get; set; }
        public int Semana { get; set; }
        public double Cantidad { get; set; }
        
        public string Linea { get; set; }
        public string Formato { get; set; }
        public string Paleta { get; set; }
    }

    public class DatosInstantaneaDeslizante
    {
        public int vista { get; set; }
        public DateTime fechaInicial { get; set; }
        public int numAnyoInicial {get; set; }
        public int numSemanaInicial	{get; set; }

        public DateTime fechaFinal { get; set; }
        public int numAnyoFinal	{get; set; }
        public int numSemanaFinal {get; set; }
        public List<SemanaInstantaneaDeslizante> datos { get; set; }

    }
}