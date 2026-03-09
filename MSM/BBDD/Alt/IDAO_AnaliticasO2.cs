using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Alt;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Alt
{
    public interface IDAO_AnaliticasO2
    {
        List<O2_Llenadoras> ObtenerAnaliticasO2(DateTime fechaInicio, DateTime fechaFin);
        List<TiposUnidades> ObtenerUnidadesAnalitica();
        string GuardarAnaliticaO2(O2_Llenadoras datos);
        int GuardarAnaliticasO2Importar(dynamic datos);
        bool EliminarAnaliticaO2(O2_Llenadoras datos);
        List<O2_Llenadoras> ObtenerAnaliticasO2Terminal(string linea);
        List<O2_Llenadoras_Tolerancias> ObtenerToleranciasO2();
        bool EditarToleranciasO2(O2_Llenadoras_Tolerancias tolerancia);
        bool EditarPresion(dynamic datos);
        Task<decimal> ObtenerTPO_O2Llenadoras(string linea, DateTime desde, DateTime hasta);
        Task<DTO_RespuestaAPI<List<DTO_VariacionGasesArranquesEnvasado>>> ObtenerVariacionGasesArranquesEnvasado(DateTime fechaInicio, DateTime fechaFin);
    }
}