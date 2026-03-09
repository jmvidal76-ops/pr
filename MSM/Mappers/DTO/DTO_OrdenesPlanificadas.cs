using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_OrdenesPlanificadas
    {
        public string id { get; set; }
        public string IdProducto { get; set; }
        public string FecIniReal { get; set; }
        public string FecFinReal { get; set; }
        public string FecIniEstimada { get; set; }
        public string FecFinEstimada { get; set; }
        public string Linea { get; set; }
        public int CantidadPlanificada { get; set; }
        public int CantidadProducida { get; set; }
        public string EstadoAct { get; set; }
        public double OEE { get; set; }
        public double Disponibilidad { get; set; }
        public double Eficiencia { get; set; }
        public double RendMecanico { get; set; }
        public double Calidad { get; set; }
    }
}