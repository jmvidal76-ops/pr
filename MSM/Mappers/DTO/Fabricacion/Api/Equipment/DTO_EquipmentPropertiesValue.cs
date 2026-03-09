using Siemens.Brewing.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api.Equipment
{
    public class DTO_EquipmentPropertiesValue
    {
        public SitEquipment Equipment { get; set; }

        public string[] PropNames { get; set; }

        public string Plant { get; set; }

        public Dictionary<string, string> Result { get; set; }
    }
}