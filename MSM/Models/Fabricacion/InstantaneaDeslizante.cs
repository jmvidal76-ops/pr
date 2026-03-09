using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class InstantaneaDeslizante
    {
        public int id { get; set; }

        public DateTime fecha { get; set; }

        public int numAnyoInicial { get; set; }
        public int numSemanaInicial { get; set; }
        public int numAnyoFinal { get; set; }
        public int numSemanaFinal { get; set; }

        public String tipo { get; set; }

    }
}