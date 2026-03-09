using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class ContingenciaCantidad
    {
        public int ID { set; get; }
        public string Fecha { get; set; }
        public string Turno { get; set; }
        public int envLlenadora { get; set; }
        public int palPaletizadora { get; set; }
        public int env_vacios { get; set; }
        public int env_llenos { get; set; }
    }
}