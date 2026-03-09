using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Trazabilidad.Genealogia
{
    public class MMPPDto
    {
        public string Lote { get; set; }
        public Nullable<int> IdLote { get; set; }
        public string IdMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public string ClaseMaterial { get; set; }
        public string TipoMaterial { get; set; }
        public Nullable<decimal> CantidadInicial { get; set; }
        public Nullable<decimal> CantidadActual { get; set; }
        public Nullable<System.DateTime> Creado { get; set; }
        public Nullable<int> IdProceso { get; set; }
        public string NombreMaterial { get; set; }
        public string CodWO { get; set; }

        public string IdProveedor { get; set; }

        public string NombreProveedor { get; set; }

        public string LoteProveedor { get; set; }
    }
}
