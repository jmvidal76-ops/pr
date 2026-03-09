using MSM.BBDD.Model;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.Fabricacion
{
	public class Mapper_LoteSemielaborado
	{
		public static List<DTO_LoteSemielaborado> MapperDynamicObjectToDTO(dynamic loteSemielaborado)
		{
			List<DTO_LoteSemielaborado> _listDTO = new List<DTO_LoteSemielaborado>();
            try
            {
				foreach (var item in loteSemielaborado)
				{
					_listDTO.Add(new DTO_LoteSemielaborado()
					{
						IdLoteSemielaborado = item.IdLoteSemielaborado,
						Almacen = item.Almacen,
						CantidadActual = item.CantidadActual,
						CantidadInicial = item.CantidadInicial,
						ClaseMaterial = item.ClaseMaterial,
						EstadoUbicacion = item.EstadoUbicacion,
						FechaConsumo = item.FechaConsumo != null? Convert.ToDateTime(item.FechaConsumo).ToLocalTime() : null,
						FechaCreacion = item.FechaCreacion != null ? Convert.ToDateTime(item.FechaCreacion).ToLocalTime() : null,
						IdMaterial = item.IdMaterial,
						IdTipoUbicacion = item.IdTipoUbicacion,
						IdUbicacionOrigen = item.IdUbicacionOrigen,
						LoteMES = item.LoteMES,
						NombreMaterial = item.NombreMaterial,
						PoliticaVaciado = item.PoliticaVaciado,
						TipoMaterial = item.TipoMaterial,
						TipoUbicacion = item.TipoUbicacion,
						Ubicacion = item.Ubicacion,
						IdUbicacionLinkMES = item.IdUbicacionLinkMES,
						Unidad = item.Unidad,
						Zona = item.Zona,
						IdProceso = item.IdProceso,
						Proceso = item.Proceso,
						DescripcionUbicacion = item.DescripcionUbicacion,
						UbicacionConDescriptivo = string.Concat(item.Ubicacion, item.DescripcionUbicacion != null ? " - " : "",item.DescripcionUbicacion),
						IdEstadoLIMS = item.IdEstadoLIMS,
						ColorEstadoLIMS = item.ColorEstadoLIMS,
						Notas = item.Notas
					});
				}
			}catch(Exception ex)
            {

            }
			

			return _listDTO;
		}
	}
}