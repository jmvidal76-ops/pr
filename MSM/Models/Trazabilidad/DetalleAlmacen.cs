using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Trazabilidad
{
    public class DetalleAlmacen
    {
        public string idProp { get; set; }
        public string prop { get; set; }
        public string valor { get; set; }
        public int idSup { get; set; }
        public string aux { get; set; }
    }
}