using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_KOP
    {
        public int idValor { set; get; }
        public string descKOP { set; get; }
        public DateTime fecha { set; get; }
        public string tipo { set; get; }
        public string uom { set; get; }
        public string valor { set; get; }
        public string minimo { set; get; }
        public string maximo { set; get; }
        public string procedimiento { set; get; }
        public string material { set; get; }
        public string formato { set; get; }
        public string semaforo { set; get; }
    }
}