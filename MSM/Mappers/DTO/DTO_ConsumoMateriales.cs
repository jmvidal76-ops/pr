using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_ConsumoMateriales
    {
         public string IdMaterial { get; set; }
        public Nullable<double> Cantidad_Estimada { get; set; }
        public Nullable<double> Cantidad { get; set; }
        public string UOM { get; set; }
        public string Descripcion_Material { get; set; }
        public string IdOrden { get; set; }
        public int tipo { get; set; }
        public string LoteMes { get; set; }
    }
}