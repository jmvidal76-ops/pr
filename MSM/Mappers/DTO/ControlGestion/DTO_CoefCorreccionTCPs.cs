using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_CoefCorreccionTCPs
    {
        public int IdCoefTCP { get; set; }
        public DateTime FechaInicioAplicacion { get; set; }
        public DateTime? FechaFinAplicacion { get; set; }
        public string CodigoCerveza { get; set; }
        public string DescripcionCerveza { get; set; }
        public string CodigoMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public decimal Coeficiente { get; set; }
    }
}