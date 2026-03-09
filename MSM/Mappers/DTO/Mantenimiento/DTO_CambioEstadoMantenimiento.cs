using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Mantenimiento
{
    public class DTO_CambioEstadoMantenimiento
    {
        public int OT { get; set; }
        public string Estado { get; set; }
        public string EstadoDescripcion { get; set; }
        public DateTime Fecha { get; set; }
    }
}