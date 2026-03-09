using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Logistica
{
    public class DTO_OEEPlanificacionConfig
    {
        public int IdOEEPlanificacionConfig { get; set; }
        public string IdLinea { get; set; }
        public string Descripcion { get; set; }
        public string Valor { get; set; }
        public string Unidad { get; set; }
        public string Linea { get; set; }
    }
}