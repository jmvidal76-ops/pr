using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_AjusteStock
    {
        public int IdAjuste { get; set; }
        public string Localizacion { get; set; }
        public string IdMaterial { get; set; }
        public string DescMaterial { get; set; }
        public decimal CantidadMES { get; set; }
        public decimal CantidadJDE { get; set; }
        public string Unidad { get; set; }
    }
}