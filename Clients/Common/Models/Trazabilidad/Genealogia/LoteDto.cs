using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Trazabilidad.Genealogia
{
    public class LoteDto
    {
        public string IdLoteMES { get; set; }

        public DateTime? FechaCreacion { get; set; }

        public string ReferenciaMES { get; set; }

        public string NombreMaterial { get; set; }

        public decimal? CantidadActual { get; set; }

        public decimal? CantidadInicial { get; set; }

        public string UbicacionMES { get; set; }

        public int? IdAlbaran { get; set; }

        public int Paleta { get; set; }

        public string IdordenOrigen { get; set; }

        public int? IdProceso { get; set; }

        public string Proceso { get; set; }

        public string NombreUbicacion { get; set; }

        public int? IdLote { get; set; }

        public int? IdUbicacion { get; set; }

        public string Almacen { get; set; }

        public string Zona { get; set; }

        public string Ubicacion { get; set; }

        public string IdUbicacionLinkMES { get; set; }

        public int? IdTipoMaterialMovimiento { get; set; }

        public string Unidad { get; set; }

        public string IdProveedor { get; set; }

        public string NombreProveedor { get; set; }

        public string LoteProveedor { get; set; }

        public DateTime? FechaCaducidad { get; set; }

        public string SSCC { get; set; }

        public string TipoMaterial { get; set; }

        public string ClaseMaterial { get; set; }

        public string IdMaterial { get; set; }

        public string EstadoUbicacion { get; set; }

        public int? IdTipoUbicacion { get; set; }

        public string TipoUbicacion { get; set; }

        public string CodWO { get; set; }

        public string imageUrl { get; set; }

        public string IdClaseMaterial { get; set; }

        public int IdEstadoLIMs { get; set; }

        public string ColorEstadoLIMs { get; set; }

        public string Notas { get; set; }
    }
}
