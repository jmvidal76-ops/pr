using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Transportes
{
   public class OrdenAprovisionamientoDto
    {
       
        public string IdOrdenAprovisionamiento { get; set; }

        public int IdTipoOrdenAprovisionamiento { get; set; }

        public string Descripcion { get; set; }

        public TipoOrdenAprovisionamientoDto TipoOrden { get; set; }

        public string Proveedor { get; set; }

        public decimal CantidadPendiente { get; set; }

        public string UnidadMedida { get; set; }
    }
}
