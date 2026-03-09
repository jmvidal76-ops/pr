using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_PlanificadorConfiguracion
    {
        public int Id { get; set; }
        public string Clave { get; set; }
        public string Valor { get; set; }
        public int Orden { get; set; }
        public string Tipo { get; set; }
    }
}