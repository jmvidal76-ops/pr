using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class DTO_MakeTransfer
    {
        public String Order { get; set; }
        public String Destination { get; set; }
        public String Quantity { get; set; }
        public String Article { get; set; }
        public String Option { get; set; }
        public String Date { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}