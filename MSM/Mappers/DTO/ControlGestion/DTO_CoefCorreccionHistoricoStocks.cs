using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_CoefCorreccionHistoricoStocks
    {
        public int IdCoefHistorico { get; set; }
        public DateTime FechaInicioAplicacion { get; set; }
        public DateTime? FechaFinAplicacion { get; set; }
        public int IdProceso { get; set; }
        public string Proceso { get; set; }
        public string CodigoMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public decimal Coeficiente { get; set; }
    }
}