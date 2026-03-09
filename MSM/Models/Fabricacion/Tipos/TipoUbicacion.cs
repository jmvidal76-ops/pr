using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion.Tipos
{
    public enum TipoUbicacion
    {
		Recepcion = 1,
		Almacenamiento = 2,
		AlmacenamientoConsumo = 3,
		Consumo = 4,
		Preparacion = 5,
		Virtual = 6,
		Carga = 7,
		Descarga = 8,
		ProduccionConsumo = 9,
		Produccion = 10,
		UbicacionLogica = 11

	}
}