using ReglasMES.DataAnnotation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace MSM.Models.Planta
{
    public class SimaticMapper
    {

        public static void LoadObject(object retStr, object result)
        {
            Interop.G2Com.G2Structure go = (Interop.G2Com.G2Structure)retStr; // <- HERE WE GET A CAST EXCEPTION
            Object[] my_object = (Object[])go.Values()[7];
            foreach (object obj in my_object)
            {
                Interop.G2Com.G2Structure objEstructura = (Interop.G2Com.G2Structure)obj;
                Object[] my_object2 = objEstructura.Values();

                foreach (PropertyInfo property in result.GetType().GetProperties())
                {
                    SimaticMapAttribute attr = property.GetCustomAttribute<SimaticMapAttribute>();
                    if (attr != null && attr.GetSimaticFieldName() == (string)my_object2[1])
                    {
                        property.SetValue(result, my_object2[2]);
                    }
                }
            }
        }

    }
}