using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.LIMS
{
    public class DTO_MuestraLIMS
    {
        public int IdMuestra { get; set; }
        public string IdLote { get; set; }
        public string IdMuestraSM { get; set; }
        public string TipoMuestra { get; set; }
        public string Producto { get; set; }
        public string ProductoDesc { get; set; }
        public string Nivel { get; set; }
        public decimal CantidadInicial { get; set; }
        public int IdEstado { get; set; }
        public string ColorEstado { get; set; }
        public DateTime TimeStampSM { get; set; }
        public DateTime FechaCreacion { get; set; }
        public List<DTO_AnaliticaLIMS> Analiticas { get; set; }
    }
}