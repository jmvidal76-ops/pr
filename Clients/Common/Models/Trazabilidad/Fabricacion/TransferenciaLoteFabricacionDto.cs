using System;

namespace Common.Models.Trazabilidad.Fabricacion
{
    public class TransferenciaLoteFabricacionDto
    {
        public int IdTransferencia { get; set; }
        public string LoteSAI { get; set; }
        public string MaterialSAI { get; set; }
        public Nullable<System.DateTime> FechaInicio { get; set; }
        public System.DateTime FechaFin { get; set; }
        public string UbicacionOrigen { get; set; }
        public string UbicacionDestino { get; set; }
        public Decimal? Cantidad { get; set; }
        public string Unidad { get; set; }
        public int Procesado { get; set; }
        public Nullable<System.DateTime> FechaActualizado { get; set; }
        public int IdUbicacionOrigen { get; set; }
        public Nullable<int> PoliticaVaciadoOrigen { get; set; }
        public Nullable<int> IdTipoUbicacionOrigen { get; set; }
        public int ZonaOrigen { get; set; }
        public int IdUbicacionDestino { get; set; }
        public Nullable<int> PoliticaVaciadoDestino { get; set; }
        public Nullable<int> IdTipoUbicacionDestino { get; set; }
        public int ZonaDestino { get; set; }
        public Nullable<int> PoliticaLlenadoOrigen { get; set; }
        public Nullable<int> PoliticaLlenadoDestino { get; set; }
        public Nullable<int> IdTipoSubproceso { get; set; }
        public string TipoMaterialOrigen { get; set; }
        public string ClaseMaterialOrigen { get; set; }
        public string TipoMaterialDestino { get; set; }
        public string ClaseMaterialDestino { get; set; }
        public string DescUbicacionOrigen { get; set; }
        public string DescUbicacionDestino { get; set; }
    }
}