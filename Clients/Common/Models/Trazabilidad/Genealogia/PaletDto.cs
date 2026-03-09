using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Trazabilidad.Genealogia
{
    public class PaletDto
    {
        public string SSCC { get; set; }

        public DateTime? Fecha { get; set; }

        public string Linea { get; set; }

        public string Producto { get; set; }

        public string IdLoteMES { get; set; }

        public string WO { get; set; }
    }
}
