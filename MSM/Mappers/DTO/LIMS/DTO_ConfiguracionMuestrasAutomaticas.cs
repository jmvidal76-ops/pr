using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.LIMS
{
    public class DTO_ConfiguracionMuestrasAutomaticas
    {
        public int IdConfiguracionMuestrasAutomaticas { get; set; }
        public string ProcesoLote { get; set; }
        public string ClaseLote { get; set; }
        public int IdMaestroFlujos { get; set; }
        public bool Activo { get; set; }
    }
}