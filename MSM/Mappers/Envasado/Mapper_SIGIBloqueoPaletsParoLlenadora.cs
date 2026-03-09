using MSM.BBDD.Model;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.Envasado
{
    public class Mapper_SIGIBloqueoPaletsParoLlenadora
    {
        public static DTO_SIGIBloqueoPaletsParoLlenadora MapperModelToDTO(SIGI_BloqueoPaletsParoLlenadora origen)
        {
            var dto = new DTO_SIGIBloqueoPaletsParoLlenadora()
            {
                IdBloqueo = origen.IdBloqueo,
                IdLinea = origen.IdLinea,
                Habilitado = origen.Habilitado,
                DuracionParoMinutos = origen.DuracionParoMinutos,
                NumPalets = origen.NumPalets,
                DuracionLlenadoraEtiquetadoraMinutos = origen.DuracionLlenadoraEtiquetadoraMinutos,
                IdUltimoParo = origen.IdUltimoParo
            };

            return dto;
        }
    }
}