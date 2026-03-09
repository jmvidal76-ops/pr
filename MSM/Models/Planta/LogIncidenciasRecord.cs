using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Planta
{
    public class LogIncidenciasRecord
    {
        public int ID_INCIDENCIA { set; get; }
        public string USUARIO { set; get; }
        public string PANTALLA { set; get; }
        public string DESCRIPCION { set; get; }
        public string APLICACION { set; get; }
        public DateTime FECHA_CREACION { get; set; }
   

    }
}