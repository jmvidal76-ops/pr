using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class SeriesStack
    {
        public string name { set; get; }
        public List<float> data { get; set; }
        public string stack { get; set; }
    }
}