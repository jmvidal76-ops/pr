using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class Operation
    {
        public Operation() { }

        public DateTime fecha { get; set; }
        public double antiguaCantidad { get; set; }
        public double nuevaCantidad { get; set; }
        public double cantidad { get; set; }
        public string asocciateTo { get; set; }
        public string comments { get; set; }
        public string equipoOrigenPK { get; set; }
        public string equipoOrigenID { get; set; }
        public string equipoOrigenPath { get; set; }
        public string equipoDestinoPK { get; set; }
        public string equipoDestinoID { get; set; }
        public string equipoDestinoPath { get; set; }
        public string numeroSerie { set; get; }
        //public string materialID { get; set; }
        //public string materialPK { get; set; }
        //public string materialDesc { get; set; }


    }
}