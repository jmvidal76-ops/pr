using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Mantenimiento
{
    public class DTO_DatosValidacionArranque
    {
        public int Id { get; set; }

        public int OT { get; set; }

        public string ResponsableProduccion { get; set; }

        public string ResponsableMantenimiento { get; set; }

        public DateTime FechaValidacion { get; set; }


    }
}