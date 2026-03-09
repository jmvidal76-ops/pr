using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_MailMalaGestionWO
    {
        public int Id { get; set; }
        public string Asunto { get; set; }
        public string CuerpoMensaje { get; set; }
        public bool Activo { get; set; }
        public DateTime? FechaEnvio { get; set; }
        public virtual ICollection<MailGroup> MailGrupos { get; set; }
        public virtual List<Lineas> MailLineas { get; set; }
        public string Direccion { get; set; }
        public string LineaDescripcion { get; set; }
    }
}