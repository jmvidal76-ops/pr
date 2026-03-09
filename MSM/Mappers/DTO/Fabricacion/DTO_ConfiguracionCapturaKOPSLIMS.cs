using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion
{
    public class DTO_ConfiguracionCapturaKOPSLIMS
    {
        public int IdConfig { get; set; }
        public int? IdTipoWO { get; set; }
        public string DescTipoWO { get; set; }
        public string CodigoKOP { get; set; }
        public string DescKOP { get; set; }
        public string CodigoTest { get; set; }
        public string Componente { get; set; }
        public bool? Activo { get; set; }
    }
}