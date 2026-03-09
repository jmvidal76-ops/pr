using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_TurnosOEE
    {
        public int Id { get; set; }
        public DateTime InicioTurno { get; set; }
        public DateTime FinTurno { get; set; }
        public DateTime? InicioBreak { get; set; }
        public DateTime? FinBreak { get; set; }
    }
}