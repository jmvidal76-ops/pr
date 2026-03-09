using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_DatosProducccionOrdenTurno
    {
        public DateTime fecInicio { get; set; }

        public DateTime fecFin { get; set; }

        public int envases { get; set; }

        public int palets { get; set; }

        public int cajas { get; set; }

        public double oee { get; set; }

        public int rechazosClasificadores { get; set; }

        public int rechazosInspectorVacios { get; set; }

        public int rechazosLlenadora { get; set; }

        public int rechazosProductoTerminado { get; set; }

        public int rechazos { get; set; }

        public double hectolitros { get; set; }

        public double velocidadRealMedia { get; set; }

        public double velocidadNominal { get; set; }

        public double rendimiento { get; set; }
    }
}