using MSM.Models.Fabricacion.Tipos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class PlantillaPreparacion
    {
        public long IdPlantilla { get; set; }
        public string Descripcion {get; set;}
        public TipoOrdenPreparacion Tipo {get;set;}
        public int IdUbicacion {get; set;}
        public string Ubicacion {get; set;}
        public DateTime FechaCreacion {get; set;}
        public float Volumen {get; set;}
		public string Unidades {get; set;}
		public string NotasSupervisor {get; set;}
		public string NotasOficial {get; set;}
    }
}