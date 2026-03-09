using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Mantenimiento
{
    public class DTO_MaestroFabricacion: DTO_MaestroFabricacionBase
    {
        public int IdPadre { get; set; }
    }
}