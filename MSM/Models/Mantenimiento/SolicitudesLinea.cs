using MSM.Mappers.DTO.Mantenimiento;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Mantenimiento
{
    public class SolicitudesLinea
    {
        public string Linea { get; set; }
        public int NumSolicitudes { get; set; }
        public List<DTO_SolicitudIntervencion> OTs { get; set; }
    }
}