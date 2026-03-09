using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_DevolucionSmile
    {
        public DTO_SolicitudSmile Solicitud { get; set; }
        public string Lote { get; set; }
    }
}