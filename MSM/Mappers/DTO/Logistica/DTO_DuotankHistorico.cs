using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Logistica
{
    public class DTO_DuotankHistorico
    {
        public int IdDuotankHistorico { get; set; }
        public string Zona { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public string Matricula { get; set; }
        public string Operacion { get; set; }
        public decimal? Porcentaje { get; set; }

    }
}