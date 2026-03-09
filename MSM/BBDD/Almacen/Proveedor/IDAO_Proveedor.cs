using Common.Models.Almacen.DTO_MaestroEAN;
using Common.Models.Almacen.Proveedor;
using Common.Models.Operation;
using MSM.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.Proveedor
{
    public interface IDAO_Proveedor
    {
        Task<List<ProveedorEANDto>> Get();

        Task<ProveedorEANDto> Post(ProveedorEANDto dto);

        Task<ProveedorEANDto> Put(ProveedorEANDto dto);
    }
}
