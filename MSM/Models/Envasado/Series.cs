using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MSM.Models.Fabricacion;

namespace MSM.Models.Envasado
{
    public class Series
    {
        public string name { set; get; }
        public List<float> data { get; set; }
    }


}