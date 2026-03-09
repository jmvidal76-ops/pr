using MSM.Models.Envasado;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class QueryResultGraficoFab
    {
        public List<string> Fields { get; set; }
        public List<string> Types { get; set; }
        public List<Hashtable> Records { get; set; }
        public string chart { get; set; }
        public List<float> valores { get; set; }
        public List<SeriesFab> series { get; set; }
        public List<SeriesStack> seriesStack { get; set; }
        public List<int> axisCrossingValues { get; set; }
        public List<EjeYGráfico> axes { get; set; }
        public decimal step { get; set; }
        public List<CategoryAxis> categories { get; set; }

        public QueryResultGraficoFab()
        {
            Fields = new List<string>();
            Types = new List<string>();
            Records = new List<Hashtable>();
            chart = String.Empty;
            valores = new List<float>();
            series = new List<SeriesFab>();
            seriesStack = new List<SeriesStack>();
            axisCrossingValues = new List<int>();
            axes = new List<EjeYGráfico>();
            step = 0;
            categories = new List<CategoryAxis>();
        }
    }
}