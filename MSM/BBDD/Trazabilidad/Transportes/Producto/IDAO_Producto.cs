using Common.Models.Transportes;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public interface IDAO_Producto
    {
        Task<List<ProductoDto>> Get();
        Task<List<ProductoDto>> GetPorOperacion(int operacion);

        Task<int> Delete(int id);

        Task<ProductoDto> Post(ProductoDto producto, int? operacion = null);

        Task<ProductoDto> Put(ProductoDto producto);
    }
}
