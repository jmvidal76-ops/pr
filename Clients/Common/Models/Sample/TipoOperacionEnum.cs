using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Sample
{
    public enum TipoOperacionEnum
    {
		RegistrarLote = 1,
		MoverLote = 2,
		ConsumirLote = 3,
		ProducirLote = 4,
		PrepararLote = 5,
		DividirLote = 6,
		ReclasificarLote = 7,
		AjustarLote = 8,
		BloquearLote = 9,
		DesbloquearLote = 10,
		CuarentenaPaleta = 11,
		EliminarCuarentenaPaleta = 12,
		BloquearUbicacion = 13,
		AnalizarLote = 14,
		IniciarConsumo = 15,
		FinalizarConsumo = 16,
		EliminarLote = 17,
		EditarLote = 18,
		AjustarLoteGranel = 19,
		UpdAlbaranSalida = 20,
		AjustePrioridad = 21,
		EliminarPrioridad = 22,
		TransformarLote = 24,
		GuardarRegistro = 25,
		RecepcionSinCodigoMaterial = 26,
		CaducidadLote = 27,
		DesconsumirLote = 28,
		DefectuosoLote = 29,
		EditarPropiedadesLote = 30
	}
}
