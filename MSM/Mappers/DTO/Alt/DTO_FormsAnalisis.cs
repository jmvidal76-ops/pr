using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Alt
{
    public class DTO_FormsAnalisis
    {
        public int IdForm { get; set; }
        public string Nombre { get; set; }
        public string PuntoVerificacion { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public string TipoCampo { get; set; }
        public string IdCampo { get; set; }
        public string NombreCampo { get; set; }
        public string FilaColumna { get; set; }
        public string ValorCampo { get; set; }
    }
}