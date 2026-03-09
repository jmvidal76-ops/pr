using Common.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_Mermas
    {
        public int Id { get; set; }
        public long IdTurno { get; set; }
        public string Linea { get; set; }
        public int IdTipoTurno { get; set; }
        public string Turno { get; set; }
        public DateTime Fecha { get; set; }

        //public List<DTO_RegistroMermas> Registros {get; set;}
    }

    public class DTO_MermasGrid
    {
        public int Id { get; set; }
        public TipoEnumEstadoMermas Estado { get; set; }
        public string EstadoColor { get {
                return Estado.GetColor();
            } 
        }
        public long IdTurno { get; set; }
        public DateTime Fecha { get; set; }
        public int IdTipoTurno { get; set; }
        public string Turno { get; set; }
        public List<MermasGridMaquina> MaquinasResumen { get; set; }
    }

    public class MermasGridMaquina
    {
        public string CodigoClaseMaquina {get; set; }
        public string ClaseMaquina { get; set; }
        public List<MermasGridContadoresGlobales> contadoresGlobales { get; set; }
    }

    public class MermasGridContadoresGlobales
    {
        public int IdContadorGlobal { get; set; }
        public string NombreContador { get; set; }
        public decimal Valor { get; set; }
    }

    public class MermasContadoresAgrupados
    {
        public string Clase { get; set; }
        public int? ContadorGlobal { get; set; }
        public string NombreContadorGlobal { get; set; }
        public decimal Valor { get; set; }
    }
}