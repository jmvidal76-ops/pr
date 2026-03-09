using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReglasMES.DataAnnotation
{
    public class SimaticMapAttribute: System.Attribute 
    {
        string simaticField;

        public SimaticMapAttribute(string fieldName) {

            simaticField = fieldName;
        }

        public string GetSimaticFieldName()
        {
            return simaticField;
        }
    }

}
