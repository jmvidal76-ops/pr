using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Planta
{
	public enum TipoEnumProcesoPerroGuardian
	{
		CambioEstadoOrden = 1,
		CambioEstadoMaquina = 2,
		ActualizarProduccionPausadasFinalizadas = 3,
		ActualizarProduccionYCambioTurno = 4,
		ActualizarVideowall = 5,
		CambioTriggersALT = 6,
		CalculoICTurno = 7,
		RecalculoICTurno = 8,
		TiempoParosMaquina = 9,
		ProduccionEnvasesLlenadora = 10,
		ServicioFabricacion = 11,
		ActualizarProduccionCerradas = 12,
		ActualizarFechaEstimadaFinWO = 13,
		ActualizarDuotank = 14
	}

	public static class TipoEnumProcesoPerroGuardianExtensions
	{
		public static dynamic GetTriggersInfo()
		{
			return new
			{
				Todos = 0,
				CambioEstadoOrden = 1,
				CambioEstadoMaquina = 2,
				ActualizarProduccionPausadasFinalizadas = 3,
				ActualizarProduccionYCambioTurno = 4,
				ActualizarVideowall = 5,
				CambioTriggersALT = 6,
				TiempoParosMaquina = 9,
				ProduccionEnvasesLlenadora = 10,
				ActualizarFechaEstimadaFinWO = 13,
				ActualizarDuotank = 14
			};
		}
	}
}
