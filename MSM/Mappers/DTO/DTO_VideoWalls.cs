using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_Videowall
    {
        public int Id { get; set; }
        public int IdPantalla { get; set; }
        public int IdLinea { get; set; }
        public string Pagina { get; set; }
        public bool Visible { get; set; }
        public int Duracion { get; set; }
        
    }
}