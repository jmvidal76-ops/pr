using Common.Models;
using Common.Models.TAG;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.TAG
{
    public interface IDAO_Tag
    {
        /// <summary>
        /// Método para obtoner los contadores asociados a un equipo que sea de consumo o produccion_consumo
        /// </summary>
        /// <param name="idUbicacion"></param>
        /// <returns></returns>
        Task<List<TagDto>> GetEquipmentCounterTags(int idUbicacion);
    }
}