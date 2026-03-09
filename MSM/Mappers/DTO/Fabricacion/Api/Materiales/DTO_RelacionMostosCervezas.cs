using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api.Materiales
{
    public class DTO_RelacionMostosCervezas
    {
        public string CodCervTCP { get; set; }
        public string DescripcionCodCervTCP { get; set; }
        public string CodMostFERM { get; set; }
        public string DescripcionCodMostFERM { get; set; }
        public string CodMostCOC { get; set; }
        public string DescripcionCodMostCOC { get; set; }
        public bool ModoActualizacion { get; set; }
    }
}