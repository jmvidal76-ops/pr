using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_RevisionMMPPCoccion
    {
        public string Ubicacion { get; set; }
        public string IdMosto { get; set; }
        public string DescripcionMosto { get; set; }
        public decimal? CantidadProducida { get; set; }
        public decimal? GradoPlato { get; set; }
        public string IdMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public string IdClase { get; set; }
        public string Clase { get; set; }
        public int? TipoMaterial { get; set; }
        public decimal? Cantidad { get; set; }
        public string UnidadMedida { get; set; }
        public string IdProveedor { get; set; }
        public string DescripcionProveedor { get; set; }
        public string LoteProveedor { get; set; }
        public decimal? Coeficiente { get; set; }
        public decimal? CantidadCoef { get; set; }
        public decimal? CantidadCDG { get; set; }
        public int? NumCoccion { get; set; }
        public string Lote { get; set; }
        public int? IdLote { get; set; }
        public int? IdMovimiento { get; set; }
        public decimal? CantidadInicial { get; set; }
        public decimal? CantidadActual { get; set; }
        public DateTime? FechaEntradaUbicacion { get; set; }
        public DateTime? FechaInicioConsumo { get; set; }
        public DateTime? FechaFinConsumo { get; set; }
        public int? IdAlmacen { get; set; }
        public int? IdZona { get; set; }
        public string Zona { get; set; }
        public int? IdUbicacionLote { get; set; }
        public string UbicacionLote { get; set; }
    }
}