using Common.Models.Material;
using Common.Models.Operation;
using Common.Models.Transportes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Material
{
    public interface IDAO_Material
    {

        Task<List<MaterialDto>> Get();

        Task<List<MaterialDto>> Get(string tipo, string clase);

        Task<List<TipoMaterialDto>> GetTipoMaterial();

        Task<List<TipoMaterialDto>> GetTipoMaterialPorReferencia(string idMaterial);

        Task<List<ClaseMaterialDto>> GetClaseMaterial();

        Task<List<ClaseMaterialDto>> GetClaseMaterialPorReferencia(string IdMaterial);

        Task<List<ClaseMaterialDto>> GetClaseMaterial(string tipo);

        Task<List<MaterialUnitsDto>> GetUnitsById(string idMaterial);

        Task<List<MaterialUnitsDto>> GetUnits();

        Task<List<PropiedadesExtendidasDto>> GetExtendedPropertiesByIdMaterialAndLote(string idMaterial, string lote);

        Task<bool> GetMaterialConsumByCode(string IdLinea, string IdZona, string IdMaterial);
    }

}

