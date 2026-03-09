using System;

namespace Common.Models.Trazabilidad.Fabricacion
{
    public class MovimientoLoteDto
    {
        public int IdMovimiento { get; set; }
        public Nullable<int> IdTransferencia { get; set; }
        public Nullable<int> IdPlantilla { get; set; }
        public Nullable<int> IdLoteOrigen { get; set; }
        public Nullable<int> IdTipoMaterialMovimientoOrigen { get; set; }
        public string NombreTipoMaterialMovimientoOrigen { get; set; }
        public string LoteOrigen { get; set; }
        public Nullable<int> IdTipoMaterialMovimientoDestino { get; set; }
        public string NombreTipoMaterialMovimientoDestino { get; set; }
        public Nullable<int> IdLoteDestino { get; set; }
        public string LoteDestino { get; set; }
        public Nullable<decimal> Cantidad { get; set; }
        public Nullable<System.DateTime> Creado { get; set; }
        public string CreadoPor { get; set; }
        public Nullable<System.DateTime> Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
        public string LoteSAI { get; set; }
        public string UbicacionOrigen { get; set; }
        public string UbicacionDestino { get; set; }
        public string IdMaterialOrigen { get; set; }
        public string IdMaterialDestino { get; set; }
        public string NombreMaterialOrigen { get; set; }
        public string NombreMaterialDestino { get; set; }
        public bool RestarCantidadEnOrigen { get; set; }
        public bool SumarCantidadEnDestino { get; set; }
    }
}