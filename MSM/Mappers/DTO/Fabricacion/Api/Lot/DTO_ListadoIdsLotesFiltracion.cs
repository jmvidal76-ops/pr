using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api.Lot
{
    public class DTO_ListadoIdsLotesFiltracion
    {
            public List<int> ListaIdsLotesConsumos { get; set; }

            public List<int> ListaIdsProducciones { get; set; }
        
    }
}