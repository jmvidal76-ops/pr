using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
    public class ProduccionesDto
    {
        public List<ProduccionDto> Producciones { get; set; }
        public bool EsAnular { get; set; }
        public DateTime FechaProduccion { get; set; }
        public string ParticionWO { get; set; }
    }
}
