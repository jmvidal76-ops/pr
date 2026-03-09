using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_EstadoMaquina
    {
        public enum Estados {
            ParoPropio=1000,
            AcumulacionSalida=1001,
            VacioEntrada=1002,
            Produccion=2000,
            Limpieza=3000
        }

        public DateTime fechaInicio { get; set; }
        public DateTime fechaFin { get; set; }

        public string  idLinea { get; set; }
        public string  idZona { get; set; }
        public string  idMaquina { get; set; }
        public Estados estado { get; set; }

        public string nombreEstado { get { return this.estado.ToString(); } }


        public double fechaInicioUTC
        {
            get
            {
                return (fechaInicio - new DateTime(1970, 1, 1)).TotalSeconds;
            }
            set
            {
                fechaInicio = (new DateTime(1970, 1, 1)).AddSeconds(value);
            }

        }

        public DateTime fechaInicioLocal
        {
            get
            {
                return fechaInicio.ToLocalTime();
            }            

        }

        public double fechaFinUTC
        {
            get
            {
                return (fechaFin - new DateTime(1970, 1, 1)).TotalSeconds;
            }
            set
            {
                fechaFin = (new DateTime(1970, 1, 1)).AddSeconds(value);
            }

        }

        public DateTime fechaFinLocal
        {
            get
            {
                return fechaFin.ToLocalTime();
            }

        }

    }
}
