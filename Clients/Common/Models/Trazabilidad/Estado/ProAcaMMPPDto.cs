using System;

namespace Common.Models.Trazabilidad.Estado
{
    public class ProAcaMMPPDto
    {
        public string IdLinea { get; set; }
        public DateTime? Fecha { get; set; }
        public string SSCC { get; set; }
        public int Minutos { get; set; }
    }
}