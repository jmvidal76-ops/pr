using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Transporte
{
    public class ParametrosAlbaranDto
    {
        public int IdParametroAlbaran { get; set; }
        public string EnumParametro { get; set; }
        public string Parametro { get; set; }
        public byte[] Imagen { get; set; }
    }
}
