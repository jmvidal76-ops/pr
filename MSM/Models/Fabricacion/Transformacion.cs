using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class Transformacion
    {
        public string OrdenOrigen { get; set; }
        public string OrdenDestino { get; set; }
        public string EquipoOrigen { get; set; }
        public string EquipoDestino { get; set; }
        public string IdEquipoOrigen { get; set; }
        public string IdEquipoDestino { get; set; }
        public string Cantidad { get; set; }
        public string UoM { get; set; }
        public string IdMaterial { get; set; }
        public string Material { get; set; }
        public DateTime Fecha { get; set; }
        public string Lote { get; set; }
        public string LoteMES { get; set; }
        public string IdSubLote { get; set; }
        public string IdLoteOrden { get; set; }

    }
}