using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_ContingenciasHoras
    {
        public int ID { set; get; }
        public string _hora { get; set; }
        public int eLlenadora { get; set; }
        public int pPaletizadora { get; set; }
        public int env_vacios { get; set; }
        public int env_llenos { get; set; }
        public int Turno { get; set; }
        public DateTime Fecha { get; set; }

        public string Hora
        {
            get
            {
                DateTime noUTC = Fecha.ToLocalTime();

                TimeSpan diferencia = noUTC - Fecha;

                int hora = int.Parse(_hora.ToString());

                hora += diferencia.Hours;

                return hora.ToString() + ":00";
            }
        }

    }
}