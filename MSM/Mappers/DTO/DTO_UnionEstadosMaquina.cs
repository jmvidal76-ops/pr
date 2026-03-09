using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_UnionEstadosMaquina
    {
        public bool up { get; set; }
        public DTO_EstadoMaquina estado1 { get; set; }
        public DTO_EstadoMaquina estado2 { get; set; }
    }
}