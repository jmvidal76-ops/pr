using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.LIMS
{
    public class DTO_AnaliticaLIMS
    {
        public int IdAnalitica { get; set; }
        public int IdMuestra { get; set; }
        public string CodigoTest { get; set; }
        public string DescripcionTest { get; set; }
        public string Componente { get; set; }
        public string DescripcionComponente { get; set; }
        public decimal? ValorResultado { get; set; }
        public string Unidad { get; set; }
        public int Valido_OOS { get; set; }
        public int IdEstado { get; set; }
        public string ColorEstado { get; set; }
        public decimal RangoLimitesMinTOL { get; set; }
        public decimal RangoLimitesMaxTOL { get; set; }
        public decimal RangoLimitesMinLIM { get; set; }
        public decimal RangoLimitesMaxLIM { get; set; }
        public DateTime? FechaResultado { get; set; }
        public DateTime? FechaAutorizacion { get; set; }
        public string PersonaValidado { get; set; }
        public string Comentario { get; set; }
        public DateTime TimeStampSM { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}