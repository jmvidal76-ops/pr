using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class msgDeltaV
    {
        public int indice { get; set; }
        public string fabrica { get; set; }
        public string modulo { get; set; }
        public string lote { get; set; }
        public DateTime fecha { get; set; }
        public string dato_descripcion { get; set; }
        public string dato_valor { get; set; }
        public string dato_unidad { get; set; }
        public int fracsec { get; set; }

        public string dFecha { get { return fecha.ToString("dd/MM/yyyy HH:mm:ss"); } }

        public msgDeltaV() { }
    }
}