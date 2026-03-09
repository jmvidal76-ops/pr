using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_DatosCoccion
    {
        public string CodigoWO { get; set; }
        public string EstadoWO { get; set; }
        public string Ubicacion { get; set; }
        public DateTime? FechaProduccion { get; set; }
        public string IdMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public int NumCoccion { get; set; }
        public DateTime? InicioEnfriamiento { get; set; }
        public DateTime? FinEnfriamiento { get; set; }
        public decimal CantidadProducida { get; set; }
        public string UnidadMedida { get; set; }
        public decimal GradoPlato { get; set; }
        public decimal Coeficiente { get; set; }
        public decimal CantidadCoef { get; set; }
        public decimal CantidadCDG { get; set; }
    }
}