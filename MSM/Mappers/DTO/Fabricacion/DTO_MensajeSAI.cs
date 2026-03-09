using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion
{
    public class DTO_MensajeSAI
    {
        public int IdOLTPMensaje { get; set; }
        public string Modulo { get; set; }
        public string Lote { get; set; }
        public DateTime Fecha { get; set; }
        public string Descripcion { get; set; }
        public string Valor { get; set; }
        public string Unidad { get; set; }
        public int FracSec { get; set; }
        public int Procesado { get; set; }
        public string MensajeProcesado { get; set; }
        public DateTime FechaLote { get; set; }
    }
}