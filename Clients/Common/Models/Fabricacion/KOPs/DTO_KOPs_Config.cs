using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Fabricacion.Coccion
{
    public class DTO_KOPs_Config
    {
        
        public string IdValor { get; set; }
        public string Procedimiento { get; set; }
        public string DescKop { get; set; }
        public string Tipo { get; set; }
        public string Valor { get; set; }
        public string Maximo { get; set; }
        public string Minimo { get; set; }
        public string Uom { get; set; }
        public string Formato { get; set; }
        public DateTime? Fecha { get; set; }
        public bool Editable { get; set; }
        public int Estado { get; set; }
        public string IdMosto { get; set; }
        public int Posicion { get; set; }
        public bool? Activo { get; set; }
        public int CodKOP { get; set; }
        public string ListaKOPs { get; set; }
        public string ListaMostos { get; set; }
        public bool? Requerido { get; set; }
    }
}
