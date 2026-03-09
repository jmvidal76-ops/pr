using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api.Order
{
    public class UpdateProcess_DTO
    {
        public string IdOrder { get; set; }
        public DateTime? Date { get; set; }
        public string Equipment { get; set; }
        public string Material { get; set; }
        public string Entry { get; set; }
        public string Type { get; set; }
    }
}