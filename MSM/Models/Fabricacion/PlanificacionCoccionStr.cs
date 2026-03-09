using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class PlanificacionCoccionStr
    {
        public String CodArticle { get; set; }
        public String Article { get; set; }
        public String ExistenciasTCP { get; set; }
        public String Necesidad { get; set; }
        public String Cocciones { get; set; }
    }
}