using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class UpdateWOFab_DTO
    {
        public string Date { get; set; }
        public string DateEnd { get; set; }
        public string Material { get; set; }
        public string IdOrder { get; set; }
        public double Quantity { get; set; }
        public int SourceEquipment { get; set; }
        public int DestinationEquipment { get; set; }
        public string SalaCoccion { get; set; }
    }
}