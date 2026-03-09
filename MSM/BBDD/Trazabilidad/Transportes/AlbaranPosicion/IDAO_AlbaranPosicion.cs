using Common.Models.AlbaranPosicion;
using Common.Models.Material;
using Common.Models.Operation;
using Common.Models.Transporte;
using Common.Models.Transportes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.AlbaranPosicion
{
    public interface IDAO_AlbaranPosicion
    {

        Task<List<AlbaranDto>> GetAlbaranPosicionByIdTransporte(int idTransporte, int tipo);

        Task<List<OperationDto>> GetAllAlbaranPosicion(string idMaterial);

        Task<int> DeleteAlbaranPosicion(int? idAlbaranPosicion);

        Task<List<MaterialDto>> GetMaterials();

        Task<List<MaterialUnitsDto>> GetMaterialsUnits(string idMaterial);

        Task<List<object>> GetSuplyOrders(string refMaterial);

        Task<AlbaranDto> PostAlbaranPosicion(AlbaranDto albaranPosicion);

        Task<int> DeleteAllAlbaranPosicionLote(int idAlbaranPosicion);

        Task<AlbaranPosicionLoteDto> PostAlbaranPosicionLote(AlbaranPosicionLoteDto albaranPosicion);

        Task<AlbaranDto> Put(AlbaranDto albaran);

        Task<List<AlbaranPosicionCalidadDto>> GetFormsByIdAlbaranPosicion(int idAlbaranPosicion);

        Task<string> GetAlbaranPosicionByPDV(int idAlbaran, string idMaterial);

        Task<List<AlbaranPosicionDto>> GetAlbaranPosicionLoteByFilters(string name, string filter);

        Task<List<AlbaranPosicionDto>> GetAlbaranPosicionLoteNoConsumido();

        Task<List<AlbaranPosicionDto>> GetAlbaranPosicionLotesConsumidos();

        Task<List<ParametrosAlbaranDto>> GetParametrosAlbaran();
    }
}
