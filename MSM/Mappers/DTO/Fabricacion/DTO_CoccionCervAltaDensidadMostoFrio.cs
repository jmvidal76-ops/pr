using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion
{
    public class DTO_CoccionCervAltaDensidadMostoFrio
    {
        public int IdCervADMostoFrio { get; set; }
        public string TipoCervezaAD { get; set; }
        public string TipoCervADDescripcion { get; set; }
        public decimal? HlNecesariosADEnBodega { get; set; }
        public decimal? MermaFermGuarda { get; set; }
        public decimal? HlNecesariosEnBodega { get; set; }
        public decimal? HlEnBodega { get; set; }
        public decimal? HlNecesariosMostoFrio { get; set; }
        public string TipoMostoFrio { get; set; }
        public string TipoMostoFrioDescripcion { get; set; }
    }
}