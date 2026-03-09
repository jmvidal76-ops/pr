using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.LIMS
{
    public class DTO_LanzamientoMuestrasLIMs
    {
        public int IdLanzamientoMuestrasLIMs { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string IdLoteMES { get; set; }
        public string Comentarios { get; set; }
        public string ColorEstadoLIMS { get; set; }
    }
}