using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class ModelHelper
    {
        public static double sanitize(double n) {
            return !(double.IsInfinity(n) || double.IsNaN(n)) ? n : 0;
        }
    }
}