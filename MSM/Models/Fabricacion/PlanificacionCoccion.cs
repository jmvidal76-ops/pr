using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class PlanificacionCoccion
    {
        public String CodArticle { get; set; }
        public String Article { get; set; }
        public Double ExistenciasTCP { get; set; }
        public Double Necesidad { get; set; }
        public Double Cocciones { get; set; }
    }
}