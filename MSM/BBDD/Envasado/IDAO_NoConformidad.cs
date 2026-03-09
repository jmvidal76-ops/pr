using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_NoConformidad
    {
        Task<List<DTO_NoConformidad>> ObtenerNoConformidades(DateTime fechaDesde, DateTime fechaHasta);
    }
}