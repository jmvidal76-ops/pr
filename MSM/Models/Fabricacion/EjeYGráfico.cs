using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class EjeYGráfico
    {
        public string name { set; get; }
        public string color { get; set; }
        public float min { get; set; }
        public float max { get; set; }
        public Title title { get; set; }
    }
}