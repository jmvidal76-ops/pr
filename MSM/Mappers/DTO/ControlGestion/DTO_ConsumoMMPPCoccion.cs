using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_ConsumoMMPPCoccion
    {
        public string Ubicacion { get; set; }
        public string IdMosto { get; set; }
        public string DescripcionMosto { get; set; }
        public decimal CantidadProducida { get; set; }
        public decimal GradoPlato { get; set; }
        public string IdMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public string Clase { get; set; }
        public decimal Cantidad { get; set; }
        public string UnidadMedida { get; set; }
        public string IdProveedor { get; set; }
        public string DescripcionProveedor { get; set; }
        public decimal Coeficiente { get; set; }
        public decimal CantidadCoef { get; set; }
        public decimal CantidadCDG { get; set; }
        public int NumCoccion { get; set; }
    }
}