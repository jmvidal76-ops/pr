using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_EnvasesCajasPaletProducto
    {
        public int EnvasesPorPalet { get; set; }
        public int CajasPorPalet { get; set; }
        public string UOM { get; set; }
    }
}