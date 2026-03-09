using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MSM.Models.Fabricacion;

namespace MSM.Models.Envasado
{
    public class QueryResultGrafico
    {
        public List<string> Fields { get; set; }
        public List<string> Types { get; set; }
        public List<Hashtable> Records { get; set; }
        public string chart { get; set; }
        public List<float> valores { get; set; }
        public List<Series> series { get; set; }
        public List<SeriesStack> seriesStack { get; set; }

    }
}