using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Alt
{
    public class DTO_Forms
    {
        public int IdForm { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaUltimaModificacion { get; set; }
        public string EventoNombre { get; set; }
        public string Estado { get; set; }
        public int EsValido { get; set; }
        public string Errores { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string EstadoSemaforo { get; set; }
        public string ValorSemaforo { get; set; }
    }
}