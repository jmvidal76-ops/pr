using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_SIGIBloqueoPaletsParoLlenadora
    {
        public int IdBloqueo { get; set; }
        public string IdLinea { get; set; }
        public bool Habilitado { get; set; }
        public int DuracionParoMinutos { get; set; }
        public int NumPalets { get; set; }
        public int DuracionLlenadoraEtiquetadoraMinutos { get; set; }
        public int IdUltimoParo { get; set; }
        public string LineaDescripcion { get; set; }
    }
}