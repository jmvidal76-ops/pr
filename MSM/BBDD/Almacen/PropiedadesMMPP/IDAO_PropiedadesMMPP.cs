using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Almacen;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.PropiedadesMMPP
{
    public interface IDAO_PropiedadesMMPP
    {
        Task<List<DTO_PropiedadesMMPP>> ObtenerPropiedadesMMPPConPropiedades();
        Task<List<DTO_PropiedadesMMPP>> ObtenerPropiedadesMMPPSoloConPropiedadInicial();
        Task<List<DTO_PropiedadesMMPP>> ObtenerPropiedadesMMPPSinPropiedades();
        Task<List<DTO_PropiedadesMMPP>> ObtenerMMPPTiposValoresPorEANIdMaterial(string codigoEAN, string codigoMaterial);
        Task<List<DTO_ClaveValor>> ObtenerPropiedadesMMPPTipos();
        Task<List<DTO_ClaveValor>> ObtenerPropiedadesMMPPValoresPorTipo(int idTipoPropiedad);
        Task<bool> CrearPropiedadMMPP(List<DTO_PropiedadesMMPP> datos);
        Task<bool> EditarPropiedadMMPP(DTO_PropiedadesMMPP datos);
        Task<bool> EliminarPropiedadMMPP(int idPropiedad);
        Task<bool> FijarSinPropiedades(List<DTO_PropiedadesMMPP> datos);
    }
}