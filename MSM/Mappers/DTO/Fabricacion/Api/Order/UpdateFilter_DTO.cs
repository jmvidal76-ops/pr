using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class UpdateFilter_DTO
    {
        public string Date { get; set; }

        public string IdOrder { get; set; }

        public dynamic[] OtherMaterials { get; set; }
    }
}