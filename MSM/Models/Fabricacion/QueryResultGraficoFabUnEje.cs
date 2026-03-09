using MSM.Models.Envasado;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class QueryResultGraficoFabUnEje
    {
        public List<string> Fields { get; set; }
        public List<string> Types { get; set; }
        public List<Hashtable> Records { get; set; }
        public string chart { get; set; }
        public List<float> valores { get; set; }
        public List<SeriesFabUnEje> series { get; set; }
        public List<SeriesStack> seriesStack { get; set; }
    }
}