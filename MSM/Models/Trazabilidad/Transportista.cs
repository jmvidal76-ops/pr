using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Trazabilidad
{
    public class Transportista
    {
        public string Nombre  { get; set; }

        public string NIF { get; set; }

        public string Direccion { get; set; }

        public string Poblacion { get; set; }

        public string Telefono { get; set; }

        public string Observaciones { get; set; }
    }
}