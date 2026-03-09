using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion
{
    public class DTO_FiltracionDatosLineas
    {
        public int IdDatosLineas { get; set; }
        public string Linea { get; set; }
        public string CodigoCerveza { get; set; }
        public string CodigoCervezaDescripcion { get; set; }
        public bool Tipo { get; set; }
        public decimal? HlEnvasar { get; set; }
        public decimal? MermaEnvasado { get; set; }
        public decimal? HlNecesarios { get; set; }
        public decimal? HlEnTCP { get; set; }
        public decimal? BalanceHl { get; set; }
    }
}