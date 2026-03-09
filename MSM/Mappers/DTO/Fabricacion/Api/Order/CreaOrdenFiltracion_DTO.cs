using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class CreaOrdenFiltracion_DTO
    {
        public int PkFilter { get; set; }

        public double Quantity { get; set; }

        public string Material { get; set; }

        public List<Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem> OtherMaterials { get; set; }

    }
}