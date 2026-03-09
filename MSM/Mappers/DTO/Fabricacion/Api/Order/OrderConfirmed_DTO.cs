using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class OrderConfirmed_DTO
    {
        public string IdOrder { get; set; }
        public string EquipId { get; set; }
        public int SourceEquipPK { get; set; }
        public int DestinationEquipPK { get; set; }
        public string IdMaterial { get; set; }
        public double Quantiy { get; set; }
        public string UoM { get; set; }
        public DateTime? Date { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
    }
}
