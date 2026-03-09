using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion
{
    public class DTO_Transferencias
    {
        public string IdTransferencia { get; set; }
        public string LoteSAI { get; set; }
        public string IdLoteMES { get; set; }
        public string LoteOrigen { get; set; }
        public string LoteDestino { get; set; }
        public string MaterialSAI { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public string UbicacionOrigen { get; set; }
        public string UbicacionDestino { get; set; }
        public Decimal? Cantidad { get; set; }
        public string Unidad { get; set; }
        public string Procesado { get; set; }
        public string MensajeProcesado { get; set; }
        public DateTime? FechaActualizado { get; set; }
        public string IdMaterialOrigen { get; set; }
        public string IdMaterialDestino { get; set; }
        public string DescripcionMaterialOrigen { get; set; }
        public string DescripcionMaterialDestino { get; set; }
        public string CodUbicacionOrigen { get; set; }
        public string CodUbicacionDestino { get; set; }
        public string ClaseMaterialOrigen { get; set; }
        public string ClaseMaterialDestino { get; set; }
        public string IdProveedor { get; set; }
        public string DescripcionProveedor { get; set; }
        public int? IdMovimiento { get; set; }
    }
}