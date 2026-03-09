using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_MermasMaquinaContador
    {
        public int IdRegistro { get; set; }
        public string IdLinea { get; set; }
        public int IdMaquina { get; set; }
        public string CodigoMaquina { get; set; }
        public string DescripcionMaquina { get; set; }
        public string ClaseMaquina { get; set; }
        public List<DTO_MermasConfiguracionContador> Contadores { get; set; }
    }
}