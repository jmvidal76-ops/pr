using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class MaterialDetalle
    {
        public string Linea { get; set; }

        public string IdMaterial { get; set; }

        public string NombreMaterial { get; set; }

        public decimal Cantidad { get; set; }

        public string UnidadMedida { get; set; }
    }
}