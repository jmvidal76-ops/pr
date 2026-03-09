using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Siemens.SimaticIT.MM.Breads;
using Siemens.SimaticIT.MM.Breads.Types;

namespace BreadMES.Envasado
{
    public class MaterialBread
    {
        public static MaterialClass ObtenerTipoProducto(int MaterialClassPK)
        {
            MaterialClass_BREAD mClassBread = new MaterialClass_BREAD();
            MaterialClass mClass = mClassBread.SelectByPK(MaterialClassPK).FirstOrDefault();

            return mClass;
        }

        public static Definition ObetenerDefinicionProducto(string ID_PRODUCTO)
        {
            Definition_BREAD defBread = new Definition_BREAD();
            Definition def = defBread.Select("", 0, 0, "{ID}='" + ID_PRODUCTO + "'").FirstOrDefault();

            return def;
        }
    }
}
