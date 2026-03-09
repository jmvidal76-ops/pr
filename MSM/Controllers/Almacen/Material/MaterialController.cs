using Common.Models.Material;
using MSM.BBDD.Trazabilidad.Material;
using MSM.Models.Trazabilidad;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.Material
{
    public enum TipoOrigenEnum
    {
        Material
    }

    [Authorize]
    public class MaterialController : ApiController
    {
        private readonly IDAO_Material _iDAO_Material;

         public MaterialController(IDAO_Material iDAO_Material)
                    {
                        _iDAO_Material = iDAO_Material;
                    }

         /// <summary>
         /// Metodo que obtiene la lista de los Materiales
         /// </summary>
         /// <returns></returns>
         [Route("api/GetMaterial")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_3_GestionControlStock, 
                       Funciones.ALM_PROD_DAT_3_VisualizacionControlStock, Funciones.ALM_PROD_DAT_2_VisualizacionCodigoJDE, 
                       Funciones.ALM_PROD_DAT_1_GestionCodigoJDE, Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
                       Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_STK_1_GestionAvisosStockMMPPFabricacion, 
                       Funciones.FAB_PROD_STK_1_VisualizacionAvisosStockMMPPFabricacion, Funciones.ALM_PROD_DAT_9_GestionAvisosStockMMPPFabricacion, 
                       Funciones.ALM_PROD_DAT_9_VisualizacionAvisosStockMMPPFabricacion, Funciones.CDG_FAB_COE_1_VisualizacionCoeficientesCorreccion,
                       Funciones.FAB_PROD_RES_13_VisualizacionParametrosFabricacion, Funciones.FAB_PROD_RES_13_GestionParametrosFabricacion,
                       Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
         public async Task<List<MaterialDto>> GetMaterial()
         {
             List<MaterialDto> _result = new List<MaterialDto>();
             List<MaterialDto> listMaterial = await _iDAO_Material.Get();

             if (listMaterial.Count > 0)
             {

                 _result = listMaterial;
             }

             return _result;
         }

         /// <summary>
         /// Metodo que obtiene la lista de los Materiales
         /// </summary>
         /// <returns></returns>
         [Route("api/GetMaterial/{tipo}/{clase}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_3_VisualizacionControlStock, 
            Funciones.FAB_PROD_EXE_10_GestionLoteSemielaborado, Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
         public async Task<List<MaterialDto>> GetMaterial(string tipo, string clase)
         {
             List<MaterialDto> _result = new List<MaterialDto>();
             List<MaterialDto> listMaterial = await _iDAO_Material.Get(tipo,clase);

             if (listMaterial.Count > 0)
             {

                 _result = listMaterial;
             }

             return _result;
         }

         /// <summary>
         /// Metodo que obtiene la lista de los Materiales
         /// </summary>
         /// <returns></returns>
         [Route("api/GetTipoMaterial")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_3_GestionControlStock, 
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStock, Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
         public async Task<List<TipoMaterialDto>> GetTipoMaterial()
         {
             List<TipoMaterialDto> _result = new List<TipoMaterialDto>();
             List<TipoMaterialDto> listMaterial = await _iDAO_Material.GetTipoMaterial();

             if (listMaterial.Count > 0)
             {

                 _result = listMaterial;
             }

             return _result;
         }

         [Route("api/GetTipoMaterialPorReferencia/{idMaterial}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_3_GestionControlStock, 
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStock, Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
         public async Task<List<TipoMaterialDto>> GetTipoMaterial(string idMaterial)
         {
             List<TipoMaterialDto> _result = new List<TipoMaterialDto>();
             List<TipoMaterialDto> listMaterial = await _iDAO_Material.GetTipoMaterialPorReferencia(idMaterial);

             if (listMaterial.Count > 0)
             {

                 _result = listMaterial;
             }

             return _result;
         }


         /// <summary>
         /// Metodo que obtiene la lista de los Materiales
         /// </summary>
         /// <returns></returns>
         [Route("api/GetClaseMaterial")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_3_GestionControlStock, 
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStock, Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
         public async Task<List<ClaseMaterialDto>> GetClaseMaterial()
         {
             List<ClaseMaterialDto> _result = new List<ClaseMaterialDto>();
             List<ClaseMaterialDto> listMaterial = await _iDAO_Material.GetClaseMaterial();

             if (listMaterial.Count > 0)
             {

                 _result = listMaterial;
             }

             return _result;
         }

         /// <summary>
         /// Metodo que obtiene la lista de los Materiales
         /// </summary>
         /// <returns></returns>
         [Route("api/GetClaseMaterialPorReferencia/{idMaterial}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_3_GestionControlStock, 
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStock, Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
         public async Task<List<ClaseMaterialDto>> GetClaseMaterialPorReferencia(string idMaterial)
         {
             List<ClaseMaterialDto> _result = new List<ClaseMaterialDto>();
             List<ClaseMaterialDto> listMaterial = await _iDAO_Material.GetClaseMaterialPorReferencia(idMaterial);

             if (listMaterial.Count > 0)
             {

                 _result = listMaterial;
             }

             return _result;
         }

         /// <summary>
         /// Metodo que obtiene la lista de los Materiales
         /// </summary>
         /// <returns></returns>
         [Route("api/GetClaseMaterial/{tipo}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_3_GestionControlStock, 
            Funciones.ALM_PROD_DAT_3_VisualizacionControlStock, Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
         public async Task<List<ClaseMaterialDto>> GetClaseMaterial(string tipo)
         {
             List<ClaseMaterialDto> _result = new List<ClaseMaterialDto>();
             List<ClaseMaterialDto> listMaterial = await _iDAO_Material.GetClaseMaterial(tipo);

             if (listMaterial.Count > 0)
             {

                 _result = listMaterial;
             }

             return _result;
         }

         /// <summary>
         /// Metodo que obtiene la lista de los Materiales por Id
         /// </summary>
         /// <returns></returns>
         [Route("api/GetUnidadMedida/{idMaterial}")]
         [HttpGet]
         public async Task<List<MaterialUnitsDto>> GetUnidadMedidaPorIdMaterial(string idMaterial)
         {
             List<MaterialUnitsDto> _result = new List<MaterialUnitsDto>();
             if (idMaterial != null)
             {
                 List<MaterialUnitsDto> listMaterial = await _iDAO_Material.GetUnitsById(idMaterial);

                 if (listMaterial.Count > 0)
                 {

                     _result = listMaterial;
                 }

             }
             return _result;
         }

        /// <summary>
        /// Metodo que obtiene la lista de los Materiales
        /// </summary>
        /// <returns></returns>
        [Route("api/GetUnidadMedida")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_5_GestionLotesSinCodigoJDE,Funciones.ALM_PROD_DAT_5_GestionJDERecepcion,
            Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, 
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP, Funciones.CDG_FAB_COE_1_VisualizacionCoeficientesCorreccion,
            Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<List<MaterialUnitsDto>> GetUnidadMedida()
        {
             List<MaterialUnitsDto> _result = await _iDAO_Material.GetUnits();
            var list = _result
                        .GroupBy(o=> o.SourceUoMID)
                        .Select(t => t.FirstOrDefault())
                        .ToList();
            return list;
        }

        /// <summary>
        /// Metodo que obtiene las propiedades extendidas de un material segun su id
        /// </summary>
        /// <returns></returns>
        [Route("api/GetPropiedadesExtendidas/{idMaterial}/{lote}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<PropiedadesExtendidasDto>> GetPropiedadesExtendias(string idMaterial,string lote = null)
         {
             List<PropiedadesExtendidasDto> listPropiedadesExtendidas = new List<PropiedadesExtendidasDto>();
             if (idMaterial != null)
             {
                 List<PropiedadesExtendidasDto> _propiedadesExtendidas = await _iDAO_Material.GetExtendedPropertiesByIdMaterialAndLote(idMaterial,lote);
                 if (_propiedadesExtendidas != null)
                 {
                     listPropiedadesExtendidas = _propiedadesExtendidas;
                 }
             }
             return listPropiedadesExtendidas;
         }


        [Route("api/MaterialPerteneceAlaOrden/{IdLinea}/{IdZona}/{idMaterial}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_GestionUbicaciones)]
        public async Task<bool> MaterialPerteneceAlaOrden(string IdLinea, string IdZona, string IdMaterial)
        {
            var ret = await _iDAO_Material.GetMaterialConsumByCode(IdLinea, IdZona, IdMaterial);

            return ret;
        }
    }
}