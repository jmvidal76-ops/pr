using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Administracion
{
    public class DTO_MensajeAdministracion
    {
        public int IdMensajeAdministracion { get; set; }
        public string Descripcion { get; set; }
        public string Opcion { get; set; }
        public bool Activo { get; set; }
    }
}