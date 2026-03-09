using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Almacen
{
    public class DTO_PropiedadesMMPP
    {
        public int IdPropiedad { get; set; }
        public string CodigoEAN { get; set; }
        public string CodigoMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public string DescripcionPropiedad { get; set; }
        public string Valor { get; set; }
        public string UnidadMedida { get; set; }
        public int IdProveedor { get; set; }
        public string DescripcionProveedor { get; set; }
    }
}