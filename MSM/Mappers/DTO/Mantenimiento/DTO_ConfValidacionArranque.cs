using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Mantenimiento
{
    public class DTO_ConfValidacionArranque
    {
        public int Id { get; set; }
        public string Linea { get; set; }

        public string CodigoMaquina { get; set; }

        public string MaquinaDescripcion { get; set; }
    }
}