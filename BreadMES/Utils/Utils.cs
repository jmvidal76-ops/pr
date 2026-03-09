using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BreadMES.Utilidades
{
    public class Utils
    {
        public static bool HasProperty(dynamic obj, string name)
        {
            return obj[name] != null;
        }
    }
}
