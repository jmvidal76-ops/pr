using System;

namespace Common.Models.Almacen.ControlStock
{
    public class OperacionLoteDto
    {
        public int IdLoteMateriaPrima { get; set; }
        public string IdLote { get; set; }
        public string UbicacionMES { get; set; }
        public string UbicacionOrigen { get; set; }
        public decimal CantidadActual { get; set; }
        public int? ReplicarLote { get; set; }
    }
}
