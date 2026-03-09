using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Logistica
{
    public class DTO_OEEPlanificaciones
    {
        public long IdOEEPlanificaciones { get; set; }
        public string IdLinea { get; set; }
        public Nullable<int> NumeroLinea { get; set; }
        public string DescripcionLinea { get; set; }
        public string IdProducto { get; set; }
        public string NombreProducto { get; set; }
        public Nullable<double> VelocidadNominal { get; set; }
        public Nullable<decimal> VelocidadNominalOEE { get; set; }
        public Nullable<decimal> OEEPreactor { get; set; }        
        public Nullable<bool> InhabilitarCalculoAC { get; set; }
        public Nullable<double> TiempoArranque { get; set; }
        public Nullable<double> TiempoCambio { get; set; }
        public Nullable<bool> InhabilitarCalculoOEE { get; set; }
        public Nullable<decimal> OEEPlanificado { get; set; }
        public Nullable<decimal> EnvasesMinuto { get; set; }
        public Nullable<double> MediaAC { get; set; }
        public Nullable<decimal> EnvasesPerdidosOEE { get; set; }
        public Nullable<decimal> PorcentajePerdidosAC { get; set; }
        public Nullable<decimal> CBPsHora { get; set; }
        public Nullable<decimal> CPBsTurno { get; set; }
        public decimal AjusteOEE{ get; set; }
        public decimal CPBMDBY { get; set; }
        public string  Color { get; set; }
        public decimal OEEFinalPlanificacion { get; set; }
        public string UdMedida { get; set; }
    }
}