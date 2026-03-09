using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class DTO_MaterialProduction
    {
        public string Orden { get; set; }
        public string Material { get; set; }
        public string Cantidad { get; set; }
    }
}