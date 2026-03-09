using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_AccionesCorrectivasTurno
    {
		public int Id { get; set; }
		public int TurnoId { get; set; }
		public DateTime? TurnoFecha { get; set; }
		public int IdTipoTurno { get; set; }
		public string MaquinaId { get; set; }
		public string MaquinaNombre { get; set; }
		public int? ParoId { get; set; }
		public string ComentarioParo { get; set; }
		public decimal Duracion { get; set; }
		public decimal PerdidaRendimiento { get; set; }
		public string Responsable { get; set; }
		public string AccionRealizada { get; set; }
		/// <summary>
		/// True: Abierta
		/// False: Cerrada
		/// </summary>
		public bool Estado { get; set; }
		public string IdLinea { get; set; }
		public string Observaciones { get; set; }
		public int? OT { get; set; }
		public bool CreadaManual { get; set; }
		public string ComentarioTurno { get; set; }
		public string CreadoPor { get; set; }
	}
}