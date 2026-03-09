using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_SepararEstadoMaquina
    {
        public DTO_EstadoMaquina estadoMaquina { get; set; }
        public double horaSeparacionMilisegundosUTF { get; set; }
        //public DateTime horaSeparacion { get { return new DateTime(1970,1,1).AddMilliseconds(horaSeparacionMilisegundosUTF) } }
    }
}