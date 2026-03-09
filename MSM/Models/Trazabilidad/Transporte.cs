using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Trazabilidad
{
    public class Transporte
    {
        public string Matricula { get; set; }
        public DateTime FechaEntrada { get; set; }
        public DateTime FechaSalida { get; set; }
    }
}