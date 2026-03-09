using System;
using System.Collections.Generic;
using ReglasMES.DataAnnotation;

namespace MSM.Models.Envasado
{
    public class DatosProduccionOrden : ICloneable
    {
        //Constructores

        public DatosProduccionOrden()
        {
        }

        public int envases { get; set; }
        public int paletsProducidos { get; set; }
        //public int paletsAlmacen { get; set; }
        public int cajas { get; set; }
        public int cantidadPicosCajas { get; set; }
        public int rechazos { get; set; }
        public int rechazosClasificadores { get; set; }
        public int rechazosInspectorVacios { get; set; }
        public int rechazosLlenadora { get; set; }
        public int rechazosProductoTerminado { get; set; }
        //public double hectolitros { get; set; }

        public double velocidadNominal { get; set; }

        public double oee { get; set; }

        public double rendimiento { get; set; }


        public double velocidadRealMedia { get; set; }

        public DateTime fecInicio { get; set; }
        public DateTime fecFin { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }

        public int paletsEtiquetadoraProducidos { get; set; }

        public int envasesHoraActual { get; set; }

        public int rechazosClasificadoresHoraActual { get; set; }

        public int rechazosInspectorVaciosHoraActual { get; set; }

        public int rechazosLlenadoraHoraActual { get; set; }

        public int rechazosProductoTerminadoHoraActual { get; set; }

        public int paletsProducidosHoraActual { get; set; }

        public int cajasHoraActual { get; set; }

        public int cantidadPicosPalets { get; set; }

        public int cantidadEnvasesNoConformidad { get; set; }

        public int cantidadPaletsNoConformidad { get; set; }
    }
}