using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_ConfiguracionMaterialesAjusteStockJDE
    {
        public int IdConfig { get; set; }
        public string IdMaterial { get; set; }
        public string DescMaterial { get; set; }
        public decimal? Cantidad { get; set; }
        public string Unidad { get; set; }
    }
}