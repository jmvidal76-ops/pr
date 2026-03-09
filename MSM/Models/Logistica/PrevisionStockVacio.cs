using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Logistica
{
    public class PrevisionStockVacio
    {
        public long Id { get; set; }
        public string Fecha { get; set; }
        public string CodigoCaja { get; set; }
        public string DescripcionCaja { get; set; }
        public string TipoApunte { get; set; }
        public int Cantidad { get; set; }
        public int Minimo { get; set; }
        public int Maximo { get; set; }
    }
}