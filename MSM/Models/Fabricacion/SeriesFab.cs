using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class SeriesFab
    {
        public string name { set; get; }
        public List<string> data { get; set; }
        public string type { get; set; }
        public string color { get; set; }
        public String axis { get; set; }
        public String categoryAxis { get; set; }
    }
}