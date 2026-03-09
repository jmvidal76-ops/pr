using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_DatosProduccionTurno
    {
        public int rechazosClasificadores { get; set; }

        public int rechazosInspectorVacios { get; set; }

        public int rechazosLlenadora { get; set; }

        public int rechazosProductoTerminado { get; set; }

        public int rechazos { get; set; }

        public int envases { get; set; }

        public double hectolitros { get; set; }

        public double tiempoPlanificado { get; set; }

        public double tiempoOperativo { get; set; }

        public double tiempoBruto { get; set; }

        public double tiempoNeto { get; set; }

        public double velocidadNominal { get; set; }

        public double velocidadRealMedia { get; set; }

        public int produccionReal { get; set; }

        public int cajas { get; set; }

        public int palets { get; set; }

        public DateTime fecInicio { get; set; }

        public DateTime fecFin { get; set; }

        public string idMaquina { get; set; }

        public double disponibilidad
        {
            get
            {
                if (tiempoPlanificado == 0.0) return 0.0;
                else return (tiempoOperativo / tiempoPlanificado) * 100.0;
            }
        }

        public double eficiencia
        {
            get
            {
                if (tiempoOperativo == 0.0) return 0.0;
                else return (tiempoNeto / tiempoOperativo) * 100.0;
            }
        }

        public double rendimiento
        {
            get
            {
                return velocidadNominal > 0 ? (envases / (velocidadNominal)) * 100.0 : 0;
            }
        }

        public double oee
        {
            get
            {
                //return (disponibilidad * eficiencia) / 100.0;
                var envasesTeoricos = velocidadNominal;
                return envasesTeoricos > 0 ? (envases / envasesTeoricos) * 100 : 0;
            }
        }
    }
}