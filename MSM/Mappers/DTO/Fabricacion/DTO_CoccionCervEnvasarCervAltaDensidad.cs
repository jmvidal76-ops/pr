using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion
{
    public class DTO_CoccionCervEnvasarCervAltaDensidad
    {
        public int IdCervEnvCervAD { get; set; }
        public string CervezaEnvasar { get; set; }
        public string CervEnvasarDescripcion { get; set; }
        public decimal? HlEnvasar { get; set; }
        public decimal? MermaEnvasado { get; set; }
        public decimal? HlNecesariosEnTCPMerma { get; set; }
        public decimal? HlEnTCP { get; set; }
        public decimal? HlNecesariosEnTCP { get; set; }
        public decimal? MermaFiltracion { get; set; }
        public decimal? HlFiltrar { get; set; }
        public decimal? CoefAumentoVolumen { get; set; }
        public decimal? HlNecesariosADEnBodega { get; set; }
        public string TipoCervezaAD { get; set; }
        public string TipoCervADDescripcion { get; set; }
    }
}