using System;
using System.Collections.Generic;
using ReglasMES.DataAnnotation;

namespace MSM.Models.Envasado
{
    public class DatosRechazosTurno
    {        
        public int rechazosClasificadorAutomatico {get;set;}
        public int rechazosClasificadorManual { get; set; }
        public int rechazosVaciosAutomatico { get; set; }
        public int rechazosVaciosManual { get; set; }
        public int rechazosSalidaLlenadoraAutomatico { get; set; }
        public int rechazosSalidaLlenadoraManual { get; set; }
        public int rechazosProductoTerminadoAutomatico { get; set; }
        public int rechazosProductoTerminadoManual { get; set; }
    }
}