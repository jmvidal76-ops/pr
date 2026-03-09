using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_LoteMMPPOrden
    {
        public string IdLoteMES { get; set; }
        public string IdMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public string Ubicacion { get; set; }
        public string IdProveedor { get; set; }
        public string Proveedor { get; set; }
        public string LoteProveedor { get; set; }
        public decimal? Cantidad { get; set; }
        public string Unidad { get; set; }
        public DateTime? FechaInicioConsumo { get; set; }
        public DateTime? FechaFinConsumo { get; set; }
    }
}