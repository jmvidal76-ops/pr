using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_PlanificadorWOPlanificadasJDE
    {
        public int IdWOPlanificadasJDE { get; set; }
        public int IdJDE { get; set; }
        public int IdEstadosWO { get; set; }
        public DateTime FechaSolicitada { get; set; }
        public string IdProducto { get; set; }
        public double Cantidad { get; set; }
        public string UOM { get; set; }
        public int Semana { get; set; }
        public string DescripcionProducto { get; set; }
        public int Linea { get; set; }
        public string IdLinea { get; set; }
        public string[] LineasProducto { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaActualizacion { get; set; }
    }
}