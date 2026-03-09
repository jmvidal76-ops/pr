using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_HistoricoStocks
    {
        public int Id { get; set; }
        public DateTime FechaCaptura { get; set; }
        public int IdZona { get; set; }
        public string DescripcionZona { get; set; }
        public string Ubicacion { get; set; }
        public string CodigoSemielaborado { get; set; }
        public string DescripcionSemielaborado { get; set; }
        public int? IdProceso { get; set; }
        public string Proceso { get; set; }
        public decimal? Cantidad { get; set; }
        public string UnidadMedida { get; set; }
        public decimal? Extracto { get; set; }
        public decimal Coeficiente { get; set; }
        public decimal? CantidadCoef { get; set; }
        public decimal? CantidadCDG { get; set; }
        public decimal? GradoAlcoholico { get; set; }
        public decimal? Densidad { get; set; }
        public decimal? KgExtracto { get; set; }
    }
}