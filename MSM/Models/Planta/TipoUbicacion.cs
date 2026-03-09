using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Planta
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
        Producción = 10
    }
}