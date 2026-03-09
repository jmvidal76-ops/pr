using Common.Models.Material;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Transportes
{
   public class AlbaranPosicionDto
    {
        public string IdLote { get; set; }

        public int IdAlbaranPosicion { get; set; }

        public int IdAlbaran { get; set; }

        public decimal? Cantidad { get; set; }

        public decimal? CantidadInicial { get; set; }

        public decimal? CantidadActual { get; set; }

        public string IdOrden { get; set; }

        public int IdTipoOrden { get; set; }

        public string IdMaterial { get; set; }

        public string SourceUoMID { get; set; }

        public decimal? Recepcionado { get; set; }

        public string LoteProveedor { get; set; }

        public int IdTipoAlbaran { get; set; }

        public MaterialDto Material { get; set; }

        public TipoOrdenAprovisionamientoDto TipoOrdenAprovisionamiento { get; set; }

        public OrdenAprovisionamientoDto OrdenAprovisionamiento { get; set; }

        public int IdTransporte { get; set; }

        public bool Activo { get; set; }

        public string INSP { get; set; }
    }
}
