//using ApplicationCore.DTOs;
using Common.Models;
using Common.Models.Almacen;
using Common.Models.Almacen.ControlStock;
using Common.Models.Almacen.DTO_MaestroEAN;
using Common.Models.Almacen.Proveedor;
using Common.Models.Material;
using Common.Models.Operation;
using Common.Models.Ubicaciones;
using MSM.BBDD.Almacen.CodigoJDE;
using MSM.BBDD.Almacen.ControlStock;
using MSM.BBDD.Almacen.Proveedor;
using MSM.BBDD.Trazabilidad;
using MSM.BBDD.Trazabilidad.Operations;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.Models.Trazabilidad;
using MSM.Security;
using Newtonsoft.Json;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Script.Serialization;

namespace MSM.Controllers.Almacen
{
    [Authorize]
    public class CodigoJDEController : ApiController
    {
        private readonly IDAO_CodigoJDE _IDAO_CodigoJDE;
        private readonly IDAO_Proveedor _IDAO_Proveedor;

        public CodigoJDEController(IDAO_CodigoJDE IDAO_CodigoJDE, IDAO_Proveedor IDAO_Proveedor)
        {
            _IDAO_CodigoJDE = IDAO_CodigoJDE;
            _IDAO_Proveedor = IDAO_Proveedor;
        }


        [Route("api/GetMateriasPrimas")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_2_VisualizacionCodigoJDE,Funciones.ALM_PROD_DAT_1_GestionCodigoJDE)]
        public async Task<List<DTO_MaestroEAN>> ObtenerMateriasPrimas()
        {
            List<DTO_MaestroEAN> _result = new List<DTO_MaestroEAN>();
            List<DTO_MaestroEAN> listMaterial = await _IDAO_CodigoJDE.Get();

            if (listMaterial.Count > 0)
            {
                _result = listMaterial;
            }
            return _result;
        }

        [Route("api/CreateMateriasPrimas")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCodigoJDE)]
        public async Task<DTO_MaestroEAN> CreateMateriasPrimas(DTO_MaestroEAN dto)
        {
            DTO_MaestroEAN listMaterial = await _IDAO_CodigoJDE.Post(dto);

            return dto;
        }

        [Route("api/UpdateMateriasPrimas")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCodigoJDE)]
        public async Task<DTO_MaestroEAN> PutMateriasPrimas(DTO_MaestroEAN dto)
        {
            DTO_MaestroEAN listMaterial = await _IDAO_CodigoJDE.Put(dto);
            return listMaterial;
        }

        [Route("api/DeleteMateriasPrimas")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCodigoJDE)]
        public async Task<bool> DeleteMateriasPrimas(DTO_MaestroEAN dto)
        {

            await _IDAO_CodigoJDE.Delete(dto);
            return true;
        }

        private async Task<DTO_MaestroEAN> DTOMaestroEAN(DTO_MaestroEAN dto)
        {
                ProveedorEANDto _proveedor = new ProveedorEANDto()
                {
                    Nombre = dto.Proveedor.Trim()
                };
                ProveedorEANDto _proveedorCreated = await _IDAO_Proveedor.Post(_proveedor);
                dto.IdProveedor = _proveedorCreated.IdProveedor;
            
            //dto.ID_JDE = dto.NOMBRE.Trim();
            dto.Tipo = "Manual";
            return dto;
        }

        [Route("api/CreateMultiplesMateriasPrimas")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCodigoJDE)]
        public async Task<dynamic> CreateMultiplesMateriasPrimas(IEnumerable<DTO_MaestroEAN> dto)
        {
            var resultPost = await _IDAO_CodigoJDE.CreateMultiple(dto);

            return resultPost;
        }
    }
}