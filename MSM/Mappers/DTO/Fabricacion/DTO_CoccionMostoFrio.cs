using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion
{
    public class DTO_CoccionMostoFrio
    {
        public int IdMostoFrio { get; set; }
        public string TipoMostoFrio { get; set; }
        public string TipoMostoFrioDescripcion { get; set; }
        public decimal? HlNecesariosMostoFrio { get; set; }
        public decimal? HlCoccPlanificadas { get; set; }
        public decimal? HlCoccEnCurso { get; set; }
        public decimal? HlCocer { get; set; }
        public int? NumCocciones { get; set; }
    }
}