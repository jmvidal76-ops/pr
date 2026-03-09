using MSM.Mappers.DTO.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api.Materiales;
using System;
using System.Collections;
using System.Collections.Generic;
using MSM.Mappers.DTO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Fabricacion
{
    public interface IDAO_Material
    {
        Task<List<DTO_Materiales>> ObtenerCervezasTipoSemielaborado();
        Task<DTO_RespuestaAPI<bool>> ActualizarMaterialWOPrellenado(dynamic datos);
        Task<List<DTO_Materiales>> ObtenerMostosCoccionTipoSemielaborado();
        Task<List<DTO_Materiales>> ObtenerMostosTipoSemielaborado();
        Task<bool> ActualizarMaterialTipoMosto(dynamic datos);
        Task<List<DTO_Materiales>> ObtenerMaterialesMMPPSemielaborados();
        Task<List<DTO_RelacionMostosCervezas>> ObtenerRelacionMostosCervezas();
        Task<bool> ActualizarRelacionMostosCervezas(dynamic datos);
        Task<List<DTO_Materiales>> ObtenerCervezasAEnvasar();
    }
}