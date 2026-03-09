using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class QueryGrafico
    {
        public int id { get; set; }
        public string nombre { get; set; }
        public string texto { get; set; }
        public string tipo { get; set; }
        public string seriesname { get; set; }
        public string maxvalor { get; set; }
        public string[] colores { get; set; }
    }
}