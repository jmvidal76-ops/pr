using MSM.BBDD.Model;
using MSM.Mappers.DTO.Fabricacion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.Fabricacion
{
	public class Mapper_KOPS
	{
		public static List<DTO_KOPS_FAB> Mapper_KOPS_FAB(List<DTO_KOPS_FAB> listKopFab)
		{
			List<DTO_KOPS_FAB> _listDTO = new List<DTO_KOPS_FAB>();
			foreach (var item in listKopFab)
			{
				_listDTO.Add(new DTO_KOPS_FAB()
				{
					Cod_KOP = item.Cod_KOP,
					Cod_Orden = item.Cod_Orden,
					Cod_Procedimiento = item.Cod_Procedimiento,
					Des_KOP = item.Des_KOP,
					Fecha = item.Fecha,
					FechaUTC = item.FechaUTC,
					ID_KOP = item.ID_KOP,
					ID_Orden = item.ID_Orden,
					ID_Procedimiento = item.ID_Procedimiento,
					Obligatorio = item.Obligatorio,
					PkActVal = item.PkActVal,
					Sequence_KOP = item.Sequence_KOP,
					Sequence_Procedimiento = item.Sequence_Procedimiento,
					TipoKOP = item.TipoKOP,
					Tipo_KOP = item.Tipo_KOP,
					UOM_KOP = item.UOM_KOP,
					Valor_Actual = item.Valor_Actual,
					Valor_Maximo = item.Valor_Maximo,
					Valor_Minimo = item.Valor_Minimo,
					Semaforo = item.Semaforo,
					filtroSemaforo = item.filtroSemaforo
				});
			}

			return _listDTO;
		}
	}
}