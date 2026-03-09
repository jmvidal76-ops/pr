using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class RendimientoTurno
    {
        public List<string> Horas { get; set; }
        public List<Serie> Series { get; set; }

        public class Serie
        {
            public string name { get; set; }
            public List<int?> data { get; set; }
            public string color { get; set; }
        }
    }
}