using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Trazabilidad
{
    public class Almacen
    {
        public string Descripcion { get; set; }
        public int IdAlmacen { get; set; }
        public int IdTipoAlmacen { get; set; }
        public string DescripcionTipoAlmacen { get; set; }
    }
}