using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class StartOrder_DTO
    {
        public string IdOrder { get; set; }
        public DateTime? Date { get; set; }
        public string Equipment { get; set; }
        public string Material { get; set; }
    }
}