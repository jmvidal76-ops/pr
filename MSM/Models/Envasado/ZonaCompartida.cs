using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class ZonaCompartida
    {
        public string Id { get; set; }
        
        public string Nombre { get; set; }

        public string Descripcion { get; set; }

        public int NumLinea { get; set; }

        public string NumLineaDescripcion { get; set; }
    }
}