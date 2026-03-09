using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class UpdateDecanting_DTO
    {
        public string Material { get; set; }

        public string Inicio { get; set; }

        public string Cantidad { get; set; }

        public int SourceEquipPK { get; set; }

        public int DestinationEquipPK { get; set; }

        public Double CantidadDouble { get; set; }

        public string IdOrden { get; set; }
    }
}