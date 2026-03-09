using System;
using System.Collections.Generic;

namespace Common.Models.Trazabilidad.Fabricacion
{
    public class MovimientoLoteCantidadDto
    {
        public List<int> IdMovimientos { get; set; }
        public Nullable<decimal> Cantidad { get; set; }
    }
}