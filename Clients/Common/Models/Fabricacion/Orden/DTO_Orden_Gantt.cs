using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSM_FabricacionAPI.Models.Orden
{
    public class DTO_Orden_Gantt
    {
        public Int64 Id { get; set; }
        public string CodWO { get; set; }
        public string Descripcion { get; set; }
        public string IdMaterial { get; set; }
        public string DescMaterial { get; set; }
        public DateTime? FecInicio { get; set; }
        public DateTime? FecFin { get; set; }
        public DateTime? FecInicioPlan { get; set; }
        public DateTime? FecFinPlan { get; set; }
        public decimal? Cantidad { get; set; }
        public string UdMedida { get; set; }
        public Int64? IdPadre { get; set; }
        public bool? Summary {get; set;}
        
        public bool? Expanded { get; set; }
        public int? IdTipoOrden { get; set; }
    }
}