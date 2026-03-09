using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO.Fabricacion
{
    public class DTO_MaterialOrdenPreparacion
    {
        public long Id { get; set; }
        public string IdMaterial { get; set; }
        public float Cantidad {get;set;}
        public string IdLote { get; set; }
    }
}