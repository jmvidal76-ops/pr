using Common.Models.Material;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Transportes
{
   public class AlbaranDto
    {
        public int IdAlbaran { get; set; }

        public string CodigoAlbaran { get; set; }
        public Nullable<decimal> Cantidad { get; set; }
        public int IdTipo { get; set; }
        public MaterialDto Material { get; set; }
        public OrdenAprovisionamientoDto OrdenAprovisionamiento { get; set; }
        public int IdTransporte { get; set; }
        public Nullable<int> IdProveedor { get; set; }
        public string NombreProveedor { get; set; }
        public bool Activo { get; set; }
        public string CreadoPor { get; set; }
        public Nullable<System.DateTime> Creado { get; set; }
        public string ActualizadoPor { get; set; }
        public Nullable<System.DateTime> Actualizado { get; set; }
        public decimal? CantidadInicial { get; set; }
        public decimal? CantidadActual { get; set; }

    }
}
