using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_FacturacionSubproductosHistorico
    {
        public int Id { get; set; }
        public int IdTransporte { get; set; }
        public DateTime FechaEnvio { get; set; }
        public string Usuario { get; set; }
        public bool FacturadoJDE { get; set; }
    }
}