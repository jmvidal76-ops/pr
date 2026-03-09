using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Administracion
{
    public class DTO_TareasScheduler
    {
        public string JobKey { get; set; }
        public string TriggerKey { get; set; }
        public string Grupo { get; set; } 
        public string TipoTarea { get; set; } 
        public DateTime? InicioTrigger { get; set; } 
        public DateTime? ProximaEjecucion { get; set; } 
        public DateTime? UltimaEjecucion { get; set; } 
        public string CronExpresion { get; set; }
        public string Estado { get; set; }
        public string Descripcion { get; set; }
    }

}