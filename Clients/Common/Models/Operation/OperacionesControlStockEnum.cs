using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
    public enum OperacionesControlStockEnum
    {
        AjustarCantidad = 1,
        Prioridad = 2,
        Cuarentena = 3,
        BloquearLote = 4,
        MoverLote = 5,
        CambiarEstadoUbicacion = 6,
        CrearLote = 7,
        EliminarLote = 8,
        Defectuoso = 9,
        SinDefecto = 10,
        CaducidadLote = 11,
        Desconsumir = 12,
        CuarentenaConsumido = 15,
        BloquearLoteConsumido = 16,
        CaducidadLoteConsumido = 18,
        FechaEntradaPlanta = 19,
        FechaInicioConsumo = 20,
        FechaFinConsumo = 21,
        FechaEntradaUbicacion = 22,
        CambiarUbicacion = 23,
        EditarLote = 24,
        EditarPropiedadLote = 25
	}
}
