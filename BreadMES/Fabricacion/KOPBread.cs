using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Extensions;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using SITCAB.DataSource.Libraries;
using System.Collections.ObjectModel;

namespace BreadMES.Fabricacion
{
    public class KOPBread
    {
        
        public static bool borrarCurvas()
        {
            CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();
            CURVAS_KOP_CFG_BREAD cfgBread = new CURVAS_KOP_CFG_BREAD();
            CURVAS_KOP_VAL_BREAD valBread = new CURVAS_KOP_VAL_BREAD();
            ReturnValue ret = new ReturnValue();

            Collection<CURVAS_KOP_DEF> listaDef = defBread.Select("", 0, 0, "{OrderID} <> -1");
            foreach (var def in listaDef)
            {
                ret = defBread.Delete(def);
            }

            if (ret.succeeded)
            {
                Collection<CURVAS_KOP_CFG> listaCFG = cfgBread.Select("", 0, 0, "{OrderID} <> -1");
                foreach (var cfg in listaCFG)
                {
                    ret = cfgBread.Delete(cfg);
                }

                if (ret.succeeded)
                {
                    Collection<CURVAS_KOP_VAL> listaVal = valBread.Select("", 0, 0, "{OrderID} <> -1");
                    foreach (var val in listaVal)
                    {
                        ret = valBread.Delete(val);
                    }
                }
            }
            return ret.succeeded;


        }


    }
}
