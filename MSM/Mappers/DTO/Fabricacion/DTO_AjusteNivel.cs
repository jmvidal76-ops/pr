using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion
{
    public class DTO_AjusteNivel
    {
		public string IdNivelUbicacion { get; set; }
		public string Cantidad { get; set; }
		public string UbicacionOrigen { get; set; }
		public string Unidad { get; set; }
		public string Procesado { get; set; }
		public string MensajeProcesado { get; set; }
		public DateTime? Creado { get; set; }
	}
}