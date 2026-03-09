using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_ProduccionMaquinas
    {
        public string IdParticion { get; set; }
        public string IdProducto { get; set; }
        public string DescripcionProducto { get; set; }
        public double? OEE { get; set; }
        public int CantidadProducida { get; set; }
        public Maquina Maquina { get; set; }
    }
}