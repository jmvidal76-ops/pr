using Common.Models.Transportes;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public interface IDAO_Proveedor
    {
        Task<List<ProveedorDto>> Get();

        Task<List<ProveedorDto>> GetMaestroProveedores();

        Task<int> Delete(int id);

        Task<ProveedorDto> Post(ProveedorDto proveedor);

        Task<ProveedorDto> Put(ProveedorDto proveedor);

        Task<List<ProveedorDto>> GetMaestroProveedoresLoteMMPP();
    }
}
