using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class PPR_MSM
    {
        private String _PPR_FinalMaterialId; 
        private String _PPR_FinalMaterialName;            

        public String PPR_FinalMaterialId
        { 
            get {return _PPR_FinalMaterialId;}
            set { _PPR_FinalMaterialId = value; }
        }

        public String PPR_FinalMaterialName
        {
            get { return _PPR_FinalMaterialName; }
            set { _PPR_FinalMaterialName = value; }
        }

    }
}